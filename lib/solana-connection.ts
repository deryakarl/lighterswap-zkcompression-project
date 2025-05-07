import { Connection, type ConnectionConfig } from "@solana/web3.js"
import { RPC_ENDPOINTS } from "./constants"

// Default to the provided Helius RPC URL
const DEFAULT_RPC_URL = "https://devnet.helius-rpc.com/?api-key=79244a3a-52e3-45ab-a313-bb22bb6803a6"

// Create a Solana connection with the appropriate RPC URL
export function createConnection(network: "mainnet" | "devnet" = "devnet"): Connection {
  // Use environment variable if available, otherwise use the default
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || (network === "mainnet" ? RPC_ENDPOINTS.MAINNET : RPC_ENDPOINTS.DEVNET)

  // Configure connection options for browser environment
  const config: ConnectionConfig = {
    commitment: "confirmed",
    disableRetryOnRateLimit: true,
  }

  // Add browser-specific fetch if we're in a browser environment
  if (typeof window !== "undefined") {
    config.fetch = window.fetch.bind(window)
  }

  try {
    return new Connection(rpcUrl, config)
  } catch (error) {
    console.error("Failed to create connection, falling back to default:", error)
    // Fall back to a known working endpoint
    return new Connection(DEFAULT_RPC_URL, config)
  }
}

// Export a default connection for convenience
export const connection = createConnection("devnet")
