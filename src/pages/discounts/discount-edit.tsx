import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { format, parseISO } from 'date-fns'
import { useDiscountStore } from '@/store/discountStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityCombobox } from '@/components/entity-combobox'
import { fetchProducts } from '@/lib/fetch-helpers'
import type { Discount, Product } from '@/store/types'
import { PageMode } from '../constants'

export function DiscountEditPage() {
  const { discountId: discountIdQuery } = useParams<{ discountId: string }>()
  const navigate = useNavigate()

  const discountId = discountIdQuery !== undefined ? parseInt(discountIdQuery, 10) : undefined

  const mode = discountId === undefined ? PageMode.Add : PageMode.Edit

  const { loading, error } = useDiscountStore(
    useShallow((s) => ({ loading: s.loading, error: s.error }))
  )
  const fetchOne = useDiscountStore((s) => s.fetchOne)
  const create = useDiscountStore((s) => s.create)
  const update = useDiscountStore((s) => s.update)

  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState<Omit<Discount, 'discountId' | 'product'>>({
    productId: 0,
    beginDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: null,
    discountPercentage: 0,
  })
  const [selectedProductName, setSelectedProductName] = useState('')

  useEffect(() => {
    if (mode === PageMode.Edit) {
      fetchOne(discountId!).then((discount) => {
        if (discount) {
          setForm({
            productId: discount.productId,
            beginDate: format(parseISO(discount.beginDate), 'yyyy-MM-dd'),
            endDate: discount.endDate ? format(parseISO(discount.endDate), 'yyyy-MM-dd') : null,
            discountPercentage: discount.discountPercentage,
          })
          setSelectedProductName(discount.product?.name ?? '')
        }
      })
    }
  }, [fetchOne, mode, discountId])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const validationErrors: string[] = []
  if (!form.productId) validationErrors.push('Product is required')
  if (!form.beginDate) validationErrors.push('Begin Date is required')
  if (!form.endDate) validationErrors.push('End Date is required')
  if (!form.discountPercentage) validationErrors.push('Discount % is required')

  const handleSave = async () => {
    setSubmitted(true)
    if (validationErrors.length > 0) return
    if (mode === PageMode.Add) {
      await create(form)
    } else {
      await update({ discountId: discountId!, ...form })
    }
    navigate('/discounts')
  }

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        {mode === PageMode.Add ? 'New Discount' : 'Edit Discount'}
      </h1>

      {error && <p className="text-destructive mb-4">Error: {error}</p>}
      {submitted && validationErrors.length > 0 && (
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
            getItemLabel={(p) => `${p.name} - ${p.manufacturer}`}
            onSelect={(p) => {
              setForm((prev) => ({ ...prev, productId: p.productId }))
              setSelectedProductName(`${p.name} - ${p.manufacturer}`)
            }}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="beginDate">
            Begin Date
          </label>
          <Input
            id="beginDate"
            type="date"
            value={form.beginDate}
            onChange={(e) => handleChange('beginDate', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="endDate">
            End Date
          </label>
          <Input
            id="endDate"
            type="date"
            value={form.endDate ?? ''}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, endDate: e.target.value || null }))
            }
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="discountPercentage">
            Discount %
          </label>
          <Input
            id="discountPercentage"
            type="number"
            step="0.01"
            value={form.discountPercentage}
            onChange={(e) => handleChange('discountPercentage', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} disabled={loading || (submitted && validationErrors.length > 0)}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/discounts')} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
