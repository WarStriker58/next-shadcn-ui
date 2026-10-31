"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { es } from "react-day-picker/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate, fromISODate, toISODate } from "@/lib/api"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  id?: string
  value: string // "yyyy-mm-dd" o ""
  onChange: (value: string) => void
  placeholder?: string
  invalid?: boolean
  // Para fechas lejanas (ej. cumpleaños) muestra selectores de mes y año
  yearRange?: { from: number; to: number }
}

// Componente Calendar de shadcn dentro de un Popover
export function DatePicker({ id, value, onChange, placeholder = "Selecciona una fecha", invalid, yearRange }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = fromISODate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid || undefined}
            className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
          />
        }
      >
        <CalendarIcon />
        {value ? formatDate(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={selected}
          defaultMonth={selected}
          captionLayout={yearRange ? "dropdown" : "label"}
          startMonth={yearRange ? new Date(yearRange.from, 0) : undefined}
          endMonth={yearRange ? new Date(yearRange.to, 11) : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(toISODate(date))
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
