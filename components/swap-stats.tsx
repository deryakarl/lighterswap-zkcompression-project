"use client"

import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SwapStatsProps {
  fromToken: string
  toToken: string
  amount: string
  estimatedOutput: string
}

export function SwapStats({ fromToken, toToken, amount, estimatedOutput }: SwapStatsProps) {
  // Calculate the exchange rate
  const rate = Number.parseFloat(estimatedOutput) / Number.parseFloat(amount)

  // In a real app, these would be calculated based on actual blockchain data
  const compressionSavings = "~99.98%"
  const gasFee = "0.000005 SOL"
  const slippage = "0.5%"

  // Jupiter URL for this swap
  const jupiterUrl = `https://jup.ag/swap/${fromToken}-${toToken}`

  return (
    <div className="space-y-3 p-3 rounded-lg bg-zinc-900/50 text-sm">
      <div className="flex justify-between">
        <span className="text-zinc-400">Rate</span>
        <span>
          1 {fromToken} <ArrowRightIcon className="inline h-3 w-3 mx-1" /> {rate.toFixed(6)} {toToken}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">Compression Savings</span>
        <span className="text-green-400">{compressionSavings}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">Network Fee</span>
        <span>{gasFee}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">Slippage Tolerance</span>
        <span>{slippage}</span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
        <span className="text-zinc-400">Powered by</span>
        <div className="flex items-center">
          <Image src="/jupiter-logo.png" alt="Jupiter" width={20} height={20} className="mr-1" />
          <Link
            href={jupiterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
          >
            Jupiter DEX
            <ExternalLinkIcon className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>

      <div className="pt-2 text-center">
        <Link
          href="https://www.lightprotocol.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 text-xs flex items-center justify-center"
        >
          Learn more about ZK Compression
          <ExternalLinkIcon className="h-3 w-3 ml-1" />
        </Link>
      </div>
    </div>
  )
}
