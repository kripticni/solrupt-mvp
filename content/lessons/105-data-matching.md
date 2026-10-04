# Lesson 105: the right signature on the wrong vault (5 min)

## Two questions, not one

Lesson 101 taught the first question every instruction must answer: WHO signed?
This room teaches the second: WHAT did they sign for? A valid signature on the
wrong account is worth exactly as much as no signature: nothing. The program
below verifies somebody signed and that funds exist, but never checks the
link between the two facts.

*Diagram: Bob's signature plus Alice's vault. Each fact checks out alone; without the link, the pair is still theft.*

## The bug

```rust
// VULNERABLE: signer verified, relationship absent
pub vault: Account<'info, Vault>,   // ANY vault: no has_one, no seeds
pub authority: Signer<'info>,       // ANY signer: valid, but whose?
```

Bob signs his own transaction and passes Alice's vault. Signature: valid.
Balance: sufficient. Relationship: never asked about. Alice's units move to
Bob. Cashio lost about $48M to this class of bug: fake collateral accounts
no one verified, real tokens minted against nothing.

## The fix (one attribute)

```rust
#[account(mut, has_one = authority)]
pub vault: Account<'info, Vault>,
```

`has_one` generates `vault.authority == authority.key()` and runs it before
the body: Bob's signature on Alice's vault fails validation. Answer both
questions every time: `Signer` for WHO, `has_one`/`constraint` for WHAT FOR.
Your turn: drain with a stranger's signature and watch the balance move, then
run the same bytes at the secure instruction and watch it refuse.
