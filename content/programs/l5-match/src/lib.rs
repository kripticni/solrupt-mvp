// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Account data matching: the right signature on the wrong vault
//!
//! ## Overview
//! L1 taught: no signature, no withdrawal. This room teaches the second half:
//! a VALID signature on the WRONG account is equally worthless. The program
//! verifies somebody signed. But never checks the signer OWNS the vault
//! being drained.
//!
//! ## The vulnerability
//! `withdraw_insecure` takes a vault and a signer and moves funds without ever
//! comparing `vault.authority` to the signer. Bob signs his own transaction,
//! passes ALICE's vault, and the program (signature present, relationship
//! absent) sends Alice's balance to Bob.
//!
//! ## The fix
//! One attribute: `has_one = authority` on the vault. Anchor generates the
//! `vault.authority == authority.key()` compare and runs it BEFORE the body.
//! The manual fallback is the same compare written by hand.

use anchor_lang::prelude::*;

declare_id!("8BGViQLBtPwZccPwccmTG7QCEnVekmWcitnzM6hydx2J");

#[program]
pub mod l5_match {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTION
    // ============================================================================
    ///
    /// ## INSECURE: a signature is verified, an owner is not
    ///
    /// Attack scenario:
    /// 1. Alice opens a vault with 100 units (authority = Alice).
    /// 2. Bob calls `withdraw_insecure` with:
    ///    * vault = ALICE's vault,
    ///    * authority = Bob (Bob signs. A perfectly valid signature),
    ///    * destination = Bob.
    /// 3. The program sees a signer and funds, checks nothing linking them,
    ///    and moves Alice's units to Bob.
    ///
    pub fn withdraw_insecure(ctx: Context<WithdrawInsecure>, amount: u64) -> Result<()> {
        // VULNERABILITY: authority signed, but nobody asked whether this
        // signer owns THIS vault. Any signer drains any vault.
        let vault = &mut ctx.accounts.vault;

        require!(vault.balance >= amount, MatchError::InsufficientFunds);
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(MatchError::Overflow)?;

        msg!(
            "INSECURE withdrawal of {} from vault of {} by signer {}",
            amount,
            vault.authority,
            ctx.accounts.authority.key()
        );
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION (Recommended - has_one)
    // ============================================================================
    ///
    /// ## SECURE: the relationship is the check
    ///
    /// `has_one = authority` makes Anchor compare the vault's stored authority
    /// against the signer before the body runs. Bob's signature on Alice's
    /// vault fails validation. The body never executes.
    ///
    pub fn withdraw_secure(ctx: Context<WithdrawSecure>, amount: u64) -> Result<()> {
        // Anchor already verified vault.authority == authority.key().
        let vault = &mut ctx.accounts.vault;

        require!(vault.balance >= amount, MatchError::InsufficientFunds);
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(MatchError::Overflow)?;

        msg!(
            "SECURE withdrawal of {} by verified owner {}",
            amount,
            ctx.accounts.authority.key()
        );
        Ok(())
    }

    // ============================================================================
    // PANEL: both
    // INITIALIZER
    // ============================================================================

    /// Open a vault's books for demonstration.
    pub fn initialize_vault(ctx: Context<InitializeVault>, initial_balance: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.balance = initial_balance;
        vault.bump = ctx.bumps.vault;

        msg!(
            "vault opened with {} for {}",
            initial_balance,
            vault.authority
        );
        Ok(())
    }
}

// ============================================================================
// ACCOUNT STRUCTURES
// ============================================================================

// PANEL: vuln
/// Insecure: signer present, relationship absent.
#[derive(Accounts)]
pub struct WithdrawInsecure<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    // INSECURE: signs, but nothing ties this signer to the vault above.
    pub authority: Signer<'info>,
}

// PANEL: fixed
/// Secure: one attribute ties signer to vault.
#[derive(Accounts)]
pub struct WithdrawSecure<'info> {
    #[account(
        mut,
        // SECURE: vault.authority == authority.key(), enforced pre-body.
        has_one = authority @ MatchError::AuthorityMismatch,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,
}

// PANEL: both
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// PANEL: both
// DATA STRUCTURES
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Vault {
    /// The only signer allowed to drain this vault.
    pub authority: Pubkey,
    /// Bookkeeping balance.
    pub balance: u64,
    /// PDA bump seed.
    pub bump: u8,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum MatchError {
    #[msg("Vault authority does not match signer")]
    AuthorityMismatch,
    #[msg("Insufficient funds in the vault")]
    InsufficientFunds,
    #[msg("Arithmetic overflow occurred")]
    Overflow,
}

// ============================================================================
// SECURITY SUMMARY
// ============================================================================
//
// | Aspect           | Insecure                 | Secure                       |
// |------------------|--------------------------|------------------------------|
// | Signer           | verified (anyone)        | verified                     |
// | Relationship     | never checked            | has_one = authority          |
// | Bob on Alice's   | drains                   | AuthorityMismatch, pre-body  |
// | vault            |                          |                              |
//
// RULE: every instruction answers TWO questions: WHO signed, and WHAT did
// they sign FOR. `Signer` answers the first; `has_one`/`constraint` answers
// the second. One without the other is half a check.
// ============================================================================
