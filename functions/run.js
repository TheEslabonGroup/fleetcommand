// POST /run : execute one agent step of a mission.
//
// Two honest modes, the fleet on-switch pattern:
//   LIVE   - ANTHROPIC_API_KEY is set as a Pages secret: the step is a real
//            Claude call and the response says mode "live", up to a daily
//            cap on live calls (THE SPEND GUARD, below).
//   REPLAY - no key: the step answers from a recorded run of the same mission
//            and the response says mode "replay". The UI labels it. Nothing
//            pretends to be live when it is not.
//
// The mission works a SYNTHETIC target (a fictional small-business site).
// No real site is scanned, no fleet data is read, nothing risky executes:
// the "ship" step never deploys anything anywhere, it stages a diff and
// waits at the approval gate. The gate is the product.
//
// Two agents carry a switch of their own, each honest about it on screen:
//   SCOUT  SERPAPI_KEY               -> real Google results for the market lens
//   SHIP   NAMECOM_USER + _TOKEN     -> a real registrar check on the deploy target
// Both read public records about the open market, not the target's systems, so
// they stay inside the same promise: nothing scans a real site.

import { marketIntel, formatMarket, marketRows } from './_lib/market.js';
import { domainCheck, formatDomains, domainRows } from './_lib/domains.js';

const MODEL = 'claude-sonnet-5';

const AGENTS = {
  scout: {
    name: 'SCOUT',
    system:
      'You are SCOUT, the reconnaissance agent of an ops crew. You are given a synthetic snapshot of a small business website, plus a market search showing who ranks for the trade this business is in. Report what the site is, what the market around it looks like, and the three most important observations for the crew, in under 140 words, plain confident prose, no markdown headers. Never invent numbers. If the market search is labelled SAMPLE, never present it as real search data.',
  },
  audit: {
    name: 'AUDIT',
    system:
      'You are AUDIT, the inspection agent of an ops crew. You are given SCOUT\'s report plus a synthetic site snapshot. Name the concrete defects worth fixing (security headers, performance, broken links, copy problems), each in one line with a severity of high, medium, or low. Under 120 words. Never invent defects not present in the snapshot.',
  },
  medic: {
    name: 'MEDIC',
    system:
      'You are MEDIC, the fix-drafting agent of an ops crew. You are given AUDIT\'s findings. Draft the fix for the single highest-severity finding as a short unified diff or config block, plus one sentence on why. Under 150 words. You draft only; you never apply.',
  },
  ship: {
    name: 'SHIP',
    system:
      'You are SHIP, the deployment agent of an ops crew. You are given MEDIC\'s drafted fix plus a registrar check on the deploy target\'s own domain. Summarize exactly what would deploy, to where, and what could go wrong, in under 110 words. If the business does not appear to hold its own name, raise that as a risk worth a human decision, and say plainly that available means registrable and not cleared for use. Then end with the single line: HOLDING FOR HUMAN APPROVAL. You never deploy without that approval.',
  },
};

// The synthetic target. Fictional on purpose; the demo never scans a real site.
const TARGET_SNAPSHOT = `Site: "Harbor Lane Bakery" (fictional demo target)
Pages: / (home), /menu, /hours, /order
Server response headers observed: content-type only. No X-Content-Type-Options, no X-Frame-Options, no Strict-Transport-Security, no Referrer-Policy.
Home page: hero image 4.2 MB unoptimized JPEG, largest contentful paint 6.1s on 4G.
/order: form posts to /submit which returns 404 (broken since a route rename).
/hours: says "open till 5pm daily" but footer says "Sundays closed". Contradiction.
Copy: menu page has three typos ("croisant", "expresso", "sourdogh").`;

// A recorded run of this exact mission, used verbatim when no key is armed.
const REPLAY = {
  scout:
    'Target is Harbor Lane Bakery, a four page small business site: home, menu, hours, and an order page. The stack answers with bare content-type headers and nothing else. The market it sits in is already settled: every shop ranking for bakery online ordering sells order-ahead with pickup slots, and buyers are actively searching how to set that up. Three observations for the crew. First, the order form posts to a route that answers 404, so the site is silently losing every order placed, in a market where ordering is the whole battleground. Second, the home hero ships a 4.2 MB image and paints in about six seconds on 4G, which is losing visitors before the menu loads. Third, the hours page and the footer disagree about Sundays, which erodes trust for a walk-in business.',
  audit:
    'Findings, ranked. Order form posts to a dead /submit route, every order lost: high. No security headers at all (missing X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Referrer-Policy): high. 4.2 MB hero image, 6.1s LCP on 4G: medium. Hours contradiction between /hours and the footer about Sundays: medium. Three menu typos (croisant, expresso, sourdogh): low. Recommendation: MEDIC drafts the order-route fix first, it is the one actively costing money.',
  medic:
    'Fix for the highest severity finding, the dead order route.\n\n--- site/order.html\n+++ site/order.html\n@@\n-  <form method="POST" action="/submit">\n+  <form method="POST" action="/api/order">\n\n--- functions/api/order.js (new)\n+++ functions/api/order.js\n+export async function onRequestPost({ request, env }) {\n+  const form = await request.formData();\n+  await env.ORDERS.put(Date.now().toString(), JSON.stringify(Object.fromEntries(form)));\n+  return Response.redirect("/order?thanks=1", 303);\n+}\n\nWhy: the form was posting to a route removed in a rename; this restores a working order path and stores submissions durably. Drafted only, not applied.',
  ship:
    'Staged: one edit to site/order.html pointing the order form at /api/order, plus a new order-handling function storing submissions in KV. Deploy target would be the bakery Pages project, production branch. Risk: if the KV binding is absent in production the handler would 500; the deploy should verify the binding first. Second risk, and it needs a person: the registrar check says harborlanebakery.com is still unregistered, so this shop is about to take online orders on a name it does not own. Available means registrable, not cleared for use; a trademark search is a separate job this crew does not do. Nothing else changes.\nHOLDING FOR HUMAN APPROVAL.',
};

const STEP_ORDER = ['scout', 'audit', 'medic', 'ship'];

// LIVE OUTPUT FOLLOWS THE HOUSE COPY RULES. The replay above was written to
// them; a live model is not. The first live mission on 2026-09-23 put eight
// em and en dashes and raw markdown backticks on the page. STYLE asks for
// plain text, and houseCopy() enforces the part that matters, because an
// instruction is a request and this page is public copy. Dashes become a plain
// hyphen in a number range or a bullet, and a comma everywhere else.
const STYLE = ' Write plain text: no markdown formatting and no backticks. Never use an em dash or an en dash; use a comma, colon or period instead.';

function houseCopy(text) {
  return text
    .replace(/`/g, '')
    .replace(/(\d)[ \t]*[\u2012\u2013][ \t]*(\d)/g, '$1-$2')
    .replace(/^([ \t]*)[\u2012-\u2015][ \t]*/gm, '$1- ')
    .replace(/[ \t]*[\u2012-\u2015][ \t]*$/gm, '')
    .replace(/[ \t]*[\u2012-\u2015][ \t]*/g, ', ')
    .replace(/\u2212/g, '-')
    .replace(/,(?:[ \t]*,)+/g, ',');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

// THE SPEND GUARD. This page is public with no login, and until 2026-09-23
// nothing stood between a visitor pressing Run in a loop and the key's whole
// balance. Each live call is at most about one cent: input tops out near 2,700
// tokens (the 8,000 character prior cap is most of it) and output at the 500
// token max_tokens, at claude-sonnet-5's $2 in / $10 out per million
// (Anthropic's price table, read 2026-09-23). So a day's live calls are capped
// here, and past the cap the step is served from the replay and SAYS so.
//
// The count is one global number per UTC day in MARKET_CACHE: a count of
// calls, nothing about who made them. It FAILS CLOSED, so with no KV bound
// there is no live call at all. It is also approximate: KV is eventually
// consistent and this is a read then a write, so a burst from several places
// at once can run a few calls past the cap. That is why the HARD ceiling is
// the spend limit on the key's own Anthropic workspace, which does not depend
// on this code being right. This cap spreads the budget across days, so one
// bored visitor cannot spend all of it in an hour.
const LIVE_DAILY_CAP = 100;

// Answers null when the call may go live, or the reason it may not, which
// the page shows in place of its usual replay line.
const NO_COUNTER = "the live call counter is unavailable, so this is the recorded run";

async function liveBlocked(env) {
  const kv = env.MARKET_CACHE;
  if (!kv) return NO_COUNTER;
  const cap = Number.parseInt(env.LIVE_DAILY_CAP, 10) > 0 ? Number.parseInt(env.LIVE_DAILY_CAP, 10) : LIVE_DAILY_CAP;
  const key = `live-calls:${new Date().toISOString().slice(0, 10)}`;
  try {
    const used = Number.parseInt(await kv.get(key), 10) || 0;
    if (used >= cap) return "today's live runs are used up, so this is the recorded run. Live runs come back at midnight UTC";
    await kv.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 });
    return null;
  } catch {
    return NO_COUNTER;
  }
}

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const step = payload.step;
  if (!STEP_ORDER.includes(step)) return json({ error: 'unknown step' }, 400);
  const agent = AGENTS[step];

  // Context: everything prior agents produced this mission, sent by the client.
  const prior = typeof payload.prior === 'string' ? payload.prior.slice(0, 8000) : '';

  // SCOUT is the only agent that searches. Recon is its job, and one cached
  // search per mission is the entire cost of the market lens. The rest of the
  // crew works from SCOUT's report, the way a real crew would.
  const market = step === 'scout' ? await marketIntel(env) : null;

  // SHIP is the only agent that touches the registrar, and only once, right
  // before it stages. Nothing earlier in the chain needs it.
  const domains = step === 'ship' ? await domainCheck(env) : null;

  const intel = {
    ...(market
      ? {
          market: market.source,
          marketQuery: market.query,
          marketCache: market.cache,
          marketRows: marketRows(market),
          ...(market.note ? { marketNote: market.note } : {}),
        }
      : {}),
    ...(domains
      ? {
          domains: domains.source,
          domainRows: domainRows(domains),
          ...(domains.note ? { domainNote: domains.note } : {}),
        }
      : {}),
  };

  if (!env.ANTHROPIC_API_KEY) {
    return json({ mode: 'replay', agent: agent.name, step, output: REPLAY[step], ...intel });
  }
  const blocked = await liveBlocked(env);
  if (blocked) {
    return json({ mode: 'replay', agent: agent.name, step, output: REPLAY[step], note: blocked, ...intel });
  }

  const userContent =
    `SYNTHETIC TARGET SNAPSHOT (fictional, for a demo):\n${TARGET_SNAPSHOT}\n\n` +
    (market ? `${formatMarket(market)}\n\n` : '') +
    (domains ? `${formatDomains(domains)}\n\n` : '') +
    (prior ? `PRIOR CREW OUTPUT THIS MISSION:\n${prior}\n\n` : '') +
    'Do your job now.';

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: agent.system + STYLE,
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    if (!res.ok) {
      // Fail honest: report the failure, fall back to replay, label it.
      return json({ mode: 'replay', agent: agent.name, step, output: REPLAY[step], note: 'live call failed, replay served', ...intel });
    }
    const data = await res.json();
    const text = houseCopy((data.content || []).map(b => b.text || '').join(''));
    return json({ mode: 'live', agent: agent.name, step, output: text || REPLAY[step], ...intel });
  } catch {
    return json({ mode: 'replay', agent: agent.name, step, output: REPLAY[step], note: 'live call failed, replay served', ...intel });
  }
}
