"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export function WalletButton() {
  const [error, setError] = useState<Error | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)

    // Add error handler for wallet adapter errors
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === "WalletConnectionError") {
        console.error("Wallet connection error:", event.error)
        setError(event.error)
        toast({
          title: "Wallet Connection Error",
          description: "Please try using demo mode instead.",
          variant: "destructive",
        })
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [toast])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) return null

  // If there was an error, show a fallback button
  if (error) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-red-900/20 border-red-600/30 text-red-400"
        onClick={() =>
          toast({
            title: "Wallet Connection Failed",
            description: "Please try using demo mode instead.",
            variant: "destructive",
          })
        }
      >
        Wallet Error
      </Button>
    )
  }

  // Render the wallet multi-button with custom styling
  return (
    <div className="wallet-adapter-button-wrapper">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 rounded-md text-sm !py-1 !px-3" />
    </div>
  )
}
