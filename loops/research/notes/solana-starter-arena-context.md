# Solana Starter Arena — Consolidated Context

Date: 2026-10-03
Status: validated idea, narrow scope only
Location: `mvp/loops/research/notes/solana-starter-arena-context.md` (spacestation FHS; candidate incoming MVP spec material — loop PARKED until operator confirms)

## 1. What we build (2 sentences)

Build a TryHackMe style browser academy for Solana with guided courses plus simulated validator labs plus progressive CTFs that start with missing signer and owner plus PDA checks and end with arbitrary CPI with no local setup for level one. Make every level end in a re-runnable on-chain state proof plus a short severity proof and fix writeup that becomes a public hiring profile instead of a certificate.

## 2. Market — funnel-rich, job-poor at entry

### Developers / chains

| Chain | Developers | Hiring signal |
|---|---|---|
| Ethereum | 6,244 monthly active Nov 2024; 31,869 period active Jan-Sep 2025 | 10,038 VM stack total Sep 2026; still 31% dev share, rank 1 total |
| Solana | 2,408 total Sep 2026, 662 full-time; 17,708 period active Jan-Sep 2025; 7,625 new 2024, up 83% | 60% of non-EVM weekly devs; TVL ~$5.7B (snapshot, now ~$6.6B native); top newcomer chain |
| Sui | 1,000+ new 2024, 954 monthly actives May 2026; TVL $0.58-2.6B (wide = peak+bridged, native now ~$543M) | ~2.1x Aptos TVL; fastest Move growth at 16% YoY |
| Aptos | 1,000+ new 2024, 465 monthly actives; TVL ~$273M (date-dependent, now lower native) | Half of Sui; same Move name, different dialect |
| Starknet | 2,548 annual devs 2024; TVL ~$237M (now ~$163M) | Niche, Cairo only |

Notes / caveats:
- Monthly-active vs period-active (9-mo) vs stack-total are different methods — do not compare directly. Period-active is ~4-5x monthly by construction.
- TVL must be pinned: native vs bridged + date. Solana >> Sui > Aptos ~ Starknet holds in all snapshots.
- Base: 23,613 monthly active crypto devs Nov 2024, 39,148 newcomers in 2024.

### Demand

| Demand | Number |
|---|---|
| 2025 new roles flow | 66,494, up 47% (Coincub; still below 2022 peak, mostly non-tech) |
| Active curated stock | 2,932; engineering 999 at 34% (stock vs flow — different sources) |
| Seniority wanted | Senior 44.9%, expert 30%, mid 20%, entry 5.2% (harsh end; other cuts 5-12% entry, ~70-75% senior+expert) |
| Hard to fill | Tech 48 days (sourced); senior auditor 127 days unverified — use 90-180d modal bucket |
| Junior bottleneck | 355 apps per junior job; 10k resumes to 28 hires (Bitget campus 2025, generalist not dev-only); 450 apps per contract post (dev peak late 2024) |
| Pay US base | Junior dev $110k mode ($95-130k), senior $210k ($180-250k), auditor median $195k base, top $300k+ ($600k-1M total with bounties). Auditor junior is lower: $50-80k global, $100-125k US. |

Top-down pull (verified Apr-Jul 2026):
- Drift $270-285M Apr 1 2026: durable-nonce pre-signed multisig takeover + fake CVT collateral, not a code bug. Weeks setup, minutes drain.
- STRIDE (Asymmetric + Solana Foundation, launched Apr 6 2026): 8 pillars / 40 controls, first wave 40 protocols, $10M+ TVL funded monitoring, $100M+ formal verification. First findings: 17% logging, 13% key mgmt, 9% program defenses.

Verdict: oversupply of junior generalists, shortage of proven seniors/auditors. Pay gap ($110k -> $195-210k) explains queue.

## 3. Competition — exactly one opening

Ethereum starter is full: Ethernaut, BuidlGuidl 24 flags, SCH Arena, DVD, Quill 30+, Paradigm yearly, Updraft, Secureum. Bounties solved as marketplaces: Immunefi $140M+ / 650+ protocols, Cantina mega-pools.

Solana learning is empty for always-on+browser+progress+state-verifier:
- Neodyme collection 203 stars / workshop ~110 stars, OtterSec framework 79 stars: repos needing local `anchor build`.
- Solana Playground (~940 stars, Jun 2026 push): browser IDE + devnet, ephemeral wallet, crate allowlist, faucet caps, no flag/verifier loop.
- Superteam Academy: hosted LMS with XP Token-2022 + NFT + leaderboard, but verifier = lesson completion, not exploit state.
- Updraft Solana: hosted course (Native+Anchor, LiteSVM exercises), verification local + quizzes, no browser verifier.
- ubadineke playground (4 stars) / solana-security-secrets (0 stars): live demo or static explainer, no accounts/progress/grading.
- Ackee School (408 stars): cohort-gated, local Docker, human review.
- Only partial counter: Web3PWN `app.web3pwn.com` — live browser labs + ranks, sandboxed checks, not per-user devnet state progression.

Sui/Aptos same shape but smaller + dialect split (object vs account). Starknet Cairo-only niche. TON FunC legacy for Tolk, ink! unmaintained Jan 2026.

## 4. Tech — one architecture only

- Foundry ~30-400MB, seconds, instant Anvil vs Anchor 2.21GB compressed / 6-10GB unpacked, 5-15min cold (20-30min on small VM), 30-90s warm, validator 10-30s boot, 0.5-2GB RAM each.
- Therefore: never validator-per-user. Cost $20-40/mo shared vs $200+/mo per-user validators.
- Architecture: Monaco frontend -> queued Express builder (1 warm image, cargo-chef + sccache, 180s kill) -> LiteSVM in-process ms exec (+ Surfpool daemon only if RPC needed) -> state-assertion verifier.
- L1 ships prebuilt `.so` (solana-verify build in CI), Run <1s, no toolchain. L2-L3 warm build.
- Use LiteSVM for all 3 in hackathon (Mollusk is single-ix harness, awkward for multi-tx; defer split).
- Anti-cheat minimum: server-side verify only, fresh program IDs/keypairs per session (uuid), strip solver/flag from player image, faucet localhost-bound, 900s TTL + reaper, PoW + per-IP caps, flag never on-chain (Solana state is RPC-readable). Verifier checks `get_account` state + negative control (fixed code must fail exploit). Do not gate on exact CU.

## 5. Product — school that ends at bounties

Do not host money, triage, KYC, payouts. Feeder, not host.

Levels (one harness, program + seed + predicate differ):
- L1: missing signer check
- L2: owner + PDA binding (seeds + canonical bump + programId)
- L3: arbitrary CPI / program impersonation
- Bonus: CPI return-data spoofing (sub-variant of L3, Anchor #4232)
- L4: type cosplay / data-matching anchored to canonical root

Each level: vuln vs fixed side-by-side, one-click Run, hints/logs, final written finding (severity + proof + fix). Judge blind, disclose hints/attempts/time/AI-use, re-runnable repo hash, 12-18mo expiry. Public proof URL, not PDF cert.

Link out (verified live): Raydium $505k max, Orca $500k, Pyth $250k, Marinade $250k, Firedancer $1M pool, Superteam Earn bounties. Position: we do not pay for bugs, we make you dangerous enough for people who do.

Monetization (post-hackathon): prep subscription + team seats + verified shortlist fee + sponsored feeder weeks. Free to learner.

## 6. Go-to-market — narrow

Solana-only LiteSVM verifier with public proof URLs. No validator-per-user, no certificate business, no day-1 Sui track (stub selector only).

Validate with: builders (onboarding pain), judges (fundability), leads (grants + STRIDE intros).

Measure one thing: 3 of 5 beginners point to the bug in 10 minutes. Hackathon win: 20 strangers finish L1 in browser, 5 produce L3 state-checked exploit + finding re-verifiable from URL.

## 7. Validation log

- Subagent track 1 (competition): gap real under narrow definition.
- Subagent track 2 (tech): feasible on LiteSVM, not validator-per-user.
- Subagent track 3 (hiring): PoC + judged finding beats cert; 2/30 roles mention cert; portfolio 95% / contests 65% / certs 12%.
- Subagent track 4 (curriculum): L1-L3 order correct, return-data as bonus.
- Second agent (Kiinzu pattern, Drift/STRIDE, bounty inventory, 3/5-in-10min): verified — Drift $270-285M + STRIDE 40 protocols + Raydium/Orca/Pyth/Marinade maxes all match live sources.

## 8. Biggest risk

Economics, not code: free learners + toolchain churn + judging cost vs tiny junior stock (~8 junior dev openings/mo, 355 applicants each). Stay narrow, link out, sponsor-funded.

## 9. Open questions

- Firedancer $1M + pump.fun $500k maxima: re-verify before deck.
- Auditor 127d: replace with 90-180d bucket unless sourced.
- Sui track spec: object-model lessons deferred to post-hackathon.

## 10. Superteam Balkan — who to ask (excluding Matija Luketin)

Roster verified Oct 2026 (8 employed, 11-50 size): Matija Luketin (Co-Lead, ex-CTO Longwood, CEO solbound.dev), Josip Volarevic (Consultant / Member Success global, Alliance alumni, 2x Colosseum winner, dReader founder), Marko Djurdjevic (CEO, Solana lead Balkans), Zeljko Kovacevic (COO, ops), Aleksandar Kolov (Macedonia rep, senior full-stack Next.js / LLM / IoT, Tally Vault NFC wallet), Marko Ozegovic (Marketing Lead), Kresimir Dadic (outreach), Marko Stepic (video).

Top 3 excluding Matija:
1. Josip Volarevic — technical founder + Colosseum judge. Ask: does this win Colosseum, how to position vs Ethernaut clones, intros to security reviewers.
2. Aleksandar Kolov — senior builder (Angor AG, Solana + AI workshop Base42, Tally NFC keys). Ask: would browser levels onboard a React dev in one evening, what blocked your last hire over 1 hour.
3. Marko Djurdjevic — ecosystem CEO (Summit Sava Centar, 2000+ members, $500k+ grants, Helius / Solflare / Ministry links). Ask: grant fit, STRIDE intro, demand from founders for security-educated juniors.

No Balkan core member is a Solana auditor. For challenge review use RECTOR-LABS (1st of 116, Mar 2026 Earn security bounty, 14 repos / 13 vulns, Anchor CPI return-data spoofing CVSS 7.5, npm skill live) via Earn, not as Balkan member.

## 11. Supply vs demand — exact cuts

- Entry share: senior 44.9% + expert 29.7% = 74.6%, mid 20.1%, entry 5.2% (Web3.Career/Bondex 80k postings). Use 5-12% range across taxonomies.
- Junior funnel: ~1,560 entry total live, 238 dev entry, 81 remote dev entry, ~8 new junior dev jobs / month, ~355 applicants per junior job. Bitget campus: 10k resumes -> 28 hires (0.28%).
- Saturation: ~450 applicants per smart-contract post, 300-400 frontend, 80-120 auditor. LinkedIn 11k-14.2k apps/min. Gartner: 1 in 4 profiles fake by 2028, 6% admit interview fraud.
- Speed: 38d global median, 48d tech (110 apps/hire, 3.4% interviewed), 127d senior auditor single-sample — quote 90-180d bucket.
- Churn: newcomer half-life 3-4 months (2023 cohort), under-12mo <20% of commits.

## 12. Bounty sites for Solana — filter is enough

Yes, all majors carry a Solana filter; no Solana-only marketplace needed:
- Immunefi: 170 programs, $140M+ paid / 650+ protocols / 85k researchers. Example GMTrade Solana perps $100k max, live Jul 2026.
- Cantina: multi-chain (Ethereum / Solana / Aptos / Sui). Examples pump.fun $500k Solana, Midas $500k ETH+SOL, Coinbase $1M ETH+SOL+APT+SUI.
- Hats Finance: vault-based, chain-agnostic.
- Superteam Earn: episodic bounties (VeiloLayer $2k, Mar 2026 audit $1.5k won by RECTOR).
- STRIDE (Foundation + Asymmetric, Apr 2026 post-Drift $270-285M): 40 protocols, 8 pillars, partner net includes Trail of Bits / Certora / Immunefi / Sherlock.

Verdict: bounty = marketplace where liquidity wins, filter suffices. Arena = pedagogy + execution where chain is the product, filter fails. Build feeder that routes to bounties, never host pots / triage / payouts.

## 13. Six-sentence verdict (locked)

Yes, the idea is good if scoped to Solana-only starter labs with server-side state verification. Demand exists because Solana leads newcomer intake while entry jobs are only 5-12% with hundreds of applicants each. Competition leaves a real gap since nothing offers always-on browser accounts plus progress plus automatic on-chain-state checks for Solana. Technology is feasible with prebuilt programs and LiteSVM sessions, but infeasible with validator-per-user on any normal budget. Hiring works only as a feeder linking to Immunefi and Cantina, never as a bounty host or certificate seller. It dies if you add day-one multi-chain, paid learner access, or unverified trust claims.

## 14. Full session history (2026-10-03)

### 14a. Original brief
Permanent, browser-based starter arena for Solana smart-contract security. Three guided levels (missing signer check, PDA + account validation, CPI return-data spoofing). Each level: vuln vs fixed side by side, one-click Run on prebuilt validator with cached deps, verifier on on-chain state not text, hints/logs, final written finding (severity/proof/fix). No local toolchain for L1. Later Sui Move as separate dialect track. Explicitly not Ethereum Solidity.

### 14b. Five evaluation questions + answers (locked)
1. Gap real? Mostly real under narrow definition (always-on + browser + accounts/progress + state verifier). Partial counter only: Web3PWN sandboxed labs.
2. 3 levels in one evening onboard a React junior? Complete 3 guided exploits yes; job-ready no. Honest claim: finish guided path evening 1, local toolchain day 2.
3. Which 3 bug classes first? Missing signer -> owner+PDA binding -> arbitrary CPI. Return-data spoofing is L3 sub-variant, defer to bonus. L4 = type cosplay.
4. What makes a certificate distrusted? Text/log verifier, no negative control, farmable (no identity/rate-limit), completion==competence, undisclosed hints/retries, ungraded prose, unpinned toolchain, no expiry, no re-run.
5. Single biggest failure reason in 12mo? Unit economics vs buyer mismatch (many learners, ~8 junior dev jobs/mo, sponsors pay once). Tech solvable, payer unclear.

### 14c. Recommendations given
- Build Solana-only LiteSVM verifier with public proof URLs (not certs).
- L3 = broad arbitrary CPI, not narrow return-data spoofing.
- Sui = stub selector only for hackathon.
- Free to learner; sponsor + employer-access funded (shortlist/seats/feeder weeks).
- Success: 20 strangers finish L1, 5 produce re-verifiable L3 proof; 3/5 point to bug in 10 min.

## 15. Ethereum inventory (why we do NOT build there)

Interactive/labs: Ethernaut (30+ levels, free, live Sepolia), SpeedRunEthereum + BuidlGuidl CTF (9 builds + 12-CTF + 24-flag Invaders, active Sep 2026), Updraft (150h+ video/labs, free, very active), EVM Codes + Playground (opcode ref + trace), EVM Puzzles + Gas Puzzles, Blockbash (attack/defend theory + labs), Curta (on-chain puzzle protocol, 22+ puzzles, slow cadence).
Replay: DeFiHackLabs (real incidents in Foundry, 6.7k stars, active Sep 2026), DeFiVulnLabs.
Courses: SCH Full EUR399 / Lite EUR99 (319 vids, 50+ labs, SSCH cert, 2000+ Discord), RareSkills (Solidity/DeFi/ZK/Invariant bootcamps $k + free exercises), Secureum Epoch+RACE monthly (#42 Jul 2025)+CARE, Zealynx Academy (build UniswapV2/CompoundV2 + scored Shadow/AI arenas, free).
Comps/bounties: CodeHawks First Flights + comps, Sherlock contests/bounties, Cantina (Spearbit merged May 2025) + Fellowship, Immunefi (650+ protocols, $140M+ paid, up to $15M/critical), Hats vaults, HackenProof. Aggregator: SCH contest board (422 live Sep 2026).
Archives/avoid: Capture the Ether (archived ~2022), Paradigm CTF (no edition since 2023, use archive + blocksec-ctfs), Node Guardians (CLOSED Jul 31 2026), Code4rena (winding down 2026).
Meta: blockthreat/blocksec-ctfs (50+ CTFs/writeups), minaminao/ctf-blockchain, gmh5225/awesome-web3-security, sdxdhruva/Hack_web3 (17-module guide).

## 16. Solana inventory (evidence for gap)

Learning/labs: Solana Foundation program-security course (canonical, sealevel-attacks based), Superteam Academy (XP/streaks/soulbound creds, 7 security lessons, lesson-completion mint only), Updraft Solana (Native+Anchor dual, LiteSVM tests, local verify), Solana Playground beta.solpg.io (~940 stars, Jun 2026 push, no game loop), Helius Hitchhiker guide, ubadineke solana-security-by-example + Vercel playground (9 vulns, browser wallet demo, 4 stars, no accounts), Xzavior34 secrets site (5 vulns terminal narrative, 0 stars), francis-codex / Zolldyk (Anchor 0.32.1 toolchain 2026) / Prince-Chinedu123 pattern repos.
CTFs: Neodyme workshop L0-4 (canonical, maintenance mode) + neodyme-labs/solana-ctf backup (12 challenges), Ackee Auditors Bootcamp CTF 5 levels, coral-xyz/sealevel-attacks demos, z0neSec solsec-workshop (9 modules + 5 CTFs 100-500pts, Jan 2026, most complete current), OtterSec sol-ctf-framework + poc-framework (host-your-own), event CTFs via backups (Halborn, Paradigm Solhana 1-3/Pool, picoCTF Solfire, N1/Dice/Blaz Solalloc), BlockChomper solana-ctf, sannykim/solsec index, useSolana code-challenges.
Courses: Ackee School S7 Jul 2025 / S8 Oct 2025 (9wk, security wk + Trident, NFT cert), Ackee Auditors Bootcamp (7wk Anchor prereq, last cohort Aug-Sep 2024), RareSkills Rust + 60 Days Solana, Rektoff Rust Security (6wk, scholarship), Metana 16wk paid, SlowMist best-practices 2025.
Scanners/fuzzers: Trident + TridentSVM + Arena (Ackee, MGF 0.11 Aug 2025, Arena Feb 2026), Sec3 X-Ray Pro + open CLI (50+ SVEs) + pro-action.
Bounty/comp with Solana: Immunefi (Firedancer $50k->$1M), Cantina (Tensor $150k, Inclusive vaults), CodeHawks (2025-03-rustfund + First Flights), Superteam Earn (bounties/grants, Helius Redacted $150k), Hats thin. Code4rena: do not target (winding down).

## 17. Multi-chain / general (both + more)

WEB3PWN (ResearchZero, web3pwn.com, app.web3pwn.com): 5 tracks EVM/Bitcoin/Solana-Anchor/Canton-DAML/Starknet-Cairo, browser editor + sandboxed validation, ranks/leaderboard/seasons, free. Closest to TryHackMe-for-Web3 in browser. HackTheBox blockchain tracks + scheduled CTFs. Vulnmachines / Cipher Shastra / Security Innovation Blockchain CTF / GOATCasino (via awesome-web3-security). Internacia guardians NFT CTF. useSolana challenges hub. Dreamhack Web3, Oak CosmWasm CTF, ONLYPWNER. Indexes: awesome-web3-security, minaminao/ctf-blockchain, blocksec-ctfs, Hack_web3 guide.

## 18. Tech validation detail

LiteSVM vs Mollusk vs test-validator vs Surfpool/TridentSVM: LiteSVM = in-process bank, ms boot, CPI arbitrary depth, `add_program_from_file`, `sendTransaction`, `getAccount`, `warp_to_slot`, `with_sigverify(false)` for negative controls. Mollusk = single-ix minified harness, explicit accounts, `inner-instructions` checks, no bank — good for CU bench, bad for multi-tx arena. test-validator = full node, 5-30s + 0.5-2GB/instance + ledger — never per-user. Surfpool = LiteSVM + RPC compat + mainnet fork, use only if RPC/fork needed. TridentSVM = fuzz exec, irrelevant for Run button.
Image: Anchor 2.19-2.21GB compressed (v1.0.x), 2.03GB (0.32.x), 1.3GB verifiable-build alt. Cold 5-15min small VM, warm 30-90s with cargo-chef + sccache + warm target/registry. Cap 2 concurrent builds (429), 300s build / 30-60s exec timeouts.
Prior art: solana-playground (client/server/DB/wasm, supported-crates.json allowlist, backend Docker, devnet), Solphg clone (Monaco->Express /api/build|deploy|simulate, UUID tmp, 40 files/200KB caps), Anchor 1.0 template (Surfpool default, `skip_local_validator`, LiteSVM via anchor-litesvm).
Churn risks: Anchor 0.29->1.0 (coral->lang, IDL->PMP), solana-program 1.x->2.x/Agave 4.x, Rust 1.75->1.92, platform-tools, LiteSVM 0.5->0.15 API drift. Pin everything + Cargo.lock + Anchor.toml + solana-verify digest gate.

## 19. Hiring validation detail + other-agent cross-check

Firms hire from public proof, not certs: Trail of Bits (Ethernaut/DVD/Paradigm + 2hr take-home), OpenZeppelin (reports/CTF/disclosures), OtterSec (no YOE req, ships anchor/ctf-framework), Ackee (School/Bootcamp/Trident funnel), Sherlock/Cantina (leaderboard + judged severity -> Senior Watson ~$10k/audit-week), Hacken/Hashlock ads (portfolio/bounty/CTF nice-to-have), Asymmetric (leaderboard rank). web3.career 30 roles: 2 mention cert, 28 ask portfolio/deploys/findings. Manager survey: 73% certs no impact, portfolio 10x.
Funnels: First Flights (weekly small scope, PoC + judged severity + XP) and Earn -> Talent Portal (150k freelancers, $500-3k bounties, zero commission, Jupiter/Squads/Orca/Backpack hire there).
Other agent (Kiinzu per-uuid :8080/<uuid> + PoW + flag-never-on-chain, Drift/STRIDE, bounty link-out list, 3/5-in-10min): Drift $270-285M + STRIDE 40/8 + Raydium $505k/Orca $500k/Pyth $250k/Marinade $250k all re-verified live. Adopt: per-uuid sessions, server-side flag, feeder-not-host, blind L3. Reconcile: LiteSVM-for-all-3 for hackathon (skip Mollusk split), stars cited with repo URLs, 127d -> 90-180d bucket.

## 20. Session artifacts

- 2-sentence build spec (§1), 6-sentence verdict (§13).
- Operator tables (chains + demand) with caveats (§2).
- Operator world-view v1 (5 points: funnel-rich/job-poor; one opening; one architecture; school-ends-at-bounties; narrow GTM) — accepted with 4 fixes (§6 in chat 2026-10-03).
- Prior file location (web3kamp/hackathon/) retired 2026-10-03; canonical now spacestation FHS here.

## 21. Ruled-out alternative: open resume database with automatic ranking

Full name: Decentralized hiring platform with open resume database and automatic candidate tracking. Verdict: do not build.
- Crowded: Greenhouse (~$12k/yr mid), Lever (~$12k), Workable (from $299/mo), Ashby (~$23k), Workday HR suite ($150-500k/yr) centrally; Braintrust (2M+ vetted, live), LaborX (niche live), TalentLayer (micro team, token planned not launched), Bondex (5M downloads but token -99.4% in a year), DecentHire (vision-only site).
- Blockers: two-sided cold start (candidates need jobs, employers need candidates; liquidity not registrations), resume on-chain is technically undeletable per French authority guidance (store off-chain, only hash on-chain), auto-ranking is biased and sued (Workday collective action, baseball vs softball example, New York bias-audit law), Gartner projects 1 in 4 profiles fake by 2028 with one-third of hunters spending half week filtering spam.
- Narrow test that would pass rules, if ever revisited: one trade, one city, one real employer with a shift this week, 5 hand-checked resumes off-chain with written consent and delete button, success = 1 interview in 24h. No chain, no token, no scoring.

## 22. Five backup ideas scored (full names, no codes)

1. Micro task with verifiable proof of skill for a small employer — 5 small jobs, Run button, public confirmation page without login. Highest code reuse (server + base + sandbox + diacritic-insensitive search). ~10h. Test: 5 students finish, 2 employers say it helps hiring.
2. Practice-ad interpreter with fit estimate — paste ad, get requirements plus duties plus unknown terms in plain language plus 3 things to learn. Gap proven: HelloWorld practice section 0 active ads, Nis IT practice 0. ~10h, no sandbox. Test: same ad to 5 users, all name 3 conditions after use.
3. Clear request composer for a person without a network — 3 sentences in, polite 80-120 word message out, self-sent. Fast, medium privacy risk (over-sharing).
4. First-contact map with 3 named locals — needs 20 volunteers with consent entered by hand. Highest novelty, highest privacy risk, slowest.
5. Beginner contribution journal with mentor comment and 7-day plan — needs live mentor. Medium speed and value.
Ranking: fastest = 2 and 3; easiest test = 1 and 2; most reuse = 1; riskiest privacy = 4.

## 23. Entry requirements and saturation — full cuts (see §2 / §11 for tables)

- Entry share 5.2% point (80k postings) — quote 5-12% range across taxonomies. Junior dev flow ~8/month.
- Junior ask: 0-2 years (CryptoRecruit), in practice 1-3 years demanded even for junior-labeled roles + shipped mainnet contract or audit or open-source plus hackathon + Solidity or Rust + Foundry or Anchor + TypeScript + testing. Live example: 6-18 months incl. internships + STEM degree.
- Stacks United Kingdom n=74: Go 17.6%, Rust 13.5%, Solidity 9.5%, Ethereum 13.5%, web3.js 23%, smart contracts 18.9%, AWS 17.6%, DevOps 35%.
- Saturation: contract dev ~450/post, frontend 300-400, auditor 80-120, compliance 60-80. LinkedIn noise 11k-14.2k apps/min. Interview fraud 6% admit. Senior auditor fill 90-180d bucket.
- Geography: United States 19% dev share (down from 38% in 2015), India 11.7% and #1 source of newcomers at 17%. Asia 32% now #1 continent.

## 25. H02 fit (2026-10-03, venue brief + judges approval — supersedes §13 for H02)

- Brief: `mvp/loops/research/notes/h02-challenge-brief-2026-10-03.md`. Centralno pitanje = 1 osoba → znanje/veštine/kontakti → sledeći ostvariv korak ka iskustvu/radu.
- Primarni pravac = P2 VEŠTINA KOJA SE VIDI (sudije odobrile): tvrdnja o veštini → proverljiv rad → feedback → sledeći korak. Arena to već jeste: L1 exploit kao proverljiv rad, state-verifier kao dokaz, written finding (severity/proof/fix) + blind ocena kao feedback, proof URL kao sledeći korak ka First Flights / Earn mikro-bountyju.
- Tvrdi korisnik za H02: React junior u Nišu bez mreže i bez lokalnog toolchain-a; barijera = nema šta da pokaže (CV tvrdnja bez dokaza); sledeći korak = re-verifikovan L1 proof URL + finding.
- Kill-lines iz briefa (obavezujuće za H02 slice): NE automatsko rangiranje/sertifikacija (ranke samo kao progres, dokaz = judged finding + disclosed hints/attempts); NE bounty-board agregacija (P3 zabranjuje više oglasa — samo link-out na postojeće); NE mentor-matching (P1 zabranjuje garantovano mentorstvo — feedback na finding je dozvoljen, mentorstvo nije feature); ≤3 funkcije (L1 vuln-vs-fixed + Run + verifier + finding forma = 4. stubovati ili spojiti: Run+verifier jedna funkcija).
- Rubrika H02-RUB-H01-100: 25 Impact/Innovation + 25 Tech/UX + 20 Feasibility/Scalability + 15 Pitch + 15 Teamwork. EVIDENCE > CLAIMS; AI/data nisu bonus. Najjači dokaz za žiri: 3/5 početnika ukaže na bug u 10 min + N stranaca završi L1 u browseru + re-verifikovan proof sa URL-a pred žirijem.
- 24h slice: L1 missing-signer only (prebuilt .so, LiteSVM, state-assertion + negativna kontrola); evidence README od 11:00 sub (hipoteza→test→rezultat); offline fallback obavezan; 19:00 scope freeze; 11:00 ned code&evidence freeze; pitch 4+3+1 po H01 spine-u (Problem+rezultat / Demo/tok / Impact-sledeći test).
- Prethodni "BAD FIT" verdict iz chat-a 2026-10-03 povučen — važio je na stale pre-reveal kontekstu. §13 ostaje validan kao startup/Colosseum verdict; za H02 važi ovaj §25.

## 24. Evaluator prompt (copy-paste, neutral)

Evaluate this startup idea neutrally on technical feasibility, market demand, and differentiation. Do not encourage or discourage by default. Score risks honestly. Idea: A permanent, browser-based starter arena for Solana smart-contract security. Three guided levels covering missing signer check, PDA and account validation, and cross-program invocation return-data spoofing. Each level provides vulnerable versus fixed code side by side, one-click Run against a prebuilt validator with cached dependencies, automatic verifier checking on-chain state rather than text output, hints, logs, and a final step requiring a short written finding with severity, proof, and fix. No local toolchain for level 1. Later expansion to Sui Move as a separate dialect track. Explicitly not another Ethereum Solidity platform. [Then paste §2 demand table + §4 tech numbers + §5 competition list.] Questions: 1) Is the gap real or am I missing an existing Solana starter service? 2) Would 3 browser levels actually onboard a React junior in one evening? 3) Which 3 bug classes first and why? 4) What would make you distrust a certificate from this arena? 5) Single biggest reason this fails in 12 months?
