// chrome-bin.mjs - which Chrome the headless tools drive, in one place.
//
// THE HIDDEN TEST CHROME (chrome-headless-shell), NOT THE GOOGLE CHROME APP
// (2026-10-23). Any Chrome started from /Applications/Google Chrome.app, even
// headless, puts a second Chrome icon in the Dock that bounces and vanishes on
// every launch, and answers to `tell application "Google Chrome"` while it
// lives. The shell is a plain binary, so macOS never gives it a Dock icon.
// lemonupside/tools/chrome-bin.mjs made the same move on 2026-09-12.
//
// Order: BROCK_CHROME=app forces the app (a run that needs its video codecs).
// Then the newest shell under ~/.cache/puppeteer. Then the app, on a Mac with
// no shell. Install one with
//   npx @puppeteer/browsers install chrome-headless-shell@stable --path ~/.cache/puppeteer
import { existsSync, readdirSync } from 'node:fs';
import { homedir, userInfo } from 'node:os';
import { join } from 'node:path';

export const CHROME_APP = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// $HOME FIRST, THEN THE ACCOUNT'S OWN HOME (2026-11-18). A test runner gave these
// tools a pretend HOME with no shell in it. homedir() obeys $HOME, so the shell
// looked missing and the Google Chrome app was started instead. The app found no
// keychain under the pretend home, and macOS put a "Keychain Not Found" box on
// the owner's screen. So when $HOME has no shell, the account's own home
// (userInfo(), which ignores $HOME) is tried before the app. $HOME stays first:
// a CI job installs a pinned shell into its own test home, and that one must win.
export function realHome() {
  try { const h = userInfo().homedir; if (h) return h; } catch { /* an account with no record */ }
  return homedir();
}
const rootOf = (home) => join(home, '.cache', 'puppeteer', 'chrome-headless-shell');
const ROOT = rootOf(homedir());

// mac_arm-154.0.8037.57 sorts by its numbers, so 154 beats 99
const ver = (d) => (String(d).match(/(\d+(?:\.\d+)+)$/) || [, '0'])[1].split('.').map(Number);
const newer = (a, b) => { const x = ver(a), y = ver(b); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (y[i] || 0) - (x[i] || 0); if (d) return d; } return 0; };

export function findShell(root = ROOT) {
  if (!existsSync(root)) return null;
  for (const v of readdirSync(root).sort(newer)) {
    let inner = [];
    try { inner = readdirSync(join(root, v)); } catch { continue; }
    for (const d of inner) {
      const bin = join(root, v, d, 'chrome-headless-shell');
      if (existsSync(bin)) return bin;
    }
  }
  return null;
}

export const CHROME_DEFAULT = process.env.BROCK_CHROME === 'app' ? CHROME_APP : (findShell() || findShell(rootOf(realHome())) || CHROME_APP);
