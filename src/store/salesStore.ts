import { create } from 'zustand'
import { api } from './api'
import type { Sale } from './types'

interface ISalesStore {
  items: Sale[]
  selected: Sale | null
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchOne: (id: number) => Promise<void>
  create: (data: Omit<Sale, 'salesId' | 'product' | 'salesPerson' | 'customer'>) => Promise<void>
  update: (data: Sale) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useSalesStore = create<ISalesStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await api.get<Sale[]>('/sales')
      set({ items })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchOne: async (id) => {
    const cached = get().items.find((s) => s.salesId === id)
    if (cached) {
      set({ selected: cached })
      return
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Sale>(`/sales/${id}`)
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
      const created = await api.post<Sale>('/sales', data)
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
      await api.put('/sales', data)
      set((s) => ({
        items: s.items.map((sale) => (sale.salesId === data.salesId ? data : sale)),
        selected: s.selected?.salesId === data.salesId ? data : s.selected,
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
      await api.delete(`/sales/${id}`)
      set((s) => ({
        items: s.items.filter((sale) => sale.salesId !== id),
        selected: s.selected?.salesId === id ? null : s.selected,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },
}))
