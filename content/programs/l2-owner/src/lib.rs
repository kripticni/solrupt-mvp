// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Missing owner: bytes are free, trust is not
//!
//! ## Overview
//! Every account carries an `owner`: the only program allowed to write its
//! data. Anyone can CREATE an account and write ANYTHING into it. The owner
//! field says who is responsible for the bytes, not that the bytes are true.
//!
//! ## The vulnerability
//! The insecure instruction parses bytes 64..72 as a token balance without
//! asking which program owns the account. The attacker hands it a
//! System-owned account with a fabricated balance at exactly those offsets:
//! fake collateral, trusted as real.
//!
//! ## The fix
//! Ownership first, parsing second. A manual `owner == Token program id`
//! compare, or `Account<'info, TokenAccount>`, which verifies owner plus
//! deserialization plus discriminator BEFORE the body runs.

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
    /// ## INSECURE: balance read, owner never asked
    ///
    /// Attack scenario:
    /// 1. A lending flow trusts this check before approving a loan.
    /// 2. Attacker creates a System-owned account with fake TokenAccount
    ///    bytes: 1_000_000 written at offsets 64..72.
    /// 3. The program parses the fabrication and reports a real balance.
    ///    The loan that follows is backed by nothing.
    ///
    pub fn check_balance_insecure(ctx: Context<CheckBalanceInsecure>) -> Result<()> {
        // VULNERABILITY: raw bytes parsed with no owner verification. Anyone
        // can pass ANY account with ANY data.
        let data = ctx.accounts.token_account.try_borrow_data()?;

        if data.len() < 72 {
            return Err(OwnerCheckError::InvalidAccountData.into());
        }

        // Token account layout: mint(32) + owner(32) + amount(8). Bytes
        // 64..72 hold the amount, whoever wrote them.
        let amount_bytes: [u8; 8] = data[64..72].try_into().unwrap();
        let balance = u64::from_le_bytes(amount_bytes);

        msg!(
            "INSECURE: read balance of {} from an unverified account",
            balance
        );

        // That balance is now trusted upstream: loans, withdrawals,
        // permissions, all priced off a fabrication.
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION (Manual Check)
    // ============================================================================
    /// ## SECURE (manual): refuse any account the Token program does not own
    ///
    /// Same shape as the insecure instruction, plus one explicit owner
    /// compare before parsing. Secure, but every new call site must
    /// remember it.
    ///
    pub fn check_balance_secure_manual(ctx: Context<CheckBalanceSecureManual>) -> Result<()> {
        // Ownership first: only the Token program's bytes may be parsed.
        if ctx.accounts.token_account.owner != &anchor_spl::token::ID {
            msg!("refusing account: not owned by the Token program");
            return Err(OwnerCheckError::InvalidOwner.into());
        }

        // Owner verified: now the bytes may be parsed.
        let data = ctx.accounts.token_account.try_borrow_data()?;

        if data.len() < 72 {
            return Err(OwnerCheckError::InvalidAccountData.into());
        }

        let amount_bytes: [u8; 8] = data[64..72].try_into().unwrap();
        let balance = u64::from_le_bytes(amount_bytes);

        msg!(
            "SECURE (manual): Token program ownership verified, balance: {}",
            balance
        );

        Ok(())
    }

    // ============================================================================
    // SECURE INSTRUCTION (Recommended - Anchor Types)
    // ============================================================================
    /// ## SECURE (recommended): the type system checks ownership
    ///
    /// `Account<'info, TokenAccount>` verifies owner plus deserialization
    /// plus discriminator BEFORE the body runs. Less code, fewer places to
    /// forget: the check cannot be skipped at a new call site.
    ///
    pub fn check_balance_secure_anchor(ctx: Context<CheckBalanceSecureAnchor>) -> Result<()> {
        // Anchor already verified: owner is the Token program, the bytes
        // deserialize to TokenAccount, the discriminator matches.
        let token_account = &ctx.accounts.token_account;

        // The type proves WHAT the account is; this compare proves it is YOURS.
        require!(
            token_account.owner == ctx.accounts.authority.key(),
            OwnerCheckError::NotTokenOwner
        );

        msg!(
            "SECURE (anchor): Token account verified, balance: {}, owner: {}",
            token_account.amount,
            token_account.owner
        );

        Ok(())
    }

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE: Custom Account Without Owner Check
    // ============================================================================
    /// ## INSECURE: custom account, same missing question
    ///
    /// The same bug on a program-defined type: a raw `UserProfile` parse
    /// with no owner check. A fabricated account claiming admin passes.
    ///
    pub fn get_user_level_insecure(ctx: Context<GetUserLevelInsecure>) -> Result<()> {
        let data = ctx.accounts.user_profile.try_borrow_data()?;

        // VULNERABILITY: any account with fabricated bytes fits. An account
        // claiming admin reads as admin.
        if data.len() < 16 {
            return Err(OwnerCheckError::InvalidAccountData.into());
        }

        // Manual parse of what we hope is a UserProfile: skip the 8-byte
        // discriminator slot, read the admin flag plus level.
        let is_admin = data[8] != 0;
        let level_bytes: [u8; 4] = data[9..13].try_into().unwrap();
        let level = u32::from_le_bytes(level_bytes);

        msg!(
            "INSECURE: user level={}, is_admin={} (unverified)",
            level, is_admin
        );

        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE: Custom Account With Anchor Validation
    // ============================================================================
    /// ## SECURE: the type proves the profile is ours
    ///
    /// `Account<'info, UserProfile>` verifies this program owns the account
    /// plus discriminator plus shape BEFORE the body runs. A fabrication
    /// fails at the door.
    ///
    pub fn get_user_level_secure(ctx: Context<GetUserLevelSecure>) -> Result<()> {
        let profile = &ctx.accounts.user_profile;

        // Anchor verified this is a genuine UserProfile from our program.
        msg!(
            "SECURE: verified user level={}, is_admin={}",
            profile.level,
            profile.is_admin
        );

        Ok(())
    }

    /// Open a user profile for demonstration.
    pub fn initialize_profile(ctx: Context<InitializeProfile>) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.authority = ctx.accounts.authority.key();
        profile.level = 1;
        profile.is_admin = false;
        profile.bump = ctx.bumps.user_profile;

        msg!("profile opened for {}", profile.authority);
        Ok(())
    }
}

// ============================================================================
// ACCOUNT STRUCTURES
// ============================================================================

/// Insecure: raw bytes, no owner question asked.
// PANEL: vuln
/// Accepts any account: ownership is never verified.
#[derive(Accounts)]
pub struct CheckBalanceInsecure<'info> {
    /// CHECK: intentionally unchecked. This missing check IS the room.
    pub token_account: AccountInfo<'info>,
}

/// Secure (manual): same raw account, verification in the instruction.
// PANEL: fixed
#[derive(Accounts)]
pub struct CheckBalanceSecureManual<'info> {
    /// CHECK: owner verified by explicit compare in `check_balance_secure_manual`.
    pub token_account: AccountInfo<'info>,
}

/// Secure (recommended): the type checks ownership pre-body.
#[derive(Accounts)]
pub struct CheckBalanceSecureAnchor<'info> {
    // SECURE: Account<TokenAccount> verifies Token program ownership.
    pub token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

/// Insecure custom account: fabrication fits.
// PANEL: vuln
#[derive(Accounts)]
pub struct GetUserLevelInsecure<'info> {
    /// CHECK: intentionally unchecked. This missing check IS the room.
    pub user_profile: AccountInfo<'info>,
}

/// Secure custom account: only our profiles pass.
// PANEL: fixed
#[derive(Accounts)]
pub struct GetUserLevelSecure<'info> {
    // SECURE: Account<UserProfile> verifies our program owns this account.
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
// | Method              | Owner check | Type check | Discriminator | Verdict |
// |---------------------|-------------|------------|---------------|---------|
// | AccountInfo         | none        | none       | none          | untrusted |
// | Manual verification | explicit    | manual     | manual        | careful |
// | Account<T>          | automatic   | automatic  | automatic     | trusted |
// | UncheckedAccount    | none        | none       | none          | untrusted |
//
// RULE: ownership first, parsing second. `Account<T>` does both: reach for
// anything else only with a written reason.
// ============================================================================
