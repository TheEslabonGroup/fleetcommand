# On Your Go

**Renamed from Fleet Command on 2026-09-23, on Brock's call.** The DevNetwork
API + Cloud + AI Hackathon 2026 entry was entered and judged as Fleet Command
(https://devpost.com/software/fleet-command), and the narrated film, the press
kit downloads and everything in `submission/` keep that name, because that is
what was submitted. The repo, the Pages project `fleetcommand`, the pages.dev
address and the public asset paths keep it too, until a rename of those is
built on purpose. Why the name changed, and the clearance behind it:
`docs/NAMING.md`. The sections below that describe the entry are its history
and still use the name it was judged under.

The public agentic ops command center, and the fleet's hackathon entry. A
judge lands with no login on a one screen cockpit and watches a crew of four
AI agents work a mission on a synthetic target: SCOUT recons it, AUDIT names
the defects, MEDIC drafts the fix, SHIP stages the deploy and then HOLDS at
the human approval gate. The gate is the product: AI drafts, people decide.

Born public on purpose. 100% synthetic demo data (the fictional Harbor Lane
Bakery), zero fleet secrets, and no connection to the walled ainow deploy.
The private crew room stays private; this is the showpiece that proves the
same engine in the open.

## The two key ignition (2026-08-22, build #12, docs/PREMISE.md)

The approval gate is hardware now. At the hold, KEY 1 glows amber (the
reserved colour, still spent at exactly one moment, worn by a keyring
instead of a button fill); turning it arms the console and wakes KEY 2, and
turning KEY 2 releases the staged deploy. Send back stays an ordinary
button and stands both keys down. One key never fires: KEY 2 is disabled in
the DOM until KEY 1 turns, so no single interaction can release. The keys
are real buttons, keyboard operable, aria-pressed carries the turned state,
and reduced motion turns them instantly. Approve and Send back keep their
exact prior semantics and log lines; only how the decision feels changed.

## SUBMITTED (2026-09-02)

The DevNetwork entry is **in**, and it is the first contest the fleet has ever
submitted to: https://devpost.com/software/fleet-command . One entry against the
$12,500 overall plus SerpApi ($3,000) and name.com ($2,000). Devpost keeps
editing open until Sep 3 2026 at 1:00pm EDT.

**All Things Agentic was MISSED** (closed 2026-08-31, 5:00pm PDT), so the Google
build below is finished work entered nowhere.

**This repo is PUBLIC** as of 2026-09-02, because every DevNetwork track
requires it. It was swept for keys and secret-named files across all commits
first. Keep secrets out of it.

`NEXT.md` carries the full state: start at its `RESUME HERE` cursor (the Google
build moved to gemini-3.8-flash and redeployed on 2026-10-08), then the
2026-09-03 judging day block below it for the entry's record. The
press kit offers ONE film download, `fleet-command-narrated.mp4`, the 1080p
narrated 2:46 master. The
43.6 second raw capture that `fleet-command-demo.mp4` used to serve was
overwritten with the master on 2026-09-03 and is gone from both Macs, so that
button was retired rather than left mislabelled. The demo key is kept because
Devpost's organiser backup field points at it, and it now holds the right film.
The judged video is the YouTube embed either way.

## Two builds, two entries (2026-08-27)

This Cloudflare + Anthropic cockpit is the DevNetwork entry. There is also a
Google-native build in `google/`: the same crew on Google ADK, Gemini through
Vertex AI, deployed to Cloud Run, with the approval gate enforced by the
framework's own `require_confirmation` pause. That is the All Things Agentic
entry, served at `/google`. Both demo films are live and public (links and the
whole submission state live in `NEXT.md`, in the 2026-09-03 judging day
block). The video pipeline that built them (narration, Lyria score, ffmpeg mix)
is in `submission/video-pipeline/`.

## The on-switch (fleet pattern)

- **Replay mode (default):** with no key set, `/run` serves a recorded run of
  the mission and the UI labels it "replay" honestly, in the chip and the
  footer. Nothing pretends to be live.
- **Live mode:** arm `ANTHROPIC_API_KEY` as a Pages secret and every step
  becomes a real Claude call (`claude-sonnet-5`). **Setting it is Claude's**
  (Constitution XI #32a as narrowed 2026-09-03: a prepaid, spend capped key
  reaches no bank and changes no credential). Issuing a NEW key is Brock's,
  because the console sits behind his login. A secret reaches only deploys
  made after it, so set it and redeploy:
  `cd fleetcommand && npx wrangler pages secret put ANTHROPIC_API_KEY --project-name fleetcommand && npx wrangler pages deploy --branch main`
  from the folder that holds this repo. Without the `cd` the secret half fails
  with "Missing Pages project name" and the deploy half has nothing to ship.
- **The spend guard (2026-09-23):** this page is public with no login, so
  live calls are capped at 100 per UTC day (a `LIVE_DAILY_CAP` Pages variable
  overrides it), counted in the `MARKET_CACHE` KV. Past the cap, or with no
  counter, a step is served from the replay and the page says why. One call
  costs at most about a cent, so the cap is about a dollar a day at worst.
  The cap is approximate under a burst, so the HARD ceiling is a spend limit
  on the Anthropic workspace the key lives in. `node --test test/` proves the
  guard with a fake KV and a fake endpoint, spending nothing.
- **Live copy follows the house rules (2026-09-23):** every agent is asked for
  plain text with no dashes, and `houseCopy()` in `functions/run.js` removes
  any em or en dash and markdown backtick the model writes anyway. The first
  live mission put eight dashes on the page before it existed.

## Deploy

LIVE at https://fleetcommand-2u0.pages.dev (Cloudflare Pages project
`fleetcommand`). No custom domain yet: `onyourgo.com` is on the buy list in
`docs/NAMING.md` and is not bought.

Two more live surfaces, both added 2026-09-02:

- **Press kit: https://fleetcommand-2u0.pages.dev/press** . Healthy is 200 with
  its five buttons resolving: one YouTube watch link and four downloads off
  files.thebrockchain.com. A 404 on one of those means the asset lane broke,
  not the page. It read "four download buttons" until 2026-09-03, which was the
  count before the Raw capture button was retired and the narrated one added.
- **Public assets: https://files.thebrockchain.com/fleetcommand/** , the
  `brock-public` R2 bucket, which is the PUBLIC tier in the fleet
  `MEDIA-POLICY.md`. It holds the demo MP4, three screenshots, the share card
  and the one page brief. **Anything put there is published**, so nothing
  uncleared goes in it. **`wrangler r2 object put` needs `--remote`** or it
  writes to a local simulated bucket, prints success, reads back correctly, and
  leaves the real bucket empty while every public URL 404s.

`npx wrangler pages deploy --branch main` from this folder. Deploying needs no
build step and the site has zero runtime dependencies. Security headers ride
every response via `functions/_middleware.js`.

**The link preview card is generated, so do not hand edit it.** The block
between the `share:start` and `share:end` markers in **all four pages under
`site/`** (`index.html`, `google.html`, `press.html`, `404.html`) is written by
`node tools/build-og.mjs`, which writes `brand/og-card.html`, renders it into a
hashed `site/og-*.png` and rewrites the tags to match. The card and its copy
live in `tools/build-og.mjs` itself, so change them there, then re-run the tool
and deploy. A hand edit inside the markers, or anywhere in
`brand/og-card.html`, is overwritten on the next run.

**Each page's own title, description and `og:url` live in the `PAGES` map at the
top of that script**, added 2026-09-03. This paragraph named only index and 404
before then, and the script really did stamp ONE hardcoded block into every
file, so `/google` and `/press` both shipped `og:url` pointing at `/` while
their own `rel=canonical` disagreed. Adding a page means adding a row to that
map; a page with no row falls back to the site identity and a root `og:url`,
which is correct for `404.html` and wrong for anything else.

**The rest of the head sits OUTSIDE those markers on purpose.** `rel=canonical`,
both JSON-LD blocks (`WebApplication` and `HowTo`), and the two icon links are
deliberately above the `share:start` line, because the generator strips
everything between the markers on every rebuild and anything tidied inside them
would vanish silently. Two more things a cold session should not undo: the
`<h1>` carries `class="mark"`, which is what keeps the header pixel identical to
the `div` it replaced (the recorded demo capture depends on that), and the
schema is `HowTo` rather than `FAQPage` because Google wants FAQ text visible on
the page and this page is one screen with zero scroll. Reasoning in `NEXT.md`.

Live-mode spend is guarded by the 100-call daily code cap and the prepaid
workspace ceiling described above. Replay mode costs nothing and is the default.

## The entry, as it stands (2026-09-03)

Fleet Command is SUBMITTED to the DevNetwork [API + Cloud + AI] Hackathon
2026: https://devpost.com/software/fleet-command , in for the overall prize
and the SerpApi and name.com sponsor tracks, both of which the crew uses for
real (the code is in `functions/_lib/market.js` and `functions/_lib/domains.js`,
each with its own test under `tools/`). Submissions close Sep 3, 2026 at
10:00am PDT, judging runs until 1:00pm PDT, winners at 4:00pm PDT.

The live board is **hackathons.thebrockchain.com** (repo `hackathons`, crew
only), and `HACKATHON-BOARD.md` here is the dated public snapshot. All Things
Agentic (the Google build under `google/`) was missed on Aug 31; that build is
real and entered nowhere.

## Run it yourself

No build step, no dependencies beyond `wrangler`:

    git clone https://github.com/thebrockchain/fleetcommand
    cd fleetcommand
    npx wrangler pages dev

Open the printed local URL. With no keys set the cockpit runs in replay mode
and says so on screen. The public deploy runs live since 2026-09-23, capped
at 100 calls a day. To see
the parsers work against real payload shapes:

    node tools/test-market.mjs
    node tools/test-domains.mjs

To check the middleware (a crawler refused with a 403 still gets the same
security headers as a page):

    node --test test/

To check the entry's public surfaces (the cockpit, the press kit, the public
assets, the repo, the Devpost page) from outside, the way a judge meets them:

    node tools/check-entry.mjs

## The submission kit

Everything an entry needs lives in `submission/`: paste-ready copy per event
(`ENTRY-DEVNETWORK.md` carries addenda for the SerpApi and name.com track
judges), the VO script with the marks table, and the capture pipeline:
`record.mjs` shoots the live site at true 4K through the DevTools screencast
and writes `marks.json` in video time; `edit.mjs` cuts the 4K master into a
13 shot 1080p film placed against those marks, never against hand typed times.
The finished narrated film is public at https://youtu.be/6L4Ez-XEcKo (2:46),
published as a 1080p download at
https://files.thebrockchain.com/fleetcommand/fleet-command-narrated.mp4, and
the master lives under `submission/youtube/videos/` (gitignored media) on both
Macs.
The site takes
`?pace=video` (VO timeline) and `?pace=fast` (cold open); pace changes render
speed only, never what runs.

`NEXT.md` carries what is still open, with tomorrow's resume point on top.

## Licence

MIT. See `LICENSE`. The demo data is synthetic (the fictional Harbor Lane
Bakery) and the fleet's private crew room is not part of this repo.
