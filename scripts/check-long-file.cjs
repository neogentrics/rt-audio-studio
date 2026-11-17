'use strict';
// Step zero: a ten-hour recording. Records it through the real take writer, builds its waveform summary from the
// files on disk, then times drawing any stretch at any zoom, and watches memory the whole way.
//   node scripts/check-long-file.cjs [hours] [folder]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Disk } = require('../src/core/disk');
const { TakeWriter } = require('../src/core/take-writer');
const { PeakBuilder } = require('../src/core/peaks');
const wav = require('../src/core/wav');

const HOURS = Number(process.argv[2] || 10);
const RATE = 48000;
const dir = fs.mkdtempSync(path.join(process.argv[3] || os.tmpdir(), 'rtas-long-'));
const disk = new Disk();
const mb = (n) => Math.round(n / 1048576);
// The loops below never yield, so a timer would never run: memory is sampled inside them instead.
let maxRss = 0;
const sample = () => { maxRss = Math.max(maxRss, process.memoryUsage().rss); };
const t0 = Date.now();

// 1. Record: one second at a time, as a microphone would deliver it.
const w = new TakeWriter({ disk, dir, name: 'long', sampleRate: RATE, channels: 1 });
const second = new Float32Array(RATE);
let n = 0;
for (let s = 0; s < HOURS * 3600; s++) {
  for (let i = 0; i < RATE; i++, n++) second[i] = 0.3 * Math.sin((2 * Math.PI * 180 * n) / RATE) * (((n / RATE) % 7) < 5 ? 1 : 0.01);
  w.write(second);
  if (s % 60 === 0) sample();
}
const take = w.close();
const recordSeconds = (Date.now() - t0) / 1000;
const rssAfterRecord = process.memoryUsage().rss;

// 2. Build the waveform summary from the files on disk, a megabyte at a time.
const t1 = Date.now();
const out = disk.open(path.join(dir, 'long.peaks'), { create: true });
const b = new PeakBuilder({ channels: 1, out });
for (const part of take.parts) {
  const h = disk.open(part);
  const info = wav.parse(h.readAt(0, wav.HEADER));
  const end = wav.HEADER + info.frames * info.block;
  for (let at = wav.HEADER; at < end; at += 1 << 20) {
    const buf = h.readAt(at, Math.min(1 << 20, end - at));
    b.add(new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
    sample();
  }
  h.close();
}
const peaks = b.finish(out);
const buildSeconds = (Date.now() - t1) / 1000;

// 3. Draw: 200 random stretches at each zoom, on a 1600-pixel-wide waveform.
const zooms = [['the whole take', peaks.frames], ['an hour', RATE * 3600], ['a minute', RATE * 60], ['a second', RATE]];
const timings = zooms.map(([name, len]) => {
  const times = [];
  for (let k = 0; k < 200; k++) {
    const start = Math.floor(Math.random() * Math.max(1, peaks.frames - len));
    const t = process.hrtime.bigint();
    peaks.view(start, start + len, 1600);
    times.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  times.sort((a, c) => a - c);
  return `${name}: median ${times[100].toFixed(2)} ms, slowest ${times[199].toFixed(2)} ms`;
});
sample();
maxRss = Math.max(maxRss, process.memoryUsage().rss);
const bytes = take.parts.reduce((s, p) => s + fs.statSync(p).size, 0);

console.log(`Recorded ${HOURS} h at ${RATE} Hz mono into ${take.parts.length} parts, ${(bytes / 1e9).toFixed(1)} GB, in ${recordSeconds.toFixed(0)} s (${((HOURS * 3600) / recordSeconds).toFixed(0)}x real time)`);
console.log(`Frames kept: ${take.frames} of ${HOURS * 3600 * RATE}${take.stopped ? `, stopped: ${take.stopped.message}` : ''}`);
console.log(`Waveform summary built in ${buildSeconds.toFixed(0)} s. Cache file ${mb(fs.statSync(path.join(dir, 'long.peaks')).size)} MB, in memory ${mb(peaks.levels.reduce((s, l) => s + l.byteLength, 0))} MB`);
console.log(`Memory: ${mb(rssAfterRecord)} MB after recording, ${mb(maxRss)} MB at most`);
for (const line of timings) console.log(`Drawing ${line}`);
fs.rmSync(dir, { recursive: true, force: true });
