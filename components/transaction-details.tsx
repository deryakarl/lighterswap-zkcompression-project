"use client"

import { format } from "date-fns"
import { ArrowRightIcon, CheckCircleIcon, ExternalLinkIcon, AlertTriangleIcon, ServerIcon, ZapIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import type { TransactionRecord } from "./transaction-history"

interface TransactionDetailsProps {
  transaction: TransactionRecord
  tokens: Array<{
    symbol: string
    name: string
    mint: string
    balance: string
    logo: string
  }>
  onBack: () => void
}

export function TransactionDetails({ transaction, tokens, onBack }: TransactionDetailsProps) {
  const getTokenLogo = (symbol: string) => {
    return tokens.find((t) => t.symbol === symbol)?.logo || "/placeholder.svg"
  }

  const getTokenName = (symbol: string) => {
    return tokens.find((t) => t.symbol === symbol)?.name || symbol
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-lg">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          Transaction Details
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to History
        </Button>
      </CardHeader>

      {transaction.isSimulated && (
        <div className="px-4 mb-4">
          <Alert className="bg-yellow-900/20 border-yellow-600/30">
            <AlertTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
            <AlertDescription>
              This is a simulated transaction for demo purposes. The transaction may not be available on the Solana
              Explorer.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <CardContent className="space-y-6">
        {/* Basic Transaction Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Status</span>
            <div className="flex items-center">
              {transaction.status === "success" ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">Success</span>
                </>
              ) : (
                <>
                  <AlertTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500">Failed</span>
                </>
              )}
            </div>
          </div>

          {transaction.txSignature && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Transaction ID</span>
              <div className="flex items-center">
                <span className="font-mono text-sm">{transaction.txSignature.substring(0, 10)}...</span>
                {!transaction.isSimulated && (
                  <Link
                    href={`https://explorer.solana.com/tx/${transaction.txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1"
                  >
                    <ExternalLinkIcon className="h-3 w-3 text-blue-400" />
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Time</span>
            <span className="text-sm">{format(transaction.timestamp, "MMM d, yyyy HH:mm:ss")}</span>
          </div>

          {transaction.isCompressed && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Type</span>
              <span className="text-sm px-2 py-0.5 bg-purple-900/30 text-purple-300 border border-purple-700/30 rounded-full">
                ZK Compressed
              </span>
            </div>
          )}
        </div>

        {/* Token Transfer Details */}
        <div className="grid grid-cols-3 gap-2 items-center">
          <Card className="bg-zinc-900 border-zinc-700 p-3 text-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2">
              <Image
                src={getTokenLogo(transaction.fromToken) || "/placeholder.svg"}
                alt={transaction.fromToken}
                width={48}
                height={48}
              />
            </div>
            <div className="text-lg font-bold">{transaction.fromAmount}</div>
            <div className="text-sm text-zinc-400">{transaction.fromToken}</div>
            <div className="text-xs text-zinc-500">{getTokenName(transaction.fromToken)}</div>
          </Card>

          <div className="flex justify-center">
            <div className="bg-zinc-700 rounded-full p-2">
              <ArrowRightIcon className="h-6 w-6 text-zinc-400" />
            </div>
          </div>

          <Card className="bg-zinc-900 border-zinc-700 p-3 text-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2">
              <Image
                src={getTokenLogo(transaction.toToken) || "/placeholder.svg"}
                alt={transaction.toToken}
                width={48}
                height={48}
              />
            </div>
            <div className="text-lg font-bold">{transaction.toAmount}</div>
            <div className="text-sm text-zinc-400">{transaction.toToken}</div>
            <div className="text-xs text-zinc-500">{getTokenName(transaction.toToken)}</div>
          </Card>
        </div>

        {/* Transaction Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Network Fee</span>
            <span className="text-sm">{transaction.networkFee}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Network</span>
            <div className="flex items-center">
              <ServerIcon className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-sm">Solana Devnet</span>
            </div>
          </div>
        </div>

        {/* ZK Compression Metrics */}
        {transaction.isCompressed && transaction.compressionMetrics && (
          <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center">
              <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
              <span className="text-sm font-medium text-purple-300">ZK Compression Savings</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Regular Fee:</span>
                <span>{transaction.compressionMetrics.regularFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Compressed Fee:</span>
                <span className="text-green-400">{transaction.compressionMetrics.compressedFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Savings:</span>
                <span className="text-green-400">{transaction.compressionMetrics.feeSavings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Reduction:</span>
                <span className="text-green-400">{transaction.compressionMetrics.savingsPercentage}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Original Size:</span>
                <span>{transaction.compressionMetrics.originalSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Compressed Size:</span>
                <span>{transaction.compressionMetrics.compressedSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Compression Ratio:</span>
                <span className="text-purple-400">{transaction.compressionMetrics.compressionRatio}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2 pb-4">
        {!transaction.isSimulated && transaction.txSignature && (
          <Link
            href={`https://explorer.solana.com/tx/${transaction.txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            View on Solana Explorer
            <ExternalLinkIcon className="h-3 w-3 ml-1" />
          </Link>
        )}
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to History
        </Button>
      </CardFooter>
    </Card>
  )
}
