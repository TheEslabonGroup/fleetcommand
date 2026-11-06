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
    (0,  [('vast dark sci-fi desert epic drone, deep throbbing sub bass pulse, ominous ancient cinematic atmosphere, massive scale', 1.0)], 0.50, 0.40),
    (13, [('deep meditative dark drone, sparse colossal distant percussion booms, desert wind texture, tense stillness, vast', 1.0)], 0.30, 0.38),
    (42, [('deep dark drone with giant slow percussion', 0.85),
          ('haunting ethereal wordless female vocalise, distant and rising, mystical', 0.7)], 0.45, 0.45),
    (68, [('colossal tribal war drums, pounding epic percussion, deep braams, dark rising fury, wordless vocalise', 1.0)], 0.65, 0.50),
    (95, [('apocalyptic desert epic climax, overwhelming massive drums, screaming ethereal vocalise, deep braams, maximum intensity', 1.0)], 0.85, 0.58),
]
BUILD_SECONDS = 118
CODA_PROMPTS = [('vast emotional cinematic resolution, warm epic strings, soft ethereal wordless voice, sunrise over a desert, awe and hope, majestic', 1.0)]
CODA_SECONDS = 26


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
                        bpm=95, scale=types.Scale.F_MAJOR_D_MINOR,
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
                bpm=78, scale=types.Scale.F_MAJOR_D_MINOR, density=0.28, brightness=0.5))
        await session.play()
        print('coda rolling', flush=True)
        await capture(session, f'{S}/score-coda.raw', CODA_SECONDS, [])

asyncio.run(main())
