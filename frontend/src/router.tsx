import { createBrowserRouter } from 'react-router'
import RootLayout from './components/RootLayout'
import RouteError from './components/RouteError'
import HomePage from './pages/HomePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import FavoritesPage from './pages/FavoritesPage'
import AboutPage from './pages/AboutPage'
import RandomPage from './pages/RandomPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'recipe/:id', element: <RecipeDetailPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'random', element: <RandomPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
