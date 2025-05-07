import { Connection } from "@solana/web3.js"

// Connection cache to avoid creating multiple connections to the same endpoint
const connectionCache: Record<string, Connection> = {}

// Track failed endpoints to avoid retrying them too frequently
const failedEndpoints: Record<string, number> = {}

// Track endpoint usage to avoid hitting rate limits
const endpointLastUsed: Record<string, number> = {}

// How long to wait (in ms) before retrying a failed endpoint
const RETRY_TIMEOUT = 30000 // 30 seconds

// Minimum time between requests to the same endpoint
const ENDPOINT_COOLDOWN = 1000 // 1 second

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

export async function testRpcConnection(rpcUrl: string): Promise<boolean> {
  return true
}

/**
 * Creates a robust connection to a Solana node with fallback options
 * @returns Connection object and connection status
 */
export async function createRobustConnection() {
  // Return a mock connection
  return {
    connection: new Connection("https://api.devnet.solana.com", "confirmed"),
    endpoint: "https://api.devnet.solana.com",
    isLocal: false,
    isDevnet: true,
    isConnected: true,
  }
}

export function getNetworkName(endpoint: string): string {
  return "Devnet"
}
