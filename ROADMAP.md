---
title: RT Audio Studio Roadmap
subtitle: Audiobooks and podcasts, made on your own computer
author: Recon Towers Dev Department
date: 2026-11-06
tags: [roadmap, planning]
---

# Roadmap

RT Audio Studio is where audiobooks and podcasts are recorded and finished. This is the slow project of the suite, worked on
in the background, so every release is small and useful by itself: if work stops after any of them, what's there still does
a real job. The owner approved this plan on 17 November 2026, and step zero is under way. The reasons are in the
[product plan](docs/product-plan.md), and the choices are in [decisions](docs/decisions.md).

> [!TIP]
> This file is written in Markdown, so it looks best opened in RT Markdown Reader.

**Legend:** 🙋 requested by the owner · 🛡️ needs a permission step · Size: **S** ≈ a day, **M** ≈ a few days, **L** ≈ a week or more

**Version numbers:** new features are 1.x releases (1.9 is followed by 1.10, 1.11…). The next major version, 2.0, is kept for
a change as big as a new kind of project.

**The order:** 1.0 to 1.2 are shared by books and shows. After that, audiobook and podcast releases take turns (decision 5).

**Every release must:** install on a clean computer with nothing else set up, update from the release before it without
losing anything, and pass its automated tests on Windows, Mac and Linux.

| Release | Theme | Status |
|---|---|---|
| [Step zero](#step-zero--prove-the-hard-parts) | Prove the hard parts | 🚧 Partly done, paused until the owner says start |
| [v1.0](#v10--record) | Record | Planned |
| [v1.1](#v11--edit) | Edit | Planned |
| [v1.2](#v12--clean-up) | Clean up | Planned |
| [v1.3](#v13--a-book-in-chapters) | A book in chapters | Planned |
| [v1.4](#v14--a-show-in-episodes) | A show in episodes | Planned |
| [v1.5](#v15--store-checks) | Store checks | Planned |
| [v1.6](#v16--more-than-one-voice) | More than one voice | Planned |
| [v1.7](#v17--the-page) | The page | Planned |
| [v1.8](#v18--local-transcripts) | Local transcripts | Planned |
| [v1.9](#v19--check-it-against-the-book) | Check it against the book | Planned |
| [v1.10](#v110--edit-by-the-words) | Edit by the words | Planned |
| [v1.11](#v111--names-said-right) | Names said right | Planned |
| [v1.12](#v112--send-it-on) | Send it on | Planned |
| [v1.13](#v113--natural-voices) | Natural voices | Planned |
| [v1.14](#v114--lock-a-project) | Lock a project | Planned |
| [v1.15](#v115--hired-narrators) | Hired narrators | Planned |
| [v1.16](#v116--ai-add-ons) | AI add-ons | Planned |
| [v1.17](#v117--a-voice-of-your-own) | A voice of your own | Planned |
| [v1.18](#v118--call-in-guests) | Call-in guests | Planned |
| [Later](#later--only-if-needed) | Only if needed | Ideas |
| [Ongoing](#ongoing--polish--distribution) | Polish & distribution | Ongoing |

## Step zero — Prove the hard parts

Not a release. Recording that can't lose a word is the whole promise, so the risky parts are tested before anything is built on them.

| Task | Size | Details |
|---|:-:|---|
| ✅ Project setup | M | The app in this repo, with tests, CI on all three systems and a clean README, built the way RT Story Tracker is. **Done:** an empty app that starts, 18 tests, and CI that passes on all three systems. |
| Recording test | L | Two hours of recording on Windows, Mac and Linux with the owner's own gear, with every system effect off, counting every sample. It settles whether Electron's own audio is enough or a native part is needed, and how many inputs it can see at once. |
| Microphone on an unsigned Mac app | S | Releases aren't signed on Mac yet. Prove that macOS still lets the app use the microphone after installing from the DMG. |
| Very long files | M | Scroll and zoom a ten-hour recording smoothly, with memory use that stays flat. **Half done:** the waveform summary works and drawing takes under 2 ms at any zoom. A fifteen-minute run used 128 MB at most, and the ten-hour run was cut short by a restart of the dev machine. |
| Transcript speed | M | Time one hour of speech with Reader's WebAssembly engine against the native engine, at three model sizes, on a normal laptop. It settles what v1.8 uses. |
| MP3 encoder | S | Compare the real LAME 3.100 as WebAssembly with Reader's `lamejs`, at a true 192 kbps constant bit rate and 44.1 kHz. Check the result with a separate tool. **Half done:** `lamejs` makes a true constant 192 and 256 kbps at 44.1 kHz with no decode errors. LAME as WebAssembly is still to compare. |
| ✅ Meters | S | Our RMS, peak, noise floor and loudness readings, tested against published test files and a second tool, so the numbers can be trusted before anything depends on them. **Done:** loudness within 0.03 LU of FFmpeg, peak and RMS exact, true peak within 0.07 dB and never low. The noise floor has no published standard, so the first real ACX submission checks it. |
| ✅ One way to reach the disk | S | Every read and write goes through one layer from the first line, so the project lock in v1.14 isn't a rewrite. **Done:** takes are written through it, never over an existing file, and the tests make the disk fail on purpose. |

**Test:** a written result for each one, with the numbers. A failed test changes the plan, and the owner hears about it before 1.0 starts.

## v1.0 — Record

🙋 Record a take and get a file out. Useful for a book chapter or a whole episode from day one.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Recording that can't be lost | L | Sound goes to disk as you speak. A crash, a full disk or a pulled cable keeps everything up to that moment, and the app stops safely and says why. The computer won't sleep during a take. |
| Projects and takes | M | A project is an ordinary folder of ordinary audio files. Every take is kept, named and dated. |
| Choose your microphone | S | Pick the input, see its level, and get a warning before a take if it's too quiet or clipping. |
| Meters and waveform | M | Live levels, and a waveform that keeps up with hours of sound. |
| Listen back | S | Play, skip and jump by keyboard, through the speakers or headset you choose. |
| 🙋 Finished files | M | Export WAV, FLAC or MP3 on all three systems. MP3 is true constant bit rate, up to 320 kbps. |
| Bring in audio | S | Open WAV, FLAC, MP3 and M4A as a take. |
| 🙋 Looks like the rest of the suite | L | RT Markdown Reader is the reference, and its wording and layout are copied. Short File, Edit, View and Help menus, with rarely used commands in submenus and every command available by name from `Ctrl+K`. Help in the suite's order: *Help Center* (`F1`), *Tutorial*, *Check for Updates…*, *About RT Audio Studio <version>*. A Help Center of searchable Markdown guides, and a hands-on tutorial with a practice take, offered the first time and replayable. An About window with the icon, version, *Website*, *What's new*, *Report a problem*, *Source code*, a *Copy details* line, and the *License* and *Open-source notices* links. One Preferences window (`Ctrl+,`). The shared themes plus *Glass*, *Colour-safe* and *Customize Theme*, with the theme button on the main screen, and the shared fonts. Reader is adding a *Metallic* finish as a third look beside *Solid* and *Glass* (Reader 3.13, built and in testing, not released), and this app copies it once it ships, along with the adjustable toolbar (hide, reorder, shrink). An icon toolbar with names on hover, and self-update with *Restart to update* where the system allows it. |
| 🙋 Checked for access and languages | M | Every button has a name, every theme passes WCAG AA contrast, Windows high contrast works, and everything can be done from the keyboard, all checked by tests. The app's words live in one table per feature, with Spanish, French and German and right-to-left layouts, and product names marked so they aren't translated. |
| App Link: off until you turn it on | S | The suite's linking rules, as in v1.7. |
| 🙋 Installed file | S | On first run and after each update, the app writes `installed/rt-audio-studio.json` (id, name, version, launch path and App Link version) in the App Link folder, and removes it when it's uninstalled. This is what lets the other apps find it. |

**Test:** record two hours and force the app to close during it. It reopens with everything but the last second. Fill the disk during a take and nothing recorded so far is lost. The menu, contrast and button-name checks run in the tests on all three systems, and the File menu stays within the suite's cap of 20 items.

## v1.1 — Edit

🙋 Fix a take without touching the recording.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Cuts that change nothing | L | Cut, delete, move and trim as a list of edits on top of the recording. Undo goes back as far as the project does, even after closing it. |
| Retakes | M | Stop at a mistake, go back a sentence, and carry on. The new take drops in, and the old one stays one click away. |
| Mark as you go | S | One key marks a mistake while you're recording, so you don't stop reading. The marks become a to-do list afterwards. |
| Fades and joins | S | Every cut gets a tiny fade so it can't click, and you can change it. |
| Room tone | M | Record the sound of your empty room once, and use it to fill any gap, so silence never drops to nothing. |
| Pauses | S | Find long pauses and set them to a length you choose, one at a time or all together. |

**Test:** make 200 edits on a long take, close and reopen, undo them all, and the file matches the original bit for bit.

## v1.2 — Clean up

🙋 Sound better, in ways that can always be undone. All of this is ordinary sound processing with no AI, so it's in the app with nothing to download.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Noise reduction | L | Learns your room from its own room tone and removes it gently. Hear before and after at any moment. |
| 🙋 Hum, clicks and pops | M | Takes out mains hum, mouth clicks and the thump of a P or B. |
| 🙋 Tone and evenness | M | A simple EQ, a compressor, softer S sounds, and a limiter, in that order. |
| 🙋 Loudness | M | Bring a whole chapter or episode to a target level. Peaks stay under the limit, and the reading shows RMS and LUFS. |
| Recipes | S | Save your settings as a recipe and use them on every chapter, so a whole book sounds the same. |
| 🛡️ Smart noise removal | M | An optional download for rooms that need more: a neural noise remover running on your computer. The app says how big it is and what licence it has first. |

**Test:** the same chapter, cleaned and exported, comes out identical twice. Removing every effect gives back the original.

## v1.3 — A book in chapters

🙋 The first audiobook release: a book made of chapters, with its files laid out properly.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Chapter list | M | A book holds chapters, in order, each with its own takes and edits. Drag them, rename them, and see the running time. |
| 🙋 Chapter markers | M | Mark chapter starts inside a long recording, and split or join them. |
| Credits and sample | M | Opening and closing credits as their own sections, and a retail sample of five minutes or less. The app reminds you what they have to say. |
| One file per chapter | S | Export a folder of numbered files, with room tone at the start and end of each. |
| 🙋 Audiobook file | M | One `.m4b` with chapters, a cover, and title, author and narrator. Windows and Mac only, and on Linux the app says why (decision 7). |
| Tags and cover | S | Title, author, narrator, series and cover, written into every file. |

**Test:** a ten-chapter book exported as chapter files and as an `.m4b` opens with the right chapter names and times in three different players.

## v1.4 — A show in episodes

🙋 The first podcast release: an episode with your show's sound around it.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Shows and episodes | M | A show keeps its name, cover, intro, outro and recipe. A new episode starts with all of it in place. |
| Music under speech | M | Intro and outro music that fades under your voice by itself, with the fade yours to change. |
| Episode loudness | S | The level Apple Podcasts asks for, with the true peak limit, for mono or stereo. |
| 🙋 MP3 chapters and tags | M | Chapters, cover and notes inside the MP3, so they show in podcast players. |
| Show notes | S | A plain notes page beside each episode, with chapter times you can copy. |

**Test:** an episode made from a template plays in two podcast apps with its chapters, and passes a separate loudness tool.

## v1.5 — Store checks

🙋 Know a book will pass before you send it. This is what the app is most careful about, so it's a release of its own.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Check against a store | L | Volume, peaks, noise floor, format, sample rate, file length, room tone and matching channels, for each file, with the exact place that fails. |
| 🙋 Store profiles | M | ACX and Google Play Books first, the two the owner uses, then Apple Books and Voices by INaudio, and Kobo once its rules are confirmed. Each rule shows where it came from and when it was checked. |
| 🙋 Replace a Google audiobook | M | Make a better edition of a book Google narrated with its own voice: a complete set of files named the way Google asks, at its quality, marked *Human narrator* or *Synthesized voice*. Tried on one book first. |
| 🙋 Rights check | S | Each book records who narrated it and under what deal. A title on an ACX exclusive deal, which runs seven years, is held back from other stores until you confirm the deal allows it. |
| Fix what's safe | M | Offers the fix when it's safe, such as level or room tone. Never changes anything by itself, and says so when the answer is to record again. |
| The release sheet | M | One page for the book: every chapter, every check, who narrated it, and which stores it can go to. Save it with the book. |
| Export for a store | S | One step makes the files the way that store wants them, with the right names, format and layout. |

**Test:** a set of test chapters, each failing one rule on purpose, is caught with the right time. A clean book passes, and a real ACX submission and one replaced Google audiobook are the final proof.

## v1.6 — More than one voice

🙋 Guests, in the room or sent in by file.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Several microphones | L | Record two or more people on one computer, each on their own track. How many depends on what step zero finds. |
| 🙋 Guests' files | M | Bring in the file a remote guest recorded on their side. |
| Line up the tracks | M | Finds where the tracks match and lines them up, even if one clock ran a little fast. |
| A guest's guide | S | A short page to send a guest: how to record their side and what to send back. |
| Track levels | M | Level, cleanup and mute for each person, so a quiet guest matches you. |

**Test:** two recordings of the same talk, started at different times on different computers, line up within a few milliseconds and stay there for an hour.

## v1.7 — The page

🙋 The heart of how this app works: the words sit beside the sound.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Script beside the sound | L | Read from the page while you record. The current chapter's words stay on screen, in the size you choose, and the page turns with you. |
| 🙋 A chapter from RT Story Tracker | M | Send a chapter across App Link, or open a Markdown, text or Word file. This works with Story Tracker as it is today. |
| 🙋 Recordings you already have | M | Bring in a narration made before, by you or a narrator whose rights you hold, and follow it on the page as if it had been recorded here. |
| Marks on the page | M | Marks you made while recording appear in the text, so you see where to go back to. |
| 🙋 Apps status | M | A small icon at the right of the toolbar, with a coloured dot, that opens the suite's shared panel: every Recon Towers app, with one state and one button (*Linked*: Open, *Found, not linked*: Link, *Installed, not running*: Open, *Not installed*: Get it). Green means one is linked, amber found but none linked, grey none found, off App Link is off. The wording is the suite's, and finding an app never links it. It looks only when it opens, at start and on *Refresh*. Copies RT Story Tracker's panel, which builds the shared parts first. |
| 🙋 Updates and compatibility | S | Two apps link by App Link version and the kinds of document they accept, never by app version. The panel nudges *Update available (you have X, the latest is Y)* with *Open to update* or *Download*, taking "latest" from `recontowers.com/apps/versions.json`, kept for a day, and says *Couldn't check for updates* offline. Only an incompatible version blocks, with *Needs an update to link*. |

**Test:** a whole chapter sent from RT Story Tracker can be read, marked and retaken without touching the mouse. With the other apps installed and closed, the panel offers to open them. Uninstalling removes the installed file, and a file left behind with no app at its launch path doesn't count as installed.

## v1.8 — Local transcripts

🙋 Long recordings into text, on your own computer. An optional download, as in RT Markdown Reader.

| Feature | Size | Details |
|---|:-:|---|
| 🛡️ 🙋 Hours of speech | L | Builds on Reader's Whisper work, which stops at 30 seconds and gives no times. This handles whole chapters and episodes, in the background, with a time on every word. Nothing is sent anywhere. |
| Choose the model | S | Small and quick, or larger and more accurate. The app shows each size first. |
| Who said what | M | With separate tracks, each speaker is named from their track. |
| Correct the transcript | M | Click a word to hear it, and fix it. |
| 🙋 Transcript files | S | Plain text, WebVTT and SRT, plus the JSON chapters file podcast apps read. |

**Test:** the transcript of a one-hour test recording matches a checked copy to a set accuracy, and every word's time is within a quarter of a second.

## v1.9 — Check it against the book

🙋 Listen for mistakes without listening to all of it. The check nobody enjoys doing by ear.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Tie the sound to the page | L | Lines up the transcript with the script, so each sentence knows where its sound is. Click a sentence to hear it. |
| 🙋 What doesn't match | M | Finds words missed, added, repeated or changed, and lists them for you to hear and judge. |
| Retake from the page | M | Choose a sentence, read it again, and the new take drops in, with its level matched to the rest. |
| Proof list | S | A list to work through and tick off, kept with the chapter, and shown on the release sheet. |

**Test:** a chapter with 30 planted mistakes finds at least 28, and doesn't drown them in false alarms.

## v1.10 — Edit by the words

🙋 Cut an episode by reading it.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Select words, cut sound | L | Select words in the transcript and cut them, and the edit lands in the sound. Same edit list as everything else, so it can be undone. |
| Filler words and false starts | M | Finds "um", "you know" and restarted sentences and offers each one. Nothing is removed by itself. |
| Chapters from the talk | S | Marks where the subject changes, as a suggestion. |

**Test:** cutting words from the transcript and cutting the same place by hand give the same result.

## v1.11 — Names said right

🙋 A name is taught once, in RT Story Tracker, and used here. This needs Story Tracker's v3.8 and its dictionary in v3.12.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 The dictionary, over App Link | M | Asks Story Tracker for a book's names and how to say them. A locked project answers nothing. |
| 🙋 On the page | M | Names light up in the script as you read, with how to say them beside them. |
| 🙋 Better transcripts | S | Names go to the transcript model as hints, so invented words stop coming back as nonsense. |
| Names in the check | S | The check against the book looks hardest at names. |
| Without Story Tracker | S | Bring in RT Markdown Reader's pronunciation lists, or keep a list here. |

**Test:** add a name in Story Tracker and it shows on the page here. Lock the project there and nothing crosses.

## v1.12 — Send it on

🙋 The finished episode or book goes where it needs to go next, without building anything twice.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Episode pack | M | One folder: the audio, transcript, chapters file, cover and notes, ready to upload to your host. |
| 🙋 Notes through RT Markdown Reader | S | Hand it the show notes or a blog post. Sending to blogs, Discord and wikis stays its job. |
| 🙋 Tell RT Author Desk | S | Tell it an audiobook or episode is finished, with its running time, narrator and files. |
| What it's doing | S | Answers the suite's status question with a short line, such as what's being exported. |

**Test:** finish an episode and the pack has everything a host's upload page asks for. A finished book appears on its edition in RT Author Desk.

## v1.13 — Natural voices

🙋 RT Markdown Reader's offline voices, for drafts and for books that can use them. The licence and the stores set the rules here (decision 2).

| Feature | Size | Details |
|---|:-:|---|
| 🛡️ 🙋 A guide track | M | Hear a chapter read before you record it, with names said properly. A guide is for you and is never exported. |
| 🛡️ 🙋 A voice edition | L | A whole book read by a natural voice, one sentence at a time. Change one sentence and only that one is made again. |
| 🙋 Labelled, every time | M | Everything made with a voice says it's machine-made, in the credits and in the file's details, because the voices' licence requires it. |
| 🙋 Kept from the wrong store | S | The app knows which seconds are a machine voice. A file holding any is refused for stores that want a human, with the reason shown. |
| Your pronunciation, respelled | S | Dictionary names go to the voices as spelled-out sounds, the way Reader does it. |

**Test:** a voice edition remade from the same project is identical. A single voice sentence in a chapter stops the ACX export.

## v1.14 — Lock a project

Unreleased work kept private, for those who want it (decision 8).

| Feature | Size | Details |
|---|:-:|---|
| 🛡️ Password lock | L | Lock a project with a password and a recovery key. Audio is encrypted in blocks, so long files still play and seek. |
| Unlock and get it out | S | Turn the lock off and it's an ordinary folder again. |

**Test:** a locked project shows nothing in its folder to anyone without the password, and plays as smoothly as an unlocked one. App Link says nothing about it.

## v1.15 — Hired narrators

🙋 Someone else reads the book, and you stay in charge of it.

| Feature | Size | Details |
|---|:-:|---|
| 🙋 Narrator pack | M | One folder for a narrator: the script, the names and how to say them, the store's rules, and how to name the files. |
| 🙋 Bring their files in | M | Each file lands on its chapter, and is checked against the store and the script. Their name goes on the release sheet. |
| 🙋 Notes back | M | A list of fixes with times and the exact words, ready to send them. |
| 🙋 A second narrator | S | Different narrators for different chapters, with their credits kept right. |

**Test:** a pack made here, with files brought back in, gets through the checks and comes out with the right credits.

## v1.16 — AI add-ons

🙋 Off until you turn it on, with your choice of service, including a model on your own computer. The app is complete without it.

| Feature | Size | Details |
|---|:-:|---|
| 🛡️ Your own AI service | M | Reader's service list: Claude, ChatGPT, Gemini, Mistral, OpenRouter, or Ollama and LM Studio on your computer. |
| 🛡️ Writing help | S | Draft show notes, titles and chapter names from a transcript. You approve every word. |
| 🛡️ 🙋 Other voice services | M | Use a voice service with your own key. Its audio is labelled and tracked as a machine voice, and a cloned voice there needs the same spoken consent as v1.17. |

**Test:** with AI off, no request leaves the computer, and every feature above says it's off. With a local model, nothing leaves either.

## v1.17 — A voice of your own

🙋 A voice made from one person's reading, run on your own computer. An optional add-on, and always labelled as a synthesized voice. Planned now, built later.

| Feature | Size | Details |
|---|:-:|---|
| 🛡️ 🙋 Consent, spoken live | M | The person reads a consent sentence and a short random passage into the microphone, in the app, even when it's you. That reading makes the voice and is kept with it. Clips from files are refused, so nobody's voice can be copied from a recording (decision 18). |
| 🛡️ 🙋 The voice reads the book | L | A local model reads the chapters in that voice, with names from the dictionary. First choice: Chatterbox, MIT for its code and model files, which runs on the same engine as the natural voices. |
| 🙋 Labelled and marked | M | Every file says it's a synthesized voice, carries an inaudible watermark, and counts as machine audio on the release sheet. Stores that want a human refuse it. |
| 🙋 Withdraw it | S | The person can withdraw consent, and the voice is deleted with everything made from it marked. |

**Test:** a voice can't be made from an imported file. A book read by a cloned voice can't pass the ACX export, and goes to Google marked *Synthesized voice*.

## v1.18 — Call-in guests

🙋 Live calls, added last because they're the one thing that needs the internet.

| Feature | Size | Details |
|---|:-:|---|
| 🛡️ 🙋 Call a guest | L | A direct call between two computers, off unless you start one. How two computers find each other without a Recon Towers server gets its own design first. |
| 🙋 Full quality on both sides | M | Each side records itself to disk during the call. The call is only for talking, so a bad connection can't spoil the recording. |
| Tracks come back by themselves | M | After the call the guest's file comes over and lines up, using the work in v1.6. |

**Test:** a one-hour call with the connection cut twice still gives two clean tracks.

## Later — only if needed

Ideas with no date.

| Feature | Size | Details |
|---|:-:|---|
| AAC on Linux | M | If the owner gets legal advice that it's safe, `.m4b` on Linux with FFmpeg's encoder (decision 7). |
| Video podcasts | L | Keeping a video track in step with the audio edits. |
| Two computers | L | Each side of a project on a second computer, through a folder you already sync. Audio makes this a big job. |

## Ongoing — Polish & distribution

| Feature | Size | Details |
|---|:-:|---|
| Keep store rules current | S | Check each store's published rules at every release, and update the date shown beside them. |
| Accessibility | M | Everything by keyboard, with screen reader support and sound cues for levels. |
| Signing | M | Windows and Mac signing, so the system stops warning people, when the owner has the certificates. |
