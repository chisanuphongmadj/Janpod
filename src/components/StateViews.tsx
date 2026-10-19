import type { ReactNode } from 'react'
import { ApiError } from '../api/mealdb'
import { RefreshIcon } from './icons'

interface ErrorStateProps {
  title?: string
  error?: Error | null
  onRetry: () => void
  isRetrying?: boolean
}

/** Shown on isError / network failure, with a Retry button */
export function ErrorState({
  title = "Couldn't load data",
  error,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine
  // ApiError already has a readable message; anything else (e.g. TypeError: Failed to fetch) is a network failure
  const message = offline
    ? "You appear to be offline. Check your internet connection and try again."
    : error instanceof ApiError
      ? error.message
      : "Couldn't reach the TheMealDB server. Please try again."

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-box border border-error/30 bg-error/5 px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden="true">🍳</span>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-base-content/70">{message}</p>
      <button type="button" className="btn btn-primary rounded-full" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? <span className="loading loading-spinner loading-sm" /> : <RefreshIcon />}
        Try again
      </button>
    </div>
  )
}

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon = '🍽️', title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-box bg-base-200 px-6 py-12 text-center">
      <span className="text-5xl" aria-hidden="true">{icon}</span>
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="text-sm text-base-content/70">{description}</p>}
      {action}
    </div>
  )
}

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-base-content/60" role="status">
      <span className="loading loading-spinner loading-lg text-primary" />
      {label}
    </div>
  )
}
