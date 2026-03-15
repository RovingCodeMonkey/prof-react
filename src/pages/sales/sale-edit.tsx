import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { format, parseISO } from 'date-fns'
import { useSalesStore } from '@/store/salesStore'
import { api } from '@/store/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityCombobox } from '@/components/entity-combobox'
import { fetchProducts, fetchSalesPersons, fetchCustomers } from '@/lib/fetch-helpers'
import type { Sale, Product, SalesPerson, Customer, Discount } from '@/store/types'
import { PageMode } from '../constants'

export function SaleEditPage() {
  const { salesId: salesIdQuery } = useParams<{ salesId: string }>()
  const navigate = useNavigate()

  const salesId = salesIdQuery !== undefined ? parseInt(salesIdQuery, 10) : undefined

  const mode = salesId === undefined ? PageMode.Add : PageMode.Edit

  const { loading, error } = useSalesStore(
    useShallow((s) => ({ loading: s.loading, error: s.error }))
  )
  const fetchOne = useSalesStore((s) => s.fetchOne)
  const create = useSalesStore((s) => s.create)
  const update = useSalesStore((s) => s.update)

  const [form, setForm] = useState<Omit<Sale, 'salesId' | 'product' | 'salesPerson' | 'customer'>>({
    productId: 0,
    salesPersonId: 0,
    customerId: 0,
    salesDate: format(new Date(), 'yyyy-MM-dd'),
    salePrice: 0,
    appliedDiscount: 0,
    finalPrice: 0,
  })
  const [availableDiscounts, setAvailableDiscounts] = useState<Discount[]>([])
  const [selectedProductName, setSelectedProductName] = useState('')
  const [selectedSpName, setSelectedSpName] = useState('')
  const [selectedCustomerName, setSelectedCustomerName] = useState('')

  useEffect(() => {
    if (mode === PageMode.Edit) {
      fetchOne(salesId!).then((sale) => {
        if (sale) {
          setForm({
            productId: sale.productId,
            salesPersonId: sale.salesPersonId,
            customerId: sale.customerId,
            salesDate: format(parseISO(sale.salesDate), 'yyyy-MM-dd'),
            salePrice: sale.salePrice,
            appliedDiscount: sale.appliedDiscount,
            finalPrice: sale.finalPrice,
          })
          setSelectedProductName(sale.product?.name ?? '')
          setSelectedSpName(
            sale.salesPerson
              ? `${sale.salesPerson.firstName} ${sale.salesPerson.lastName}`
              : ''
          )
          setSelectedCustomerName(
            sale.customer
              ? `${sale.customer.firstName} ${sale.customer.lastName}`
              : ''
          )
        }
      })
    }
  }, [fetchOne, mode, salesId])

  useEffect(() => {
    if (!form.productId) return
    const controller = new AbortController()
    api.get<Discount[]>(`/discounts/available?productId=${form.productId}&date=${form.salesDate}`, controller.signal)
      .then(setAvailableDiscounts)
      .catch(() => { if (!controller.signal.aborted) setAvailableDiscounts([]) })
    return () => controller.abort()
  }, [form.productId, form.salesDate])

  const finalPrice = form.salePrice - (form.appliedDiscount / 100) * form.salePrice

  const validationErrors: string[] = []
  if (!form.productId) validationErrors.push('Product is required')
  if (!form.salesPersonId) validationErrors.push('Sales Person is required')
  if (!form.customerId) validationErrors.push('Customer is required')
  if (!form.salesDate) validationErrors.push('Sales Date is required')
  if (!form.salePrice) validationErrors.push('Sale Price is required')

  const handleSave = async () => {
    if (validationErrors.length > 0) return
    const payload = { ...form, finalPrice }
    if (mode === PageMode.Add) {
      await create(payload)
    } else {
      await update({ salesId: salesId!, ...payload })
    }
    navigate('/sales')
  }

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        {mode === PageMode.Add ? 'New Sale' : 'Edit Sale'}
      </h1>

      {error && <p className="text-destructive mb-4">Error: {error}</p>}
      {validationErrors.length > 0 && (
        <ul className="mb-4 text-sm text-destructive list-disc list-inside">
          {validationErrors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground">Product</label>
          <EntityCombobox<Product>
            value={form.productId || null}
            displayValue={selectedProductName}
            placeholder="Select product..."
            searchPlaceholder="Search products..."
            emptyMessage="No products found."
            fetchOptions={fetchProducts}
            getItemId={(p) => p.productId}
            getItemLabel={(p) => p.name}
            onSelect={(p) => {
              setForm((prev) => ({ ...prev, productId: p.productId, salePrice: p.salePrice }))
              setSelectedProductName(p.name)
            }}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground">Sales Person</label>
          <EntityCombobox<SalesPerson>
            value={form.salesPersonId || null}
            displayValue={selectedSpName}
            placeholder="Select sales person..."
            searchPlaceholder="Search sales persons..."
            emptyMessage="No sales persons found."
            fetchOptions={fetchSalesPersons}
            getItemId={(sp) => sp.salesPersonId}
            getItemLabel={(sp) => `${sp.firstName} ${sp.lastName}`}
            onSelect={(sp) => {
              setForm((prev) => ({ ...prev, salesPersonId: sp.salesPersonId }))
              setSelectedSpName(`${sp.firstName} ${sp.lastName}`)
            }}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground">Customer</label>
          <EntityCombobox<Customer>
            value={form.customerId || null}
            displayValue={selectedCustomerName}
            placeholder="Select customer..."
            searchPlaceholder="Search customers..."
            emptyMessage="No customers found."
            fetchOptions={fetchCustomers}
            getItemId={(c) => c.customerId}
            getItemLabel={(c) => `${c.firstName} ${c.lastName}`}
            onSelect={(c) => {
              setForm((prev) => ({ ...prev, customerId: c.customerId }))
              setSelectedCustomerName(`${c.firstName} ${c.lastName}`)
            }}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="salesDate">
            Sales Date
          </label>
          <Input
            id="salesDate"
            type="date"
            value={form.salesDate}
            onChange={(e) => setForm((prev) => ({ ...prev, salesDate: e.target.value }))}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="salePrice">
            Sale Price
          </label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            value={form.salePrice}
            onChange={(e) => setForm((prev) => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="appliedDiscount">
            Applied Discount %
            {availableDiscounts.length > 0 && (
              <span className="ml-2 text-xs font-medium text-primary">
                {availableDiscounts.length} discount{availableDiscounts.length > 1 ? 's' : ''} available
              </span>
            )}
          </label>
          <Input
            id="appliedDiscount"
            type="number"
            step="0.01"
            value={form.appliedDiscount}
            onChange={(e) => setForm((prev) => ({ ...prev, appliedDiscount: parseFloat(e.target.value) || 0 }))}
          />
          {availableDiscounts.length > 0 && (
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              defaultValue=""
              onChange={(e) => {
                const pct = parseFloat(e.target.value)
                if (!isNaN(pct)) setForm((prev) => ({ ...prev, appliedDiscount: pct }))
              }}
            >
              <option value="" disabled>Apply available discount...</option>
              {availableDiscounts.map((d) => (
                <option key={d.discountId} value={d.discountPercentage}>
                  {d.discountPercentage}% (ends {d.endDate ?? 'no expiry'})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground">Final Price</label>
          <Input
            type="number"
            readOnly
            value={finalPrice.toFixed(2)}
            className="bg-muted cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} disabled={loading || validationErrors.length > 0}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/sales')} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
