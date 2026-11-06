---
title: Audio Libraries and Their Licences
subtitle: Every library checked, what's allowed and what's refused
author: Recon Towers Dev Department
date: 2026-11-06
tags: [plan, licences]
---

# Audio libraries and their licences

Checked 6 November 2026, from the npm registry, GitHub's licence data, and by opening packages to see what's inside. A package's
label isn't enough: several below say MIT or MPL on the outside and hold LGPL or GPL code. **Check again before adding anything,
and when a version changes.** This is a working record and not legal advice.

**The rule (decision 6):** MIT, BSD, Apache, ISC, MPL and public domain are fine. LGPL only as an unmodified separate file that can
be replaced, listed in the notices, and never bundled into the app's code. GPL and AGPL are refused.

## Will use

| Part | Licence | For |
|---|---|---|
| Electron | MIT (Chromium is BSD-style, and its FFmpeg is LGPL, as in our other apps) | The app |
| ONNX Runtime (`onnxruntime-web`, `onnxruntime-node`) | MIT | Running transcript, voice and noise models |
| Whisper model | MIT at OpenAI. The ONNX copy Reader uses is marked Apache-2.0 | Transcripts. Downloaded, not bundled |
| Mediabunny | MPL-2.0 | Reading imported audio without loading it all. MPL covers its own files only, and we don't change them |
| `@mediabunny/flac-encoder` | MPL-2.0, with libFLAC under Xiph's BSD-style licence | FLAC export. GitHub's page for FLAC shows a document licence, which is wrong for the library. Only libFLAC is used, not the GPL command-line tools |
| `music-metadata` | MIT | Reading tags from imported files |
| libsamplerate | BSD-2-Clause | Changing sample rate for export, such as 48 kHz to 44.1 kHz |
| `fft.js` | MIT | Sound analysis |

## Will use, as a separate file (LGPL)

| Part | Licence | For | Note |
|---|---|---|---|
| LAME 3.100, through `@mediabunny/mp3-encoder` | MPL-2.0 wrapper, **LGPL** encoder | MP3 export | Its README says so. The WebAssembly sits in one bundle, which must stay a file of its own, kept out of the app's bundle and left unpacked, as Reader does with `lame.min.js`. LAME asks for a credit and a link |
| `lamejs` | LGPL-3.0 | Fallback | What Reader uses now. Step zero decides between the two |

## Optional downloads and add-ons

| Part | Licence | For | Note |
|---|---|---|---|
| Supertonic 3 voices | BigScience OpenRAIL-M | Natural voices | **Not open source. It has use restrictions.** Attachment A item (e) forbids putting machine-made content anywhere without saying clearly that it's machine-made. Item (g) forbids impersonating someone. Paragraph 5 says we must require our users to follow these. Downloaded after the person agrees, never bundled |
| DeepFilterNet | MIT or Apache-2.0 | Smart noise removal | First choice. Check the weights' licence again before pinning a version |
| RNNoise | BSD-3-Clause | Smart noise removal, smaller and quicker | Works at 48 kHz only. WebAssembly builds: `@shiguredo/rnnoise-wasm` (Apache-2.0), `@sapphi-red/web-noise-suppressor` (MIT) |
| Silero VAD | MIT | Finding speech in long files, for transcripts | `@ricky0123/vad-web` (ISC) is a ready wrapper |

## Held in reserve

Only if step zero shows they're needed.

| Part | Licence | Would be for |
|---|---|---|
| miniaudio | Public domain or MIT-0, your choice | Native recording, if Electron's isn't enough. It has no ASIO support |
| `audify` (RtAudio) | MIT | Native recording, second choice |
| `naudiodon` (PortAudio) | Apache-2.0 wrapper | Native recording, third choice |
| `node-web-audio-api` | BSD-3-Clause | Native audio graph |
| sherpa-onnx | Apache-2.0 | Faster transcripts |
| whisper.cpp | MIT | Faster transcripts |
| Moonshine | MIT for its current and English models | Quick transcripts. **Its older non-English models are non-commercial.** Use only the MIT ones |
| libebur128, `ebur128-wasm` | MIT, Apache-2.0 | Loudness, if ours falls short. Useful as the second tool to test ours against either way |
| SpeexDSP | BSD-style | Resampling, instead of libsamplerate |
| wavesurfer.js | BSD-3-Clause | Clean, but it isn't built for ten-hour files, so we write our own (decision 13) |

## Refused

| Part | Licence | Why it's on the list |
|---|---|---|
| Rubber Band, `rubberband-web` | **GPL-2.0-or-later** | The obvious time-stretch library. Not needed: pauses are edited by cutting |
| `@ffmpeg/core` | **GPL-2.0-or-later** | The wrapper `@ffmpeg/ffmpeg` says MIT, but it loads this core |
| `ffmpeg-static` | **GPL-3.0-or-later** | Bundles a GPL FFmpeg |
| `@ffmpeg-installer/ffmpeg` | Says LGPL-2.1, but its Windows package says **GPLv3** | Label and content disagree |
| espeak-ng | **GPL-3.0** | The usual way voices turn text into sounds |
| Piper (`piper1-gpl`) | **GPL-3.0** | The older MIT Piper is no longer the live project, and it uses espeak-ng too |
| Kokoro | Apache-2.0, but see the note | Clean on its own, but usually leans on espeak-ng for sounds. Not cleared without a check of the whole chain |
| `whisper-timestamped` | **AGPL-3.0** | The obvious way to get word times from Whisper. Word times get written here instead |
| Audacity, and programs built from it | **GPL** | Never used, and its code is never read for ideas |
| Fraunhofer FDK AAC | Its own licence, with no patent grant | Not open source, and doesn't solve the patent question |

## Not needed, and not cleared

| Part | Licence | Why |
|---|---|---|
| `@mediabunny/aac-encoder` | MPL-2.0 wrapper, FFmpeg's **LGPL** encoder | The copyright is fine under decision 6. The AAC patents are the problem (decision 7) |
| `wasm-media-encoders` | Says MIT, holds **LGPL** LAME | Its label misses what's inside. Mediabunny's package says so openly |
| peaks.js, `waveform-data` | LGPL-3.0 | We write our own waveform |
| libsndfile | LGPL-2.1 | WAV is simple, and FLAC has libFLAC |
| `soundtouchjs` | LGPL-2.1 | Not needed |
| `@soundtouchjs/audio-worklet` | Says MPL-2.0 | SoundTouch itself is LGPL, and it's unclear how much this carries over. Not needed, so not cleared |
| `flac.js` | LGPL | libFLAC through Mediabunny does the job |
| WhisperX, stable-ts | BSD-2-Clause, MIT | Python, so they can't be part of the app. Useful to read for how word timing is done |

## Patents are a separate question

A licence covers copyright, and patents are a different thing.

- **MP3:** the patents have expired.
- **AAC:** the patent pool run by Via LA is still taking licensees in 2026, and says developers of encoder products need a licence.
  On Windows and Mac the app uses the system's own encoder through Chromium. Linux has none, so `.m4b` isn't offered there (decision 7).
- **FLAC, Opus, WAV:** no known problem.

## When adding anything

1. Open the package and look inside. Don't trust the label.
2. Check what it depends on, all the way down. Kokoro and `@ffmpeg/ffmpeg` both look clean at the top.
3. Add it to `THIRD_PARTY_NOTICES.md` and to this page.
