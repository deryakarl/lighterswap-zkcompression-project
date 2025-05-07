export interface TokenData {
  symbol: string
  name: string
  mint: string
  decimals: number
  logo: string
}

export interface CompressionMetrics {
  compressionRatio: string
  proofSize: string
  originalSize: string
  compressedSize: string
  gasReduction: string
  savingsPercentage: string
  regularFee: string
  compressedFee: string
  feeSavings: string
}

export interface SwapResult {
  signature: string
  outputAmount: number
  fee: number
  success: boolean
  compressionMetrics: CompressionMetrics
  isLocal?: boolean
}

export interface TransactionRecord {
  id: string
  timestamp: Date
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  status: "success" | "failed"
  txSignature?: string
  explorerUrl?: string
  networkFee: string
  isSimulated: boolean
  isLocal: boolean
}
