# The Fleet Command premise

> **Two key ignition: the human gate as hardware.**

Copied from `BROCK/PRODUCTION-PROGRAM.md` (build #12) into this repo on
2026-08-22, per the program's session protocol.

## What the sentence means, and what it rules out

The gate is the product, and until now the gate was a button. A button is
software; anyone can click one by accident. The two man rule is hardware:
two keys, turned deliberately, and the machine will not fire on one. So the
approval gate becomes an ignition console: KEY 1 arms, and only then does
KEY 2 go live; turning KEY 2 releases the staged deploy. Send back stays an
ordinary button, because returning work is safe and only release is
consequential. The friction is the feature: a judge watching the demo sees
a person perform two deliberate motions before anything ships, which is the
whole pitch of the product made physical.

It rules out weakening the amber reservation. Amber appears at exactly one
moment on this screen, the hold, and it stays that way: the amber now lands
on KEY 1's ring at the hold instead of a button fill. It also rules out
sound, springs, or anything that makes the console a toy.

## The three rules this sets

1. **One key never fires.** KEY 2 is disabled until KEY 1 is turned, in the
   DOM and not just visually, and Send back stands both keys down. There is
   no code path from a single interaction to a release.
2. **The keys are honest controls.** Real buttons, keyboard operable, with
   aria-pressed carrying the turned state, and reduced motion turns them
   instantly instead of animating the rotation.
3. **The gate's meaning does not move.** Approve and Send back keep their
   exact prior semantics and console log lines; the hardware changes how
   the decision feels, never what it does.
