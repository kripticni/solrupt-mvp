// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Vault raid capstone: drain 100% in one transaction
//!
//! ## Overview
//! A challenge room, not a walkthrough: the training wheels are off. The vault
//! below holds deposits from many users, and its withdraw instruction checks
//! NOTHING about the caller: no signature, no equality, no relationship.
//! Your mission: empty it completely, in a single transaction, without ever
//! being the authority.
//!
//! ## What it composes
//! Lesson 101 (a pubkey is not consent) plus lesson 105 (a signature must
//! match its vault). Here neither half exists: spot which lines are missing
//! instead of which lines are wrong.

use anchor_lang::prelude::*;

declare_id!("2UDFFUhGnvuvSmzTaUC726TmB4MEQVGEVR79v3NApXib");

#[program]
pub mod l6_vault {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTIONS
    // ============================================================================
    ///
    /// ## INSECURE: withdraw checks nothing about the caller
    ///
    /// No Signer, no authority compare, no has_one. Anyone naming any vault
    /// drains it. Deposit is honest so the vault can fill before the raid.
    ///
    pub fn withdraw_insecure(ctx: Context<WithdrawInsecure>, amount: u64) -> Result<()> {
        // VULNERABILITY: the authority account is not even read. There is no
        // check to bypass. The door was never built.
        let vault = &mut ctx.accounts.vault;

        require!(vault.balance >= amount, VaultError::InsufficientFunds);
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(VaultError::Overflow)?;

        msg!("INSECURE withdrawal of {} by {}", amount, ctx.accounts.caller.key());
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION
    // ============================================================================
    ///
    /// ## SECURE: authority signs AND matches
    ///
    /// Both halves from lessons 101 and 105 in one struct: `Signer` proves
    /// consent, the equality compare binds it to this vault.
    ///
    pub fn withdraw_secure(ctx: Context<WithdrawSecure>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(
            vault.authority == ctx.accounts.authority.key(),
            VaultError::UnauthorizedAccess
        );
        require!(vault.balance >= amount, VaultError::InsufficientFunds);
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(VaultError::Overflow)?;

        msg!(
            "SECURE withdrawal of {} by verified owner {}",
            amount,
            ctx.accounts.authority.key()
        );
        Ok(())
    }

    // ============================================================================
    // PANEL: both
    // DEPOSIT + INITIALIZER
    // ============================================================================

    /// Honest deposit: anyone may add to any vault (filling the target).
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.balance = vault
            .balance
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        msg!("deposit of {} by {}", amount, ctx.accounts.depositor.key());
        Ok(())
    }

    /// Open a vault for the victim.
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
/// Insecure: the caller is a bystander the program never questions.
#[derive(Accounts)]
pub struct WithdrawInsecure<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    // INSECURE: not a signer, never compared. Pure decoration.
    /// CHECK: intentionally unchecked. The missing door IS the room.
    pub caller: AccountInfo<'info>,
}

// PANEL: fixed
/// Secure: consent plus binding, both enforced.
#[derive(Accounts)]
pub struct WithdrawSecure<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    // SECURE: must sign, and the body binds the signature to this vault.
    pub authority: Signer<'info>,
}

// PANEL: both
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub depositor: Signer<'info>,
}

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
    /// The owner on paper. The insecure instruction never reads it.
    pub authority: Pubkey,
    /// Pooled deposits. The raid target.
    pub balance: u64,
    /// PDA bump seed.
    pub bump: u8,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum VaultError {
    #[msg("You are not authorized to perform this action")]
    UnauthorizedAccess,
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
// | Caller check     | none at all              | Signer + equality            |
// | Victim pubkey    | never read               | bound to signer              |
// | Raid cost        | one transaction          | impossible                   |
//
// RULE: every funds-moving instruction names its owner AND verifies the
// signature. Missing either half is a finding; missing both is a capstone.
// ============================================================================
