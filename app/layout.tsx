import type React from "react"
import "./globals.css"
import { Toaster } from "@/components/toaster"
import { WalletProvider } from "@/components/wallet-provider"

export const metadata = {
  title: "LightSwap | ZK Compressed Token Swap",
  description: "Swap tokens with ZK Compression on Solana",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
        <Toaster />
      </body>
    </html>
  )
}
