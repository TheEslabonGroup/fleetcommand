#!/bin/bash
# Deploy Fleet Command's ADK build to Cloud Run.
#
# GUARD: this Mac's default gcloud login is the CLIENT's account (El Zarape).
# Fleet infra must never be built on it, so this script refuses to run unless
# the active gcloud account is the fleet one. Use the named configuration:
#   gcloud config configurations activate fleetcommand
set -euo pipefail

PROJECT="fleet-command-506619"
REGION="us-central1"
SERVICE="fleet-command"
FLEET_ACCOUNT="falfasbrock@gmail.com"

ACTIVE=$(gcloud config get-value account 2>/dev/null || true)
if [ "$ACTIVE" != "$FLEET_ACCOUNT" ]; then
  echo "Refusing: active gcloud account is '$ACTIVE', not $FLEET_ACCOUNT." >&2
  echo "Run: gcloud config configurations activate fleetcommand" >&2
  exit 1
fi

cd "$(dirname "$0")"

gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com generativelanguage.googleapis.com \
  --project "$PROJECT"

# No model key anywhere, on purpose. The service reaches Gemini through Vertex
# AI as its own service identity, so there is no secret to arm, store, or leak.
# GOOGLE_CLOUD_LOCATION is "global" because gemini-3.8-flash is not published
# to regional Vertex endpoints (us-central1 answered 404); the Cloud Run
# service itself still lives in us-central1 where the free tier applies.

# CORS: the cockpit stays on Cloudflare Pages and calls this API cross-origin.
# Public on purpose: a judge must be able to click the URL with no login.
.venv/bin/adk deploy cloud_run \
  --project "$PROJECT" \
  --region "$REGION" \
  --service_name "$SERVICE" \
  --with_ui \
  --allow_origins "https://fleetcommand-2u0.pages.dev" \
  ./fleet_command \
  -- --allow-unauthenticated

gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" \
  --update-env-vars "GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=${PROJECT},GOOGLE_CLOUD_LOCATION=global"

echo "Deployed. Service URL:"
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" \
  --format 'value(status.url)'
