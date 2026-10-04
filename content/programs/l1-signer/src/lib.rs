// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Missing signer: a pubkey is not consent
//!
//! ## Overview
//! L1 teaches the first question every instruction must answer: WHO signed?
//! A public key passed as data proves nothing: copying Alice's address into
//! a field is typing, not consent. Only `is_signer`, set by the runtime when
//! the private key signs, proves agreement.
//!
//! ## The vulnerability
//! The insecure instruction compares `vault.authority` against a handed pubkey
//! and never checks the signature. The attacker passes the victim's pubkey, signs
//! as themselves, and the equality check (correct name, no consent) waves
//! them through.
//!
//! ## The fix
//! Type the authority as `Signer<'info>`. Anchor verifies `is_signer` BEFORE
//! the body runs, so an unsigned authority fails at the door.

use anchor_lang::prelude::*;

declare_id!("JA3qiz3KpQkEtL4bMLWoWazcSHYYrUHyKRg5UgtVkzuA");

#[program]
pub mod l1_signer {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTION
    // ============================================================================
    /// ## INSECURE: authority compared, signature never checked
    ///
    /// Attack scenario:
    /// 1. Alice holds a vault (authority = Alice).
    /// 2. Attacker calls `withdraw_insecure` with:
    ///    - vault = Alice's vault,
    ///    - authority = Alice's pubkey (passed, NOT signed).
    /// 3. The equality check compares names, never signatures. Funds move.
    ///
    pub fn withdraw_insecure(ctx: Context<WithdrawInsecure>, amount: u64) -> Result<()> {
        // VULNERABILITY: the authority matches, but nobody verified it SIGNED
        // this transaction. A correct pubkey with no signature walks through.
        let vault = &mut ctx.accounts.vault;

        // This check compares names, not consent: the attacker passes the
        // correct authority pubkey without signing.
        require!(
            vault.authority == ctx.accounts.authority.key(),
            VaultError::UnauthorizedAccess
        );
        
        require!(vault.balance >= amount, VaultError::InsufficientFunds);
        
        vault.balance = vault.balance.checked_sub(amount)
            .ok_or(VaultError::Overflow)?;
        
        msg!(
            "INSECURE withdrawal of {} lamports by authority {}",
            amount,
            ctx.accounts.authority.key()
        );
        
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION
    // ============================================================================
    /// ## SECURE: the signature is checked before the body runs
    ///
    /// `Signer<'info>` makes Anchor verify `is_signer` during validation, so
    /// an unsigned authority fails before the instruction body executes.
    /// Same shape, same inputs. The attacker's transaction never reaches
    /// the equality check.
    ///
    pub fn withdraw_secure(ctx: Context<WithdrawSecure>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        // Anchor already verified the authority signed: this compare now
        // binds a proven signature, not a bare pubkey.
        require!(
            vault.authority == ctx.accounts.authority.key(),
            VaultError::UnauthorizedAccess
        );
        
        require!(vault.balance >= amount, VaultError::InsufficientFunds);
        
        vault.balance = vault.balance.checked_sub(amount)
            .ok_or(VaultError::Overflow)?;
        
        msg!(
            "SECURE withdrawal of {} lamports by verified signer {}",
            amount,
            ctx.accounts.authority.key()
        );
        
        Ok(())
    }

    // ============================================================================
    // PANEL: both
    // HELPER INSTRUCTIONS
    // ============================================================================
    
    /// Open a vault for demonstration.
    pub fn initialize_vault(ctx: Context<InitializeVault>, initial_balance: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.balance = initial_balance;
        vault.bump = ctx.bumps.vault;

        msg!("vault opened with {} lamports for {}", initial_balance, vault.authority);
        Ok(())
    }
}

// ============================================================================
// ACCOUNT STRUCTURES
// ============================================================================

/// Insecure: the authority is an unchecked account.
// PANEL: vuln
/// `authority` is typed as `AccountInfo`: any pubkey fits, none must sign.
/// That missing requirement IS the room.
#[derive(Accounts)]
pub struct WithdrawInsecure<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    // INSECURE: AccountInfo requires no signature. The runtime never
    // enforces that this account signed the transaction.
    /// CHECK: intentionally unchecked. This missing check IS the room.
    pub authority: AccountInfo<'info>,
}

/// Secure: only a signing authority passes validation.
// PANEL: fixed
/// `authority` is typed as `Signer`: an unsigned authority fails before the
/// body runs.
#[derive(Accounts)]
pub struct WithdrawSecure<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    // SECURE: the Signer type makes Anchor verify is_signer pre-body.
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
// DATA STRUCTURES
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Vault {
    /// Who may withdraw (checked against a Signer on the secure side).
    pub authority: Pubkey,
    /// Bookkeeping balance in lamports.
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
// | Aspect              | Insecure                  | Secure                    |
// |---------------------|---------------------------|---------------------------|
// | Authority type      | AccountInfo               | Signer                    |
// | Signature check     | none                      | automatic, pre-body       |
// | Attack possible     | yes (impersonation)       | no                        |
// | Anchor constraint   | none                      | is_signer enforced        |
//
// RULE: a pubkey is typing, not consent. Authority accounts are Signer.
// 
// ============================================================================
