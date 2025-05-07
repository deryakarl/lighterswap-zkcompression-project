"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ServerIcon, CheckCircleIcon } from "lucide-react"

export function LocalNodeIndicator() {
  const [isLocalNodeRunning, setIsLocalNodeRunning] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  useEffect(() => {
    // Disable local node checking completely to avoid unhandled promise rejections
    setIsLocalNodeRunning(false)
    setIsChecking(false)

    // The following code is commented out to prevent the error
    // If you want to re-enable local node checking, you can uncomment this code
    // and ensure all promises are properly caught
    /*
    const checkLocalNode = async () => {
      try {
        setIsChecking(true)
        
        // Skip the actual connection attempt to avoid errors
        // This is a safer approach for browser environments
        console.log("Local node check disabled")
        setIsLocalNodeRunning(false)
      } catch (error) {
        console.warn("Local node check error:", error)
        setIsLocalNodeRunning(false)
      } finally {
        setIsChecking(false)
      }
    }

    // Wrap in try/catch to prevent unhandled rejections
    try {
      checkLocalNode().catch(error => {
        console.warn("Error checking local node:", error)
        setIsLocalNodeRunning(false)
        setIsChecking(false)
      })
    } catch (error) {
      console.warn("Error in local node check:", error)
      setIsLocalNodeRunning(false)
      setIsChecking(false)
    }
    */
  }, [])

  // Don't render anything if we're checking or if no local node is running
  if (isChecking || !isLocalNodeRunning) return null

  return (
    <Alert className="bg-green-900/20 border-green-600/30 mb-4">
      <ServerIcon className="h-4 w-4 text-green-500 mr-2" />
      <AlertDescription className="flex items-center">
        <CheckCircleIcon className="h-3 w-3 text-green-400 mr-1" />
        <span>Connected to local Solana node</span>
      </AlertDescription>
    </Alert>
  )
}
