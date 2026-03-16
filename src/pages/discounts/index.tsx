import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { format, parseISO } from 'date-fns'
import { useDiscountStore } from '@/store/discountStore'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SortHeader } from '@/components/sort-header'
import { PaginationControls } from '@/components/pagination-controls'
import { useDebounce } from '@/lib/hooks'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Discount } from '@/store/types'

const SORT_KEY_MAP: Record<string, string> = {
  productName: 'productname',
  beginDate: 'begindate',
  endDate: 'enddate',
  discountPercentage: 'discountpercentage',
}

export function DiscountsPage() {
  const { items, loading, error, page, pageSize, totalCount, cursor, sortBy, ascending } =
    useDiscountStore(
      useShallow((s) => ({
        items: s.items,
        loading: s.loading,
        error: s.error,
        page: s.page,
        pageSize: s.pageSize,
        totalCount: s.totalCount,
        cursor: s.cursor,
        sortBy: s.sortBy,
        ascending: s.ascending,
      }))
    )
  const fetchAll = useDiscountStore((s) => s.fetchAll)
  const setSearch = useDiscountStore((s) => s.setSearch)
  const setSort = useDiscountStore((s) => s.setSort)
  const nextPage = useDiscountStore((s) => s.nextPage)
  const prevPage = useDiscountStore((s) => s.prevPage)
  const remove = useDiscountStore((s) => s.remove)
  const clearFilters = useDiscountStore((s) => s.clearFilters)

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { setSearch(debouncedSearch) }, [debouncedSearch, setSearch])

  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = useMemo<ColumnDef<Discount>[]>(() => [
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link to={`/discounts/${row.original.discountId}`}>
            <Button variant="ghost" size="icon-sm"><Pencil /></Button>
          </Link>
          <ConfirmDeleteDialog onConfirm={() => remove(row.original.discountId)} />
        </div>
      ),
    },
    {
      id: 'productName',
      header: () => <SortHeader label="Product" sortKey={SORT_KEY_MAP.productName} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ row }) => row.original.product?.name ?? '—',
    },
    {
      accessorKey: 'beginDate',
      header: () => <SortHeader label="Begin Date" sortKey={SORT_KEY_MAP.beginDate} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => format(parseISO(getValue<string>()), 'PP'),
    },
    {
      accessorKey: 'endDate',
      header: () => <SortHeader label="End Date" sortKey={SORT_KEY_MAP.endDate} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => {
        const val = getValue<string>()
        return val ? format(parseISO(val), 'PP') : '—'
      },
    },
    {
      accessorKey: 'discountPercentage',
      header: () => <SortHeader label="Discount %" sortKey={SORT_KEY_MAP.discountPercentage} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => `${getValue<number>()}%`,
    },
  ], [sortBy, ascending, setSort, remove])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Discounts</h1>

      <div className="mb-4 flex items-center justify-between gap-4 px-5">
        <Input
          placeholder="Search by product..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSearchInput(''); clearFilters() }}>Clear Filters</Button>
          <Link to="/discounts/new">
            <Button><Plus />New Discount</Button>
          </Link>
        </div>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}
      {!loading && !error && <DataTable columns={columns} data={items} />}

      <div className="px-5">
        <PaginationControls page={page} totalPages={totalPages} cursor={cursor} onPrev={prevPage} onNext={nextPage} />
      </div>
    </div>
  )
}
