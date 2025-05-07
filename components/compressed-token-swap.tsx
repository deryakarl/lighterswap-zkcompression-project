"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowDownIcon,
  RefreshCwIcon,
  HistoryIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  ZapIcon,
  SunIcon,
  VolumeIcon,
  Volume2Icon,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PublicKey, type Connection } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { LightProtocolClient } from "@/lib/light-protocol-client"
import type { TransactionRecord } from "@/components/transaction-history"
import { EnhancedTransactionHistory } from "@/components/enhanced-transaction-history"
import Image from "next/image"
import type { TokenData, CompressionMetrics } from "@/lib/types"
import { createRobustConnection } from "@/lib/connection-utils"
import { playSoundEffect } from "@/lib/sound-effects"
import { SwapSimulation } from "./swap-simulation"
import { getUsdcBalance, DEVNET_USDC_MINT } from "@/lib/spl-token-utils"

// Available tokens for swapping with realistic data
const TOKENS: TokenData[] = [
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
    mint: DEVNET_USDC_MINT.toString(),
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
const TOKEN_PRICES = {
  SOL: 170.0,
  BONK: 0.00002,
  USDC: 1.0,
}

// Mock balances for demo
const TOKEN_BALANCES = {
  SOL: "2.5",
  USDC: "150.00",
  BONK: "50,000,000",
}

// Define hardcoded values for compression savings
const REGULAR_TX_FEE = 0.000005 // SOL
const ZK_TX_FEE = 0.000000001 // SOL

// Add this at the top of the file, after the imports
const RATE_LIMIT_COOLDOWN = 2000 // 2 seconds between swap attempts

export function CompressedTokenSwap() {
  const { toast } = useToast()
  const wallet = useWallet()

  const [connection, setConnection] = useState<Connection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [fromToken, setFromToken] = useState<string>(TOKENS[0].symbol)
  const [toToken, setToToken] = useState<string>(TOKENS[1].symbol)
  const [amount, setAmount] = useState("")
  const [estimatedOutput, setEstimatedOutput] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lightClient, setLightClient] = useState<LightProtocolClient | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [mounted, setMounted] = useState(false)
  const [clientInitialized, setClientInitialized] = useState(false)
  const [useRealTransactions, setUseRealTransactions] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">(
    "idle",
  )
  const [slippageTolerance, setSlippageTolerance] = useState(0.5) // 0.5% default slippage tolerance
  const [isInitializing, setIsInitializing] = useState(true)
  const [feeComparison, setFeeComparison] = useState<{
    regular: string
    compressed: string
    savings: string
    savingsPercent: string
  }>({
    regular: "0.000005 SOL",
    compressed: "0.0000001 SOL",
    savings: "0.0000049 SOL",
    savingsPercent: "98%",
  })
  const [showSimulation, setShowSimulation] = useState(false)
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(TOKEN_BALANCES)
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [useCompression, setUseCompression] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  // Add animation state
  const [animationState, setAnimationState] = useState<"idle" | "darkening" | "lightening" | "success">("idle")

  // Initialize connection with improved error handling
  useEffect(() => {
    const initConnection = async () => {
      try {
        setIsInitializing(true)
        console.log("Initializing connection...")

        // Use our robust connection utility
        const { connection: conn, isConnected: connected, endpoint } = await createRobustConnection()

        setConnection(conn)
        setIsConnected(connected)

        if (!connected) {
          console.warn("Failed to connect to any RPC endpoint, running in demo mode")
          setConnectionError("Failed to connect to Solana network. Running in demo mode.")
          toast({
            title: "Connection Error",
            description: "Failed to connect to Solana network. Running in demo mode.",
            variant: "destructive",
          })
        } else {
          console.log(`Connected to ${endpoint}`)
          setConnectionError(null)
        }
      } catch (error) {
        console.error("Connection initialization error:", error)
        setIsConnected(false)
        setConnectionError(error instanceof Error ? error.message : "Unknown connection error")
        toast({
          title: "Connection Error",
          description: "Failed to connect to Solana. Running in demo mode.",
          variant: "destructive",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initConnection()
  }, [toast])

  // Initialize Light Protocol client
  useEffect(() => {
    try {
      const client = new LightProtocolClient()
      setLightClient(client)
      setClientInitialized(true)
    } catch (error) {
      console.error("Failed to initialize Light Protocol client:", error)
      toast({
        title: "Initialization Error",
        description: "Running in demo mode due to connection issues",
        variant: "destructive",
      })
    } finally {
      setMounted(true)
    }
  }, [toast])

  // Add this effect to fetch real USDC balance when wallet connects
  useEffect(() => {
    // Only run this effect if wallet is defined
    if (!wallet) return

    // Check if wallet is connected and has a public key
    if (wallet.connected && wallet.publicKey) {
      fetchUsdcBalance(wallet.publicKey)
    }
  }, [wallet]) // Only depend on the wallet object itself

  // Check if we can use real transactions
  useEffect(() => {
    // Only run this effect if wallet is defined
    if (!wallet) return

    // Add null checks for wallet properties
    const canUseRealTransactions =
      wallet.connected && wallet.publicKey && connection && isConnected && typeof wallet.signTransaction === "function"

    setUseRealTransactions(canUseRealTransactions)

    if (canUseRealTransactions) {
      console.log("Real transactions enabled with wallet:", wallet.publicKey.toString())
      // Remove any toast notifications from here
    }
  }, [wallet, connection, isConnected])

  // Calculate estimated output when amount or tokens change
  useEffect(() => {
    if (!amount || !clientInitialized) return

    const calculateEstimate = async () => {
      try {
        const fromTokenData = TOKENS.find((t) => t.symbol === fromToken)!
        const toTokenData = TOKENS.find((t) => t.symbol === toToken)!
        const inputAmount = Number.parseFloat(amount)

        // Calculate based on realistic token prices
        let outputAmount = 0

        // Convert based on USD values
        const fromValueInUsd = inputAmount * TOKEN_PRICES[fromToken as keyof typeof TOKEN_PRICES]
        const toTokenPrice = TOKEN_PRICES[toToken as keyof typeof TOKEN_PRICES]
        outputAmount = fromValueInUsd / toTokenPrice

        // Apply slippage for realism
        outputAmount *= 1 - slippageTolerance / 100

        // Format based on token decimals
        const formattedOutput = formatTokenAmount(outputAmount, toTokenData.decimals)
        setEstimatedOutput(formattedOutput)

        // Calculate fee comparison
        calculateFeeComparison(inputAmount)
      } catch (error) {
        console.error("Error calculating estimate:", error)
        setEstimatedOutput(null)
      }
    }

    calculateEstimate()
  }, [amount, fromToken, toToken, clientInitialized, slippageTolerance])

  // Calculate fee comparison
  const calculateFeeComparison = (inputAmount: number) => {
    // Base transaction fee on Solana
    const regularFee = REGULAR_TX_FEE

    // ZK compressed transaction fee (estimated)
    const compressedFee = ZK_TX_FEE

    // Calculate savings
    const savings = regularFee - compressedFee
    const savingsPercent = ((savings / regularFee) * 100).toFixed(0)

    setFeeComparison({
      regular: `${regularFee} SOL`,
      compressed: `${compressedFee} SOL`,
      savings: `${savings.toFixed(8)} SOL`,
      savingsPercent: `${savingsPercent}%`,
    })
  }

  // Format token amount based on decimals
  const formatTokenAmount = (amount: number, decimals: number): string => {
    if (amount >= 1) {
      return amount.toFixed(Math.min(decimals, 6))
    } else {
      // For small numbers, show more decimals
      return amount.toFixed(Math.min(decimals, 8))
    }
  }

  // Generate a unique ID for transactions
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Add this function to fetch USDC balance
  const fetchUsdcBalance = async (address: PublicKey) => {
    try {
      const balance = await getUsdcBalance(address)
      if (balance !== null) {
        // Update the USDC balance in tokenBalances
        setTokenBalances((prev) => ({
          ...prev,
          USDC: balance.toFixed(2),
        }))
      }
    } catch (error) {
      console.error("Error fetching USDC balance:", error)
    }
  }

  // Add this function after the fetchUsdcBalance function
  const addCustomToken = (mint: string, name: string, symbol: string, decimals: number) => {
    // Check if token already exists
    if (TOKENS.some((t) => t.mint === mint)) {
      toast({
        title: "Token already exists",
        description: `${symbol} is already in your token list`,
      })
      return
    }

    // Add the token to the list
    const newToken: TokenData = {
      symbol,
      name,
      mint,
      decimals,
      logo: "/digital-token.png", // Use placeholder for custom tokens
    }

    TOKENS.push(newToken)

    // Update token balances
    setTokenBalances((prev) => ({
      ...prev,
      [symbol]: "1000000000", // Default balance for newly minted tokens
    }))

    // Set the token as the "from" token
    setFromToken(symbol)

    toast({
      title: "Token Added",
      description: `${name} (${symbol}) has been added to your token list`,
    })
  }

  // Generate compression metrics for a transaction
  const generateCompressionMetrics = (amount: number): CompressionMetrics => {
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

    // Calculate regular fee
    const regularFee = "0.000005"

    // Calculate compressed fee
    const compressedFee = (0.000005 / (originalSize / compressedSize)).toFixed(8)

    // Calculate fee savings
    const feeSavings = (0.000005 - Number.parseFloat(compressedFee)).toFixed(8)

    return {
      compressionRatio: `${ratio}:1`,
      proofSize: `${compressedSize} bytes`,
      originalSize: `${originalSize} bytes`,
      compressedSize: `${compressedSize} bytes`,
      gasReduction: `${gasReduction} SOL`,
      savingsPercentage: `${savingsPercentage}%`,
      regularFee: `${regularFee} SOL`,
      compressedFee: `${compressedFee} SOL`,
      feeSavings: `${feeSavings} SOL`,
    }
  }

  // Handle token swap
  const handleSwap = async () => {
    if (!lightClient) {
      toast({
        title: "Client not initialized",
        description: "Please wait for the Light Protocol client to initialize",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTransactionStatus("pending")
    setShowSimulation(true)

    // Start animation sequence - first darkening
    setAnimationState("darkening")

    try {
      const fromTokenData = TOKENS.find((t) => t.symbol === fromToken)!
      const toTokenData = TOKENS.find((t) => t.symbol === toToken)!
      const parsedAmount = Number.parseFloat(amount)

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_COOLDOWN))

      // Generate compression metrics
      const compressionMetrics = generateCompressionMetrics(parsedAmount)

      // Check if wallet is connected for real transaction
      if (wallet && wallet.connected && wallet.publicKey && connection && isConnected) {
        // Rest of the code remains the same
        toast({
          title: "Processing Swap",
          description: "Preparing transaction...",
        })

        // Fetch liquidity pool information from devnet
        console.log("Fetching devnet liquidity pool information")

        // In a real implementation, we would fetch the actual pool data
        // For now, we'll simulate this step with a delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setTransactionStatus("confirming")

        // Change animation to lightening
        setAnimationState("lightening")

        // Use the wallet's public key
        const walletKey = wallet.publicKey

        // Execute the swap with the Light Protocol client
        const result = await lightClient.swapCompressedTokens(
          walletKey,
          fromTokenData.mint,
          toTokenData.mint,
          parsedAmount,
        )

        // Get the transaction signature
        const signature = result.signature
        const outputAmount = result.outputAmount || 0

        // Format the output amount
        const formattedOutput = formatTokenAmount(outputAmount, toTokenData.decimals)

        // Create a transaction record
        const txRecord: TransactionRecord = {
          id: generateId(),
          timestamp: new Date(),
          fromToken,
          toToken,
          fromAmount: amount,
          toAmount: formattedOutput,
          status: "success",
          txSignature: signature,
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
          networkFee: "0.000005 SOL",
          isSimulated: false,
          isLocal: false,
          isCompressed: useCompression,
          compressionMetrics: useCompression ? compressionMetrics : undefined,
        }

        // Add to transaction history
        setTransactions((prev) => [txRecord, ...prev])

        setTransactionStatus("success")

        // Set animation to success
        setAnimationState("success")

        // Play sound effect if enabled
        if (soundEnabled) {
          playSoundEffect("swap")
        }

        // Show success toast with link to explorer
        toast({
          title: "Swap Successful",
          description: (
            <div className="flex flex-col">
              <span>
                Swapped {amount} {fromToken} to {formattedOutput} {toToken}
              </span>
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 mt-1 flex items-center"
              >
                View on Solana Explorer
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </a>
            </div>
          ),
        })
      } else {
        // Demo mode - simulate transaction
        toast({
          title: "Processing Swap",
          description: "Simulating transaction...",
        })

        // Simulate transaction delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setTransactionStatus("confirming")

        // Change animation to lightening
        setAnimationState("lightening")

        // Simulate confirmation
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Use the mock transaction flow
        const defaultKey = new PublicKey("11111111111111111111111111111111")
        const walletKey = wallet?.publicKey || defaultKey

        const result = await lightClient.swapCompressedTokens(
          walletKey,
          fromTokenData.mint,
          toTokenData.mint,
          parsedAmount,
        )

        const signature = result.signature
        const outputAmount = result.outputAmount || 0

        setTransactionStatus("success")

        // Set animation to success
        setAnimationState("success")

        // Play sound effect if enabled
        if (soundEnabled) {
          playSoundEffect("swap")
        }

        // Format the output amount
        const formattedOutput = formatTokenAmount(outputAmount, toTokenData.decimals)

        // Create a transaction record
        const txRecord: TransactionRecord = {
          id: generateId(),
          timestamp: new Date(),
          fromToken,
          toToken,
          fromAmount: amount,
          toAmount: formattedOutput,
          status: "success",
          txSignature: signature,
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
          networkFee: "0.000005 SOL",
          isSimulated: true,
          isLocal: result.isLocal || false,
          isCompressed: useCompression,
          compressionMetrics: useCompression ? compressionMetrics : undefined,
        }

        // Add to transaction history
        setTransactions((prev) => [txRecord, ...prev])

        // Show success toast
        toast({
          title: "Swap Simulated",
          description: (
            <div className="flex flex-col">
              <span>
                Swapped {amount} {fromToken} to {formattedOutput} {toToken}
              </span>
              <span className="text-xs text-zinc-400 mt-1">Transaction simulated in demo mode</span>
            </div>
          ),
        })
      }

      // Reset form
      setAmount("")
      setEstimatedOutput(null)
    } catch (error: any) {
      console.error("Swap failed:", error)
      setTransactionStatus("error")
      setAnimationState("idle")

      // Play error sound if enabled
      if (soundEnabled) {
        playSoundEffect("error")
      }

      // Handle rate limit errors specifically
      let errorMessage = "Unknown error"
      if (error.message?.includes("429") || error.toString().includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait a few moments and try again."
      } else {
        errorMessage = error.message || "Unknown error"
      }

      toast({
        title: "Swap Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setTransactionStatus("idle")
        setAnimationState("idle")
      }, 3000)
    }
  }

  // Toggle sound effects
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  // Check if we're on devnet
  const checkDevnetConnection = async () => {
    if (!connection) return false

    try {
      const genesisHash = await connection.getGenesisHash()
      return genesisHash === "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG" // Devnet genesis hash
    } catch (error) {
      console.error("Failed to check network:", error)
      return false
    }
  }

  // Retry connection
  const retryConnection = async () => {
    setIsInitializing(true)
    setConnectionError(null)

    try {
      const { connection: conn, isConnected: connected, endpoint } = await createRobustConnection()

      setConnection(conn)
      setIsConnected(connected)

      if (connected) {
        toast({
          title: "Connection Restored",
          description: `Connected to ${endpoint}`,
        })
        setConnectionError(null)
      } else {
        toast({
          title: "Connection Failed",
          description: "Still unable to connect. Running in demo mode.",
          variant: "destructive",
        })
        setConnectionError("Failed to connect to Solana network. Running in demo mode.")
      }
    } catch (error) {
      console.error("Connection retry failed:", error)
      setIsConnected(false)
      setConnectionError(error instanceof Error ? error.message : "Unknown connection error")
      toast({
        title: "Connection Failed",
        description: "Still unable to connect. Running in demo mode.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  // Swap token positions
  const swapTokenPositions = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setAmount("")
    setEstimatedOutput(null)
  }

  // Get token data
  const getFromToken = () => TOKENS.find((t) => t.symbol === fromToken)!
  const getToToken = () => TOKENS.find((t) => t.symbol === toToken)!

  // Set max amount
  const setMaxAmount = () => {
    const balance = tokenBalances[fromToken as keyof typeof tokenBalances]
    setAmount(balance.replace(/,/g, ""))
  }

  // Toggle transaction history view
  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible)
  }

  // Get transaction status UI
  const getTransactionStatusUI = () => {
    switch (transactionStatus) {
      case "pending":
        return (
          <div className="flex items-center justify-center space-x-2 bg-amber-900/20 rounded-lg p-2 mt-2">
            <RefreshCwIcon className="h-4 w-4 animate-spin text-amber-400" />
            <span className="text-sm">Creating transaction...</span>
          </div>
        )
      case "confirming":
        return (
          <div className="flex items-center justify-center space-x-2 bg-amber-900/20 rounded-lg p-2 mt-2">
            <RefreshCwIcon className="h-4 w-4 animate-spin text-amber-400" />
            <span className="text-sm">Confirming transaction...</span>
          </div>
        )
      case "success":
        return (
          <div className="flex items-center justify-center space-x-2 bg-green-900/20 rounded-lg p-2 mt-2">
            <CheckCircleIcon className="h-4 w-4 text-green-400" />
            <span className="text-sm">Transaction confirmed!</span>
          </div>
        )
      case "error":
        return (
          <div className="flex items-center justify-center space-x-2 bg-red-900/20 rounded-lg p-2 mt-2">
            <AlertTriangleIcon className="h-4 w-4 text-red-400" />
            <span className="text-sm">Transaction failed</span>
          </div>
        )
      default:
        return null
    }
  }

  // Get animation class based on animation state
  const getAnimationClass = () => {
    switch (animationState) {
      case "darkening":
        return "bg-zinc-900 transition-colors duration-1000"
      case "lightening":
        return "bg-zinc-800 transition-colors duration-1000"
      case "success":
        return "bg-zinc-800 border-amber-500 transition-all duration-500"
      default:
        return "bg-zinc-800 transition-colors duration-300"
    }
  }

  if (!mounted || isInitializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCwIcon className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    )
  }

  if (isHistoryVisible) {
    return (
      <EnhancedTransactionHistory
        transactions={transactions}
        tokens={TOKENS.map((token) => ({
          ...token,
          balance: tokenBalances[token.symbol] || "0",
        }))}
        onBack={() => setIsHistoryVisible(false)}
        isWalletConnected={wallet && wallet.connected && wallet.publicKey ? true : false}
      />
    )
  }

  // Determine wallet connection status safely
  const isWalletConnected = wallet && wallet.connected && wallet.publicKey ? true : false

  return (
    <div className="space-y-4">
      {showSimulation && (
        <SwapSimulation
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={amount}
          toAmount={estimatedOutput || "0"}
          fromLogo={getFromToken().logo}
          toLogo={getToToken().logo}
          isActive={transactionStatus === "pending" || transactionStatus === "confirming"}
          onComplete={() => setShowSimulation(false)}
        />
      )}

      <div className="flex items-center justify-between mb-2">
        {isConnected ? (
          <div className="bg-green-900/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Connected to Solana Devnet
          </div>
        ) : (
          <div></div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className="h-8 w-8 p-0 rounded-full"
          title={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
        >
          {soundEnabled ? (
            <Volume2Icon className="h-4 w-4 text-amber-400" />
          ) : (
            <VolumeIcon className="h-4 w-4 text-zinc-500" />
          )}
        </Button>
      </div>

      <Card className={`w-full ${getAnimationClass()} border-zinc-700 overflow-hidden`}>
        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 h-1"></div>
        <CardContent className="p-4 space-y-4">
          {/* LightSwap Branding */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center space-x-1 text-sm text-amber-300">
              <ZapIcon className="h-4 w-4" />
              <span>Light</span>
              <SunIcon className="h-3 w-3 text-yellow-300" />
              <span>Swap</span>
            </div>
          </div>

          {/* ZK Compression Toggle */}
          <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg p-2">
            <div className="flex items-center">
              <ZapIcon className="h-4 w-4 text-amber-400 mr-2" />
              <span className="text-sm">ZK Compression</span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="toggle"
                id="compression-toggle"
                checked={useCompression}
                onChange={() => setUseCompression(!useCompression)}
                className="sr-only"
              />
              <label
                htmlFor="compression-toggle"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  useCompression ? "bg-amber-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                    useCompression ? "translate-x-4" : "translate-x-0"
                  }`}
                ></span>
              </label>
            </div>
          </div>

          {/* From Token */}
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 transition-all hover:border-amber-700">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-zinc-400">From</span>
              <div className="flex items-center">
                <span className="text-sm text-zinc-400">
                  Balance: {tokenBalances[fromToken as keyof typeof tokenBalances]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs ml-1 text-amber-400 hover:text-amber-300 p-0"
                  onClick={setMaxAmount}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="flex items-center">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-0 bg-transparent text-xl focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
              />
              <div className="flex-shrink-0">
                <div
                  className="flex items-center bg-zinc-800 rounded-lg p-2 cursor-pointer hover:bg-zinc-700 transition-colors"
                  onClick={() => {
                    // Open token selector (simplified for demo)
                    const nextToken =
                      TOKENS.find((t) => t.symbol !== fromToken && t.symbol !== toToken)?.symbol || TOKENS[0].symbol
                    setFromToken(nextToken)
                  }}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    <Image
                      src={getFromToken().logo || "/placeholder.svg"}
                      alt={getFromToken().name}
                      width={24}
                      height={24}
                    />
                  </div>
                  <span>{fromToken}</span>
                  <ArrowDownIcon className="h-4 w-4 ml-2 opacity-50" />
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 z-10 relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 h-8 w-8 shadow-lg transition-transform transform hover:scale-110"
              onClick={swapTokenPositions}
            >
              <ArrowDownIcon className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* To Token */}
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 transition-all hover:border-amber-700">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-zinc-400">To</span>
              <span className="text-sm text-zinc-400">
                Balance: {tokenBalances[toToken as keyof typeof tokenBalances]}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex-1 text-xl">{estimatedOutput || "0.00"}</div>
              <div className="flex-shrink-0">
                <div
                  className="flex items-center bg-zinc-800 rounded-lg p-2 cursor-pointer hover:bg-zinc-700 transition-colors"
                  onClick={() => {
                    // Open token selector (simplified for demo)
                    const nextToken =
                      TOKENS.find((t) => t.symbol !== toToken && t.symbol !== fromToken)?.symbol || TOKENS[0].symbol
                    setToToken(nextToken)
                  }}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    <Image
                      src={getToToken().logo || "/placeholder.svg"}
                      alt={getToToken().name}
                      width={24}
                      height={24}
                    />
                  </div>
                  <span>{toToken}</span>
                  <ArrowDownIcon className="h-4 w-4 ml-2 opacity-50" />
                </div>
              </div>
            </div>
          </div>

          {/* Rate */}
          {estimatedOutput && amount && (
            <div className="text-xs text-zinc-400 flex justify-between px-1">
              <span>Rate</span>
              <span>
                1 {fromToken} ≈ {(Number(estimatedOutput.replace(/,/g, "")) / Number(amount)).toFixed(6)} {toToken}
              </span>
            </div>
          )}

          {/* USD Values */}
          {amount && (
            <div className="text-xs text-zinc-400 flex justify-between px-1">
              <span>Value</span>
              <span>≈ ${(Number(amount) * TOKEN_PRICES[fromToken as keyof typeof TOKEN_PRICES]).toFixed(2)} USD</span>
            </div>
          )}

          {/* Compression Savings */}
          {useCompression && amount && (
            <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-800/30 rounded-lg p-2 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">ZK Compression Savings</span>
                <span className="text-green-400">{feeComparison.savingsPercent} gas saved</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Regular Fee:</span>
                  <span>{feeComparison.regular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Compressed Fee:</span>
                  <span className="text-green-400">{feeComparison.compressed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Slippage Settings */}
          <div className="text-xs text-zinc-400 flex justify-between px-1">
            <span>Slippage Tolerance</span>
            <div className="flex space-x-1">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  className={`px-2 py-1 rounded ${
                    slippageTolerance === value
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                  onClick={() => setSlippageTolerance(value)}
                >
                  {value}%
                </button>
              ))}
              <button
                className="px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600"
                onClick={() => {
                  const custom = prompt("Enter custom slippage (%):", "0.5")
                  if (custom) {
                    const value = Number.parseFloat(custom)
                    if (!isNaN(value) && value > 0 && value <= 5) {
                      setSlippageTolerance(value)
                    } else {
                      toast({
                        title: "Invalid Slippage",
                        description: "Slippage must be between 0.1% and 5%",
                        variant: "destructive",
                      })
                    }
                  }
                }}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Transaction Status */}
          {getTransactionStatusUI()}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 transition-all"
            disabled={!amount || isLoading || !lightClient || !estimatedOutput || transactionStatus !== "idle"}
            onClick={handleSwap}
          >
            {isLoading ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              "Swap"
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center transition-colors hover:bg-zinc-700"
            onClick={toggleHistory}
          >
            <HistoryIcon className="h-4 w-4 mr-2 text-amber-400" />
            {transactions.length > 0 ? `View Transaction History (${transactions.length})` : "Transaction History"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
