"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { WalletIcon, LogOutIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import { Connection } from "@solana/web3.js"

export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const wallet = useWallet()

  // Track connection state and public key in local state
  const [isConnected, setIsConnected] = useState(false)
  const [publicKeyString, setPublicKeyString] = useState("")
  const [hasNotified, setHasNotified] = useState(false)

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update connection state when wallet changes
  useEffect(() => {
    if (mounted) {
      const connected = !!wallet?.connected
      const pubKey = wallet?.publicKey?.toString() || ""

      setIsConnected(connected)
      setPublicKeyString(pubKey)

      // Show connection notification
      if (connected && pubKey && !hasNotified) {
        // Verify we're on devnet
        const connection = new Connection("https://api.devnet.solana.com", "confirmed")
        connection
          .getGenesisHash()
          .then((hash) => {
            const isDevnet = hash === "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG" // Devnet genesis hash
            if (!isDevnet) {
              toast({
                title: "Network Warning",
                description: "Please ensure you're connected to Solana Devnet",
                variant: "destructive",
              })
            } else {
              toast({
                title: "Wallet Connected",
                description: `Connected to ${pubKey.slice(0, 4)}...${pubKey.slice(-4)} on Devnet`,
              })
              setHasNotified(true)
            }
          })
          .catch(() => {
            toast({
              title: "Network Error",
              description: "Could not verify Solana network",
              variant: "destructive",
            })
          })
      }

      // Reset notification state when disconnected
      if (!connected) {
        setHasNotified(false)
      }
    }
  }, [mounted, wallet?.connected, wallet?.publicKey, hasNotified, toast])

  // Handle disconnection
  const handleDisconnect = useCallback(async () => {
    try {
      if (wallet?.disconnect) {
        await wallet.disconnect()
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        })
      }
    } catch (err) {
      console.error("Disconnection error:", err)
      toast({
        title: "Disconnection Failed",
        description: err instanceof Error ? err.message : "Unknown disconnection error",
        variant: "destructive",
      })
    }
  }, [wallet, toast])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) return null

  // If connected, show the connected state
  if (isConnected && publicKeyString) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="bg-green-900/20 border-green-600/30 text-green-400">
          <WalletIcon className="h-4 w-4 mr-2" />
          {publicKeyString.slice(0, 4)}...{publicKeyString.slice(-4)}
          <span className="ml-1 text-xs text-green-300">(Devnet)</span>
        </Button>
        <Link
          href={`https://explorer.solana.com/address/${publicKeyString}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="sm" className="px-2">
            <ExternalLinkIcon className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleDisconnect} className="px-2">
          <LogOutIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Default state: not connected
  return <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 rounded-md text-sm" />
}
