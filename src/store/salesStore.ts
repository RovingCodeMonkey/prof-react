import { create } from 'zustand'
import { api } from './api'
import type { Sale, PagedResult } from './types'
import {
  paginationInitialState,
  createPaginationActions,
  type IPaginationState,
  type IPaginationActions,
} from './pagination'

interface ISalesStore extends IPaginationState, IPaginationActions {
  items: Sale[]
  selected: Sale | null
  loading: boolean
  error: string | null
  productIdFilter: number | null
  salesPersonIdFilter: number | null
  customerIdFilter: number | null
  productFilterName: string
  spFilterName: string
  customerFilterName: string
  startDateFilter: string
  endDateFilter: string
  fetchAll: () => Promise<void>
  fetchOne: (id: number) => Promise<Sale | null>
  create: (data: Omit<Sale, 'salesId' | 'product' | 'salesPerson' | 'customer'>) => Promise<void>
  update: (data: Sale) => Promise<void>
  remove: (id: number) => Promise<void>
  setProductIdFilter: (id: number | null, name: string) => void
  setSpIdFilter: (id: number | null, name: string) => void
  setCustomerIdFilter: (id: number | null, name: string) => void
  setStartDateFilter: (date: string) => void
  setEndDateFilter: (date: string) => void
  clearFilters: () => void
}

export const useSalesStore = create<ISalesStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
  productIdFilter: null,
  salesPersonIdFilter: null,
  customerIdFilter: null,
  productFilterName: '',
  spFilterName: '',
  customerFilterName: '',
  startDateFilter: '',
  endDateFilter: '',
  ...paginationInitialState,
  ...createPaginationActions(set, get),

  setProductIdFilter: (id, name) => { set({ productIdFilter: id, productFilterName: name, page: 0 }); get().fetchAll() },
  setSpIdFilter: (id, name) => { set({ salesPersonIdFilter: id, spFilterName: name, page: 0 }); get().fetchAll() },
  setCustomerIdFilter: (id, name) => { set({ customerIdFilter: id, customerFilterName: name, page: 0 }); get().fetchAll() },
  setStartDateFilter: (date) => { set({ startDateFilter: date, page: 0 }); get().fetchAll() },
  setEndDateFilter: (date) => { set({ endDateFilter: date, page: 0 }); get().fetchAll() },
  clearFilters: () => { set({ productIdFilter: null, productFilterName: '', salesPersonIdFilter: null, spFilterName: '', customerIdFilter: null, customerFilterName: '', startDateFilter: '', endDateFilter: '', page: 0 }); get().fetchAll() },

  fetchAll: async () => {
    const { page, pageSize, sortBy, ascending, productIdFilter, salesPersonIdFilter, customerIdFilter, startDateFilter, endDateFilter } = get()
    const params = new URLSearchParams({
      page: String(page),
      count: String(pageSize),
      ascending: String(ascending),
    })
    if (sortBy) params.set('sortBy', sortBy)
    if (productIdFilter) params.set('productId', String(productIdFilter))
    if (salesPersonIdFilter) params.set('salesPersonId', String(salesPersonIdFilter))
    if (customerIdFilter) params.set('customerId', String(customerIdFilter))
    if (startDateFilter) params.set('startDate', startDateFilter)
    if (endDateFilter) params.set('endDate', endDateFilter)

    set({ loading: true, error: null })
    try {
      const result = await api.get<PagedResult<Sale>>(`/sales?${params}`)
      set({ items: result.items, totalCount: result.count, cursor: result.cursor })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },

  fetchOne: async (id) => {
    const cached = get().items.find((s) => s.salesId === id)
    if (cached) {
      set({ selected: cached })
      return cached
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Sale>(`/sales/${id}`)
      set({ selected })
      return selected
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
      return null
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    set({ loading: true, error: null })
    try {
      const created = await api.post<Sale>('/sales', data)
      set((s) => ({ items: [...s.items, created] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  update: async (data) => {
    set({ loading: true, error: null })
    try {
      await api.put('/sales', data)
      set((s) => ({
        items: s.items.map((sale) => (sale.salesId === data.salesId ? data : sale)),
        selected: s.selected?.salesId === data.salesId ? data : s.selected,
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/sales/${id}`)
      set((s) => ({ selected: s.selected?.salesId === id ? null : s.selected }))
      await get().fetchAll()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },
}))
