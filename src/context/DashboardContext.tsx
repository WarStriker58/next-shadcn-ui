"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Activity, Member, Project, Settings, Task } from "@/lib/types"
import { seedActivity, seedMembers, seedProjects, seedSettings, seedTasks } from "@/lib/seed"
import { newId } from "@/lib/api"

// ===== Forma del contexto =====
interface DashboardContextValue {
  projects: Project[]
  members: Member[]
  tasks: Task[]
  settings: Settings
  activity: Activity[]

  // Proyectos
  addProject: (data: Omit<Project, "id">, memberIds: string[]) => void
  updateProject: (id: string, data: Partial<Omit<Project, "id">>, memberIds?: string[]) => void
  deleteProject: (id: string) => void

  // Miembros
  addMember: (data: Omit<Member, "userId">) => void
  updateMember: (userId: string, data: Partial<Omit<Member, "userId">>) => void
  deleteMember: (userId: string) => void

  // Tareas
  addTask: (data: Omit<Task, "id">) => void
  updateTask: (id: string, data: Partial<Omit<Task, "id">>) => void
  deleteTask: (id: string) => void

  // Configuración
  updateSettings: (data: Settings) => void

  // Consultas útiles
  getProject: (id: string | null) => Project | undefined
  getMember: (userId: string | null) => Member | undefined
  getProjectMembers: (projectId: string) => Member[]
  getProjectTasks: (projectId: string) => Task[]
  getProjectProgress: (projectId: string) => number
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects)
  const [members, setMembers] = useState<Member[]>(seedMembers)
  const [tasks, setTasks] = useState<Task[]>(seedTasks)
  const [settings, setSettings] = useState<Settings>(seedSettings)
  const [activity, setActivity] = useState<Activity[]>(seedActivity)

  // Aplica el tema elegido en Configuración (clase .dark en <html>)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark")
  }, [settings.theme])

  // Registra un evento en "Actividad Reciente" (se muestran los más nuevos primero)
  const log = useCallback(
    (action: string, target: string) => {
      setActivity((prev) =>
        [{ id: newId("a"), user: settings.adminName, action, target, at: new Date().toISOString() }, ...prev].slice(0, 20),
      )
    },
    [settings.adminName],
  )

  // Asigna a un proyecto exactamente los miembros indicados.
  // Fuente única de verdad: member.projectId. Los que se desmarcan quedan sin proyecto.
  const syncProjectMembers = (projectId: string, memberIds: string[]) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (memberIds.includes(m.userId)) return { ...m, projectId }
        if (m.projectId === projectId) return { ...m, projectId: null }
        return m
      }),
    )
  }

  // ----- Proyectos -----
  const addProject: DashboardContextValue["addProject"] = (data, memberIds) => {
    const id = newId("p")
    setProjects((prev) => [{ id, ...data }, ...prev])
    syncProjectMembers(id, memberIds)
    log("creó el proyecto", data.name)
  }

  const updateProject: DashboardContextValue["updateProject"] = (id, data, memberIds) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
    if (memberIds) syncProjectMembers(id, memberIds)
    log("actualizó el proyecto", data.name ?? projects.find((p) => p.id === id)?.name ?? "")
  }

  const deleteProject: DashboardContextValue["deleteProject"] = (id) => {
    const name = projects.find((p) => p.id === id)?.name ?? ""
    setProjects((prev) => prev.filter((p) => p.id !== id))
    // En cascada: se eliminan sus tareas y sus miembros quedan sin proyecto
    setTasks((prev) => prev.filter((t) => t.projectId !== id))
    setMembers((prev) => prev.map((m) => (m.projectId === id ? { ...m, projectId: null } : m)))
    log("eliminó el proyecto", name)
  }

  // ----- Miembros -----
  const addMember: DashboardContextValue["addMember"] = (data) => {
    setMembers((prev) => [{ userId: newId("u"), ...data }, ...prev])
    log("agregó al miembro", data.name)
  }

  const updateMember: DashboardContextValue["updateMember"] = (userId, data) => {
    setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, ...data } : m)))
    log("actualizó al miembro", data.name ?? members.find((m) => m.userId === userId)?.name ?? "")
  }

  const deleteMember: DashboardContextValue["deleteMember"] = (userId) => {
    const name = members.find((m) => m.userId === userId)?.name ?? ""
    setMembers((prev) => prev.filter((m) => m.userId !== userId))
    // Sus tareas quedan "Sin asignar"
    setTasks((prev) => prev.map((t) => (t.userId === userId ? { ...t, userId: null } : t)))
    log("eliminó al miembro", name)
  }

  // ----- Tareas -----
  const addTask: DashboardContextValue["addTask"] = (data) => {
    setTasks((prev) => [{ id: newId("t"), ...data }, ...prev])
    log("creó la tarea", data.description)
  }

  const updateTask: DashboardContextValue["updateTask"] = (id, data) => {
    const current = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
    const completed = data.status === "Completado" && current?.status !== "Completado"
    log(completed ? "completó la tarea" : "actualizó la tarea", data.description ?? current?.description ?? "")
  }

  const deleteTask: DashboardContextValue["deleteTask"] = (id) => {
    const description = tasks.find((t) => t.id === id)?.description ?? ""
    setTasks((prev) => prev.filter((t) => t.id !== id))
    log("eliminó la tarea", description)
  }

  // ----- Configuración -----
  const updateSettings: DashboardContextValue["updateSettings"] = (data) => {
    setSettings(data)
    log("actualizó la", "configuración")
  }

  // ----- Consultas -----
  const value = useMemo<DashboardContextValue>(() => {
    const getProjectTasks = (projectId: string) => tasks.filter((t) => t.projectId === projectId)
    return {
      projects,
      members,
      tasks,
      settings,
      activity,
      addProject,
      updateProject,
      deleteProject,
      addMember,
      updateMember,
      deleteMember,
      addTask,
      updateTask,
      deleteTask,
      updateSettings,
      getProject: (id) => projects.find((p) => p.id === id),
      getMember: (userId) => members.find((m) => m.userId === userId),
      getProjectMembers: (projectId) => members.filter((m) => m.projectId === projectId),
      getProjectTasks,
      // Progreso = tareas completadas / total de tareas del proyecto
      getProjectProgress: (projectId) => {
        const list = getProjectTasks(projectId)
        if (list.length === 0) return 0
        return Math.round((list.filter((t) => t.status === "Completado").length / list.length) * 100)
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, members, tasks, settings, activity])

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard debe usarse dentro de <DashboardProvider>")
  return ctx
}
