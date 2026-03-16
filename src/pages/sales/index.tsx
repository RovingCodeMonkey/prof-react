import { useEffect, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { format, parseISO } from 'date-fns'
import { useSalesStore } from '@/store/salesStore'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { SortHeader } from '@/components/sort-header'
import { PaginationControls } from '@/components/pagination-controls'
import { EntityCombobox } from '@/components/entity-combobox'
import { Input } from '@/components/ui/input'
import { fetchProducts, fetchSalesPersons, fetchCustomers } from '@/lib/fetch-helpers'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Sale, Product, SalesPerson, Customer } from '@/store/types'

const SORT_KEY_MAP: Record<string, string> = {
  productId: 'productid',
  salesPersonId: 'salespersonid',
  customerId: 'customerid',
  salesDate: 'salesdate',
  finalPrice: 'finalprice',
  commision: 'commision',
}

export function SalesPage() {
  const {
    items, loading, error, page, pageSize, totalCount, cursor, sortBy, ascending,
    productIdFilter, salesPersonIdFilter, customerIdFilter,
    productFilterName, spFilterName, customerFilterName,
    startDateFilter, endDateFilter,
  } = useSalesStore(
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
      productIdFilter: s.productIdFilter,
      salesPersonIdFilter: s.salesPersonIdFilter,
      customerIdFilter: s.customerIdFilter,
      productFilterName: s.productFilterName,
      spFilterName: s.spFilterName,
      customerFilterName: s.customerFilterName,
      startDateFilter: s.startDateFilter,
      endDateFilter: s.endDateFilter,
    }))
  )
  const fetchAll = useSalesStore((s) => s.fetchAll)
  const setSort = useSalesStore((s) => s.setSort)
  const nextPage = useSalesStore((s) => s.nextPage)
  const prevPage = useSalesStore((s) => s.prevPage)
  const setProductIdFilter = useSalesStore((s) => s.setProductIdFilter)
  const setSpIdFilter = useSalesStore((s) => s.setSpIdFilter)
  const setCustomerIdFilter = useSalesStore((s) => s.setCustomerIdFilter)
  const setStartDateFilter = useSalesStore((s) => s.setStartDateFilter)
  const setEndDateFilter = useSalesStore((s) => s.setEndDateFilter)
  const remove = useSalesStore((s) => s.remove)
  const clearFilters = useSalesStore((s) => s.clearFilters)

  useEffect(() => { fetchAll() }, [fetchAll])

  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link to={`/sales/${row.original.salesId}`}>
            <Button variant="ghost" size="icon-sm"><Pencil /></Button>
          </Link>
          <ConfirmDeleteDialog onConfirm={() => remove(row.original.salesId)} />
        </div>
      ),
    },
    {
      id: 'product',
      header: () => <SortHeader label="Product" sortKey={SORT_KEY_MAP.productId} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ row }) => row.original.product?.name ?? '—',
    },
    {
      id: 'customer',
      header: () => <SortHeader label="Customer" sortKey={SORT_KEY_MAP.customerId} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ row }) =>
        row.original.customer
          ? `${row.original.customer.firstName} ${row.original.customer.lastName}`
          : '—',
    },
    {
      accessorKey: 'finalPrice',
      header: () => <SortHeader label="Price" sortKey={SORT_KEY_MAP.finalPrice} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      id: 'salesPerson',
      header: () => <SortHeader label="Sales Person" sortKey={SORT_KEY_MAP.salesPersonId} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ row }) =>
        row.original.salesPerson
          ? `${row.original.salesPerson.firstName} ${row.original.salesPerson.lastName}`
          : '—',
    },
    {
      accessorKey: 'commision',
      header: () => <SortHeader label="Commission" sortKey={SORT_KEY_MAP.commision} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      accessorKey: 'salesDate',
      header: () => <SortHeader label="Sales Date" sortKey={SORT_KEY_MAP.salesDate} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => format(parseISO(getValue<string>()), 'PP'),
    },
  ], [sortBy, ascending, setSort, remove])

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Sales</h1>

      <div className="mb-2 flex items-center gap-4 px-5">
        <div className="flex-1">
          <EntityCombobox<Product>
            value={productIdFilter}
            displayValue={productFilterName}
            placeholder="All products"
            searchPlaceholder="Search products..."
            emptyMessage="No products found."
            clearLabel="All products"
            fetchOptions={fetchProducts}
            getItemId={(p) => p.productId}
            getItemLabel={(p) => `${p.name} - ${p.manufacturer}`}
            onSelect={(p) => setProductIdFilter(p.productId, `${p.name} - ${p.manufacturer}`)}
            onClear={() => setProductIdFilter(null, '')}
          />
        </div>
        <div className="flex-1">
          <EntityCombobox<SalesPerson>
            value={salesPersonIdFilter}
            displayValue={spFilterName}
            placeholder="All sales persons"
            searchPlaceholder="Search sales persons..."
            emptyMessage="No sales persons found."
            clearLabel="All sales persons"
            fetchOptions={fetchSalesPersons}
            getItemId={(sp) => sp.salesPersonId}
            getItemLabel={(sp) => `${sp.firstName} ${sp.lastName}`}
            onSelect={(sp) => setSpIdFilter(sp.salesPersonId, `${sp.firstName} ${sp.lastName}`)}
            onClear={() => setSpIdFilter(null, '')}
          />
        </div>
        <div className="flex-1">
          <EntityCombobox<Customer>
            value={customerIdFilter}
            displayValue={customerFilterName}
            placeholder="All customers"
            searchPlaceholder="Search customers..."
            emptyMessage="No customers found."
            clearLabel="All customers"
            fetchOptions={fetchCustomers}
            getItemId={(c) => c.customerId}
            getItemLabel={(c) => `${c.firstName} ${c.lastName}`}
            onSelect={(c) => setCustomerIdFilter(c.customerId, `${c.firstName} ${c.lastName}`)}
            onClear={() => setCustomerIdFilter(null, '')}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 px-5">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">From</label>
          <Input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">To</label>
          <Input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        <Link to="/sales/new">
          <Button><Plus />New Sale</Button>
        </Link>
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
