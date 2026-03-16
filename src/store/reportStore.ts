import { create } from 'zustand'
import { api } from './api'
import type { Sale, ReportResult } from './types'

function currentQuarter() {
  return Math.ceil((new Date().getMonth() + 1) / 3)
}

interface IReportStore {
  items: Sale[]
  count: number
  totalSales: number
  totalCommission: number
  loading: boolean
  error: string | null
  year: number
  quarter: number
  productIdFilter: number | null
  salesPersonIdFilter: number | null
  customerIdFilter: number | null
  productFilterName: string
  spFilterName: string
  customerFilterName: string
  fetchAll: () => Promise<void>
  setYear: (year: number) => void
  setQuarter: (quarter: number) => void
  setProductIdFilter: (id: number | null, name: string) => void
  setSpIdFilter: (id: number | null, name: string) => void
  setCustomerIdFilter: (id: number | null, name: string) => void
  clearFilters: () => void
}

export const useReportStore = create<IReportStore>((set, get) => ({
  items: [],
  count: 0,
  totalSales: 0,
  totalCommission: 0,
  loading: false,
  error: null,
  year: new Date().getFullYear(),
  quarter: currentQuarter(),
  productIdFilter: null,
  salesPersonIdFilter: null,
  customerIdFilter: null,
  productFilterName: '',
  spFilterName: '',
  customerFilterName: '',

  fetchAll: async () => {
    const { year, quarter, productIdFilter, salesPersonIdFilter, customerIdFilter } = get()
    const params = new URLSearchParams({ year: String(year), quarter: String(quarter) })
    if (productIdFilter) params.set('productId', String(productIdFilter))
    if (salesPersonIdFilter) params.set('salesPersonId', String(salesPersonIdFilter))
    if (customerIdFilter) params.set('customerId', String(customerIdFilter))

    set({ loading: true, error: null })
    try {
      const result = await api.get<ReportResult>(`/reports?${params}`)
      set({ items: result.items, count: result.count, totalSales: result.totalSales, totalCommission: result.totalCommission })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },

  setYear: (year) => { set({ year }); get().fetchAll() },
  setQuarter: (quarter) => { set({ quarter }); get().fetchAll() },
  setProductIdFilter: (id, name) => { set({ productIdFilter: id, productFilterName: name }); get().fetchAll() },
  setSpIdFilter: (id, name) => { set({ salesPersonIdFilter: id, spFilterName: name }); get().fetchAll() },
  setCustomerIdFilter: (id, name) => { set({ customerIdFilter: id, customerFilterName: name }); get().fetchAll() },
  clearFilters: () => {
    set({
      year: new Date().getFullYear(), quarter: currentQuarter(),
      productIdFilter: null, productFilterName: '',
      salesPersonIdFilter: null, spFilterName: '',
      customerIdFilter: null, customerFilterName: '',
    })
    get().fetchAll()
  },
}))