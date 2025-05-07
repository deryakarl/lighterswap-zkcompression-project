"use client"

import { type ReactNode, useMemo, useState, useEffect } from "react"
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { useToast } from "@/components/ui/use-toast"

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // The network is set to 'devnet' for testing
  const network = WalletAdapterNetwork.Devnet

  // Use environment variable for RPC URL if available, otherwise use a reliable devnet RPC endpoint
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", [])

  // Initialize wallet adapters - removed BackpackWalletAdapter which isn't available
  const wallets = useMemo(() => {
    try {
      return [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })]
    } catch (error) {
      console.error("Failed to initialize wallet adapters:", error)
      return []
    }
  }, [network])

  // Handle wallet errors
  const onError = (error: Error) => {
    console.error("Wallet error:", error)
    toast({
      title: "Wallet Connection Error",
      description: error.message || "Failed to connect to wallet",
      variant: "destructive",
    })
  }

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render wallet provider until component is mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false} onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}
