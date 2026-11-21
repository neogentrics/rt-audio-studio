'use strict';
// Step zero: the recording test. A small window that records from a real microphone for as long as you choose,
// through the same take writer the app will use, then checks the file for dropped sound.
//
//   npm run record-test
//   RTAS_FAKE_AUDIO=1 RTAS_AUTO_MINUTES=0.2 npm run record-test    (a fake microphone, started by itself, for a quick check)
//
// Nothing here is the app. It exists to answer one question: is Electron's own audio good enough to record with?
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { app, BrowserWindow, ipcMain, powerSaveBlocker, systemPreferences, session } = require('electron');
const { Disk } = require('../core/disk');
const { TakeWriter } = require('../core/take-writer');
const wav = require('../core/wav');

const CHUNK_SECONDS = 0.2;           // the length of each piece of sound worklet.js sends
const fake = process.env.RTAS_FAKE_AUDIO === '1';
if (fake) {
  app.commandLine.appendSwitch('use-fake-device-for-media-stream');
  app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
}

const disk = new Disk();
let dir = '';
let take = null;        // { writer, name, started, lastAt, gaps, maxGap, blocker, opts, freeBefore }

const toFloats = (data) => {
  if (data instanceof Float32Array) return data;
  const view = ArrayBuffer.isView(data) ? data : new Uint8Array(data);
  return new Float32Array(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength));
};

/** The longest run of frames in which every channel is exactly zero: where sound was dropped, the file is silent. */
function longestZeroRun(parts, channels) {
  const block = channels * 4;
  const step = block * 65536;
  let longest = 0;
  let run = 0;
  for (const part of parts) {
    const h = disk.open(part);
    try {
      const info = wav.parse(h.readAt(0, wav.HEADER));
      const end = wav.HEADER + info.frames * block;
      for (let at = wav.HEADER; at < end; at += step) {
        const buf = h.readAt(at, Math.min(step, end - at));
        const f = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
        for (let i = 0; i < f.length; i += channels) {
          let zero = true;
          for (let c = 0; c < channels; c++) if (f[i + c] !== 0) { zero = false; break; }
          if (zero) { if (++run > longest) longest = run; } else run = 0;
        }
      }
    } finally {
      h.close();
    }
  }
  return longest;
}

function finish(summary, keep) {
  const t = take;
  take = null;
  if (t.blocker !== null) powerSaveBlocker.stop(t.blocker);
  const result = t.writer.close();
  // From the first piece of sound to the last, plus the length of that last piece: the clock only runs while sound
  // is arriving, so starting up and shutting down don't count as dropped.
  const wall = t.firstAt ? (t.lastAt - t.firstAt) / 1000 + CHUNK_SECONDS : 0;
  const rate = t.opts.sampleRate;
  const expected = wall * rate;
  const zeroRun = result.frames ? longestZeroRun(result.parts, t.opts.channels) : 0;
  const bytes = result.parts.reduce((n, p) => n + fs.statSync(p).size, 0);
  const shortfall = expected ? (expected - result.frames) / expected : 0;
  const report = {
    when: new Date().toISOString(),
    system: `${process.platform} ${os.release()} ${process.arch}`,
    electron: process.versions.electron,
    chromium: process.versions.chrome,
    device: t.opts.device,
    asked: t.opts.channels,
    channelsSeenByChromium: t.opts.maxChannels,
    sampleRate: rate,
    channels: t.opts.channels,
    plannedMinutes: t.opts.minutes,
    wallSeconds: Number(wall.toFixed(2)),
    secondsOnDisk: Number((result.frames / rate).toFixed(2)),
    framesOnDisk: result.frames,
    framesExpected: Math.round(expected),
    shortfallPercent: Number((shortfall * 100).toFixed(4)),
    parts: result.parts.length,
    gigabytes: Number((bytes / 1e9).toFixed(2)),
    arrivalGapsOver400ms: t.gaps,
    longestArrivalGapMs: Math.round(t.maxGap),
    longestSilenceMs: Math.round((zeroRun / rate) * 1000),
    rendererReportedFrames: summary?.framesReceived ?? null,
    stoppedEarly: result.stopped,
    freeGBBefore: t.freeBefore === null ? null : Number((t.freeBefore / 1e9).toFixed(1)),
    freeGBAfter: (() => { const f = disk.freeBytes(dir); return f === null ? null : Number((f / 1e9).toFixed(1)); })(),
  };
  const problems = [];
  if (result.stopped) problems.push(`the take stopped early: ${result.stopped.message}`);
  if (Math.abs(shortfall) > 0.001) problems.push(`${report.shortfallPercent}% of the sound is missing or extra (the allowance is 0.1%)`);
  if (t.gaps > 0) problems.push(`sound arrived late ${t.gaps} time${t.gaps === 1 ? '' : 's'}, the longest by ${report.longestArrivalGapMs} ms`);
  if (report.longestSilenceMs > 100) problems.push(`the file holds ${report.longestSilenceMs} ms of exact digital silence, which usually means dropped sound`);
  report.verdict = problems.length ? `PROBLEMS: ${problems.join('; ')}` : 'CLEAN: no dropped sound found';
  const out = path.join(dir, `${t.name}-report.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  report.reportFile = out;
  if (!keep) for (const p of result.parts) fs.rmSync(p, { force: true });
  return report;
}

function open() {
  dir = process.env.RTAS_TEST_DIR || path.join(app.getPath('documents'), 'RT Audio Studio record test');
  disk.mkdir(dir);

  // The microphone, and nothing else, is allowed.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === 'media'));
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === 'media');

  ipcMain.handle('rt:info', () => ({
    dir,
    freeBytes: disk.freeBytes(dir),
    system: `${process.platform} ${os.release()} ${process.arch}`,
    electron: process.versions.electron,
    micStatus: process.platform === 'linux' ? 'n/a' : systemPreferences.getMediaAccessStatus('microphone'),
    fake,
  }));
  ipcMain.handle('rt:mic-access', async () => {
    if (process.platform === 'darwin') return systemPreferences.askForMediaAccess('microphone');
    return true;
  });
  ipcMain.handle('rt:start', (_e, opts) => {
    const name = `test-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const writer = new TakeWriter({ disk, dir, name, sampleRate: opts.sampleRate, channels: opts.channels });
    take = {
      writer, name, opts, started: Date.now(), lastAt: Date.now(), gaps: 0, maxGap: 0,
      blocker: powerSaveBlocker.start('prevent-app-suspension'),
      freeBefore: disk.freeBytes(dir),
    };
    return { name };
  });
  ipcMain.on('rt:samples', (event, data) => {
    if (!take) return;
    const now = Date.now();
    if (!take.firstAt) take.firstAt = now;
    const gap = now - take.lastAt;
    take.lastAt = now;
    // Sound comes in pieces of 0.2 s, so a wait of 0.4 s or more means a whole piece was late or lost.
    if (take.firstAt !== now && gap > take.maxGap) take.maxGap = gap;
    if (take.firstAt !== now && gap > 400) take.gaps++;
    if (!take.writer.write(toFloats(data))) event.sender.send('rt:stopped', take.writer.stopped);
  });
  ipcMain.handle('rt:stop', (_e, summary, keep) => (take ? finish(summary, keep) : null));

  const win = new BrowserWindow({
    width: 760,
    height: 700,
    title: 'RT Audio Studio recording test',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false },
  });
  win.loadFile(path.join(__dirname, 'index.html'), { query: { auto: process.env.RTAS_AUTO_MINUTES || '' } });
}

app.whenReady().then(open);
app.on('window-all-closed', () => app.quit());
