"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LightProtocolClient } from "@/lib/light-protocol-client"
import { ZapIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import type { TokenData } from "@/lib/types"

interface CompressedTokenBalancesProps {
  tokens: TokenData[]
}

// Current approximate prices (as of May 2024)
const TOKEN_PRICES = {
  SOL: 170.0, // SOL price in USD
  BONK: 0.00002, // BONK price in USD
  USDC: 1.0, // USDC price in USD
}

// Mock balances for demo
const TOKEN_BALANCES = {
  SOL: "2.5",
  USDC: "150.00",
  BONK: "50,000,000",
}

export function CompressedTokenBalances({ tokens }: CompressedTokenBalancesProps) {
  const [balances, setBalances] = useState<Record<string, string>>(TOKEN_BALANCES)
  const [isLoading, setIsLoading] = useState(true)
  const [lightClient, setLightClient] = useState<LightProtocolClient | null>(null)

  // Initialize Light Protocol client
  useEffect(() => {
    const client = new LightProtocolClient()
    setLightClient(client)

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // Calculate USD values
  const getUsdValue = (symbol: string, balance: string): string => {
    const numericBalance = Number.parseFloat(balance.replace(/,/g, ""))
    const price = TOKEN_PRICES[symbol as keyof typeof TOKEN_PRICES] || 0
    const usdValue = numericBalance * price

    return usdValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          Compressed Token Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                    <Image src={token.logo || "/placeholder.svg"} alt={token.name} width={32} height={32} />
                  </div>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-xs text-zinc-400">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{balances[token.symbol] || "0.00"}</div>
                  <div className="text-xs text-zinc-400 flex items-center justify-end">
                    <ZapIcon className="h-3 w-3 mr-1 text-purple-400" />
                    <span>{getUsdValue(token.symbol, balances[token.symbol] || "0")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
