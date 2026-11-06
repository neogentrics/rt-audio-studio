---
title: RT Audio Studio Product Plan
subtitle: What the app is for, and how it does the job its own way
author: Recon Towers Dev Department
date: 2026-11-06
tags: [plan]
---

# Product plan

## What it's for

An author who wants an audiobook today has to learn a recording program, a pile of settings and a store's rulebook, then find
out weeks later that a chapter failed a noise check. A podcaster has the same tools and a different rulebook. RT Audio Studio
puts the whole job in one app, on your own computer, with the rules checked before anything is sent.

It's for any author or podcaster. The owner's own books and shows are what it gets tested on, and nothing about them is built in.

## What a finished job looks like

**An audiobook.** Open the book and its chapters come across from RT Story Tracker. Read from the page, and press a key when
you stumble. Go back through your marks and retake those sentences. Clean up with your saved recipe. Run the check against the
book, and fix what doesn't match. Run the store check. Export the files, and keep the release sheet.

**A podcast.** Start an episode from the show's template. Record, with guests in the room or their files sent in. Line up the
tracks, cut by reading the transcript, and export the episode pack. Upload it to your host, as you do now.

## How it does the job its own way

Sound editors are built around the waveform, because they started with tape. People making a book or a show think in words and
chapters. Three ideas come from that, and they're what makes this app its own.

**1. The page beside the sound.** The script is the main thing on screen. Sentences know where their sound is, and marks made
while recording appear in the text. A mistake is found by reading and fixed by choosing a sentence. The waveform is there when
you want it, and the page is how you get around.

**2. Takes, never overwrites.** Nothing recorded is ever changed. Every retake is kept, every cut and effect is a line in a list
on top, and a file is only made when you export. So nothing is ever really deleted by accident, a whole book can be remade with a
better recipe, and a store's new rule doesn't mean recording again.

**3. A sheet that accounts for every second.** Every second of a finished book can say where it came from: which take, whose
voice, and whether a machine made it. The release sheet shows that for each chapter, beside every check. It's what stops a
machine voice reaching a store that wants a human, and it's a record you can keep with the book.

The app does these jobs without copying another product's screens, workflow or names. No GPL program's code is read or copied.

## What's in the box, and what's a download

| Part | How you get it | Needs AI? |
|---|---|---|
| Recording, editing, room tone, EQ, compression, noise reduction from room tone, loudness | In the app | No |
| Store checks, chapters, release sheet, export | In the app | No |
| Transcripts and the check against the book | An optional download, Whisper | A local model, off until asked for |
| Smart noise removal | An optional download | A local model, off until asked for |
| Natural voices | An optional download, the same one Reader uses | A local model, off until asked for |
| Writing help, outside voice services | Add-ons with your own service | Yes, off until turned on |

## Who does what in the suite

The short version is in [working with the suite](design/working-with-the-suite.md). The manuscript and the dictionary stay in
RT Story Tracker. Sending to blogs and wikis stays in RT Markdown Reader. RT Author Desk records what was made. This app owns the
audio masters and the episodes.

## What could go wrong

| Risk | What the plan does about it |
|---|---|
| Electron can't record well enough | Step zero tests it first, on real gear. If not, a native part using miniaudio, which is public domain or MIT-0 |
| Mac won't allow the microphone in an unsigned app | Step zero tests it. If it fails, the Mac build needs signing before 1.0 |
| Transcripts are too slow in WebAssembly | Step zero times it. ONNX Runtime's native engine is MIT, and is the fallback |
| A store changes its rules | Rules are dated data, shown with their source, and checked at every release |
| Our readings disagree with a store's | Meters are tested against published test files, and the app never promises acceptance. A real ACX submission is the final proof of v1.5 |
| Heavy cleanup makes a voice sound unnatural | Gentle by default, with before and after always one key away |
| It's the slow project, and might stop at any release | Every release is finished and useful alone, and a project is ordinary files |
