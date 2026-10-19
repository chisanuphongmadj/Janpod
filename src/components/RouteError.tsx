import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import Logo from './Logo'

/** errorElement of the root route: catches errors thrown while rendering */
export default function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-base-200 p-6 text-center">
      <Logo className="size-16" />
      <h1 className="text-2xl font-extrabold">Sorry, something went wrong</h1>
      <p className="max-w-md text-base-content/70">{message}</p>
      <div className="flex gap-2">
        <button type="button" className="btn btn-outline rounded-full" onClick={() => window.location.reload()}>
          Reload page
        </button>
        <Link to="/" className="btn btn-primary rounded-full">
          Back to home
        </Link>
      </div>
    </div>
  )
}
