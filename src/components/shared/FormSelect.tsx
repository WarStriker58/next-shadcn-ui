"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
}

interface FormSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

// Select de shadcn (Base UI) simplificado.
// `items` permite que el trigger muestre la etiqueta ("Alta") y no el valor interno.
export function FormSelect({ id, value, onChange, options, placeholder, disabled, invalid, className }: FormSelectProps) {
  return (
    <Select
      items={options}
      value={value === "" ? null : value}
      onValueChange={(v) => {
        if (v !== null) onChange(v)
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn("w-full", className)} aria-invalid={invalid || undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
