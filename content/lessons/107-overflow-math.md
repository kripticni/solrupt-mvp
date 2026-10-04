# Lesson 107: when subtraction adds a fortune (5 min)

## Debug panics, release wraps

Rust has two personalities around arithmetic. Debug builds panic on overflow:
`0 - 1` kills the program. Release builds wrap silently: `0 - 1` becomes
`u64::MAX`: 18,446,744,073,709,551,615, the largest fortune the type can
hold. Solana programs run as release BPF, so every bare `+` or `-` on a
balance is a potential mint in disguise.

*Diagram: the number line that bites its own tail. On release, 100 minus 101 lands on quintillions.*

## The bug

```rust
// VULNERABLE: bare subtraction on a release build
vault.balance = vault.balance - amount;   // 100 - 101 = u64::MAX, no error
```

A 100-unit vault, asked for 101, does not refuse. It wraps. No signer
forgery, no fake account, no confused deputy: just an operator the author
assumed would fail. The class is the lesson, worth every point. No single
canonical incident is claimed for it.
## The fix (one method)

```rust
vault.balance = vault.balance.checked_sub(amount).ok_or(InsufficientFunds)?;
```

`checked_sub` returns None instead of wrapping, and the error propagates.
Same inputs, opposite verdict: the 101-unit withdrawal refuses instead of
minting quintillions. Rule for life: financial math is always `checked_*`.
Bare operators are release build wrapping bugs; `overflow-checks = true` in
the profile is defense in depth, never the fix. Open the room and prove it:
wrap the books, watch quintillions appear, then run the same shape at the
secure instruction and watch it refuse.
