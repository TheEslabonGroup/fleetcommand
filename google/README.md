# Fleet Command on Google (the All Things Agentic entry)

The same crew as the Cloudflare build one directory up, ported to Google's
stack for the All Things Agentic hackathon: **ADK** for the agents, **Gemini**
for the model, **Cloud Run** for the deploy. The plan and the reasoning live in
`hackathons/GOOGLE-PORT.md`; this folder is that plan built.

What maps where:

| Cloudflare build | This port |
|---|---|
| `functions/run.js` step chain, `prior` strings threaded by hand | `SequentialAgent` with `output_key` state and `{placeholder}` instructions |
| Four system prompts in `run.js` | `fleet_command/prompts.py`, same voices |
| `_lib/market.js` (SerpApi lens, on-switch, KV cache) | `fleet_command/intel.py` `market_search` tool, on-switch, in-process cache |
| `_lib/domains.js` (name.com check, on-switch, KV cache) | `fleet_command/intel.py` `registrar_check` tool |
| SHIP prints HOLDING FOR HUMAN APPROVAL, client stops | `fleet_command/gate.py`: `require_confirmation=True`, the framework pauses server-side |

The gate is the product, and this port makes it stronger: on ADK the hold is a
first-class pause. A rejected gate never executes the tool at all.

## Run it locally

```bash
cd google
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
export GOOGLE_GENAI_USE_VERTEXAI=FALSE
export GOOGLE_API_KEY=...   # local dev only; deployed, there is NO key (Vertex + service identity)
.venv/bin/adk web            # browser dev UI, pick fleet_command
```

Without `SERPAPI_KEY` / `NAMECOM_USER`+`NAMECOM_TOKEN` in the environment the
lenses serve labelled SAMPLE data, same honesty pattern as the Cloudflare build.

## Deploy

`./deploy.sh` runs the API enablement and `adk deploy cloud_run` against the
project below. It needs a gcloud login that is NOT the client account this Mac
carries by default; the script guards for that.

- Project: `fleet-command-506619` (Fleet Command), billing-linked 2026-08-25.
- Region: `us-central1` (the always-free tier region); Vertex location `global`,
  because gemini-3.8-flash is not published regionally. Moved off
  gemini-3.7-flash (Google retires it 2027-01-28) on 2026-10-07; the live
  service keeps 3.7 until the next `./deploy.sh`.
- Live: https://fleet-command-r453w22nfq-uc.a.run.app - full mission verified
  against production 2026-08-25, gate pause and resume included. No API key
  exists in this deployment; the service reaches Vertex as its own identity.
