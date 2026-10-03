# CURRENT — Spacestation Loop (mvp/loops/research)

**Status 2026-10-03: H02 CHALLENGE BRIEF FILED — on-paper reveal prepisan u `mvp/loops/research/notes/h02-challenge-brief-2026-10-03.md` (P1/P2/P3, rubrika 100, freeze pravila). Sudije odobrile Solana arenu pod P2. Stara book-code ideja ostaje arhivirana; operator zadaje sledeći S-goal.**

## Iteration instructions (važi kad stigne novi MVP spec)
1. Read `GOALS.md` → first `pending` S-goal is the work (S1 → S2 → S3 chronological).
2. Land artifacts + dated gate note → flip Status same turn → append LOOP_LOG → repeat.
3. Caps: 2GB RAM, `nice -n 19`, `timeout 60` heavy ops, jobs ≤2. `/tmp` disposable — persist immediately.
4. Old domain law RETIRED 2026-10-03 (bivši `docs/CATCHUP_NEXT_SESSION.md`, sada `archive/book-code/docs/` — samo čitanje istorije, nikakav novi rad po njemu).

## Fleet wiring (live 2026-10-02, preseljeno 2026-10-03)
- Seeded by `fleet init --preset default --hooks none`; run via `fleet run /home/aleksic/spacestation/mvp/loops/research` or contained via `mvp/loops/research/run-loop.sh` (copy of fleet-ops launcher + `sandbox.sh`, provenance: `/home/aleksic/fleet-ops/loops/research/`).
- In the fleet census since 2026-10-02 (`fleet sweep` → `spacestation/loops/research | evidence:clear`; `fleet status spacestation` resolves). Mechanism fixed upstream same day: roster is data (`~/.config/fleet/loops.conf`, unioned over the embedded fallback) and `fleet init` self-registers — no rebuild per loop.
- `run-loop.sh` needs the loop dir only; project = two levels above it. Worker NOT started — operator's call (long-lived process + quota).

## Tor-egress wiring (module: `/home/aleksic/ideas/tor-egress/egress/`)
- Quota hook `hooks/quota-rotate.sh` is a THIN WRAPPER — `exec`s the module's `egress-rotate.sh`, zero logic fork (DRY). Pinned in `hooks-registry.json` with sha256 + `TOR_*` env (contract-visible).
- Env contract: `TOR_SOCKS=127.0.0.1:19350` (scratch tor `fleet`, NOT system :9050) + `EGRESS_ORDER=tor` (c90 fallback unwired here — empty `C90_CMD` = tor-only, logged never faked) + `NO_PROXY=127.0.0.1,localhost` (loopback serve/Gitea stay direct).
- Revive after reboot: `bash /home/aleksic/ideas/tor-egress/egress/tor-pilot.sh start --pilot fleet` then `... ready` to gate. Fail-closed: Tor down ⇒ traffic stops, never direct.
- Canonical copies under `~/.config/fleet/hooks/` are byte-identical to the module (verified 2026-10-02) — either path is the same code; the wrapper points at the module source.

## Standing state (2026-10-03)
- Stara ideja arhivirana: `archive/book-code/` (poslednje zeleno 2026-09-30: 9/9 pytest, 16/16 gcc-clean, bundle 384K <5MB).
- H02 istorijat ostaje u arhivi (`archive/book-code/docs/H02_BRIEF.txt`) — za challenge sadržaj ga supersede-a on-paper reveal (`mvp/loops/research/notes/h02-challenge-brief-2026-10-03.md`); mail deo (kontakti/hrana/oprema) i dalje važi.
- H02 venue-brief (11 strana papira, 9 unikatnih): centralno pitanje = 1 osoba pretvara znanje/veštine/kontakte u sledeći ostvariv korak ka iskustvu/radu; pravci P1 (ekspertiza) / P2 (vidljiva veština: tvrdnja→proverljiv rad→feedback→sledeći korak; NE auto-ranking/sertifikacija) / P3 (prva prilika: uslovi→obaveze→nepoznanice→potez; NE više oglasa); disciplina: 1 korisnik → 1 problem → ≤3 funkcije → 1 hipoteza → 1 test → 1 sledeći korak; rubrika H02-RUB-H01-100 (25+25+20+15+15); EVIDENCE > CLAIMS; build 3.10 11:00 → 4.10 11:00; scope freeze 19:00; code&evidence freeze 11:00; pitch 4+3+1.
- Sudije odobrile Solana starter arenu pod P2 (tvrdi korisnik + P2 lanac pokriveni validatorom i dokaz-URL-om).
