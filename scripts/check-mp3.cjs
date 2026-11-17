'use strict';
// Step zero: does the MP3 encoder make what ACX asks for? A true constant 192 kbps at 44.1 kHz, the length it
// should be, and nothing that FFmpeg (a test tool on the dev machine only) refuses to read.
//
// This checks `lamejs`, what RT Markdown Reader ships. LAME 3.100 as WebAssembly runs in Electron's renderer and is
// checked there next.
//   node scripts/check-mp3.cjs [kbps]
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const KBPS = Number(process.argv[2] || 192);
const RATE = 44100;
const SECONDS = 600;
const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];   // MPEG-1 Layer III
const RATES = [44100, 48000, 32000];

/** Every frame in an MP3: its bit rate and sample rate. Tags at the start are skipped. */
function frames(buf) {
  let at = 0;
  if (buf.toString('latin1', 0, 3) === 'ID3') {
    at = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  }
  const out = [];
  while (at + 4 <= buf.length) {
    const h = buf.readUInt32BE(at);
    if ((h >>> 21) !== 0x7ff) { at++; continue; }
    const version = (h >>> 19) & 3;
    const layer = (h >>> 17) & 3;
    const bi = (h >>> 12) & 15;
    const si = (h >>> 10) & 3;
    const pad = (h >>> 9) & 1;
    if (version !== 3 || layer !== 1 || bi === 0 || bi === 15 || si === 3) { at++; continue; }
    const kbps = BITRATES[bi];
    const rate = RATES[si];
    const size = Math.floor((144000 * kbps) / rate) + pad;
    out.push({ kbps, rate, at, size });
    at += size;
  }
  return out;
}

const lamejs = require('lamejs');
const enc = new lamejs.Mp3Encoder(1, RATE, KBPS);
const chunks = [];
const block = 1152 * 10;
const pcm = new Int16Array(block);
let n = 0;
for (let done = 0; done < RATE * SECONDS; done += block) {
  for (let i = 0; i < block; i++, n++) {
    const t = n / RATE;
    pcm[i] = Math.round(12000 * (0.6 * Math.sin(2 * Math.PI * 150 * t) + 0.3 * Math.sin(2 * Math.PI * 2300 * t)) * ((t % 3) < 2.2 ? 1 : 0.01));
  }
  chunks.push(Buffer.from(enc.encodeBuffer(pcm)));
}
chunks.push(Buffer.from(enc.flush()));
const mp3 = Buffer.concat(chunks);
const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rtas-mp3-')), 'check.mp3');
fs.writeFileSync(file, mp3);

const list = frames(mp3);
const rates = new Set(list.map((f) => f.kbps));
const sampleRates = new Set(list.map((f) => f.rate));
const seconds = (list.length * 1152) / RATE;
const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,bit_rate:stream=sample_rate,channels', '-of', 'default=nw=1', file], { encoding: 'utf8' });
const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-'], { encoding: 'utf8' });

console.log(`Encoder: lamejs, asked for ${KBPS} kbps mono at ${RATE} Hz, ${SECONDS} s`);
console.log(`Frames: ${list.length}, bit rates seen: ${[...rates].join(', ')} kbps, sample rates: ${[...sampleRates].join(', ')}`);
console.log(`Constant bit rate: ${rates.size === 1 && rates.has(KBPS) ? 'yes' : 'NO'}`);
console.log(`Length from frames: ${seconds.toFixed(2)} s (asked for ${SECONDS})`);
console.log(`ffprobe: ${probe.stdout.trim().replace(/\n/g, ', ')}`);
console.log(`FFmpeg decode errors: ${decode.stderr.trim() ? decode.stderr.trim().split('\n').length : 0}`);
fs.rmSync(path.dirname(file), { recursive: true, force: true });
