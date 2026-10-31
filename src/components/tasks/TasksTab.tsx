"use client"

import { useState } from "react"
import { ClipboardList, Pencil, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDelete } from "@/components/shared/ConfirmDelete"
import { FormSelect } from "@/components/shared/FormSelect"
import { TablePagination } from "@/components/shared/TablePagination"
import { useDashboard } from "@/context/DashboardContext"
import { formatDate, toISODate } from "@/lib/api"
import { TASK_STATUSES } from "@/lib/types"
import { priorityVariant, taskStatusVariant } from "@/lib/ui-helpers"
import { useNow } from "@/lib/use-now"
import { cn } from "@/lib/utils"
import { TaskFormDialog } from "./TaskFormDialog"

const statusFilterOptions = [{ value: "all", label: "Todos los estados" }, ...TASK_STATUSES.map((s) => ({ value: s, label: s }))]

export function TasksTab() {
  const { tasks, projects, settings, getProject, getMember, updateTask, deleteTask } = useDashboard()
  const now = useNow()
  const today = now ? toISODate(new Date(now)) : null

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [project, setProject] = useState("all")
  const [page, setPage] = useState(1)

  const projectOptions = [{ value: "all", label: "Todos los proyectos" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]

  // Al cambiar un filtro se vuelve a la página 1
  const withReset = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  const term = search.trim().toLowerCase()
  const filtered = tasks.filter(
    (t) =>
      (status === "all" || t.status === status) &&
      (project === "all" || t.projectId === project) &&
      t.description.toLowerCase().includes(term),
  )

  // ===== Paginación =====
  const perPage = settings.itemsPerPage
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, totalPages) // por si se eliminan tareas de la última página
  const start = (currentPage - 1) * perPage
  const pageItems = filtered.slice(start, start + perPage)

  const completed = tasks.filter((t) => t.status === "Completado").length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Tareas</CardTitle>
        <CardDescription>
          {tasks.length} tareas · {completed} completadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarea..."
              value={search}
              onChange={(e) => withReset(setSearch)(e.target.value)}
              className="pl-8"
            />
          </div>
          <FormSelect value={status} onChange={withReset(setStatus)} options={statusFilterOptions} className="lg:w-44" />
          <FormSelect value={project} onChange={withReset(setProject)} options={projectOptions} className="lg:w-52" />
          <TaskFormDialog>
            <Plus />
            Nueva tarea
          </TaskFormDialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <span className="sr-only">Completada</span>
                </TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Fecha límite</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <ClipboardList className="mx-auto mb-1 size-6" />
                    No hay tareas para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((task) => {
                  const done = task.status === "Completado"
                  const overdue = !done && today !== null && task.dateline < today
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        {/* Marca/desmarca la tarea como completada */}
                        <Checkbox
                          checked={done}
                          onCheckedChange={(c) => updateTask(task.id, { status: c ? "Completado" : "Pendiente" })}
                          aria-label="Marcar como completada"
                        />
                      </TableCell>
                      <TableCell className={cn("max-w-64 font-medium", done && "text-muted-foreground line-through")}>
                        <span className="line-clamp-2 whitespace-normal">{task.description}</span>
                      </TableCell>
                      <TableCell>{getProject(task.projectId)?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={taskStatusVariant(task.status)}>{task.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {getMember(task.userId)?.name ?? <span className="text-muted-foreground">Sin asignar</span>}
                      </TableCell>
                      <TableCell className={cn(overdue && "font-medium text-destructive")}>
                        {formatDate(task.dateline)}
                        {overdue && <span className="block text-xs">Vencida</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <TaskFormDialog task={task} variant="ghost" size="icon-sm">
                            <Pencil />
                            <span className="sr-only">Editar</span>
                          </TaskFormDialog>
                          <ConfirmDelete
                            title="¿Eliminar esta tarea?"
                            description={`"${task.description}" se eliminará de forma permanente.`}
                            onConfirm={() => deleteTask(task.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm whitespace-nowrap text-muted-foreground">
            {filtered.length === 0
              ? "Sin resultados"
              : `Mostrando ${start + 1}–${start + pageItems.length} de ${filtered.length}`}
          </p>
          <TablePagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </CardContent>
    </Card>
  )
}
