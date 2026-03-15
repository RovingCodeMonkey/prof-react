import { create } from 'zustand'
import { api } from './api'
import type { SalesPerson, PagedResult } from './types'
import {
  paginationInitialState,
  createPaginationActions,
  type IPaginationState,
  type IPaginationActions,
} from './pagination'

interface ISalesPersonStore extends IPaginationState, IPaginationActions {
  items: SalesPerson[]
  selected: SalesPerson | null
  loading: boolean
  error: string | null
  phone: string
  fetchAll: () => Promise<void>
  setPhone: (value: string) => void
  fetchOne: (id: number) => Promise<SalesPerson | null>
  create: (data: Omit<SalesPerson, 'salesPersonId'>) => Promise<void>
  update: (data: SalesPerson) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useSalesPersonStore = create<ISalesPersonStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
  phone: '',
  ...paginationInitialState,
  ...createPaginationActions(set, get),

  fetchAll: async () => {
    const { page, pageSize, search, phone, sortBy, ascending } = get()
    const params = new URLSearchParams({
      page: String(page),
      count: String(pageSize),
      ascending: String(ascending),
    })
    if (search) params.set('search', search)
    if (phone) params.set('phone', phone)
    if (sortBy) params.set('sortBy', sortBy)

    set({ loading: true, error: null })
    try {
      const result = await api.get<PagedResult<SalesPerson>>(`/salespersons?${params}`)
      set({ items: result.items, totalCount: result.count, cursor: result.cursor })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  setPhone: (value) => {
    set({ phone: value, page: 0 })
    get().fetchAll()
  },

  fetchOne: async (id) => {
    const cached = get().items.find((sp) => sp.salesPersonId === id)
    if (cached) {
      set({ selected: cached })
      return cached
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<SalesPerson>(`/salespersons/${id}`)
      set({ selected })
      return selected
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    set({ loading: true, error: null })
    try {
      const created = await api.post<SalesPerson>('/salespersons', data)
      set((s) => ({ items: [...s.items, created] }))
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  update: async (data) => {
    set({ loading: true, error: null })
    try {
      await api.put('/salespersons', data)
      set((s) => ({
        items: s.items.map((sp) => (sp.salesPersonId === data.salesPersonId ? data : sp)),
        selected: s.selected?.salesPersonId === data.salesPersonId ? data : s.selected,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/salespersons/${id}`)
      set((s) => ({
        items: s.items.filter((sp) => sp.salesPersonId !== id),
        selected: s.selected?.salesPersonId === id ? null : s.selected,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },
}))
