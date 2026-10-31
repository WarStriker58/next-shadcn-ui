"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { fakeRequest } from "@/lib/api"

interface ConfirmDeleteProps {
  title: string
  description: string
  onConfirm: () => void
  label?: string // si se pasa, muestra un botón con texto; si no, solo el ícono
}

// Diálogo de confirmación + Spinner mientras se "elimina" en el backend
export function ConfirmDelete({ title, description, onConfirm, label }: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await fakeRequest()
    setLoading(false)
    setOpen(false)
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
      <AlertDialogTrigger
        render={
          label ? (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />
          ) : (
            <Button variant="ghost" size="icon-sm" aria-label="Eliminar" className="text-destructive hover:text-destructive" />
          )
        }
      >
        <Trash2 />
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
