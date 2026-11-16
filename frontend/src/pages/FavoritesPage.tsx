import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useSessionStore } from '../store/sessionStore'
import { useClearFavorites, useFavorites, useRemoveFavorite, useUpdateNote } from '../hooks/useFavorites'
import MealCard, { MealGrid, MealGridSkeleton } from '../components/MealCard'
import PageHeader from '../components/PageHeader'
import { EmptyState, ErrorState } from '../components/StateViews'
import AccountSync from '../components/AccountSync'
import { TrashIcon } from '../components/icons'
import type { Favorite } from '../types/meal'

export default function FavoritesPage() {
  const user = useSessionStore((state) => state.user)
  const favorites = useFavorites()
  const clear = useClearFavorites()
  const confirmRef = useRef<HTMLDialogElement>(null)

  if (!user) {
    return (
      <>
        <PageHeader title="My Recipes" subtitle="Your personal recipe collection, saved in the Janpod database." />
        <AccountSync />
      </>
    )
  }

  if (favorites.isPending) {
    return (
      <>
        <PageHeader title="My Recipes" />
        <AccountSync />
        <MealGridSkeleton count={4} />
      </>
    )
  }

  if (favorites.isError) {
    return (
      <>
        <PageHeader title="My Recipes" />
        <AccountSync />
        <ErrorState
          title="Couldn't load your recipes"
          error={favorites.error}
          onRetry={() => favorites.refetch()}
          isRetrying={favorites.isFetching}
        />
      </>
    )
  }

  const list = favorites.data

  if (list.length === 0) {
    return (
      <>
        <PageHeader title="My Recipes" />
        <AccountSync />
        <EmptyState
          icon="💛"
          title="No saved recipes yet"
          description="Tap the heart on any recipe card or “Save recipe” on a recipe page. Saved recipes are stored in the database under your email."
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
              {list.length} {list.length === 1 ? 'recipe' : 'recipes'}
            </span>
          </span>
        }
        subtitle="Saved in the Janpod database, so they follow you to any device."
        actions={
          <button type="button" className="btn btn-outline btn-sm rounded-full" onClick={() => confirmRef.current?.showModal()}>
            <TrashIcon className="size-4" /> Clear all
          </button>
        }
      />

      <AccountSync />

      <MealGrid>
        {list.map((fav) => (
          <MealCard key={fav.mealId} meal={fav.meal} footer={<FavoriteFooter favorite={fav} />} />
        ))}
      </MealGrid>

      <dialog ref={confirmRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Clear all saved recipes?</h3>
          <p className="py-3 text-base-content/70">
            All {list.length} saved {list.length === 1 ? 'recipe' : 'recipes'} will be removed.
          </p>
          <form method="dialog" className="modal-action">
            <button className="btn btn-ghost rounded-full">Cancel</button>
            <button className="btn btn-error rounded-full" onClick={() => clear.mutate()}>
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

/** ส่วนท้ายการ์ด: โน้ต (Update) + ปุ่มลบ (Delete) */
function FavoriteFooter({ favorite }: { favorite: Favorite }) {
  const remove = useRemoveFavorite()
  const updateNote = useUpdateNote()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(favorite.note ?? '')

  function save() {
    updateNote.mutate({ mealId: favorite.mealId, note: draft })
    setEditing(false)
  }

  return (
    <div className="space-y-2">
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            maxLength={200}
            placeholder="e.g. Cook this on Saturday"
            className="textarea textarea-bordered textarea-sm w-full"
            aria-label="Note"
            autoFocus
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary btn-xs flex-1 rounded-full" onClick={save}>
              Save
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs flex-1 rounded-full"
              onClick={() => {
                setDraft(favorite.note ?? '')
                setEditing(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="w-full rounded-box bg-base-200 px-3 py-2 text-left text-sm hover:bg-base-300"
          onClick={() => setEditing(true)}
          title="Edit note"
        >
          {favorite.note ? (
            <span>📝 {favorite.note}</span>
          ) : (
            <span className="text-base-content/50">+ Add a note</span>
          )}
        </button>
      )}
      <button
        type="button"
        className="btn btn-outline btn-primary btn-sm w-full rounded-full"
        onClick={() => remove.mutate(favorite.mealId)}
      >
        Remove
      </button>
    </div>
  )
}
