import { Link, NavLink } from 'react-router'
import { useFavoritesStore } from '../store/favoritesStore'
import Logo from './Logo'
import { navItems } from './navItems'

export default function Navbar() {
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length)

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-200/90 backdrop-blur">
      <nav className="navbar mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary">
            <Logo />
            Janpod
          </Link>
        </div>

        {/* เดสก์ท็อป/แท็บเล็ต: เมนูแนวนอน (มือถือใช้ MobileDock ด้านล่างแทน) */}
        <ul className="hidden gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm rounded-full font-semibold ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-base-content/70'
                  }`
                }
              >
                {item.label}
                {item.showFavoriteCount && favoriteCount > 0 && (
                  <span className="badge badge-primary badge-sm">{favoriteCount}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
