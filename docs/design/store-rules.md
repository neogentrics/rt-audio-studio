---
title: Store and Podcast Rules
subtitle: The published numbers, where they came from, and what's unconfirmed
author: Recon Towers Dev Department
date: 2026-11-06
tags: [plan, stores]
---

# Store and podcast rules

What the v1.5 checks are built from. Only figures read on the store's own page are marked confirmed. Everything is checked again
before v1.5 is built, because stores change their rules. The app shows each rule's source and date, and never says a store will
accept a book: stores also have people listening.

## ACX (Audible)

**Confirmed from [ACX's requirements](https://help.acx.com/s/article/acx-audio-submission-requirements), dated 15 April 2026.**

| Rule | Value |
|---|---|
| Volume | Between −23 dB and −18 dB RMS |
| Peaks | Less than −3 dB |
| Noise floor | Less than −60 dB RMS |
| Room tone | 1 to 5 seconds recommended at each end of a file, and spacing must not exceed 5 seconds |
| Channels | All files the same: all mono or all stereo |
| Format | MP3, 192 kbps or higher, constant bit rate, 44.1 kHz |
| File length | No more than 120 minutes |
| Layout | One chapter or section per file, with opening and closing credits as their own files |
| Retail sample | 5 minutes or less, and the first five minutes are recommended |
| Opening credits | Title, author and narrator |
| Closing credits | "You have been listening to…", the credits again, then "The End" |
| **Narration** | **Must be human unless otherwise authorised. Unauthorised text-to-speech, AI or automated recordings are prohibited** |

The noise floor is the level in the silence between phrases. How we measure it gets written down in step zero, and tested.

## Voices by INaudio (was Findaway Voices)

**Partly confirmed.** Its [digital narration page](https://voicessupport.inaudio.com/en/articles/3219456) was read on 6 November 2026.

- AI narration, text-to-speech and cloned voices count as digital voice narration, **even a clone of your own voice**.
- Only unmodified packages from **Google Play Books, ElevenLabs and Spoken Press** are accepted. Audio from anyone else can't be submitted, which includes Reader's natural voices.
- It has to be declared as digital narration, and the platform adds a note to the description.
- Those titles go only to partners who accept them.

**Not confirmed:** the [audio requirements page](https://voices.inaudio.com/technical-requirements-for-assets) wouldn't load in a form we could read. It needs reading in a browser before v1.5. Other sites say the same 192 kbps constant bit rate at 44.1 kHz, and its support pages confirm constant bit rate is required.

## Apple Books

**Confirmed from [Apple's audiobook specification](https://help.apple.com/itc/audiobooksspec/en.lproj/static.html), version 5.3.5, December 2024.**

| Rule | Value |
|---|---|
| Sound | 22.05 kHz and 16-bit or better, up to 96 kHz at 24-bit |
| Formats | WAV (2 GB at most), CAF, M4A, FLAC or MP3. Apple prefers the others to MP3 |
| Bit rate | The same throughout a track |
| Tracks | Under 23 hours each, at most 25, and at least 60 minutes each if there are several |
| Chapters | Mustn't cross from one track to the next |
| Cover | JPEG or PNG, RGB, at least 3000 × 3000, square |

This wants a very different layout from ACX: a few long tracks, not one file per chapter. Export has to handle both. How an author reaches Apple, directly or through a distributor, needs checking before v1.5.

## Google Play Books and Kobo

**Not confirmed.** No official figures were found on 6 November 2026, and blogs disagree. Their profiles wait until the rules are read at the source. Kobo's own page says you ask its team for the audiobook tab first.

## Machine voices, in short

| Where | Natural voices | Hired or your own voice |
|---|---|---|
| ACX | No | Yes |
| Voices by INaudio | No, only three named providers | Yes |
| Your own site, or direct to listeners | Yes, labelled | Yes |
| Apple Books, Google Play, Kobo | Unconfirmed | Yes |

Whatever a store says, the voices' licence requires saying the audio is machine-made. See [audio libraries](audio-libraries.md).

## Podcasts

**Confirmed from [Apple Podcasts' audio requirements](https://podcasters.apple.com/support/893-audio-requirements).**

| Rule | Value |
|---|---|
| Loudness | About −16 LKFS, plus or minus 1 dB, measured to ITU-R BS.1770-5 |
| True peak | No higher than −1 dB FS |
| Files for upload | WAV, FLAC or MP3. A one-channel WAV or FLAC is rejected: mono is sent as two identical channels |
| MP3 at least | Mono 44.1 kHz at 32 kbps, stereo at 64 kbps |
| MP3 recommended | Mono 96 to 128 kbps, stereo 128 to 256 kbps |
| In an RSS feed | MP3 or AAC |

Other sites suggest −19 LUFS for mono, and differ on Spotify. Those aren't confirmed, so the app offers Apple's figures and lets you set your own target.

**Confirmed from the [Podcast Namespace](https://github.com/Podcastindex-org/podcast-namespace).**

- Transcript tag: WebVTT is recommended, and HTML, JSON and SRT are also allowed. SRT is limited to 2 lines of 32 characters.
- Chapters tag: a JSON file, with `version` and `chapters`, where each chapter needs `startTime` in seconds and may have a title, picture and link.

The owner's shows are hosted on RSS.com. Whether it passes these tags through to the feed needs checking before v1.12.
