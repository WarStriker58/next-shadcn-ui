"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/shared/DatePicker"
import { FormErrors } from "@/components/shared/FormAlerts"
import { FormSelect } from "@/components/shared/FormSelect"
import { useDashboard } from "@/context/DashboardContext"
import { fakeRequest } from "@/lib/api"
import {
  CATEGORY_LABELS,
  PRIORITIES,
  PROJECT_STATUSES,
  type Priority,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "@/lib/types"

type ButtonProps = React.ComponentProps<typeof Button>

interface ProjectFormDialogProps {
  project?: Project // si viene, el formulario edita; si no, crea
  children: ReactNode // contenido del botón que abre el diálogo
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

interface FormState {
  name: string
  description: string
  category: string
  priority: string
  status: string
  startDate: string
  endDate: string
  memberIds: string[]
}

const emptyForm: FormState = {
  name: "",
  description: "",
  category: "",
  priority: "",
  status: "Planificado",
  startDate: "",
  endDate: "",
  memberIds: [],
}

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: p }))
const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s, label: s }))

export function ProjectFormDialog({ project, children, variant = "default", size = "default" }: ProjectFormDialogProps) {
  const { projects, members, addProject, updateProject, getProjectMembers, getProject } = useDashboard()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(project)

  // Al abrir, se carga el proyecto (modo edición) o un formulario vacío
  function handleOpenChange(next: boolean) {
    if (loading) return
    if (next) {
      setForm(
        project
          ? {
              name: project.name,
              description: project.description,
              category: project.category,
              priority: project.priority,
              status: project.status,
              startDate: project.startDate,
              endDate: project.endDate,
              memberIds: getProjectMembers(project.id).map((m) => m.userId),
            }
          : emptyForm,
      )
      setErrors([])
    }
    setOpen(next)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  function toggleMember(userId: string, checked: boolean) {
    set("memberIds", checked ? [...form.memberIds, userId] : form.memberIds.filter((id) => id !== userId))
  }

  function validate(): string[] {
    const e: string[] = []
    const name = form.name.trim()
    if (name.length < 3) e.push("El nombre debe tener al menos 3 caracteres.")
    if (projects.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== project?.id))
      e.push("Ya existe un proyecto con ese nombre.")
    if (!form.category) e.push("Selecciona una categoría.")
    if (!form.priority) e.push("Selecciona una prioridad.")
    if (!form.startDate) e.push("Selecciona la fecha de inicio.")
    if (!form.endDate) e.push("Selecciona la fecha de fin.")
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.push("La fecha de fin no puede ser anterior a la de inicio.")
    if (form.memberIds.length === 0) e.push("Asigna al menos un miembro del equipo.")
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (found.length > 0) return

    setLoading(true)
    await fakeRequest() // simula POST/PUT al backend
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category as ProjectCategory,
      priority: form.priority as Priority,
      status: form.status as ProjectStatus,
      startDate: form.startDate,
      endDate: form.endDate,
    }
    if (project) updateProject(project.id, data, form.memberIds)
    else addProject(data, form.memberIds)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant={variant} size={size} />}>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Proyecto" : "Crear Nuevo Proyecto"}</DialogTitle>
            <DialogDescription>
              Completa la información del proyecto. Los campos con <span className="text-destructive">*</span> son
              obligatorios.
            </DialogDescription>
          </DialogHeader>

          <FormErrors errors={errors} />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="p-name">
                Nombre del Proyecto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="p-name"
                placeholder="Mi Proyecto Increíble"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="p-desc">Descripción</Label>
              <Textarea
                id="p-desc"
                placeholder="Breve descripción del proyecto..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="p-cat">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <FormSelect
                  id="p-cat"
                  value={form.category}
                  onChange={(v) => set("category", v)}
                  options={categoryOptions}
                  placeholder="Categoría"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-prio">
                  Prioridad <span className="text-destructive">*</span>
                </Label>
                <FormSelect
                  id="p-prio"
                  value={form.priority}
                  onChange={(v) => set("priority", v)}
                  options={priorityOptions}
                  placeholder="Prioridad"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-status">Estado</Label>
                <FormSelect
                  id="p-status"
                  value={form.status}
                  onChange={(v) => set("status", v)}
                  options={statusOptions}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="p-start">
                  Fecha de inicio <span className="text-destructive">*</span>
                </Label>
                <DatePicker id="p-start" value={form.startDate} onChange={(v) => set("startDate", v)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-end">
                  Fecha de fin <span className="text-destructive">*</span>
                </Label>
                <DatePicker id="p-end" value={form.endDate} onChange={(v) => set("endDate", v)} />
              </div>
            </div>

            {/* Campo nuevo: miembros del equipo */}
            <div className="grid gap-2">
              <Label>
                Miembros del equipo <span className="text-destructive">*</span>
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {form.memberIds.length} seleccionado(s)
                </span>
              </Label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                {members.length === 0 && (
                  <p className="p-2 text-sm text-muted-foreground">No hay miembros. Créalos en la pestaña Equipo.</p>
                )}
                {members.map((m) => {
                  const checked = form.memberIds.includes(m.userId)
                  const other = m.projectId && m.projectId !== project?.id ? getProject(m.projectId) : undefined
                  return (
                    <label
                      key={m.userId}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
                    >
                      <Checkbox checked={checked} onCheckedChange={(c) => toggleMember(m.userId, c)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.position}</p>
                      </div>
                      {!m.isActive && <Badge variant="outline">Inactivo</Badge>}
                      {other && !checked && <Badge variant="secondary">En {other.name}</Badge>}
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Cada miembro pertenece a un solo proyecto: si marcas a alguien de otro proyecto, se moverá a este.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
