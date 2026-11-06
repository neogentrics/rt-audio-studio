---
title: What RT Markdown Reader Gives Us
subtitle: Its audio code, what carries over, and what has to change
author: Recon Towers Dev Department
date: 2026-11-06
tags: [plan, reuse]
---

# What RT Markdown Reader gives us

Read from Reader 3.10.0. Reader's audio was made to read a document aloud, and this app makes files for sale, so most of it
carries over and some of it falls short. Copied files note the Reader version they came from (decision 14).

| Reader's file | What it does | How it carries over | What has to change |
|---|---|---|---|
| `src/main/voices.js` | Pinned, checksummed model downloads, a worker process, idle shutdown | **As it is.** `VoiceStore` is already general: dictation builds on it, and so will every model here | Nothing |
| `src/main/supertonic.js`, `voice-text.js`, `voice-worker.js` | The natural voices, at 44.1 kHz mono | **With changes** | Each read starts from random noise, so the same sentence differs every time. A book needs a saved seed for each sentence, so one fix doesn't change the rest. Long sentences are joined with a fixed 0.15 second gap |
| `src/main/pronounce.js`, `applyPronunciation` | A list of word and how to say it, spelled out | **As it is**, for the voices | The model reads letters, and has no way to take phonetic symbols. So the dictionary has to give a respelling for the voices, and a human narrator wants more (see [the suite](working-with-the-suite.md)) |
| `src/renderer/m4b.js` | Writes `.m4b` by hand, with chapters for Apple and other players | **With changes** | It's mono only, with no cover, narrator or series. The tool's name is fixed as Reader. Chapters stop at 255 in the second chapter list |
| `id3()` in the same file | A small MP3 tag | **Replaced** | Title and author only. Podcasts need chapter frames and a cover |
| `src/renderer/audio-ui.js` | Export in the background, written to disk in pieces | **The method**, not the file | MP3 is fixed at mono 64 kbps, well under ACX's 192 kbps minimum, and AAC at 96 kbps. The screen around it is Reader's |
| `lamejs` | MP3 encoding | **Perhaps replaced** | Step zero compares it with real LAME 3.100 |
| `src/main/whisper.js`, `dictation.js`, `dictate-worker.js` | Offline Whisper | **The base only** | This is the biggest gap. See below |
| `src/main/ai-providers.js` | AI services, including local models | **As it is**, for v1.16 | Nothing |
| `src/main/app-link.js` | App Link | **As it is**, with a new id | Add the suite's additions. See [the suite](working-with-the-suite.md) |
| Themes and fonts | The look | **As it is** | Nothing |

## What Whisper needs for long recordings

Reader's Whisper is built for dictating a sentence. For a ten-hour book:

- **It stops at 30 seconds.** Long files have to be split where someone isn't speaking, which is what Silero VAD is for.
- **It gives no times.** The code asks the model for no timestamps, and every feature from v1.8 on needs a time on every word.
- **Its sound step is slow.** It works out frequencies the direct way, with no FFT. That's fine for a sentence and far too slow for a book.
- **It's the small model.** `whisper-base` at about 80 MB is fine for dictating. Invented names and a check against the book need better. The `whisper-small` int8 files are about 250 MB, and `large-v3-turbo` at 4-bit about 760 MB. Step zero times them.
- **It takes no hints.** Names can't be passed to the model yet, which v1.11 needs.
- **It runs on WebAssembly, with up to four threads.** Native ONNX Runtime may be much quicker, and step zero measures that.

## What Reader doesn't have at all

Recording to disk, meters, a waveform, editing, sound cleanup, resampling, FLAC, multi-track, store checks. Reader's microphone use
is only for dictation, so recording here starts from nothing.
