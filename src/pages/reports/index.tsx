import { useEffect, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { useShallow } from 'zustand/react/shallow'
import { useReportStore } from '@/store/reportStore'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { SelectCombobox } from '@/components/ui/select-combobox'
import { EntityCombobox } from '@/components/entity-combobox'
import { fetchProducts, fetchSalesPersons, fetchCustomers } from '@/lib/fetch-helpers'
import type { Sale, Product, SalesPerson, Customer } from '@/store/types'

const currency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i)

export function ReportsPage() {
  const {
    items, count, totalSales, totalCommission, loading, error,
    year, quarter,
    productIdFilter, salesPersonIdFilter, customerIdFilter,
    productFilterName, spFilterName, customerFilterName,
  } = useReportStore(
    useShallow((s) => ({
      items: s.items,
      count: s.count,
      totalSales: s.totalSales,
      totalCommission: s.totalCommission,
      loading: s.loading,
      error: s.error,
      year: s.year,
      quarter: s.quarter,
      productIdFilter: s.productIdFilter,
      salesPersonIdFilter: s.salesPersonIdFilter,
      customerIdFilter: s.customerIdFilter,
      productFilterName: s.productFilterName,
      spFilterName: s.spFilterName,
      customerFilterName: s.customerFilterName,
    }))
  )
  const fetchAll = useReportStore((s) => s.fetchAll)
  const setYear = useReportStore((s) => s.setYear)
  const setQuarter = useReportStore((s) => s.setQuarter)
  const setProductIdFilter = useReportStore((s) => s.setProductIdFilter)
  const setSpIdFilter = useReportStore((s) => s.setSpIdFilter)
  const setCustomerIdFilter = useReportStore((s) => s.setCustomerIdFilter)
  const clearFilters = useReportStore((s) => s.clearFilters)

  useEffect(() => { fetchAll() }, [fetchAll])

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => row.original.product?.name ?? '—',
      footer: () => 'Totals',
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) =>
        row.original.customer
          ? `${row.original.customer.firstName} ${row.original.customer.lastName}`
          : '—',
    },
    {
      accessorKey: 'finalPrice',
      header: 'Price',
      cell: ({ getValue }) => currency(getValue<number>()),
      footer: () => currency(totalSales),
    },
    {
      id: 'salesPerson',
      header: 'Sales Person',
      cell: ({ row }) =>
        row.original.salesPerson
          ? `${row.original.salesPerson.firstName} ${row.original.salesPerson.lastName}`
          : '—',
    },
    {
      accessorKey: 'commision',
      header: 'Commission',
      cell: ({ getValue }) => currency(getValue<number>()),
      footer: () => currency(totalCommission),
    },
    {
      accessorKey: 'salesDate',
      header: 'Sales Date',
      cell: ({ getValue }) => format(parseISO(getValue<string>()), 'PP'),
    },
  ], [totalSales, totalCommission])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Reports</h1>

      <div className="mb-2 flex items-center gap-4 px-5">
        <SelectCombobox
          value={year}
          options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
          onChange={setYear}
        />
        <SelectCombobox
          value={quarter}
          options={[1, 2, 3, 4].map((q) => ({ value: q, label: `Q${q}` }))}
          onChange={setQuarter}
        />
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
        <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}
      {!loading && !error && <DataTable columns={columns} data={items} />}

      {!loading && !error && (
        <p className="px-5 mt-2 text-sm text-muted-foreground">{count} record{count !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
