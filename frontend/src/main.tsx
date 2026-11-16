import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // ข้อมูลถือว่าสดอยู่ 5 นาที ลดการเรียก API ซ้ำ
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Collapse repeated slashes (e.g. "//recipe/52772" → "/recipe/52772") so typed URLs still match a route
const { pathname, search, hash } = window.location
if (pathname.includes('//')) {
  window.history.replaceState(null, '', pathname.replace(/\/{2,}/g, '/') + search + hash)
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
