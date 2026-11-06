# Work order for the session on Brockchains-MBP

Written 2026-09-03 by the session on **Brockchain-Personal**, which cannot
reach your machine any other way. Sessions talk over a Unix socket on local
disk, so cross machine messaging is impossible; this repo is the only wire we
share. If you are on Brockchain-Personal, this is not for you: check with
`hostname -s` before acting.

## The one thing

You have a file this machine does not:

    submission/youtube/videos/fleetcommand-NARRATOR-music.mp4
    1920x1080, 166.3 s, 38,095,709 bytes

Upload it over the existing key, from the `fleetcommand` folder:

    npx wrangler r2 object put brock-public/fleetcommand/fleet-command-demo.mp4 \
      --file submission/youtube/videos/fleetcommand-NARRATOR-music.mp4 \
      --content-type video/mp4 --remote

**`--remote` is mandatory.** Without it wrangler writes to a LOCAL simulated
bucket, prints "Upload complete", and a later `get` even returns the right
bytes, while the real bucket stays empty and every public URL 404s. Memory:
`wrangler-r2-writes-local-by-default`.

It overwrites that key deliberately. The URL is unchanged, so nothing on
Devpost needs editing. Do not rename it.

## Prove it, and do not trust the success line

    node tools/check-entry.mjs

It currently reads FAIL on that asset and names why:

    FAIL asset fleet-command-demo.mp4  (4257671 bytes, silent screen capture,
         0:44 1080p, NOT the narrated master a backup field asks for)

After a real upload it flips to `38095709 bytes, narrated master, 2:46 1080p`
and the run is 13 of 13. That assertion was added because the old check only
asked whether a file existed, so it stayed green on the wrong film.

## Priority, stated honestly

**This blocks nothing.** The entry is submitted, the public page embeds the
narrated YouTube film, and judging is unaffected. This improves the
downloadable asset in the press kit and the organiser backup field. Do it if
you are idle before the Sep 3 1:00pm EDT deadline; do not interrupt real work
for it.

## When it is done

Delete this file and say so in the commit. Brock has been up all night on it
and should not find a stale order sitting in the tree.
