# The approval gate, which is the product.
#
# On Cloudflare the gate was a convention: SHIP printed HOLDING FOR HUMAN
# APPROVAL and the client stopped. Honest, and it demoed well, but it was our
# own discipline. Here the hold is the framework's: stage_deploy is wrapped in
# a FunctionTool with require_confirmation=True, so ADK pauses the run
# server-side, emits an adk_request_confirmation event to the client, and the
# tool DOES NOT EXECUTE until a human answers. A rejected gate never runs the
# tool at all. That is the whole reason this port exists: the same pitch on a
# first-class human-in-the-loop primitive.

from google.adk.tools import FunctionTool


def stage_deploy(summary: str) -> dict:
    """Stage the drafted fix for deployment. This pauses the mission and waits
    for a human to approve or reject at the gate. It stages a synthetic diff
    for a fictional target; nothing deploys anywhere, ever, in this demo.

    Args:
        summary: what would deploy, where, and the risks a human should weigh.
    """
    # Reaching this line MEANS a human approved: the framework refuses to
    # execute the tool otherwise. Nothing here deploys; the demo's promise is
    # that the "deploy" is a staged synthetic diff and the gate is the point.
    return {
        "status": "staged",
        "approved_by_human": True,
        "summary": summary[:1000],
        "note": "Synthetic staging only. No real deploy occurs in this demo.",
    }


gate_tool = FunctionTool(stage_deploy, require_confirmation=True)
