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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/shared/DatePicker"
import { FormErrors } from "@/components/shared/FormAlerts"
import { FormSelect } from "@/components/shared/FormSelect"
import { useDashboard } from "@/context/DashboardContext"
import { fakeRequest, toISODate } from "@/lib/api"
import { MEMBER_ROLES, type Member, type MemberRole } from "@/lib/types"
import { EMAIL_REGEX } from "@/lib/ui-helpers"

type ButtonProps = React.ComponentProps<typeof Button>

interface MemberFormDialogProps {
  member?: Member
  children: ReactNode
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

interface FormState {
  name: string
  email: string
  role: string
  position: string
  birthdate: string
  phone: string
  projectId: string // "none" = sin proyecto
  isActive: boolean
}

const emptyForm: FormState = {
  name: "",
  email: "",
  role: "Miembro",
  position: "",
  birthdate: "",
  phone: "",
  projectId: "none",
  isActive: true,
}

const roleOptions = MEMBER_ROLES.map((r) => ({ value: r, label: r }))
const thisYear = new Date().getFullYear()

export function MemberFormDialog({ member, children, variant = "default", size = "default" }: MemberFormDialogProps) {
  const { members, projects, addMember, updateMember } = useDashboard()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const projectOptions = [{ value: "none", label: "Sin proyecto" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]

  function handleOpenChange(next: boolean) {
    if (loading) return
    if (next) {
      setForm(member ? { ...member, projectId: member.projectId ?? "none" } : emptyForm)
      setErrors([])
    }
    setOpen(next)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  function validate(): string[] {
    const e: string[] = []
    const email = form.email.trim().toLowerCase()
    if (form.name.trim().length < 3) e.push("El nombre debe tener al menos 3 caracteres.")
    if (!EMAIL_REGEX.test(email)) e.push("Ingresa un email válido (ej. nombre@empresa.com).")
    else if (members.some((m) => m.email.toLowerCase() === email && m.userId !== member?.userId))
      e.push("Ese email ya está registrado.")
    if (!form.role) e.push("Selecciona un rol.")
    if (form.position.trim().length < 2) e.push("Indica el puesto (ej. Frontend Developer).")
    if (!form.birthdate) e.push("Selecciona la fecha de nacimiento.")
    else {
      const today = toISODate(new Date())
      const [y, m, d] = today.split("-").map(Number)
      const adultLimit = toISODate(new Date(y - 18, m - 1, d))
      if (form.birthdate > adultLimit) e.push("El miembro debe ser mayor de 18 años.")
    }
    if (!/^9\d{8}$/.test(form.phone.replace(/\s/g, ""))) e.push("El teléfono debe tener 9 dígitos y empezar con 9.")
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
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role as MemberRole,
      position: form.position.trim(),
      birthdate: form.birthdate,
      phone: form.phone.trim(),
      projectId: form.projectId === "none" ? null : form.projectId,
      isActive: form.isActive,
    }
    if (member) updateMember(member.userId, data)
    else addMember(data)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant={variant} size={size} />}>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>{member ? "Editar Miembro" : "Nuevo Miembro"}</DialogTitle>
            <DialogDescription>
              {member ? (
                <>
                  ID de usuario: <span className="font-mono">{member.userId}</span>
                </>
              ) : (
                "El ID de usuario se genera automáticamente al guardar."
              )}
            </DialogDescription>
          </DialogHeader>

          <FormErrors errors={errors} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="m-name">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input id="m-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ana Torres" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="m-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="ana@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-phone">
                Teléfono <span className="text-destructive">*</span>
              </Label>
              <Input id="m-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="987 654 321" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-role">
                Rol <span className="text-destructive">*</span>
              </Label>
              <FormSelect id="m-role" value={form.role} onChange={(v) => set("role", v)} options={roleOptions} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-position">
                Puesto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="m-position"
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder="Frontend Developer"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-birth">
                Fecha de nacimiento <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="m-birth"
                value={form.birthdate}
                onChange={(v) => set("birthdate", v)}
                yearRange={{ from: thisYear - 70, to: thisYear }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-project">Proyecto</Label>
              <FormSelect
                id="m-project"
                value={form.projectId}
                onChange={(v) => set("projectId", v)}
                options={projectOptions}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
              <div>
                <Label htmlFor="m-active">Miembro activo</Label>
                <p className="text-xs text-muted-foreground">Los inactivos no cuentan en las métricas del Resumen.</p>
              </div>
              <Switch id="m-active" checked={form.isActive} onCheckedChange={(c) => set("isActive", c)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              {loading ? "Guardando..." : member ? "Guardar cambios" : "Agregar miembro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
