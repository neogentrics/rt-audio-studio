'use strict';
// Test helper: records a tone into a take until it's killed, printing how many frames are safely on disk after
// each flush. Used to check that a killed app keeps what it reported.
const { Disk } = require('../../src/core/disk');
const { TakeWriter } = require('../../src/core/take-writer');

const dir = process.argv[2];
const rate = 48000;
const w = new TakeWriter({ disk: new Disk(), dir, name: 'killed', sampleRate: rate, channels: 1, flushSeconds: 0.25 });
let at = 0;
setInterval(() => {
  const chunk = new Float32Array(480);
  for (let i = 0; i < chunk.length; i++, at++) chunk[i] = 0.5 * Math.sin((2 * Math.PI * 440 * at) / rate);
  const before = w.total;
  w.write(chunk);
  if (w.total !== before) process.stdout.write(`${w.total}\n`);
}, 1);
