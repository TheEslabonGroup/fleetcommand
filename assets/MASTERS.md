# Media masters, not in this repo

Raw voice over takes are COLD tier under `brock/MEDIA-POLICY.md`, so they
live in the archive bucket and never in git. Archived 2026-08-31 out of
`~/Downloads`, each verified by downloading it again and comparing md5
against the local file.

| Object | Bytes |
|---|---|
| `r2://brock-masters/fleetcommand/vo/fleetcommand-vo-01.webm` | 156,406 |
| `r2://brock-masters/fleetcommand/vo/fleetcommand-vo-read.webm` | 5,132,623 |
| `r2://brock-masters/fleetcommand/vo/fleetcommand-vo-pickup.webm` | 826,035 |

Fetch one with:

    npx wrangler@4.120.1 r2 object get brock-masters/fleetcommand/vo/<name> --remote --file <name>

Local copies may still sit in `assets/vo/`, which is gitignored. That folder
is a scratch convenience, never the record. The bucket is the record.
