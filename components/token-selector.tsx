"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown } from "lucide-react"
import Image from "next/image"

interface Token {
  symbol: string
  name: string
  mint: string
  balance: string
  logo: string
}

interface TokenSelectorProps {
  tokens: Token[]
  selectedToken: string | null
  onSelect: (token: string) => void
  amount?: string
  onAmountChange?: (amount: string) => void
  readOnly?: boolean
  estimatedAmount?: string | null
}

export function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  amount,
  onAmountChange,
  readOnly = false,
  estimatedAmount = null,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken)

  return (
    <div className="flex items-center space-x-2 p-4 rounded-lg bg-zinc-900 border border-zinc-700">
      <div className="flex-1">
        {!readOnly ? (
          <Input
            type="number"
            placeholder="0.00"
            className="border-0 bg-transparent text-xl focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            value={amount}
            onChange={(e) => onAmountChange?.(e.target.value)}
          />
        ) : (
          <div className="text-xl">{estimatedAmount ? estimatedAmount : "0.00"}</div>
        )}

        {selectedTokenData && (
          <div className="text-sm text-zinc-400 mt-1">
            Balance: {selectedTokenData.balance} {selectedTokenData.symbol}
          </div>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="min-w-[140px] justify-between bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
          >
            {selectedTokenData ? (
              <div className="flex items-center">
                <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                  <Image
                    src={selectedTokenData.logo || "/placeholder.svg"}
                    alt={selectedTokenData.name}
                    width={24}
                    height={24}
                  />
                </div>
                {selectedTokenData.symbol}
              </div>
            ) : (
              "Select token"
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-zinc-800 border-zinc-700">
          <Command>
            <CommandInput placeholder="Search token..." className="h-9" />
            <CommandList>
              <CommandEmpty>No token found.</CommandEmpty>
              <CommandGroup>
                {tokens.map((token) => (
                  <CommandItem
                    key={token.mint}
                    onSelect={() => {
                      onSelect(token.symbol)
                      setOpen(false)
                    }}
                    className="flex items-center"
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                        <Image src={token.logo || "/placeholder.svg"} alt={token.name} width={24} height={24} />
                      </div>
                      <span>{token.symbol}</span>
                    </div>
                    {selectedToken === token.symbol && <Check className="h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
