import type { Activity, Member, Project, Settings, Task } from "./types"

// Datos iniciales en memoria (se reinician al recargar la página).
// IDs y fechas son fijos para que el servidor y el cliente rendericen lo mismo.

export const seedProjects: Project[] = [
  { id: "p1", name: "E-commerce Platform", description: "Plataforma de comercio electrónico con Next.js", category: "web", priority: "Alta", status: "En progreso", startDate: "2026-08-01", endDate: "2026-12-15" },
  { id: "p2", name: "Mobile App", description: "Aplicación móvil con React Native", category: "mobile", priority: "Media", status: "En revisión", startDate: "2026-07-10", endDate: "2026-11-30" },
  { id: "p3", name: "Dashboard Analytics", description: "Panel de análisis con visualizaciones", category: "web", priority: "Media", status: "Planificado", startDate: "2026-11-15", endDate: "2027-02-28" },
  { id: "p4", name: "API Gateway", description: "Microservicios con Node.js", category: "web", priority: "Urgente", status: "En progreso", startDate: "2026-09-01", endDate: "2026-12-20" },
  { id: "p5", name: "Design System", description: "Librería de componentes reutilizables", category: "design", priority: "Baja", status: "Completado", startDate: "2026-05-01", endDate: "2026-09-30" },
  { id: "p6", name: "Marketing Website", description: "Sitio web institucional", category: "marketing", priority: "Media", status: "En progreso", startDate: "2026-09-15", endDate: "2026-12-01" },
]

export const seedMembers: Member[] = [
  { userId: "u1", name: "María García", role: "Líder", position: "Frontend Developer", email: "maria@example.com", birthdate: "1995-03-12", phone: "987 654 321", projectId: "p1", isActive: true },
  { userId: "u2", name: "Juan Pérez", role: "Miembro", position: "Backend Developer", email: "juan@example.com", birthdate: "1993-07-25", phone: "912 345 678", projectId: "p4", isActive: true },
  { userId: "u3", name: "Ana López", role: "Miembro", position: "UI/UX Designer", email: "ana@example.com", birthdate: "1997-11-02", phone: "934 567 890", projectId: "p2", isActive: false },
  { userId: "u4", name: "Carlos Ruiz", role: "Líder", position: "DevOps Engineer", email: "carlos@example.com", birthdate: "1990-01-18", phone: "956 789 012", projectId: "p4", isActive: true },
  { userId: "u5", name: "Laura Martínez", role: "Administrador", position: "Project Manager", email: "laura@example.com", birthdate: "1988-09-30", phone: "978 901 234", projectId: "p1", isActive: true },
  { userId: "u6", name: "Diego Torres", role: "Miembro", position: "Mobile Developer", email: "diego@example.com", birthdate: "1996-05-14", phone: "945 612 378", projectId: "p2", isActive: true },
  { userId: "u7", name: "Sofía Ramírez", role: "Miembro", position: "Content Strategist", email: "sofia@example.com", birthdate: "1998-12-08", phone: "923 456 781", projectId: "p6", isActive: true },
]

export const seedTasks: Task[] = [
  { id: "t1", description: "Implementar autenticación", projectId: "p1", status: "En progreso", priority: "Alta", userId: "u1", dateline: "2026-11-15" },
  { id: "t2", description: "Diseñar pantalla de perfil", projectId: "p2", status: "Pendiente", priority: "Media", userId: "u3", dateline: "2026-11-20" },
  { id: "t3", description: "Configurar CI/CD", projectId: "p4", status: "Completado", priority: "Alta", userId: "u4", dateline: "2026-10-10" },
  { id: "t4", description: "Optimizar queries SQL", projectId: "p1", status: "En progreso", priority: "Urgente", userId: "u2", dateline: "2026-11-12" },
  { id: "t5", description: "Documentar API endpoints", projectId: "p4", status: "Pendiente", priority: "Baja", userId: "u5", dateline: "2026-11-25" },
  { id: "t6", description: "Carrito de compras", projectId: "p1", status: "Completado", priority: "Alta", userId: "u1", dateline: "2026-10-20" },
  { id: "t7", description: "Notificaciones push", projectId: "p2", status: "Completado", priority: "Media", userId: "u6", dateline: "2026-10-28" },
  { id: "t8", description: "Pruebas en dispositivos", projectId: "p2", status: "En progreso", priority: "Alta", userId: "u6", dateline: "2026-11-08" },
  { id: "t9", description: "Componentes base", projectId: "p5", status: "Completado", priority: "Media", userId: "u3", dateline: "2026-08-15" },
  { id: "t10", description: "Guía de estilos", projectId: "p5", status: "Completado", priority: "Baja", userId: "u3", dateline: "2026-09-20" },
  { id: "t11", description: "Redactar contenido home", projectId: "p6", status: "En progreso", priority: "Media", userId: "u7", dateline: "2026-11-05" },
  { id: "t12", description: "Rate limiting", projectId: "p4", status: "Pendiente", priority: "Urgente", userId: "u2", dateline: "2026-11-18" },
]

export const seedSettings: Settings = {
  companyName: "Tecsup Labs",
  adminName: "Laura Martínez",
  adminEmail: "laura@example.com",
  language: "es",
  timezone: "America/Lima",
  theme: "light",
  itemsPerPage: 5,
  emailNotifications: true,
  weeklyReport: false,
}

export const seedActivity: Activity[] = [
  { id: "a1", user: "María García", action: "completó la tarea", target: "Carrito de compras", at: "2026-10-30T18:20:00-05:00" },
  { id: "a2", user: "Diego Torres", action: "completó la tarea", target: "Notificaciones push", at: "2026-10-30T15:05:00-05:00" },
  { id: "a3", user: "Carlos Ruiz", action: "actualizó el proyecto", target: "API Gateway", at: "2026-10-29T11:40:00-05:00" },
]
