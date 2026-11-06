# The video production pipeline

The shipped demo film was produced end to end by this pipeline on 2026-08-27.
Every sound in it was generated on the same Google stack the entry runs on:

- **Narration:** `gen_tts.mjs` - gemini-3.1-flash-tts, voice Charon, fourteen
  lines read at broadcast pace, edge silence trimmed, internal pauses capped.
- **Score:** `capture3.py` - ONE continuous Lyria RealTime performance, steered
  live at the film's story beats (drone open, stillness under narration, the
  vocalise at 0:42, war drums at 1:08, climax into the gate, then a triumphant
  coda), in the desert-epic register. `capture_score.py` is the earlier
  intimate-piano steering, kept for reference.
- **Mix:** `mix8.mjs` - lines placed at the mark map, score from frame one,
  synthesized impact hits on both slams, DEAD SILENCE at the gate, and a final
  button hit landing on "Fleet Command" instead of a fade-out. Music ducks
  gently under the narrator; shipped balance verified with volumedetect.

Hard lessons encoded here: never loudnorm a sparse bus, alimiter needs
level=false, aecho's second arg is OUTPUT gain, and AI listening reviews are
advisory only - the shipping gate is measured ratios plus Brock's ear.
