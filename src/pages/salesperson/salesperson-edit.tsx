import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { format, parseISO } from 'date-fns'
import { useSalesPersonStore } from '@/store/salesPersonStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SalesPerson } from '@/store/types'
import { PageMode } from '../constants'

export function SalespersonEditPage() {
  const { salesPersonId : salesPersonIdQuery } = useParams<{ salesPersonId: string }>()
  const navigate = useNavigate()

  const salesPersonId = salesPersonIdQuery !== undefined ? parseInt(salesPersonIdQuery, 10) : undefined

  const mode = salesPersonId === undefined ? PageMode.Add : PageMode.Edit

  const { loading, error } = useSalesPersonStore(
    useShallow((s) => ({ loading: s.loading, error: s.error }))
  )
  const fetchOne = useSalesPersonStore((s) => s.fetchOne)
  const create = useSalesPersonStore((s) => s.create)
  const update = useSalesPersonStore((s) => s.update)

  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState<Omit<SalesPerson, 'salesPersonId'>>({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    terminationDate: '',
    manager: '',
  })

  useEffect(() => {
    if (mode === PageMode.Edit) {
      fetchOne(salesPersonId!).then((sp) => {
        if (sp) {
          setForm({
            firstName: sp.firstName,
            lastName: sp.lastName,
            address: sp.address ?? '',
            phone: sp.phone,
            startDate: format(parseISO(sp.startDate), 'yyyy-MM-dd'),
            terminationDate: sp.terminationDate ? format(parseISO(sp.terminationDate), 'yyyy-MM-dd') : '',
            manager: sp.manager ?? '',
          })
        }
      })
    }
  }, [fetchOne, mode, salesPersonId])

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
    const payload = { ...form, terminationDate: form.terminationDate || null }
    try {
      if (mode === PageMode.Add) {
        await create(payload)
      } else {
        await update({ salesPersonId: salesPersonId!, ...payload })
      }
      navigate('/salesperson')
    } catch {
      // error is set in the store and displayed above
    }
  }

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        {mode === PageMode.Add ? 'New Salesperson' : 'Edit Salesperson'}
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
          <Input id="firstName" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="lastName">Last Name</label>
          <Input id="lastName" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="address">Address</label>
          <Input id="address" value={form.address ?? undefined} onChange={(e) => handleChange('address', e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="phone">Phone</label>
          <Input id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="startDate">Start Date</label>
          <Input id="startDate" type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="terminationDate">Termination Date</label>
          <Input id="terminationDate" type="date" value={form.terminationDate ?? undefined} onChange={(e) => handleChange('terminationDate', e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="manager">Manager</label>
          <Input id="manager" value={form.manager ?? undefined} onChange={(e) => handleChange('manager', e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} disabled={loading || (submitted && validationErrors.length > 0)}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/salesperson')} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
