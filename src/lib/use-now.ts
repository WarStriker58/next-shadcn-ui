"use client"

import { useSyncExternalStore } from "react"

// Hora actual compartida que se actualiza cada 30 s.
// En el servidor devuelve null: así lo que depende de "hoy" (vencidas, "Hace 5 min")
// solo se calcula en el navegador y no provoca errores de hidratación.

let now = Date.now()
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

function subscribe(callback: () => void) {
  now = Date.now()
  listeners.add(callback)
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 30_000)
  }
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  )
}
