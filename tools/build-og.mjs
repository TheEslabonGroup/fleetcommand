#!/usr/bin/env node
/**
 * Build the On Your Go link preview card, and the share tags it never had.
 * ---------------------------------------------------------------------------
 * WHAT WAS WRONG. This site carried charset, viewport and a description, and
 * nothing else. No og:title, no og:description, no og:image, no twitter tags.
 * Pasted anywhere it rendered as a blank grey tile with a bare URL.
 *
 * That matters more here than on any other surface in the fleet: this is the
 * HACKATHON ENTRY. The link is what a judge sees before the page loads, and a
 * grey tile is the first impression on the one thing being submitted.
 *
 * It went unnoticed for a structural reason worth writing down, and the first
 * telling of it here was wrong, so here is the checked version. This repo was
 * NOT an uncloned repo: `git log --reverse` shows `commit (initial): Start
 * fleetcommand` on 2026-08-09, `.git/logs/HEAD` carries no clone entry, and
 * the folder was created on this Mac by `brock/tools/creation.mjs`. It has
 * been on disk since birth, so "every local sweep skipped it" was not the
 * cause.
 *
 * The real cause is the SILENCE BUG, the same one named in sites.mjs for ainow
 * and allswept: a surface is only checked if it has a ROW in jack's site table
 * (`brock/.claude/skills/jack/scripts/sites.mjs`), and this creation was born
 * the same day and never got one. Zero rows means zero gates looked, and zero
 * findings reads exactly like a pass. The repo being local was never enough;
 * being LISTED is what earns a check.
 *
 * STILL OPEN as of 2026-08-10: fleetcommand has no sites.mjs row. Until it
 * does, no jack sweep will ever grade this surface, including the og gate that
 * would have caught the missing tags in the first place. Tracked in NEXT.md.
 *
 *   node tools/build-og.mjs
 *
 * Card design is the product's own thesis rather than decoration: four agents
 * in sequence, and SHIP stopped at the gate. The site says "the gate is not a
 * limitation, it is the product", so the card shows the gate.
 */
import { CHROME_DEFAULT } from './chrome-bin.mjs';
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFile, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

/* THE CARD IS SQUEEZED BEFORE IT IS HASHED, and the order is the whole point.
   The filename is the sha256 of the bytes, so optimising the committed PNG by
   hand made the name a lie and the next build minted a fresh heavy file under
   a fresh name and deleted the light one. Squeezing here means the name always
   describes what is actually served.
   Chrome writes a 24 bit truecolour PNG for what is a flat vector card with a
   few dozen colours in it, which is how a 1200x630 graphic reached half a
   megabyte and FAILed the LEAN cap (brock/LEAN-STANDARD.md, image over 500KB).
   pngquant picks a palette, oxipng repacks it losslessly, and the result is
   the same picture at a fraction of the bytes. Both are optional: if neither
   is installed the build still produces a correct, heavy card rather than
   failing, and says so. */
function squeezePng(bytes, label) {
  const tmp = join(tmpdir(), `og-squeeze-${process.pid}-${label}.png`);
  writeFileSync(tmp, bytes);
  let out = bytes;
  try {
    execFileSync('pngquant', ['--force', '--quality', '70-95', '--speed', '1', '--output', tmp, tmp], { stdio: 'pipe' });
  } catch { /* pngquant absent, or it refused the quality floor: keep going */ }
  try {
    execFileSync('oxipng', ['-o', 'max', '--strip', 'safe', '-q', tmp], { stdio: 'pipe' });
  } catch { /* oxipng absent: the pngquant result still stands */ }
  try {
    const squeezed = readFileSync(tmp);
    if (squeezed.length > 0 && squeezed.length < out.length) out = squeezed;
  } catch { /* nothing readable: keep the original bytes */ }
  try { unlinkSync(tmp); } catch {}
  if (out === bytes) console.log(`  note: ${label} could not be squeezed (pngquant/oxipng missing?), shipping ${Math.round(bytes.length / 1024)} KB`);
  return out;
}


const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const CHROME = CHROME_DEFAULT;
const ORIGIN = 'https://fleetcommand-2u0.pages.dev';
// W/H are CSS pixels: the 1.91:1 box every platform expects. SCALE is the
// device pixel ratio the card is RENDERED at, so the actual PNG is 2400x1260.
//
// WHY 2x AND NOT 4K. A share card is not a video. Every platform lays the card
// out at roughly 1200 wide and caps what it will display, so pixels past 2x are
// bytes nobody ever sees. 2x is exactly the retina treatment: on the display a
// judge is actually using, every glyph and hairline is sampled at the density
// the screen can show. Beyond that is waste, and a card that is too heavy gets
// re-compressed by the platform, which is worse than shipping fewer pixels.
const W = 1200, H = 630, SCALE = 2;

/* Tokens READ OUT OF site/index.html :root rather than copied, because copying
   is what let them drift. The design pass on 2026-08-14 changed --bg, --line
   and --surf on the page and this card silently kept the old palette until it
   was caught by eye. A comment promising "cannot drift" did not stop it; only
   parsing the real file does. If a token is ever missing the build FAILS
   loudly instead of quietly rendering last year's colours. */
const CSS = readFileSync(join(SITE, 'index.html'), 'utf8');
const token = (name) => {
  const m = CSS.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{3,8})'));
  if (!m) throw new Error(`token --${name} not found in site/index.html :root`);
  return m[1];
};
const T = {
  bg: token('bg'), surf: token('surf'), 'surf-hi': token('surf-hi'), line: token('line'),
  ink: token('ink'), muted: token('muted'), faint: token('faint'), stone: token('stone'),
  indigo: token('indigo'), teal: token('teal'), amber: token('amber'),
};

const DONE = [['SCOUT', 'recon'], ['AUDIT', 'defects'], ['MEDIC', 'the fix']];

// The same living field that runs behind the cockpit, so the card looks like
// the product instead of a poster about it. SEEDED on purpose: the PNG is
// content-hashed for its filename, so a random field would mint a new file and
// a new deploy on every build.
let _s = 1337;
const rnd = () => ((_s = (_s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const FIELD = Array.from({ length: 52 }, () => {
  const a = rnd() * Math.PI * 2, len = 14 + rnd() * 46;
  const x = rnd() * W, y = rnd() * H;
  return { x1: x.toFixed(1), y1: y.toFixed(1),
           x2: (x - Math.cos(a) * len).toFixed(1), y2: (y - Math.sin(a) * len).toFixed(1),
           o: (0.06 + rnd() * 0.16).toFixed(2), teal: rnd() < 0.14 };
});

/* THE CARD'S ONE JOB. A judge sees this in a feed beside dozens of entries and
   gives it about a second. The old card LISTED four agents and coloured the
   last one, which reads as "four things, one highlighted". This one has to read
   as MOTION ARRESTED: three agents ran and completed, and then something
   stopped, hard, and is waiting on a person.
   That is why there is a halt bar rather than a fourth arrow, why SHIP is
   lifted and glowing while the other three sit flat, and why the only amber on
   the card is on the thing that stopped. Same rule as the page and the video:
   amber means a human is needed, and it is spent exactly once. */
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="/fonts/fonts.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px}
  body{
    font-family:'Montserrat',system-ui,sans-serif;color:${T.ink};
    background:
      radial-gradient(58% 62% at 14% 8%, rgba(124,108,255,.16), transparent 66%),
      radial-gradient(46% 56% at 92% 88%, rgba(245,178,61,.09), transparent 62%),
      ${T.bg};
    padding:56px 64px;display:flex;flex-direction:column;justify-content:center;
    position:relative;overflow:hidden;
  }
  .eyebrow,h1,.lede,.crew,.stamp{position:relative;z-index:1}
  .eyebrow{display:flex;align-items:center;gap:13px;margin-bottom:22px}
  .dot{width:11px;height:11px;border-radius:50%;background:${T.teal};
    box-shadow:0 0 0 5px rgba(45,212,191,.16)}
  .eyebrow b{font-family:'Space Grotesk';font-weight:700;font-size:20px;
    letter-spacing:.22em;text-transform:uppercase}
  .eyebrow s{text-decoration:none;color:${T.faint};font-size:15px;font-weight:600;
    letter-spacing:.14em;text-transform:uppercase}
  h1{font-family:'Space Grotesk';font-weight:700;font-size:92px;line-height:.94;
    letter-spacing:-.035em;max-width:17ch}
  h1 b{font-weight:700;color:${T.indigo}}
  .lede{margin-top:18px;font-size:21px;line-height:1.4;color:${T.muted};max-width:52ch}

  /* The flow. Three finished, then the stop. */
  .crew{margin-top:40px;display:flex;align-items:center;gap:0}
  .field{position:absolute;inset:0;z-index:0}
  .ag{border:1px solid ${T.line};background:rgba(20,25,38,.62);
    -webkit-backdrop-filter:blur(14px) saturate(1.25);
    backdrop-filter:blur(14px) saturate(1.25);padding:13px 19px;
    display:flex;flex-direction:column;gap:3px;min-width:152px;border-radius:12px}
  .ag n{font-family:'Space Grotesk';font-weight:700;font-size:18px;letter-spacing:.10em;
    color:${T.stone}}
  .ag e{font-size:12.5px;color:${T.faint};letter-spacing:.03em}
  .arrow{display:flex;align-items:center;padding:0 15px;color:${T.faint};font-size:18px}

  /* The halt. Not an arrow: a bar the sequence runs into and cannot pass. */
  .halt{width:5px;height:78px;margin:0 28px;border-radius:3px;
    background:linear-gradient(180deg, ${T.amber}, rgba(245,178,61,.35));
    box-shadow:0 0 22px rgba(245,178,61,.5)}

  .gate{border-color:${T.amber};min-width:214px;padding:16px 22px;
    background:linear-gradient(180deg, rgba(245,178,61,.17), rgba(245,178,61,.06));
    -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
    box-shadow:0 0 0 1px rgba(245,178,61,.30), 0 20px 46px -20px rgba(245,178,61,.6);
    transform:translateY(-7px)}
  .gate n{color:${T.amber};font-size:19px}
  .gate e{color:${T.amber};opacity:.9;font-weight:600;letter-spacing:.10em;
    text-transform:uppercase;font-size:11.5px}
  .callout{position:absolute;right:64px;top:50%;transform:translateY(-50%);
    font-family:'Space Grotesk';font-weight:700;font-size:34px;color:${T.amber};
    letter-spacing:-.01em;opacity:.9}
  .stamp{position:absolute;right:64px;bottom:44px;font-size:13px;font-weight:600;
    letter-spacing:.16em;text-transform:uppercase;color:${T.faint}}
</style></head>
<body>
  <svg class="field" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${FIELD.map(f => `<line x1="${f.x1}" y1="${f.y1}" x2="${f.x2}" y2="${f.y2}" stroke="${f.teal ? T.teal : T.indigo}" stroke-opacity="${f.o}" stroke-width="1.3" stroke-linecap="round"/>`).join('')}
  </svg>
  <div class="eyebrow"><span class="dot"></span><b>On Your Go</b><s>Agentic ops</s></div>
  <h1>The gate is the <b>product</b>.</h1>
  <p class="lede">Four AI agents do the work. Every consequential action stops at a named human.</p>
  <div class="crew">
    ${DONE.map(([n, e], i) =>
      `<div class="ag"><n>${n}</n><e>${e}</e></div>`
      + (i < DONE.length - 1 ? '<div class="arrow">&rsaquo;</div>' : '')
    ).join('\n    ')}
    <div class="halt"></div>
    <div class="ag gate"><n>SHIP</n><e>Holding</e></div>
  </div>
  <div class="stamp">Synthetic demo target</div>
</body></html>`;

mkdirSync(join(ROOT, 'brand'), { recursive: true });
const src = join(ROOT, 'brand', 'og-card.html');
writeFileSync(src, html);

/* THE CARD USES THE SITE'S OWN SELF HOSTED FONTS, SERVED OVER A THROWAWAY
   LOCAL SERVER, and both halves of that are load bearing.
   The font cleanup on 2026-09-10 (cd57150) swapped the Google Fonts link for
   /fonts/fonts.css by HAND EDITING brand/og-card.html, but this script writes
   that file, so the next build (the On Your Go rename, e608283) quietly put
   Google back. The link now lives here, where it cannot be undone.
   The server is the half the hand edit missed. This used to screenshot the
   template over file://, and under file:// a root relative /fonts/fonts.css
   means the root of the DISK: no stylesheet, no faces, and the headline falls
   back to Times. Checked 2026-09-23 by rendering the hand edited template, not
   assumed. Serving the template and site/fonts from one origin makes /fonts/
   mean exactly what it means on the live site. It binds 127.0.0.1 only, lives
   for one screenshot, and answers only the template and files named
   *.css or *.woff2 directly inside site/fonts (no slash, so no ../ escape).
   A missing font does not error, it just renders a fallback that still looks
   like a card, so the build FAILS unless both families were really fetched. */
const FONTS = join(SITE, 'fonts');
const fetched = [];
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://127.0.0.1').pathname;
  const font = path.match(/^\/fonts\/([\w.-]+\.(css|woff2))$/);
  const file = path === '/og-card.html' ? src : font ? join(FONTS, font[1]) : null;
  let body = null;
  try { if (file) body = readFileSync(file); } catch { /* a named file that is missing is a 404 */ }
  if (!body) { res.writeHead(404).end(); return; }
  if (font) fetched.push(font[1]);
  const type = !font ? 'text/html; charset=utf-8' : font[2] === 'css' ? 'text/css' : 'font/woff2';
  res.writeHead(200, { 'content-type': type }).end(body);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));

const tmp = join(ROOT, '.og-tmp.png');
try {
  // Async on purpose: execFileSync would block the event loop the server
  // needs to answer Chrome, and the screenshot would hang or go fontless.
  await promisify(execFile)(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--force-device-scale-factor=${SCALE}`, `--window-size=${W},${H}`,
    '--virtual-time-budget=6000',
    `--screenshot=${tmp}`, `http://127.0.0.1:${server.address().port}/og-card.html`,
  ]);
} finally {
  server.closeAllConnections();
  server.close();
}
for (const family of ['montserrat', 'space-grotesk']) {
  if (!fetched.some((f) => f.startsWith(family) && f.endsWith('.woff2'))) {
    try { unlinkSync(tmp); } catch {}
    throw new Error(`the card never fetched a ${family} face from site/fonts (got: ${fetched.join(', ') || 'nothing'}), so it would ship in a fallback font`);
  }
}

/* Flat colour and type, so PNG is genuinely the right container here and
   comes out small. The RISE card is a photograph and goes to JPEG instead. */
const bytes = squeezePng(readFileSync(tmp), 'card');
unlinkSync(tmp);
const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
const file = `og-${hash}.png`;
writeFileSync(join(SITE, file), bytes);

/* PER PAGE IDENTITY, added 2026-09-03 after the live pages were read back.
 *
 * This wrote ONE hardcoded block into every html file in site/, so /google
 * shipped `og:url` pointing at "/" while its own `rel=canonical` said
 * "/google". Two facts about the same page, in the same file, disagreeing:
 * paste the Google build's link anywhere and the card claims to BE the
 * homepage. It also gave that page the root's title and description, so the
 * ADK build had no identity in a link card at all.
 *
 * press.html looked correct only because it was written AFTER the last run of
 * this script and so had never been touched by it. It was not safe, it was
 * lucky: its hand written tags also HARDCODE `og-d8f521af3c.png`, and the
 * stale sweep at the bottom of this file DELETES the old card every time the
 * hash changes. The next rebuild would have pointed the press kit's card at a
 * 404, which the fleet og rule names as the worst case because the source
 * still reads correct. Those hand written tags are gone now and this script is
 * the ONE WRITER for all of them.
 *
 * A page not listed here falls back to the site identity with a root og:url,
 * which is what 404.html should say.
 */
const SITE_TITLE = 'On Your Go';
const SITE_DESC = 'An agentic operations command center. A crew of AI agents does the work; a human approval gate holds the trigger.';
const SITE_TWEET = 'Four AI agents do the work. Every consequential action stops at a named human.';

const PAGES = {
  'index.html': { path: '/' },
  'google.html': {
    path: '/google',
    title: 'On Your Go on Google ADK',
    desc: 'The same four agent mission and the same human approval gate, built on the Google Agent Development Kit and Gemini.',
    tweet: 'The same crew and the same gate, rebuilt on Google ADK and Gemini.',
  },
  'press.html': {
    path: '/press',
    title: 'On Your Go: press kit',
    desc: 'The demo film, product screenshots, a one page brief and the share card.',
    tweet: 'The demo film, product screenshots, a one page brief and the share card.',
  },
  '404.html': { path: '/' },
};

/* The whole share block, not just the image: this site had NONE of it. */
const TAGS = (url, meta) => [
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="${SITE_TITLE}">`,
  `<meta property="og:title" content="${meta.title || SITE_TITLE}">`,
  `<meta property="og:description" content="${meta.desc || SITE_DESC}">`,
  `<meta property="og:url" content="${ORIGIN}${meta.path}">`,
  `<meta property="og:image" content="${url}">`,
  // The real pixel dimensions of the file, not the CSS box it was laid out in.
  // Same 1.91:1 ratio either way, but a scraper that trusts these for layout
  // should be told the truth about what it is fetching.
  `<meta property="og:image:width" content="${W * SCALE}">`,
  `<meta property="og:image:height" content="${H * SCALE}">`,
  `<meta property="og:image:alt" content="${SITE_TITLE}: SCOUT, AUDIT and MEDIC feed into SHIP, which holds at the human approval gate.">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:title" content="${meta.title || SITE_TITLE}">`,
  `<meta name="twitter:description" content="${meta.tweet || SITE_TWEET}">`,
  `<meta name="twitter:image" content="${url}">`,
];

const url = `${ORIGIN}/${file}`;
const pages = readdirSync(SITE).filter((f) => f.endsWith('.html'));
for (const f of pages) {
  const p = join(SITE, f);
  let s = readFileSync(p, 'utf8');
  // Drop any block this script wrote before, then write the current one, so
  // re-running never stacks duplicates.
  // The opening comment carries a suffix, so the strip pattern must allow
  // one. Matching the bare marker silently STACKED a second block on every
  // re-run, which is exactly what happened before this was caught.
  s = s.replace(/\n?\s*<!-- share:start[^>]*-->[\s\S]*?<!-- share:end -->/g, '');
  const meta = PAGES[f] || { path: '/' };
  const block = `\n  <!-- share:start generated by tools/build-og.mjs -->\n`
    + TAGS(url, meta).map((t) => '  ' + t).join('\n')
    + `\n  <!-- share:end -->`;
  if (!/<\/head>/i.test(s)) throw new Error(`${f} has no </head> to write into`);
  s = s.replace(/<\/head>/i, `${block}\n</head>`);
  writeFileSync(p, s);
}

const stale = readdirSync(SITE).filter((f) => /^og-[0-9a-f]{10}\.png$/.test(f) && f !== file);
for (const f of stale) unlinkSync(join(SITE, f));

console.log(`card built: site/${file}  ${Math.round(bytes.length / 1024)} KB`);
console.log(`  share block written into ${pages.length} page(s): ${pages.join(', ')}`);
if (stale.length) console.log(`  removed stale: ${stale.join(', ')}`);
