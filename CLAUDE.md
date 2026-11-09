# Holladay Digest

AI summaries of Holladay, UT city meeting minutes. Live at https://holladay.fyi. `scraper.py` fills a committed SQLite DB nightly; `next-app/` renders it.

## How to work here

- Ask when something is unclear; name tradeoffs rather than picking silently.
- Minimum code for the request: no speculative features, single-use abstractions, or handling for impossible cases.
- Touch only what the request needs. Match existing style. Flag dead code; don't delete it unasked.
- For non-trivial changes, state what "done" looks like and verify it (render the page, check desktop and mobile).
- Commits go to `main`, which auto-deploys on Vercel, so commit and push only when asked.

## Commands

- Web app: `cd next-app && npm run dev` (port 3001). Node 24 (`engines` pins 24.x for better-sqlite3 on Vercel; `.nvmrc` matches, so run `nvm use` first).
- Type check: `npx tsc --noEmit`, then delete `tsconfig.tsbuildinfo`. This is the check Claude can run: `next build` fails in the sandbox (Google Fonts fetch), so I run builds myself.
- Scraper (needs `ANTHROPIC_API_KEY`, Python 3.11 in CI): `python scraper.py --recent`, or `--resummarize N` to redo the N newest summaries (no email). The key lives only in GitHub secrets, so real runs go through the **Scrape Meeting Minutes** workflow (`gh workflow run scrape.yml -f resummarize=N`).

## Scraper (`scraper.py`)

- Finds new minutes on the OneSuite portal, reads the PDF (pdfplumber) or the event-page transcript, summarizes with `SUMMARY_MODEL` (`claude-opus-5-5`, effort high), stores it in `meeting_summaries.db`, and emails each subscriber their own copy via Resend's batch endpoint (`build_digest_html` mirrors the site's meeting card).
- `SUMMARY_PROMPT` sets the summary format the site parses (`##` sections, bullets, tables) and the rules: spell it "Holladay", one spelling per person, roughly 400–800 words.
- Table `meeting_summaries`: `id, meeting_type, meeting_date ("Oct 20, 2026"), pdf_url, summary, created_at` (shown as "Summarized").
- `.github/workflows/scrape.yml` runs nightly at 06:00 UTC and commits the DB if it changed.

## Web app (`next-app/`)

- Next.js 16 App Router (Turbopack), React 19, Tailwind 3 (`hoverOnlyWhenSupported`), better-sqlite3 (sync; call directly in server components), motion, `@paper-design/shaders-react`.
- Tokens: `forest` (page bg), `pine` (cards), `lime` (accent), `moss`, `mint`, `soot`, `paper`. Fonts: Roboto Mono (`font-mono`, next/font/google), Zalando Sans (`font-sans`, self-hosted in `app/fonts/`).
- `app/page.tsx`: hero (pinned left on desktop, 60px margins top, left and bottom), date nav, meeting feed. `?m=<id>` opens at that meeting. `app/meetings/[id]` redirects to `/?m=<id>`.
- `components/MeetingBrowser.tsx`: date nav plus every meeting in one page-scrolling feed. Tracks the meeting at the top (`replaceState` on `?m=`), date clicks animate a 400ms scroll that lands 24px below the top and flashes the date lime, and meetings render lazily within 1500px with a manual scroll anchor. Desktop shows the About copy above the first card, with 300px of the first card peeking in.
- `MeetingList.tsx`: dates (`10/06/26`), a vertical list on desktop and a sticky horizontal strip on mobile. `MeetingSummary.tsx` parses the markdown-ish summaries.
- `HalftoneHero.tsx`: menu (About · Search · Newsletter), shader image, "Holladay Digest" title (container-query sized). It sets `data-hero-ready` on `<html>` once the canvas paints.
- Overlays: `Overlays.tsx` (state; ⌘K and `/` open search), `Overlay.tsx` (shared dialog: clip-path from the trigger, `inert` page, focus restore), plus About, Search (`app/actions.ts` `searchMeetings`) and Newsletter (`app/api/subscribe`).
- `app/unsubscribe` (confirm page) and `app/api/unsubscribe` (also takes mail apps' one-click POST): digest unsubscribe links, keyed by the Resend contact id.
- `lib/db.ts` (queries), `lib/meetingColors.ts` (`getCanonicalType`, `getSubtype`), `lib/utils.ts` (`formatDotDate`, `formatPlainDate`).

## Motion conventions

- Follow emilkowalski/skills: animate only transform, opacity, clip-path and filter; no ease-in; keyboard-opened overlays don't animate; reduced motion falls back to fades.
- Easing tokens in `globals.css` (`--ease-out`, `--ease-in-out`, `--ease-drawer`); `.press` adds the scale(0.97) press.
- First-visit intro (`data-intro` on `<html>`) runs image → title letters → dates → About copy → first card. It stays paused until `data-hero-ready`.

## Deployment

- Vercel project root `next-app`. The DB is committed, so a bot DB commit redeploys the site.
- Remote: `github.com/derrellwilliams/holladay-digest`.
