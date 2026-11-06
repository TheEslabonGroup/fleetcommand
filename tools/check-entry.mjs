#!/usr/bin/env node
// check-entry: meet the hackathon entry the way a judge does, from outside.
//
// Fetches every public surface the submission points at and fails loudly on
// the first one that does not answer. It reads nothing from this checkout, so
// a green run means the LIVE entry is whole, not that the repo looks right.
//
//   node tools/check-entry.mjs            check the real entry
//   node tools/check-entry.mjs --prove    run against a URL that must fail,
//                                         to prove the check can go red
//
// Exit 0 on all green, 1 on any red. No dependencies.

const SITE = 'https://fleetcommand-2u0.pages.dev';
const FILES = 'https://files.thebrockchain.com/fleetcommand';
const REPO = 'thebrockchain/fleetcommand';
const DEVPOST = 'https://devpost.com/software/fleet-command';
const VIDEO_ID = '6L4Ez-XEcKo';

// Devpost answers 403 to a bare client; a real browser string gets the page.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const prove = process.argv.includes('--prove');
const results = [];

async function get(url, opts = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, ...(opts.headers || {}) }, redirect: 'manual', signal: ctl.signal, method: opts.method || 'GET' });
    const body = opts.body === false ? '' : await res.text();
    return { status: res.status, body, headers: res.headers };
  } catch (e) {
    return { status: 0, body: '', error: e.message };
  } finally {
    clearTimeout(t);
  }
}

function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? '  (' + detail + ')' : ''}`);
}

async function page(name, url, mustContain = []) {
  const r = await get(url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now());
  const missing = mustContain.filter(s => !r.body.includes(s));
  check(name, r.status === 200 && missing.length === 0,
    r.status !== 200 ? `status ${r.status}${r.error ? ' ' + r.error : ''}` : missing.length ? 'missing: ' + missing.join(', ') : `200, ${r.body.length} bytes`);
  return r;
}

// Every film bound to a public key, by exact byte count. Identity is the
// point: a size check that only asks "> 0" stays GREEN with the wrong film
// bound, because any file is a file.
//
// TWO KEYS, ONE FILM NOW, and this header said otherwise until 2026-09-03.
// It read "fleet-command-demo.mp4 is the RAW CAPTURE the press kit offers to
// edit from, labelled 0:44 on the page", which was true when the two keys held
// two different films. The capture was overwritten with the master that day and
// existed in no other copy, so it is gone: the press kit retired that button
// and both keys now hold the 38,095,709 byte narrated master. The demo key is
// kept only because the Devpost organiser BACKUP field points at it, and that
// field wants the demo film anyway. The assertion below already said this; the
// header did not, which is one file disagreeing with itself.
const FILMS = {
  38095709: { name: "narrated master, 2:46 1080p", kind: "narrated" },
  15434083: { name: "narrated film, 2:46 720p YouTube transcode", kind: "narrated" },
  4257671: { name: "raw screen capture, 0:44 1080p", kind: "capture" },
};

async function asset(name, url, expect) {
  // Cache bust, always. These objects carry max-age=14400 at the edge, so a bare
  // HEAD reports the PREVIOUS upload for up to four hours and this check reads
  // the wrong film as bound. Measured 2026-09-03 06:05: bare URL 15,434,083
  // (HIT, age 1356), busted URL 38,095,709 (MISS). Ask the origin.
  const r = await get(`${url}?cb=${Date.now()}`, { method: 'HEAD', body: false });
  const len = Number(r.headers && r.headers.get('content-length')) || 0;

  // A size check that only asks "> 0" answers the wrong question: it stays
  // GREEN through a whole judging window with the wrong film bound, because
  // any file is a file. Where identity matters, assert WHICH one.
  if (expect) {
    const known = FILMS[len];
    check(name, r.status === 200 && !!known && known.kind === expect,
      r.status !== 200 ? `status ${r.status}`
        : !known ? `${len} bytes, UNKNOWN film, not one this entry has ever bound`
        : known.kind === expect ? `${len} bytes, ${known.name}`
        : `${len} bytes, ${known.name}, expected the ${expect}`);
    return;
  }

  check(name, r.status === 200 && len > 0, r.status === 200 ? `${len} bytes` : `status ${r.status}`);
}

async function main() {
  if (prove) {
    // A check that cannot fail is decoration. This run points the cockpit
    // check at a path that does not exist and expects red.
    await page('prove: a missing page goes red', SITE + '/this-page-does-not-exist');
    const failed = results.filter(r => !r.ok).length;
    console.log(failed ? '\nthe check can fail: PROVEN' : '\nthe check did NOT fail on a missing page: the instrument is blind');
    process.exit(failed ? 0 : 1);
  }

  // 1. The cockpit and its two public pages.
  const home = await page('cockpit /', SITE + '/', ['On Your Go', 'replay']);
  await page('press kit /press', SITE + '/press', ['On Your Go', 'as Fleet Command.', 'files.thebrockchain.com/fleetcommand']);
  await page('google build /google', SITE + '/google', ['On Your Go']);

  // 2. Security headers ride every response (the entry copy says so).
  const want = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy'];
  const missing = want.filter(h => !(home.headers && home.headers.get(h)));
  check('security headers on /', missing.length === 0, missing.length ? 'missing ' + missing.join(', ') : 'all five present');

  // 3. The public assets the press kit and the Devpost video field point at.
  await asset('asset fleet-command-narrated.mp4', `${FILES}/fleet-command-narrated.mp4`, 'narrated');
  // The demo key is the Devpost ORGANISER BACKUP field, which asks for the
  // demo video itself, so the narrated master is the right file there. The
  // press kit no longer links this key: the raw capture it used to serve was
  // overwritten 2026-09-03 and is not offered anywhere now.
  await asset('asset fleet-command-demo.mp4', `${FILES}/fleet-command-demo.mp4`, 'narrated');
  for (const f of ['fleet-command-onepager.pdf', 'share-card.png', 'cockpit-standby.png', 'gate-holding.png']) {
    await asset('asset ' + f, `${FILES}/${f}`);
  }

  // 4. The repo: public, and a LICENSE on it. GitHub's licence endpoint is
  //    404 when there is no LICENSE file, which is "all rights reserved".
  const repo = await get(`https://api.github.com/repos/${REPO}`, { headers: { accept: 'application/vnd.github+json' } });
  let meta = null;
  try { meta = JSON.parse(repo.body); } catch {}
  check('repo is public', repo.status === 200 && meta && meta.private === false, repo.status === 200 ? `visibility ${meta && meta.visibility}` : `status ${repo.status}`);
  const lic = meta && meta.license && meta.license.spdx_id;
  check('repo carries a LICENSE', !!lic && lic !== 'NOASSERTION', lic ? lic : 'none: all rights reserved, judges may read it and run none of it');

  // 5. The Devpost page: reachable, and it points at the site, the repo and
  //    the film. A 403 here means Devpost changed its bot rules, not that the
  //    entry is gone; the detail says which.
  const dp = await get(DEVPOST);
  const links = { site: dp.body.includes(SITE), repo: dp.body.includes('github.com/' + REPO), video: dp.body.includes(VIDEO_ID) };
  const broken = Object.entries(links).filter(([, v]) => !v).map(([k]) => k);
  check('devpost entry page', dp.status === 200 && broken.length === 0,
    dp.status !== 200 ? `status ${dp.status}` : broken.length ? 'missing link to ' + broken.join(', ') : 'links to site, repo and film');

  // 6. The film on YouTube is public (oEmbed answers 200 only for public or
  //    unlisted videos, 401/404 for private or missing).
  const yt = await get(`https://www.youtube.com/oembed?url=https://youtu.be/${VIDEO_ID}&format=json`);
  check('film is public on YouTube', yt.status === 200, yt.status === 200 ? 'oembed 200' : `oembed ${yt.status}`);

  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length} of ${results.length} green` + (failed.length ? `, ${failed.length} red: ${failed.map(f => f.name).join('; ')}` : ''));
  process.exit(failed.length ? 1 : 0);
}

main();
