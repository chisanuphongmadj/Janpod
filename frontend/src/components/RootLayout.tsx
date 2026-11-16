import { Outlet, ScrollRestoration } from 'react-router'
import Navbar from './Navbar'
import MobileDock from './MobileDock'
import Footer from './Footer'

/** Root Layout เดียวของทั้งระบบ: Navbar + <Outlet/> + Footer */
export default function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:py-8">
        <Outlet />
      </main>
      <Footer />
      <MobileDock />
      <ScrollRestoration />
    </div>
  )
}
