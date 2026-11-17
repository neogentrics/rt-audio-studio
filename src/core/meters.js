'use strict';
// Meters (step zero): the numbers the store checks will rest on, so they're tested before anything depends on them.
//
//  - peak:       the highest sample, in dBFS.
//  - rms:        the level of the whole file, in dBFS, where a full-scale sine reads -3.01 dB. This is the convention
//                the ACX volume range is usually measured in.
//  - noiseFloor: the level of the quietest half second, in the same units. ACX means the silence between phrases.
//  - loudness:   integrated loudness in LUFS, by ITU-R BS.1770-4 (K-weighting, 400 ms blocks, absolute and relative gates).
//  - truePeak:   the peak between samples, in dBTP, by four times oversampling.
//
// Input is one Float32Array per channel. Only mono and stereo are handled: every channel counts with a weight of 1.

const dB = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
const powerDb = (p) => (p > 0 ? 10 * Math.log10(p) : -Infinity);

function peak(channels) {
  let m = 0;
  for (const ch of channels) for (let i = 0; i < ch.length; i++) { const v = Math.abs(ch[i]); if (v > m) m = v; }
  return dB(m);
}

function meanSquare(ch, from = 0, to = ch.length) {
  let s = 0;
  for (let i = from; i < to; i++) s += ch[i] * ch[i];
  return to > from ? s / (to - from) : 0;
}

function rms(channels) {
  const p = channels.reduce((n, ch) => n + meanSquare(ch), 0) / channels.length;
  return powerDb(p);
}

/** The quietest `seconds` of the file, measured in steps of a tenth of a second. */
function noiseFloor(channels, sampleRate, seconds = 0.5) {
  const win = Math.round(sampleRate * seconds);
  const hop = Math.max(1, Math.round(sampleRate * 0.1));
  const len = channels[0].length;
  if (len < win) return rms(channels);
  // Running sums of squares make every window cost the same, however long the file.
  const sums = channels.map((ch) => {
    const s = new Float64Array(len + 1);
    for (let i = 0; i < len; i++) s[i + 1] = s[i] + ch[i] * ch[i];
    return s;
  });
  let best = Infinity;
  for (let at = 0; at + win <= len; at += hop) {
    let p = 0;
    for (const s of sums) p += (s[at + win] - s[at]) / win;
    p /= channels.length;
    if (p < best) best = p;
  }
  return powerDb(best);
}

/** The two filters of BS.1770's K-weighting, worked out for any sample rate (the standard lists 48 kHz). */
function kWeighting(sampleRate) {
  // Stage 1: a high shelf, about +4 dB above 1.5 kHz, for the effect of the head.
  let f0 = 1681.974450955533;
  const G = 3.999843853973347;
  let Q = 0.7071752369554196;
  let K = Math.tan(Math.PI * f0 / sampleRate);
  const Vh = 10 ** (G / 20);
  const Vb = Vh ** 0.4996667741545416;
  let a0 = 1 + K / Q + K * K;
  const shelf = {
    b: [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0],
    a: [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0],
  };
  // Stage 2: a high-pass, the "RLB" curve.
  f0 = 38.13547087602444;
  Q = 0.5003270373238773;
  K = Math.tan(Math.PI * f0 / sampleRate);
  a0 = 1 + K / Q + K * K;
  const highPass = { b: [1, -2, 1], a: [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0] };
  return [shelf, highPass];
}

function biquad(x, { b, a }) {
  const y = new Float64Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    const o = b[0] * v + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
    x2 = x1; x1 = v; y2 = y1; y1 = o;
    y[i] = o;
  }
  return y;
}

/** Integrated loudness in LUFS, or -Infinity for silence. */
function loudness(channels, sampleRate) {
  const [shelf, highPass] = kWeighting(sampleRate);
  const weighted = channels.map((ch) => biquad(biquad(ch, shelf), highPass));
  const block = Math.round(0.4 * sampleRate);
  const step = Math.round(0.1 * sampleRate);
  const len = weighted[0].length;
  const sums = weighted.map((ch) => {
    const s = new Float64Array(len + 1);
    for (let i = 0; i < len; i++) s[i + 1] = s[i] + ch[i] * ch[i];
    return s;
  });
  const blocks = [];
  for (let at = 0; at + block <= len; at += step) {
    let z = 0;
    for (const s of sums) z += (s[at + block] - s[at]) / block;
    blocks.push(z);
  }
  const lufs = (z) => -0.691 + powerDb(z);
  const mean = (list) => list.reduce((n, z) => n + z, 0) / list.length;
  const loud = blocks.filter((z) => lufs(z) > -70);
  if (!loud.length) return -Infinity;
  const gate = lufs(mean(loud)) - 10;
  const kept = loud.filter((z) => lufs(z) > gate);
  return lufs(mean(kept));
}

/** A low-pass for four times oversampling: a windowed sinc, 12 taps for each of the 4 phases. */
function oversampler() {
  const taps = 48;
  const factor = 4;
  const h = new Float64Array(taps);
  const mid = (taps - 1) / 2;
  for (let n = 0; n < taps; n++) {
    const t = (n - mid) / factor;
    const sinc = t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
    const w = 0.42 - 0.5 * Math.cos(2 * Math.PI * n / (taps - 1)) + 0.08 * Math.cos(4 * Math.PI * n / (taps - 1));
    h[n] = sinc * w;
  }
  // Each phase passes a constant through unchanged.
  const phases = [];
  for (let p = 0; p < factor; p++) {
    const c = [];
    for (let n = p; n < taps; n += factor) c.push(h[n]);
    const sum = c.reduce((a, b) => a + b, 0);
    phases.push(Float64Array.from(c, (v) => v / sum));
  }
  return phases;
}

function truePeak(channels) {
  const phases = oversampler();
  const n = phases[0].length;
  let m = 0;
  for (const ch of channels) {
    for (let i = 0; i < ch.length; i++) {
      const v = Math.abs(ch[i]);
      if (v > m) m = v;
      for (const c of phases) {
        let s = 0;
        for (let k = 0; k < n; k++) {
          const j = i - k;
          if (j >= 0) s += c[k] * ch[j];
        }
        const a = Math.abs(s);
        if (a > m) m = a;
      }
    }
  }
  return dB(m);
}

module.exports = { peak, rms, noiseFloor, loudness, truePeak, kWeighting };
