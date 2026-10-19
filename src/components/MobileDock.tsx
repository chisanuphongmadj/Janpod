import { NavLink } from 'react-router'
import { useFavoritesStore } from '../store/favoritesStore'
import { navItems } from './navItems'

/** แถบเมนูด้านล่างสำหรับมือถือ */
export default function MobileDock() {
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length)

  return (
    <nav className="dock dock-md z-30 border-t border-base-300 bg-base-200 md:hidden">
      {navItems.map(({ to, label, icon: Icon, showFavoriteCount }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => (isActive ? 'dock-active text-primary' : 'text-base-content/70')}
        >
          <span className="indicator">
            <Icon />
            {showFavoriteCount && favoriteCount > 0 && (
              <span className="indicator-item badge badge-primary badge-xs">{favoriteCount}</span>
            )}
          </span>
          <span className="dock-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
