import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { format, parseISO } from 'date-fns'
import { useSalesPersonStore } from '@/store/salesPersonStore'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SortHeader } from '@/components/sort-header'
import { PaginationControls } from '@/components/pagination-controls'
import { useDebounce } from '@/lib/hooks'
import type { SalesPerson } from '@/store/types'

const SORT_KEY_MAP: Record<string, string> = {
  firstName: 'firstname',
  lastName: 'lastname',
  address: 'address',
  phone: 'phone',
  startDate: 'startdate',
  terminationDate: 'terminationdate',
  manager: 'manager',
}

export function SalespersonPage() {
  const { items, loading, error, page, pageSize, totalCount, cursor, sortBy, ascending } =
    useSalesPersonStore(
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
  const fetchAll = useSalesPersonStore((s) => s.fetchAll)
  const setSearch = useSalesPersonStore((s) => s.setSearch)
  const setPhone = useSalesPersonStore((s) => s.setPhone)
  const setSort = useSalesPersonStore((s) => s.setSort)
  const nextPage = useSalesPersonStore((s) => s.nextPage)
  const prevPage = useSalesPersonStore((s) => s.prevPage)

  const [searchInput, setSearchInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedPhone = useDebounce(phoneInput, 300)

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { setSearch(debouncedSearch) }, [debouncedSearch, setSearch])
  useEffect(() => { setPhone(debouncedPhone) }, [debouncedPhone, setPhone])

  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = useMemo<ColumnDef<SalesPerson>[]>(() => [
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link to={`/salesperson/${row.original.salesPersonId}`}>
          <Button variant="ghost" size="icon-sm"><Pencil /></Button>
        </Link>
      ),
    },
    {
      accessorKey: 'firstName',
      header: () => <SortHeader label="First Name" sortKey={SORT_KEY_MAP.firstName} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'lastName',
      header: () => <SortHeader label="Last Name" sortKey={SORT_KEY_MAP.lastName} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'address',
      header: () => <SortHeader label="Address" sortKey={SORT_KEY_MAP.address} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'phone',
      header: () => <SortHeader label="Phone" sortKey={SORT_KEY_MAP.phone} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'startDate',
      header: () => <SortHeader label="Start Date" sortKey={SORT_KEY_MAP.startDate} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => {
        const val = getValue<string>()
        return val ? format(parseISO(val), 'PP') : ''
      },
    },
    {
      accessorKey: 'terminationDate',
      header: () => <SortHeader label="Termination Date" sortKey={SORT_KEY_MAP.terminationDate} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => {
        const val = getValue<string>()
        return val ? format(parseISO(val), 'PP') : '—'
      },
    },
    {
      accessorKey: 'manager',
      header: () => <SortHeader label="Manager" sortKey={SORT_KEY_MAP.manager} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
  ], [sortBy, ascending, setSort])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Salesperson</h1>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-sm"
          />
          <Input
            placeholder="Search by phone..."
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Link to="/salesperson/new">
          <Button><Plus />New Salesperson</Button>
        </Link>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}
      {!loading && !error && <DataTable columns={columns} data={items} />}

      <PaginationControls page={page} totalPages={totalPages} cursor={cursor} onPrev={prevPage} onNext={nextPage} />
    </div>
  )
}
