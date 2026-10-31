import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Alert de shadcn para mostrar errores de validación
export function FormErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Revisa el formulario</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-0.5 pl-4">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

// Alert de éxito
export function FormSuccess({ title, message }: { title: string; message?: string }) {
  return (
    <Alert>
      <CheckCircle2 />
      <AlertTitle>{title}</AlertTitle>
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  )
}
