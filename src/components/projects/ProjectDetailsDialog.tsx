"use client"

import { Eye } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDashboard } from "@/context/DashboardContext"
import { formatDate } from "@/lib/api"
import { CATEGORY_LABELS, type Project } from "@/lib/types"
import { initials, priorityVariant, projectStatusVariant, taskStatusVariant } from "@/lib/ui-helpers"

export function ProjectDetailsDialog({ project }: { project: Project }) {
  const { getProjectMembers, getProjectTasks, getProjectProgress, getMember } = useDashboard()
  const team = getProjectMembers(project.id)
  const projectTasks = getProjectTasks(project.id)
  const progress = getProjectProgress(project.id)
  const done = projectTasks.filter((t) => t.status === "Completado").length

  const info = [
    { label: "Categoría", value: CATEGORY_LABELS[project.category] },
    { label: "Inicio", value: formatDate(project.startDate) },
    { label: "Fin", value: formatDate(project.endDate) },
    { label: "Tareas", value: `${done} / ${projectTasks.length} completadas` },
  ]

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <Eye />
        Ver detalles
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-xl">{project.name}</DialogTitle>
            <Badge variant={projectStatusVariant(project.status)}>{project.status}</Badge>
            <Badge variant={priorityVariant(project.priority)}>Prioridad {project.priority}</Badge>
          </div>
          <DialogDescription>{project.description || "Sin descripción."}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {info.map((i) => (
            <div key={i.label} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{i.label}</p>
              <p className="text-sm font-medium">{i.value}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso (según tareas completadas)</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <section>
          <h4 className="mb-2 text-sm font-semibold">Equipo ({team.length})</h4>
          {team.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin miembros asignados.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {team.map((m) => (
                <div key={m.userId} className="flex items-center gap-3 rounded-lg border p-2">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.position} · {m.role}
                    </p>
                  </div>
                  {!m.isActive && <Badge variant="outline">Inactivo</Badge>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold">Tareas ({projectTasks.length})</h4>
          {projectTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este proyecto aún no tiene tareas.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {projectTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 p-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {getMember(t.userId)?.name ?? "Sin asignar"} · vence {formatDate(t.dateline)}
                    </p>
                  </div>
                  <Badge variant={taskStatusVariant(t.status)}>{t.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </DialogContent>
    </Dialog>
  )
}
