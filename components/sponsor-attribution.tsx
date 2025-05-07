import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export function SponsorAttribution() {
  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4 text-center">Powered By</h3>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 relative mb-2">
              <Image src="/placeholder.svg?key=7egpu" alt="Light Protocol" width={48} height={48} />
            </div>
            <h4 className="font-medium text-sm mb-1">Light Protocol</h4>
            <p className="text-xs text-zinc-400 text-center mb-2">ZK Compression Infrastructure</p>
            <Link
              href="https://www.lightprotocol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Learn More
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-12 w-12 relative mb-2">
              <Image src="/placeholder.svg?key=8md6x" alt="Helius" width={48} height={48} />
            </div>
            <h4 className="font-medium text-sm mb-1">Helius</h4>
            <p className="text-xs text-zinc-400 text-center mb-2">ZK Compression RPC Provider</p>
            <Link
              href="https://www.helius.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Learn More
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-12 w-12 relative mb-2">
              <Image src="/placeholder.svg?key=jpo9n" alt="Solana Foundation" width={48} height={48} />
            </div>
            <h4 className="font-medium text-sm mb-1">Solana Foundation</h4>
            <p className="text-xs text-zinc-400 text-center mb-2">Blockchain Infrastructure</p>
            <Link
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>
            This project was created for the ZK Compression hackathon track sponsored by Light Protocol, Helius, and the
            Solana Foundation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
