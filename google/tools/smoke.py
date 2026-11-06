# End-to-end smoke run of the ADK crew: one full mission against real Gemini,
# pausing at the gate and answering it programmatically. This is the proof the
# riskiest piece (the require_confirmation pause and resume) actually works,
# run BEFORE anything deploys, per the standing rule that done means verified.
#
# Needs GOOGLE_API_KEY in the environment. Never prints it.

import asyncio
import os
import sys

from google.adk.runners import InMemoryRunner
from google.genai import types

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fleet_command.agent import app  # noqa: E402

APP = "fleet_command"
USER = "smoke"


def describe(event):
    bits = []
    if event.content and event.content.parts:
        for p in event.content.parts:
            if p.text:
                bits.append(f"text({len(p.text)} chars)")
            if p.function_call:
                bits.append(f"call:{p.function_call.name}")
            if p.function_response:
                bits.append(f"resp:{p.function_response.name}")
    return f"[{event.author}] " + (", ".join(bits) or "(no parts)")


async def main():
    if not os.environ.get("GOOGLE_API_KEY"):
        print("GOOGLE_API_KEY not set"); sys.exit(2)

    runner = InMemoryRunner(app=app)
    session = await runner.session_service.create_session(app_name=APP, user_id=USER)

    confirmation_call = None
    outputs = {}

    async def drive(message):
        nonlocal confirmation_call
        async for event in runner.run_async(
            user_id=USER, session_id=session.id, new_message=message
        ):
            print(describe(event))
            if event.content and event.content.parts:
                for p in event.content.parts:
                    if p.function_call and p.function_call.name == "adk_request_confirmation":
                        confirmation_call = p.function_call
                    if p.text:
                        outputs[event.author] = p.text

    await drive(types.Content(role="user", parts=[types.Part(text="Run the mission.")]))

    if not confirmation_call:
        print("FAIL: the run never paused at the gate")
        sys.exit(1)
    print("\n== GATE PAUSED, approving as the human ==\n")

    await drive(
        types.Content(
            role="user",
            parts=[
                types.Part(
                    function_response=types.FunctionResponse(
                        id=confirmation_call.id,
                        name="adk_request_confirmation",
                        response={"confirmed": True},
                    )
                )
            ],
        )
    )

    print("\n== FINAL STATE ==")
    got = {k: bool(v) for k, v in outputs.items()}
    print("agents that spoke:", got)
    final = await runner.session_service.get_session(
        app_name=APP, user_id=USER, session_id=session.id
    )
    keys = sorted(final.state.keys())
    print("session state keys:", keys)
    ok = all(k in final.state for k in ("scout_report", "audit_findings", "medic_fix", "ship_summary"))
    print("PASS" if ok else "FAIL: missing state keys")
    if not ok:
        sys.exit(1)
    print("\n--- SHIP, after approval ---\n" + str(final.state.get("ship_summary"))[:800])


asyncio.run(main())
