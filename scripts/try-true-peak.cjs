'use strict';
// Step zero, one-off: how the true-peak filter's size changes the reading, against FFmpeg's.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Disk } = require('../src/core/disk');
const { TakeWriter } = require('../src/core/take-writer');
const m = require('../src/core/meters');

const RATE = 44100;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtas-tp-'));
let s = 7;
const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 - 0.5; };
// Sharp, bright material is where true peak matters: clicks, sibilants, clipped edges.
const sound = new Float32Array(RATE * 20);
for (let i = 0; i < sound.length; i++) {
  const t = i / RATE;
  sound[i] = 0.3 * Math.sin(2 * Math.PI * 180 * t) + 0.2 * Math.sin(2 * Math.PI * 5300 * t) + 0.15 * Math.sin(2 * Math.PI * 9100 * t + 1) + 0.25 * rnd() * ((t % 1) < 0.1 ? 1 : 0.1);
}
const w = new TakeWriter({ disk: new Disk(), dir, name: 'bright', sampleRate: RATE, channels: 1 });
w.write(sound);
const file = w.close().parts[0];
const log = String(spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr);
const ff = [...log.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop()?.[1];
console.log(`FFmpeg ${ff}  sample peak ${m.peak([sound]).toFixed(2)}`);
for (const [factor, perPhase] of [[4, 12], [4, 24], [4, 48], [8, 24], [8, 48], [16, 48]]) {
  const t = Date.now();
  const v = m.truePeak([sound], { factor, perPhase });
  console.log(`${factor}x, ${perPhase} taps a phase: ${v.toFixed(3)} dBTP  (${Date.now() - t} ms for 20 s)`);
}
fs.rmSync(dir, { recursive: true, force: true });
