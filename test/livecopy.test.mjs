// node --test test/
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/run.js";

// Live output is public copy, so it follows the house rules the replay was
// written to: no em or en dashes, no raw markdown backticks. The first live
// mission on 2026-09-23 put eight dashes and a run of backticks on the page.
// The banned characters are written as escapes so this file carries none.
const EM = "\u2014", EN = "\u2013", MINUS = "\u2212";
const BANNED = /[\u2012-\u2015\u2212`]/;

let reply, sent, realFetch;
beforeEach(() => {
  realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    sent = JSON.parse(init.body);
    return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }), { status: 200 });
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

const live = async (text) => {
  reply = text;
  const store = new Map();
  const env = { ANTHROPIC_API_KEY: "test", MARKET_CACHE: { get: async (k) => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } } };
  const res = await onRequestPost({
    request: new Request("https://fleetcommand-2u0.pages.dev/run", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ step: "audit", prior: "" }),
    }),
    env,
  });
  const out = await res.json();
  assert.equal(out.mode, "live");
  return out.output;
};

test("the first live run's own lines come back clean", async () => {
  const out = await live(
    `- Missing security headers (X-Content-Type-Options, HSTS) ${EM} high\n` +
    `- \`/order\` form posts to \`/submit\`, returns 404 ${EM} high\n` +
    `Risks: untested route ${EM} verify before push; LCP 6${EN}7s on 4G.`);
  assert.doesNotMatch(out, BANNED);
  assert.equal(out,
    "- Missing security headers (X-Content-Type-Options, HSTS), high\n" +
    "- /order form posts to /submit, returns 404, high\n" +
    "Risks: untested route, verify before push; LCP 6-7s on 4G.");
});

test("a dash used as a bullet, at a line end, or beside a comma", async () => {
  const out = await live(`${EM} first\n  ${EN} second\nends here ${EM}\nalready, ${EM} joined\n5 ${MINUS} 3`);
  assert.doesNotMatch(out, BANNED);
  assert.equal(out, "- first\n  - second\nends here\nalready, joined\n5 - 3");
});

test("clean output passes through untouched, and every agent is asked for plain text", async () => {
  const text = "Findings, ranked. Order form posts to a dead route: high.\n--- a/x\n+++ b/x";
  assert.equal(await live(text), text);
  assert.match(sent.system, /no backticks/);
  assert.match(sent.system, /Never use an em dash or an en dash/);
});
