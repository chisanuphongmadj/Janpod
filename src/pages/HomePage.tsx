import { useState, type FormEvent } from 'react'
import { useCategories, useMealList } from '../hooks/useMeals'
import { useFilterStore } from '../store/filterStore'
import MealCard, { MealGrid, MealGridSkeleton } from '../components/MealCard'
import { EmptyState, ErrorState } from '../components/StateViews'
import { RefreshIcon, SearchIcon } from '../components/icons'

export default function HomePage() {
  const search = useFilterStore((state) => state.search)
  const category = useFilterStore((state) => state.category)
  const setSearch = useFilterStore((state) => state.setSearch)
  const setCategory = useFilterStore((state) => state.setCategory)
  const resetFilters = useFilterStore((state) => state.reset)

  // The search box text stays local until the form is submitted
  const [draft, setDraft] = useState(search)

  const meals = useMealList(search, category)
  const categories = useCategories()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(draft.trim())
  }

  function handleReset() {
    setDraft('')
    resetFilters()
  }

  const hasFilter = search !== '' || category !== null

  return (
    <div className="space-y-6">
      {/* Hero + search */}
      <section className="relative overflow-hidden rounded-box bg-neutral px-5 py-8 text-neutral-content sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -top-20 -right-20 size-40 rounded-full bg-primary/60 sm:-top-16 sm:-right-16 sm:size-72 sm:bg-primary/80" />
        <div className="pointer-events-none absolute top-10 right-24 hidden size-24 rounded-full bg-warning md:block" />
        <div className="relative max-w-xl">
          <p className="text-sm font-bold tracking-widest text-warning uppercase">Recipes from around the world</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
            What are you <span className="text-warning">cooking today?</span>
          </h1>
          <p className="mt-2 text-neutral-content/80">
            Search for a dish, check the ingredients and steps, then tap the heart to save it for later.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex gap-2" role="search">
            <label className="input input-lg w-full rounded-full border-0 bg-base-100 text-base-content">
              <SearchIcon className="size-5 opacity-50" />
              <input
                type="search"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Search e.g. Chicken, Pasta"
                aria-label="Search recipes"
              />
            </label>
            <button type="submit" className="btn btn-primary btn-lg rounded-full px-6">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section aria-label="Categories">
        {categories.isPending ? (
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="skeleton h-8 w-24 shrink-0 rounded-full" />
            ))}
          </div>
        ) : categories.isError ? (
          <div className="flex items-center gap-2 text-sm text-error">
            Couldn't load categories.
            <button type="button" className="btn btn-xs btn-outline btn-error rounded-full" onClick={() => categories.refetch()}>
              <RefreshIcon className="size-3" /> Retry
            </button>
          </div>
        ) : (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            <CategoryChip label="All" active={category === null} onClick={() => setCategory(null)} />
            {categories.data.map((c) => (
              <CategoryChip
                key={c.idCategory}
                label={c.strCategory}
                active={category === c.strCategory}
                onClick={() => setCategory(c.strCategory)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Results */}
      <section aria-live="polite">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">
            {search ? `Results for “${search}”` : category ? `${category} recipes` : 'Featured recipes'}
            {category && search && <span className="text-base-content/60"> in {category}</span>}
          </h2>
          <div className="flex items-center gap-2">
            {meals.isSuccess && (
              <span className="badge badge-ghost">
                {meals.data.length} {meals.data.length === 1 ? 'recipe' : 'recipes'}
              </span>
            )}
            {meals.isFetching && !meals.isPending && <span className="loading loading-spinner loading-xs text-primary" />}
            {hasFilter && (
              <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={handleReset}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {meals.isPending ? (
          <MealGridSkeleton count={12} />
        ) : meals.isError ? (
          <ErrorState error={meals.error} onRetry={() => meals.refetch()} isRetrying={meals.isFetching} />
        ) : meals.data.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No recipes found"
            description="Try another name such as Curry, Cake or Soup, or pick a different category."
            action={
              <button type="button" className="btn btn-primary rounded-full" onClick={handleReset}>
                Show all recipes
              </button>
            }
          />
        ) : (
          <MealGrid>
            {meals.data.map((meal) => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </MealGrid>
        )}
      </section>
    </div>
  )
}

interface CategoryChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`btn btn-sm shrink-0 rounded-full ${active ? 'btn-primary' : 'btn-outline border-base-300 bg-base-100 font-normal'}`}
    >
      {label}
    </button>
  )
}
