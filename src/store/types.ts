export interface Customer {
  customerId: number
  firstName: string
  lastName: string
  address: string | null
  phone: string
  startDate: string
}

export interface Product {
  productId: number
  name: string
  manufacturer: string
  style: string
  purchasePrice: number
  salePrice: number
  qtyOnHand: number
  commisionPercentage: number
}

export interface SalesPerson {
  salesPersonId: number
  firstName: string
  lastName: string
  address: string | null
  phone: string
  startDate: string
  terminationDate: string | null
  manager: string | null
}

export interface Sale {
  salesId: number
  productId: number
  salesPersonId: number
  customerId: number
  salesDate: string
  salePrice: number
  appliedDiscount: number
  finalPrice: number
  commisionPercentage: number
  commision: number
  product?: Product
  salesPerson?: SalesPerson
  customer?: Customer
}

export interface ReportResult {
  items: Sale[]
  count: number
  totalSales: number
  totalCommission: number
}

export interface PagedResult<T> {
  items: T[]
  count: number
  cursor: number | null
}

export interface Discount {
  discountId: number
  productId: number
  beginDate: string
  endDate: string
  discountPercentage: number
  product?: Product
}
