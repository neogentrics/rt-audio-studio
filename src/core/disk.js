'use strict';
// The one way to the disk (step zero). Every read and write in the app goes through here, so the safety rules live in
// one place, tests can make the disk fail on purpose, and the project lock in v1.14 can be added without a rewrite.
//
// Pass a different `fs` to test failures: a full disk, a file that won't open, a write that stops part-way.
const nodeFs = require('node:fs');
const path = require('node:path');

class Disk {
  constructor({ fs = nodeFs } = {}) {
    this.fs = fs;
  }

  readFile(file) {
    return this.fs.readFileSync(file);
  }

  exists(file) {
    return this.fs.existsSync(file);
  }

  mkdir(dir) {
    this.fs.mkdirSync(dir, { recursive: true });
  }

  list(dir) {
    return this.fs.readdirSync(dir);
  }

  size(file) {
    return this.fs.statSync(file).size;
  }

  /** Bytes free where `dir` is, or null when the system can't say. */
  freeBytes(dir) {
    try {
      const s = this.fs.statfsSync(dir);
      return Number(s.bavail) * Number(s.bsize);
    } catch {
      return null;
    }
  }

  /**
   * Replace a small file in one step: write a copy, flush it, then rename it over the old one.
   * A crash leaves either the old file or the new one, never half of each.
   */
  writeFileAtomic(file, data) {
    const tmp = `${file}.${process.pid}.tmp`;
    const fd = this.fs.openSync(tmp, 'w');
    try {
      this.fs.writeFileSync(fd, data);
      this.fs.fsyncSync(fd);
    } finally {
      this.fs.closeSync(fd);
    }
    this.fs.renameSync(tmp, file);
    this.syncDir(path.dirname(file));
  }

  /** Flush a folder's list of files, where the system allows it (not on Windows). */
  syncDir(dir) {
    if (process.platform === 'win32') return;
    let fd = null;
    try {
      fd = this.fs.openSync(dir, 'r');
      this.fs.fsyncSync(fd);
    } catch {
      // Some file systems refuse; the rename is still in place.
    } finally {
      if (fd !== null) this.fs.closeSync(fd);
    }
  }

  /**
   * Open a file for recording into. `create` starts a new file and refuses to replace one: a take is never
   * overwritten. Without it, an existing file is opened to be repaired.
   */
  open(file, { create = false } = {}) {
    const fs = this.fs;
    const fd = fs.openSync(file, create ? 'wx+' : 'r+');
    let end = create ? 0 : fs.fstatSync(fd).size;
    return {
      file,
      get size() { return end; },
      append(buf) {
        let done = 0;
        while (done < buf.length) {
          const n = fs.writeSync(fd, buf, done, buf.length - done, end);
          done += n;
          end += n;
        }
      },
      writeAt(position, buf) {
        let done = 0;
        while (done < buf.length) done += fs.writeSync(fd, buf, done, buf.length - done, position + done);
      },
      readAt(position, length) {
        const buf = Buffer.alloc(length);
        const n = fs.readSync(fd, buf, 0, length, position);
        return buf.subarray(0, n);
      },
      truncate(length) {
        fs.ftruncateSync(fd, length);
        end = length;
      },
      sync() { fs.fsyncSync(fd); },
      close() { fs.closeSync(fd); },
    };
  }
}

module.exports = { Disk };
