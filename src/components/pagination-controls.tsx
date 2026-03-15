import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  page: number
  totalPages: number
  cursor: number | null
  onPrev: () => void
  onNext: () => void
}

export function PaginationControls({ page, totalPages, cursor, onPrev, onNext }: PaginationControlsProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 0}>
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages || 1}
      </span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={cursor === null}>
        Next
      </Button>
    </div>
  )
}
