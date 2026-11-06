---
title: Projects and Recording Safety
subtitle: How a project is stored, and why a recording can't be lost
author: Recon Towers Dev Department
date: 2026-11-06
tags: [plan, design]
---

# Projects and recording safety

## A project is a folder

Decision 8: a project is an ordinary folder you can open, copy and back up. If the app were gone tomorrow, your recordings would
still be ordinary audio files.

```text
My Book.rtaudio/
  project.json          what's in the project: chapters, takes, settings
  edits/                the list of edits for each chapter, one small file each
  takes/                every recording, as ordinary WAV files, never changed
  imported/             files brought in, copied untouched
  cache/                waveform pictures and the like, safe to delete
  exports/              what you've made
```

The folder's name ends in `.rtaudio`, so the system can open it in the app. Names here are a proposal, and step zero settles them.

**Keep it out of synced folders while recording.** Cloud sync can lock files mid-take. The app warns about a project in a known synced folder.

## Takes

- Each take is recorded as it comes from the microphone, at its own sample rate, with no processing. Files are WAV, split at an hour so no file nears the format's 4 GB limit, and joined again by the app.
- A take is written once and never touched again.
- Space: an hour of mono at 48 kHz in 32-bit is about 690 MB, and 24-bit about 520 MB. A book's raw takes can pass 20 GB, so the app shows what's left and warns early.

## Why a recording can't be lost

| What goes wrong | What happens |
|---|---|
| The app crashes or the power goes | Sound is flushed to disk about once a second. On reopening, the app finds the unfinished take, repairs its header from the file's real length, and offers it back |
| The disk fills up | The app watches free space, warns early, then stops the take cleanly, keeping all of it |
| The microphone is unplugged | The take stops and is kept, and the app says what happened |
| The computer tries to sleep | It's kept awake while recording |
| The app falls behind | Dropped sound is counted and shown, never hidden. Step zero's job is to make this number zero |

Recording runs apart from the screen, so a busy window can't drop sound. The window only ever shows what's happening.

## Edits

An edit is a line in a list: use this piece of this take, here, with these effects. Each change is saved at once, so closing the
app loses nothing and undo survives closing it. A finished file is made only on export, and can be made again at any time from
the same list. That's what "takes, never overwrites" means in practice.

Effects run in a fixed order, so the same project always gives the same file. Tests hold the app to this.

## The one disk layer

All reading and writing goes through one small module (step zero). That's what lets v1.14 add a lock without a rewrite. It also
keeps the safety rules above in one place, and the tests can fail the disk on purpose.

## The lock, in v1.14

Audio is encrypted in blocks of about a megabyte, each with its own check, so long files can still seek and play. The password
scheme and recovery key follow RT Story Tracker's rules, and its design is read before this is built.

## Getting your work out

- Every recording is an ordinary WAV file in `takes/`.
- `project.json` and the edit lists are readable text.
- Export needs no internet, no account and nothing from anyone else.
