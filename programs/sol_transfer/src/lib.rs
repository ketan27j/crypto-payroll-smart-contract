use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

declare_id!("97TnPU6A3kfxNHTYSrcYr5VazJHEtDGt3NSnqionfAvo");

#[program]
pub mod sol_transfer {
    use super::*;
    
    pub fn transfer_sol(ctx: Context<TransferSol>, amount: u64, scheduled_time: i64) -> Result<()> {
        let clock = Clock::get()?;
        require!(clock.unix_timestamp < scheduled_time, CustomError::InvalidTime);

        // Create the transfer instruction
        let transfer_instruction = system_instruction::transfer(
            &ctx.accounts.sender.key(),
            &ctx.accounts.receiver.key(),
            amount,
        );

        // Invoke the transfer instruction
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.sender.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
            ],
        )?;
        msg!("transfer successful");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferSol<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is safe because we don't need to verify the account data
    pub receiver: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum CustomError {
    #[msg("Sheduled time must be in the future.")]
    InvalidTime,
}