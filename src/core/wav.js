'use strict';
// WAV files for takes (step zero): 32-bit float, exactly as the microphone gave the sound, with no processing.
//
// The header is written first with sizes of zero and corrected at every flush. If the app stops without closing the
// file, repair() works the sizes out again from the file's real length, so a crash costs only what wasn't flushed.

const FLOAT = 3;                          // WAVE_FORMAT_IEEE_FLOAT
const HEADER = 58;                        // RIFF(12) + fmt with cbSize(26) + fact(12) + data header(8)
const DATA_SIZE_AT = 54;
const FACT_AT = 46;
const MAX_DATA = 0xffffffff - (HEADER - 8);

/** A header for `channels` of float sound at `sampleRate`, holding `frames` frames. */
function header({ sampleRate, channels, frames = 0 }) {
  const block = channels * 4;
  const data = frames * block;
  const b = Buffer.alloc(HEADER);
  b.write('RIFF', 0, 'ascii');
  b.writeUInt32LE(HEADER - 8 + data, 4);
  b.write('WAVE', 8, 'ascii');
  b.write('fmt ', 12, 'ascii');
  b.writeUInt32LE(18, 16);
  b.writeUInt16LE(FLOAT, 20);
  b.writeUInt16LE(channels, 22);
  b.writeUInt32LE(sampleRate, 24);
  b.writeUInt32LE(sampleRate * block, 28);
  b.writeUInt16LE(block, 32);
  b.writeUInt16LE(32, 34);
  b.writeUInt16LE(0, 36);
  b.write('fact', 38, 'ascii');
  b.writeUInt32LE(4, 42);
  b.writeUInt32LE(frames, FACT_AT);
  b.write('data', 50, 'ascii');
  b.writeUInt32LE(data, DATA_SIZE_AT);
  return b;
}

/** Read the parts of a header this app writes. Anything else is refused rather than guessed at. */
function parse(buf) {
  if (buf.length < HEADER || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Not a WAV file');
  }
  if (buf.toString('ascii', 12, 16) !== 'fmt ' || buf.readUInt16LE(20) !== FLOAT || buf.toString('ascii', 50, 54) !== 'data') {
    throw new Error('Not a take written by RT Audio Studio');
  }
  const channels = buf.readUInt16LE(22);
  return {
    channels,
    sampleRate: buf.readUInt32LE(24),
    dataBytes: buf.readUInt32LE(DATA_SIZE_AT),
    frames: buf.readUInt32LE(FACT_AT),
    dataAt: HEADER,
    block: channels * 4,
  };
}

/** The sizes that go in a header for `frames` frames, as [position, bytes] pairs. */
function sizePatches(frames, block) {
  const data = frames * block;
  const riff = Buffer.alloc(4);
  riff.writeUInt32LE(HEADER - 8 + data);
  const fact = Buffer.alloc(4);
  fact.writeUInt32LE(frames);
  const dataSize = Buffer.alloc(4);
  dataSize.writeUInt32LE(data);
  return [[4, riff], [FACT_AT, fact], [DATA_SIZE_AT, dataSize]];
}

/**
 * Make a take whole again after a crash: sizes from the file's real length, and a frame cut short at the end
 * dropped. Returns how many frames the take holds.
 */
function repair(disk, file) {
  const h = disk.open(file);
  try {
    const info = parse(h.readAt(0, HEADER));
    const frames = Math.floor(Math.max(0, h.size - HEADER) / info.block);
    const end = HEADER + frames * info.block;
    if (h.size !== end) h.truncate(end);
    for (const [at, bytes] of sizePatches(frames, info.block)) h.writeAt(at, bytes);
    h.sync();
    return { ...info, frames, dataBytes: frames * info.block };
  } finally {
    h.close();
  }
}

/** Every sample of a take, interleaved, for tests and short files. */
function readSamples(disk, file) {
  const buf = disk.readFile(file);
  const info = parse(buf);
  const bytes = buf.subarray(HEADER, HEADER + info.frames * info.block);
  const out = new Float32Array(bytes.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = bytes.readFloatLE(i * 4);
  return { ...info, samples: out };
}

module.exports = { header, parse, repair, readSamples, sizePatches, HEADER, MAX_DATA };
