use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use light_protocol::state::compression::{CompressedTokenAccount, CompressedTokenInstruction};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod compressed_token_swap {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    // Swap compressed tokens
    pub fn swap_compressed_tokens(
        ctx: Context<SwapCompressedTokens>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        // 1. Decompress the input token
        let decompress_ix = CompressedTokenInstruction::decompress_token(
            ctx.accounts.user_authority.key(),
            ctx.accounts.from_compressed_token.key(),
            ctx.accounts.from_decompressed_token.key(),
            amount_in,
        );
        
        // Execute decompression instruction
        decompress_ix.invoke()?;
        
        // 2. Execute the swap (simplified for demonstration)
        // In a real implementation, this would call a DEX like Jupiter
        // Calculate the output amount (simplified)
        let amount_out = calculate_output_amount(amount_in)?;
        
        // Ensure the output amount meets the minimum requirement
        require!(
            amount_out >= minimum_amount_out,
            SwapError::SlippageExceeded
        );
        
        // Transfer tokens from the decompressed account to the protocol
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.from_decompressed_token.to_account_info(),
                    to: ctx.accounts.protocol_token_account.to_account_info(),
                    authority: ctx.accounts.user_authority.to_account_info(),
                },
            ),
            amount_in,
        )?;
        
        // Transfer tokens from the protocol to the user's decompressed output account
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.protocol_token_account.to_account_info(),
                    to: ctx.accounts.to_decompressed_token.to_account_info(),
                    authority: ctx.accounts.protocol_authority.to_account_info(),
                },
                &[&[b"protocol_authority", &[ctx.bumps.protocol_authority]]],
            ),
            amount_out,
        )?;
        
        // 3. Compress the output token
        let compress_ix = CompressedTokenInstruction::compress_token(
            ctx.accounts.user_authority.key(),
            ctx.accounts.to_decompressed_token.key(),
            ctx.accounts.to_compressed_token.key(),
            amount_out,
        );
        
        // Execute compression instruction
        compress_ix.invoke()?;
        
        // Record swap metrics for ZK compression
        let compression_metrics = CompressedTokenInstruction::get_compression_metrics()?;
        emit!(SwapCompletedEvent {
            user: ctx.accounts.user_authority.key(),
            from_token: ctx.accounts.from_compressed_token.key(),
            to_token: ctx.accounts.to_compressed_token.key(),
            amount_in,
            amount_out,
            compression_ratio: compression_metrics.compression_ratio,
            proof_size: compression_metrics.proof_size,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

// Helper function to calculate output amount
fn calculate_output_amount(amount_in: u64) -> Result<u64> {
    // In a real implementation, this would use price oracles or DEX quotes
    // For simplicity, we're using a fixed exchange rate
    // This would be replaced with actual price discovery logic
    Ok(amount_in.checked_mul(98).unwrap().checked_div(100).unwrap())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapCompressedTokens<'info> {
    #[account(mut)]
    pub user_authority: Signer<'info>,
    
    // Compressed token accounts
    #[account(mut)]
    pub from_compressed_token: Account<'info, CompressedTokenAccount>,
    #[account(mut)]
    pub to_compressed_token: Account<'info, CompressedTokenAccount>,
    
    // Temporary decompressed token accounts
    #[account(mut)]
    pub from_decompressed_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_decompressed_token: Account<'info, TokenAccount>,
    
    // Protocol accounts
    #[account(mut)]
    pub protocol_token_account: Account<'info, TokenAccount>,
    #[account(
        seeds = [b"protocol_authority"],
        bump,
    )]
    pub protocol_authority: AccountInfo<'info>,
    
    // Programs
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub light_protocol_program: AccountInfo<'info>,
}

#[event]
pub struct SwapCompletedEvent {
    pub user: Pubkey,
    pub from_token: Pubkey,
    pub to_token: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub compression_ratio: u64,
    pub proof_size: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum SwapError {
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}
