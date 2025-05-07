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
  CoinsIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionDetails } from "./transaction-details"
import type { CompressionMetrics } from "@/lib/types"

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
  type?: "swap" | "mint" | "compress"
  isCompressed?: boolean
  compressionMetrics?: CompressionMetrics
}

interface TransactionHistoryProps {
  transactions?: TransactionRecord[]
  tokens?: Array<{
    symbol: string
    name: string
    mint: string
    balance: string
    logo: string
  }>
}

export function TransactionHistory({ transactions = [], tokens = [] }: TransactionHistoryProps) {
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null)

  const getTokenLogo = (symbol: string) => {
    return tokens.find((t) => t.symbol === symbol)?.logo || "/placeholder.svg"
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
          <p>No transactions yet</p>
          <p className="text-sm mt-2">Your transactions will appear here</p>
        </CardContent>
      </Card>
    )
  }

  if (selectedTx) {
    return <TransactionDetails transaction={selectedTx} tokens={tokens} onBack={() => setSelectedTx(null)} />
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-zinc-900 rounded-lg p-3 cursor-pointer hover:bg-zinc-850"
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
                    {tx.type === "mint"
                      ? "Mint Token"
                      : tx.type === "compress"
                        ? "Compress Token"
                        : `Swap ${tx.fromToken} to ${tx.toToken}`}
                  </span>
                  {tx.isCompressed && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-900/30 text-purple-300 border border-purple-700/30 rounded">
                      ZK Compressed
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-400">{format(tx.timestamp, "MMM d, HH:mm")}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  {tx.type === "mint" || tx.type === "compress" ? (
                    <>
                      <CoinsIcon className="h-4 w-4 text-purple-400 mr-1" />
                      <span>
                        {tx.toAmount} {tx.toToken}
                      </span>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
                <div className="mt-1 flex items-center text-xs text-green-300">
                  <ZapIcon className="h-3 w-3 text-green-400 mr-1" />
                  <span>Gas saved: {tx.compressionMetrics.gasReduction}</span>
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
    </Card>
  )
}
