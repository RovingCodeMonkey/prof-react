export interface IPaginationState {
  page: number
  pageSize: number
  totalCount: number
  cursor: number | null
  search: string
  sortBy: string
  ascending: boolean
}

export interface IPaginationActions {
  setSearch: (value: string) => void
  setSort: (column: string) => void
  nextPage: () => void
  prevPage: () => void
}

export const paginationInitialState: IPaginationState = {
  page: 0,
  pageSize: 20,
  totalCount: 0,
  cursor: null,
  search: '',
  sortBy: '',
  ascending: true,
}

type PaginationGet = () => IPaginationState & { fetchAll: () => void }

export function createPaginationActions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (partial: any) => void,
  get: PaginationGet
): IPaginationActions {
  return {
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
  }
}
