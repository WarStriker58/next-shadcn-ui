"use client"

import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/overview/OverviewTab"
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog"
import { ProjectsTab } from "@/components/projects/ProjectsTab"
import { SettingsTab } from "@/components/settings/SettingsTab"
import { TasksTab } from "@/components/tasks/TasksTab"
import { TeamTab } from "@/components/team/TeamTab"
import { useDashboard } from "@/context/DashboardContext"

export default function DashboardPage() {
  const { settings } = useDashboard()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/40 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{settings.companyName}</p>
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard de Proyectos</h1>
            <p className="text-muted-foreground">Gestiona tus proyectos, equipo y tareas con shadcn/ui</p>
          </div>
          <ProjectFormDialog>
            <Plus />
            Nuevo Proyecto
          </ProjectFormDialog>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="team">Equipo</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsTab />
          </TabsContent>
          <TabsContent value="team">
            <TeamTab />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
