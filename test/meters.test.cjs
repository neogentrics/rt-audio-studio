'use strict';
// The meters, against BS.1770's published filter and EBU Tech 3341's test signals, built here from their descriptions.
const test = require('node:test');
const assert = require('node:assert');
const m = require('../src/core/meters');

const RATE = 48000;
const amp = (db) => 10 ** (db / 20);

/** One channel of a sine: `parts` is a list of [seconds, dBFS]. */
function sine(parts, { freq = 1000, rate = RATE, phase = 0 } = {}) {
  const total = parts.reduce((n, [s]) => n + Math.round(s * rate), 0);
  const out = new Float32Array(total);
  let i = 0;
  for (const [s, db] of parts) {
    const a = amp(db);
    for (const end = i + Math.round(s * rate); i < end; i++) out[i] = a * Math.sin((2 * Math.PI * freq * i) / rate + phase);
  }
  return out;
}

const near = (actual, expected, tol, what) => assert.ok(Math.abs(actual - expected) <= tol, `${what}: ${actual.toFixed(3)} is not within ${tol} of ${expected}`);

test('K-weighting at 48 kHz matches the coefficients in BS.1770', () => {
  const [shelf, hp] = m.kWeighting(48000);
  const want = {
    shelfB: [1.53512485958697, -2.69169618940638, 1.19839281085285],
    shelfA: [1, -1.69065929318241, 0.73248077421585],
    hpB: [1, -2, 1],
    hpA: [1, -1.99004745483398, 0.99007225036621],
  };
  const check = (got, exp, name) => exp.forEach((v, i) => near(got[i], v, 1e-6, `${name}[${i}]`));
  check(shelf.b, want.shelfB, 'shelf b');
  check(shelf.a, want.shelfA, 'shelf a');
  check(hp.b, want.hpB, 'high-pass b');
  check(hp.a, want.hpA, 'high-pass a');
});

test('EBU 3341 cases 1 and 2: a steady stereo sine reads its own level', () => {
  for (const level of [-23, -33]) {
    const ch = sine([[20, level]]);
    near(m.loudness([ch, ch], RATE), level, 0.1, `stereo 1 kHz at ${level} dBFS`);
  }
});

test('EBU 3341 cases 3 and 4: the relative gate ignores the quiet parts', () => {
  const a = sine([[10, -36], [60, -23], [10, -36]]);
  near(m.loudness([a, a], RATE), -23, 0.1, 'case 3');
  const b = sine([[10, -72], [10, -36], [60, -23], [10, -36], [10, -72]]);
  near(m.loudness([b, b], RATE), -23, 0.1, 'case 4');
});

test('EBU 3341 case 5: loud and quiet parts average as the standard says', () => {
  const c = sine([[20, -26], [20.1, -20], [20, -26]]);
  near(m.loudness([c, c], RATE), -23, 0.1, 'case 5');
});

test('a mono file reads 3 LU lower than the same sound on two channels', () => {
  const ch = sine([[10, -20]]);
  near(m.loudness([ch], RATE) - m.loudness([ch, ch], RATE), -3.01, 0.02, 'mono against stereo');
});

test('loudness works at 44.1 kHz too', () => {
  const ch = sine([[20, -23]], { rate: 44100 });
  near(m.loudness([ch, ch], 44100), -23, 0.1, '44.1 kHz');
});

test('peak and RMS: a full-scale sine is 0 dBFS peak and -3.01 dB RMS', () => {
  const ch = sine([[2, 0]], { freq: 997 });
  near(m.peak([ch]), 0, 0.01, 'peak');
  near(m.rms([ch]), -3.01, 0.01, 'rms');
  const quiet = sine([[2, -20]], { freq: 997 });
  near(m.rms([quiet]), -23.01, 0.01, 'rms at -20 dBFS peak');
});

test('the noise floor is the quietest half second', () => {
  const ch = sine([[3, -20], [1, -70], [3, -20]]);
  near(m.noiseFloor([ch], RATE), -73.01, 0.05, 'noise floor');
});

test('true peak finds the peak between samples', () => {
  // A sine at a quarter of the sample rate, shifted by 45 degrees, never has a sample at its peak.
  const ch = sine([[1, -3]], { freq: RATE / 4, phase: Math.PI / 4 });
  near(m.peak([ch]), -6.01, 0.01, 'sample peak');
  near(m.truePeak([ch]), -3, 0.3, 'true peak');
});

test('silence has no loudness, and no level', () => {
  const ch = new Float32Array(RATE * 2);
  assert.strictEqual(m.loudness([ch], RATE), -Infinity);
  assert.strictEqual(m.rms([ch]), -Infinity);
});
