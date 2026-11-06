// The GOOGLE capture: the same shot grammar as submission/record.mjs, driven
// against the ADK build at /google, where the mission is LIVE against Cloud
// Run and the gate pause is the framework's own. Model latency is real, so the
// cold open only starts the camera once SHIP is already working, and the long
// mission waits stay in the master for the edit to cut on shot boundaries.
// One new beat: after the resume, the browser visits the *.run.app URL itself,
// because the Agentic rules demand the video demonstrate the backend running
// on Google Cloud. Run from a scratch rig dir that has playwright installed:
//   cp record-google.mjs <rig>/ && cd <rig> && node record-google.mjs

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import url from 'node:url';

const OUT = path.dirname(url.fileURLToPath(import.meta.url));
const FRAMES = path.join(OUT, 'frames');
const BASE = 'https://fleetcommand-2u0.pages.dev/google';
const SITE = BASE + '?pace=video';
const COLD = BASE + '?pace=fast';
const RUNAPP = 'https://fleet-command-r453w22nfq-uc.a.run.app/dev-ui/?app=fleet_command';
const FPS = 30;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now();
const at = () => ((Date.now() - t0) / 1000);
const log = m => console.log(`[${at().toFixed(1)}s] ${m}`);
const marks = [];
const mark = m => { marks.push([Date.now(), m]); log('MARK ' + m); };
let videoStart = 0;

if (existsSync(FRAMES)) rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });

const browser = await chromium.launch({
  args: [
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--force-color-profile=srgb',
  ],
});
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await page.addInitScript(() => {
  addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.style.cssText =
      'position:fixed;left:0;top:0;width:18px;height:18px;border-radius:50%;' +
      'border:2.5px solid #a99dff;background:rgba(124,108,255,.35);z-index:99999;' +
      'pointer-events:none;transform:translate(-50%,-50%);transition:width .12s,height .12s';
    document.body.appendChild(c);
    addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; });
    addEventListener('mousedown', () => { c.style.width = '28px'; c.style.height = '28px'; });
    addEventListener('mouseup', () => { c.style.width = '18px'; c.style.height = '18px'; });
  });
});

const client = await context.newCDPSession(page);
const shots = [];
let n = 0;
let recording = false;
client.on('Page.screencastFrame', async ev => {
  if (recording) {
    if (!videoStart) videoStart = Date.now();
    const file = path.join(FRAMES, String(n++).padStart(6, '0') + '.jpg');
    writeFileSync(file, Buffer.from(ev.data, 'base64'));
    shots.push({ file, t: ev.metadata.timestamp });
  }
  try { await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch {}
});
const record = async on => {
  if (on && !recording) { recording = true; await client.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 3840, maxHeight: 2160, everyNthFrame: 1 }); }
  if (!on && recording) { recording = false; await client.send('Page.stopScreencast').catch(() => {}); }
};

const center = async sel => page.evaluate(q => {
  const r = document.querySelector(q).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, sel);
const glide = async (sel, ms = 900) => {
  const { x, y } = await center(sel);
  await page.mouse.move(x, y, { steps: 18 });
  await sleep(Math.max(0, ms - 300));
};
const showEntry = async needle => {
  await page.evaluate(t => {
    const e = [...document.querySelectorAll('#console .entry')].find(x => x.textContent.includes(t));
    if (e) e.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, needle);
};
// Wait for the gate OR the cockpit's own failure text, so a dead mission fails
// in seconds instead of eating a six minute timeout.
const gateOrError = async (timeout = 300000) => {
  await page.waitForFunction(() =>
    document.getElementById('gate').classList.contains('armed') ||
    [...document.querySelectorAll('#console .entry')].some(e =>
      e.textContent.includes('lost contact') || e.textContent.includes('without reaching the gate')),
    null, { timeout });
  const ok = await page.evaluate(() => document.getElementById('gate').classList.contains('armed'));
  if (!ok) throw new Error('mission failed before the gate');
};

// ---- COLD OPEN: live mission, camera rolls only once SHIP is on deck --------
for (let tries = 0; ; tries++) {
  try {
    await page.goto(COLD, { waitUntil: 'networkidle' });
    await page.mouse.move(960, 700);
    await sleep(600);
    await page.locator('#runBtn').click();
    log('cold-open mission started (live, camera off)');
    await page.waitForFunction(
      () => document.getElementById('ag-ship').classList.contains('working') ||
        [...document.querySelectorAll('#console .entry')].some(e => e.textContent.includes('lost contact')),
      null, { timeout: 300000 });
    const shipUp = await page.evaluate(() => document.getElementById('ag-ship').classList.contains('working'));
    if (!shipUp) throw new Error('cold-open mission died early');
    await record(true);
    mark('cold open: mission running fast');
    await gateOrError();
    mark('COLD OPEN SLAM');
    break;
  } catch (e) {
    await record(false);
    log(`cold open attempt ${tries + 1} failed: ${e.message}`);
    if (tries >= 2) throw e;
  }
}
await sleep(5500);

// ---- the narrative ----------------------------------------------------------
await page.goto(SITE, { waitUntil: 'networkidle' });
await page.mouse.move(960, 700);
mark('cut to idle cockpit');
await sleep(5000);

mark('crew pass');
for (const id of ['#ag-scout', '#ag-audit', '#ag-medic', '#ag-ship']) {
  await glide(id, 600);
  await sleep(700);
}

for (let tries = 0; ; tries++) {
  try {
    await glide('#runBtn', 700);
    await sleep(500);
    mark('click Run mission');
    await page.locator('#runBtn').click();
    await page.mouse.move(960, 720, { steps: 18 });

    await page.waitForFunction(
      () => [...document.querySelectorAll('#console .entry')].some(e => e.textContent.includes('MARKET / SERPAPI')) ||
        [...document.querySelectorAll('#console .entry')].some(e => e.textContent.includes('lost contact')),
      null, { timeout: 300000 });
    const lens = await page.evaluate(() =>
      [...document.querySelectorAll('#console .entry')].some(e => e.textContent.includes('MARKET / SERPAPI')));
    if (!lens) throw new Error('mission died before the market lens');
    mark('SCOUT market lens on screen');

    await gateOrError();
    mark('GATE ARMS');
    break;
  } catch (e) {
    log(`narrative mission attempt ${tries + 1} failed: ${e.message}`);
    if (tries >= 2) throw e;
    await page.goto(SITE, { waitUntil: 'networkidle' });
    await page.mouse.move(960, 700);
    await sleep(1500);
  }
}
await sleep(13000);

await showEntry('NAME.COM');
mark('registrar check on screen');
await sleep(4000);

await glide('#rejectBtn', 800);
mark('hover Send back');
await sleep(4000);
// Two-key ignition, honestly: arm, then release. The release RESUMES the
// paused invocation on Cloud Run, so the wait after the click is real.
await glide('#keyArm', 800);
await sleep(900);
await page.locator('#keyArm').click();
await sleep(1400);
await glide('#approveBtn', 700);
await sleep(1200);
mark('click Approve');
await page.locator('#approveBtn').click();
await page.waitForFunction(
  () => document.getElementById('ag-ship').classList.contains('done'), null, { timeout: 240000 });
mark('release confirmed');
await sleep(4000);

// ---- the proof beat: the backend itself, on a *.run.app URL ----------------
mark('cloud run proof');
await page.goto(RUNAPP, { waitUntil: 'networkidle' }).catch(() => {});
await sleep(6000);
mark('cloud run proof done');

// back for the close
await page.goto(SITE, { waitUntil: 'networkidle' });
await page.mouse.move(960, 860, { steps: 18 });
mark('close on cockpit');
await sleep(4500);
mark('cut');

await record(false);
await sleep(400);
await browser.close();

console.log(`\ncaptured ${shots.length} frames`);
const lines = [];
for (let i = 0; i < shots.length; i++) {
  const dur = i < shots.length - 1
    ? Math.max(1 / 120, shots[i + 1].t - shots[i].t)
    : 1 / FPS;
  lines.push(`file '${shots[i].file}'`, `duration ${dur.toFixed(5)}`);
}
lines.push(`file '${shots[shots.length - 1].file}'`);
const list = path.join(OUT, 'frames.txt');
writeFileSync(list, lines.join('\n'));

const mp4 = path.join(OUT, 'fleetcommand-google-4k.mp4');
console.log('encoding 4K...');
execFileSync('ffmpeg', [
  '-y', '-f', 'concat', '-safe', '0', '-i', list,
  '-vf', `fps=${FPS},scale=3840:2160:flags=lanczos`,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '16',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  mp4,
], { stdio: ['ignore', 'ignore', 'inherit'] });

const rel = marks.map(([abs, m]) => [(abs - videoStart) / 1000, m]);
writeFileSync(path.join(OUT, 'marks-google.json'), JSON.stringify(
  { duration: shots.length ? shots[shots.length - 1].t - shots[0].t : 0,
    marks: rel.map(([t, m]) => ({ t: +t.toFixed(2), name: m })) }, null, 2));

console.log('\n--- MARKS ---');
for (const [t, m] of rel) {
  console.log(`${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}  ${m}`);
}
const vlen = shots.length ? shots[shots.length - 1].t - shots[0].t : 0;
console.log(`\nMASTER LENGTH ${Math.floor(vlen / 60)}:${String(Math.round(vlen % 60)).padStart(2, '0')} (waits get cut in the edit)`);
console.log('VIDEO:' + mp4);
