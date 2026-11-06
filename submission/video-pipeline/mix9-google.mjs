// Mix v9: the GOOGLE film. Narration and score land on the EDITED timeline
// (marks-edited.json from edit-google.mjs), so nothing is hand-timed. Fourteen
// Charon lines, two of them Google-specific (g08 honesty, g13 the no-key
// Vertex line at the *.run.app proof beat). The desert-epic Lyria score runs
// from frame one, dies at the gate, returns on the approve, and lands the
// final button on "Fleet Command". Balance carried from the shipped film.
//
//   node mix9-google.mjs <edited-1080.mp4> <out.mp4>
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const S = '/private/tmp/claude-501/-Users-thebrockchain-Documents/8ae13aa7-9512-4d32-9606-b860d7a0e8a7/scratchpad/vo';
const [FILM, OUT] = process.argv.slice(2);
if (!FILM || !OUT) { console.error('usage: node mix9-google.mjs <edited.mp4> <out.mp4>'); process.exit(1); }
const ME = JSON.parse(readFileSync(path.join(path.dirname(FILM), 'marks-edited.json'), 'utf8'));
const M = ME.marks;
const FILM_LEN = ME.duration;
const at = (n, off = 0) => { if (!(n in M)) throw new Error('no mark ' + n); return M[n] + off; };

// [anchor, ttsFile]
const LINES = [
  [at('COLD OPEN SLAM', 0.4), 'tts-tight-01.wav'],
  [at('cut to idle cockpit', 0.4), 'tts-tight-02.wav'],
  [at('crew pass', 0.1), 'tts-tight-03.wav'],
  [at('click Run mission', 0.3), 'tts-tight-04.wav'],
  [at('SCOUT market lens on screen', 0.2), 'tts-tight-05.wav'],
  [at('SCOUT market lens on screen', 17), 'tts-tight-06.wav'],
  [at('SCOUT market lens on screen', 31), 'tts-tight-07.wav'],
  [at('SCOUT market lens on screen', 45), 'tts-tight-g08.wav'],
  [at('GATE ARMS', 2.2), 'tts-tight-09.wav'],
  [at('registrar check on screen', 0.3), 'tts-tight-10.wav'],
  [at('hover Send back', 0.3), 'tts-tight-11.wav'],
  [at('click Approve', 0.3), 'tts-tight-12.wav'],
  [at('cloud run proof', 0.8), 'tts-tight-g13.wav'],
  [at('close on cockpit', 0.3), 'tts-tight-14.wav'],
];
const TEMPO = {4:1.06, 7:1.05};
const durs = LINES.map(([, f]) => Number(execSync(
  `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${S}/${f}"`).toString().trim()));

let placements = [], prevEnd = 0;
LINES.forEach(([anchor], i) => {
  const tempo = TEMPO[i] || 1;
  const len = durs[i] / tempo;
  const start = Math.max(anchor, prevEnd + 0.3);
  placements.push({ start, len, tempo });
  prevEnd = start + len;
});
placements.forEach((p, i) => console.log('L' + (i + 1), p.start.toFixed(2), '->', (p.start + p.len).toFixed(2)));
const voiceEnd = prevEnd;
const freeze = Math.max(0, voiceEnd + 1.3 - FILM_LEN);
const TOTAL = FILM_LEN + freeze;
console.log('film', FILM_LEN.toFixed(1), 'voice ends', voiceEnd.toFixed(2), 'freeze', freeze.toFixed(2), 'total', TOTAL.toFixed(2));
if (TOTAL > 238) console.warn('WARNING: near the 4:00 limit');

const GATE = at('GATE ARMS');
const APPROVE = at('click Approve');
const HITC = placements[13].start - 0.15;   // the button lands with "Fleet Command"
const codaLen = Math.max(4, HITC - (APPROVE + 0.2) - 0.1);

const parts = placements.map((p, i) =>
  `[${i + 1}:a]aresample=48000,` + (p.tempo !== 1 ? `atempo=${p.tempo},` : '') + `afade=t=in:d=0.04,afade=t=out:st=${Math.max(0, p.len - 0.1).toFixed(3)}:d=0.1,` +
  `adelay=${Math.round(p.start * 1000)}|${Math.round(p.start * 1000)}[c${i}]`);
const voice = placements.map((_, i) => `[c${i}]`).join('') +
  `amix=inputs=${placements.length}:normalize=0,` +
  'equalizer=f=3000:t=q:w=1.2:g=1.5,' +
  'acompressor=threshold=-16dB:ratio=2:attack=8:release=180:makeup=2dB,' +
  'volume=4dB,alimiter=limit=0.9:level=false,aresample=48000,asplit[vo][vokey]';

const d = ms => `${Math.round(ms)}|${Math.round(ms)}`;
const music = [
  // the score from frame one to the gate
  `[15:a]atrim=0:${Math.min(117.9, GATE - 0.2).toFixed(2)},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,` +
    `equalizer=f=1800:t=q:w=1.4:g=-2,afade=t=out:st=${(Math.min(117.9, GATE - 0.2) - 1.0).toFixed(2)}:d=1.0,volume=1.0[bed]`,
  // slam A on the cold-open gate
  `aevalsrc='0.9*sin(2*PI*(38+160*exp(-3.2*t))*t)*exp(-3.4*t)':d=1.8:s=48000,lowpass=f=500,afade=t=out:st=1.2:d=0.55,volume=0.70,adelay=${d(at('COLD OPEN SLAM', -0.06) * 1000)}[subA]`,
  `anoisesrc=c=pink:d=0.4:a=0.9,lowpass=f=900,afade=t=out:st=0.05:d=0.33,aecho=0.7:0.35:100:0.3,volume=0.35,adelay=${d(at('COLD OPEN SLAM', -0.07) * 1000)}[airA]`,
  // slam B: the gate, score dies with it
  `aevalsrc='0.95*sin(2*PI*(33+150*exp(-2.3*t))*t)*exp(-1.6*t)':d=4.5:s=48000,lowpass=f=420,volume=0.80,adelay=${d(GATE * 1000 - 90)}[subB]`,
  `aevalsrc='0.8*sin(2*PI*42*t)*exp(-1.1*t)':d=5:s=48000,lowpass=f=120,volume=0.60,adelay=${d(GATE * 1000 - 80)}[subB2]`,
  `anoisesrc=c=pink:d=0.5:a=0.8,lowpass=f=500,afade=t=out:st=0.05:d=0.4,aecho=0.6:0.35:120:0.3,volume=0.28,adelay=${d(GATE * 1000 - 100)}[airB]`,
  // bloom into the coda on the approve click
  `anoisesrc=c=pink:d=1.8:a=0.5,lowpass=f=450,afade=t=in:d=1.6,afade=t=out:st=1.6:d=0.2,volume=0.30,adelay=${d((APPROVE - 1.6) * 1000)}[bloom]`,
  // the coda: approve to the button, swelling, cut at the hit
  `[16:a]atrim=0:${codaLen.toFixed(2)},asetpts=PTS-STARTPTS,afade=t=in:d=1.2,` +
    `volume=volume='1+0.5*min(1,max(0,(t-${(codaLen * 0.55).toFixed(1)})/5))':eval=frame,` +
    `afade=t=out:st=${(codaLen - 0.45).toFixed(2)}:d=0.4,volume=0.85,adelay=${d((APPROVE + 0.2) * 1000)}[coda]`,
  // THE BUTTON on "Fleet Command"
  `aevalsrc='0.95*sin(2*PI*(35+150*exp(-2.6*t))*t)*exp(-1.9*t)':d=3.5:s=48000,lowpass=f=450,volume=0.85,adelay=${d(HITC * 1000)}[subC]`,
  `anoisesrc=c=pink:d=0.5:a=0.85,lowpass=f=600,afade=t=out:st=0.05:d=0.4,aecho=0.6:0.35:120:0.3,volume=0.35,adelay=${d((HITC - 0.01) * 1000)}[airC]`,
].join(';');
const musicMix = `[bed][subA][airA][subB][subB2][airB][bloom][coda][subC][airC]amix=inputs=10:normalize=0,alimiter=limit=0.85:level=false[mus]`;
const duck = `[mus][vokey]sidechaincompress=threshold=0.05:ratio=2.5:attack=30:release=600:makeup=1[musd]`;
const master = `[vo][musd]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo,alimiter=limit=0.94:level=false,aresample=48000[out]`;
const vid = `[0:v]tpad=stop_mode=clone:stop_duration=${freeze.toFixed(2)}[v]`;
const graph = [vid, ...parts, voice, music, musicMix, duck, master].join(';');

const inputs = LINES.map(([, f]) => `-i "${S}/${f}"`).join(' ');
execSync(`ffmpeg -hide_banner -loglevel error -y -i "${FILM}" ${inputs} ` +
  `-i "${S}/score-build.wav" -i "${S}/score-coda.wav" ` +
  `-filter_complex "${graph}" -map "[v]" -map "[out]" ` +
  `-c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -c:a aac -b:a 224k "${OUT}"`, { stdio: 'inherit' });
console.log('written:', OUT);
