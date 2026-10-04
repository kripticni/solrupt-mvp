// Source: z0neSec/solsec-workshop (MIT) @ 15074547581430b866b81c56dd1fde98e9a7e13d, © z0neSec; ported for arena use, original license retained.
// Single-file layout is REQUIRED: Anchor `#[program]` generates code from this module tree.

//! # Arbitrary CPI: the callee your program trusts is caller-chosen
//!
//! ## Overview
//! A cross-program invocation (CPI) hands control to another program and
//! usually trusts the result. When the callee's address comes from an
//! unchecked account, the caller, not your code, picks who runs.
//!
//! ## The vulnerability
//! The insecure instruction invokes whatever program id it was handed, then
//! updates its books as if a real token release happened. An attacker hands it a
//! program that always returns Ok (in the wild: a fake token program they
//! deployed; in this hermetic lab: our own `ping`, which answers Ok to
//! anything). Books move, tokens never do.
//!
//! ## The fix
//! Type the callee as `Program<'info, Token>`. Anchor then verifies key ==
//! the real Token program id plus executable BEFORE your code runs. A manual
//! `key() != spl_token::ID` compare is the fallback shape.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, spl_token, Token, TokenAccount, Transfer};

declare_id!("HuKUtxW8Y6BWhfyXftZMS1BqENagBJzZFWMzjhx1tCFf");

#[program]
pub mod l3_cpi {
    use super::*;

    // ============================================================================
    // PANEL: vuln
    // VULNERABLE INSTRUCTION
    // ============================================================================
    ///
    /// ## INSECURE: callee is whatever account we were handed
    ///
    /// Attack scenario:
    /// 1. Vault holds 100 tokens of bookkeeping balance for a victim.
    /// 2. Attacker calls `release_insecure` with:
    ///    - token_program = a program that returns Ok to anything
    ///      (this lab: the room program itself, via `ping`; in the wild:
    ///      the attacker's own fake token program),
    ///    - amount = the whole balance, destination = themselves.
    /// 3. The invoke succeeds without moving any real token.
    /// 4. Books record a release that never happened; the attacker then
    ///    claims against the phantom credit.
    ///
    pub fn release_insecure(ctx: Context<ReleaseInsecure>, amount: u64) -> Result<()> {
        // VULNERABILITY: no check on WHICH program this invokes.
        // Success of the invoke is treated as proof tokens moved.
        let ping_ix = Instruction {
            program_id: ctx.accounts.token_program.key(),
            accounts: vec![],
            data: ping_data(),
        };
        invoke(&ping_ix, &[])?;

        let vault = &mut ctx.accounts.vault;
        require!(vault.balance >= amount, CpiError::InsufficientFunds);
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(CpiError::Overflow)?;
        vault.released = vault
            .released
            .checked_add(amount)
            .ok_or(CpiError::Overflow)?;

        msg!(
            "INSECURE release of {} recorded after invoking unverified program {}",
            amount,
            ctx.accounts.token_program.key()
        );
        Ok(())
    }

    // ============================================================================
    // PANEL: fixed
    // SECURE INSTRUCTION (Manual Check)
    // ============================================================================
    ///
    /// ## SECURE (manual): refuse any callee that is not the Token program
    ///
    /// Same shape as the insecure instruction, plus one explicit compare
    /// before the invoke. Secure, but every new call site must remember it.
    ///
    pub fn release_secure_manual(ctx: Context<ReleaseSecureManual>, amount: u64) -> Result<()> {
        // Manual verification: the callee must be the real SPL Token program.
        if ctx.accounts.token_program.key() != spl_token::ID {
            msg!(
                "refusing callee {}: expected {}",
                ctx.accounts.token_program.key(),
                spl_token::ID
            );
            return Err(CpiError::InvalidProgram.into());
        }

        let ping_ix = Instruction {
            program_id: ctx.accounts.token_program.key(),
            accounts: vec![],
            data: ping_data(),
        };
        invoke(&ping_ix, &[])?;

        let vault = &mut ctx.accounts.vault;
        require!(vault.balance >= amount, CpiError::InsufficientFunds);
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(CpiError::Overflow)?;
        vault.released = vault
            .released
            .checked_add(amount)
            .ok_or(CpiError::Overflow)?;

        msg!("SECURE (manual): callee verified, release of {} recorded", amount);
        Ok(())
    }

    // ============================================================================
    // SECURE INSTRUCTION (Recommended - Anchor Types)
    // ============================================================================
    ///
    /// ## SECURE (recommended): the type system names the callee
    ///
    /// `Program<'info, Token>` proves key == Token program id before the body
    /// runs, and the body performs a REAL token transfer instead of trusting
    /// a foreign return code. Books update only after real movement.
    ///
    pub fn release_secure(ctx: Context<ReleaseSecure>, amount: u64) -> Result<()> {
        // At this point Anchor has verified token_program is the Token program.
        let cpi_accounts = Transfer {
            from: ctx.accounts.source.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        token::transfer(cpi_ctx, amount)?;

        // Real tokens moved: now the books may follow.
        let vault = &mut ctx.accounts.vault;
        vault.released = vault
            .released
            .checked_add(amount)
            .ok_or(CpiError::Overflow)?;

        msg!("SECURE: real transfer of {} settled, books updated", amount);
        Ok(())
    }

    // ============================================================================
    // PANEL: both
    // HERMETIC STAND-IN + INITIALIZER
    // ============================================================================

    /// Harmless no-op. In this lab it plays the attacker's always-Ok fake
    /// program so no second program must be deployed: invoking the room
    /// program id with these bytes always succeeds, exactly like a fake
    /// token program would. A real attacker deploys their own.
    pub fn ping(_ctx: Context<Ping>) -> Result<()> {
        msg!("pong: stand-in callee answered Ok");
        Ok(())
    }

    /// Initialize a vault's books for demonstration.
    pub fn initialize_vault(ctx: Context<InitializeVault>, initial_balance: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.balance = initial_balance;
        vault.released = 0;
        vault.bump = ctx.bumps.vault;

        msg!(
            "vault books opened with {} for {}",
            initial_balance,
            vault.authority
        );
        Ok(())
    }
}

// 8-byte discriminator for `ping`: sha256("global:ping")[..8] =
// [173, 0, 94, 236, 73, 133, 225, 153] (computed off-chain; the verifier
// harness derives the same bytes independently at runtime, so any drift
// fails the solve transcript loudly instead of silently).
fn ping_data() -> Vec<u8> {
    vec![173, 0, 94, 236, 73, 133, 225, 153]
}

// ============================================================================
// ACCOUNT STRUCTURES
// ============================================================================

// PANEL: vuln
/// Insecure: the callee program is an unchecked account.
#[derive(Accounts)]
pub struct ReleaseInsecure<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,
    // INSECURE: any program id accepted, none verified.
    /// CHECK: intentionally unchecked. This missing check IS the room.
    pub token_program: AccountInfo<'info>,
}

// PANEL: fixed
/// Secure (manual): same accounts, verification lives in the instruction.
#[derive(Accounts)]
pub struct ReleaseSecureManual<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,
    /// CHECK: verified by explicit key compare in `release_secure_manual`.
    pub token_program: AccountInfo<'info>,
}

/// Secure (recommended): the callee type enforces the real Token program,
// plus the transfer moves real tokens out of a caller-owned source.
#[derive(Accounts)]
pub struct ReleaseSecure<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        constraint = source.owner == authority.key() @ CpiError::NotSourceOwner,
    )]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    // SECURE: key == Token program id + executable, enforced pre-body.
    pub token_program: Program<'info, Token>,
}

// PANEL: both
#[derive(Accounts)]
pub struct Ping {}

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
    /// Who the books belong to (display only in this room).
    pub authority: Pubkey,
    /// Bookkeeping balance awaiting release.
    pub balance: u64,
    /// Cumulative amount the program recorded as released.
    pub released: u64,
    /// PDA bump seed.
    pub bump: u8,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum CpiError {
    #[msg("Callee is not the expected program")]
    InvalidProgram,
    #[msg("Insufficient book balance for this release")]
    InsufficientFunds,
    #[msg("Arithmetic overflow occurred")]
    Overflow,
    #[msg("The source token account is not yours")]
    NotSourceOwner,
}

// ============================================================================
// SECURITY SUMMARY
// ============================================================================
//
// | Aspect           | Insecure                 | Secure (manual)      | Secure (anchor)        |
// |------------------|--------------------------|----------------------|--------------------------|
// | Callee type      | AccountInfo              | AccountInfo + check  | Program<Token>           |
// | Callee verified  | never                    | key == Token id      | pre-body, automatic      |
// | Token movement   | trusted return code      | trusted return code  | real transfer, then books|
// | Attack possible  | yes (any Ok program)     | no                   | no                       |
//
// RULE: name the callee in the type. `Program<'info, T>` for every known
// program; a checked whitelist only when the callee set is genuinely open.
// ============================================================================
