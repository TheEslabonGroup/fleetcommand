# Fleet Command on ADK: the same four-agent crew, expressed in Google's own
# grammar. SequentialAgent replaces the hand-threaded `prior` strings from the
# Cloudflare runner: each agent writes an output_key into session state and the
# next agent's instruction reads it back as a {placeholder}. The intel lenses
# ride as tools on the agents that own them (SCOUT searches, SHIP checks the
# registrar), and the deploy gate is a require_confirmation tool, so the pause
# for a human is enforced by the framework instead of promised by a prompt.

from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.apps import App, ResumabilityConfig

from .gate import gate_tool
from .intel import market_search, registrar_check
from .prompts import (
    AUDIT_INSTRUCTION,
    MEDIC_INSTRUCTION,
    SCOUT_INSTRUCTION,
    SHIP_INSTRUCTION,
)

MODEL = "gemini-3.8-flash"

scout = LlmAgent(
    name="SCOUT",
    model=MODEL,
    description="Reconnaissance: reads the target snapshot and searches the market it competes in.",
    instruction=SCOUT_INSTRUCTION,
    tools=[market_search],
    output_key="scout_report",
)

audit = LlmAgent(
    name="AUDIT",
    model=MODEL,
    description="Inspection: names the concrete defects worth fixing, ranked by severity.",
    instruction=AUDIT_INSTRUCTION,
    output_key="audit_findings",
)

medic = LlmAgent(
    name="MEDIC",
    model=MODEL,
    description="Fix drafting: drafts the highest-severity fix as a diff. Drafts only, never applies.",
    instruction=MEDIC_INSTRUCTION,
    output_key="medic_fix",
)

ship = LlmAgent(
    name="SHIP",
    model=MODEL,
    description="Deployment: checks the registrar, stages the fix, and holds at the human approval gate.",
    instruction=SHIP_INSTRUCTION,
    tools=[registrar_check, gate_tool],
    output_key="ship_summary",
)

root_agent = SequentialAgent(
    name="fleet_command",
    description="An ops crew that works a synthetic target and holds every deploy at a human approval gate.",
    sub_agents=[scout, audit, medic, ship],
)

# Resumable on purpose: when the gate pauses the mission, the human's answer
# resumes the SAME invocation instead of replaying the chain from SCOUT. The
# CLI and the runner both look for `app` before `root_agent`, so this is what
# actually ships.
app = App(
    name="fleet_command",
    root_agent=root_agent,
    resumability_config=ResumabilityConfig(is_resumable=True),
)
