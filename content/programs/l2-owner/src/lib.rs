// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Missing Owner Check Vulnerability
//! 
//! ## Overview
//! This program demonstrates the **Missing Owner Check** vulnerability where
//! a program accepts an account without verifying which program owns it.
//! 
//! ## The Vulnerability
//! Every Solana account has an `owner` field indicating which program controls it.
//! When deserializing account data, if we don't verify the owner, an attacker can:
//! 1. Create a fake account with fabricated data
//! 2. Set arbitrary values (fake balances, fake authorities, etc.)
//! 3. Pass it to our program which blindly trusts the data
//! 
//! ## Real-World Impact
//! - **Fake collateral**: Attacker shows fake token balance to borrow real assets
//! - **Privilege escalation**: Attacker creates account with admin flag set
//! - **Price manipulation**: Attacker provides fake oracle price data
//! 
//! ## The Fix
//! Use Anchor's `Account<'info, T>` type which automatically verifies:
//! 1. The account is owned by the expected program
//! 2. The account data deserializes correctly to type T
//! 3. The account discriminator matches (prevents type confusion)

use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Token};

declare_id!("Cm1MRpNCGCVXbft2uKoqhQ81Huw3uUCVnxzBEHqUYwNz");

#[program]
pub mod l2_owner {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTION
    // ============================================================================
    /// 
    /// ## [INSECURE] INSECURE: No Owner Verification
    /// 
    /// This instruction reads token balance from an account without verifying
    /// that the account is actually owned by the SPL Token program.
    /// 
    /// ### Attack Scenario:
    /// 1. Lending protocol uses this to check collateral before lending
    /// 2. Attacker creates a System Program-owned account
    /// 3. Attacker writes fake data that looks like TokenAccount with 1M tokens
    /// 4. Program reads the fake balance and approves a massive loan
    /// 5. Attacker defaults, protocol loses real funds
    /// 
    /// ### Why This Happens:
    /// `AccountInfo` is just raw bytes - it doesn't verify:
    /// - Who owns the account
    /// - Whether the data is valid
    /// - Whether it's actually the type we expect
    /// 
    pub fn check_balance_insecure(ctx: Context<CheckBalanceInsecure>) -> Result<()> {
        // [!] VULNERABILITY: Reading raw bytes without owner verification
        let data = ctx.accounts.token_account.try_borrow_data()?;
        
        // We're manually parsing what we HOPE is a token account
        // But an attacker could pass ANY account with ANY data!
        if data.len() < 72 {
            return Err(OwnerCheckError::InvalidAccountData.into());
        }
        
        // Token account structure: mint(32) + owner(32) + amount(8) + ...
        // Bytes 64-72 contain the amount
        let amount_bytes: [u8; 8] = data[64..72].try_into().unwrap();
        let balance = u64::from_le_bytes(amount_bytes);
        
        msg!(
            "[!] INSECURE: Read balance of {} tokens from unverified account",
            balance
        );
        
        // In a real exploit, this balance could be used to:
        // - Approve loans based on fake collateral
        // - Allow withdrawals exceeding actual balance
        // - Grant permissions based on fake holdings
        
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION (Manual Check)
    // ============================================================================
    /// 
    /// ## [SECURE] SECURE: Manual Owner Verification
    /// 
    /// This version manually checks that the account is owned by the Token program
    /// before trusting its data. This is the "raw" approach.
    /// 
    pub fn check_balance_secure_manual(ctx: Context<CheckBalanceSecureManual>) -> Result<()> {
        // [SECURE] Step 1: Verify the account is owned by SPL Token program
        if ctx.accounts.token_account.owner != &anchor_spl::token::ID {
            msg!("[INSECURE] Account is not owned by Token program!");
            return Err(OwnerCheckError::InvalidOwner.into());
        }
        
        // [SECURE] Step 2: Now we can safely parse the data
        let data = ctx.accounts.token_account.try_borrow_data()?;
        
        if data.len() < 72 {
            return Err(OwnerCheckError::InvalidAccountData.into());
        }
        
        let amount_bytes: [u8; 8] = data[64..72].try_into().unwrap();
        let balance = u64::from_le_bytes(amount_bytes);
        
        msg!(
            "[SECURE] SECURE (manual): Verified Token program ownership, balance: {}",
            balance
        );
        
        Ok(())
    }

    // ============================================================================
    // SECURE INSTRUCTION (Recommended - Anchor Types)
    // ============================================================================
    /// 
    /// ## [SECURE][SECURE] RECOMMENDED: Use Anchor's Account Type
    /// 
    /// This is the idiomatic Anchor approach. Using `Account<'info, TokenAccount>`
    /// automatically verifies:
    /// 1. The account is owned by SPL Token program
    /// 2. The data deserializes correctly to TokenAccount
    /// 3. The account is not closed (rent-exempt check)
    /// 
    /// ### Why This Is Best:
    /// - Less code = fewer bugs
    /// - Anchor handles edge cases
    /// - Compile-time type safety
    /// - Clear intent to code reviewers
    /// 
    pub fn check_balance_secure_anchor(ctx: Context<CheckBalanceSecureAnchor>) -> Result<()> {
        // [SECURE] At this point, Anchor has ALREADY verified:
        // 1. token_account.owner == spl_token::ID
        // 2. Data deserializes to valid TokenAccount
        // 3. Account discriminator is correct
        
        let token_account = &ctx.accounts.token_account;
        
        // We also verify that the caller actually owns this token account
        require!(
            token_account.owner == ctx.accounts.authority.key(),
            OwnerCheckError::NotTokenOwner
        );
        
        msg!(
            "[SECURE][SECURE] SECURE (Anchor): Token account verified! Balance: {}, Owner: {}",
            token_account.amount,
            token_account.owner
        );
        
        Ok(())
    }

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE: Custom Account Without Owner Check
    // ============================================================================
    /// 
    /// ## [INSECURE] INSECURE: Custom Account Without Validation
    /// 
    /// This demonstrates the vulnerability with program-defined accounts.
    /// Using raw AccountInfo allows attacker to pass fake UserProfile data.
    /// 
    pub fn get_user_level_insecure(ctx: Context<GetUserLevelInsecure>) -> Result<()> {
        let data = ctx.accounts.user_profile.try_borrow_data()?;
        
        // [!] Attacker can pass any account with fabricated data!
        // They could create an account that says they're an admin
        if data.len() < 16 {
            return Err(OwnerCheckError::InvalidAccountData.into());
        }
        
        // Manually parse what we hope is a UserProfile
        // Skip 8-byte discriminator
        let is_admin = data[8] != 0;
        let level_bytes: [u8; 4] = data[9..13].try_into().unwrap();
        let level = u32::from_le_bytes(level_bytes);
        
        msg!(
            "[!] INSECURE: User level={}, is_admin={} (UNVERIFIED!)",
            level, is_admin
        );
        
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE: Custom Account With Anchor Validation
    // ============================================================================
    /// 
    /// ## [SECURE] SECURE: Custom Account With Full Validation
    /// 
    /// Using `Account<'info, UserProfile>` ensures:
    /// 1. Account is owned by THIS program
    /// 2. Discriminator matches UserProfile type
    /// 3. Data deserializes correctly
    /// 
    pub fn get_user_level_secure(ctx: Context<GetUserLevelSecure>) -> Result<()> {
        let profile = &ctx.accounts.user_profile;
        
        // [SECURE] Anchor has verified this is a real UserProfile from our program
        msg!(
            "[SECURE] SECURE: Verified user level={}, is_admin={}",
            profile.level,
            profile.is_admin
        );
        
        Ok(())
    }

    /// Initialize a user profile for testing
    pub fn initialize_profile(ctx: Context<InitializeProfile>) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.authority = ctx.accounts.authority.key();
        profile.level = 1;
        profile.is_admin = false;
        profile.bump = ctx.bumps.user_profile;
        
        msg!("Profile initialized for {}", profile.authority);
        Ok(())
    }
}

// ============================================================================
// ACCOUNT STRUCTURES
// ============================================================================

/// ## Insecure: Raw AccountInfo
// PANEL: vuln
/// No verification - accepts any account
#[derive(Accounts)]
pub struct CheckBalanceInsecure<'info> {
    /// CHECK: Intentionally insecure - no owner verification
    pub token_account: AccountInfo<'info>,
}

/// ## Secure (Manual): Still uses AccountInfo but we verify manually
// PANEL: fixed
#[derive(Accounts)]
pub struct CheckBalanceSecureManual<'info> {
    /// CHECK: We manually verify owner in the instruction
    pub token_account: AccountInfo<'info>,
}

/// ## Secure (Recommended): Uses Anchor's typed Account
#[derive(Accounts)]
pub struct CheckBalanceSecureAnchor<'info> {
    // [SECURE] Account<TokenAccount> automatically verifies SPL Token ownership
    pub token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

/// Insecure custom account access
// PANEL: vuln
#[derive(Accounts)]
pub struct GetUserLevelInsecure<'info> {
    /// CHECK: Intentionally insecure for demonstration
    pub user_profile: AccountInfo<'info>,
}

/// Secure custom account access
// PANEL: fixed
#[derive(Accounts)]
pub struct GetUserLevelSecure<'info> {
    // [SECURE] Account<UserProfile> verifies our program owns this account
    #[account(
        seeds = [b"profile", user_profile.authority.as_ref()],
        bump = user_profile.bump,
    )]
    pub user_profile: Account<'info, UserProfile>,
}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"profile", authority.key().as_ref()],
        bump,
    )]
    pub user_profile: Account<'info, UserProfile>,
    
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
pub struct UserProfile {
    pub authority: Pubkey,
    pub is_admin: bool,
    pub level: u32,
    pub bump: u8,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum OwnerCheckError {
    #[msg("Account is not owned by the expected program")]
    InvalidOwner,
    #[msg("You do not own this token account")]
    NotTokenOwner,
    #[msg("Invalid account data")]
    InvalidAccountData,
}

// ============================================================================
// SECURITY COMPARISON TABLE
// ============================================================================
//
// | Method               | Owner Check | Type Check | Discriminator | Safety  |
// |----------------------|-------------|------------|---------------|---------|
// | AccountInfo          | [INSECURE] No       | [INSECURE] No      | [INSECURE] No         | [INSECURE] None |
// | Manual verification  | [SECURE] Yes      | [INSECURE] Manual  | [INSECURE] Manual     | [!] Risky|
// | Account<T>           | [SECURE] Auto     | [SECURE] Auto    | [SECURE] Auto       | [SECURE] Best |
// | UncheckedAccount     | [INSECURE] No       | [INSECURE] No      | [INSECURE] No         | [INSECURE] None |
//
// RULE: Always use Account<T> unless you have a specific reason not to
// ============================================================================
