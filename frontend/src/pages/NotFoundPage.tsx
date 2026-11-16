import { Link, useLocation } from 'react-router'
import { EmptyState } from '../components/StateViews'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  return (
    <EmptyState
      icon="🍽️"
      title="Page not found (404)"
      description={`There is no page at ${pathname}.`}
      action={
        <Link to="/" className="btn btn-primary rounded-full">
          Back to home
        </Link>
      }
    />
  )
}
