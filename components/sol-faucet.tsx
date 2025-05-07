"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { CoinsIcon, RefreshCwIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { AlternativeFaucetInfo } from "./alternative-faucet-info"
import { requestDevnetAirdrop } from "@/lib/airdrop-utils"
import { ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

// Add this at the top of the file, after the imports
const RATE_LIMIT_COOLDOWN = 5000 // 5 seconds between airdrop attempts

export function SolFaucet() {
  const { toast } = useToast()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [customAddress, setCustomAddress] = useState("")
  const [amount, setAmount] = useState("0.05")

  // Update the requestAirdrop function to handle rate limiting
  const requestAirdrop = async () => {
    if (!wallet.connected && !customAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet or enter a custom address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setStatus("loading")

    try {
      // Get the target address
      let targetAddress: PublicKey
      try {
        targetAddress = customAddress ? new PublicKey(customAddress) : wallet.publicKey!
      } catch (error) {
        throw new Error("Invalid wallet address format")
      }

      // Convert SOL amount to lamports
      const solAmount = Number.parseFloat(amount)

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_COOLDOWN))

      // Request airdrop using our utility
      const result = await requestDevnetAirdrop(targetAddress, solAmount)

      if (result.success) {
        setStatus("success")

        // Show success toast without immediately checking balance
        toast({
          title: "Airdrop Requested",
          description: "Transaction sent successfully. Balance will update shortly.",
        })

        // Wait a moment before checking balance to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Verify the airdrop by checking balance, but don't block the UI
        try {
          const connection = new Connection("https://api.devnet.solana.com", {
            commitment: "confirmed",
            disableRetryOnRateLimit: true,
          })

          // Get the balance after the airdrop
          const balance = await connection.getBalance(targetAddress)

          toast({
            title: "Balance Updated",
            description: `Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
          })
        } catch (verifyError) {
          console.error("Error verifying balance:", verifyError)
          // Don't show an error toast here, as the airdrop might still have succeeded
        }
      } else {
        throw new Error(result.error || "Failed to request SOL from faucet")
      }
    } catch (error: any) {
      console.error("Airdrop failed:", error)
      setStatus("error")

      // Provide a more helpful error message
      let errorMessage = "Failed to request SOL from faucet"

      if (error.message?.includes("429") || error.toString().includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait a few minutes and try again."
      } else if (error.message?.includes("Invalid") || error.message?.includes("public key")) {
        errorMessage = "Invalid wallet address. Please check and try again."
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. The Solana network may be congested."
      } else {
        errorMessage = error.message || "Unknown error"
      }

      toast({
        title: "Airdrop Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      // Reset status after a delay
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  // Safely check if wallet is connected
  const isWalletConnected = wallet && wallet.connected && wallet.publicKey

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CoinsIcon className="h-5 w-5 text-purple-400 mr-2" />
          Devnet SOL Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-zinc-400">
          Request SOL tokens for testing on Solana Devnet. These tokens have no real value.
        </div>
        <div className="text-xs text-yellow-400 mt-1">
          Note: Devnet airdrops are limited to 2 SOL per request and may be rate-limited.
        </div>

        {!isWalletConnected && (
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm">
              Wallet Address
            </label>
            <Input
              id="address"
              placeholder="Enter Solana wallet address"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="bg-zinc-900 border-zinc-700"
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm">
            Amount (SOL)
          </label>
          <div className="flex space-x-2">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-900 border-zinc-700"
              min="0.01"
              max="1"
              step="0.01"
            />
            <div className="flex space-x-1">
              {[0.05, 0.1, 0.5].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(value.toString())}
                  className={amount === value.toString() ? "bg-purple-900/30 border-purple-600/30" : ""}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-2 bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm">SOL tokens sent successfully!</span>
            </div>
            <Link
              href={`https://explorer.solana.com/address/${customAddress || wallet.publicKey?.toString()}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
            >
              View wallet on Solana Explorer
              <ExternalLinkIcon className="h-3 w-3 ml-1" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center justify-center space-x-2 bg-red-900/20 rounded-lg p-2">
            <AlertTriangleIcon className="h-4 w-4 text-red-400" />
            <span className="text-sm">Failed to send SOL tokens</span>
          </div>
        )}
        <AlternativeFaucetInfo />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={requestAirdrop}
          disabled={isLoading || (!isWalletConnected && !customAddress)}
        >
          {isLoading ? (
            <>
              <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
              Requesting...
            </>
          ) : (
            "Request SOL"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
