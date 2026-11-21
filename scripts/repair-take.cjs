'use strict';
// Step zero: after the app was killed or the power was cut mid-take, make the file whole and say what it kept.
//   node scripts/repair-take.cjs "<path to the .wav>"
const { Disk } = require('../src/core/disk');
const wav = require('../src/core/wav');

const file = process.argv[2];
if (!file) { console.error('Give the path of a take (.wav) to repair.'); process.exit(1); }
const r = wav.repair(new Disk(), file);
console.log(`Kept ${r.frames} frames: ${(r.frames / r.sampleRate).toFixed(2)} seconds of ${r.channels} channel${r.channels === 1 ? '' : 's'} at ${r.sampleRate} Hz.`);
