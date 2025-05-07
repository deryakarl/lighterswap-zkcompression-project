import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangleIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

export function AlternativeFaucetInfo() {
  return (
    <Card className="bg-zinc-800 border-zinc-700 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm">
          <AlertTriangleIcon className="h-4 w-4 text-yellow-400 mr-2" />
          Alternative Faucet Options
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="mb-2">If the built-in faucet is unavailable, you can try these alternatives to get Devnet SOL:</p>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="bg-zinc-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">1</span>
            <Link
              href="https://solfaucet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center"
            >
              SolFaucet.com
              <ExternalLinkIcon className="h-3 w-3 ml-1" />
            </Link>
          </li>
          <li className="flex items-center">
            <span className="bg-zinc-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">2</span>
            <Link
              href="https://faucet.solana.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center"
            >
              Official Solana Faucet
              <ExternalLinkIcon className="h-3 w-3 ml-1" />
            </Link>
          </li>
          <li className="flex items-center">
            <span className="bg-zinc-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">3</span>
            <span>Use the Solana CLI: </span>
            <code className="ml-1 bg-zinc-900 px-1 rounded text-xs">solana airdrop 1 YOUR_ADDRESS</code>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
