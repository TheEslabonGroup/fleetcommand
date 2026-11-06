# Capture ONE continuous score from Lyria RealTime, steered live at the film's
# story beats, so there are no seams: it is a single performance that grows.
# Two spans: the mission build (film 11.5 -> 117, the gate cuts it), and a warm
# resolution (film 144.4 -> end). Steering is scheduled against the amount of
# AUDIO RECEIVED, not wall clock, so the morphs land at musical time.
import asyncio, os, sys
from google import genai
from google.genai import types

KEY = ''
with open('/Users/thebrockchain/Documents/thebrockchain/bambam/.dev.vars') as f:
    for line in f:
        if line.startswith('GOOGLE_AI_API_KEY='):
            KEY = line.strip().split('=', 1)[1].strip('"\'')
if not KEY:
    sys.exit('no key')

S = '/private/tmp/claude-501/-Users-thebrockchain-Documents/8ae13aa7-9512-4d32-9606-b860d7a0e8a7/scratchpad/vo'
BYTES_PER_SEC = 48000 * 2 * 2  # 48k stereo s16le (sanity-checked after capture)

# (at_seconds, prompts[(text, weight)], density, brightness)
BUILD_PLAN = [
    (0,  [('intimate sparse felt piano, warm, mysterious, cinematic', 1.0),
          ('soft airy synth pad', 0.4)], 0.18, 0.40),
    (26, [('intimate sparse felt piano, warm, mysterious, cinematic', 0.7),
          ('soft ticking minimal synth pulse, quiet deep bass', 1.0)], 0.32, 0.45),
    (56, [('soft ticking minimal synth pulse, quiet deep bass', 1.0),
          ('dark sustained cinematic strings, building suspense', 0.8),
          ('intimate sparse felt piano', 0.35)], 0.50, 0.50),
    (84, [('driving dark cinematic pulse, urgent low strings, relentless build', 1.0),
          ('dark sustained cinematic strings, building suspense', 0.8)], 0.68, 0.55),
]
BUILD_SECONDS = 112
CODA_PROMPTS = [('warm hopeful soft piano and lush pads, gentle resolution, human, cinematic', 1.0),
                ('soft airy synth pad', 0.5)]
CODA_SECONDS = 28


async def capture(session, path, seconds, plan):
    done_idx = 0
    got = 0
    with open(path, 'wb') as out:
        async for msg in session.receive():
            if msg.server_content and msg.server_content.audio_chunks:
                for ch in msg.server_content.audio_chunks:
                    if ch.data:
                        out.write(ch.data)
                        got += len(ch.data)
            t = got / BYTES_PER_SEC
            while plan and done_idx < len(plan) and t >= plan[done_idx][0] and plan[done_idx][0] > 0:
                _, prompts, dens, bright = plan[done_idx]
                await session.set_weighted_prompts(
                    prompts=[types.WeightedPrompt(text=p, weight=w) for p, w in prompts])
                await session.set_music_generation_config(
                    config=types.LiveMusicGenerationConfig(
                        bpm=90, scale=types.Scale.F_MAJOR_D_MINOR,
                        density=dens, brightness=bright))
                print(f'  morph at {t:.1f}s', flush=True)
                done_idx += 1
            if t >= seconds:
                break
    print(f'captured {got / BYTES_PER_SEC:.1f}s -> {path}', flush=True)


async def main():
    client = genai.Client(api_key=KEY, http_options={'api_version': 'v1alpha'})
    async with client.aio.live.music.connect(model='models/lyria-realtime-exp') as session:
        first = BUILD_PLAN[0]
        await session.set_weighted_prompts(
            prompts=[types.WeightedPrompt(text=p, weight=w) for p, w in first[1]])
        await session.set_music_generation_config(
            config=types.LiveMusicGenerationConfig(
                bpm=90, scale=types.Scale.F_MAJOR_D_MINOR,
                density=first[2], brightness=first[3]))
        await session.play()
        print('build span rolling', flush=True)
        await capture(session, f'{S}/score-build.raw', BUILD_SECONDS, BUILD_PLAN[1:])
        # hard stop resets musical context: the silence at the gate is real
        await session.stop()
        await session.set_weighted_prompts(
            prompts=[types.WeightedPrompt(text=p, weight=w) for p, w in CODA_PROMPTS])
        await session.set_music_generation_config(
            config=types.LiveMusicGenerationConfig(
                bpm=84, scale=types.Scale.F_MAJOR_D_MINOR, density=0.28, brightness=0.5))
        await session.play()
        print('coda rolling', flush=True)
        await capture(session, f'{S}/score-coda.raw', CODA_SECONDS, [])

asyncio.run(main())
