# On Your Go

Renamed from Fleet Command on 2026-09-23, on Brock's call (`docs/NAMING.md`).
The DevNetwork hackathon entry was entered and judged as Fleet Command, so the
Devpost page, the film, the press kit downloads and `submission/` keep that
name, and the site says so in one line where it points at them (/press and
`llms.txt`). Never rewrite that record. The repo, the Pages project
`fleetcommand`, the pages.dev host and the R2 paths keep the old name until a
rename of those is built on purpose.

The public agentic ops cockpit and the fleet's hackathon entry. A judge
lands with no login, watches four AI agents work a synthetic mission
(Harbor Lane Bakery), and every deploy HOLDS at the human approval gate.
The gate is the product: AI drafts, people decide.

Born public on purpose. 100% synthetic data, zero fleet secrets, no
connection to the walled ainow room.

## Live

- URL: https://fleetcommand-2u0.pages.dev
- Healthy answer: 200 on `/`, and a Run shows the `live` chip (armed
  2026-09-23). Past the daily cap, or if a call fails, it shows replay and the
  footer says why. `/google` serves the Google-native build.
- Press kit: https://fleetcommand-2u0.pages.dev/press
  Healthy answer: 200, and its four download buttons resolve on
  files.thebrockchain.com. A 404 on any of those means the asset lane broke,
  not the page.
- Public assets: https://files.thebrockchain.com/fleetcommand/
  (`brock-public` R2, the PUBLIC tier in the fleet MEDIA-POLICY.md). Holds the
  demo MP4, three screenshots, the share card and the one page brief.
  **Anything put here is published**, so nothing uncleared goes in it.
  **`wrangler r2 object put` needs `--remote`** or it writes to a local
  simulated bucket, prints success, reads back correctly, and leaves the real
  bucket empty while every public URL 404s.
- Repo: https://github.com/thebrockchain/fleetcommand
  **PUBLIC since 2026-09-02**, because every DevNetwork track requires a public
  repo. Swept for keys and secret-named files across all commits before the
  flip. Keep it that way, and keep secrets out of it accordingly.
- Devpost entry: https://devpost.com/software/fleet-command (SUBMITTED and
  judged as Fleet Command; it did not place, per `docs/NAMING.md`)

## Deploy

No build step, no runtime deps. From this folder:

    npx wrangler pages deploy --branch main

Security headers ride every response via `functions/_middleware.js`.

**On-switch**: replay mode is the default. Live agent runs arm only when
`ANTHROPIC_API_KEY` is set as a Pages secret. **Setting it is CLAUDE'S**
under Constitution XI #32a as Brock narrowed it on 2026-09-03: a key is
judged by what it can reach, and a prepaid, spend capped model key reaches
no bank and changes no credential. Only ISSUING a new key is his, because
the console sits behind his login (#32c). This line read "Brock's hands,
one of the five human-only acts" until then, and that gate was never real:

    cd ~/Documents/thebrockchain/fleetcommand && npx wrangler pages secret put ANTHROPIC_API_KEY --project-name fleetcommand && npx wrangler pages deploy --branch main

The redeploy is part of it: a Pages secret reaches only deploys made after it.
The `cd` is part of it too: run from `~` on 2026-09-23 without it, the secret
half failed with "Missing Pages project name" and nothing was set. That path is
the MacBook Pro's fleet root; on a merged checkout use this repo's own folder.
**Armed 2026-09-23 19:03 PDT with a key Brock issued for this site.** Before
that, the only Anthropic key line a search found on Brockchains-MacBook-Pro was earpiece's own (`earpiece/.dev.vars`,
value never read), and it was NOT borrowed: one creation's spend never rides another's key
(Constitution Article I #4), least of all on a public page. Live calls are
capped per UTC day by the spend guard in `functions/run.js` (default 100),
which fails closed to replay and says why on screen. The hard ceiling is the
spend limit on the key's own Anthropic workspace, not this code.

The link preview card is generated: `node tools/build-og.mjs` rewrites the
block between `share:start` and `share:end`, and writes `brand/og-card.html`
too. Hand edits to either are overwritten on the next run, so change the card
in the script. (The 2026-09-10 font cleanup edited `brand/og-card.html` by
hand, and the 2026-09-23 rename build put Google Fonts straight back.)

Two entries live in `submission/`: DevNetwork (this Cloudflare cockpit)
and All Things Agentic (the Google ADK / Gemini build under `google/`).

## Lessons that apply here

- [[fleetcommand-hackathon-campaign]] - the campaign shape, entry copy,
  and the two-key ignition
- [[hackathons-hub]] - the walled war room behind this; edit facts there
- [[logo-home-rule]] - keeping the header logo behavior consistent
- [[meters-beat-ai-ears]] - if you touch the demo video mix, measure with
  volumedetect ratios; do not trust an AI-ear review

## Fleet-wide rules

The fleet rules live in the brock root's CLAUDE.md - dashes ban,
one-screen homepage, spacing ceiling, LEAN, security headers, no-AI-look
copy. Do not duplicate here. **Auto-loaded only on a MERGED checkout**
([../CLAUDE.md](../CLAUDE.md), Brockchain-Personal), where the brock
root is this folder's parent; on a SPLIT one it is a sibling
([../brock/CLAUDE.md](../brock/CLAUDE.md), Brockchains-MBP) and nothing
loads it for you, so open it yourself.
