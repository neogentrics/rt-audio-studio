# RT Audio Studio

Make audiobooks and podcasts on your own computer: record, edit, clean up, mark chapters, check a book against the store's
rules, make local transcripts and export the finished files. For Windows, Mac and Linux, with no account, no ads and nothing
else to install.

RT Audio Studio is part of the **Recon Towers** suite, built by its Dev Department. It was inspired by the owner writing his
own books.

> **Status: being planned. No code has been written, and there's nothing to download yet.**
> Building starts when the owner approves the plan. Start with the [roadmap](ROADMAP.md).

## What it will do

- **Record safely.** Every second goes to disk as it's spoken, so a crash or a pulled cable costs you a moment, not a chapter.
- **Keep every take.** Your recordings are never changed. Cuts, retakes and cleanup sit on top, and you can undo any of them,
  even years later.
- **Edit with the words in front of you.** The script sits beside the sound, so you find a mistake by reading, not by hunting
  through a waveform.
- **Clean up.** Room noise, hum, clicks, harsh S sounds and uneven levels, with a before and after you can hear.
- **Finish a book.** Chapters, opening and closing credits, a retail sample, and the files laid out the way each store wants.
- **Check it first.** Levels, noise, file format and length against each store's published rules, with the exact place in the
  chapter that fails.
- **Finish a show.** Episodes from a template, with your intro, outro and music, MP3 chapters, and guests' files lined up.
- **Make transcripts on your computer.** Nothing is sent anywhere. Transcripts feed subtitles, show notes and a check of the
  recording against the script.
- **Say the names right.** Names and invented words come from RT Story Tracker's dictionary, so a name is taught once.
- **Work with any narrator.** Your own voice, a hired narrator's files, or the natural voices from RT Markdown Reader. The
  app keeps track of which is which, so a machine voice can't reach a store that doesn't allow one.

## What it won't do

- Upload to a store or a podcast host, or sign in to one. It makes the files, and you send them.
- Host your show or your feed. Your host keeps doing that.
- Promise that a store will accept a book. Stores also have people listening, and their rules change. Each check shows when
  its rule was last confirmed.
- Clone a voice, or make music.
- Need AI. Transcripts and smart noise removal are optional downloads. Writing help and outside voice services are add-ons,
  off until you turn them on, with your choice of service, including a model on your own computer.

## What it runs on

The plan is the same base as RT Markdown Reader and RT Story Tracker: Electron, on Windows 10 or later, macOS 13 or later, and
64-bit Linux. It works with no internet. Live call-in guests, a late release, are the one feature that needs a connection, and
that's off unless you start a call.

## The plan

| Page | What's in it |
|---|---|
| [Roadmap](ROADMAP.md) | Every release, what's in it and how it's tested |
| [Product plan](docs/product-plan.md) | What the app is for, who it's for, and how it does the job its own way |
| [Decisions](docs/decisions.md) | What the owner has chosen, and what's waiting for his approval |
| [Audio libraries and their licences](docs/design/audio-libraries.md) | Every library checked, what's allowed, and what's refused |
| [Store and podcast rules](docs/design/store-rules.md) | The published numbers, where they came from, and what's still unconfirmed |
| [What RT Markdown Reader gives us](docs/design/reuse-from-reader.md) | Its audio code: what's reused as it is, and what has to change |
| [Projects and recording safety](docs/design/projects-and-recording.md) | How a project is stored, and why a recording can't be lost |
| [Working with the suite](docs/design/working-with-the-suite.md) | What this app owns, and what it asks the other apps for |

## License

Proprietary. See [LICENSE](LICENSE).
