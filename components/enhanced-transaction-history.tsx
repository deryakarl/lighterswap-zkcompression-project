"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  ZapIcon,
  AlertTriangleIcon,
  ServerIcon,
  BarChart3Icon,
  TrendingDownIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionDetails } from "./transaction-details"
import { useWallet } from "@solana/wallet-adapter-react"
import type { TransactionRecord } from "@/components/transaction-history"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface EnhancedTransactionHistoryProps {
  transactions: TransactionRecord[]
  tokens: Array<{
    symbol: string
    name: string
    mint: string
    balance: string
    logo: string
  }>
  onBack: () => void
  isWalletConnected: boolean
}

export function EnhancedTransactionHistory({
  transactions,
  tokens,
  onBack,
  isWalletConnected,
}: EnhancedTransactionHistoryProps) {
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const wallet = useWallet()

  const getTokenLogo = (symbol: string) => {
    return tokens.find((t) => t.symbol === symbol)?.logo || "/placeholder.svg"
  }

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true
    if (activeTab === "compressed") return tx.isCompressed
    if (activeTab === "standard") return !tx.isCompressed
    return true
  })

  // Calculate compression stats
  const compressionStats = transactions.reduce(
    (acc, tx) => {
      if (tx.compressionMetrics) {
        acc.totalSaved += Number.parseFloat(tx.compressionMetrics.gasReduction || "0")
        acc.totalTransactions += 1
        acc.averageSavings = acc.totalSaved / acc.totalTransactions
      }
      return acc
    },
    { totalSaved: 0, totalTransactions: 0, averageSavings: 0 },
  )

  // Simulate refreshing transaction history
  const refreshTransactions = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  if (selectedTx) {
    return <TransactionDetails transaction={selectedTx} tokens={tokens} onBack={() => setSelectedTx(null)} />
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-zinc-400">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-zinc-700/30 rounded-full p-6">
              <BarChart3Icon className="h-12 w-12 text-zinc-500" />
            </div>
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Your ZK compressed swap transactions will appear here</p>
            {isWalletConnected ? (
              <p className="text-xs text-purple-400 mt-4">Try swapping some tokens to see compression benefits</p>
            ) : (
              <p className="text-xs text-purple-400 mt-4">Connect your wallet to start swapping with ZK compression</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-lg">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          Transaction History
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshTransactions} disabled={isLoading}>
            {isLoading ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <RefreshCwIcon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to Swap
          </Button>
        </div>
      </CardHeader>

      {transactions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="bg-zinc-900/50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400">Total Transactions</span>
                <span className="text-xl font-bold text-white">{compressionStats.totalTransactions}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400">Gas Saved</span>
                <span className="text-xl font-bold text-green-400">{compressionStats.totalSaved.toFixed(8)} SOL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400">Avg. Savings</span>
                <span className="text-xl font-bold text-purple-400">
                  {(compressionStats.averageSavings * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="compressed">Compressed</TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-zinc-900 rounded-lg p-3 cursor-pointer hover:bg-zinc-850 transition-colors"
              onClick={() => setSelectedTx(tx)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {tx.status === "success" ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <AlertTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    Swap {tx.fromToken} to {tx.toToken}
                  </span>
                  {tx.isCompressed && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-purple-900/30 text-purple-300 border-purple-700 text-xs"
                    >
                      ZK Compressed
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-zinc-400">{format(tx.timestamp, "MMM d, HH:mm")}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full overflow-hidden mr-1">
                    <Image
                      src={getTokenLogo(tx.fromToken) || "/placeholder.svg"}
                      alt={tx.fromToken}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span>{tx.fromAmount}</span>
                  <ArrowRightIcon className="h-3 w-3 mx-2 text-zinc-500" />
                  <div className="w-5 h-5 rounded-full overflow-hidden mr-1">
                    <Image
                      src={getTokenLogo(tx.toToken) || "/placeholder.svg"}
                      alt={tx.toToken}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span>{tx.toAmount}</span>
                </div>

                {tx.txSignature && (
                  <div className="flex items-center text-xs">
                    {tx.isSimulated ? (
                      <span className="text-yellow-400 font-mono">{tx.txSignature.substring(0, 6)}...</span>
                    ) : (
                      <Link
                        href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="font-mono">{tx.txSignature.substring(0, 6)}...</span>
                        <ExternalLinkIcon className="h-3 w-3 ml-1" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {tx.compressionMetrics && (
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center text-green-300">
                    <TrendingDownIcon className="h-3 w-3 mr-1" />
                    <span>Gas saved: {tx.compressionMetrics.gasReduction}</span>
                  </div>
                  <div className="flex items-center text-purple-300">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    <span>Compression: {tx.compressionMetrics.savingsPercentage}</span>
                  </div>
                </div>
              )}

              {tx.isSimulated ? (
                <div className="mt-1 flex items-center text-xs">
                  <AlertTriangleIcon className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-yellow-300">Demo transaction</span>
                </div>
              ) : (
                <div className="mt-1 flex items-center text-xs">
                  <ServerIcon className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-300">Devnet transaction</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2 pb-4">
        <div className="text-xs text-zinc-500">
          <p>Transactions are stored locally and will be cleared when you close your browser</p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to Swap
        </Button>
      </CardFooter>
    </Card>
  )
}
