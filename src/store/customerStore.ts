import { create } from 'zustand'
import { api } from './api'
import type { Customer, PagedResult } from './types'
import {
  paginationInitialState,
  createPaginationActions,
  type IPaginationState,
  type IPaginationActions,
} from './pagination'

interface ICustomerStore extends IPaginationState, IPaginationActions {
  items: Customer[]
  selected: Customer | null
  loading: boolean
  error: string | null
  phone: string
  fetchAll: () => Promise<void>
  setPhone: (value: string) => void
  fetchOne: (id: number) => Promise<Customer | null>
  create: (data: Omit<Customer, 'customerId'>) => Promise<void>
  update: (data: Customer) => Promise<void>
  remove: (id: number) => Promise<void>
  clearFilters: () => void
}

export const useCustomerStore = create<ICustomerStore>((set, get) => ({
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
      const result = await api.get<PagedResult<Customer>>(`/customers?${params}`)
      set({ items: result.items, totalCount: result.count, cursor: result.cursor })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },

  setPhone: (value) => {
    set({ phone: value, page: 0 })
    get().fetchAll()
  },
  clearFilters: () => { set({ search: '', phone: '', page: 0 }); get().fetchAll() },

  fetchOne: async (id) => {
    const cached = get().items.find((c) => c.customerId === id)
    if (cached) {
      set({ selected: cached })
      return cached
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Customer>(`/customers/${id}`)
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
      const created = await api.post<Customer>('/customers', data)
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
      await api.put('/customers', data)
      set((s) => ({
        items: s.items.map((c) => (c.customerId === data.customerId ? data : c)),
        selected: s.selected?.customerId === data.customerId ? data : s.selected,
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
      await api.delete(`/customers/${id}`)
      set((s) => ({ selected: s.selected?.customerId === id ? null : s.selected }))
      await get().fetchAll()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },
}))
