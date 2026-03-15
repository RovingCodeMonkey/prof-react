import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SortHeaderProps {
  label: string
  sortKey: string
  activeSortBy: string
  ascending: boolean
  onSort: (key: string) => void
}

export function SortHeader({ label, sortKey, activeSortBy, ascending, onSort }: SortHeaderProps) {
  const isActive = activeSortBy === sortKey
  const Icon = isActive ? (ascending ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <Button variant="ghost" size="sm" onClick={() => onSort(sortKey)}>
      {label}
      <Icon className="ml-1 size-3.5" />
    </Button>
  )
}
