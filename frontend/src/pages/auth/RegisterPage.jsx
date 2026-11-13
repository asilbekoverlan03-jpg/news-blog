import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const [serverError, setServerError] = useState(null)

  const onSubmit = async (data) => {
    setServerError(null)
    try {
      await authApi.register(data)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setServerError(err.response?.data || 'Ошибка регистрации.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Регистрация</h1>
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
              {...register('username', {
                required: 'Обязательное поле',
                minLength: { value: 3, message: 'Минимум 3 символа' },
                pattern: { value: /^[\w.@+-]+$/, message: 'Только буквы, цифры и @/./+/-/_' },
              })}
            />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              {...register('email', {
                required: 'Обязательное поле',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Некорректный email' },
              })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              {...register('password', {
                required: 'Обязательное поле',
                minLength: { value: 8, message: 'Минимум 8 символов' },
              })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password2">Повтор пароля</label>
            <input
              id="password2"
              type="password"
              autoComplete="new-password"
              className={`form-input ${errors.password2 ? 'form-input--error' : ''}`}
              {...register('password2', {
                required: 'Обязательное поле',
                validate: (val) => val === watch('password') || 'Пароли не совпадают',
              })}
            />
            {errors.password2 && <span className="form-error">{errors.password2.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn--full" disabled={isSubmitting}>
            {isSubmitting ? 'Регистрирую...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-card__footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
