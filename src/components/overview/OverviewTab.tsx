"use client"

import { AlarmClock, CheckCircle2, FolderKanban, UserCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { useDashboard } from "@/context/DashboardContext"
import { formatDate, toISODate } from "@/lib/api"
import { TASK_STATUSES } from "@/lib/types"
import { initials, priorityVariant, timeAgo } from "@/lib/ui-helpers"
import { useNow } from "@/lib/use-now"

// Todas las métricas se calculan a partir de los datos en memoria del contexto
export function OverviewTab() {
  const { projects, tasks, members, activity, getProject, getMember, getProjectProgress } = useDashboard()
  const now = useNow()
  const today = now ? toISODate(new Date(now)) : null

  const completedProjects = projects.filter((p) => p.status === "Completado").length
  const completedTasks = tasks.filter((t) => t.status === "Completado").length
  const openTasks = tasks.filter((t) => t.status !== "Completado")
  const overdue = today ? openTasks.filter((t) => t.dateline < today).length : 0
  const activeMembers = members.filter((m) => m.isActive).length
  const unassignedMembers = members.filter((m) => m.projectId === null).length
  const taskPct = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0

  const upcoming = [...openTasks].sort((a, b) => a.dateline.localeCompare(b.dateline)).slice(0, 5)
  const byProgress = [...projects]
    .map((p) => ({ project: p, progress: getProjectProgress(p.id) }))
    .sort((a, b) => b.progress - a.progress)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Proyectos"
          value={projects.length}
          hint={`${projects.length - completedProjects} activos · ${completedProjects} completados`}
          icon={FolderKanban}
        />
        <StatCard
          title="Tareas Completadas"
          value={`${completedTasks} / ${tasks.length}`}
          hint={`${taskPct}% de avance general`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Tareas Pendientes"
          value={openTasks.length}
          hint={today ? `${overdue} vencida(s)` : "Calculando vencidas..."}
          icon={AlarmClock}
        />
        <StatCard
          title="Miembros Activos"
          value={`${activeMembers} / ${members.length}`}
          hint={`${unassignedMembers} sin proyecto asignado`}
          icon={UserCheck}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progreso por proyecto</CardTitle>
            <CardDescription>Porcentaje de tareas completadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {byProgress.length === 0 && <p className="text-sm text-muted-foreground">No hay proyectos.</p>}
            {byProgress.map(({ project, progress }) => (
              <div key={project.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="truncate">{project.name}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas por estado</CardTitle>
            <CardDescription>Distribución de las {tasks.length} tareas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {TASK_STATUSES.map((status, i) => {
              const count = tasks.filter((t) => t.status === status).length
              const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{status}</span>
                    <span className="font-medium">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full" style={{ width: `${pct}%`, background: `var(--chart-${i + 2})` }} />
                  </div>
                </div>
              )
            })}

            <div className="pt-2">
              <h4 className="mb-2 text-sm font-semibold">Próximas fechas límite</h4>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay tareas pendientes. 🎉</p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{t.description}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {getProject(t.projectId)?.name} · {getMember(t.userId)?.name ?? "Sin asignar"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                        <span
                          className={
                            today && t.dateline < today ? "font-medium text-destructive" : "text-muted-foreground"
                          }
                        >
                          {formatDate(t.dateline)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Se actualiza con cada acción que realizas en el dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{initials(a.user)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-none font-medium">{a.user}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {a.action} <span className="font-medium text-foreground">{a.target}</span>
                  </p>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground">{now ? timeAgo(a.at, now) : ""}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
