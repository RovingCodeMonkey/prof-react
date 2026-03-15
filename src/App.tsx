import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from './layouts/root-layout'
import { HomePage } from './pages/home'
import { CustomersPage } from './pages/customers'
import { DiscountsPage } from './pages/discounts'
import { ProductsPage } from './pages/products'
import { ProductEditPage } from './pages/products/product-edit'
import { SalesPage } from './pages/sales'
import { SalespersonPage } from './pages/salesperson'
import { ErrorPage } from './pages/error'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/customers', element: <CustomersPage /> },
      { path: '/discounts', element: <DiscountsPage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <ProductEditPage /> },
      { path: '/products/:productId', element: <ProductEditPage /> },
      { path: '/sales', element: <SalesPage /> },
      { path: '/salesperson', element: <SalespersonPage /> },
      { path: '*', element: <ErrorPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
