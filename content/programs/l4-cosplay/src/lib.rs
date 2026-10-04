// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Type cosplay: the wrong account in the right costume
//!
//! ## Overview
//! Two different account types can share the same byte layout: a `User` whose
//! first field is `authority: Pubkey` and a `Note` whose first field is
//! `account: Pubkey` are 32 identical bytes. Code that reads bytes without
//! asking WHAT TYPE they are cannot tell the costumes apart.
//!
//! ## The vulnerability
//! The insecure instruction takes any account, skips the 8-byte discriminator slot,
//! reads bytes 8..40 as "the authority", and compares against the signer.
//! The attacker registers a `Note` pointing at themselves, passes it where a
//! `User` is expected, and the equality check (correct bytes, wrong type)
//! waves them through. The reward ledger moves for a user that never existed.
//!
//! ## The fix
//! Type the account as `Account<'info, User>`. Anchor verifies the 8-byte
//! discriminator (`sha256("account:User")`) plus owner plus shape BEFORE the
//! body runs, so a `Note` fails at the door with AccountDiscriminatorMismatch.

use anchor_lang::prelude::*;

declare_id!("9QrjdkjrnFXC2kaqB7pb3zUMSDRDmQZrQysiCYRvERZA");

#[program]
pub mod l4_cosplay {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTION
    // ============================================================================
    ///
    /// ## INSECURE: bytes read, type never asked
    ///
    /// Attack scenario:
    /// 1. Victim registers a `User` (authority = victim).
    /// 2. Attacker registers a `Note` (account = attacker). Same layout,
    ///    different discriminator, but nobody looks at it here.
    /// 3. Attacker calls `claim_insecure` with the Note where a User belongs,
    ///    signing as themselves. Bytes 8..40 hold the attacker's key, the
    ///    equality check passes, the ledger records a claim.
    ///
    pub fn claim_insecure(ctx: Context<ClaimInsecure>) -> Result<()> {
        // VULNERABILITY: manual parse, no discriminator compare. The first
        // 32 bytes after the discriminator slot are trusted as authority
        // regardless of which account type provided them.
        let data = ctx.accounts.user.try_borrow_data()?;
        if data.len() < 40 {
            return Err(CosplayError::InvalidData.into());
        }
        let authority_bytes: [u8; 32] = data[8..40]
            .try_into()
            .map_err(|_| CosplayError::InvalidData)?;
        let stored_authority = Pubkey::new_from_array(authority_bytes);

        require!(
            stored_authority == ctx.accounts.authority.key(),
            CosplayError::Unauthorized
        );

        let ledger = &mut ctx.accounts.ledger;
        ledger.claims = ledger
            .claims
            .checked_add(1)
            .ok_or(CosplayError::Overflow)?;

        msg!(
            "INSECURE claim #{} recorded for {} (type never verified)",
            ledger.claims,
            stored_authority
        );
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION (Recommended - Anchor Types)
    // ============================================================================
    ///
    /// ## SECURE: the discriminator is checked before the body runs
    ///
    /// `Account<'info, User>` proves the bytes are really a User: discriminator
    /// matches, owner is this program, shape deserializes. A Note presented
    /// here fails validation. The body never executes.
    ///
    pub fn claim_secure(ctx: Context<ClaimSecure>) -> Result<()> {
        // Anchor already verified: discriminator + owner + shape.
        let user = &ctx.accounts.user;

        require!(
            user.authority == ctx.accounts.authority.key(),
            CosplayError::Unauthorized
        );

        let ledger = &mut ctx.accounts.ledger;
        ledger.claims = ledger
            .claims
            .checked_add(1)
            .ok_or(CosplayError::Overflow)?;

        msg!(
            "SECURE claim #{} recorded for verified user {}",
            ledger.claims,
            user.authority
        );
        Ok(())
    }

    // ============================================================================
    // PANEL: both
    // REGISTRATION HELPERS
    // ============================================================================

    /// Register a genuine user (the victim runs this).
    pub fn register_user(ctx: Context<RegisterUser>) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.authority.key();
        user.bump = ctx.bumps.user;

        msg!("user registered for {}", user.authority);
        Ok(())
    }

    /// Register a note pointing at anyone (the attacker runs this to sew
    /// the costume: a Note whose first field holds their own key).
    pub fn register_note(ctx: Context<RegisterNote>) -> Result<()> {
        let note = &mut ctx.accounts.note;
        note.account = ctx.accounts.authority.key();
        note.bump = ctx.bumps.note;

        msg!("note registered pointing at {}", note.account);
        Ok(())
    }

    /// Open the reward ledger for demonstration.
    pub fn initialize_ledger(ctx: Context<InitializeLedger>) -> Result<()> {
        let ledger = &mut ctx.accounts.ledger;
        ledger.claims = 0;
        ledger.bump = ctx.bumps.ledger;

        msg!("ledger opened with 0 claims");
        Ok(())
    }
}

// ============================================================================
// ACCOUNT STRUCTURES
// ============================================================================

// PANEL: vuln
/// Insecure: the "user" is an unchecked account: any type with 40+ bytes fits.
#[derive(Accounts)]
pub struct ClaimInsecure<'info> {
    // INSECURE: no discriminator, no owner, no type. Bytes are bytes.
    /// CHECK: intentionally unchecked. This missing check IS the room.
    pub user: AccountInfo<'info>,
    #[account(mut)]
    pub ledger: Account<'info, Ledger>,
    pub authority: Signer<'info>,
}

// PANEL: fixed
/// Secure: only a genuine User passes validation.
#[derive(Accounts)]
pub struct ClaimSecure<'info> {
    // SECURE: discriminator + owner + shape verified pre-body.
    #[account(
        seeds = [b"user", authority.key().as_ref()],
        bump = user.bump,
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub ledger: Account<'info, Ledger>,
    pub authority: Signer<'info>,
}

// PANEL: both
#[derive(Accounts)]
pub struct RegisterUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + User::INIT_SPACE,
        seeds = [b"user", authority.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterNote<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Note::INIT_SPACE,
        seeds = [b"note", authority.key().as_ref()],
        bump,
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeLedger<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Ledger::INIT_SPACE,
        seeds = [b"ledger", authority.key().as_ref()],
        bump,
    )]
    pub ledger: Account<'info, Ledger>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// PANEL: both
// DATA STRUCTURES
// ============================================================================

/// Genuine user. Discriminator: sha256("account:User")[..8].
#[account]
#[derive(InitSpace)]
pub struct User {
    pub authority: Pubkey,
    pub bump: u8,
}

/// Note pointing at some account. SAME first field layout as User.
/// discriminator sha256("account:Note")[..8] is the only difference.
#[account]
#[derive(InitSpace)]
pub struct Note {
    pub account: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Ledger {
    /// Cumulative claims recorded.
    pub claims: u64,
    pub bump: u8,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum CosplayError {
    #[msg("Stored authority does not match signer")]
    Unauthorized,
    #[msg("Account data too short to parse")]
    InvalidData,
    #[msg("Arithmetic overflow occurred")]
    Overflow,
}

// ============================================================================
// SECURITY SUMMARY
// ============================================================================
//
// | Aspect           | Insecure                 | Secure                       |
// |------------------|--------------------------|------------------------------|
// | User account     | AccountInfo              | Account<User>                |
// | Discriminator    | never read               | verified pre-body            |
// | Owner check      | none                     | this program, automatic      |
// | Costume accepted | any 40+ byte account     | only genuine User            |
//
// RULE: never parse account bytes by hand. `Account<'info, T>` is the type
// check; manual deserialization without a discriminator compare is cosplay
// waiting for an audience.
// ============================================================================
