import { Link, useNavigate, useParams } from 'react-router'
import { useMeal } from '../hooks/useMeals'
import { getIngredients, getSteps, getTags, ingredientImage } from '../lib/meal'
import FavoriteButton from '../components/FavoriteButton'
import { EmptyState, ErrorState } from '../components/StateViews'
import { ArrowLeftIcon, ExternalIcon, GlobeIcon, PlayIcon } from '../components/icons'

export default function RecipeDetailPage() {
  // Read the id from the dynamic route /recipe/:id
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: meal, isPending, isError, error, refetch, isFetching } = useMeal(id)

  const backButton = (
    <button
      type="button"
      className="btn btn-ghost btn-sm mb-4 rounded-full"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
    >
      <ArrowLeftIcon className="size-4" /> Back
    </button>
  )

  if (isPending) return <DetailSkeleton />

  if (isError) {
    return (
      <>
        {backButton}
        <ErrorState title="Couldn't load this recipe" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      </>
    )
  }

  if (!meal) {
    return (
      <EmptyState
        icon="🥣"
        title="Recipe not found"
        description={`There is no recipe with ID ${id}. It may have been removed or the link is wrong.`}
        action={
          <Link to="/" className="btn btn-primary rounded-full">
            Back to home
          </Link>
        }
      />
    )
  }

  const ingredients = getIngredients(meal)
  const steps = getSteps(meal.strInstructions)
  const tags = getTags(meal)

  return (
    <article>
      {backButton}

      <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        <figure className="overflow-hidden rounded-box bg-base-200 md:sticky md:top-24 md:self-start">
          <img src={meal.strMealThumb} alt={meal.strMeal} className="aspect-square w-full object-cover" />
        </figure>

        <div className="space-y-6">
          <header className="space-y-3">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{meal.strMeal}</h1>
            <div className="flex flex-wrap gap-2">
              {meal.strCategory && <span className="badge badge-lg border-0 bg-base-200">{meal.strCategory}</span>}
              {meal.strArea && (
                <span className="badge badge-lg border-0 bg-base-200">
                  <GlobeIcon className="size-4" /> {meal.strArea}
                </span>
              )}
              {tags.map((tag) => (
                <span key={tag} className="badge badge-lg badge-outline border-base-300 text-base-content/70">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <FavoriteButton mealId={meal.idMeal} mealName={meal.strMeal} variant="full" />
              {meal.strYoutube && (
                <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="btn btn-outline btn-primary rounded-full">
                  <PlayIcon /> Watch video
                </a>
              )}
              {meal.strSource && (
                <a href={meal.strSource} target="_blank" rel="noreferrer" className="btn btn-ghost rounded-full">
                  <ExternalIcon /> Source
                </a>
              )}
            </div>
          </header>

          <section className="rounded-box bg-base-200 p-5">
            <h2 className="mb-3 flex items-center justify-between text-lg font-bold">
              Ingredients <span className="badge badge-secondary">{ingredients.length} items</span>
            </h2>
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {ingredients.map((ing, index) => (
                <li key={`${ing.name}-${index}`} className="flex items-center gap-3 border-b border-base-300 py-2 last:border-0">
                  <img src={ingredientImage(ing.name)} alt="" loading="lazy" className="size-9 shrink-0 object-contain" />
                  <span className="flex-1 font-medium">{ing.name}</span>
                  <span className="text-right text-sm text-base-content/70">{ing.measure}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Instructions</h2>
        {steps.length === 0 ? (
          <p className="text-base-content/60">No instructions are available for this recipe yet.</p>
        ) : (
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-content">
                  {index + 1}
                </span>
                <p className="pt-1 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  )
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading recipe">
      <div className="skeleton mb-4 h-8 w-24 rounded-full" />
      <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        <div className="skeleton aspect-square w-full" />
        <div className="space-y-4">
          <div className="skeleton h-10 w-3/4" />
          <div className="flex gap-2">
            <div className="skeleton h-7 w-20 rounded-full" />
            <div className="skeleton h-7 w-20 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-12 w-36 rounded-full" />
            <div className="skeleton h-12 w-28 rounded-full" />
          </div>
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-5 w-full" />
        ))}
      </div>
    </div>
  )
}
