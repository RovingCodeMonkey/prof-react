import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from './layouts/root-layout'
import { HomePage } from './pages/home'
import { CustomersPage } from './pages/customers'
import { CustomerEditPage } from './pages/customers/customer-edit'
import { DiscountsPage } from './pages/discounts'
import { DiscountEditPage } from './pages/discounts/discount-edit'
import { ProductsPage } from './pages/products'
import { ProductEditPage } from './pages/products/product-edit'
import { SalesPage } from './pages/sales'
import { SaleEditPage } from './pages/sales/sale-edit'
import { SalespersonPage } from './pages/salesperson'
import { SalespersonEditPage } from './pages/salesperson/salesperson-edit'
import { ReportsPage } from './pages/reports'
import { ErrorPage } from './pages/error'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/customers', element: <CustomersPage /> },
      { path: '/customers/new', element: <CustomerEditPage /> },
      { path: '/customers/:customerId', element: <CustomerEditPage /> },
      { path: '/discounts', element: <DiscountsPage /> },
      { path: '/discounts/new', element: <DiscountEditPage /> },
      { path: '/discounts/:discountId', element: <DiscountEditPage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <ProductEditPage /> },
      { path: '/products/:productId', element: <ProductEditPage /> },
      { path: '/sales', element: <SalesPage /> },
      { path: '/sales/new', element: <SaleEditPage /> },
      { path: '/sales/:salesId', element: <SaleEditPage /> },
      { path: '/salesperson', element: <SalespersonPage /> },
      { path: '/salesperson/new', element: <SalespersonEditPage /> },
      { path: '/salesperson/:salesPersonId', element: <SalespersonEditPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '*', element: <ErrorPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
