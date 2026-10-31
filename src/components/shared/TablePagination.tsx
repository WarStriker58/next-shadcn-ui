"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

// Devuelve las páginas a mostrar, ej: [1, "...", 4, 5, 6, "...", 10]
function pageList(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "...")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) pages.push("...")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push("...")
  pages.push(total)
  return pages
}

// Componente Pagination de shadcn controlado por estado (sin cambiar de URL)
export function TablePagination({ page, totalPages, onPageChange }: TablePaginationProps) {
  const go = (p: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (p >= 1 && p <= totalPages && p !== page) onPageChange(p)
  }
  const disabledCls = "pointer-events-none opacity-50"

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text="Anterior"
            onClick={go(page - 1)}
            aria-disabled={page === 1}
            className={cn(page === 1 && disabledCls)}
          />
        </PaginationItem>
        {pageList(page, totalPages).map((p, i) =>
          p === "..." ? (
            <PaginationItem key={`e${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href="#" isActive={p === page} onClick={go(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            text="Siguiente"
            onClick={go(page + 1)}
            aria-disabled={page === totalPages}
            className={cn(page === totalPages && disabledCls)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
