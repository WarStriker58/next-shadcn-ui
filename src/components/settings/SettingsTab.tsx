"use client"

import { useState } from "react"
import { RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { FormErrors, FormSuccess } from "@/components/shared/FormAlerts"
import { FormSelect } from "@/components/shared/FormSelect"
import { useDashboard } from "@/context/DashboardContext"
import { fakeRequest } from "@/lib/api"
import type { Settings } from "@/lib/types"
import { EMAIL_REGEX } from "@/lib/ui-helpers"

const languageOptions = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
]
const timezoneOptions = [
  { value: "America/Lima", label: "Lima (UTC-5)" },
  { value: "America/Bogota", label: "Bogotá (UTC-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
  { value: "America/Santiago", label: "Santiago (UTC-3)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1)" },
]
const themeOptions = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
]
const perPageOptions = [3, 5, 10, 20].map((n) => ({ value: String(n), label: `${n} por página` }))

export function SettingsTab() {
  const { settings, updateSettings } = useDashboard()
  const [form, setForm] = useState<Settings>(settings)
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const dirty = JSON.stringify(form) !== JSON.stringify(settings)

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function validate(): string[] {
    const e: string[] = []
    if (form.companyName.trim().length < 2) e.push("El nombre de la organización es obligatorio.")
    if (form.adminName.trim().length < 3) e.push("El nombre del administrador debe tener al menos 3 caracteres.")
    if (!EMAIL_REGEX.test(form.adminEmail.trim())) e.push("El email del administrador no es válido.")
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    setSaved(false)
    if (found.length > 0) return

    setLoading(true)
    await fakeRequest(1200) // simula PUT /api/settings
    updateSettings({ ...form, companyName: form.companyName.trim(), adminName: form.adminName.trim() })
    setLoading(false)
    setSaved(true)
  }

  function handleReset() {
    setForm(settings)
    setErrors([])
    setSaved(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>Administra las preferencias de tu cuenta y del dashboard.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <FormErrors errors={errors} />
          {saved && <FormSuccess title="Configuración guardada" message="Los cambios se aplicaron correctamente." />}

          {/* General */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">General</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="s-company">Organización</Label>
                <Input id="s-company" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-admin">Administrador</Label>
                <Input id="s-admin" value={form.adminName} onChange={(e) => set("adminName", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-email">Email del administrador</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => set("adminEmail", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Preferencias */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Preferencias</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="s-lang">Idioma</Label>
                <FormSelect
                  id="s-lang"
                  value={form.language}
                  onChange={(v) => set("language", v as Settings["language"])}
                  options={languageOptions}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-tz">Zona horaria</Label>
                <FormSelect id="s-tz" value={form.timezone} onChange={(v) => set("timezone", v)} options={timezoneOptions} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-theme">Tema</Label>
                <FormSelect
                  id="s-theme"
                  value={form.theme}
                  onChange={(v) => set("theme", v as Settings["theme"])}
                  options={themeOptions}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-pp">Tareas por página</Label>
                <FormSelect
                  id="s-pp"
                  value={String(form.itemsPerPage)}
                  onChange={(v) => set("itemsPerPage", Number(v))}
                  options={perPageOptions}
                />
              </div>
            </div>
          </section>

          {/* Notificaciones */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Notificaciones</h3>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="s-notif">Notificaciones por email</Label>
                <p className="text-xs text-muted-foreground">Avisos cuando te asignen una tarea.</p>
              </div>
              <Switch
                id="s-notif"
                checked={form.emailNotifications}
                onCheckedChange={(c) => set("emailNotifications", c)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="s-weekly">Reporte semanal</Label>
                <p className="text-xs text-muted-foreground">Resumen de avance cada lunes.</p>
              </div>
              <Switch id="s-weekly" checked={form.weeklyReport} onCheckedChange={(c) => set("weeklyReport", c)} />
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset} disabled={loading || !dirty}>
            <RotateCcw />
            Descartar
          </Button>
          <Button type="submit" disabled={loading || !dirty}>
            {loading ? <Spinner /> : <Save />}
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
