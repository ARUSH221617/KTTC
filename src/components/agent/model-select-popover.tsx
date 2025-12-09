"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/agent/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/agent/ui/label"

interface Model {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
}

interface ModelSelectPopoverProps {
  models: Model[]
  selectedModelId: string
  onSelect: (modelId: string) => void
  label?: string
}

export function ModelSelectPopover({
  models,
  selectedModelId,
  onSelect,
  label
}: ModelSelectPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [maxPrice, setMaxPrice] = React.useState("")

  const selectedModel = models.find((model) => model.id === selectedModelId)

  const filteredModels = React.useMemo(() => {
    if (!maxPrice) return models
    return models.filter((model) => {
       const pricePerMillion = parseFloat(model.pricing.prompt) * 1000000;
       // Handle cases where pricing might be absent or malformed gracefully?
       // The interface says it exists.
       return !isNaN(pricePerMillion) && pricePerMillion <= parseFloat(maxPrice)
    })
  }, [models, maxPrice])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedModel ? selectedModel.name : `Select ${label}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2 border-b">
           <div className="flex items-center gap-2">
             <Label htmlFor={`max-price-${label?.replace(/\s+/g, '-')}`} className="whitespace-nowrap text-xs">Max Price ($/1M):</Label>
             <Input
                id={`max-price-${label?.replace(/\s+/g, '-')}`}
                className="h-8 text-xs"
                placeholder="e.g. 1.0"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
             />
           </div>
        </div>
        <Command>
          <CommandInput placeholder={`Search ${label}...`} />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {filteredModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.name + " " + model.id} // Searchable text
                  onSelect={() => {
                    onSelect(model.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedModelId === model.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                       ${(parseFloat(model.pricing.prompt) * 1000000).toFixed(2)}/1M
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
