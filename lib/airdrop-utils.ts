import { Connection, type PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

// List of known working devnet endpoints for airdrops
const AIRDROP_ENDPOINTS = ["https://api.devnet.solana.com", "https://api.testnet.solana.com"]

// Track endpoint usage to avoid hitting rate limits
const endpointLastUsed: Record<string, number> = {}
const ENDPOINT_COOLDOWN = 2000 // 2 seconds between requests to the same endpoint

/**
 * Implements exponential backoff for retrying requests
 * @param fn Function to retry
 * @param retries Number of retries
 * @param initialDelay Initial delay in ms
 * @returns Result of the function
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 1000): Promise<T> {
  let lastError: any

  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // If this is a rate limit error, wait longer
      const isRateLimit = error.message?.includes("429") || error.toString().includes("429")

      // Calculate delay with exponential backoff
      const delay = isRateLimit ? initialDelay * Math.pow(2, i) + Math.random() * 1000 : initialDelay

      console.log(`Request failed, retrying in ${Math.round(delay)}ms...`, error)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Get the best available endpoint with load balancing
 * @returns The best endpoint to use
 */
function getBestEndpoint(): string {
  const now = Date.now()

  // Find the endpoint that was used least recently
  let bestEndpoint = AIRDROP_ENDPOINTS[0]
  let oldestUse = now

  for (const endpoint of AIRDROP_ENDPOINTS) {
    const lastUsed = endpointLastUsed[endpoint] || 0
    if (lastUsed < oldestUse) {
      oldestUse = lastUsed
      bestEndpoint = endpoint
    }
  }

  // If the best endpoint was used recently, wait a bit
  const timeSinceLastUse = now - (endpointLastUsed[bestEndpoint] || 0)
  if (timeSinceLastUse < ENDPOINT_COOLDOWN) {
    console.log(`Waiting ${ENDPOINT_COOLDOWN - timeSinceLastUse}ms before using endpoint again`)
  }

  // Mark this endpoint as used
  endpointLastUsed[bestEndpoint] = now

  return bestEndpoint
}

/**
 * Request an airdrop with fallback to multiple endpoints
 * @param address The address to send SOL to
 * @param amount Amount in SOL
 * @returns The transaction signature or null if all attempts failed
 */
export async function requestDevnetAirdrop(
  address: PublicKey,
  amount: number,
): Promise<{ signature: string; success: boolean; error?: string }> {
  // Limit amount to 2 SOL (devnet limit)
  const solAmount = Math.min(amount, 2)
  const lamports = solAmount * LAMPORTS_PER_SOL

  // Try each endpoint until one works
  for (let attempt = 0; attempt < AIRDROP_ENDPOINTS.length * 2; attempt++) {
    // Get the best endpoint to use
    const endpoint = getBestEndpoint()

    try {
      console.log(`Attempting airdrop of ${solAmount} SOL to ${address.toString()} using ${endpoint}`)

      // Create a direct connection to the endpoint with rate limiting options
      const connection = new Connection(endpoint, {
        commitment: "confirmed",
        disableRetryOnRateLimit: true, // We'll handle retries ourselves
      })

      // Get initial balance for verification - with retry
      const initialBalance = await withRetry(() => connection.getBalance(address))
      console.log(`Initial balance: ${initialBalance / LAMPORTS_PER_SOL} SOL`)

      // Request the airdrop - with retry
      const signature = await withRetry(() => connection.requestAirdrop(address, lamports))
      console.log(`Airdrop requested with signature: ${signature}`)

      // Wait for confirmation - with retry and longer timeout
      const confirmation = await withRetry(() => connection.confirmTransaction(signature, "confirmed"), 3, 2000)

      if (confirmation.value.err) {
        console.error(`Airdrop confirmed but with error: ${confirmation.value.err}`)
        continue // Try next endpoint
      }

      // Wait a moment for the balance to update
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Verify the balance increased - with retry
      const newBalance = await withRetry(() => connection.getBalance(address))
      console.log(`New balance: ${newBalance / LAMPORTS_PER_SOL} SOL`)

      const balanceIncreased = newBalance > initialBalance

      if (balanceIncreased) {
        console.log(`Airdrop confirmed successfully on ${endpoint}`)
        return { signature, success: true }
      } else {
        console.log(`Airdrop confirmed but balance didn't increase on ${endpoint}`)
        // Continue to next endpoint if balance didn't increase
        continue
      }
    } catch (error: any) {
      // Check if this is a rate limit error
      if (error.message?.includes("429") || error.toString().includes("429")) {
        console.error(`Rate limit hit on ${endpoint}, cooling down...`)
        // Add extra cooldown for this endpoint
        endpointLastUsed[endpoint] = Date.now() + 10000 // 10 second cooldown
      } else {
        console.error(`Airdrop failed on ${endpoint}:`, error)
      }
      // Continue to next endpoint
    }
  }

  // All endpoints failed
  return {
    signature: "",
    success: false,
    error: "All airdrop attempts failed. The faucet may be rate-limited or temporarily unavailable.",
  }
}

/**
 * Check if an address has received an airdrop recently
 * @param address The address to check
 * @returns True if the address has received an airdrop in the last hour
 */
export async function hasRecentAirdrop(address: PublicKey): Promise<boolean> {
  try {
    // Use the best available endpoint
    const endpoint = getBestEndpoint()
    const connection = new Connection(endpoint, {
      commitment: "confirmed",
      disableRetryOnRateLimit: true,
    })

    // Get recent transactions with retry
    const signatures = await withRetry(() => connection.getSignaturesForAddress(address, { limit: 5 }))

    // Check if any transaction is an airdrop in the last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000

    for (const sig of signatures) {
      if (sig.blockTime && sig.blockTime * 1000 > oneHourAgo) {
        // This is a recent transaction, check if it's an airdrop
        try {
          const tx = await withRetry(() => connection.getTransaction(sig.signature))

          if (tx && tx.meta && tx.meta.logMessages) {
            const isAirdrop = tx.meta.logMessages.some(
              (log) => log.includes("program: System") && log.includes("transfer"),
            )
            if (isAirdrop) {
              return true
            }
          }
        } catch (error) {
          console.error("Error checking transaction:", error)
        }
      }
    }

    return false
  } catch (error) {
    console.error("Error checking for recent airdrops:", error)
    return false // Assume no recent airdrop if we can't check
  }
}
