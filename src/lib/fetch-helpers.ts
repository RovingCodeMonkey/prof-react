import { api } from '@/store/api'
import type { Product, SalesPerson, Customer, PagedResult } from '@/store/types'
const dropdownMaxResults = '30'

export async function fetchProducts(search: string): Promise<Product[]> {
  const params = new URLSearchParams({ page: '0', count: dropdownMaxResults, ascending: 'true' })
  if (search) params.set('search', search)
  const result = await api.get<PagedResult<Product>>(`/products?${params}`)
  return result.items ?? []
}

export async function fetchAvailableProducts(search: string): Promise<Product[]> {
  const params = new URLSearchParams({ page: '0', count: dropdownMaxResults, ascending: 'true', instockonly: 'true' })
  if (search) params.set('search', search)
  const result = await api.get<PagedResult<Product>>(`/products?${params}`)
  return result.items ?? []
}

export async function fetchSalesPersons(search: string): Promise<SalesPerson[]> {
  const params = new URLSearchParams({ page: '0', count: dropdownMaxResults, ascending: 'true' })
  if (search) params.set('search', search)
  const result = await api.get<PagedResult<SalesPerson>>(`/salespersons?${params}`)
  return result.items ?? []
}

export async function fetchCustomers(search: string): Promise<Customer[]> {
  const params = new URLSearchParams({ page: '0', count: dropdownMaxResults, ascending: 'true' })
  if (search) params.set('search', search)
  const result = await api.get<PagedResult<Customer>>(`/customers?${params}`)
  return result.items ?? []
}
