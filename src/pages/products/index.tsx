import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const {
    items, loading, error,
    page, pageSize, totalCount, cursor,
    sortBy, ascending,
    fetchAll, setSearch, setSort, nextPage, prevPage,
  } = useProductStore()

  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput, setSearch])

  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = useMemo<ColumnDef<Product>[]>(() => {
    function SortHeader({ label, field }: { label: string; field: string }) {
      const apiKey = SORT_KEY_MAP[field]
      const isActive = sortBy === apiKey
      const Icon = isActive ? (ascending ? ChevronUp : ChevronDown) : ChevronsUpDown
      return (
        <Button variant="ghost" size="sm" onClick={() => setSort(apiKey)}>
          {label}
          <Icon className="ml-1 size-3.5" />
        </Button>
      )
    }

    return [
      {
        id: 'actions',
        cell: ({ row }) => (
          <Link to={`/products/${row.original.productId}`}>
            <Button variant="ghost" size="icon-sm">
              <Pencil />
            </Button>
          </Link>
        ),
      },
      {
        accessorKey: 'name',
        header: () => <SortHeader label="Name" field="name" />,
      },
      {
        accessorKey: 'manufacturer',
        header: () => <SortHeader label="Manufacturer" field="manufacturer" />,
      },
      {
        accessorKey: 'style',
        header: () => <SortHeader label="Style" field="style" />,
      },
      {
        accessorKey: 'purchasePrice',
        header: () => <SortHeader label="Purchase Price" field="purchasePrice" />,
        cell: ({ getValue }) =>
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            getValue<number>()
          ),
      },
      {
        accessorKey: 'salePrice',
        header: () => <SortHeader label="Sale Price" field="salePrice" />,
        cell: ({ getValue }) =>
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            getValue<number>()
          ),
      },
      {
        accessorKey: 'qtyOnHand',
        header: () => <SortHeader label="Qty On Hand" field="qtyOnHand" />,
      },
      {
        accessorKey: 'commisionPercentage',
        header: () => <SortHeader label="Commission %" field="commisionPercentage" />,
        cell: ({ getValue }) => `${getValue<number>()}%`,
      },
    ]
  }, [sortBy, ascending, setSort])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Products</h1>

      <div className="mb-4">
        <Input
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}
      {!loading && !error && <DataTable columns={columns} data={items} />}

      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 0}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages || 1}
        </span>
        <Button variant="outline" size="sm" onClick={nextPage} disabled={cursor === null}>
          Next
        </Button>
      </div>
    </div>
  )
}
