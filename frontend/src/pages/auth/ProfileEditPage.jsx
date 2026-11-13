import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function ProfileEditPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(user?.avatar || null)
  const [serverError, setServerError] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio,
        social_link: user.social_link,
      })
      setPreview(user.avatar)
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    setServerError(null)
    try {
      const file = fileRef.current?.files?.[0]
      let payload
      if (file) {
        payload = new FormData()
        Object.entries(data).forEach(([k, v]) => payload.append(k, v ?? ''))
        payload.append('avatar', file)
      } else {
        payload = data
      }
      const { data: updated } = await authApi.updateMe(payload)
      updateUser(updated)
      navigate(`/profile/${user.id}`)
    } catch (err) {
      setServerError(err.response?.data || 'Ошибка сохранения.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h1 className="auth-card__title">Редактировать профиль</h1>
        <ErrorMessage error={serverError} />

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Аватар */}
          <div className="form-group" style={{ textAlign: 'center' }}>
            {preview
              ? <img src={preview} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e5e7eb', margin: '0 auto', lineHeight: '80px', fontSize: 32, textAlign: 'center' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
            }
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-outline btn--sm"
                onClick={() => fileRef.current?.click()}
              >
                Сменить фото
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setPreview(URL.createObjectURL(f))
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="first_name">Имя</label>
            <input id="first_name" type="text" className="form-input" {...register('first_name')} />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Фамилия</label>
            <input id="last_name" type="text" className="form-input" {...register('last_name')} />
          </div>

          <div className="form-group">
            <label htmlFor="bio">О себе</label>
            <textarea
              id="bio"
              rows={4}
              className="form-input"
              {...register('bio', { maxLength: { value: 500, message: 'Максимум 500 символов' } })}
            />
            {errors.bio && <span className="form-error">{errors.bio.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="social_link">Ссылка (соцсеть / сайт)</label>
            <input id="social_link" type="url" className="form-input" {...register('social_link')} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняю...' : 'Сохранить'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
