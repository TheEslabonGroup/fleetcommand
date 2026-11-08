# On Your Go social profile art

Made 2026-11-08. Nothing here is posted. Making the accounts and uploading
these files is Brock's step; this folder is only the art.

Planned accounts (the presence register, `scarlet/tools/presence.mjs`, row
`fleetcommand`): **X and YouTube** as `onyourgo`, and **TikTok** as
`onyourgohq`, because TikTok `@onyourgo` belongs to a stranger
(`docs/NAMING.md`). No domain yet: `onyourgo.com` is on the buy list. The
register notes these lanes were set by the social session, not ruled by
Brock. The repo and the Pages project keep the codename `fleetcommand`; the
old product name appears nowhere on this art.

## Which file goes where

| File | Platform, where it goes | What the platform shows | File size |
|---|---|---|---|
| `avatar-400.png` | X profile photo | 400x400, round crop | 400x400 |
| `avatar-800.png` | YouTube profile picture | 800x800, round crop | 800x800 |
| `avatar-1024.png` | TikTok profile photo; the master | round crop | 1024x1024 |
| `x-header-3840x1280.jpg` | X, Edit profile, header | a 1500x500 frame | 3840x1280, 95 KB |
| `youtube-banner-3840x2160.jpg` | YouTube Studio, Customization, Branding, banner | 16:9; only the centre band shows on every device | 3840x2160, 109 KB |

TikTok has no banner. Why every banner is 3840 wide when the frame is
smaller: a retina screen paints the frame with about twice the pixels, so a
frame-size file looks soft (`SOCIAL-ASSET-STANDARD.md` in the brock root).

## What is on it, and where each piece came from

- **The mark** is `site/favicon.svg`, geometry and gradient copied exactly:
  the crew of three above, the gate rule, the check below. On the avatar the
  favicon's rounded square becomes the full square and the viewBox is centred
  on the drawing, so it sits in the middle of a round crop.
- **Colours**, from `site/index.html` `:root` and the favicon: ground #0b0e15
  (avatar #0d1018, the favicon's own charcoal), ink #eef1fb, muted #8b93af,
  indigo #7c6cff, teal #2dd4bf. The two soft glows are `brand/og-card.html`'s
  own (indigo top left, amber bottom right).
- **Font**: Space Grotesk, the face of the ON YOUR GO wordmark, with GO in
  indigo exactly as the site header sets it (`.mark b`). `source/fonts/space-grotesk-latin.woff2`
  is `site/fonts/space-grotesk-500-latin.woff2` copied byte for byte (a
  variable file, all weights); the full OFL is `source/fonts/OFL-SpaceGrotesk.txt`.
- **Words**: the name, and "The gate is the product.", the site's own closing
  sentence and the headline of `brand/og-card.html`, in capitals per the
  2026-10-26 standing direction. The site's other lines carry the word AI, so
  they were left off.

## Rebuild

The renderer lives in the brock repo (`tools/social-kit/render.mjs`). From
the brock root:

    node tools/social-kit/render.mjs <path to this folder>/kit.json

It rewrites the five files here, the mocks in `review/`, and `REPORT.json`
(sha256 of each file plus every check below). It exits 1 on any red line.

## What the checks prove, and what they do not

**Proved on every run:** Space Grotesk loaded; the name and the line were
fitted after it loaded; the mark, the name and the line sit inside each
platform's safe box and clear of the profile photo; every shape of the avatar's
mark stays inside the round crop; each file decodes to its exact size, under
its byte limit.

**Looked at by eye:** `review/*-mock.png` shows each banner at frame size with
the real avatar placed where the platform puts it, or the YouTube phone band
marked; the avatar was looked at at 1024 and at 400.

**Not proved:** what each platform re-encodes the upload into, and how the
live profiles look. That is checked once the accounts exist.

## Where each size comes from

- X header 1500x500 and profile photo: X Help,
  https://help.x.com/en/managing-your-account/how-to-customize-your-profile
- YouTube banner (16:9, logo and text inside the centre band) and profile
  picture 800x800: YouTube Help, https://support.google.com/youtube/answer/10456525
- TikTok profile photo: TikTok Help,
  https://support.tiktok.com/en/getting-started/setting-up-your-profile/adding-a-profile-photo-or-video
