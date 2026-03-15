import { create } from 'zustand'
import { api } from './api'
import type { SalesPerson } from './types'

interface ISalesPersonStore {
  items: SalesPerson[]
  selected: SalesPerson | null
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchOne: (id: number) => Promise<void>
  create: (data: Omit<SalesPerson, 'salesPersonId'>) => Promise<void>
  update: (data: SalesPerson) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useSalesPersonStore = create<ISalesPersonStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await api.get<SalesPerson[]>('/salespersons')
      set({ items })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchOne: async (id) => {
    const cached = get().items.find((sp) => sp.salesPersonId === id)
    if (cached) {
      set({ selected: cached })
      return
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<SalesPerson>(`/salespersons/${id}`)
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
