// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Integer overflow: when subtraction adds a fortune
//!
//! ## Overview
//! Rust panics on overflow in debug builds and silently WRAPS in release
//! builds. Solana programs run as release BPF: `0 - 1` is not an error, it is
//! `u64::MAX` (18.4 quintillion). Every plain `+`/`-` on a balance is a
//! potential mint.
//!
//! ## The vulnerability
//! `withdraw_insecure` subtracts with a bare `-` and no balance check. A vault
//! holding 100 units, asked for 101, does not refuse: it wraps to
//! 18,446,744,073,709,551,615. The attacker turns pocket change into the
//! largest representable fortune with one instruction.
//!
//! ## The fix
//! `checked_sub`, which returns None instead of wrapping, mapped to a real
//! error. One method call; the entire class disappears.

use anchor_lang::prelude::*;

declare_id!("392HD9NFyhZpR45PcBAJRNrQZ1EAifUSJARCDxW3oEmK");

#[program]
pub mod l7_overflow {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTION
    // ============================================================================
    ///
    /// ## INSECURE: bare subtraction on a release build
    ///
    /// Attack scenario:
    /// 1. Victim vault holds 100 units.
    /// 2. Attacker calls `withdraw_insecure` with amount = 101.
    /// 3. In BPF release, `100 - 101` wraps to u64::MAX instead of failing.
    /// 4. Attacker owns more units than exist.
    ///
    /// Note for the careful reader: this wrap happens because BPF programs
    /// compile in release, where plain `-` wraps instead of panicking. The
    /// bug being taught IS that wrap.
    ///
    pub fn withdraw_insecure(ctx: Context<WithdrawInsecure>, amount: u64) -> Result<()> {
        // VULNERABILITY: plain `-` wraps silently in release. No balance
        // check, no checked math. 100 minus 101 becomes a fortune.
        let vault = &mut ctx.accounts.vault;

        vault.balance = vault.balance - amount;

        msg!(
            "INSECURE withdrawal of {} recorded, books now {}",
            amount,
            vault.balance
        );
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION
    // ============================================================================
    ///
    /// ## SECURE: checked arithmetic fails loudly instead of wrapping
    ///
    /// `checked_sub` returns None on underflow, and the `ok_or` turns it into
    /// InsufficientFunds. Same shape, same inputs. The 101 unit withdrawal
    /// from a 100 unit vault refuses instead of minting quintillions.
    ///
    pub fn withdraw_secure(ctx: Context<WithdrawSecure>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        // SECURE: underflow becomes an error, never a wrap.
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(OverflowError::InsufficientFunds)?;

        msg!(
            "SECURE withdrawal of {}, books now {}",
            amount,
            vault.balance
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
/// Insecure: nothing wrong with the accounts. The arithmetic is the bug.
#[derive(Accounts)]
pub struct WithdrawInsecure<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,
}

// PANEL: fixed
/// Secure: identical accounts; the body does checked math.
#[derive(Accounts)]
pub struct WithdrawSecure<'info> {
    #[account(mut)]
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
    /// Who the books belong to.
    pub authority: Pubkey,
    /// Bookkeeping balance (watch it wrap).
    pub balance: u64,
    /// PDA bump seed.
    pub bump: u8,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum OverflowError {
    #[msg("Insufficient funds in the vault")]
    InsufficientFunds,
}

// ============================================================================
// SECURITY SUMMARY
// ============================================================================
//
// | Aspect           | Insecure                 | Secure                       |
// |------------------|--------------------------|------------------------------|
// | Subtraction      | bare `-` (wraps)         | checked_sub (errors)         |
// | 100 minus 101    | 18446744073709551615     | InsufficientFunds            |
// | Release behavior | silent wrap              | loud failure                 |
//
// RULE: financial math is always checked_*. Bare operators are release-build
// wrapping bugs; `overflow-checks = true` is defense in depth, not the fix.
// ============================================================================
