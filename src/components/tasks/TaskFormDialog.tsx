"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/shared/DatePicker"
import { FormErrors } from "@/components/shared/FormAlerts"
import { FormSelect } from "@/components/shared/FormSelect"
import { useDashboard } from "@/context/DashboardContext"
import { fakeRequest, toISODate } from "@/lib/api"
import { PRIORITIES, TASK_STATUSES, type Priority, type Task, type TaskStatus } from "@/lib/types"

type ButtonProps = React.ComponentProps<typeof Button>

interface TaskFormDialogProps {
  task?: Task
  children: ReactNode
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

interface FormState {
  description: string
  projectId: string
  status: string
  priority: string
  userId: string // "none" = sin asignar
  dateline: string
}

const emptyForm: FormState = {
  description: "",
  projectId: "",
  status: "Pendiente",
  priority: "",
  userId: "none",
  dateline: "",
}

const statusOptions = TASK_STATUSES.map((s) => ({ value: s, label: s }))
const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: p }))

export function TaskFormDialog({ task, children, variant = "default", size = "default" }: TaskFormDialogProps) {
  const { projects, addTask, updateTask, getProjectMembers } = useDashboard()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }))
  // Solo se puede asignar a miembros activos del proyecto elegido
  const assignable = form.projectId ? getProjectMembers(form.projectId).filter((m) => m.isActive) : []
  const userOptions = [
    { value: "none", label: "Sin asignar" },
    ...assignable.map((m) => ({ value: m.userId, label: `${m.name} · ${m.position}` })),
  ]

  function handleOpenChange(next: boolean) {
    if (loading) return
    if (next) {
      setForm(task ? { ...task, userId: task.userId ?? "none" } : emptyForm)
      setErrors([])
    }
    setOpen(next)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  // Al cambiar de proyecto, se limpia el responsable si no pertenece al nuevo proyecto
  function changeProject(projectId: string) {
    const stillValid = getProjectMembers(projectId).some((m) => m.userId === form.userId)
    setForm((f) => ({ ...f, projectId, userId: stillValid ? f.userId : "none" }))
  }

  function validate(): string[] {
    const e: string[] = []
    if (form.description.trim().length < 5) e.push("La descripción debe tener al menos 5 caracteres.")
    if (!form.projectId) e.push("Selecciona un proyecto.")
    if (!form.priority) e.push("Selecciona una prioridad.")
    if (!form.dateline) e.push("Selecciona la fecha límite.")
    else if (!task && form.dateline < toISODate(new Date())) e.push("La fecha límite no puede estar en el pasado.")
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (found.length > 0) return

    setLoading(true)
    await fakeRequest()
    const data = {
      description: form.description.trim(),
      projectId: form.projectId,
      status: form.status as TaskStatus,
      priority: form.priority as Priority,
      userId: form.userId === "none" ? null : form.userId,
      dateline: form.dateline,
    }
    if (task) updateTask(task.id, data)
    else addTask(data)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant={variant} size={size} />}>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>{task ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
            <DialogDescription>Define qué hay que hacer, en qué proyecto y para cuándo.</DialogDescription>
          </DialogHeader>

          <FormErrors errors={errors} />

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Primero crea un proyecto en la pestaña Proyectos.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="t-desc">
                  Descripción <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="t-desc"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Implementar el login con email y contraseña"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="t-project">
                  Proyecto <span className="text-destructive">*</span>
                </Label>
                <FormSelect
                  id="t-project"
                  value={form.projectId}
                  onChange={changeProject}
                  options={projectOptions}
                  placeholder="Selecciona un proyecto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-user">Responsable</Label>
                <FormSelect
                  id="t-user"
                  value={form.userId}
                  onChange={(v) => set("userId", v)}
                  options={userOptions}
                  disabled={!form.projectId}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="t-status">Estado</Label>
                <FormSelect id="t-status" value={form.status} onChange={(v) => set("status", v)} options={statusOptions} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-priority">
                  Prioridad <span className="text-destructive">*</span>
                </Label>
                <FormSelect
                  id="t-priority"
                  value={form.priority}
                  onChange={(v) => set("priority", v)}
                  options={priorityOptions}
                  placeholder="Prioridad"
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="t-date">
                  Fecha límite <span className="text-destructive">*</span>
                </Label>
                <DatePicker id="t-date" value={form.dateline} onChange={(v) => set("dateline", v)} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || projects.length === 0}>
              {loading && <Spinner />}
              {loading ? "Guardando..." : task ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
