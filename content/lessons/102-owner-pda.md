# Lesson 102: owner, PDA, and the fake account (5 min)

## Who owns this account?

Every account has an `owner` field: the only program allowed to write its data.
Anyone can *create* an account and write *anything* into it. The owner field
says who is responsible for the bytes, not that the bytes are true.

## The bug

```rust
let data = ctx.accounts.token_account.try_borrow_data()?; // nobody asked: owned by whom?
let balance = u64::from_le_bytes(data[64..72].try_into().unwrap());
```

The program parses bytes 64 to 72 as a token balance without checking the account
is owned by the Token program. The attacker hands it a System owned account
with `1_000_000` written at exactly those offsets: fake collateral, real loan.

## PDAs: the same idea, one level up

A PDA (program derived address) is an address your program *must* own: derived
from seeds + bump, with no private key. `seeds = [b"vault", authority]` plus the
canonical bump means only your program can sign for it. Skip the bump check and
attackers grind a different bump to a colliding address.

*Diagram: seeds plus the stored bump produce the one address your program can sign for.*

## The fix

```rust
pub token_account: Account<'info, TokenAccount>,
```

`Account<T>` verifies owner + deserialization + discriminator before your code
runs. Your turn: open the room, approve the fake loan, then run the same shape
at both secure variants and watch them refuse.
