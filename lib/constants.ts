export const RPC_ENDPOINTS = {
  MAINNET: "https://api.mainnet-beta.solana.com",
  DEVNET: "https://devnet.helius-rpc.com/?api-key=79244a3a-52e3-45ab-a313-bb22bb6803a6",
}

// Valid ZK compressed signatures for demo purposes
// These are formatted to look like real Solana signatures but are for demo purposes
export const VALID_SIGNATURES = [
  "4ETf86tK5OfE9esQeXA8sFCUimBK38PTVpEBVZbjNZCZ4x4kNGxg3HPDdgzqVHZ7JfZu9AwxjR8N9LG9ztkqtjjG",
  "3vZ67CGoRYkuT76TtpP2VrtmQwwoBnNaEspnrPiJMPpZGUpMaVWXohHbJNjTHNsqVsKgzpkVSV5WfoRpuRHPnR2U",
  "4bqwGFAxLpNB3fgryJwQJPNVfgZNKMNz6kpMB4SXcmwVP3fJgpj3GfKTdWiSoMGWGANQqyEZYUxwXZRbCYrKGmZZ",
  "3HRgpZKvxDNAGsXjYxKQP5Qz5QJzWm6YAJULwLH8UPUpKQhLJ8QGLGFysCS3AstmZUCLYxsQNMMRYP9zWAFYSEVj",
  "2vJpzBFsHN5CkzEjSxpnMKXyJNHqXJjgLKgvmZCxLfd9DVzTvDDXYxmcQJKA1b9tRKUnKXVAJSG9jHjMQjpDwKqq",
  "5zkCompressedTxSignature111111111111111111111111111111111111111111111111",
  "5zkCompressedTxSignature222222222222222222222222222222222222222222222222",
  "5zkCompressedTxSignature333333333333333333333333333333333333333333333333",
  "5zkCompressedTxSignature444444444444444444444444444444444444444444444444",
  "5zkCompressedTxSignature555555555555555555555555555555555555555555555555",
]

// Fallback RPC URLs for robust connection
export const FALLBACK_RPC_URLS = [
  "https://api.devnet.solana.com",
  "https://devnet.helius-rpc.com/?api-key=79244a3a-52e3-45ab-a313-bb22bb6803a6",
]

// ZK Compression Savings
export const ZK_COMPRESSION_SAVINGS = {
  COMPRESSION_RATIO: 45,
  REGULAR_TX_SIZE: 1200,
  ZK_TX_SIZE: 25,
  REGULAR_TX_FEE: 0.000005,
  ZK_TX_FEE: 0.0000001,
}
