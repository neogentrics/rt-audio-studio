---
title: Step Zero Results
subtitle: What was proved, with the numbers, and what still needs real gear
author: Recon Towers Dev Department
date: 2026-11-17
tags: [plan, results]
---

# Step zero results

Run on the Linux dev machine, with the same tests running on Windows and Mac in CI. The dev machine has no microphone, so everything that needs one is listed at the end.

| Task | State | Result |
|---|---|---|
| Project setup | Done | An empty Electron app, 18 tests, and CI on Windows, Mac and Linux that all pass |
| One way to reach the disk | Done | `src/core/disk.js`. Takes are written through it and never over an existing file. The tests make it fail on purpose |
| Takes that survive | Done | See below |
| Meters | Done | See below |
| MP3 encoder | Partly | `lamejs` passes. Real LAME 3.100 as WebAssembly is still to compare |
| Very long files | Partly | The design works for 15 minutes. The ten-hour run was cut short by a restart of the dev machine, and is to be rerun |
| Recording test | Needs your gear | Two hours on your own microphone, on all three systems |
| Microphone on an unsigned Mac app | Needs a Mac | |
| Transcript speed | Not started | Needs the model downloads on the dev machine |

## Takes that survive

Tested on all three systems in CI.

- A take reads back exactly as written, byte for byte, in mono and stereo.
- A take splits at a set length with nothing lost or doubled at the joins. In the app that length is an hour.
- A take is never written over.
- After a crash, `repair()` works the sizes out from the file's real length and drops a frame cut short.
- A full disk stops the take cleanly. Everything written before is kept, and the reason is given.
- A recording process killed outright with SIGKILL keeps everything it had reported flushed, and every sample matches. This one needs a real process, so it doesn't prove a power cut: a pulled plug also depends on the disk's own cache, and that stays a hand test.

## Meters

Our readings against a second tool, FFmpeg, on the same files, on the dev machine:

| | Largest difference |
|---|---|
| Loudness (LUFS) | 0.03 LU |
| Peak | 0.00 dB |
| RMS | 0.00 dB |
| True peak | 0.07 dB, and never low |

- Loudness reads the right value on every case of EBU Tech 3341 that can be built from its description, and the K-weighting filter matches the numbers published in BS.1770 to six places.
- True peak first read up to 0.3 dB low with a small filter, which is the wrong way for a store check. Four times oversampling with 48 taps a phase matches sixteen times oversampling, and costs 0.45 seconds for 20 seconds of sound.
- The noise floor is ours: the quietest half second, in RMS. ACX doesn't define how it measures this, so **the first real ACX submission is the check**, and the figure may need a different window.

## MP3 encoder

`lamejs`, which RT Markdown Reader ships, makes a true constant bit rate: every frame of a ten-minute file is 192 kbps (and 256 kbps in a second run), at 44.1 kHz, the right length, with FFmpeg decoding it with no errors. That meets ACX's format.

- Its normal Node entry point fails ("MPEGMode is not defined"). It only works as the single `lame.min.js` file, which is how Reader loads it, and it's LGPL, so it has to stay a separate file (decision 6).
- Still to do: the same check with LAME 3.100 as WebAssembly, which is the other choice. Both are LGPL.

## Very long files

A waveform summary is built as the sound is read, so memory doesn't grow with the length of the recording. Fifteen minutes took 128 MB at most, and drawing any stretch at any zoom took under 2 milliseconds. The summary is correct at every zoom: no column is ever narrower than the real peaks in it.

The ten-hour run, which proves the memory stays flat, started and was killed when the dev machine restarted. It needs running again.

## Still needs real gear

1. **Two hours of recording** on your own microphone, on Windows, Mac and Linux, counting every sample, with system effects off. It settles whether Electron's own audio is enough, and how many inputs it can see at once.
2. **The microphone on a Mac**, from an unsigned install.
3. A pulled-plug test of the disk, if you want one.

The dev machine now has a virtual sound card, which lets the recording code run end to end, but nothing about real microphones.
