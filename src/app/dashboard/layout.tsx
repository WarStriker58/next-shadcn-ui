import { DashboardProvider } from "@/context/DashboardContext"

// Envuelve todas las páginas de /dashboard con el estado compartido en memoria
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>
}
