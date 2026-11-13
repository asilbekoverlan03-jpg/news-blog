import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [serverError, setServerError] = useState(null)

  const onSubmit = async (data) => {
    setServerError(null)
    try {
      await login(data)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err.response?.data || 'Неверный логин или пароль.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Вход</h1>
        <p className="auth-card__subtitle">Присоединяйтесь к сообществу авторов</p>
        <ErrorMessage error={serverError} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={`form-input ${errors.username ? 'form-input--error' : ''}`}
              {...register('username', { required: 'Обязательное поле' })}
            />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              {...register('password', { required: 'Обязательное поле' })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn--full" disabled={isSubmitting}>
            {isSubmitting ? 'Вхожу...' : 'Войти'}
          </button>
        </form>

        <p className="auth-card__footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
