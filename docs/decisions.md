---
title: RT Audio Studio Decisions
subtitle: What's settled and what's waiting for the owner
author: Recon Towers Dev Department
date: 2026-11-06
tags: [plan, decisions]
---

# Decisions

## Chosen by the owner, 6 November 2026

### 1. What the app is

✅ **Chosen 6 November 2026:** Recording, editing, cleanup, chapter markers, checks against audiobook store rules, local transcripts and finished files, for audiobooks and podcasts. Small releases that each stand alone, because this is the slow project.

### 2. Who narrates

✅ **Chosen 6 November 2026:** All of them: the owner's own voice, natural voices for drafts and for books that can use them, hired narrators, and voice services. His words: the more options available the better. The app tracks which seconds came from a machine, because ACX requires a human unless authorised, Voices by INaudio takes only three named AI providers, and the voices' licence requires saying the audio is machine-made. Recommended first was the same without hired narrators.

### 3. Podcast guests

✅ **Chosen 6 November 2026:** Recorded on one computer, or a remote guest records their side and sends the file. Live call-in guests come later, as he added afterwards, which is v1.18. No call goes through a Recon Towers server.

### 4. Recording gear

✅ **Chosen 6 November 2026:** Not sure or changing, so the plan covers the widest case: Electron's own audio first, and a native part only if step zero shows it's needed. Step zero runs on whatever he has at the time.

### 5. Order of releases

✅ **Chosen 6 November 2026:** Take turns. 1.0 to 1.2 are shared, then audiobook and podcast releases alternate. *Audiobooks first* was recommended, because the store work is what no other app covers. Taking turns moves both, each more slowly.

### 6. LGPL parts

✅ **Chosen 6 November 2026:** Allowed as Reader does it: unmodified, in a separate file that can be replaced, listed in the notices, and never bundled into the app's code. In practice that's LAME for MP3. No GPL or AGPL, ever.

### 7. Audiobook files on Linux

✅ **Chosen 6 November 2026:** MP3 and FLAC on Linux, as Reader does today. Every store file works on all three systems. Only `.m4b` is missing on Linux, because the AAC patent pool is still active and Linux has no licensed encoder built in. It can be looked at again with legal advice.

### 8. Encryption

✅ **Chosen 6 November 2026:** A project is a plain folder of ordinary audio files, with an optional password lock in v1.14. All disk access goes through one layer from the start, so the lock isn't a rewrite. This is the one app in the suite that isn't encrypted by default, and the README should say so when it's released.

## Approved with the plan, 17 November 2026

These were recommendations the plan followed. He approved the plan, and with it these. Any can still be changed.

### 9. Built the same way as the other apps

✅ **Chosen 17 November 2026:** Electron, so Reader's voices, export and Whisper work carry over, and so do the release process, themes and App Link. The risk is recording, which step zero tests first.

### 10. Numbered from 1.0

✅ **Chosen 17 November 2026:** The suite's pattern, from this app's own first version, as RT Author Desk does.

### 11. Three ideas that make this our own way of doing the job

✅ **Chosen 17 November 2026:** The page beside the sound, takes that are never overwritten, and a release sheet that accounts for every second. See the [product plan](product-plan.md#how-it-does-the-job-its-own-way).

### 12. Plain sound processing is built in, and models are downloads

✅ **Chosen 17 November 2026:** Noise reduction, EQ and loudness are our own code and need nothing else. Transcripts and smart noise removal are optional downloads, so the app is complete without any model.

### 13. Our own waveform and meters

✅ **Chosen 17 November 2026:** Written here instead of taken from a library. The BSD-licensed waveform library loads a whole file at once, the free alternatives are LGPL, and a ten-hour recording needs its own approach. Loudness is a published standard and short enough to write and test.

### 14. Reader's audio code is copied, not shared as a package

✅ **Chosen 17 November 2026:** The suite's rule for now. Each copied file notes the Reader version it came from, so a fix can be carried across.

### 15. Store rules are dated data

✅ **Chosen 17 November 2026:** Each rule sits in a table you can see, with where it came from and when it was checked, as RT Author Desk does for royalty rates. The app never says a store will accept a book.

### 16. Free, proprietary and private for now

✅ **Chosen 17 November 2026:** Same terms as the other apps: free to use, under the proprietary licence. The repo is private while it's a plan, as you asked, so the Bench page has no repo link until it goes public.

## Added after the plan

### 17. Google Play Books

✅ **Chosen 6 November 2026:** Google Play Books is an export target beside ACX. He sells his books there, and Google's own audiobooks of them use a generic synthesized voice. He wants better editions to replace them. See [store rules](design/store-rules.md#google-play-books).

### 18. Consent for a voice of your own

✅ **Chosen 17 November 2026:** Spoken, live in the app. The person reads a consent sentence and a random passage into the microphone, even when it's him, and that reading is what makes the voice. Clips from files are refused, and consent can be withdrawn. Recommended, and chosen over *your own voice only*, a *signed permission file*, or *no cloning*.

### 19. Rights before re-use

✅ **Chosen 17 November 2026:** A book records who narrated it and under what deal, and a title on an ACX exclusive deal is held back from other stores until he confirms the deal allows it. ACX's exclusive term is seven years.

### 20. Suite-wide rules

✅ **Chosen 18 November 2026:** taken on from the suite plan in RT Markdown Reader's `docs/app-suite.md`: the installed file, the apps status indicator and its panel, and updates and compatibility. They are in v1.0 and v1.7 of the [roadmap](../ROADMAP.md). Research clips from Recon Browser aren't needed here.

### 21. When this repo goes public

Waiting for the owner. This app is a private repo, so it can't be listed in the suite's `versions.json` or offered as a store download. He's deciding whether each private app's repo becomes public at its first public release. The plan assumes it might, and nothing here changes the repo's visibility.

### 22. Look and feel

✅ **Chosen 19 November 2026:** one look and feel across the suite, with RT Markdown Reader as the reference (its `docs/app-suite.md`, "Look and feel in every app"). It's in v1.0 of the [roadmap](../ROADMAP.md), so the first real release feels like the rest of the suite. Languages move into v1.0 too, because the standard asks for them. Reader's *Metallic* finish and adjustable toolbar are copied when Reader 3.13 ships them. A recording screen has no use for some of it, such as the document commands in File, and where that's so the app builds the small version and says so.
