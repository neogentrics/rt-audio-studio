'use strict';
// Writing a take to disk as it's recorded (step zero).
//
//  - Sound is written and flushed about once a second, and the header's sizes are corrected each time, so a crash or a
//    power cut loses at most that second. repair() in wav.js deals with the rest.
//  - A take is split into parts of an hour, so no file comes near the WAV format's 4 GB limit.
//  - A full disk, or any other failure to write, stops the take cleanly. Everything written so far is kept, and the
//    reason is given. It never throws away sound to carry on.
const path = require('node:path');
const wav = require('./wav');

const HOUR = 3600;

class TakeWriter {
  /**
   * @param {object} o
   * @param {import('./disk').Disk} o.disk
   * @param {string} o.dir          the take's folder
   * @param {string} o.name         the take's name, without extension
   * @param {number} o.sampleRate
   * @param {number} o.channels
   * @param {number} [o.partSeconds]  length of each part, an hour by default
   * @param {number} [o.flushSeconds] how often sound is flushed to disk
   */
  constructor({ disk, dir, name, sampleRate, channels, partSeconds = HOUR, flushSeconds = 1 }) {
    if (!(sampleRate > 0) || !(channels > 0)) throw new Error('A take needs a sample rate and channels');
    this.disk = disk;
    this.dir = dir;
    this.name = name;
    this.sampleRate = sampleRate;
    this.channels = channels;
    this.partFrames = Math.min(Math.floor(partSeconds * sampleRate), Math.floor(wav.MAX_DATA / (channels * 4)));
    this.flushFrames = Math.max(1, Math.floor(flushSeconds * sampleRate));
    this.parts = [];
    this.file = null;
    this.frames = 0;          // in the current part, on disk
    this.total = 0;           // in the whole take, on disk
    this.pending = [];
    this.pendingFrames = 0;
    this.stopped = null;      // why the take stopped early, if it did
    this.closed = false;
    disk.mkdir(dir);
  }

  partName(n) {
    return `${this.name}-${String(n).padStart(3, '0')}.wav`;
  }

  openPart() {
    const file = path.join(this.dir, this.partName(this.parts.length + 1));
    this.file = this.disk.open(file, { create: true });
    this.file.append(wav.header({ sampleRate: this.sampleRate, channels: this.channels }));
    this.file.sync();
    this.disk.syncDir(this.dir);
    this.parts.push(file);
    this.frames = 0;
  }

  /**
   * Add sound, interleaved, as it arrives. Returns false once the take has stopped, so the caller can stop recording
   * and show `stopped`.
   */
  write(samples) {
    if (this.closed) throw new Error('This take is closed');
    if (this.stopped) return false;
    if (samples.length % this.channels !== 0) throw new Error('Samples must be whole frames');
    this.pending.push(Float32Array.from(samples));
    this.pendingFrames += samples.length / this.channels;
    if (this.pendingFrames >= this.flushFrames) this.flush();
    return !this.stopped;
  }

  /** Write everything waiting, correct the header and flush it to the disk. */
  flush() {
    if (this.stopped || this.pendingFrames === 0) return;
    const all = new Float32Array(this.pendingFrames * this.channels);
    let at = 0;
    for (const p of this.pending) { all.set(p, at); at += p.length; }
    this.pending = [];
    this.pendingFrames = 0;
    let from = 0;
    try {
      while (from < all.length) {
        if (!this.file || this.frames >= this.partFrames) this.nextPart();
        const room = (this.partFrames - this.frames) * this.channels;
        const piece = all.subarray(from, from + Math.min(room, all.length - from));
        this.file.append(Buffer.from(piece.buffer, piece.byteOffset, piece.byteLength));
        const n = piece.length / this.channels;
        this.frames += n;
        this.total += n;
        from += piece.length;
        this.patch();
      }
    } catch (err) {
      this.stop(err);
    }
  }

  patch() {
    for (const [at, bytes] of wav.sizePatches(this.frames, this.channels * 4)) this.file.writeAt(at, bytes);
    this.file.sync();
  }

  nextPart() {
    if (this.file) { this.patch(); this.file.close(); this.file = null; }
    this.openPart();
  }

  stop(err) {
    const full = err && (err.code === 'ENOSPC' || err.code === 'EDQUOT');
    this.stopped = { reason: full ? 'disk-full' : 'write-failed', message: full ? 'The disk is full' : String(err?.message || err) };
    // What reached the disk is kept. The header may be a flush behind; repair() makes it match.
    if (this.file) {
      try { this.file.close(); } catch { /* already unusable */ }
      this.file = null;
    }
    this.total = this.parts.reduce((n, part) => {
      try { return n + wav.repair(this.disk, part).frames; } catch { return n; }
    }, 0);
  }

  /** Finish the take. Returns what was kept. */
  close() {
    if (this.closed) return this.result();
    this.flush();
    if (this.file) {
      try { this.patch(); this.file.close(); } catch (err) { this.stop(err); }
      this.file = null;
    }
    this.closed = true;
    return this.result();
  }

  result() {
    return { parts: [...this.parts], frames: this.total, seconds: this.total / this.sampleRate, stopped: this.stopped };
  }
}

module.exports = { TakeWriter };
