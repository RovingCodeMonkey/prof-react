import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Product } from '@/store/types'
import { PageMode } from '../constants'

export function ProductEditPage() {
  const { productId: productIdQuery } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const productId = productIdQuery !== undefined ? parseInt(productIdQuery, 10) : undefined

  const mode = productId === undefined ? PageMode.Add : PageMode.Edit

  const { loading, error, fetchOne, create, update } = useProductStore()

  const [form, setForm] = useState<Omit<Product, 'productId'>>({
    name: '',
    manufacturer: '',
    style: '',
    purchasePrice: 0,
    salePrice: 0,
    qtyOnHand: 0,
    commisionPercentage: 0,
  })

  useEffect(() => {
    async function loadProduct() {
      if (mode === PageMode.Edit) {
        const product = await fetchOne(productId!)
        if (product) {
          setForm(product)
        }
      }
    }
    loadProduct();
  }, [fetchOne, mode, productId])  

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSave = async () => {
    if (mode === PageMode.Add) {
      await create(form)
    } else {
      await update({ productId: productId!, ...form })
    }
    navigate('/products')
  }

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        {mode === PageMode.Add ? 'New Product' : 'Edit Product'}
      </h1>

      {error && <p className="text-destructive mb-4">Error: {error}</p>}

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="manufacturer">Manufacturer</label>
          <Input
            id="manufacturer"
            value={form.manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="style">Style</label>
          <Input
            id="style"
            value={form.style}
            onChange={(e) => handleChange('style', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="purchasePrice">Purchase Price</label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={form.purchasePrice}
            onChange={(e) => handleChange('purchasePrice', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="salePrice">Sale Price</label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            value={form.salePrice}
            onChange={(e) => handleChange('salePrice', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="qtyOnHand">Qty On Hand</label>
          <Input
            id="qtyOnHand"
            type="number"
            value={form.qtyOnHand}
            onChange={(e) => handleChange('qtyOnHand', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="commisionPercentage">Commission %</label>
          <Input
            id="commisionPercentage"
            type="number"
            step="0.01"
            value={form.commisionPercentage}
            onChange={(e) => handleChange('commisionPercentage', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/products')} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
