# Course study note — CTF content expansion (2026-10-04)

**FINAL STATE (09:45): course complete — 7 rooms / 7 lessons / 7 quizzes /
7 diagrams live.** Points on the table: rooms 1,300 (100+250+200+300+200+100+250)
+ checks 105 (7x15). Server :17864 on current build, pid recorded, zero 500s.
Remaining track (not started): reinitialization, pda-seed-collision,
closing-accounts programs + token-drain/admin-takeover challenges (z0neSec
has 9+3; 7 ported). No stubs left from the original order — every planned
item landed.

Verdict: STUDY COMPLETE — 4/4 target programs read vuln+fixed, both DEEP_DIVEs read
end to end, THM model mapped, quiz mechanism spec'd. Ready to build L3 first.

## 0. License re-verify log (LIVE via tor fleet, 2026-10-04, fail-closed)

Gate: `tor-pilot.sh status` alive pid=10770, `ready` → READY
label=ready-1791072563-23935-3zua6b exit_ip=45.13.225.69. All GitHub API fetches
via `--socks5-hostname 127.0.0.1:19350`. No direct fetches.

| repo | API license | raw LICENSE head | main sha | vs 2026-10-03 table |
|---|---|---|---|---|
| otter-sec/sol-ctf-framework | BSD-3-Clause | `BSD 3-Clause License / Copyright (c) 2022 OtterSec LLC` | 89c89f74edbb (2025-12-10) | MATCH |
| z0neSec/solsec-workshop | MIT | `MIT License / Copyright (c) 2024 SolSec Workshop Contributors` | 150745475814 (2026-01-25) | MATCH (prefix = yaml pin 15074547581430b866b81c56dd1fde98e9a7e13d) |
| ubadineke/solana-security-by-example | MIT | `MIT License / Copyright (c) 2026 Ubadineke` | 17c4de2c5769 (2026-01-31) | MATCH |
| francis-codex/solana-security-patterns | MIT | `MIT License / Copyright (c) 2026 Francis Ohilebo` | 9f9cc034939a (2026-09-17) | MATCH |

Result: all 4 INCLUDABLE stand. Attribution headers mandatory per file.
DO-NOT-COPY list untouched (no fetches from those repos this session).

## 1. The recurrent 5 auditor checks (distilled)

z0neSec DEEP_DIVE "Per-Instruction" list (lines 873-879) + francis "Checklist for
Auditors" agree on 5 load-bearing checks. Wording below is mine:

1. **Signer** — every authority account is `Signer<'info>`. Equality (`has_one`,
   `==`) without `is_signer` is typing, not consent. (francis: "most common
   vulnerability"; zonesec checklist §1.1)
2. **Owner** — never deserialize before verifying `owner`. `Account<'info, T>`
   checks owner + discriminator + shape; raw `AccountInfo` + manual parse is the
   Wormhole class. (zonesec §1.2, francis Pattern 2)
3. **PDA / bump** — seeds fully constrain the address; bump is stored in the
   account and reused (`bump = vault.bump`), never accepted as an instruction
   argument (grindable). (zonesec "PDA Bump Seeds", francis table row 5)
4. **CPI target** — the callee program id is verified (`Program<'info, T>` or
   whitelist) BEFORE invoke; `AccountInfo`-as-program is confused-deputy by
   construction. (zonesec §5, francis: "Are CPI target programs verified?")
5. **Type + relationship + reload** — discriminator enforced (`Account<T>`, no
   manual deserialization without `DISCRIMINATOR` check); stored references
   match (`has_one`/`constraint`); state re-read after any CPI (TOCTOU).
   (zonesec data-matching §3 + reentrancy guard, francis "Privilege escalation:
   can a user account impersonate an admin account?")

## 2. Per-program paragraphs (vuln AND fixed read, full sources in /tmp/opencode/zonesec/)

**arbitrary-cpi** (14,962 bytes, 5 ix: transfer insecure/secure-manual/
secure-anchor + invoke-arbitrary/invoke-whitelisted): the attacker deploys a
do-nothing program that returns Ok and passes it as `token_program`; the victim
program invokes it, records the transfer as done, and updates `vault.withdrawn`
while no tokens moved (the degenerate case is `invoke_arbitrary_program`, which
hands the attacker a free invoke primitive). The single check that stops it is
typing the callee as `Program<'info, Token>` (key == spl_token::ID + executable,
enforced pre-body). Cheapest test: identical CPI args with a fake program id —
secure-anchor errors ConstraintProgram, insecure returns Ok.

**type-cosplay** (15,557 bytes): attacker creates a `Metadata{account: <self>}`
whose first 32-byte field sits at the same offset as `User{authority}`, passes
it where `User` is expected; `update_user_insecure` reads bytes 8..40 and the
equality check passes against the attacker's own key. The single check is
`Account<'info, User>` (8-byte `sha256("account:User")` discriminator verified
on deserialize). Cheapest test: Metadata bytes presented as User — secure
errors AccountDiscriminatorMismatch, insecure returns Ok. Manual one-byte
discriminator variant exists in source and is documented as still-risky
(forgettable, collidable) — lesson teaches Anchor's 8-byte form only.

**account-data-matching** (12,505 bytes): Bob signs his own tx but passes
Alice's vault; `withdraw_insecure` verifies a signature exists but never checks
`vault.authority == signer`, so Alice's balance moves to Bob. The single check
is `has_one = authority` on the vault (one attribute, enforced pre-body;
manual `!=` compare is the documented fallback). Cheapest test: Bob-signed
withdraw on Alice's vault — vuln Ok, secure errors AuthorityMismatch. Token
half of the file is the same idea via `constraint = source.owner ==
authority.key()`.

**challenge-1 insecure-vault** (Easy, 100 pts, signer-authorization): capstone
composition of L1's bug inside a deposit/withdraw vault story — `Withdraw`
takes `authority: AccountInfo`, no signature, drain 100% in one tx without
being authority. The single check is `Signer<'info>`; cheapest test is L1's
(attacker-signed withdraw with victim pubkey passes vuln, fails fixed). Ports
LAST, after the three mechanism rooms, because it composes rather than
introduces.

## 3. francis-codex vs z0neSec disagreements (stricter claim picked)

D1. **Wormhole root cause.** francis: missing owner check on the SignatureSet
(deserialized without verifying owner). zonesec table row: "Signer
Verification"; zonesec case study: "missing signer verification in guardian set
update". Both agree on the shape (untrusted account substituted for a trusted
one, ~$320-326M, Feb 2022). STRICTER PICK: require `Account<'info, T>` (owner
AND discriminator AND shape), which subsumes both framings. Lessons describe
Wormhole as "program trusted account data without verifying the account was
the genuine one" — true under either framing, no incident invented.
D2. **Overflow-checks default.** francis claims modern Anchor enables
overflow checks by default; our L1/L2 Cargo.tomls set no such profile and Rust
release wraps by default. Overflow is NOT in this port order — noted, not
relied upon, no lesson claims it.
D3. **Manual vs type-level fix.** Both agree type-level (`Signer`/`Account`/
`Program`/`has_one`) beats manual checks; manual shown as fallback only.
No conflict — lessons teach the type first, manual as "raw form" where the
source has it.

Real-world one-liners (only where true): CPI lesson → Crema Finance (~$9M,
2022, spoofed account data trusted by the program — zonesec table classes it
under Arbitrary CPI; wording claims class, not mechanism). Data-matching lesson
→ Cashio (~$48M, fake collateral accounts minted against nothing — zonesec
case study). Type-cosplay lesson → NO incident claimed (no canonical single
incident verified; lesson says so explicitly — non-claim paired). Wormhole
figures: existing L1 lesson says $320M; both sources say $326M. New lessons
write "~$320M" (consistent with L1, hedged, never precise-invented).

## 4. TryHackMe model → our mapping (researched 2026-10-04)

THM structure (help.tryhackme.com "Points Explained" + "Rooms", Jun 2026):
Room = one page; Task = one section with description + deployable material;
each Task has 1+ Questions; every question awards points; difficulty scales
points; **challenge rooms pay more than walkthrough rooms**; first-blood bonus;
leaderboards aggregate points; theory questions and machine-interaction
questions coexist in one room; anti-cheat withholds machine-question points
without genuine target interaction.

Our mapping (no platform philosophy change):
- Lesson page = THM Task (theory + Q&A checks, small points).
- Room = THM machine task (hands-on exploit, big points).
- Path (learn index + prereq chain) = THM learning path (ordered, gated).
- Board = progress display only (P2: never hiring language, never rank-as-signal
  — we keep "Practice progress only", no top-hacker wording, no first-blood
  bonus, no monthly decay; those THM features are DELIBERATELY not ported).
- Points ratio walkthrough:challenge ≈ 1:10 (THM challenge >> walkthrough):
  quiz 5 pts/question × 3 = 15 pts vs rooms 100-300 pts.

## 5. Q&A mechanism spec (S5-lock amendment proposal, PROPOSED-NOT-APPLIED)

**No schema change required.** `solves(user, room, points, first_at)` PK already
accepts arbitrary room keys; board already `SUM(points)`; `INSERT OR IGNORE`
already gives idempotency. A quiz pass inserts
`solves(user, room='quiz-10N', points, first_at)` — the EXISTING board/points
path carries it with zero board changes. Shapes:

- Content: `content/quizzes/quiz-10N.yaml`
  `{id, lesson (must exist in content/lessons/), points_total,
    questions[{id, q, choices[4], answer (0-3, SERVER ONLY), severity
    (Critical|High|Medium|Low), explain (shown after pass), review (lesson
    section pointer, shown after fail)]}`.
- `GET /api/quiz/[id]` → `{id, lesson, points_total, questions[{id,q,choices,
  severity}]}` — answer/explain stripped server-side (never shipped).
- `POST /api/quiz {nickname, quiz_id, answers: number[]}` → zod-validated;
  nickname `INSERT OR IGNORE INTO users`; all-correct → solve insert →
  `{verdict:"pass", points}`; any wrong → `{verdict:"fail",
  action:"re-read <lesson> §<review>, question <n> is about <topic>"}` —
  fail-with-action, never the correct letter (anti-cheat: no target machine
  here, so theory-question grading + no-answer-leak is the whole control).
- UI: one shared `Quiz.svelte` island on each learn page
  (`<Quiz quiz="quiz-101" />`, fetch GET, radio choices, POST, pass/fail
  states). Lesson keeps "Open the room" ending.
- Loader tests (extend existing yaml-loader suite): every quiz parses; 2-4
  questions; choices length 4; answer in range; lesson file exists; points_total
  == sum(question points); severity labels valid. API tests: wrong → fail + NO
  solve row; right → pass + solve row + board SUM includes it; resubmit
  idempotent; GET never contains `answer`.
- Why not a new table: solves PK(user,room) is exactly "user completed thing
  with key K for P points"; a quiz_answers table would duplicate that shape
  for zero gain (copy-mutate-until-3 rule: earn abstraction at gen 3).

## 6. ASCII-first diagram drafts (SVG second, original hand-drawn, no emoji)

D1 account anatomy (lesson 101): `[address: 32B] [lamports: u8] [data: bytes]
[owner: pubkey] [executable] ` — caption: "everything a program sees; owner is
the only writer, nothing else is trustworthy until checked."
D2 signer-vs-pubkey (lesson 101): two arrows into `==`: `vault.authority
(stored)` vs `authority.key() (typed, not consent)` crossed out, third arrow
`is_signer (runtime signature)` circled — caption: "equality checks the name;
only is_signer proves consent."
D3 PDA seeds+bump (lesson 102): `seeds [vault, authority] + bump -> address
(no private key)` with "attacker bump" arrow bouncing off — caption: "stored
canonical bump is the only address your program can sign for."
D4 CPI confused deputy (lesson 103): `user -> [our program] -> ??? -> [real
token program | fake program returning Ok]` — caption: "without Program<T>
the callee is attacker-chosen; the deputy is confused."

## 8. L3 solve + negative-control transcripts (measured 2026-10-04 ~02:44)

.so: `content/programs/l3-cpi/l3_cpi.so`, 309,352 bytes,
sha256 `15b235f85ca63a175d3b112e88b515687d2efadd688da94851328d8ac04793e1`
(anchor build, solana 2.3.0 + anchor 0.32.2; yaml pin matches).
Exploit (same bytes both directions): vault=<victim vault>, token_program=<room
program id, ping stand-in>, instruction=release_insecure, amount=10000000.

PASS (exploit vs vuln — books move, both secure refuse inside the verdict):
`{"verdict":"pass","state_diff":"released 0 -> 10000000 (books moved, no tokens
transferred); both secure variants refused","logs":"release_insecure trusted the
stand-in callee; manual + anchor refused it","attempts_used":1,
"hints_available":3,"action":"write your finding to mint the proof"}`

FAIL (same shape, unfilled template — parser refuses before chain):
`{"verdict":"fail","state_diff":"","logs":"vault + token_program must be pasted
from the lab (no <TODO> left)","attempts_used":2,"hints_available":3,
"action":"retry, or open hint 1"}`

Negative controls run INSIDE every pass verdict (harness verifyL3): identical
shape vs `release_secure_manual` must fail (InvalidProgram) and vs
`release_secure` must fail (ConstraintProgram pre-body); either passing throws
FixedPassed → LabBroken, never a pass. Permanent coverage:
`run.test.ts` "passes a real L3 exploit" (asserts `10000000` + `both secure
variants refused` in state_diff).

## 9. Disk incident (logged per lessons.md rule)

`anchor build` died twice: first `No space left on device` (/home 100%, 1.3M
avail), then platform-tools symlink link failure. Fix: removed regenerable
stale caches `~/.cache/solana/v1.48` (1.6G) + `v1.51.1` (1.5G) — project pins
solana 2.3.0, those trees unused; /home 98% / 3.1G after. Cold BPF rebuild
exceeded the 10-min tool timeout → relaunched under nohup, polled. Lesson:
check `df` BEFORE any anchor build; never run BPF builds on a full home.

## 14. Download bundle + copy pass (2026-10-04 ~09:30-09:45)

- `GET /api/rooms/[id]/files` → fresh `.zip` (README + exploit-template.txt +
  src/lib.rs + Cargo.toml) via fflate 0.8.3 (MIT, added to package.json+lock);
  room page links it above the editor. Tested (zip magic + file list +
  TODO marker + 404 on bad id); live-verified (real 4,983-byte zip).
- Copy rewrite: all 7 lessons unified (titles `Lesson 10N`, one-line
  captions, `Your turn:` endings, no robot formulas); hero (dynamic count
  kept), rooms subtitle (7 rooms), finding page, LOCKED banner (Diff-4
  jargon out), one quiz distractor fixed. Facts/numbers untouched.
- Cross-track fix: sibling `lesson-complete/+server.ts` read content at
  module top level → broke EVERY build at analyse phase; moved into handler.
- Torn-build scare: manifest/chunk mismatch 500s traced to concurrent builds
  into shared `build/`; added a manifest↔chunks consistency check to the
  deploy ritual (client chunks live under build/client — check server refs only).

## 13. L7 integer-overflow (measured 2026-10-04 ~09:05-09:21)

- Program `392HD9NFyhZpR45PcBAJRNrQZ1EAifUSJARCDxW3oEmK`, `.so` 274,096 B,
  sha256 `c3ac4e275c9e13d0b355de6a073da446a91dd06bf270b196a5e095111a56d067`.
- Own-words port + PANEL markers; lesson 107 + quiz-107 (3x5) + SVG number-line
  + learn/107 (LessonNav 106→107) + room Hard/250/prereq l6-vault.
- Caught by the gate, honest: first harness ran the neg-control AFTER the
  attack — secure passed on wrapped books → LabBroken. Fix: control FIRST on
  the pristine vault (state-dependent room — order matters; comment in code).
- PASS: `balance 100 -> 18446744073709551615 (wrapped past u64::MAX); secure
  refused` — wrap mechanically proven on the BPF release build, unit + live.
- Live (:17864): session → target (vault + book_balance 100/ask-101) →
  run pass → quiz-107 pass → board `wrapper 15`.
- `initVictimVault` gained `initial` param (default INITIAL) for the 100-unit
  opening; L1/L3/L5/L6 call sites unchanged (36/36 → 37/37 green).
- Visual: learn-107 screenshotted (prose/code/SVG/quiz all clean); "across
  chains" phrasing removed from lesson (Solana-only surfaces).

## 12. Full-course live proof (2026-10-04 ~08:50, second instance :17865, fresh DB)

- L6 raid live: `vault 100000000 -> 0 (100% drained in one transaction);
  secure refused` → finding 201
  `proof_url: /proof/4d99d8062ef7ac1c43968aae42ba36015da9e559e4e114a84c58e09653414ba3`.
- All six quizzes live: quiz-101..106 → 201 pass, 15 pts each.
- Board: `raider 190 pts rooms=[l6-vault, quiz-101..106]` — room points (100)
  + quiz points (90) aggregate on the EXISTING path, zero board changes.
- L5 live (main instance): `vault 100000000 -> 95000000 (stranger's signature
  moved victim funds); secure refused`.
- L4 live (main instance): `claims 0 -> 1; secure refused the costume`.
- L6 lab target now shows `book_balance: 100000000 (drain it all — remainder
  fails)` (beginner-walk fix: capstone demands the exact full amount).
- jscpd gate: 21 → 18 clones after extracting `initVictimVault` (gen-6
  consolidation, 36/36 green); rest ledgered (verify-family per-room isolation
  is intentional — re-trigger: 7th room or a family bug).
- Incidents: `vite build | tail` hid a crash twice → builds now assert exit 0
  on pinned node v22.23.3; headless chrome without `timeout` left strays →
  timeout-wrap + PID check (lessons.md updated, 3 entries).

## 11. L4/L5/L6 build + solve log (measured 2026-10-04 ~02:50-02:56)

All three built with warm BPF cache (/tmp/anchor-target, ~1 min each);
anchor CLI itself exits after tests without deploying (pre-existing quirk —
.so copied from sbpf release dir, sha pinned in yaml, seed re-verifies).

- L4 `l4-cosplay` (Hard/300, type-cosplay, own-words port + PANEL markers):
  program `9QrjdkjrnFXC2kaqB7pb3zUMSDRDmQZrQysiCYRvERZA`, `.so` 318,088 B,
  sha256 `a59c491b780cdf034c074de2bc8551b82d9d9ab404665f99c9c774235578f25e`.
  Hermetic costume: harness fabricates a genuine Note (real `account:Note`
  discriminator, attacker key at 8..40) — the L2 fabrication precedent.
  PASS: `claims 0 -> 1 (ledger moved for a user that never existed); secure
  refused the costume`. Control: `claim_secure` refused (discriminator).
- L5 `l5-match` (Medium/200, account-data-matching): program
  `8BGViQLBtPwZccPwccmTG7QCEnVekmWcitnzM6hydx2J`, `.so` 281,928 B, sha256
  `ede92fbd28ce4254623b2dca3c8f254e2f0ed98233e7746313078a6a97036445`.
  PASS: stranger signature on victim vault moves balance; control `has_one`
  refuses. Reuses L1's readBalance (identical Vault layout).
- L6 `l6-vault` (Easy/100, challenge-1 capstone, sparse template on purpose —
  THM challenge-vs-walkthrough split): program
  `2UDFFUhGnvuvSmzTaUC726TmB4MEQVGEVR79v3NApXib`, `.so` 284,216 B, sha256
  `ac17e875f02c5ca00a94cba3eb1edc8bbcf9b421fef6e838f2a8d5f2b9c0a2a9`.
  PASS: `vault 100000000 -> 0 (100% drained in one transaction); secure
  refused`. Partial drain (amount 1) FAILS: `capstone demands 100% —
  remainder 99999999` (unit-tested).
- Lessons 104/105/106 + quiz-104/105/106 (3x3x5) + 3 original SVGs + learn
  pages with LessonNav chain 101-106 + learn index rebuilt as 6 cards.
- Platform deltas (content-driven, minimal): room target generalized to
  label/value `fields` at the 4th sighting (L1/L2/L3/L4 shapes); room page
  renders fields + lesson-check backlink map; Quiz.svelte progress + gated
  submit; `main img[src$=.svg]` diagram CSS + `.quiz` radio rows (fixed
  global `input{width:100%}` swallowing radios — root-caused via served CSS,
  screenshot-verified).

## 10. Live-server transcripts (2026-10-04 ~02:48, :17864, fresh seed)

- `POST /api/session {ctfturn, l3-cpi}` → 201 session_uuid (target served:
  vault `2bYx…Xi3`, authority = room program id + ping-stand-in note).
- `POST /api/run` L3 exploit → 200 pass: `released 0 -> 10000000 (books moved,
  no tokens transferred); both secure variants refused`.
- `POST /api/quiz/quiz-103` all-correct → 201 `{pass, points: 15}`.
- `GET /api/board` → `ctfturn 15 pts rooms=[quiz-103]` (existing path, zero
  board changes).
- `POST /api/quiz/quiz-101` answers [0,0,0] → 200 `{fail, action: "question 2
  missed — re-read lesson 101-accounts-signer "What a signer is" and retry"}`
  — fail-with-action, correct letter never revealed, no solve row.

## 7. Build order this turn (one room per track, small diffs) — LANDED below

Track A: L3 `l3-cpi` room (arbitrary-cpi port, own words + header, PANEL
markers, Cargo.toml, exploit template, yaml Medium/200/prereq l2-owner,
attribution repo@sha+MIT+z0neSec; VENDOR_NOTICES already covers z0neSec —
extend role line only) + build .so (anchor 0.32.2) + pin + harness wiring
(verify + target) + solve PASS + neg-control FAIL transcripts.
Track B: lesson 103 + quizzes quiz-101/102/103 + Quiz island + /api/quiz +
learn index/routing + 4 SVGs.
NOT this turn: type-cosplay, account-data-matching, insecure-vault rooms and
lessons 104-106 (stubbed with reason: one room per track; order per §2).
L1/L2 untouched (landed; no proven errors found in re-read).
