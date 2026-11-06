// node --test test/
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/run.js";

// The spend guard in functions/run.js caps live Claude calls per UTC day, so a
// public page with no login cannot spend a key's whole balance. These run with
// a fake KV and a fake Anthropic endpoint: no key, no network, no money.
// AUDIT is the step used because it touches neither SerpApi nor name.com.

let calls, realFetch;
beforeEach(() => {
  calls = 0;
  realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.anthropic\.com/, "only the Claude call may go out");
    calls++;
    return new Response(JSON.stringify({ content: [{ type: "text", text: "LIVE OUTPUT" }] }), { status: 200 });
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

const kv = () => {
  const store = new Map();
  return { store, get: async (k) => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } };
};
const run = async (env) => (await onRequestPost({
  request: new Request("https://fleetcommand-2u0.pages.dev/run", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ step: "audit", prior: "" }),
  }),
  env,
})).json();

test("no key: replay, and the counter is never touched", async () => {
  const cache = kv();
  const out = await run({ MARKET_CACHE: cache });
  assert.equal(out.mode, "replay");
  assert.equal(out.note, undefined);
  assert.equal(calls, 0);
  assert.equal(cache.store.size, 0);
});

test("key armed: live up to the cap, then replay that says why", async () => {
  const cache = kv();
  const env = { ANTHROPIC_API_KEY: "test", MARKET_CACHE: cache, LIVE_DAILY_CAP: "2" };
  assert.equal((await run(env)).mode, "live");
  assert.equal((await run(env)).mode, "live");
  const third = await run(env);
  assert.equal(third.mode, "replay");
  assert.match(third.note, /used up/);
  assert.equal(calls, 2, "the call past the cap must not reach Anthropic");
  assert.deepEqual([...cache.store.values()], ["2"]);
});

test("the default cap applies when LIVE_DAILY_CAP is unset or junk", async () => {
  for (const cap of [undefined, "0", "-5", "lots"]) {
    const cache = kv();
    const key = `live-calls:${new Date().toISOString().slice(0, 10)}`;
    cache.store.set(key, "100");
    const out = await run({ ANTHROPIC_API_KEY: "test", MARKET_CACHE: cache, LIVE_DAILY_CAP: cap });
    assert.equal(out.mode, "replay", `cap ${cap} should fall back to the default of 100`);
  }
  assert.equal(calls, 0);
});

test("fails closed: no counter bound, or a counter that errors, means no live call", async () => {
  const broken = { get: async () => { throw new Error("kv down"); }, put: async () => {} };
  for (const MARKET_CACHE of [undefined, broken]) {
    const out = await run({ ANTHROPIC_API_KEY: "test", MARKET_CACHE });
    assert.equal(out.mode, "replay");
    assert.match(out.note, /counter is unavailable/);
  }
  assert.equal(calls, 0);
});
