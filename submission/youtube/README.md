# YouTube: the shipped hackathon demo videos and channel

Everything that went onto the @BrockchainLabs YouTube channel for the two
hackathon entries. Both films are live and public; this is the organized
source of what was uploaded, moved off the Desktop 2026-08-27.

## videos/
- `fleetcommand-NARRATOR-music.mp4` - the DevNetwork film (Cloudflare cockpit).
  LIVE: https://youtu.be/6L4Ez-XEcKo  "Fleet Command: an AI ops crew with a
  human approval gate"
- `fleetcommand-GOOGLE-demo.mp4` - the All Things Agentic film (the /google
  cockpit, shot live on Cloud Run with the *.run.app proof beat).
  LIVE: https://youtu.be/jGqDP-tnLaM  "Fleet Command on Google Cloud demo"

Both were built by the pipeline in `../video-pipeline/` (narration by
gemini-3.1-flash-tts, score by Lyria RealTime, mixed with ffmpeg). Working
intermediates live in `../.work/`.

## thumbnails/
- `devnetwork-thumbnail.png` - indigo "FLEET COMMAND / The gate is the product."
- `google-thumbnail.png` - teal "ADK / Cloud Run" variant.
Both 1280x720, brand crest badge.

## channel/
Branding uploaded to the channel (originals derive from
brock-portfolio-website/social-media): `avatar-800.png`, `banner-3840x2160.jpg`
(refit to YouTube's TV-safe strip), `watermark-150.png`. Plus the copy that was
pasted in: `channel-about.txt` (channel description + links) and
`google-video-description.txt` (the Google film's description).
