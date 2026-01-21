"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface TagsInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
}

const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  ({ className, value = [], onValueChange, placeholder, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault()
        const newValue = [...value, inputValue.trim()]
        onValueChange?.(newValue)
        setInputValue("")
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        const newValue = value.slice(0, -1)
        onValueChange?.(newValue)
      }
    }

    const handleRemove = (index: number) => {
      const newValue = value.filter((_, i) => i !== index)
      onValueChange?.(newValue)
    }

    return (
      <div className={cn("flex flex-wrap gap-2 rounded-md border border-input bg-background p-2", className)}>
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
      </div>
    )
  }
)

TagsInput.displayName = "TagsInput"

export { TagsInput }
