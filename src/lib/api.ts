// Simula la latencia de una petición al backend.
// Los componentes muestran un <Spinner /> mientras esta promesa se resuelve.
export function fakeRequest(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ===== Utilidades de fechas =====
// El Calendar trabaja con objetos Date; en memoria guardamos "yyyy-mm-dd".

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function fromISODate(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

// Formato fijo dd/mm/yyyy (no depende del idioma del navegador → sin errores de hidratación)
export function formatDate(value: string): string {
  if (!value) return "—"
  const [y, m, d] = value.split("-")
  return `${d}/${m}/${y}`
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
