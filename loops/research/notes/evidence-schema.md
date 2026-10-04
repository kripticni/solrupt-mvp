# P0.6 evidence schema (append-only rows from Sat 11:00 — feeds Sunday README)

One row per hypothesis→test→result. Verbatim failures. Nothing reconstructed Sunday.

```
TS=<ISO8601> | GOAL=<S6|S7|S8> | H=<hypothesis one line>
CMD=<exact command> | RC=<n> | OUT=<verbatim output, max 20 lines; longer → notes/spill-<date>.md + pointer>
VERDICT=<PASS|FAIL|NO-OP|BLOCKED> | NEXT=<one line>
```

Rules (from scope §§7–8 + ARCHITECTURE_PROFILE honest non-claims):
1. Negative/null result is valid iff transparent — never re-run subjects until green (S7: 5 beginners × 10 min, bar 3/5 on FIRST runs).
2. Every S6 verifier row pairs exploit-vs-vuln PASS with exploit-vs-fixed FAIL (same exploit, both transcripts, same session shape).
3. Stranger-re-verifiable: each proof row includes re-run recipe (pins + digests + command) a stranger can execute alone.
4. No memory numbers: digests from `sha256sum`, bytes from `stat -c%s`, timings from `time` — quote command + output.
5. Inference labeled `[INFERENCE]`; estimates `ESTIMATE+method`.

Storage: `notes/evidence-<date>.md` (this file is the SCHEMA; rows live in dated files). Verifier appends; closer cites row lines in gate notes.
