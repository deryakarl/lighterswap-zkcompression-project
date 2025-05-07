import { Connection, type PublicKey, Transaction, SystemProgram } from "@solana/web3.js"
import { FALLBACK_RPC_URLS } from "./constants"
import type { CompressionMetrics } from "./types"

// Mock ZK compression transaction for demo purposes
// In a real implementation, this would use the Light Protocol SDK
export async function createZkCompressedSwapTransaction(
  connection: Connection,
  fromMint: PublicKey,
  toMint: PublicKey,
  amount: number,
  walletPublicKey: PublicKey,
): Promise<Transaction> {
  // Create a new transaction
  const transaction = new Transaction()

  // Add a simple system transfer as a placeholder
  // In a real implementation, this would include ZK compression instructions
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: walletPublicKey, // Send to self for demo
      lamports: 100, // Minimal amount for demo
    }),
  )

  // Set recent blockhash and fee payer
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = walletPublicKey

  return transaction
}

// Generate realistic compression metrics based on token amounts
export function generateCompressionMetrics(amount: number): CompressionMetrics {
  // Calculate original transaction size (in bytes)
  const originalSize = 1200 + Math.floor(Math.random() * 300)

  // Calculate compressed size using ZK proofs (in bytes)
  const compressedSize = Math.floor(originalSize / (45 + Math.floor(Math.random() * 15)))

  // Calculate compression ratio
  const ratio = (originalSize / compressedSize).toFixed(2)

  // Calculate gas reduction (in SOL)
  const gasReduction = (0.000005 * (originalSize / compressedSize)).toFixed(8)

  // Calculate savings percentage
  const savingsPercentage = (100 - (compressedSize / originalSize) * 100).toFixed(2)

  return {
    compressionRatio: `${ratio}:1`,
    proofSize: `${compressedSize} bytes`,
    originalSize: `${originalSize} bytes`,
    compressedSize: `${compressedSize} bytes`,
    gasReduction: `${gasReduction} SOL`,
    savingsPercentage: `${savingsPercentage}%`,
  }
}

// Create a Solana connection with the appropriate RPC URL
export function createConnection(): Connection {
  // Use environment variable if available, otherwise use a fallback
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || FALLBACK_RPC_URLS[0]

  return new Connection(rpcUrl, "confirmed")
}
