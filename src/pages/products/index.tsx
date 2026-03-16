import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useProductStore } from '@/store/productStore'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SortHeader } from '@/components/sort-header'
import { PaginationControls } from '@/components/pagination-controls'
import { useDebounce } from '@/lib/hooks'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Product } from '@/store/types'

const SORT_KEY_MAP: Record<string, string> = {
  name: 'name',
  manufacturer: 'manufacturer',
  style: 'style',
  purchasePrice: 'purchaseprice',
  salePrice: 'saleprice',
  qtyOnHand: 'qtyonhand',
  commisionPercentage: 'commisionpercentage',
}

export function ProductsPage() {
  const { items, loading, error, page, pageSize, totalCount, cursor, sortBy, ascending } =
    useProductStore(
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
  const fetchAll = useProductStore((s) => s.fetchAll)
  const setSearch = useProductStore((s) => s.setSearch)
  const setSort = useProductStore((s) => s.setSort)
  const nextPage = useProductStore((s) => s.nextPage)
  const prevPage = useProductStore((s) => s.prevPage)
  const remove = useProductStore((s) => s.remove)
  const clearFilters = useProductStore((s) => s.clearFilters)

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { setSearch(debouncedSearch) }, [debouncedSearch, setSearch])

  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link to={`/products/${row.original.productId}`}>
            <Button variant="ghost" size="icon-sm"><Pencil /></Button>
          </Link>
          <ConfirmDeleteDialog onConfirm={() => remove(row.original.productId)} />
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: () => <SortHeader label="Name" sortKey={SORT_KEY_MAP.name} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'manufacturer',
      header: () => <SortHeader label="Manufacturer" sortKey={SORT_KEY_MAP.manufacturer} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'style',
      header: () => <SortHeader label="Style" sortKey={SORT_KEY_MAP.style} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'purchasePrice',
      header: () => <SortHeader label="Purchase Price" sortKey={SORT_KEY_MAP.purchasePrice} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getValue<number>()),
    },
    {
      accessorKey: 'salePrice',
      header: () => <SortHeader label="Sale Price" sortKey={SORT_KEY_MAP.salePrice} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getValue<number>()),
    },
    {
      accessorKey: 'qtyOnHand',
      header: () => <SortHeader label="Qty On Hand" sortKey={SORT_KEY_MAP.qtyOnHand} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
    },
    {
      accessorKey: 'commisionPercentage',
      header: () => <SortHeader label="Commission %" sortKey={SORT_KEY_MAP.commisionPercentage} activeSortBy={sortBy} ascending={ascending} onSort={setSort} />,
      cell: ({ getValue }) => `${getValue<number>()}%`,
    },
  ], [sortBy, ascending, setSort, remove])

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Products</h1>

      <div className="mb-4 flex items-center justify-between gap-4 px-5">
        <Input
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSearchInput(''); clearFilters() }}>Clear Filters</Button>
          <Link to="/products/new">
            <Button><Plus />New Product</Button>
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
