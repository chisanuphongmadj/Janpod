import { Link } from 'react-router'
import { useRandomMeal } from '../hooks/useMeals'
import { getIngredients } from '../lib/meal'
import FavoriteButton from '../components/FavoriteButton'
import { ErrorState } from '../components/StateViews'
import { DiceIcon, GlobeIcon } from '../components/icons'

/** Custom extended page: random recipe "What should I eat today?" */
export default function RandomPage() {
  const { data: meal, isPending, isError, error, isFetching, refetch } = useRandomMeal()
  const ingredients = meal ? getIngredients(meal) : []

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">What should I eat today?</h1>
        <p className="mt-1 text-base-content/70">Can't decide? Hit shuffle for a new recipe every time.</p>
      </header>

      {isPending ? (
        <RandomSkeleton />
      ) : isError ? (
        <ErrorState title="Couldn't get a random recipe" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      ) : (
        <article
          className={`card overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-opacity sm:card-side ${
            isFetching ? 'opacity-50' : ''
          }`}
        >
          <figure className="relative bg-base-200 sm:w-2/5 sm:shrink-0">
            <img src={meal.strMealThumb} alt={meal.strMeal} className="aspect-square size-full object-cover" />
            {isFetching && (
              <span className="loading loading-dots loading-lg absolute text-primary" aria-label="Shuffling" />
            )}
          </figure>
          <div className="card-body gap-4">
            <h2 className="card-title text-2xl font-extrabold sm:text-3xl">{meal.strMeal}</h2>
            <div className="flex flex-wrap gap-2">
              {meal.strCategory && <span className="badge border-0 bg-base-200">{meal.strCategory}</span>}
              {meal.strArea && (
                <span className="badge border-0 bg-base-200">
                  <GlobeIcon className="size-3.5" /> {meal.strArea}
                </span>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-base-content/70">
                Main ingredients ({ingredients.length} items)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ingredients.slice(0, 8).map((ing) => (
                  <span key={ing.name} className="badge badge-outline border-base-300">
                    {ing.name}
                  </span>
                ))}
                {ingredients.length > 8 && <span className="badge badge-ghost">+{ingredients.length - 8}</span>}
              </div>
            </div>
            <p className="line-clamp-3 text-sm text-base-content/70">{meal.strInstructions}</p>
            <div className="card-actions mt-auto">
              <Link to={`/recipe/${meal.idMeal}`} className="btn btn-outline btn-primary rounded-full">
                View full recipe
              </Link>
              <FavoriteButton mealId={meal.idMeal} mealName={meal.strMeal} variant="full" />
            </div>
          </div>
        </article>
      )}

      <div className="mt-8 flex justify-center">
        {/* TanStack Query refetch = get a new random recipe */}
        <button
          type="button"
          className="btn btn-primary btn-lg rounded-full px-10"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? <span className="loading loading-spinner" /> : <DiceIcon />}
          Shuffle again
        </button>
      </div>
    </div>
  )
}

function RandomSkeleton() {
  return (
    <div className="card overflow-hidden border border-base-300 sm:card-side" aria-busy="true">
      <div className="skeleton aspect-square rounded-none sm:w-2/5" />
      <div className="card-body gap-4">
        <div className="skeleton h-9 w-3/4" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex gap-2">
          <div className="skeleton h-12 w-32 rounded-full" />
          <div className="skeleton h-12 w-32 rounded-full" />
        </div>
      </div>
    </div>
  )
}
