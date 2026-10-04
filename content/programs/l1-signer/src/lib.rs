// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Signer Authorization Vulnerability
//! 
//! ## Overview
//! This program demonstrates one of the most common and dangerous vulnerabilities
//! in Solana programs: **Missing Signer Authorization**.
//! 
//! ## The Vulnerability
//! When a program accepts an `AccountInfo` without verifying that the account
//! signed the transaction, ANY user can pass ANY public key as the "authority".
//! This allows attackers to impersonate any user and perform unauthorized actions.
//! 
//! ## Real-World Impact
//! - **Unauthorized fund transfers**: Attacker drains user wallets
//! - **Admin impersonation**: Attacker takes control of program settings
//! - **State manipulation**: Attacker modifies any user's data
//! 
//! ## The Fix
//! Use Anchor's `Signer<'info>` type instead of raw `AccountInfo<'info>`.
//! The `Signer` type automatically verifies that the account signed the transaction.

use anchor_lang::prelude::*;

declare_id!("JA3qiz3KpQkEtL4bMLWoWazcSHYYrUHyKRg5UgtVkzuA");

#[program]
pub mod l1_signer {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTION
    // ============================================================================
    /// 
    /// ## [INSECURE] INSECURE: Missing Signer Check
    /// 
    /// This instruction allows ANYONE to withdraw funds by simply passing any
    /// public key as the `authority`. The program never verifies that the
    /// authority actually signed the transaction.
    /// 
    /// ### Attack Scenario:
    /// 1. Alice has a vault with 100 SOL, authority = Alice's pubkey
    /// 2. Attacker calls `withdraw_insecure` with:
    ///    - vault = Alice's vault
    ///    - authority = Alice's pubkey (NOT signed by Alice!)
    /// 3. Program accepts it because it never checks if authority signed
    /// 4. Attacker steals Alice's 100 SOL
    /// 
    /// ### Why This Happens:
    /// The `authority` field is typed as `AccountInfo`, which is just a raw
    /// reference to any account. It doesn't enforce any security checks.
    /// 
    pub fn withdraw_insecure(ctx: Context<WithdrawInsecure>, amount: u64) -> Result<()> {
        // [!] VULNERABILITY: We check if the authority matches, but NEVER verify
        // that the authority actually SIGNED this transaction!
        
        let vault = &mut ctx.accounts.vault;
        
        // This check is USELESS without signer verification:
        // Attacker can pass the correct authority pubkey without signing
        require!(
            vault.authority == ctx.accounts.authority.key(),
            VaultError::UnauthorizedAccess
        );
        
        require!(vault.balance >= amount, VaultError::InsufficientFunds);
        
        vault.balance = vault.balance.checked_sub(amount)
            .ok_or(VaultError::Overflow)?;
        
        msg!(
            "[!] INSECURE withdrawal of {} lamports by authority {}",
            amount,
            ctx.accounts.authority.key()
        );
        
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION
    // ============================================================================
    /// 
    /// ## [SECURE] SECURE: Proper Signer Verification
    /// 
    /// This instruction properly verifies that the authority has signed the
    /// transaction using Anchor's `Signer<'info>` type.
    /// 
    /// ### How `Signer` Protects:
    /// 1. Anchor automatically checks `authority.is_signer == true`
    /// 2. If the account didn't sign, the transaction fails BEFORE your code runs
    /// 3. The check happens at the constraint validation phase
    /// 
    /// ### Attack Attempt (FAILS):
    /// 1. Attacker tries to call `withdraw_secure` with Alice's pubkey
    /// 2. Transaction fails immediately: "Signature verification failed"
    /// 3. Alice's funds are safe
    /// 
    pub fn withdraw_secure(ctx: Context<WithdrawSecure>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        // [SECURE] At this point, we KNOW authority signed because of Signer type
        require!(
            vault.authority == ctx.accounts.authority.key(),
            VaultError::UnauthorizedAccess
        );
        
        require!(vault.balance >= amount, VaultError::InsufficientFunds);
        
        vault.balance = vault.balance.checked_sub(amount)
            .ok_or(VaultError::Overflow)?;
        
        msg!(
            "[SECURE] SECURE withdrawal of {} lamports by verified signer {}",
            amount,
            ctx.accounts.authority.key()
        );
        
        Ok(())
    }

    // ============================================================================
    // PANEL: both
    // HELPER INSTRUCTIONS
    // ============================================================================
    
    /// Initialize a new vault for demonstration
    pub fn initialize_vault(ctx: Context<InitializeVault>, initial_balance: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.balance = initial_balance;
        vault.bump = ctx.bumps.vault;
        
        msg!("Vault initialized with {} lamports for {}", initial_balance, vault.authority);
        Ok(())
    }
}

// ============================================================================
// ACCOUNT STRUCTURES
// ============================================================================

/// ## Insecure Accounts Structure
// PANEL: vuln
/// 
/// Notice: `authority` is typed as `AccountInfo` - this is the vulnerability!
/// Anyone can pass any pubkey here without actually signing.
#[derive(Accounts)]
pub struct WithdrawInsecure<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    // [INSECURE] INSECURE: AccountInfo doesn't require signing!
    // The runtime doesn't enforce that this account signed the transaction.
    /// CHECK: This is intentionally insecure for demonstration purposes.
    pub authority: AccountInfo<'info>,
}

/// ## Secure Accounts Structure
// PANEL: fixed
/// 
/// Notice: `authority` is typed as `Signer` - this enforces signature verification!
/// The transaction will fail if the authority didn't sign.
#[derive(Accounts)]
pub struct WithdrawSecure<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    // [SECURE] SECURE: Signer type enforces that this account MUST sign the transaction!
    // Anchor automatically verifies: authority.is_signer == true
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
    /// The authorized owner who can withdraw from this vault
    pub authority: Pubkey,
    /// Current balance in lamports
    pub balance: u64,
    /// PDA bump seed
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
// | Aspect              | Insecure Version        | Secure Version          |
// |---------------------|-------------------------|-------------------------|
// | Authority Type      | AccountInfo<'info>      | Signer<'info>           |
// | Signature Check     | [INSECURE] None                 | [SECURE] Automatic            |
// | Attack Possible     | [SECURE] Yes - impersonation  | [INSECURE] No                   |
// | Anchor Constraint   | None                    | is_signer enforced      |
// 
// ============================================================================
