// Mix v8: the trailer cut. Epic hybrid Lyria score OPENS the film at 0:00 and
// drives to the gate; the gate still kills it dead; a triumphant coda returns
// on Approve, swells, and instead of drifting out it lands a FINAL HIT as
// "Fleet Command" is spoken: music cuts, the sub rings under the last words,
// then silence. Music runs hot (trailer balance) with a gentle wide duck so
// the narrator always rides on top without the score ever vanishing.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ALL FOUR PATHS BELOW NAMED ANOTHER MAC (fixed 2026-08-31), the same family
 * as gen_tts.mjs beside it: a scratchpad belonging to one session on a machine
 * whose user is `thebrockchain`, and three ~/Desktop paths under that same
 * absent home. On this Mac every one of them resolves to nothing.
 *
 * They now sit beside the repo, where the takes already live, and each is
 * overridable by env. `submission/fleetcommand-demo.mp4` is already gitignored
 * and the two renders are added to that ignore in the same change. */
const HERE = dirname(fileURLToPath(import.meta.url));
const S = process.env.VO_OUT || resolve(HERE, '..', 'vo');
const FILM = process.env.FILM_IN || resolve(HERE, '..', 'fleetcommand-demo.mp4');
const OUT = process.env.FILM_OUT || (process.env.NOMUSIC
  ? resolve(HERE, '..', 'fleetcommand-NARRATOR-clean.mp4')
  : resolve(HERE, '..', 'fleetcommand-NARRATOR-music.mp4'));

/* SAY THE MISSING FILM OUT LOUD. submission/vo/NOTES.md records that the cut
 * film does not exist anywhere on disk despite VIDEO-SCRIPT.md saying it was
 * cut, so this script's most likely failure is a missing input, not a bug.
 * Without this check ffprobe fails deep in a loop with an ffmpeg error. */
if (!existsSync(FILM)) {
  console.error(`no film at ${FILM}`);
  console.error('It must be re-rendered with record.mjs and edit.mjs first, or point FILM_IN at it.');
  console.error('See submission/vo/NOTES.md, "Also owed before the video ships".');
  process.exit(1);
}
const FILM_LEN = 161.97;

const ANCHORS = [3.90, 12.40, 14.80, 33.40, 42.43, 62.00, 82.00, 100.00, 119.50, 130.67, 140.83, 144.45, 154.85, 161.05];
const durs = ANCHORS.map((_, i) => Number(execSync(
  `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${S}/tts-tight-${String(i + 1).padStart(2, '0')}.wav"`
).toString().trim()));

let placements = [], prevEnd = 0;
ANCHORS.forEach((anchor, i) => {
  const start = Math.max(anchor, prevEnd + 0.35);
  placements.push({ start, len: durs[i] });
  prevEnd = start + durs[i];
});
const voiceEnd = prevEnd;
const freeze = Math.max(0, voiceEnd + 1.3 - FILM_LEN);
const TOTAL = FILM_LEN + freeze;
console.log('voice ends', voiceEnd.toFixed(2), 'freeze', freeze.toFixed(2), 'total', TOTAL.toFixed(2));
const L14 = placements[13].start;          // the close line: the final hit lands here
const HITC = (L14 - 0.15).toFixed(2);
console.log('final hit at', HITC);

const parts = placements.map((p, i) =>
  `[${i + 1}:a]aresample=48000,afade=t=in:d=0.04,afade=t=out:st=${Math.max(0, p.len - 0.1).toFixed(3)}:d=0.1,` +
  `adelay=${Math.round(p.start * 1000)}|${Math.round(p.start * 1000)}[c${i}]`);
const voice = placements.map((_, i) => `[c${i}]`).join('') +
  `amix=inputs=${placements.length}:normalize=0,` +
  'equalizer=f=3000:t=q:w=1.2:g=1.5,' +
  'acompressor=threshold=-16dB:ratio=2:attack=8:release=180:makeup=2dB,' +
  'volume=4dB,alimiter=limit=0.9:level=false,aresample=48000,asplit[vo][vokey]';

const music = [
  // THE SCORE, from frame one. Hard out just before the gate slam.
  `[15:a]atrim=0:117.1,asetpts=PTS-STARTPTS,afade=t=in:d=0.3,` +
    `equalizer=f=1800:t=q:w=1.4:g=-2,afade=t=out:st=116.1:d=1.0,volume=1.0[bed]`,
  // slam A rides ON the score
  `aevalsrc='0.9*sin(2*PI*(38+160*exp(-3.2*t))*t)*exp(-3.4*t)':d=1.8:s=48000,lowpass=f=500,afade=t=out:st=1.2:d=0.55,volume=0.70,adelay=3450|3450[subA]`,
  `anoisesrc=c=pink:d=0.4:a=0.9,lowpass=f=900,afade=t=out:st=0.05:d=0.33,aecho=0.7:0.35:100:0.3,volume=0.35,adelay=3440|3440[airA]`,
  // slam B: the gate. Score dies with it.
  `aevalsrc='0.95*sin(2*PI*(33+150*exp(-2.3*t))*t)*exp(-1.6*t)':d=4.5:s=48000,lowpass=f=420,volume=0.80,adelay=117250|117250[subB]`,
  `aevalsrc='0.8*sin(2*PI*42*t)*exp(-1.1*t)':d=5:s=48000,lowpass=f=120,volume=0.60,adelay=117260|117260[subB2]`,
  `anoisesrc=c=pink:d=0.5:a=0.8,lowpass=f=500,afade=t=out:st=0.05:d=0.4,aecho=0.6:0.35:120:0.3,volume=0.28,adelay=117240|117240[airB]`,
  // bloom into the coda
  `anoisesrc=c=pink:d=1.8:a=0.5,lowpass=f=450,afade=t=in:d=1.6,afade=t=out:st=1.6:d=0.2,volume=0.30,adelay=142800|142800[bloom]`,
  // the coda: triumphant, swelling, then CUT at the final hit instead of a fade
  `[16:a]atrim=0:${(L14 - 144.45 - 0.1).toFixed(2)},asetpts=PTS-STARTPTS,afade=t=in:d=1.2,` +
    `volume=volume='1+0.5*min(1,max(0,(t-8)/6))':eval=frame,` +
    `afade=t=out:st=${(L14 - 144.45 - 0.55).toFixed(2)}:d=0.45,volume=0.85,adelay=144450|144450[coda]`,
  // THE BUTTON: the last hit, landing with "Fleet Command", ringing into black
  `aevalsrc='0.95*sin(2*PI*(35+150*exp(-2.6*t))*t)*exp(-1.9*t)':d=3.5:s=48000,lowpass=f=450,volume=0.85,adelay=${Math.round((L14 - 0.15) * 1000)}|${Math.round((L14 - 0.15) * 1000)}[subC]`,
  `anoisesrc=c=pink:d=0.5:a=0.85,lowpass=f=600,afade=t=out:st=0.05:d=0.4,aecho=0.6:0.35:120:0.3,volume=0.35,adelay=${Math.round((L14 - 0.16) * 1000)}|${Math.round((L14 - 0.16) * 1000)}[airC]`,
].filter(m => !process.env.NOMUSIC || !/\[(bed|bloom|coda)\]$/.test(m)).join(';');
const musicLabels = process.env.NOMUSIC
  ? '[subA][airA][subB][subB2][airB][subC][airC]'
  : '[bed][subA][airA][subB][subB2][airB][bloom][coda][subC][airC]';
const musicMix = `${musicLabels}amix=inputs=${musicLabels.split('][').length}:normalize=0,alimiter=limit=0.85:level=false[mus]`;
// Gentle, wide duck: the score leans back for the narrator, never vanishes.
const duck = `[mus][vokey]sidechaincompress=threshold=0.05:ratio=2.5:attack=30:release=600:makeup=1[musd]`;
const master = `[vo][musd]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo,alimiter=limit=0.94:level=false,aresample=48000[out]`;
const vid = `[0:v]tpad=stop_mode=clone:stop_duration=${freeze.toFixed(2)}[v]`;
const graph = [vid, ...parts, voice, music, musicMix, duck, master].join(';');

const ttsInputs = ANCHORS.map((_, i) => `-i "${S}/tts-tight-${String(i + 1).padStart(2, '0')}.wav"`).join(' ');
execSync(`ffmpeg -hide_banner -loglevel error -y -i "${FILM}" ${ttsInputs} ` +
  `-i "${S}/score-build.wav" -i "${S}/score-coda.wav" ` +
  `-filter_complex "${graph}" -map "[v]" -map "[out]" ` +
  `-c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -c:a aac -b:a 224k "${OUT}"`, { stdio: 'inherit' });
console.log('written:', OUT);
