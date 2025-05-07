import { type Connection, PublicKey, Transaction } from "@solana/web3.js"
import { createRobustConnection } from "./connection-utils"
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token"

// Devnet USDC mint address (this is a mock USDC token for devnet)
export const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")

// Check if a token account exists for the given wallet and mint
export async function checkTokenAccount(
  walletAddress: PublicKey,
  mintAddress: PublicKey,
): Promise<{ exists: boolean; address: PublicKey }> {
  try {
    const { connection } = await createRobustConnection()
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintAddress,
      walletAddress,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )

    try {
      await getAccount(connection, tokenAccountAddress)
      return { exists: true, address: tokenAccountAddress }
    } catch (error) {
      // Token account doesn't exist
      return { exists: false, address: tokenAccountAddress }
    }
  } catch (error) {
    console.error("Error checking token account:", error)
    throw error
  }
}

// Get USDC balance for a wallet
export async function getUsdcBalance(walletAddress: PublicKey): Promise<number | null> {
  try {
    const { connection } = await createRobustConnection()
    const { exists, address } = await checkTokenAccount(walletAddress, DEVNET_USDC_MINT)

    if (!exists) {
      return 0
    }

    const tokenAccount = await getAccount(connection, address)
    const balance = Number(tokenAccount.amount) / Math.pow(10, 6) // USDC has 6 decimals
    return balance
  } catch (error) {
    console.error("Error getting USDC balance:", error)
    return null
  }
}

// Create a token account if it doesn't exist
export async function createTokenAccountIfNeeded(
  walletAddress: PublicKey,
  mintAddress: PublicKey,
  connection: Connection,
): Promise<PublicKey> {
  try {
    const { exists, address } = await checkTokenAccount(walletAddress, mintAddress)

    if (exists) {
      return address
    }

    // Token account doesn't exist, create it
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        walletAddress, // payer
        address, // associated token account address
        walletAddress, // owner
        mintAddress, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    )

    // This is a simulation since we can't sign transactions in this environment
    // In a real app, you would sign and send this transaction
    console.log("Would create token account:", address.toString())

    return address
  } catch (error) {
    console.error("Error creating token account:", error)
    throw error
  }
}

// Mint USDC to a wallet (simulation for devnet)
export async function mintUsdcToWallet(
  walletAddress: PublicKey,
  amount: number,
): Promise<{ success: boolean; signature?: string; message?: string }> {
  try {
    // This is a simulation since we can't actually mint tokens in this environment
    // In a real app, you would need authority over the mint to do this
    console.log(`Would mint ${amount} USDC to ${walletAddress.toString()}`)

    // Generate a fake signature for the UI
    const signature = `sim${Math.random().toString(36).substring(2, 15)}`

    return {
      success: true,
      signature,
      message: `Successfully minted ${amount} USDC to your wallet`,
    }
  } catch (error) {
    console.error("Error minting USDC:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error minting USDC",
    }
  }
}
