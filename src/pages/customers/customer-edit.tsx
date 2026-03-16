import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useCustomerStore } from '@/store/customerStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Customer } from '@/store/types'
import { PageMode } from '../constants'

export function CustomerEditPage() {
  const { customerId: customerIdQuery } = useParams<{ customerId: string }>()
  const navigate = useNavigate()

  const customerId = customerIdQuery !== undefined ? parseInt(customerIdQuery, 10) : undefined

  const mode = customerId === undefined ? PageMode.Add : PageMode.Edit

  const { loading, error } = useCustomerStore(
    useShallow((s) => ({ loading: s.loading, error: s.error }))
  )
  const fetchOne = useCustomerStore((s) => s.fetchOne)
  const create = useCustomerStore((s) => s.create)
  const update = useCustomerStore((s) => s.update)

  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState<Omit<Customer, 'customerId'>>({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    if (mode === PageMode.Edit) {
      fetchOne(customerId!).then((customer) => {
        if (customer) {
          setForm({
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: customer.address,
            phone: customer.phone,
            startDate: format(parseISO(customer.startDate), 'yyyy-MM-dd'),
          })
        }
      })
    }
  }, [fetchOne, mode, customerId])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validationErrors: string[] = []
  if (!form.firstName.trim()) validationErrors.push('First Name is required')
  if (!form.lastName.trim()) validationErrors.push('Last Name is required')
  if (!form.phone.trim()) validationErrors.push('Phone is required')
  if (!form.startDate) validationErrors.push('Start Date is required')

  const handleSave = async () => {
    setSubmitted(true)
    if (validationErrors.length > 0) return
    if (mode === PageMode.Add) {
      await create(form)
    } else {
      await update({ customerId: customerId!, ...form })
    }
    navigate('/customers')
  }

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        {mode === PageMode.Add ? 'New Customer' : 'Edit Customer'}
      </h1>

      {error && <p className="text-destructive mb-4">Error: {error}</p>}
      {submitted && validationErrors.length > 0 && (
        <ul className="mb-4 text-sm text-destructive list-disc list-inside">
          {validationErrors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="firstName">First Name</label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="lastName">Last Name</label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="address">Address</label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="phone">Phone</label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="startDate">Start Date</label>
          <Input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} disabled={loading || (submitted && validationErrors.length > 0)}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/customers')} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
