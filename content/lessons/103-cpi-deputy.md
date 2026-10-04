# Lesson 103: CPI and the confused deputy (5 min)

## Programs calling programs

One Solana program can invoke another in the middle of an instruction: a cross program
invocation (CPI). The caller passes the callee's address as an account, the
runtime runs the callee, and the caller usually trusts the result. That trust
is the whole attack surface: **the caller names the callee, but whoever built
the transaction chooses which account fills that slot.**

*Diagram: with an unverified callee, the call forks to the attacker's program. Verification collapses it to one path.*

## The bug

```rust
// VULNERABLE: callee is an unchecked account
pub token_program: AccountInfo<'info>,
// ...
invoke(&ix, &[])?; // whoever we were handed runs; Ok is treated as "tokens moved"
```

The program invokes the handed address and records a release when the call
returns Ok. In the wild, the attacker deploys a fake token program that
answers Ok to anything. In this lab, the room program's own `ping` plays that
part, so nothing extra must be deployed. Books move, tokens never do.
Crema Finance lost about $9M to this class of trusted spoofed account bug.

## The fix (name the callee in the type)

```rust
pub token_program: Program<'info, Token>,
```

`Program<Token>` proves key == the real Token program id (plus executable)
before the body runs, and the secure body performs a REAL transfer, so books
update only after real movement. The manual fallback is one explicit compare:
`require!(key == spl_token::ID)`. Your turn: release on the fake callee and
watch the books move, then run the same shape at the secure instruction and
watch it refuse.
