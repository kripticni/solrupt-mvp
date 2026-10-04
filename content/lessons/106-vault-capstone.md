# Lesson 106: vault raid capstone: no training wheels (5 min)

## Challenge rooms are a different game

Walkthrough rooms teach one check at a time. Challenge rooms test whether the
checks compose in your head: this vault's withdraw holds a vault and a caller
and asks NOTHING about either. No signer, no compare, no relationship. Spot
which lines are missing, not which lines are wrong. One transaction, 100%
drained, remainder zero, or the verifier fails you.

*Diagram: the door that was never built. Lessons 101 and 105, missing at once.*

## The bug (all of them)

```rust
// VULNERABLE: the authority is never even read
pub vault: Account<'info, Vault>,
pub caller: AccountInfo<'info>,   // decoration: passed, never questioned
```

Name any vault, take everything. The fix you already know, twice over:
`Signer` for consent (101) plus the equality bind for ownership (105).
The secure instruction carries both.

## Before you raid

Answer the check below, then open the room. Partial drains fail on purpose:
the capstone demands the full balance in a single run, with nobody's
signature but yours on it. When it passes, write the finding: severity
Critical, proof in two sentences, fix in one.
