// node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

// The crawler 403 is a response this file builds by hand. It went out with no
// security headers until 2026-09-23, measured from outside, while every page
// carried the site's five. Five, not six: this site sets no CSP in _headers or
// here, which is its own call, so the 403 matches the pages rather than a set
// the site never chose.
const FIVE = ["x-frame-options", "permissions-policy", "strict-transport-security",
  "referrer-policy", "x-content-type-options"];
const ctx = (path, ua) => ({
  request: new Request("https://fleetcommand-2u0.pages.dev" + path, { headers: { "user-agent": ua } }),
  env: {},
  next: async () => new Response("<p>page</p>", { headers: { "content-type": "text/html" } }),
});

test("a crawler's 403 wears the same security headers as a page", async () => {
  const page = await onRequest(ctx("/", "Mozilla/5.0 (Macintosh) Chrome/140"));
  for (const path of ["/", "/run"]) {
    const res = await onRequest(ctx(path, "Mozilla/5.0 (compatible; DotBot/1.2)"));
    assert.equal(res.status, 403, `${path} did not refuse the crawler`);
    for (const h of FIVE) {
      assert.ok(res.headers.get(h), `${path}: 403 is missing ${h}`);
      assert.equal(res.headers.get(h), page.headers.get(h), `${path}: 403 ${h} differs from a page's`);
    }
  }
});
