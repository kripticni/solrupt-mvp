# Lesson 101: accounts, signers, and the missing check (5 min)

## What an account is

A Solana account is an address plus data plus an owner program. Programs are
stateless: all state lives in accounts your instruction is handed. Anyone can
hand your program any account, even one they made up ten seconds ago.

*Diagram: the account's four fields. Only `owner` can write; the rest is untrusted until checked.*

## What a signer is

A signer is an account whose private key signed this transaction. `is_signer`
is the only proof anyone agreed to anything. A public key passed as data proves
nothing: copying Alice's address into a field is typing, not consent.

*Diagram: comparing pubkeys checks the name. Only `is_signer` proves consent.*

## The bug

```rust
// VULNERABLE: equality without consent
require!(vault.authority == ctx.accounts.authority.key(), UnauthorizedAccess);
```

This checks the *name* but never the *signature*. The attacker passes the
victim's pubkey, signs as themselves, and walks through an open door.

> Wormhole lost $320M to the same class of missing verification.

## The fix (one word)

```rust
pub authority: Signer<'info>,
```

`Signer` fails the transaction before your code runs when the account did not
sign. Your turn: open the room, drain the vault with the exploit, then run the
same bytes at the secure instruction and watch them bounce off.
