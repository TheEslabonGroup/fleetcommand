// Cut the GOOGLE 4K master into the edited film. Same crop-of-4K grammar as
// submission/edit.mjs, with one addition the live backend forces: WAIT
// COMPRESSION. Real Gemini latency sits between the mission beats, so the two
// long stretches (Run -> market lens, market lens -> gate) are covered by
// jump-cut slices instead of realtime, which reads as time passing. The rules
// allow 4:00 for this event, so the film breathes at ~3:15.
//
//   node edit-google.mjs <master-4k.mp4> <out-1080.mp4> [marks-google.json]
//
// Emits marks-edited.json beside the output: every named beat's position in
// EDITED time, which mix9 uses to place narration and score.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [master, out, marksArg] = process.argv.slice(2);
if (!master || !out) { console.error('usage: node edit-google.mjs <master> <out> [marks.json]'); process.exit(1); }

const MARKS = JSON.parse(readFileSync(marksArg || path.join(path.dirname(master), 'marks-google.json'), 'utf8'));
const M = Object.fromEntries(MARKS.marks.map(m => [m.name, m.t]));
const END = MARKS.duration;
const at_ = (name, off = 0) => {
  if (!(name in M)) throw new Error(`mark not found: ${name}`);
  return Math.max(0, M[name] + off);
};

const W = 3840, H = 2160, OW = 1920, OH = 1080;

// The two waits to compress, sliced. Slices are chosen relative to their
// bounding marks so any re-record keeps working.
const runT = at_('click Run mission');
const lensT = at_('SCOUT market lens on screen');
const gateT = at_('GATE ARMS');
const wait1 = lensT - runT;          // SCOUT thinking
const wait2 = gateT - (lensT + 16);  // AUDIT + MEDIC + SHIP working

console.log(`wait1 (run->lens) ${wait1.toFixed(1)}s, wait2 (lens+16->gate) ${wait2.toFixed(1)}s`);

// SHOTS: { a, b, z, cx0, cy0, cx1, cy1 } in MASTER time; gaps between shots
// are simply dropped (the jump cut).
const SHOTS = [
  // cold open: tight on a live mission already deep in work
  { a: 0, b: at_('COLD OPEN SLAM', -0.3), z: 1.15, cx0: .52, cy0: .48, cx1: .46, cy1: .5 },
  { a: at_('COLD OPEN SLAM', -0.3), b: at_('cut to idle cockpit'), z: 1.0, cx0: .5, cy0: .5, cx1: .5, cy1: .5 },
  { a: at_('cut to idle cockpit'), b: at_('crew pass'), z: 1.0, cx0: .5, cy0: .5, cx1: .5, cy1: .5 },
  { a: at_('crew pass'), b: at_('click Run mission'), z: 1.9, cx0: .17, cy0: .30, cx1: .17, cy1: .42 },
  // the click and SCOUT's first seconds, then JUMP to just before the lens lands
  { a: runT, b: runT + Math.min(9, wait1), z: 1.25, cx0: .44, cy0: .40, cx1: .47, cy1: .46 },
  { a: Math.max(runT + 9, lensT - 5), b: lensT, z: 1.25, cx0: .47, cy0: .46, cx1: .47, cy1: .46 },
  // the market lens, held
  { a: lensT, b: lensT + 16, z: 1.5, cx0: .45, cy0: .40, cx1: .45, cy1: .50 },
  // the crew works: three jump-cut slices across the real wait
  { a: lensT + 16 + wait2 * 0.10, b: lensT + 16 + wait2 * 0.10 + 14, z: 1.22, cx0: .47, cy0: .40, cx1: .48, cy1: .50 },
  { a: lensT + 16 + wait2 * 0.45, b: lensT + 16 + wait2 * 0.45 + 14, z: 1.35, cx0: .17, cy0: .38, cx1: .17, cy1: .46 },
  { a: lensT + 16 + wait2 * 0.78, b: lensT + 16 + wait2 * 0.78 + 12, z: 1.22, cx0: .48, cy0: .48, cx1: .49, cy1: .58 },
  // wide into the slam
  { a: at_('GATE ARMS', -2.5), b: at_('GATE ARMS'), z: 1.0, cx0: .5, cy0: .5, cx1: .5, cy1: .5 },
  { a: at_('GATE ARMS'), b: at_('registrar check on screen'), z: 1.0, cx0: .5, cy0: .5, cx1: .5, cy1: .5 },
  { a: at_('registrar check on screen'), b: at_('hover Send back'), z: 1.6, cx0: .42, cy0: .70, cx1: .42, cy1: .80 },
  // the decision: both keys turn, the release resumes the paused run for real
  { a: at_('hover Send back'), b: at_('release confirmed', 1.5), z: 1.85, cx0: .80, cy0: .16, cx1: .84, cy1: .22 },
  { a: at_('release confirmed', 1.5), b: at_('cloud run proof'), z: 1.3, cx0: .5, cy0: .35, cx1: .48, cy1: .48 },
  // the proof: the backend itself on its *.run.app URL
  { a: at_('cloud run proof', 1.0), b: at_('cloud run proof done'), z: 1.0, cx0: .5, cy0: .45, cx1: .5, cy1: .45 },
  // close, all the way out
  { a: at_('close on cockpit'), b: END, z: 1.0, cx0: .5, cy0: .5, cx1: .5, cy1: .5 },
].filter(s => s.b - s.a > 0.3);

// Edited-time positions of every mark that falls inside a kept shot.
let acc = 0;
const edited = {};
for (const s of SHOTS) {
  for (const m of MARKS.marks) {
    if (m.t >= s.a - 1.5 && m.t < s.b && !(m.name in edited)) edited[m.name] = acc + Math.max(0, m.t - s.a);
  }
  s.editedStart = acc;
  acc += s.b - s.a;
}
const editedDuration = acc;
console.log('edited length', editedDuration.toFixed(1), 's');

const tmp = mkdtempSync(path.join(tmpdir(), 'fcg-'));
const parts = [];
SHOTS.forEach((s, i) => {
  const dur = (s.b - s.a).toFixed(3);
  const cw = Math.round(W / s.z / 2) * 2;
  const ch = Math.round(H / s.z / 2) * 2;
  const e = `(0.5-0.5*cos(PI*min(1,max(0,t/${dur}))))`;
  const cx = `(${s.cx0}+(${s.cx1}-${s.cx0})*${e})`;
  const cy = `(${s.cy0}+(${s.cy1}-${s.cy0})*${e})`;
  const x = `max(0,min(${W - cw},${cx}*${W}-${cw}/2))`;
  const y = `max(0,min(${H - ch},${cy}*${H}-${ch}/2))`;
  const f = path.join(tmp, `p${String(i).padStart(2, '0')}.mp4`);
  execFileSync('ffmpeg', [
    '-y', '-ss', String(s.a), '-t', dur, '-i', master,
    '-vf', `crop=${cw}:${ch}:x='${x}':y='${y}',scale=${OW}:${OH}:flags=lanczos,setsar=1`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-an', f,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  parts.push(f);
  console.log(`shot ${i + 1}/${SHOTS.length}  ${s.a.toFixed(1)}-${s.b.toFixed(1)}  z${s.z}  edited@${s.editedStart.toFixed(1)}`);
});

const list = path.join(tmp, 'list.txt');
writeFileSync(list, parts.map(p => `file '${p}'`).join('\n'));
execFileSync('ffmpeg', [
  '-y', '-f', 'concat', '-safe', '0', '-i', list,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out,
], { stdio: ['ignore', 'ignore', 'inherit'] });

writeFileSync(path.join(path.dirname(out), 'marks-edited.json'),
  JSON.stringify({ duration: editedDuration, marks: edited }, null, 2));
console.log('\nedited ->', out);
console.log('marks-edited.json written');
