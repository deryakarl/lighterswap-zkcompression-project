import { ZapIcon } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-1 text-amber-400 mb-2 md:mb-0">
            <ZapIcon className="h-4 w-4" />
            <span className="text-sm">LightSwap</span>
          </div>

          <div className="text-xs text-zinc-500">Powered by Light Protocol ZK Compression</div>
        </div>
      </div>
    </footer>
  )
}
