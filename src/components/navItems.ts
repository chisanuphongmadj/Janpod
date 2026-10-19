import type { ComponentType, SVGProps } from 'react'
import { DiceIcon, HeartIcon, HomeIcon, InfoIcon } from './icons'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Show the saved-recipe count next to this link */
  showFavoriteCount?: boolean
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/favorites', label: 'My Recipes', icon: HeartIcon, showFavoriteCount: true },
  { to: '/random', label: 'Random', icon: DiceIcon },
  { to: '/about', label: 'About', icon: InfoIcon },
]
