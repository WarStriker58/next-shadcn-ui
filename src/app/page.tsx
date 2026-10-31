import { redirect } from "next/navigation"

// La página de inicio lleva directamente al dashboard
export default function Home() {
  redirect("/dashboard")
}