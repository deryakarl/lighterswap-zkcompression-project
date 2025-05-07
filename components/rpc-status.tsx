"use client"

import { useState, useEffect } from "react"
import { Alert } from "@/components/ui/alert"
import { ZapIcon, CheckCircleIcon, RefreshCwIcon, ServerIcon } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { testRpcConnection, createRobustConnection, getNetworkName } from "@/lib/connection-utils"
import { FALLBACK_RPC_URLS } from "@/lib/constants"

export function RpcStatus() {
  const [mounted, setMounted] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  const [rpcConnected, setRpcConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [currentEndpoint, setCurrentEndpoint] = useState<string>("")
  const [networkName, setNetworkName] = useState<string>("Unknown")
  const [isLocal, setIsLocal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const wallet = useWallet()

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)

    // Check if we can connect to Solana
    const checkRpcConnection = async () => {
      setIsChecking(true)
      setErrorMessage(null)

      try {
        // Try to connect using our robust connection utility
        const { connection, endpoint, isLocal } = await createRobustConnection()

        setCurrentEndpoint(endpoint)
        setIsLocal(isLocal)
        setNetworkName(getNetworkName(endpoint))
        setRpcConnected(true)

        // If wallet is connected, we're not in demo mode
        setIsDemo(!(wallet && wallet.connected && wallet.publicKey))
      } catch (error) {
        console.error("Failed to check RPC status:", error)
        setRpcConnected(false)
        setIsDemo(true)

        // Set a user-friendly error message
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch")) {
            setErrorMessage("Network error: Cannot connect to RPC endpoint")
          } else {
            setErrorMessage(error.message)
          }
        } else {
          setErrorMessage("Unknown connection error")
        }
      } finally {
        setIsChecking(false)
      }
    }

    // Wrap in try-catch to ensure UI doesn't break if there's an error
    try {
      checkRpcConnection().catch((err) => {
        console.error("RPC connection check failed:", err)
        setRpcConnected(false)
        setIsDemo(true)
        setIsChecking(false)

        // Set a user-friendly error message
        if (err instanceof Error) {
          if (err.message.includes("Failed to fetch")) {
            setErrorMessage("Network error: Cannot connect to RPC endpoint")
          } else {
            setErrorMessage(err.message)
          }
        } else {
          setErrorMessage("Unknown connection error")
        }
      })
    } catch (error) {
      console.error("Error in RPC status check:", error)
      setRpcConnected(false)
      setIsDemo(true)
      setIsChecking(false)

      // Set a user-friendly error message
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("Unknown error")
      }
    }
  }, [wallet])

  // Function to manually retry connection
  const retryConnection = async () => {
    setIsChecking(true)
    setErrorMessage(null)

    try {
      // Try each endpoint in order
      for (const endpoint of FALLBACK_RPC_URLS) {
        const isConnected = await testRpcConnection(endpoint)
        if (isConnected) {
          setCurrentEndpoint(endpoint)
          setIsLocal(endpoint.includes("localhost"))
          setNetworkName(getNetworkName(endpoint))
          setRpcConnected(true)
          setIsDemo(!(wallet && wallet.connected && wallet.publicKey))
          break
        }
      }
    } catch (error) {
      console.error("Failed to retry connection:", error)
      setRpcConnected(false)
      setIsDemo(true)

      // Set a user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          setErrorMessage("Network error: Cannot connect to RPC endpoint")
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage("Unknown connection error")
      }
    } finally {
      setIsChecking(false)
    }
  }

  if (!mounted) return null

  if (isChecking) {
    return (
      <Alert
        className="bg-blue-900/20 border-blue-600/30"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}
      >
        <RefreshCwIcon className="h-4 w-4 animate-spin text-blue-400 mr-2" />
        <span className="text-sm">Checking connection...</span>
      </Alert>
    )
  }

  // Add null checks for wallet properties
  const isWalletConnected = wallet && wallet.connected && wallet.publicKey

  if (isWalletConnected && rpcConnected) {
    return (
      <Alert
        className="bg-green-900/20 border-green-600/30"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem" }}
      >
        <div className="flex items-center">
          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm">Connected to {networkName}</span>
          {isLocal && <ServerIcon className="h-3 w-3 text-green-400 ml-1" title="Local Validator" />}
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={retryConnection}>
          Change
        </Button>
      </Alert>
    )
  }

  if (rpcConnected) {
    return (
      <Alert
        className="bg-blue-900/20 border-blue-600/30"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem" }}
      >
        <div className="flex items-center">
          <ZapIcon className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm">Connected to {networkName}</span>
          {isLocal && <ServerIcon className="h-3 w-3 text-blue-400 ml-1" title="Local Validator" />}
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={retryConnection}>
          Change
        </Button>
      </Alert>
    )
  }

  // Return null to hide the error notification
  return null
}
