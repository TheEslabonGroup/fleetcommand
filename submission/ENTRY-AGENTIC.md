# All Things Agentic entry: Fleet Command

Deadline: Aug 31, 2026, 5:00pm PDT. Paste from here into the Devpost form.
Tracks: **Individual / Hobbyist** and **Fortified Enterprise Fleet**.

## Project name

Fleet Command

## One-liner

An AI ops crew that does the work, and a human approval gate the framework
itself enforces. The gate is the product.

## Inspiration

Agent fleets are shipping code today with no approval layer. Small businesses
cannot afford an operations crew at all. Fleet Command answers both: four
specialist agents do the ops work, and every consequential action freezes at a
human gate that is structural, not a prompt-engineering promise.

## What it does

Four ADK agents work a synthetic target site in sequence. SCOUT does
reconnaissance and reads the live market around the target through SerpApi.
AUDIT ranks the defects by severity. MEDIC drafts the actual fix as a diff,
and never applies it. SHIP checks the registrar (name.com) on the deploy
target's own domain, stages the deploy, and then the framework pauses the
invocation server-side. A rejected release never executes at all. An approval
resumes the same paused invocation. AI does the work; a person holds the
trigger.

## How we built it

- **Google ADK** `SequentialAgent` runs the crew; each agent writes an
  `output_key` and the next reads it as an instruction placeholder.
- **The gate** is `FunctionTool(stage_deploy, require_confirmation=True)`:
  ADK pauses the run and emits `adk_request_confirmation`; the cockpit answers
  it with the human's real decision. The app is resumable
  (`App(resumability_config=...)`), so approval resumes the SAME invocation.
- **Gemini** (`gemini-3.7-flash`) powers all four agents **through Vertex AI
  as the Cloud Run service's own identity - no API key exists anywhere in the
  deployment.**
- **Cloud Run** (us-central1) serves the ADK API; the one-screen cockpit is
  zero-dependency hand-rolled HTML/CSS/JS talking to it over SSE.
- The intel tools run honestly: without keys armed they serve clearly labelled
  SAMPLE data; armed, the same code path goes live.
- **Even the demo film is Google-made:** the score is one continuous Lyria
  RealTime performance steered live at the film's story beats, and the
  narration is gemini-3.1-flash-tts.

## Challenges

Making the human hold REAL, not theatrical: on our Cloudflare original the
gate was a client-side convention. Porting it onto `require_confirmation` and
invocation resume made the pause structural. Second: shipping with zero
secrets, which Vertex-via-service-identity made possible.

## Accomplishments

A live, judge-clickable deployment where the approval gate is enforced by the
framework; a full production mission verified end to end in a real browser;
no API keys in the stack at all.

## What we learned

ADK's confirmation and resumability primitives map 1:1 onto a human approval
product; the port took days, not weeks, and made the pitch MORE true.

## Disclosure

Fleet Command began as our public Cloudflare + Claude build (first commit
Aug 9, 2026, inside the submission window). This Google-native version was
built during the submission period; the pre-existing cockpit design is reused
with disclosure, as the rules permit.

## Links

- Hosted (cockpit): https://fleetcommand-2u0.pages.dev/google
- Hosted (ADK API on Cloud Run): https://fleet-command-r453w22nfq-uc.a.run.app
- Repo: https://github.com/thebrockchain/fleetcommand (the `google/` folder)
- Architecture diagram: google/architecture.svg (attach as image)
- Demo video: https://youtu.be/jGqDP-tnLaM
