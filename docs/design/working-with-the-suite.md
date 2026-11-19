---
title: Working with the Suite
subtitle: What this app owns, and what it asks the others for
author: Recon Towers Dev Department
date: 2026-11-06
tags: [plan, app-link]
---

# Working with the suite

Built to [the suite's rules](https://github.com/neogentrics/rt-markdown-reader/blob/main/docs/app-suite.md) and
[App Link](https://github.com/neogentrics/rt-markdown-reader/blob/main/docs/app-link.md). One thing has one home, and the others ask for it.

**App Link id:** `rt-audio-studio`. It takes `markdown` and `text`, and implements all four methods: `hello`, `pair`, `open_document` and `unlink`.

| Thing | Home | How it's used here |
|---|---|---|
| Audio masters and podcast episodes | **This app** | RT Author Desk records what was made |
| Manuscripts and chapters | RT Story Tracker | The script on the page |
| Dictionary and pronunciation | RT Story Tracker | Names on the page, the voices and transcripts |
| Sending to blogs, Discord, wikis, Notion | RT Markdown Reader | It's handed show notes, and nothing is built here |
| Published editions, narrators on record, store links | RT Author Desk | Told when a book or episode is finished |
| Covers | RT Press | Any image can be used. Nothing depends on Press |

## What works today, and what has to come first

| Need | Works today? | Waiting for |
|---|---|---|
| A chapter sent from Story Tracker or Reader | **Yes.** `open_document` already carries it | Nothing. This is v1.7 |
| Finding installed apps, the Apps panel | Planned, not built | Each app building it. Story Tracker's is in v3.8 |
| A book's whole chapter list | No | A new fact, below |
| The dictionary | No | Story Tracker's v3.8 for facts, and **its dictionary, which isn't built yet**: v3.12 |
| Telling RT Author Desk | No | Author Desk's v1.5 "What was made" |

So v1.11 can't be finished until Story Tracker reaches v3.12. Until then the app uses a list of its own, or Reader's pronunciation
lists. Nothing before v1.11 needs it.

**Story Tracker's id changed.** It's `rt-story-tracker` from 3.7.1, and was `storytracker`. Reader's `docs/app-suite.md` still shows the
old id, and needs updating there.

## New facts this app needs

To go into [app-link.md](https://github.com/neogentrics/rt-markdown-reader/blob/main/docs/app-link.md) when the first app needs them, as the suite page says. Names are a proposal.

### From Story Tracker: `book_chapters`

The chapters of a book, in order, with their text. A locked project answers `not_allowed`. It's the same as `open_document`, but for a whole book, and it's a request made by a person here.

### From Story Tracker: `dictionary`

Reader's list today is a word and how to say it. That's enough for the voices, but a person narrating wants more, and the voices can't read phonetic symbols. Proposed fields:

```json
{ "word": "…", "say": "…", "ipa": "…", "note": "stress on the first part", "lang": "en" }
```

- `word` and `say` are required, as in Reader: `say` is a respelling any voice can read.
- `ipa`, `note` and `lang` are optional, for people, and for hired narrators' packs.
- The Story Tracker plan says each word carries a pronunciation guide, so its fields should be settled together with that release.

### To RT Author Desk: `audio_made`

A short record: which book or show, the kind (audiobook or episode), running time, narrators, whether any of it is machine-made, which store it was made for (such as a Google Play edition replacing Google's own), and where the files are. Paths stay on this computer. Author Desk plans this in v1.5. This fact and its name need agreeing with that plan.

### Status

Answers the suite's `status` request with a short line, such as "Exporting chapter 4 of 30". Never any words from a script, and a locked project says nothing.

## Found when installed, and kept up to date

From the suite plan, 18 November 2026. Planned across the suite and not built yet.

- **Installed file.** `installed/rt-audio-studio.json` in the App Link folder, written on first run and after each update, removed on uninstall. An app counts as installed only if its launch path still exists.
- **Apps status.** The icon and panel in [the roadmap's v1.7](../../ROADMAP.md), with the suite's wording and one shared list of apps. It copies RT Story Tracker's.
- **Updates.** Apps link by App Link version and accepted document kinds, never app version. A newer release is a nudge only. "Latest" comes from `recontowers.com/apps/versions.json`, which isn't live yet, and this app can't be in it while its repo is private (decision 21).

## What this app will and won't do with requests

As App Link requires: nothing is saved because of a request, a received document opens as an unsaved script, everything received is treated as untrusted, and links are off until the person turns them on. A request can never start or stop a recording.
