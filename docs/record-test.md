---
title: The Recording Test
subtitle: Two hours on your own microphone, on each system
author: Recon Towers Dev Department
date: 2026-11-20
tags: [step-zero, test]
---

# The recording test

Step zero asks one question the dev machine can't answer: is Electron's own audio good enough to record a book with? Two hours on a real microphone, on each system you have, settles it. It also shows how many input channels Chromium sees on your interface.

This isn't the app. It's a small window that records through the same take writer the app will use, with every effect Chromium adds turned off, then checks the file for dropped sound.

## What you need

- The microphone or interface you really record with.
- About 3 GB free per hour for a stereo take at 48 kHz (a mono take is half that). The recording is deleted afterwards unless you tick *Keep the recording*.
- The computer plugged in, and allowed to stay awake. The test asks the system not to sleep, but a laptop on battery may still do it.
- Node 22 or later, and Git, already installed. The repo is private, so you need to be signed in to GitHub.

## Steps

**Windows** (in PowerShell):

```powershell
cd "E:\Github Projects\rt-audio-studio"
git pull
npm install
npm run record-test
```

**Mac and Linux:**

```bash
git clone https://github.com/neogentrics/rt-audio-studio.git
cd rt-audio-studio
npm install
npm run record-test
```

On a Mac, the first run asks for permission to use the microphone. If it was refused earlier, turn it on under *System Settings → Privacy & Security → Microphone* for your terminal, then run it again.

Then, in the window:

1. Choose your microphone. *Channels* is set to the most Chromium can see. Write down that number: it's one of the answers we need.
2. Leave *Minutes* at 120 and press **Start recording**.
3. Leave it alone for two hours. Speak or play sound every few minutes, so a dropout shows up as a gap. Don't put the computer to sleep, and use it as you normally would while recording: browse, play a video, run something heavy for a few minutes. That's when dropped sound happens.
4. When it finishes it shows a report. It starts with **CLEAN** or **PROBLEMS**. Copy the report, or send the file it names, back to the session. Do this on each system you have.

A quick try first is a good idea: set *Minutes* to 2, record, and check the report says **CLEAN**.

## Reading the report

| Line | Means |
|---|---|
| `channelsSeenByChromium` | How many inputs Chromium could see on this device. Fewer than your interface really has means a native audio part is needed |
| `shortfallPercent` | Sound that's missing, against the clock. Under 0.1% is fine. A few seconds missing from two hours is a problem |
| `arrivalGapsOver400ms` | Times a whole piece of sound arrived late or never |
| `longestSilenceMs` | The longest stretch of exact digital silence. A live microphone has noise, so more than 100 ms usually means dropped sound. (With the fake microphone used in automatic checks this is expected, because it plays beeps with silence between.) |
| `stoppedEarly` | Set if the take stopped itself, for example a full disk |

## The pulled-plug test (optional)

To check that a killed recording keeps its sound: tick *Keep the recording*, start a recording, wait a few minutes, then end the app from Task Manager (or `kill -9`) instead of pressing *Stop*. Then:

```bash
node scripts/repair-take.cjs "<the .wav file it left behind>"
```

It says how many seconds it kept. It should be within a second or two of how long you recorded. A real power cut also depends on the disk's own cache, so pulling the plug is the only way to test that, and only if you want to.

## If it can't start

- *The system refused the microphone:* allow it in the system's settings, then run it again.
- *Chromium sees only 2 channels on a bigger interface:* that's a result, not a fault. Write it down.
- *It records but the level bar doesn't move:* the wrong device is chosen, or a hardware mute is on.
