"use client"
import { CompressedTokenSwap } from "@/components/compressed-token-swap"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Toaster } from "@/components/toaster"
import { WalletProvider } from "@/components/wallet-provider"
import { ZapIcon } from "lucide-react"

export default function Home() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 pt-20 pb-10">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <p className="text-amber-300 flex items-center justify-center gap-1">
                <ZapIcon className="h-4 w-4" /> Solana is now Lighter
              </p>
            </div>
            <CompressedTokenSwap />
          </div>
        </main>
        <AppFooter />
      </div>
      <Toaster />
    </WalletProvider>
  )
}
