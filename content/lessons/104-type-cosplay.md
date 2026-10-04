# Lesson 104: type cosplay, or the right bytes in the wrong costume (5 min)

## Same bytes, different meaning

A `User` account holds `authority: Pubkey` in its first 32 bytes. A `Note`
account holds `account: Pubkey` in its first 32 bytes. Read the bytes alone
and the two are indistinguishable: same length, same offsets, same key in the
same slot. The ONLY thing telling them apart is the 8-byte discriminator
Anchor prepends: `sha256("account:User")` versus `sha256("account:Note")`.

*Diagram: identical layouts, different discriminators: the first 8 bytes are the whole difference.*

## The bug

```rust
// VULNERABLE: bytes read, type never asked
let data = ctx.accounts.user.try_borrow_data()?;
let stored_authority = Pubkey::new_from_array(data[8..40].try_into().unwrap());
require!(stored_authority == ctx.accounts.authority.key(), Unauthorized);
```

The attacker registers a `Note` pointing at themselves and passes it where a
`User` belongs. Bytes 8..40 hold the attacker's key, the equality check
passes, and the ledger records a claim for a user that never existed. No
incident one-liner here: cosplay has no single canonical hack. It is a
hygiene class auditors check on every program, which is exactly why this
room pays the most points in the gym.

## The fix (let the type do the asking)

```rust
pub user: Account<'info, User>,
```

`Account<User>` verifies discriminator plus owner plus shape before the body
runs. A `Note` fails at the door. Never parse account bytes by hand: a
manual parse without a discriminator compare is cosplay waiting for an
audience. Your turn: claim in costume and watch the ledger move, then run the
same shape at the secure instruction and watch it refuse.
