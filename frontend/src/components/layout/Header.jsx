import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          📝 Blog
        </Link>

        <nav className="header__nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Статьи
          </NavLink>
          {user && (
            <NavLink to="/feed" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Лента
            </NavLink>
          )}
        </nav>

        <div className="header__auth">
          {user ? (
            <>
              <NavLink to="/articles/new" className="btn btn-primary">
                + Написать
              </NavLink>
              <NavLink
                to={`/profile/${user.id}`}
                className="header__avatar-link"
                title={user.username}
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.username} className="header__avatar" />
                  : <span className="header__avatar-fallback">{user.username[0].toUpperCase()}</span>
                }
              </NavLink>
              <button onClick={handleLogout} className="btn btn-outline btn--sm">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Войти</Link>
              <Link to="/register" className="btn btn-primary">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
