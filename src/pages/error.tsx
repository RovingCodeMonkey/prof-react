import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export function ErrorPage() {
  const error = useRouteError()

  let status: number | undefined
  let message: string

  if (isRouteErrorResponse(error)) {
    status = error.status
    message = error.statusText || error.data
  } else if (error instanceof Error) {
    message = error.message
  } else {
    message = 'An unexpected error occurred.'
  }

  return (
    <section id="center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">{status ?? 'Error'}</h1>
      <p>{message}</p>
      <Link to="/" className="mt-4 underline">
        Go home
      </Link>
    </section>
  )
}
