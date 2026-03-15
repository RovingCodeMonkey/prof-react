import { create } from 'zustand'
import { api } from './api'
import type { Customer } from './types'

interface ICustomerStore {
  items: Customer[]
  selected: Customer | null
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchOne: (id: number) => Promise<void>
  create: (data: Omit<Customer, 'customerId'>) => Promise<void>
  update: (data: Customer) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useCustomerStore = create<ICustomerStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await api.get<Customer[]>('/customers')
      set({ items })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchOne: async (id) => {
    const cached = get().items.find((c) => c.customerId === id)
    if (cached) {
      set({ selected: cached })
      return
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Customer>(`/customers/${id}`)
      set({ selected })
    } catch (e) {
      set({ error: (e as Error).message })
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
      set({ error: (e as Error).message })
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
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/customers/${id}`)
      set((s) => ({
        items: s.items.filter((c) => c.customerId !== id),
        selected: s.selected?.customerId === id ? null : s.selected,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },
}))
