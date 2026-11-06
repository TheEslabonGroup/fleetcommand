# The Hackathon Board

**RE-VERIFIED 2026-09-03 02:05 EDT against each event's own live page.** The
DevNetwork field is **1,358 participants** this morning (1,342 yesterday), the
deadline holds at **Sep 3, 10:00am PDT (1:00pm EDT)**, judging runs 10:00am to
1:00pm PDT and winners are announced 4:00pm PDT the same day, all read off the
event's schedule page. Six more open contests with real cash were checked from
their own pages and ruled out (Agentic Cinema, Agents for Humans, AI Builders,
GIBC V2, ML Empowerment, the Amazon Developer Hackathon: each is students only,
a different required stack, or device builds); the reasoning per event is on
the live board. IBM Bob 2.0 could not be re-read (lablab.ai sits behind a
Cloudflare JS challenge) and is marked unverified since Aug 25. The narrated
2:46 film master turned out to be ON THIS MAC, so swapping it into the entry's
video field is one command (see NEXT.md).

**RE-VERIFIED 2026-09-02 against each event's own live page.** The 2026-08-14
pass below it is kept for its reasoning, but three of its headline numbers were
already wrong by today and are corrected here first.

## The state of play, 2026-09-02

**ENTERED, and it is the fleet's first ever contest entry:**
**DevNetwork [API + Cloud + AI] Hackathon 2026**, submitted, public page at
https://devpost.com/software/fleet-command . One entry against three prizes: the
$12,500 overall, SerpApi ($3,000) and name.com ($2,000). Editing stays open
until the deadline.

**Three corrections to the Aug 14 numbers, all measured off the live page:**
- The pool is **$39,500**, not the $45,500 recorded below. Sponsor tracks were
  dropped after that pass, including useBruno, Wundergraph and Apptio, which the
  old notes named as cheap wins. They no longer exist.
- The deadline is **Sep 3 at 1:00pm EDT**, which is a MORNING cutoff on the west
  coast (10:00am PDT). The old board wrote "Sep 3" with no time, and a session
  reading it would have assumed end of day and missed by hours.
- The field is **1,342 participants**, which the old board never recorded at all.

**MISSED: All Things Agentic.** Closed 2026-08-31 at 5:00pm PDT. The Google
port, the Cloud Run deploy and a second narrated film were built for it and it
was never entered. The single largest avoidable loss on this board, and the
cause was not the build: nobody was watching the clock.

**Scouted 2026-09-02 and ruled out, so nobody re-scouts them:**
- **The WebMCP Challenge**, $35,000, run by OpenAI, closes Sep 3. Needs a real
  WebMCP integration we do not have, and the field is **6,015 participants**.
  A bolt-on would break our own no-fake-integrations rule.
- **VoltHacks**, $35,785 headline, Sep 5. **STUDENTS ONLY, professionals
  explicitly excluded**, so we are ineligible. Its real cash is **$4,760**; the
  rest is credits and subscriptions. A headline prize number is not a cash pool.
- Everything else open under Machine Learning/AI is non-cash or under $1,500.

---

## The Aug 14 pass, kept for its reasoning

Live intel as of **2026-08-14**. Everything here was fetched from the event's
own page that day, not from memory. Where a date could not be confirmed it says
so. **Read the corrections above before acting on any number below.**

The entry is **Fleet Command** (`fleetcommand-2u0.pages.dev`): four agents
(SCOUT / AUDIT / MEDIC / SHIP) working a synthetic target, every deploy holding
at a human approval gate. Build is DONE. Capture is recorded. Entry copy is
staged in `submission/`.

---

## 1. The board, ranked by expected value

### TIER 1 - enter these

**DevNetwork [API + Cloud + AI] Hackathon 2026** - the main event
- **Where:** online (api-cloud-ai-hackathon-2026.devpost.com). In-person awards
  at Santa Clara Convention Center Sep 2-3, attendance not required to win.
- **When:** submissions **Aug 17 to Sep 3, 2026**. Opens in 3 days.
- **Money:** **$45,500 cash** (revised up from the $40,500 in the old notes).
  - Overall Winner: **$12,500**
  - SerpApi: $3,000 (2 winners) - Perfect Corp: $2,500 (2) - Xano: $2,500 (2)
  - name.com: $2,000 (2) - Nutrient: $1,500 (2)
  - Foxit, Apptio, Doctavian, useBruno, Wundergraph: $1,000 each (2 winners each)
- **Judged on:** Progress (how far you got) - Concept (does it solve a real
  problem) - Feasibility (could this be a company).
- **Submit:** name, one-line pitch, public repo, 2-4 min demo video, setup
  instructions, build story.
- **Why it is number one:** 11 sponsor tracks, 2 winners each = **22 cash slots
  plus the overall**. Sponsor tracks are where the competition thins out. This
  is the only event where one build can be entered against many prizes.

**All Things Agentic Hackathon (Google)** - the big pool
- **Where:** online, global (allthingsagentichackathon.devpost.com).
- **When:** deadline **Aug 31, 2026, 5:00pm PDT**. 17 days.
- **Money:** **$180,000**. Grand Prize $50k - three track winners $20k each -
  Startup Excellence $20k - **Individual/Hobbyist $10k (2 winners)** - Best
  Architecture and Best Multimodal UX $5k each - 5 honorable mentions at $2k.
- **The catch:** every project must use **Gemini 3.5+**, **a Google agent
  framework** (ADK, GenAI SDK, Antigravity SDK or GenKit), and **a Google Cloud
  service** (Cloud Run, Firestore, Pub/Sub, GKE...). Fleet Command is Cloudflare
  plus Anthropic. That is a real port, not a checkbox.
- **Judged on:** Innovation and operational utility 40% - architectural
  discipline 30% - demo and production readiness 30%.
- **Submit:** hosted URL, repo, README with setup, **architecture diagram**,
  ~4 min demo video.
- **The play:** do NOT chase the $50k grand prize. Aim at the **Individual /
  Hobbyist $10k** and the **Fortified Enterprise Fleet** track. "Agent fleet
  with compliance controls and a human gate" is literally what Fleet Command
  already is. The gate is the differentiator every enterprise judge wants.

**IBM Bob 2.0 Hackathon** - the cheap ticket
- **Where:** online, lablab.ai plus their Discord.
- **When:** **Sep 25 to 27, 2026**, 48 hours, Friday to Sunday.
- **Money:** $10,000.
- **Why:** 48 hours, solo allowed, no build cost until the window opens. The
  battle plan is already written at `submission/ENTRY-IBM-BOB.md`. By rule the
  build happens inside the window, so nothing to do before Sep 25 except enroll.

### TIER 2 - verify before spending anything

**Descope Global MCP Hackathon**
- Runs Aug 12 to Sep 10, $25,000 cash plus $100k in credits, teams to 5,
  three tracks (purposeful agent / secure MCP server / agent-to-agent), judged
  on utility, creativity, **security and access control**, execution.
- **Unverified:** Descope's own blog dates this **2025**, a news write-up dates
  it **2026**, and hackerearth 500s. It may be last year's event. **One click
  settles it: globalmcphackathon.com.** If it is live, it is a strong fit - our
  whole pitch is scoped access and a human gate.

### RULED OUT - do not spend a minute here

| Event | Why not |
|---|---|
| Aiify Agentic AI World | **Concluded Sep 2024.** The old campaign note had this as a live Sep 22 target. It was wrong. |
| UiPath AgentHack 2026 | Closed Jun 29, winners announced Aug 4. $48k gone. |
| DevNetwork [AI + ML] 2026 | Ended May 28. |
| Deep Agents / Production Agents | In-person SF, already run. |
| ElevenLabs x Cloudflare | Ended, and 1st place was $100k in **credits**, not cash. |
| AI Builders Challenge w/ IBM Bob ($15k) | **University students only.** |
| GSA MCP & AI Agent Hackathon | Federal employees, and by law **no money prizes**. |
| Anthropic "Built with Claude" events | Pay **API credits**, and are application-gated (~500 of 13k). Good for credits and contacts, not cash. |
| Algora / agent bounty markets | 8 to 158 PRs per bounty within hours. Negative EV. |

**Cash actually reachable in the next 6 weeks: $235,500 in pools, realistically
$12,500 to $30,000 in slots we can genuinely compete for.**

---

## 2. How you actually win these

Judging rubrics across all three tier-1 events reduce to the same four things.
This is what to optimize, in order.

1. **The demo video is the entry.** Judges watch 2 to 4 minutes and skim the
   rest. Ours is captured (2:44) and scripted. It must open on the problem in
   the first 10 seconds, not on the architecture.
2. **Show it working live, not described.** DevNetwork grades "progress",
   Google grades "production readiness" at 30%. A hosted URL a judge can click
   beats any slide. Fleet Command is already live - that alone puts us past most
   entries, which are localhost.
3. **Answer "could this be a company."** DevNetwork asks it outright as one of
   three criteria; Google calls it operational utility at 40%. The answer is
   written and true: agent fleets are shipping code today with no approval
   layer, and the gate is the product.
4. **Enter every track you legitimately qualify for.** This is the single
   biggest EV lever on the board and it is free. See below.

### The DevNetwork multiplier (the sharpest move available)

One build, entered against several sponsor challenges. Each sponsor track has
its own judges and its own thin field. Fleet Command's agents can honestly use:

- **SerpApi ($3,000)** - SCOUT already does reconnaissance. Wire the search step
  to SerpApi and it is a genuine, not bolted-on, integration. Biggest sponsor
  purse on the board.
- **name.com ($2,000)** - SHIP handles deploy. A domain-check or registration
  step at ship time is a real fit.
- **useBruno ($1,000)** - API collection for our own endpoints. Cheapest track
  to qualify for; we already have the API surface.
- **Xano ($2,500)** or **Wundergraph ($1,000)** - backend / graph layer, only if
  it can be done honestly without gutting the Cloudflare stack.

Rule we do not break: **no fake integrations.** If a sponsor's tool does not
genuinely improve the build, we skip that track. Judges are that sponsor's own
engineers and they can tell in 30 seconds.

Estimated work: SerpApi and name.com are roughly a day each inside the existing
agent runner. That day is worth up to $5,000 in additional shots.

---

## 3. The calendar

| Date | What happens | Whose hands |
|---|---|---|
| **Now to Aug 16** | Voice the demo capture, upload to YouTube public | **Brock** (voice) |
| **Now to Aug 16** | Verify Descope MCP year; scope the Google port | Claude |
| **Aug 17** | DevNetwork submissions OPEN - register | **Brock** (ToS) |
| **Aug 17-24** | Wire SerpApi + name.com into SCOUT and SHIP; re-record if the LIVE chip is on | Claude |
| **Aug 25-30** | Google port decision point: build the Individual/Hobbyist entry or pass | both |
| **Aug 31, 5pm PDT** | All Things Agentic deadline | **Brock** (submit) |
| **Sep 3** | DevNetwork deadline - submit main + every sponsor track | **Brock** (submit) |
| **Sep 8-10** | Descope deadline, if 2026 is confirmed | **Brock** (submit) |
| **Sep 25-27** | IBM Bob 2.0, 48h build window | both |

---

## 4. What waits for Brock (the gated edges)

Everything else is already moving. These four cannot be done from a session:

1. **Voice the demo.** Play `~/Desktop/fleetcommand-demo-capture.mp4` (2:44,
   silent) against the marks table in `submission/VIDEO-SCRIPT.md`. This is the
   single highest-leverage 15 minutes on the whole board - no video, no entry.
2. **Upload it public to YouTube** and drop the link into the entry files.
3. **Register** for each event. Accepting ToS is human-only, no exception.
4. **Submit.** Publishing under Brock's name is a gated edge.

Optional but stronger: **arm `ANTHROPIC_API_KEY`** as a Pages secret so the demo
runs live instead of labeled replay mode. A live secret key is human-only
(Article XI #32). Replay mode is honest and demoable, but the LIVE chip on
camera is worth points under "production readiness".

---

## 5. What the old notes got wrong

Recorded so it does not repeat: the 2026-08-09 campaign note listed **Aiify
Agentic World, $5,000, submit by Sep 22** as target number two. That event
**concluded in September 2024.** It was carried forward without a re-check, and
`submission/ENTRY-AIIFY-AGENTIC.md` was written for a dead event. The DevNetwork
pool was also understated at $40,500; it is $45,500.

Lesson, and it is the standing one: **re-fetch every deadline from the event's
own page before working against it.** Hackathon intel decays in days.
