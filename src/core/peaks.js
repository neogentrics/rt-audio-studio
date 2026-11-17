'use strict';
// Waveform summaries for very long recordings (step zero).
//
// The finest level, one low and high for every 256 frames, is written to a cache file as the sound is read, so it
// never sits in memory. Coarser levels, each 4 times coarser, are kept in memory: for ten hours at 48 kHz that's
// about 18 MB. Any stretch at any zoom is then drawn from the coarsest level that still has enough detail.
// The cache can always be deleted and built again.

const BUCKET = 256;
const FACTOR = 4;

class PeakBuilder {
  /**
   * @param {object} o
   * @param {number} o.channels
   * @param {{ append(buf: Buffer): void }} o.out  where the finest level goes, through the disk layer
   */
  constructor({ channels, out }) {
    this.channels = channels;
    this.out = out;
    this.frames = 0;
    this.lo = Infinity;
    this.hi = -Infinity;
    this.inBucket = 0;
    this.level0 = 0;                  // buckets written to the cache
    this.pending = [];                // finest-level pairs waiting to be written
    this.levels = [];                 // coarser levels: { data: number[], lo, hi, count }
  }

  /** Add interleaved sound, in any size of piece. */
  add(samples) {
    const ch = this.channels;
    for (let i = 0; i < samples.length; i += ch) {
      for (let c = 0; c < ch; c++) {
        const v = samples[i + c];
        if (v < this.lo) this.lo = v;
        if (v > this.hi) this.hi = v;
      }
      this.frames++;
      if (++this.inBucket === BUCKET) this.closeBucket();
    }
    if (this.pending.length >= 8192) this.writePending();
  }

  closeBucket() {
    this.pending.push(this.lo, this.hi);
    this.level0++;
    this.climb(0, this.lo, this.hi);
    this.lo = Infinity;
    this.hi = -Infinity;
    this.inBucket = 0;
  }

  /** Fold a bucket into the next level up, and on up while levels fill. */
  climb(depth, lo, hi) {
    const level = (this.levels[depth] ??= { data: [], lo: Infinity, hi: -Infinity, count: 0 });
    if (lo < level.lo) level.lo = lo;
    if (hi > level.hi) level.hi = hi;
    if (++level.count === FACTOR) {
      level.data.push(level.lo, level.hi);
      const [l, h] = [level.lo, level.hi];
      level.lo = Infinity;
      level.hi = -Infinity;
      level.count = 0;
      this.climb(depth + 1, l, h);
    }
  }

  writePending() {
    if (!this.pending.length) return;
    const f = Float32Array.from(this.pending);
    this.out.append(Buffer.from(f.buffer));
    this.pending = [];
  }

  /** Finish: the last part-bucket, and everything written. Returns a Peaks to draw from. */
  finish(reader) {
    if (this.inBucket) this.closeBucket();
    this.writePending();
    const levels = this.levels.map((l) => {
      const data = l.count ? [...l.data, l.lo, l.hi] : l.data;
      return Float32Array.from(data);
    });
    return new Peaks({ frames: this.frames, level0: this.level0, levels, reader });
  }
}

class Peaks {
  /** @param {{ readAt(position: number, length: number): Buffer }} o.reader  the cache file, for the finest level */
  constructor({ frames, level0, levels, reader }) {
    this.frames = frames;
    this.level0 = level0;
    this.levels = levels;
    this.reader = reader;
  }

  /** Frames in one bucket at a depth: 256 at the finest, then 4 times more each level. */
  static span(depth) {
    return BUCKET * FACTOR ** depth;
  }

  /** Low and high for each of `columns` columns between two frames, as a Float32Array of pairs. */
  view(start, end, columns) {
    const per = (end - start) / columns;
    let depth = 0;
    while (depth < this.levels.length && Peaks.span(depth + 1) <= per) depth++;
    const span = Peaks.span(depth);
    const first = Math.floor(start / span);
    const last = Math.min(Math.ceil(end / span), depth === 0 ? this.level0 : this.levels[depth - 1].length / 2);
    let pairs;
    if (depth === 0) {
      const buf = this.reader.readAt(first * 8, Math.max(0, last - first) * 8);
      pairs = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    } else {
      pairs = this.levels[depth - 1].subarray(first * 2, last * 2);
    }
    const out = new Float32Array(columns * 2);
    for (let c = 0; c < columns; c++) {
      const from = Math.floor((start + c * per) / span) - first;
      const to = Math.max(from + 1, Math.ceil((start + (c + 1) * per) / span) - first);
      let lo = Infinity;
      let hi = -Infinity;
      for (let b = Math.max(0, from); b < Math.min(to, pairs.length / 2); b++) {
        if (pairs[b * 2] < lo) lo = pairs[b * 2];
        if (pairs[b * 2 + 1] > hi) hi = pairs[b * 2 + 1];
      }
      out[c * 2] = lo === Infinity ? 0 : lo;
      out[c * 2 + 1] = hi === -Infinity ? 0 : hi;
    }
    return out;
  }
}

module.exports = { PeakBuilder, Peaks, BUCKET };
