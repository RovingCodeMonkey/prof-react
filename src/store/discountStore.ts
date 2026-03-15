import { create } from 'zustand'
import { api } from './api'
import type { Discount, PagedResult } from './types'
import {
  paginationInitialState,
  createPaginationActions,
  type IPaginationState,
  type IPaginationActions,
} from './pagination'

interface IDiscountStore extends IPaginationState, IPaginationActions {
  items: Discount[]
  selected: Discount | null
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchOne: (id: number) => Promise<Discount | null>
  create: (data: Omit<Discount, 'discountId' | 'product'>) => Promise<void>
  update: (data: Discount) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useDiscountStore = create<IDiscountStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
  ...paginationInitialState,
  ...createPaginationActions(set, get),

  fetchAll: async () => {
    const { page, pageSize, search, sortBy, ascending } = get()
    const params = new URLSearchParams({
      page: String(page),
      count: String(pageSize),
      ascending: String(ascending),
    })
    if (search) params.set('search', search)
    if (sortBy) params.set('sortBy', sortBy)

    set({ loading: true, error: null })
    try {
      const result = await api.get<PagedResult<Discount>>(`/discounts?${params}`)
      set({ items: result.items, totalCount: result.count, cursor: result.cursor })
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
      return cached
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Discount>(`/discounts/${id}`)
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
