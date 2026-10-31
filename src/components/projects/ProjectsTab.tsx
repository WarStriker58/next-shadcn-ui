"use client"

import { useState } from "react"
import { CalendarDays, FolderKanban, ListChecks, Pencil, Plus, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConfirmDelete } from "@/components/shared/ConfirmDelete"
import { FormSelect } from "@/components/shared/FormSelect"
import { useDashboard } from "@/context/DashboardContext"
import { formatDate } from "@/lib/api"
import { CATEGORY_LABELS, PROJECT_STATUSES } from "@/lib/types"
import { initials, projectStatusVariant } from "@/lib/ui-helpers"
import { ProjectDetailsDialog } from "./ProjectDetailsDialog"
import { ProjectFormDialog } from "./ProjectFormDialog"

const statusFilterOptions = [{ value: "all", label: "Todos los estados" }, ...PROJECT_STATUSES.map((s) => ({ value: s, label: s }))]

export function ProjectsTab() {
  const { projects, deleteProject, getProjectMembers, getProjectTasks, getProjectProgress } = useDashboard()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const filtered = projects.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (p.name + " " + p.description).toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <FormSelect value={status} onChange={setStatus} options={statusFilterOptions} className="sm:w-48" />
        <ProjectFormDialog>
          <Plus />
          Nuevo Proyecto
        </ProjectFormDialog>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <FolderKanban className="size-10 text-muted-foreground" />
            <p className="font-medium">No hay proyectos para mostrar</p>
            <p className="text-sm text-muted-foreground">Crea uno nuevo o cambia los filtros.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const team = getProjectMembers(project.id)
            const taskCount = getProjectTasks(project.id).length
            const progress = getProjectProgress(project.id)
            return (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="truncate text-lg">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || "Sin descripción"}
                      </CardDescription>
                    </div>
                    <Badge variant={projectStatusVariant(project.status)}>{project.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ListChecks className="size-3.5" /> {taskCount} tareas
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {formatDate(project.endDate)}
                    </span>
                    <span>{CATEGORY_LABELS[project.category]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {team.slice(0, 4).map((m) => (
                        <Avatar key={m.userId} size="sm" className="ring-2 ring-card">
                          <AvatarFallback>{initials(m.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {team.length} {team.length === 1 ? "miembro" : "miembros"}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between gap-1">
                  <ProjectDetailsDialog project={project} />
                  <div className="flex gap-1">
                    <ProjectFormDialog project={project} variant="ghost" size="sm">
                      <Pencil />
                      Editar
                    </ProjectFormDialog>
                    <ConfirmDelete
                      title={`¿Eliminar "${project.name}"?`}
                      description={`Se eliminarán también sus ${taskCount} tareas y sus miembros quedarán sin proyecto. Esta acción no se puede deshacer.`}
                      onConfirm={() => deleteProject(project.id)}
                    />
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
