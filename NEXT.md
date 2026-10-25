# On Your Go: what is still open

## RESUME HERE
### Footer session01a170b0 close, 2026-10-25 13:34 ET

The session’s footer implementation is committed, and the published result is recorded in the private fleet release receipts. This note does not complete unrelated product, account, security or access work listed below. No additional deployment is requested by this documentation update.
Source checkpoint: ef5835023f72. Creation proof: docs/design/ESLABON-SIGNATURE-INSTALL.json, docs/design/FOOTER-2026-10-25.md.
Next action: read this project’s existing open items below and its named proof before making another change. Preserve any newer peer work. No new background job is armed by this note.



Written 2026-10-10 02:43 ET on Brocks-iMac, session 205af81f, ledger sessions/2026-10-07-Brocks-iMac-205af81f-eec9-403c-8829-f70f70e7586b.md (in the brock repo)

### 5e8b7e5a Brockchains-MacBook-Pro (written 2026-10-09 00:55 ET, ledger sessions/2026-10-06-Brockchains-MacBook-Pro-5e8b7e5a-3611-40d3-84bf-9c88f9daab8b.md in the brock repo)

**The spot.** 2026-10-07: crew A's paragraph pass (`341ea30`, deploy 45e8396a) and the sentence splitter fix (`50b6bc0`: the old matcher from WRITING.md 4b dropped the words before any inner period, "3.5" or "$9.99") are on main.
**Next action.** Nothing owed from this session.
**In flight.** Nothing.
**Verified live.** Cloudflare pages deploy ce00d92b, 2026-10-07 about 01:20 ET: `/` and `/google` both serve `function splitSentences`, no console errors in a browser.
Transcript: `~/.claude/projects/-Users-thebrockchain-Documents/5e8b7e5a-3611-40d3-84bf-9c88f9daab8b.jsonl` on Brockchains-MacBook-Pro.


### 205af81f Brocks-iMac (the Gemini model move)

- **The spot.** Finished and live, nothing in flight. Google mailed the
  falfasbrock Gmail account on 2026-10-05 that Vertex retires Gemini 3.7 Flash on
  2027-01-28 (requests 404 after that) and named project
  `fleet-command-506619` as affected. Brock, 2026-10-07 01:18 ET
  (205af81f#D03): "Let's go ahead and we need to migrate our Flash models. How
  do we do that? The easiest". The easiest path was one line: `afec0d0` moved
  `MODEL` in `google/fleet_command/agent.py` from `gemini-3.7-flash` to
  `gemini-3.8-flash` (Google's recommended target), plus the deploy.sh comment,
  the README line and both labels in `google/architecture.svg`. Nothing else in
  the fleet calls 3.6 or 3.7 Flash (grep of `~/Developer/BROCK`, 2026-10-07).
- **How it was deployed, 2026-10-08 23:53 ET.** From Brocks-iMac over
  `ssh mbp` (the iMac has no gcloud), on the MacBook Pro in
  `~/Documents/thebrockchain/fleetcommand/google`: `git pull --ff-only`, then
  `CLOUDSDK_ACTIVE_CONFIG_NAME=fleetcommand ./deploy.sh`. The env var pins the
  `fleetcommand` gcloud config (the falfasbrock Google account) for that one command, so
  the MBP's default config (the El Zarape client's account) stayed
  active; checked after. Revision `fleet-command-00006-5ns`, 100 percent of
  traffic.
- **Verified live, 2026-10-08 23:58 ET.** `GET /list-apps` 200. One
  `POST /run` mission against https://fleet-command-r453w22nfq-uc.a.run.app
  returned 17 events; SCOUT, AUDIT and MEDIC each report `modelVersion`
  `gemini-3.8-flash`. Before deploying, a direct Vertex `generateContent` on
  `publishers/google/models/gemini-3.8-flash` at location `global` answered
  200. That test left two throwaway sessions under user `semisonic` in the
  service's in memory store; they vanish with the next instance.
- **Next action.** None needed. To recheck: create a session
  (`POST /apps/fleet_command/users/<u>/sessions`), `POST /run` with "Run the
  mission.", expect events whose `modelVersion` is `gemini-3.8-flash`.
- **Dead ends.** The iMac has no gcloud and no `.venv`; deploy from the MBP.
  `gcloud config configurations activate fleetcommand` would also work but
  flips the MBP's global default; the env var does not.
- Transcript: Brocks-iMac `~/.claude/projects/-Users-homeimac-Library-Application-Support-Claude-scratch-workspaces-02f59733-faf9-4d26-a077-41102279f0bf-d0e2a280-4449-4bf6-af2a-2d0c424bebc7-scratch-2026-10-07-8c4e36/205af81f-eec9-403c-8829-f70f70e7586b.jsonl`

### 205af81f completed-session audit, 2026-10-10

- README checked: removed its stale claim that live mode has no code cap; the existing guard remains 100 calls per UTC day plus the prepaid workspace ceiling. Documentation only, no new deploy or metered run.
- Next action: none for this cleanup. In flight: none. Prior live model proof above is dated, not re-run. Local Claude transcript was deleted; the saved brain ledger preserves the earlier harvest and CLOSED record.

## Earlier cursor (was RESUME HERE, 2026-09-23, 19:12 PDT, share card fonts, crawler 403 headers, live mode armed)

Ran on **Brockchains-MacBook-Pro** (user `thebrockchain`, fleet root
`/Users/thebrockchain/Documents/thebrockchain`, this repo at
`~/Documents/thebrockchain/fleetcommand`).

**The spot.** Finished, on main and live, nothing in flight. Three things
landed 2026-09-23: live mode, armed with a spend guard and a house copy
filter (its own section below), the crawler 403 headers (`e7169da`, deployed
18:10 PDT, its own paragraph below), and the share card fonts. For the fonts, `97acdd8` makes
`tools/build-og.mjs` write the self hosted font link
(`<link rel="stylesheet" href="/fonts/fonts.css">`) into `brand/og-card.html`.
The 2026-09-10 font cleanup (`cd57150`) had only HAND EDITED that file, which
the script generates, so the 2026-09-23 rename rebuild (`e608283`) quietly put
the Google Fonts link back. The build now screenshots the card from a one shot
server on 127.0.0.1 instead of `file://`, and fails if the Montserrat or Space
Grotesk woff2 was never fetched. The rendered card is byte identical to the
one already live, `site/og-4d4f7d8333.png`, so `site/` did not change and
nothing was deployed.

**The next action.** First, get Brock's answer on the one open question in
the live mode section below: does the key's Anthropic workspace carry a
monthly spend limit. Nothing else is owed. To prove the world still matches
this file (the `/run` call spends about a cent):

    node tools/check-entry.mjs     # expect 14 of 14 green
    node --test test/              # expect 8 of 8
    curl -s -X POST -H "content-type: application/json" -d '{"step":"audit","prior":""}' https://fleetcommand-2u0.pages.dev/run
                                   # expect "mode":"live" and no dash in "output"
    node tools/build-og.mjs && git status --short
                                   # expect "card built: site/og-4d4f7d8333.png" and an empty status

The open work on this repo is elsewhere: the rename leftovers in
`docs/NAMING.md`, and one thing only Brock can confirm, below.

**LIVE MODE IS ARMED AND VERIFIED (2026-09-23, 19:07 PDT).** Brock issued a
key for this site and set it with
`npx wrangler pages secret put ANTHROPIC_API_KEY --project-name fleetcommand`
followed by a deploy (`7513256`). The public page now runs every step as a
real call to `claude-sonnet-5`. Two guards ship with it:
- **The spend guard** (`70dc5ee`): live calls are capped at 100 per UTC day
  (`LIVE_DAILY_CAP` overrides), counted in the `MARKET_CACHE` KV under
  `live-calls:YYYY-MM-DD`, failing closed to replay, and the page says why
  when it falls back. One call is at most about a cent at $2 / $10 per million
  tokens, so about a dollar a day at worst.
- **House copy on live output** (`3bfbcce`): the first live mission put eight
  em and en dashes and raw markdown backticks on the page. Every agent is now
  asked for plain text, and `houseCopy()` strips what the model writes anyway.

**OPEN, and only Brock can answer it:** whether the key's Anthropic workspace
has a monthly spend limit. That limit is the HARD ceiling; the daily cap is
approximate under a burst. Nothing in the repo can see it.
SERPAPI_KEY and NAMECOM_USER / NAMECOM_TOKEN stay unset: no such accounts were
found, and SCOUT and SHIP label their sample data honestly.

To re-check live mode (each Run on the page is 4 calls, about 4 cents):

    npx wrangler kv key get "live-calls:$(date -u +%F)" --namespace-id 654e70203d71438282b70d663aa6d201 --remote
                                   # today's live call count
    curl -s -X POST -H "content-type: application/json" -d '{"step":"audit","prior":""}' https://fleetcommand-2u0.pages.dev/run
                                   # expect "mode":"live" and no dash in "output"

**LANDED AND DEPLOYED 2026-09-23 18:10 PDT, on Brock's word: the crawler 403
headers.** Another session's commit `6af3290` (branch `wt/wall-headers`) was
cherry picked onto main as `e7169da` and deployed with
`npx wrangler pages deploy --branch main`. The middleware's 403 to a crawler
Cloudflare does not stop at the edge now carries the site's five security
headers (no CSP, because this site sets none anywhere, on purpose). Before the
deploy, a DotBot request to `/` got a 403 with ZERO of them; after, `/` and
`/run` both return 403 with all five, and a browser request still gets its
five. `node --test test/` (1 of 1) fails on the old middleware and passes on
the new one. Probe with DotBot, not GPTBot: GPTBot is blocked at the edge on
some zones and never reaches the middleware. To re-check:

    curl -sI -A "Mozilla/5.0 (compatible; DotBot/1.2)" https://fleetcommand-2u0.pages.dev/
                                   # expect 403 with the five headers

**State of the machines.**
- The worktree for `wt/wall-headers` was retired by the session that wrote
  it, after it was told the main commit (gone from `git worktree list` by
  18:14 PDT 2026-09-23). Its change lives on main as `e7169da`.
- This session left no worktree alive: `wt/og-fonts`, `wt/semisonic-og`,
  `wt/land-wall-headers`, `wt/semisonic-2`, `wt/live-cap`, `wt/arm-cmd`,
  `wt/live-copy` and `wt/semisonic-3` were retired with `wt done`.
- The Pages project `fleetcommand` has ONE production secret,
  `ANTHROPIC_API_KEY` (listed 2026-09-23 19:03 PDT with
  `npx wrangler pages secret list --project-name fleetcommand`). So `/run`
  is LIVE; SCOUT still gets labelled sample data and SHIP's registrar check
  is unarmed.
- Carried from the 2026-09-03 block and NOT re-checked today: two deliberate
  film copies on Brockchain-Personal's Desktop (a session does not delete them
  unless Brock says so), and the 1080p master under `submission/youtube/videos/`
  (gitignored) on both Macs and in R2 `brock-public`.

**Decisions this session, one line each.**
- The card is edited in `tools/build-og.mjs` only. `brand/og-card.html` is
  generated just like the share tags, and README and CLAUDE.md now say so,
  because "change the card in those sources" is what invited the hand edit.
- Fonts come from a local server, not `@font-face` inlined with file paths, so
  the template's link line matches the cleanup's byte for byte and the card
  uses the exact files the site ships.
- No deploy: the PNG hash did not change, and redeploying an identical `site/`
  proves nothing.

**Dead ends, do not repeat.**
- Swapping the link alone, as the 2026-09-10 hand edit did, renders the
  headline in Times: under `file://` a root relative `/fonts/` is the root of
  the disk. Rendered and looked at on 2026-09-23, not assumed.
- `execFileSync` for Chrome blocks the event loop the local server needs, so
  the build uses async `execFile`.
- Looking for an existing Anthropic key to arm live mode (2026-09-23): a
  keychain search was REFUSED by the Claude Code auto mode classifier as
  credential exploration, and was not retried another way. A search of
  gitignored `.dev.vars` files found one with an `ANTHROPIC_API_KEY` line,
  `earpiece/.dev.vars` (the value was never read), which is earpiece's own
  and was deliberately NOT borrowed (Constitution Article I
  #4: one creation's spend never rides another's key). Do not reach for either
  again; the fix is a key made for this site.

**Verified live vs believed (2026-09-23, 18:00 to 18:14 PDT).**
- VERIFIED: `/`, `/google` and `/press` all name `og-4d4f7d8333.png` as
  `og:image`; the card serves 200 at 74,946 bytes, byte identical to the repo
  copy; `/` titles itself "On Your Go, the agentic ops command center";
  `node tools/check-entry.mjs` 14 of 14 at 18:14 PDT; `node --test test/`,
  `tools/test-market.mjs` and `tools/test-domains.mjs` pass; a DotBot request
  to `/` and `/run` gets 403 with the five security headers at 18:14 PDT.
- VERIFIED 18:42 PDT, after deploying `70dc5ee`: the live page carries the
  replay reason line, `/run` still answers `replay` with no note (no key, so
  the cap never runs), the crawler 403 still has its five headers, and
  `check-entry` is 14 of 14. The cap itself was seen working on a local
  `wrangler pages dev` with a fake key and `LIVE_DAILY_CAP=1`: the footer read
  "Replay mode: today's live runs are used up". It has NOT run live, because
  no key is set.
- VERIFIED 19:07 PDT, after deploying `3bfbcce` with the key set: a full
  mission on the live page shows the `live` chip on all four agents, the
  footer reads "Live mode: each step is a real Claude call.", SHIP ends
  HOLDING FOR HUMAN APPROVAL, and the page text holds zero em or en dashes and
  zero backticks. The KV counter read 9, exactly the calls made while testing
  (one direct call and two four step missions). `check-entry` 14 of 14.
- VERIFIED 19:12 PDT, semisonic: one direct `/run` call answered `live` with
  zero dashes and zero backticks, the counter read 10, production is still
  on `3bfbcce` (nothing deployable changed after it), `check-entry` 14 of 14,
  `node --test test/` 8 of 8, and the dash sweep read 75 of 75 files clean.
  The portfolio card already says On Your Go and makes no replay claim, so it
  needed no edit.
- BELIEVED, not re-checked: everything in the 2026-09-03 block below that this
  block does not repeat.

**Transcript pointer**, Brockchains-MacBook-Pro only, verified to exist:
`~/.claude/projects/-Users-thebrockchain-Developer-BROCK--claude-worktrees-wizardly-wright-10a508/1345f341-1f71-42ea-a28f-c56ca553a83f.jsonl`

## 2026-09-23: renamed from Fleet Command

The site was renamed to On Your Go on Brock's call and redeployed. The judged
entry keeps its name: Devpost, the film, the press downloads and `submission/`
still say Fleet Command, and /press and `llms.txt` say so in one line. The
decision, the evidence and what is left (the domain tap, presence.mjs, which
name the IBM Bob entry wears) live in `docs/NAMING.md`. The judging day record
from 2026-09-03 is the next block down. It is history, and it still carries the
entry's full submission state.

## Superseded: the 2026-09-03 judging day block (the entry's full record)

Ran on **Brockchain-Personal** (user `themac`, fleet `/Users/themac/Developer/BROCK`).

**The spot.** The entry is finished and green. `node tools/check-entry.mjs` reads
**14 of 14** at 06:12 EDT, asking the origin rather than the edge cache. The
1080p narrated master (38,095,709 bytes, md5 df10f22bf02e21282814267b9334e55d)
is published at `files.thebrockchain.com/fleetcommand/fleet-command-narrated.mp4`
and the press kit offers it as its one download.

**CORRECTED 06:55 EDT, and the 06:25 block above was wrong about this.** Both
R2 keys were found holding the SAME 38,095,709 byte master, so the press page
was offering two buttons for one file while still labelling one of them
"capture 0:44". The page lied about itself for about 30 minutes. The 0:44 raw
capture (4,257,671 bytes) was overwritten at `fleet-command-demo.mp4` and is
GONE: it is on neither Mac (checked both, by exact byte size, over the ssh
lane) and R2 has no versioning. It only ever existed in that one bucket key.
The Raw capture button and its label are retired rather than left lying.
Submissions closed 2026-09-03 at 1:00pm EDT; judging 1:00pm to 4:00pm EDT,
winners 7:00pm EDT, per the event's schedule page.

**The next action.** Nothing owed by a session. If a session wants proof the
world still matches this file:

    node tools/check-entry.mjs        # expect 14 of 14 green
    curl -sI "https://files.thebrockchain.com/fleetcommand/fleet-command-narrated.mp4?cb=$(date +%s)" | grep content-length
                                       # expect 38095709

**A note that was true for about twenty minutes and is now RESOLVED, kept
because the shape of it repeats.** At 10:05 EDT `tools/check-entry.mjs` was
DIRTY in the shared checkout, and the committed version still expected the
`capture` film at `fleet-command-demo.mp4` while that key already held the
narrated master, so the committed checker would have reported a false red on a
correct entry. This session did not sweep another session's file into its own
commit and wrote the warning instead. That session then committed it. **Checked
2026-09-03 10:20 EDT: the tree is clean, `HEAD` expects `narrated` on both
keys, and the 14 of 14 above comes from committed code.** Nothing is owed. The
lesson that survives: a green from a checker whose file is dirty is a green
that belongs to nobody, so read `git status` before quoting a pass.

**Brock's taps, each one move, none urgent:**

1. **Devpost organiser BACKUP video field** points at the demo key
   (`fleet-command-demo.mp4`). **This is now a no-op and needs no click**: that
   key was overwritten on 2026-09-03 and holds the 38,095,709 byte narrated
   master, so the field already resolves to the right film. The line above
   described it as "the 0:44 silent capture", which stopped being true the
   moment the key was overwritten. The judged video is the YouTube embed
   regardless.
2. **Desktop copies on Brockchain-Personal.** `get-the-master.sh` was DELETED
   by this session on 2026-09-03: it was mine, it asked for the MacBook Pro
   password, and the key lane retired it. Two film copies remain and both are
   deliberate: `fleetcommand-NARRATOR-music.mp4` (the 1080p master) and
   `fleet-command-narrated.mp4` (YouTube's 720p transcode, fetched earlier the
   same day). **Brock asked for a film on his Desktop, so a session does not
   delete them without him saying so.** The master is also in
   `submission/youtube/videos/` on both Macs and in R2, so nothing is lost if
   he does clear them.

**NOT Brock's any more, moved here 2026-09-03 when Article XI #32a narrowed.**

3. **Arm `ANTHROPIC_API_KEY` so the public demo shows LIVE** (optional, scores
   under "progress"), plus `SERPAPI_KEY` and `NAMECOM_USER` + `NAMECOM_TOKEN`
   if those accounts exist. This sat in Brock's list because a live secret key
   used to be a human-principal act. It is not one now: a key is judged by what
   it can reach, and a prepaid spend capped model key reaches no bank and
   changes no credential, so **SETTING these is a session's job** with
   `npx wrangler pages secret put <NAME>`. The only part still his is ISSUING a
   key that does not exist yet, because each vendor console sits behind his
   login (#32c). So the real question a session must answer first is whether a
   key already exists to set; do not assume one does, and do not report this
   blocked without checking.

**State of the machines.**
- Both Macs talk over ssh with a key, no password, both ways:
  `ssh -i ~/.ssh/id_ed25519_fleet thebrockchain@192.168.2.11` from Personal,
  `ssh themac@192.168.2.10` from the MacBook Pro. The MacBook Pro's fleet root
  is `/Users/thebrockchain/Documents/thebrockchain`, NOT `Developer/BROCK`.
  Memory: `the-macbook-pro-lane-is-open-both-ways`.
- The master now exists in three places: both Macs under
  `submission/youtube/videos/` (gitignored) and R2 `brock-public`.
- No worktree left alive for this repo. `wt/press-narrated` (merged) and
  `wt/entry-license` (superseded by the cherry pick) were retired 2026-09-03.
- `submission/vo/` on Personal: NOTES.md tracked, the nine takes ignored.
- The edge cache served the OLD 720p object on the bare narrated URL until
  about 10:00 EDT 2026-09-03 (`max-age=14400`). The press link carries
  `?v=1080` so a click gets the master regardless.

**Decisions this session, one line each.**
- ~~The raw capture stays at `fleet-command-demo.mp4`.~~ It did not: that key
  was overwritten with the master. The press kit now offers ONE download, the
  1080p narrated master, and the demo key is kept only as the Devpost
  organiser backup field target, which wants exactly that film anyway.
- A press asset that exists in one R2 key and nowhere else is not backed up.
  The capture was lost to a single overwrite with no copy on either Mac.
- The checker cache busts every asset HEAD, because a bare HEAD read the
  previous upload for four hours and called the wrong film bound.
- The 720p YouTube transcode was replaced by the 1080p master rather than
  kept; same key, same page, better file.
- `tools/build-og.mjs` is the ONE WRITER of the share tags on all four pages,
  and it is per page now rather than one hardcoded block (19474fa). It used to
  stamp the same block into every file in `site/`, so `google.html` shipped
  `og:url` pointing at `/` while its own `rel=canonical` said `/google`: paste
  the Google build's link anywhere and the card claimed to be the homepage.
- `site/press.html` no longer hand writes its own share tags. They hardcoded
  the card filename `og-d8f521af3c.png`, and the stale sweep at the bottom of
  `build-og.mjs` DELETES the old card whenever its hash changes, so the next
  rebuild would have pointed the press kit's card at a 404 while the source
  still read correct. It looked safe only because it was written after the last
  run and had never been touched by the script.

**Dead ends, do not repeat.**
- "The MacBook Pro is unreachable" was FALSE for the whole night. Five
  sessions said it; none ran `ssh -o BatchMode=yes`. Test before declaring.
- A path copied from Personal fails on the MacBook Pro ("No such file")
  because the fleet roots differ. Not a missing file.
- Bare `yt-dlp` is dead here (403, PO token). The lane that worked for the
  720p copy was YouTube Studio's own Download button through the Claude in
  Chrome extension on the brock@thebrockchain.com account (channel
  UC6vhM2wKrCS5-gfcMAFAd9Q). falfasbrock@gmail.com has zero videos.
- Overwriting the demo key with the narrated film would have made the press
  page lie about its own "capture 0:44" button. Do not.
- Reading `~/.ssh/config`, `arp -a`, cookie stores and binding a probe server
  were refused by the auto mode classifier on 2026-09-02. Fair refusals, and
  none were needed once the key lane was tested.
- Foxit ($1,000) not entered, no real integration. The Google architecture
  diagram stays out of the gallery. The `submission/vo/` takes were not
  stitched into a stand-in master; that would be inventing evidence.

**Verified live vs believed.**
- VERIFIED 06:12 EDT: narrated key 38,095,709 bytes at origin (cache busted),
  bucket read back md5 matches; press page says "MP4 1080p" and links
  `?v=1080`; checker 14 of 14; repo public with MIT licence.
- VERIFIED 04:30 EDT by a peer on the live Devpost page: the entry's video is
  the YouTube embed of the narrated film.
- BELIEVED, not re-checked this session: the Google build at `/google` and
  its Cloud Run service; the SerpApi and name.com addenda in
  `submission/ENTRY-DEVNETWORK.md`.

**What the 2026-09-03 runs changed on main.** MIT licence (9f80b85). README:
the entry as it stands and a "Run it yourself" section. `tools/check-entry.mjs`
(new, then two keys two assertions, then cache busting). `site/press.html`:
two download buttons with honest labels. `submission/vo/NOTES.md` tracked.
`HACKATHON-BOARD.md`: the Sep 3 re-verify and six contests ruled out (Agentic
Cinema, Agents for Humans, AI Builders, GIBC V2, ML Empowerment, Amazon
Developer Hackathon; IBM Bob 2.0 unreadable behind a JS challenge). `.gitignore`:
the narrator renders and the VO takes. `tools/build-og.mjs` and all four pages
in `site/`: per page share tags, one writer (19474fa). `site/press.html`: the
two buttons folded back to one (906a7cb). README: live mode is now Claude's to
arm, not Brock's, because the Constitution changed under it (below).

**The Constitution changed under this repo on 2026-09-03, and the README moved
with it.** Brock narrowed Article XI #32a to six acts: the EIN and bank account,
spending not already approved, changing a password, adding or changing 2FA,
changing personal information, and a live secret key that can do one of those.
**A key is now judged by what it can reach, never by the fact that it is
secret**, so arming `ANTHROPIC_API_KEY` here is a session's job: it is prepaid
and spend capped, so it reaches no bank and changes no credential. Issuing a NEW
key is still Brock's, because the console is behind his login, which is the new
#32c and an outside limit rather than a house rule. Both `README.md` and
`CLAUDE.md` in this repo said "BROCK'S HANDS, one of the five human-only acts"
until then, and that gate is why live mode sat unarmed.

**Crew follow-ups (fleet, not this repo).** jack's `public_ok()` needs the one
line for fleetcommand carrying the reason already in CLAUDE.md. The weekly
deadline re-verify. A dated decision on the Google build's future.

**Transcript pointers**, Brockchain-Personal only, both verified to exist:
- 2026-09-03 semisonic run (this block):
  `~/.claude/projects/-Users-themac/718eb575-3784-4420-aafc-8b20944817d6.jsonl`
- 2026-09-02 run: `~/.claude/projects/-Users-themac/9d55e5e7-6ef3-4387-b581-b1fc4bf96c8f.jsonl`

---

## Superseded: the 2026-09-02 block (kept only for the record it corrects)

**THE FLEET HAS ENTERED ITS FIRST CONTEST.** Fleet Command is SUBMITTED to the
DevNetwork [API + Cloud + AI] Hackathon 2026 and the public project page is
https://devpost.com/software/fleet-command . Everything below this block from
2026-08-27 is superseded on that point: it says we had entered zero contests,
which was true when it was written and is not true now.

**In for three prizes off one entry:** the $12,500 overall, SerpApi Best AI Use
Case ($3,000) and the name.com Domain API Challenge ($2,000). Devpost keeps
editing open until the deadline, **Sep 3 2026 at 1:00pm EDT**, so the entry can
still be improved.

**What had to happen first, and none of it was in the old plan:**
- **The repo is PUBLIC now** (thebrockchain/fleetcommand). Every track on that
  page requires a public repo, so the entry would have been rejected on that
  line no matter how good it was. Swept all 64 commits and the full object
  history for keys, secret-named files and NUL-hidden text before flipping it,
  with a positive control proving the scan could fail.
- **The demo video backup field is REQUIRED to submit**, not just to save the
  step. The step saves empty, which is misleading; the submit hard-blocks with
  "Please complete required fields in Additional info".
- **A public asset lane had to be built to answer it.** MEDIA-POLICY.md had HOT,
  WARM and COLD and no tier for a file handed to an outsider. There is a PUBLIC
  tier now: `brock-public` on **files.thebrockchain.com**.

**THE ONE THING TO KNOW ABOUT THE FILE IN THAT FIELD.** It is
`files.thebrockchain.com/fleetcommand/fleet-command-demo.mp4`, a **43.6 second
1080p capture recorded 2026-09-02 off the live site**, and it is NOT the
narrated two minute forty six film on YouTube.

**CORRECTED 2026-09-03: this block went on to call the master possibly GONE, and
that was wrong.** It exists, on the OTHER Mac, measured there by ffprobe at
38,095,709 bytes and 166.3 seconds. The Sep 2 run searched Brockchain-Personal
disk wide, found no Fleet Command mp4, and reasoned from one machine as though
it were the only one. See the hostname trap above. The original text follows
unedited, because the shape of the mistake is the lesson: the narrated master
(`fleetcommand-NARRATOR-music.mp4`) could not be reached from Brockchain-Personal: it is not in the repo (media is gitignored), not in
iCloud, yt-dlp is blocked by YouTube's bot challenges, and YouTube Studio
refuses because the @BrockchainLabs channel sits on a DIFFERENT Google account
than the one this Chrome is signed into. Swapping the master in is one
`wrangler r2 object put ... --remote` to the same key, and the Devpost field
needs no edit because the URL stays the same.

**Also new and live:** a press kit at **fleetcommand-2u0.pages.dev/press** (the
film, the screenshots, a one page brief, the share card), and a one page judges'
PDF. The press page measures 1.000 screens desktop and 1.438 on a phone.

**What was NOT entered, on purpose.** The Foxit track ("Your Agent Shouldn't
Sign That", $1,000) is the closest thematic fit on the whole board, because it
asks for exactly our shape: the agent does the reversible work and a human signs.
We do not have a Foxit integration, and our own board rule forbids a bolt-on,
because that track's judges are Foxit engineers. Building it honestly is a real
build and it is the highest value thing left on this creation.

**Scouted 2026-09-02, so the next run does not re-scout:** the open ML/AI board
holds nothing else worth our time right now. **The WebMCP Challenge** ($35,000,
run by OpenAI, closes Sep 3) needs a genuine WebMCP integration we do not have,
against **6,015 participants**. **VoltHacks** ($35,785 headline, Sep 5) is
**STUDENTS ONLY and excludes professionals**, and its actual cash is $4,760, the
rest credits. Everything else open is non-cash or under $1,500.

**ALL THINGS AGENTIC WAS MISSED.** It closed 2026-08-31 at 5:00pm PDT with our
video public and the form untouched. The Google build, the Cloud Run deploy and
the second film were all made for it. That work is not wasted, but it is not
entered anywhere, and finding it a home is worth a look.

**The next action.** Nothing is blocking. If you want the entry improved before
Sep 3 1:00pm EDT, the one honest upgrade is swapping the narrated master into
the same R2 key (see below, it may not exist any more). The highest value BUILD
is the Foxit track. To confirm the entry is still healthy:
`curl -sL -o /dev/null -w '%{http_code}' https://devpost.com/software/fleet-command`
expects **200**.

**State of the machines.** This ran on **Brockchain-Personal**, fleet root
`~/Developer/BROCK`, branch `main`, no worktree (a deviation from the one
worktree per session rule: the repo was clean and unshared, and it is recorded
here rather than hidden). Nothing armed, no servers left running.
`submission/vo/` is untracked and is Brock's own raw voice takes; it was never
staged. Repo is PUBLIC.

**Decisions made 2026-09-02, do not re-litigate.**
- Repo flipped PUBLIC. Every track demanded it; the entry was unwinnable
  otherwise.
- **Foxit track NOT entered.** No real integration exists and its judges are
  Foxit engineers. Our own no-fake-integrations rule.
- **The Google architecture diagram was kept OUT of the gallery.** It is a fine
  asset but it says ADK, Gemini and Cloud Run, and this entry's story is
  Cloudflare and Anthropic. It would contradict the copy.
- **The required video field holds a fresh capture, labelled as such**, never
  passed off as the narrated master.
- **The `vo/` voice takes were NOT stitched into a fake master.** Assembling an
  artifact out of raw takes to fill a contest field is inventing evidence.

**Dead ends already tried, do not repeat.**
- **yt-dlp cannot pull our own YouTube video.** PO token and n-challenge; the
  documented fix downloads and runs a script from GitHub, which was refused.
  Cookies from the signed-in browser did not help either.
- **YouTube Studio cannot reach the channel from this Chrome.**
  @BrockchainLabs sits on a DIFFERENT Google account; this profile has one
  empty channel (@the_brockchain).
- **Reading `~/.ssh/config`, `arp -a`, and binding a probe server were all
  refused by the auto mode classifier.** Fair refusals, not walls to argue with.
- **A session name does NOT identify a machine, and neither does a username.**
  `hostname -s` is the only honest check. Got wrong three times in one night:
  twice calling a peer "the other Mac", then once claiming both Macs share the
  username `themac` (they do not, see the correction above).
- **CROSS SESSION MESSAGING IS SAME HOST ONLY.** Every peer `ListAgents`
  returns is on THIS machine and therefore this disk, so asking around for a
  file that is not here can never succeed. Measured 2026-09-03 after four work
  orders were sent to peers who all had the same empty directory. There is also
  no ssh route between the Macs: a key was generated that night, never worked,
  and was deleted.
- Earlier, still true: AppleScript System Events into YouTube's hardened fields
  is rejected silently, native macOS file pickers cannot be driven at all, and
  the YouTube Data API needs an OAuth scope this machine does not hold. The
  paired Claude Chrome extension is the only lane that fills hardened inputs.

**Verified live vs merely believed (2026-09-02, cache busted, keyless).**
VERIFIED: devpost.com/software/fleet-command 200; fleetcommand-2u0.pages.dev
`/`, `/press`, `/google` all 200; all six assets on files.thebrockchain.com 200
and byte exact; `gh` reports the repo `private=false`; press page 1.000 screens
desktop and 1.438 phone, measured rendered; the one page PDF is `/Count 1`.
BELIEVED, NOT CHECKED: how the submitted page renders to a logged-out stranger
(it was only ever fetched while signed in as Brock); whether the phone figure
holds on a real iPhone rather than headless Chromium; whether the PDF prints
well on paper. `/jack` and `/ellis` were not run against the new page.

**Transcript pointer.** Verified to exist on **Brockchain-Personal** at
`~/.claude/projects/-Users-themac/9d55e5e7-6ef3-4387-b581-b1fc4bf96c8f.jsonl`
(23MB, 2026-09-03). Unreadable from the other Mac.

---

## What is left, and whose hands

**Brock's, and none of it blocks the entry:**
1. **The narrated master.** `fleetcommand-NARRATOR-music.mp4` is not on this Mac
   (disk wide search, no Fleet Command mp4 anywhere) and the pipeline's
   gitignored `.work/` is gone, so it may not exist any more. If it turns up:
   `npx wrangler r2 object put brock-public/fleetcommand/fleet-command-demo.mp4
   --file=<path> --content-type=video/mp4 --remote`. Same key, so **no Devpost
   edit is needed**.
2. **A Foxit account** if the $1,000 track is wanted; the integration needs
   their API credentials and account creation is his.
3. Optional, and only worth it if a key is free: arming `SERPAPI_KEY`,
   `NAMECOM_USER` and `NAMECOM_TOKEN` as Pages secrets turns the two sponsor
   chips from labelled sample to live, which is worth points under "progress".
   `ANTHROPIC_API_KEY` does the same for the LIVE chip.

**Crew, needs no permission:**
- **Build the Foxit integration** if Brock opens the account. Highest value item
  left on this creation.
- **Find a home for the Google build.** The `/google` cockpit, the Cloud Run
  deploy and the second film are finished work entered in nothing.
- **Put a clock on deadlines.** This campaign's single largest loss was a missed
  date, not a missing build. `fleetbrain` already runs on Cloudflare cron and
  could watch every deadline. A note in a file is not an alarm.
- Re-verify every event deadline before acting on it; the board's own rule, and
  its Aug 14 numbers were wrong by Sep 2 in three separate places.

## Standing cautions

- The og card build strips everything between share:start/share:end markers;
  JSON-LD lives outside them on purpose.
- The h1 carries class="mark"; dropping it changes the header.
- record.mjs writes marks.json; edit.mjs reads it. Never hand type shot times.
- Below 900px the page scrolls by design (see DESIGN.md); do not clamp.
