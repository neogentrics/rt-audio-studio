'use strict';
// Waveform summaries: the same answer from every level, and from the cache on disk.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Disk } = require('../src/core/disk');
const { PeakBuilder } = require('../src/core/peaks');

function build(samples, channels, piece = 1000) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtas-peaks-'));
  const disk = new Disk();
  const out = disk.open(path.join(dir, 'take.peaks'), { create: true });
  const b = new PeakBuilder({ channels, out });
  for (let at = 0; at < samples.length; at += piece * channels) b.add(samples.subarray(at, at + piece * channels));
  return b.finish(out);
}

/** The true low and high of a stretch, worked out the slow way. */
function truth(samples, channels, start, end) {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = start * channels; i < end * channels; i++) { lo = Math.min(lo, samples[i]); hi = Math.max(hi, samples[i]); }
  return [lo, hi];
}

test('every column holds the real low and high of its stretch, or a little more around its edges', () => {
  const frames = 256 * 4 ** 5 + 777;
  const s = new Float32Array(frames);
  let seed = 3;
  for (let i = 0; i < frames; i++) { seed = (seed * 1103515245 + 12345) % 2147483648; s[i] = (seed / 2147483648 - 0.5) * Math.sin(i / 5000); }
  const peaks = build(s, 1);
  assert.strictEqual(peaks.frames, frames);
  for (const columns of [10, 300, 1000, 4000]) {
    const v = peaks.view(0, frames, columns);
    const per = frames / columns;
    for (const c of [0, 1, Math.floor(columns / 2), columns - 1]) {
      const [lo, hi] = truth(s, 1, Math.floor(c * per), Math.floor((c + 1) * per));
      // A column can only be wider than its stretch, never narrower: no peak is ever hidden.
      assert.ok(v[c * 2] <= lo + 1e-7 && v[c * 2 + 1] >= hi - 1e-7, `columns=${columns} c=${c}`);
    }
  }
  const whole = peaks.view(0, frames, 1);
  const [lo, hi] = truth(s, 1, 0, frames);
  assert.ok(Math.abs(whole[0] - lo) < 1e-7 && Math.abs(whole[1] - hi) < 1e-7);
});

test('stereo: a column covers both channels', () => {
  const frames = 256 * 64;
  const s = new Float32Array(frames * 2);
  s[2 * 5000] = -0.9;
  s[2 * 9000 + 1] = 0.8;
  const v = build(s, 2).view(0, frames, 1);
  assert.deepStrictEqual([v[0], Math.round(v[1] * 10) / 10], [Math.fround(-0.9), 0.8]);
});
