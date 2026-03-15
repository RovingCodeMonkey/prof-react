import { create } from 'zustand'
import { api } from './api'
import type { Product, PagedResult } from './types'

interface IProductStore {
  items: Product[]
  selected: Product | null
  loading: boolean
  error: string | null
  // pagination & query state
  page: number
  pageSize: number
  totalCount: number
  cursor: number | null
  search: string
  sortBy: string
  ascending: boolean
  // actions
  fetchAll: () => Promise<void>
  setSearch: (value: string) => void
  setSort: (column: string) => void
  nextPage: () => void
  prevPage: () => void
  fetchOne: (id: number) => Promise<Product | null>
  create: (data: Omit<Product, 'productId'>) => Promise<void>
  update: (data: Product) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useProductStore = create<IProductStore>((set, get) => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
  page: 0,
  pageSize: 3,
  totalCount: 0,
  cursor: null,
  search: '',
  sortBy: '',
  ascending: true,

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
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  setSearch: (value) => {
    set({ search: value, page: 0 })
    get().fetchAll()
  },

  setSort: (column) => {
    const { sortBy, ascending } = get()
    if (sortBy === column) {
      set({ ascending: !ascending, page: 0 })
    } else {
      set({ sortBy: column, ascending: true, page: 0 })
    }
    get().fetchAll()
  },

  nextPage: () => {
    const { cursor } = get()
    if (cursor === null) return
    set({ page: cursor })
    get().fetchAll()
  },

  prevPage: () => {
    const { page } = get()
    if (page === 0) return
    set({ page: page - 1 })
    get().fetchAll()
  },

  fetchOne: async (id) => {
    const cached = get().items.find((p) => p.productId === id)
    if (cached) {
      set({ selected: cached })
      return cached;
    }
    set({ loading: true, error: null })
    try {
      const selected = await api.get<Product>(`/products/${id}`)
      set({ selected })
      return selected;
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
    return null;
  },

  create: async (data) => {
    set({ loading: true, error: null })
    try {
      const created = await api.post<Product>('/products', data)
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
      await api.put('/products', data)
      set((s) => ({
        items: s.items.map((p) => (p.productId === data.productId ? data : p)),
        selected: s.selected?.productId === data.productId ? data : s.selected,
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
      await api.delete(`/products/${id}`)
      set((s) => ({
        items: s.items.filter((p) => p.productId !== id),
        selected: s.selected?.productId === id ? null : s.selected,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },
}))
