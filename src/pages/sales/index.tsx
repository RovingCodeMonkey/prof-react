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
import { fetchProducts, fetchSalesPersons, fetchCustomers } from '@/lib/fetch-helpers'
import type { Sale, Product, SalesPerson, Customer } from '@/store/types'

const SORT_KEY_MAP: Record<string, string> = {
  productId: 'productid',
  salesPersonId: 'salespersonid',
  customerId: 'customerid',
  salesDate: 'salesdate',
}

export function SalesPage() {
  const {
    items, loading, error, page, pageSize, totalCount, cursor, sortBy, ascending,
    productIdFilter, salesPersonIdFilter, customerIdFilter,
    productFilterName, spFilterName, customerFilterName,
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
    }))
  )
  const fetchAll = useSalesStore((s) => s.fetchAll)
  const setSort = useSalesStore((s) => s.setSort)
  const nextPage = useSalesStore((s) => s.nextPage)
  const prevPage = useSalesStore((s) => s.prevPage)
  const setProductIdFilter = useSalesStore((s) => s.setProductIdFilter)
  const setSpIdFilter = useSalesStore((s) => s.setSpIdFilter)
  const setCustomerIdFilter = useSalesStore((s) => s.setCustomerIdFilter)

  useEffect(() => { fetchAll() }, [fetchAll])

  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link to={`/sales/${row.original.salesId}`}>
          <Button variant="ghost" size="icon-sm"><Pencil /></Button>
        </Link>
      ),
    },
    {
      id: 'product',
      header: () => <SortHeader label="Product" sortKey={SORT_KEY_MAP.productId} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ row }) => row.original.product?.name ?? '—',
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
      id: 'customer',
      header: () => <SortHeader label="Customer" sortKey={SORT_KEY_MAP.customerId} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ row }) =>
        row.original.customer
          ? `${row.original.customer.firstName} ${row.original.customer.lastName}`
          : '—',
    },
    {
      accessorKey: 'salesDate',
      header: () => <SortHeader label="Sales Date" sortKey={SORT_KEY_MAP.salesDate} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => format(parseISO(getValue<string>()), 'PP'),
    },
  ], [sortBy, ascending, setSort])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Sales</h1>

      <div className="mb-2 flex items-center gap-4">
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
            getItemLabel={(p) => p.name}
            onSelect={(p) => setProductIdFilter(p.productId, p.name)}
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

      <div className="mb-4 flex items-center justify-end">
        <Link to="/sales/new">
          <Button><Plus />New Sale</Button>
        </Link>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}
      {!loading && !error && <DataTable columns={columns} data={items} />}

      <PaginationControls page={page} totalPages={totalPages} cursor={cursor} onPrev={prevPage} onNext={nextPage} />
    </div>
  )
}
