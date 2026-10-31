import type { Priority, ProjectStatus, TaskStatus } from "./types"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export function projectStatusVariant(status: ProjectStatus): BadgeVariant {
  switch (status) {
    case "Completado":
      return "default"
    case "En revisión":
    case "En progreso":
      return "secondary"
    default:
      return "outline"
  }
}

export function taskStatusVariant(status: TaskStatus): BadgeVariant {
  switch (status) {
    case "Completado":
      return "default"
    case "En progreso":
      return "secondary"
    default:
      return "outline"
  }
}

export function priorityVariant(priority: Priority): BadgeVariant {
  switch (priority) {
    case "Urgente":
      return "destructive"
    case "Alta":
      return "default"
    case "Media":
      return "secondary"
    default:
      return "outline"
  }
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

// "Hace 5 min", "Hace 2 h", "Hace 3 días"...
export function timeAgo(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Hace un momento"
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  return d === 1 ? "Hace 1 día" : `Hace ${d} días`
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
