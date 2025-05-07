"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ZapIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react"
import Image from "next/image"

interface SwapSimulationProps {
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  fromLogo: string
  toLogo: string
  isActive: boolean
  onComplete?: () => void
}

export function SwapSimulation({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  fromLogo,
  toLogo,
  isActive,
  onComplete,
}: SwapSimulationProps) {
  const [step, setStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Reset when props change
  useEffect(() => {
    if (isActive) {
      setStep(0)
      setIsComplete(false)
      simulateSwap()
    }
  }, [isActive, fromToken, toToken])

  const simulateSwap = async () => {
    if (!isActive) return

    // Step 1: Decompression
    setStep(1)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Step 2: Swap execution
    setStep(2)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Step 3: Compression
    setStep(3)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Complete
    setStep(4)
    setIsComplete(true)
    if (onComplete) onComplete()
  }

  if (!isActive) return null

  return (
    <Card className="bg-zinc-800 border-zinc-700 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          Swap Simulation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <Image src={fromLogo || "/placeholder.svg"} alt={fromToken} width={32} height={32} />
            </div>
            <div>
              <div className="font-medium">
                {fromAmount} {fromToken}
              </div>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-zinc-500 mx-2" />
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <Image src={toLogo || "/placeholder.svg"} alt={toToken} width={32} height={32} />
            </div>
            <div>
              <div className="font-medium">
                {toAmount} {toToken}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div
            className={`flex items-center p-2 rounded-md ${step >= 1 ? "bg-purple-900/20 border border-purple-600/30" : "bg-zinc-900"}`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${step >= 1 ? "bg-purple-600" : "bg-zinc-700"}`}
            >
              {step > 1 ? <CheckCircleIcon className="h-3 w-3" /> : "1"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Decompressing {fromToken}</div>
              <div className="text-xs text-zinc-400">Using ZK proofs to decompress token state</div>
            </div>
            {step === 1 && (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-purple-400 animate-spin"></div>
            )}
            {step > 1 && <CheckCircleIcon className="h-4 w-4 text-green-400" />}
          </div>

          <div
            className={`flex items-center p-2 rounded-md ${step >= 2 ? "bg-purple-900/20 border border-purple-600/30" : "bg-zinc-900"}`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${step >= 2 ? "bg-purple-600" : "bg-zinc-700"}`}
            >
              {step > 2 ? <CheckCircleIcon className="h-3 w-3" /> : "2"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Executing Swap</div>
              <div className="text-xs text-zinc-400">Swapping tokens via Jupiter DEX</div>
            </div>
            {step === 2 && (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-purple-400 animate-spin"></div>
            )}
            {step > 2 && <CheckCircleIcon className="h-4 w-4 text-green-400" />}
          </div>

          <div
            className={`flex items-center p-2 rounded-md ${step >= 3 ? "bg-purple-900/20 border border-purple-600/30" : "bg-zinc-900"}`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${step >= 3 ? "bg-purple-600" : "bg-zinc-700"}`}
            >
              {step > 3 ? <CheckCircleIcon className="h-3 w-3" /> : "3"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Compressing {toToken}</div>
              <div className="text-xs text-zinc-400">Generating ZK proof for compressed state</div>
            </div>
            {step === 3 && (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-purple-400 animate-spin"></div>
            )}
            {step > 3 && <CheckCircleIcon className="h-4 w-4 text-green-400" />}
          </div>

          {step === 4 && (
            <div className="flex items-center justify-center bg-green-900/20 border border-green-600/30 p-2 rounded-md mt-2">
              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm text-green-400">Swap completed successfully!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
