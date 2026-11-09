import { useRef } from 'react'
import { Link } from 'react-router'
import { useFavoritesStore } from '../store/favoritesStore'
import { useMealsByIds } from '../hooks/useMeals'
import MealCard, { MealCardSkeleton, MealGrid } from '../components/MealCard'
import PageHeader from '../components/PageHeader'
import { EmptyState } from '../components/StateViews'
import AccountSync from '../components/AccountSync'
import { RefreshIcon, TrashIcon } from '../components/icons'

export default function FavoritesPage() {
  // Zustand only holds the IDs → the meal data comes from TanStack Query (reusing the cache when possible)
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const clear = useFavoritesStore((state) => state.clear)
  const user = useFavoritesStore((state) => state.user)
  const results = useMealsByIds(favoriteIds)
  const confirmRef = useRef<HTMLDialogElement>(null)

  if (favoriteIds.length === 0) {
    return (
      <>
        <PageHeader title="My Recipes" />
        <AccountSync />
        <EmptyState
          icon="💛"
          title="No saved recipes yet"
          description="Tap the heart on any recipe card or “Save recipe” on a recipe page. Saved recipes stay here even after you close or reload the site."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/" className="btn btn-primary rounded-full">Browse recipes</Link>
              <Link to="/random" className="btn btn-outline rounded-full">Random recipe</Link>
            </div>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            My Recipes{' '}
            <span className="badge badge-primary badge-lg">
              {favoriteIds.length} {favoriteIds.length === 1 ? 'recipe' : 'recipes'}
            </span>
          </span>
        }
        subtitle={user ? 'Saved in the Janpod database, so they follow you to any device.' : "Saved in your browser's LocalStorage, so they're still here after a reload."}
        actions={
          <button type="button" className="btn btn-outline btn-sm rounded-full" onClick={() => confirmRef.current?.showModal()}>
            <TrashIcon className="size-4" /> Clear all
          </button>
        }
      />

      <AccountSync />

      <MealGrid>
        {favoriteIds.map((id, index) => {
          const result = results[index]
          const removeButton = (
            <button type="button" className="btn btn-outline btn-primary btn-sm w-full rounded-full" onClick={() => removeFavorite(id)}>
              Remove
            </button>
          )

          if (!result || result.isPending) return <MealCardSkeleton key={id} />

          if (result.isError) {
            return (
              <div key={id} className="card justify-center gap-3 border border-error/30 bg-error/5 p-4 text-center text-sm">
                <p>Couldn't load recipe {id}.</p>
                <button type="button" className="btn btn-sm btn-primary rounded-full" onClick={() => result.refetch()} disabled={result.isFetching}>
                  {result.isFetching ? <span className="loading loading-spinner loading-xs" /> : <RefreshIcon className="size-4" />}
                  Retry
                </button>
                {removeButton}
              </div>
            )
          }

          if (!result.data) {
            return (
              <div key={id} className="card justify-center gap-3 border border-base-300 p-4 text-center text-sm">
                <p>Recipe {id} no longer exists.</p>
                {removeButton}
              </div>
            )
          }

          return <MealCard key={id} meal={result.data} footer={removeButton} />
        })}
      </MealGrid>

      <dialog ref={confirmRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Clear all saved recipes?</h3>
          <p className="py-3 text-base-content/70">
            All {favoriteIds.length} saved {favoriteIds.length === 1 ? 'recipe' : 'recipes'} will be removed.
          </p>
          <form method="dialog" className="modal-action">
            <button className="btn btn-ghost rounded-full">Cancel</button>
            <button className="btn btn-error rounded-full" onClick={clear}>
              Clear all
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </>
  )
}
