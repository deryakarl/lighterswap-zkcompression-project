"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { RefreshCwIcon, CheckCircleIcon, AlertTriangleIcon, ExternalLinkIcon, ZapIcon } from "lucide-react"
import { createRobustConnection } from "@/lib/connection-utils"
import { compressTokens, decompressTokens } from "@/lib/light-protocol-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { PublicKey } from "@solana/web3.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TokenData } from "@/lib/types"

interface TokenCompressionControlsProps {
  tokens: TokenData[]
}

export function TokenCompressionControls({ tokens }: TokenCompressionControlsProps) {
  const { toast } = useToast()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [operation, setOperation] = useState<"compress" | "decompress">("compress")
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null)

  const handleOperation = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to perform this operation",
        variant: "destructive",
      })
      return
    }

    if (!selectedToken) {
      toast({
        title: "No token selected",
        description: "Please select a token to compress or decompress",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setStatus("processing")

    try {
      // Get connection
      const { connection } = await createRobustConnection()

      // Get token data
      const token = tokens.find((t) => t.mint === selectedToken)
      if (!token) {
        throw new Error("Token not found")
      }

      // Calculate amount with decimals
      const amountWithDecimals = Number(amount) * Math.pow(10, token.decimals)

      // Perform operation
      let txSignature: string
      if (operation === "compress") {
        toast({
          title: "Compressing Tokens",
          description: `Compressing ${amount} ${token.symbol} tokens...`,
        })

        txSignature = await compressTokens(connection, wallet.publicKey, new PublicKey(token.mint), amountWithDecimals)
      } else {
        toast({
          title: "Decompressing Tokens",
          description: `Decompressing ${amount} ${token.symbol} tokens...`,
        })

        txSignature = await decompressTokens(
          connection,
          wallet.publicKey,
          new PublicKey(token.mint),
          amountWithDecimals,
        )
      }

      setTransactionSignature(txSignature)
      setStatus("success")

      toast({
        title: operation === "compress" ? "Tokens Compressed" : "Tokens Decompressed",
        description: (
          <div className="flex flex-col">
            <span>
              {amount} {token.symbol} tokens have been {operation === "compress" ? "compressed" : "decompressed"}
            </span>
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center"
            >
              View on Solana Explorer
              <ExternalLinkIcon className="h-3 w-3 ml-1" />
            </a>
          </div>
        ),
      })
    } catch (error) {
      console.error("Operation failed:", error)
      setStatus("error")
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get status UI
  const getStatusUI = () => {
    switch (status) {
      case "processing":
        return (
          <div className="flex items-center justify-center space-x-2 bg-blue-900/20 rounded-lg p-2 mt-4">
            <RefreshCwIcon className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm">{operation === "compress" ? "Compressing" : "Decompressing"} tokens...</span>
          </div>
        )
      case "success":
        return (
          <div className="flex flex-col items-center justify-center space-y-2 bg-green-900/20 rounded-lg p-3 mt-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm">Operation completed successfully!</span>
            </div>
            {transactionSignature && (
              <Link
                href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
              >
                View transaction on Solana Explorer
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </Link>
            )}
          </div>
        )
      case "error":
        return (
          <div className="flex items-center justify-center space-x-2 bg-red-900/20 rounded-lg p-2 mt-4">
            <AlertTriangleIcon className="h-4 w-4 text-red-400" />
            <span className="text-sm">Operation failed</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          ZK Compression Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!wallet.connected ? (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Wallet not connected</AlertTitle>
            <AlertDescription>Please connect your wallet to use compression controls</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <Select value={operation} onValueChange={(value) => setOperation(value as "compress" | "decompress")}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compress">Compress Tokens</SelectItem>
                  <SelectItem value="decompress">Decompress Tokens</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Select value={selectedToken || ""} onValueChange={setSelectedToken}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.mint} value={token.mint}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
                min="0.000001"
              />
            </div>

            <div className="bg-purple-900/20 rounded-lg p-3 text-sm">
              <p>
                {operation === "compress"
                  ? "Compress your tokens using Light Protocol's ZK compression to reduce transaction costs and improve scalability."
                  : "Decompress your tokens back to regular SPL tokens for compatibility with all applications."}
              </p>
            </div>

            {getStatusUI()}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={handleOperation}
          disabled={isLoading || !wallet.connected || !selectedToken || !amount || Number(amount) <= 0}
        >
          {isLoading ? (
            <>
              <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : operation === "compress" ? (
            "Compress Tokens"
          ) : (
            "Decompress Tokens"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
