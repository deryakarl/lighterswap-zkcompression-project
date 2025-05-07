"use client"

import { useState, useEffect } from "react"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { RpcStatus } from "@/components/rpc-status"
import { ZapIcon, SunIcon } from "lucide-react"

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-zinc-900/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-amber-400">
          <ZapIcon className="h-5 w-5" />
          <SunIcon className="h-4 w-4 text-yellow-300" />
          <span className="font-semibold">LightSwap</span>
        </div>

        <div className="flex items-center space-x-2">
          <RpcStatus />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  )
}
