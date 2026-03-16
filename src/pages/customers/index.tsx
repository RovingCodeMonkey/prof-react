import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useCustomerStore } from '@/store/customerStore'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SortHeader } from '@/components/sort-header'
import { PaginationControls } from '@/components/pagination-controls'
import { useDebounce } from '@/lib/hooks'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Customer } from '@/store/types'

const SORT_KEY_MAP: Record<string, string> = {
  firstName: 'firstname',
  lastName: 'lastname',
  address: 'address',
  phone: 'phone',
  startDate: 'startdate',
}

export function CustomersPage() {
  const { items, loading, error, page, pageSize, totalCount, cursor, sortBy, ascending } =
    useCustomerStore(
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
  const fetchAll = useCustomerStore((s) => s.fetchAll)
  const setSearch = useCustomerStore((s) => s.setSearch)
  const setPhone = useCustomerStore((s) => s.setPhone)
  const setSort = useCustomerStore((s) => s.setSort)
  const nextPage = useCustomerStore((s) => s.nextPage)
  const prevPage = useCustomerStore((s) => s.prevPage)
  const remove = useCustomerStore((s) => s.remove)
  const clearFilters = useCustomerStore((s) => s.clearFilters)

  const [searchInput, setSearchInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedPhone = useDebounce(phoneInput, 300)

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { setSearch(debouncedSearch) }, [debouncedSearch, setSearch])
  useEffect(() => { setPhone(debouncedPhone) }, [debouncedPhone, setPhone])

  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link to={`/customers/${row.original.customerId}`}>
            <Button variant="ghost" size="icon-sm"><Pencil /></Button>
          </Link>
          <ConfirmDeleteDialog onConfirm={() => remove(row.original.customerId)} />
        </div>
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
  ], [sortBy, ascending, setSort, remove])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Customers</h1>

      <div className="mb-4 flex items-center justify-between gap-4 px-5">
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSearchInput(''); setPhoneInput(''); clearFilters() }}>Clear Filters</Button>
          <Link to="/customers/new">
            <Button><Plus />New Customer</Button>
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
