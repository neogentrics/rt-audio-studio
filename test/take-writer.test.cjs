'use strict';
// A take can't be lost: written as it comes, split at the hour, repaired after a crash, kept when the disk fills.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { Disk } = require('../src/core/disk');
const { TakeWriter } = require('../src/core/take-writer');
const wav = require('../src/core/wav');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'rtas-'));

function tone(frames, channels, rate = 48000) {
  const out = new Float32Array(frames * channels);
  for (let i = 0; i < frames; i++) for (let c = 0; c < channels; c++) out[i * channels + c] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / rate + c);
  return out;
}

test('a take reads back exactly as it was written', () => {
  const dir = tmp();
  const disk = new Disk();
  const w = new TakeWriter({ disk, dir, name: 'take', sampleRate: 48000, channels: 2 });
  const sound = tone(48000 * 3 + 123, 2);
  for (let at = 0; at < sound.length; at += 960) w.write(sound.subarray(at, Math.min(sound.length, at + 960)));
  const r = w.close();
  assert.strictEqual(r.frames, 48000 * 3 + 123);
  assert.strictEqual(r.parts.length, 1);
  const back = wav.readSamples(disk, r.parts[0]);
  assert.strictEqual(back.sampleRate, 48000);
  assert.strictEqual(back.channels, 2);
  assert.deepStrictEqual(Buffer.from(back.samples.buffer), Buffer.from(sound.buffer));
});

test('a take is split into parts, with nothing lost or doubled at the joins', () => {
  const dir = tmp();
  const disk = new Disk();
  const w = new TakeWriter({ disk, dir, name: 'long', sampleRate: 8000, channels: 1, partSeconds: 1 });
  const sound = tone(8000 * 3 + 500, 1, 8000);
  for (let at = 0; at < sound.length; at += 700) w.write(sound.subarray(at, Math.min(sound.length, at + 700)));
  const r = w.close();
  assert.deepStrictEqual(r.parts.map((p) => path.basename(p)), ['long-001.wav', 'long-002.wav', 'long-003.wav', 'long-004.wav']);
  const joined = Float32Array.from(r.parts.flatMap((p) => Array.from(wav.readSamples(disk, p).samples)));
  assert.deepStrictEqual(Buffer.from(joined.buffer), Buffer.from(sound.buffer));
});

test('a take is never written over', () => {
  const dir = tmp();
  const disk = new Disk();
  new TakeWriter({ disk, dir, name: 'once', sampleRate: 48000, channels: 1 }).write(tone(48000, 1));
  const again = new TakeWriter({ disk, dir, name: 'once', sampleRate: 48000, channels: 1 });
  assert.throws(() => { again.write(tone(48000, 1)); if (again.stopped) throw new Error(again.stopped.message); });
});

test('a crash mid-frame is repaired: sizes from the real length, the cut frame dropped', () => {
  const dir = tmp();
  const disk = new Disk();
  const w = new TakeWriter({ disk, dir, name: 'crash', sampleRate: 48000, channels: 2 });
  w.write(tone(48000 * 2, 2));
  const file = w.parts[0];
  // The app dies: more sound reached the file, but the header was never corrected, and the last frame is cut short.
  fs.appendFileSync(file, Buffer.alloc(8 * 1000 + 5, 1));
  const r = wav.repair(disk, file);
  assert.strictEqual(r.frames, 48000 * 2 + 1000);
  assert.strictEqual(fs.statSync(file).size, wav.HEADER + r.frames * 8);
  assert.strictEqual(wav.parse(fs.readFileSync(file)).frames, r.frames);
});

test('a full disk stops the take cleanly and keeps everything written', () => {
  const dir = tmp();
  let budget = 48000 * 4 * 2;     // room for two seconds of mono after the header
  const full = Object.assign(Object.create(fs), {
    writeSync(fd, buf, off, len, pos) {
      if (pos >= wav.HEADER && len > 4) {
        if (budget <= 0) throw Object.assign(new Error('no space'), { code: 'ENOSPC' });
        const n = Math.min(len, budget);
        budget -= n;
        return fs.writeSync(fd, buf, off, n, pos);
      }
      return fs.writeSync(fd, buf, off, len, pos);
    },
  });
  const disk = new Disk({ fs: full });
  const w = new TakeWriter({ disk, dir, name: 'full', sampleRate: 48000, channels: 1 });
  let ok = true;
  for (let s = 0; s < 5 && ok; s++) ok = w.write(tone(48000, 1));
  assert.strictEqual(ok, false);
  assert.strictEqual(w.stopped.reason, 'disk-full');
  const r = w.close();
  assert.strictEqual(r.frames, 48000 * 2);
  assert.strictEqual(wav.readSamples(new Disk(), r.parts[0]).frames, 48000 * 2);
});

test('the app killed while recording loses at most the last flush', async () => {
  const dir = tmp();
  const child = spawn(process.execPath, [path.join(__dirname, 'fixtures', 'record-forever.cjs'), dir], { stdio: ['ignore', 'pipe', 'inherit'] });
  let written = 0;
  let text = '';
  await new Promise((resolve) => {
    child.stdout.on('data', (d) => {
      text += String(d);
      const lines = text.split('\n');
      text = lines.pop();
      for (const line of lines) if (/^\d+$/.test(line)) written = Number(line);
      if (written >= 48000 * 3 && !child.killed) { child.kill('SIGKILL'); resolve(); }
    });
  });
  await new Promise((resolve) => child.on('exit', resolve));
  const file = path.join(dir, 'killed-001.wav');
  const r = wav.repair(new Disk(), file);
  // The child reports frames once they're flushed, so everything it reported must be there.
  assert.ok(r.frames >= written, `kept ${r.frames} of ${written}`);
  const back = wav.readSamples(new Disk(), file).samples;
  const expected = tone(r.frames, 1);
  assert.deepStrictEqual(Buffer.from(back.buffer), Buffer.from(expected.buffer));
});
