import { create } from 'zustand'
import { api } from './api'
import type { Discount } from './types'

interface IDiscountStore {
  items: Discount[]
  selected: Discount | null
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchOne: (id: number) => Promise<void>
  create: (data: Omit<Discount, 'discountId' | 'product'>) => Promise<void>
  update: (data: Discount) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useDscountStore = create<IDiscountStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await api.get<Discount[]>('/discounts')
      set({ items })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchOne: async (id) => {
    const cached = get().items.find((d) => d.discountId === id)
    if (cached) {
      set({ selected: cached })
      return
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Discount>(`/discounts/${id}`)
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
      const created = await api.post<Discount>('/discounts', data)
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
      await api.put('/discounts', data)
      set((s) => ({
        items: s.items.map((d) => (d.discountId === data.discountId ? data : d)),
        selected: s.selected?.discountId === data.discountId ? data : s.selected,
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
      await api.delete(`/discounts/${id}`)
      set((s) => ({
        items: s.items.filter((d) => d.discountId !== id),
        selected: s.selected?.discountId === id ? null : s.selected,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },
}))
