// ===== Tipos del dominio del Dashboard =====
// Las fechas se guardan como texto "yyyy-mm-dd" para evitar
// problemas de zona horaria y de hidratación entre servidor y cliente.

export type ProjectStatus = "Planificado" | "En progreso" | "En revisión" | "Completado"
export type ProjectCategory = "web" | "mobile" | "design" | "marketing" | "other"
export type Priority = "Baja" | "Media" | "Alta" | "Urgente"

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  priority: Priority
  status: ProjectStatus
  startDate: string
  endDate: string
}

export type MemberRole = "Administrador" | "Líder" | "Miembro" | "Invitado"

export interface Member {
  userId: string
  role: MemberRole
  name: string
  email: string
  position: string
  birthdate: string
  phone: string
  projectId: string | null // un miembro pertenece a un proyecto (o a ninguno)
  isActive: boolean
}

export type TaskStatus = "Pendiente" | "En progreso" | "Completado"

export interface Task {
  id: string
  description: string
  projectId: string
  status: TaskStatus
  priority: Priority
  userId: string | null // null = sin asignar
  dateline: string
}

export interface Settings {
  companyName: string
  adminName: string
  adminEmail: string
  language: "es" | "en"
  timezone: string
  theme: "light" | "dark"
  itemsPerPage: number // usado por la paginación de Tareas
  emailNotifications: boolean
  weeklyReport: boolean
}

export interface Activity {
  id: string
  user: string
  action: string
  target: string
  at: string // fecha-hora ISO
}

// Etiquetas legibles para mostrar en la UI
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  web: "Desarrollo Web",
  mobile: "Desarrollo Mobile",
  design: "Diseño",
  marketing: "Marketing",
  other: "Otro",
}

export const PROJECT_STATUSES: ProjectStatus[] = ["Planificado", "En progreso", "En revisión", "Completado"]
export const PRIORITIES: Priority[] = ["Baja", "Media", "Alta", "Urgente"]
export const TASK_STATUSES: TaskStatus[] = ["Pendiente", "En progreso", "Completado"]
export const MEMBER_ROLES: MemberRole[] = ["Administrador", "Líder", "Miembro", "Invitado"]
