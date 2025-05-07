import { DEVNET_USDC_MINT } from "./spl-token-utils"
import type { TokenData } from "./types"

// Available tokens for swapping with realistic data
export const TOKENS: TokenData[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logo: "/sol-abstract.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: DEVNET_USDC_MINT.toString(), // Use the devnet USDC mint
    decimals: 6,
    logo: "/usdc-coins.png",
  },
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logo: "/bonk-comic-impact.png",
  },
]

// Current approximate prices (as of May 2024)
export const TOKEN_PRICES = {
  SOL: 170.0, // SOL price in USD
  BONK: 0.00002, // BONK price in USD
  USDC: 1.0, // USDC price in USD
}

// Mock balances for demo
export const TOKEN_BALANCES = {
  SOL: "2.5",
  USDC: "150.00",
  BONK: "50,000,000",
}
