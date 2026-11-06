// On Your Go middleware: security headers on every response, public site.
// This surface is deliberately public and indexable (it is the hackathon
// showpiece), so there is no gate here. The five headers ride every response,
// including ones the Functions build by hand downstream.

// nobots block-all: source of truth in thebrockchain/nobots/policy/bots.json.
const NOBOTS_UA_PATTERN = /\b(GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Applebot-Extended|Bytespider|cohere-ai|CCBot|Amazonbot|meta-externalagent|FacebookBot|Diffbot|ImageSiftBot|img2dataset|Omgili|Omgilibot|PetalBot|Timpibot|VelenPublicWebCrawler|YouBot|AI2Bot|DuckAssistBot|SemrushBot|AhrefsBot|DotBot|MJ12bot|SeekportBot|DataForSeoBot)\b/i;
function nobotsBlocked(request) {
  const path = new URL(request.url).pathname;
  if (path === '/robots.txt' || path.startsWith('/.well-known/')) return false;
  const ua = request.headers.get('user-agent') || '';
  return NOBOTS_UA_PATTERN.test(ua);
}

const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

async function fleetHandle(context) {
  // The crawler 403 is built here, so it wears the same five headers as every
  // other page. It went out with none until 2026-09-23 (measured from outside).
  if (nobotsBlocked(context.request)) {
    return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store', ...HEADERS } });
  }
  const res = await context.next();
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(HEADERS)) out.headers.set(k, v);
  // Pages serves the document with max-age=0, which makes every visit a
  // full round trip. A short TTL with a day of stale-while-revalidate keeps
  // a judge's second click instant and still picks up a deploy within five
  // minutes (the fleet cache posture, BUILD SAFE in CLAUDE.md).
  const type = out.headers.get('Content-Type') || '';
  if (type.includes('text/html')) {
    out.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  }
  return out;
}

// fleet pulse: fleetbrain's traffic beacon. No PULSE binding = silent no-op
// (the on-switch pattern), and a failed write never touches the request.
export async function onRequest(context) {
  const t0 = Date.now();
  const res = await fleetHandle(context);
  try {
    context.env.PULSE?.writeDataPoint({
      blobs: ["fleetcommand", new URL(context.request.url).pathname.slice(0, 96), String(res.status)],
      doubles: [Date.now() - t0, res.status >= 500 ? 1 : 0],
      indexes: ["fleetcommand"],
    });
  } catch {}
  return res;
}
