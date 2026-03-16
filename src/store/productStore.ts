import { create } from 'zustand'
import { api } from './api'
import type { Product, PagedResult } from './types'
import {
  paginationInitialState,
  createPaginationActions,
  type IPaginationState,
  type IPaginationActions,
} from './pagination'

interface IProductStore extends IPaginationState, IPaginationActions {
  items: Product[]
  selected: Product | null
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchOne: (id: number) => Promise<Product | null>
  create: (data: Omit<Product, 'productId'>) => Promise<void>
  update: (data: Product) => Promise<void>
  remove: (id: number) => Promise<void>
  clearFilters: () => void
}

export const useProductStore = create<IProductStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
  ...paginationInitialState,
  ...createPaginationActions(set, get),

  clearFilters: () => { set({ search: '', page: 0 }); get().fetchAll() },

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
      const result = await api.get<PagedResult<Product>>(`/products?${params}`)
      set({ items: result.items, totalCount: result.count, cursor: result.cursor })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Product>(`/products/${id}`)
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
      const created = await api.post<Product>('/products', data)
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
      await api.put('/products', data)
      set((s) => ({
        items: s.items.map((p) => (p.productId === data.productId ? data : p)),
        selected: s.selected?.productId === data.productId ? data : s.selected,
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
      await api.delete(`/products/${id}`)
      set((s) => ({ selected: s.selected?.productId === id ? null : s.selected }))
      await get().fetchAll()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },
}))
