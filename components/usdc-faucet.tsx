"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { ExternalLinkIcon, RefreshCwIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import { createRobustConnection } from "@/lib/connection-utils"
import {
  checkTokenAccount,
  createTokenAccountIfNeeded,
  getUsdcBalance,
  mintUsdcToWallet,
  DEVNET_USDC_MINT,
} from "@/lib/spl-token-utils"

export function UsdcFaucet() {
  const { toast } = useToast()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [lastTxSignature, setLastTxSignature] = useState<string | null>(null)

  // Check connection and fetch USDC balance when wallet changes
  useEffect(() => {
    const checkConnectionAndBalance = async () => {
      if (wallet.connected && wallet.publicKey) {
        setIsConnected(true)
        fetchUsdcBalance()
      } else {
        setIsConnected(false)
        setUsdcBalance(null)
      }
    }

    checkConnectionAndBalance()
  }, [wallet.connected, wallet.publicKey])

  // Fetch USDC balance
  const fetchUsdcBalance = async () => {
    if (!wallet.publicKey) return

    try {
      const balance = await getUsdcBalance(wallet.publicKey)
      setUsdcBalance(balance)
    } catch (error) {
      console.error("Error fetching USDC balance:", error)
      setUsdcBalance(null)
    }
  }

  // Request USDC tokens
  const requestUsdc = async (amount: number) => {
    if (!wallet.publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to request USDC",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setStatus("pending")

    try {
      // First, check if the token account exists
      const { connection } = await createRobustConnection()
      const { exists, address } = await checkTokenAccount(wallet.publicKey, DEVNET_USDC_MINT)

      if (!exists) {
        toast({
          title: "Creating Token Account",
          description: "Setting up your USDC token account...",
        })

        // Create the token account
        await createTokenAccountIfNeeded(wallet.publicKey, DEVNET_USDC_MINT, connection)
      }

      // Mint USDC to the wallet
      const result = await mintUsdcToWallet(wallet.publicKey, amount)

      if (result.success) {
        setStatus("success")
        setLastTxSignature(result.signature || null)

        // Update the balance
        setTimeout(() => {
          fetchUsdcBalance()
        }, 2000)

        toast({
          title: "USDC Received",
          description: (
            <div className="flex flex-col">
              <span>{result.message}</span>
              {result.signature && (
                <a
                  href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center"
                >
                  View on Solana Explorer
                  <ExternalLinkIcon className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          ),
        })
      } else {
        setStatus("error")
        toast({
          title: "Failed to get USDC",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting USDC:", error)
      setStatus("error")
      toast({
        title: "Failed to get USDC",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  // Get status UI
  const getStatusUI = () => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center justify-center space-x-2 bg-blue-900/20 rounded-lg p-2 mt-4">
            <RefreshCwIcon className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm">Processing request...</span>
          </div>
        )
      case "success":
        return (
          <div className="flex items-center justify-center space-x-2 bg-green-900/20 rounded-lg p-2 mt-4">
            <CheckCircleIcon className="h-4 w-4 text-green-400" />
            <span className="text-sm">USDC received successfully!</span>
          </div>
        )
      case "error":
        return (
          <div className="flex items-center justify-center space-x-2 bg-red-900/20 rounded-lg p-2 mt-4">
            <AlertTriangleIcon className="h-4 w-4 text-red-400" />
            <span className="text-sm">Failed to get USDC</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <Image src="/usdc-coins.png" alt="USDC" width={32} height={32} />
          </div>
          <div>
            <CardTitle>USDC Faucet</CardTitle>
            <CardDescription>Get USDC tokens for testing on Solana Devnet</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!wallet.connected ? (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Wallet not connected</AlertTitle>
            <AlertDescription>Please connect your wallet to request USDC tokens.</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between bg-zinc-900 rounded-lg p-3">
              <span className="text-sm text-zinc-400">Your USDC Balance</span>
              <span className="font-medium">{usdcBalance !== null ? usdcBalance.toFixed(2) : "Loading..."} USDC</span>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Request USDC</h3>
              <div className="grid grid-cols-3 gap-3">
                {[10, 25, 50].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="bg-zinc-800 hover:bg-zinc-700"
                    disabled={isLoading}
                    onClick={() => requestUsdc(amount)}
                  >
                    {amount} USDC
                  </Button>
                ))}
              </div>
            </div>

            {getStatusUI()}

            {lastTxSignature && (
              <div className="mt-4 text-center">
                <a
                  href={`https://explorer.solana.com/tx/${lastTxSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center"
                >
                  View Last Transaction on Solana Explorer
                  <ExternalLinkIcon className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col text-xs text-zinc-400 space-y-2">
        <p>This faucet provides USDC tokens on Solana Devnet for testing purposes only.</p>
        <p>These tokens have no real value and can only be used within the Solana Devnet environment.</p>
      </CardFooter>
    </Card>
  )
}
