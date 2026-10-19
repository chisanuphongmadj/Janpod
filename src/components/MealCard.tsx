import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { MealCardData } from '../types/meal'
import FavoriteButton from './FavoriteButton'

interface MealCardProps {
  meal: MealCardData
  /** ส่วนท้ายการ์ด เช่น ปุ่ม "นำออก" ในหน้าสูตรของฉัน */
  footer?: ReactNode
}

export default function MealCard({ meal, footer }: MealCardProps) {
  return (
    <article className="card group h-full overflow-hidden border border-base-300 bg-base-100 transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/recipe/${meal.idMeal}`} className="flex h-full flex-col">
        <figure className="relative aspect-[4/3] bg-base-200">
          <img
            src={`${meal.strMealThumb}/medium`}
            alt={meal.strMeal}
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
          <FavoriteButton mealId={meal.idMeal} mealName={meal.strMeal} className="absolute top-3 right-3" />
        </figure>
        <div className="card-body gap-1 p-4">
          <h3 className="line-clamp-2 font-bold leading-snug">{meal.strMeal}</h3>
          <p className="text-sm text-base-content/60">
            {[meal.strCategory, meal.strArea].filter(Boolean).join(' · ') || 'Recipe'}
          </p>
        </div>
      </Link>
      {footer && <div className="px-4 pb-4">{footer}</div>}
    </article>
  )
}

export function MealCardSkeleton() {
  return (
    <div className="card overflow-hidden border border-base-300 bg-base-100" aria-hidden="true">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="card-body gap-2 p-4">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </div>
  )
}

export function MealGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{children}</div>
  )
}

export function MealGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <MealGrid>
      {Array.from({ length: count }, (_, i) => (
        <MealCardSkeleton key={i} />
      ))}
    </MealGrid>
  )
}
