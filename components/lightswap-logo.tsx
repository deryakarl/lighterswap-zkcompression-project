import { SunIcon, ZapIcon } from "lucide-react"

interface LightSwapLogoProps {
  size?: "sm" | "md" | "lg"
}

export function LightSwapLogo({ size = "md" }: LightSwapLogoProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  const iconSizes = {
    sm: { zap: 14, sun: 12 },
    md: { zap: 18, sun: 16 },
    lg: { zap: 24, sun: 20 },
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <div className="flex items-center space-x-1 font-semibold text-amber-300">
        <ZapIcon className="text-amber-400" width={iconSizes[size].zap} height={iconSizes[size].zap} />
        <span>Light</span>
        <SunIcon className="text-yellow-300" width={iconSizes[size].sun} height={iconSizes[size].sun} />
        <span>Swap</span>
      </div>
    </div>
  )
}
