import { useFavoritesStore } from '../store/favoritesStore'
import { HeartIcon } from './icons'

interface FavoriteButtonProps {
  mealId: string
  mealName: string
  /** icon = ปุ่มหัวใจกลมบนการ์ด, full = ปุ่มมีข้อความ */
  variant?: 'icon' | 'full'
  className?: string
}

export default function FavoriteButton({
  mealId,
  mealName,
  variant = 'icon',
  className = '',
}: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.favoriteIds.includes(mealId))
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  const label = isFavorite ? `Remove ${mealName} from My Recipes` : `Save ${mealName} to My Recipes`

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => toggleFavorite(mealId)}
        aria-pressed={isFavorite}
        className={`btn rounded-full ${isFavorite ? 'btn-outline btn-primary' : 'btn-primary'} ${className}`}
      >
        <HeartIcon filled={isFavorite} />
        {isFavorite ? 'Saved' : 'Save recipe'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        // ปุ่มอยู่บนการ์ดที่เป็นลิงก์ จึงกันไม่ให้คลิกแล้วเปิดหน้า detail
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(mealId)
      }}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className={`btn btn-circle btn-sm border-0 bg-white/95 shadow-sm hover:scale-110 ${
        isFavorite ? 'text-primary' : 'text-base-content/40'
      } ${className}`}
    >
      <HeartIcon filled={isFavorite} className="size-4" />
    </button>
  )
}
