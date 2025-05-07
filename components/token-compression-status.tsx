"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ZapIcon, CheckCircleIcon } from "lucide-react"
import { isTokenCompressed } from "@/lib/zk-compression-utils"
import type { TokenData } from "@/lib/types"
import Image from "next/image"

interface TokenCompressionStatusProps {
  tokens?: TokenData[]
}

export function TokenCompressionStatus({ tokens = [] }: TokenCompressionStatusProps) {
  const [compressedStatus, setCompressedStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check compression status for all tokens
    const status: Record<string, boolean> = {}
    if (tokens && tokens.length > 0) {
      tokens.forEach((token) => {
        status[token.symbol] = isTokenCompressed(token.mint)
      })
    }
    setCompressedStatus(status)
  }, [tokens])

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          ZK Compression Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tokens && tokens.length > 0 ? (
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
                <div className="flex items-center">
                  {compressedStatus[token.symbol] ? (
                    <div className="flex items-center bg-green-900/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      <span>Compressed</span>
                    </div>
                  ) : (
                    <div className="flex items-center bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-full">
                      <span>Standard</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-zinc-400">No tokens available to display</div>
        )}
        <div className="mt-4 text-xs text-zinc-400">
          <p>
            ZK compressed tokens use up to 50x less on-chain storage while maintaining the same security guarantees
            through zero-knowledge proofs.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
