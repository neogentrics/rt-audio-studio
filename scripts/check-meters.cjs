'use strict';
// Step zero: our meters against a second tool, FFmpeg's ebur128 and astats filters, on the same files.
// FFmpeg is a test tool on the dev machine only. It's never part of the app.
//
//   node scripts/check-meters.cjs            writes a few test files, measures them both ways, prints a table
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Disk } = require('../src/core/disk');
const { TakeWriter } = require('../src/core/take-writer');
const m = require('../src/core/meters');

const RATE = 44100;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtas-meters-'));

/** Speech-like test sound: tone bursts with gaps of low noise, so every meter has something to find. */
function speechLike(seconds, levelDb, noiseDb, seed = 1) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 - 0.5; };
  const out = new Float32Array(Math.round(seconds * RATE));
  const a = 10 ** (levelDb / 20);
  const n = 10 ** (noiseDb / 20) * 3.46;   // uniform noise of this RMS
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const on = (t % 3) < 2.2;
    const f = 140 + 60 * Math.sin(t * 1.3);
    out[i] = (on ? a * (0.6 * Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * 3 * f * t) + 0.1 * Math.sin(2 * Math.PI * 7 * f * t)) : 0) + n * rnd();
  }
  return out;
}

const cases = [
  ['speech-like, ACX range', speechLike(60, -14, -65)],
  ['speech-like, quiet', speechLike(60, -26, -75)],
  ['speech-like, noisy room', speechLike(60, -16, -48)],
];

function ffmpegNumbers(file) {
  // FFmpeg writes its measurements to stderr.
  const log = String(spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true,astats', '-f', 'null', '-'], { encoding: 'utf8' }).stderr);
  const grab = (re) => { const all = [...log.matchAll(re)]; return all.length ? Number(all[all.length - 1][1]) : NaN; };
  return {
    loudness: grab(/I:\s+(-?[\d.]+) LUFS/g),
    truePeak: grab(/Peak:\s+(-?[\d.]+) dBFS/g),
    peak: grab(/Peak level dB:\s+(-?[\d.]+)/g),
    rms: grab(/RMS level dB:\s+(-?[\d.]+)/g),
  };
}

const rows = [];
for (const [name, sound] of cases) {
  const w = new TakeWriter({ disk: new Disk(), dir, name: name.replace(/\W+/g, '-'), sampleRate: RATE, channels: 1 });
  w.write(sound);
  const { parts } = w.close();
  const ours = { loudness: m.loudness([sound], RATE), truePeak: m.truePeak([sound]), peak: m.peak([sound]), rms: m.rms([sound]), noiseFloor: m.noiseFloor([sound], RATE) };
  const theirs = ffmpegNumbers(parts[0]);
  rows.push({ name, ours, theirs });
}

const f = (v) => (Number.isFinite(v) ? v.toFixed(2).padStart(7) : '    n/a');
console.log('| File | Loudness ours / FFmpeg | True peak ours / FFmpeg | Peak ours / FFmpeg | RMS ours / FFmpeg | Noise floor ours |');
console.log('|---|---|---|---|---|---|');
let worst = 0;
for (const { name, ours, theirs } of rows) {
  for (const k of ['loudness', 'truePeak', 'peak', 'rms']) if (Number.isFinite(theirs[k])) worst = Math.max(worst, Math.abs(ours[k] - theirs[k]));
  console.log(`| ${name} | ${f(ours.loudness)} / ${f(theirs.loudness)} | ${f(ours.truePeak)} / ${f(theirs.truePeak)} | ${f(ours.peak)} / ${f(theirs.peak)} | ${f(ours.rms)} / ${f(theirs.rms)} | ${f(ours.noiseFloor)} |`);
}
console.log(`\nLargest difference: ${worst.toFixed(2)} dB`);
fs.rmSync(dir, { recursive: true, force: true });
