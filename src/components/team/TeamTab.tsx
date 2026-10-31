"use client"

import { useState } from "react"
import { Pencil, Search, UserPlus, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDelete } from "@/components/shared/ConfirmDelete"
import { FormSelect } from "@/components/shared/FormSelect"
import { useDashboard } from "@/context/DashboardContext"
import { formatDate } from "@/lib/api"
import { initials } from "@/lib/ui-helpers"
import { MemberFormDialog } from "./MemberFormDialog"

export function TeamTab() {
  const { members, projects, getProject, updateMember, deleteMember } = useDashboard()
  const [search, setSearch] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")

  const projectOptions = [
    { value: "all", label: "Todos los proyectos" },
    { value: "none", label: "Sin proyecto" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ]

  const term = search.trim().toLowerCase()
  const filtered = members.filter((m) => {
    const matchesProject =
      projectFilter === "all" || (projectFilter === "none" ? m.projectId === null : m.projectId === projectFilter)
    const matchesText = [m.name, m.email, m.position].join(" ").toLowerCase().includes(term)
    return matchesProject && matchesText
  })
  const activeCount = members.filter((m) => m.isActive).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Miembros del Equipo</CardTitle>
        <CardDescription>
          {members.length} miembros · {activeCount} activos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o puesto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <FormSelect value={projectFilter} onChange={setProjectFilter} options={projectOptions} className="sm:w-52" />
          <MemberFormDialog>
            <UserPlus />
            Nuevo miembro
          </MemberFormDialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Puesto / Rol</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Nacimiento</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <Users className="mx-auto mb-1 size-6" />
                    No se encontraron miembros.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.userId} className={m.isActive ? "" : "opacity-60"}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials(m.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p>{m.position}</p>
                      <Badge variant="outline" className="mt-1">
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getProject(m.projectId)?.name ?? <span className="text-muted-foreground">Sin proyecto</span>}
                    </TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell>{formatDate(m.birthdate)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={m.isActive}
                        onCheckedChange={(c) => updateMember(m.userId, { isActive: c })}
                        aria-label="Cambiar estado"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <MemberFormDialog member={m} variant="ghost" size="icon-sm">
                          <Pencil />
                          <span className="sr-only">Editar</span>
                        </MemberFormDialog>
                        <ConfirmDelete
                          title={`¿Eliminar a ${m.name}?`}
                          description="Sus tareas quedarán como 'Sin asignar'. Esta acción no se puede deshacer."
                          onConfirm={() => deleteMember(m.userId)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
