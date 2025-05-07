"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ZapIcon } from "lucide-react"

interface VisualizerProps {
  originalSize?: number
  compressedSize?: number
  animate?: boolean
}

export function CompressionVisualizer({ originalSize = 1200, compressedSize = 25, animate = true }: VisualizerProps) {
  const [showAnimation, setShowAnimation] = useState(animate)
  const [currentSize, setCurrentSize] = useState(originalSize)
  const ratio = (originalSize / compressedSize).toFixed(1)

  useEffect(() => {
    if (showAnimation) {
      const duration = 1500 // Animation duration in ms
      const steps = 30 // Number of animation steps
      const interval = duration / steps
      const sizeDecrement = (originalSize - compressedSize) / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const newSize = originalSize - sizeDecrement * step
        setCurrentSize(Math.max(newSize, compressedSize))

        if (step >= steps) {
          clearInterval(timer)
          setTimeout(() => {
            // Reset animation after a pause
            setCurrentSize(originalSize)
            setTimeout(() => {
              const resetTimer = setInterval(() => {
                step++
                const newSize = originalSize - sizeDecrement * step
                setCurrentSize(Math.max(newSize, compressedSize))

                if (step >= steps) {
                  clearInterval(resetTimer)
                }
              }, interval)
            }, 1000)
          }, 2000)
        }
      }, interval)

      return () => clearInterval(timer)
    }
  }, [showAnimation, originalSize, compressedSize])

  // Calculate the width percentage for the visualization
  const getWidthPercentage = (size: number) => {
    return Math.max((size / originalSize) * 100, 2) // Minimum 2% for visibility
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          ZK Compression Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Original Transaction Size</span>
              <span>{originalSize} bytes</span>
            </div>
            <div className="h-8 bg-zinc-900 rounded-md overflow-hidden">
              <div className="h-full bg-red-500 transition-all duration-300 ease-out" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ZK Compressed Size</span>
              <span>{compressedSize} bytes</span>
            </div>
            <div className="h-8 bg-zinc-900 rounded-md overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300 ease-out"
                style={{ width: `${getWidthPercentage(compressedSize)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Visualization</span>
              <span>{Math.round(currentSize)} bytes</span>
            </div>
            <div className="h-8 bg-zinc-900 rounded-md overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${getWidthPercentage(currentSize)}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg text-center">
            <span className="text-2xl font-bold text-purple-400">{ratio}:1</span>
            <p className="text-sm text-zinc-400 mt-1">Compression Ratio</p>
          </div>

          <div className="text-sm text-zinc-400">
            <p>
              ZK Compression reduces on-chain storage requirements by up to 50x while maintaining the same security
              guarantees through zero-knowledge proofs.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
