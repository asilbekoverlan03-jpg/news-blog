import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  const { pathname } = useLocation()
  // На главной hero идёт вплотную к header (без container и padding)
  const isHome = pathname === '/'

  return (
    <div className="app">
      <Header />
      <main className={isHome ? 'main main--home' : 'main container'}>
        <Outlet />
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Blog Platform</p>
      </footer>
    </div>
  )
}
