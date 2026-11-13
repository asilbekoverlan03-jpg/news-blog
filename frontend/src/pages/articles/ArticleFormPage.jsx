import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { articlesApi, categoriesApi, tagsApi } from '../../api/articles'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Spinner from '../../components/ui/Spinner'

export default function ArticleFormPage() {
  const { id } = useParams()           // edit mode if id present
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const thumbRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [thumbPreview, setThumbPreview] = useState(null)
  const [serverError, setServerError] = useState(null)
  const [initLoading, setInitLoading] = useState(isEdit)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  // Загружаем категории и теги
  useEffect(() => {
    Promise.all([categoriesApi.getList(), tagsApi.getList()]).then(([catRes, tagRes]) => {
      setCategories(catRes.data.results ?? catRes.data)
      setTags(tagRes.data.results ?? tagRes.data)
    })
  }, [])

  // Если редактирование — подгружаем данные статьи
  useEffect(() => {
    if (!isEdit) return
    articlesApi.getById(id).then(({ data }) => {
      reset({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category?.id ?? '',
        is_published: data.is_published,
      })
      setSelectedTags(data.tags.map((t) => t.id))
      setThumbPreview(data.thumbnail)
      setInitLoading(false)
    })
  }, [id, isEdit, reset])

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  const onSubmit = async (data) => {
    setServerError(null)
    try {
      const file = thumbRef.current?.files?.[0]
      const payload = new FormData()
      payload.append('title', data.title)
      payload.append('excerpt', data.excerpt ?? '')
      payload.append('content', data.content)
      if (data.category) payload.append('category', data.category)
      payload.append('is_published', data.is_published ? 'true' : 'false')
      selectedTags.forEach((t) => payload.append('tags', t))
      if (file) payload.append('thumbnail', file)

      const res = isEdit
        ? await articlesApi.update(id, payload)
        : await articlesApi.create(payload)

      navigate(`/articles/${res.data.id}`)
    } catch (err) {
      setServerError(err.response?.data || 'Ошибка сохранения.')
    }
  }

  if (initLoading) return <Spinner />

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 720 }}>
        <h1 className="auth-card__title">{isEdit ? 'Редактировать статью' : 'Новая статья'}</h1>
        <ErrorMessage error={serverError} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="title">Заголовок *</label>
            <input
              id="title"
              type="text"
              className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              {...register('title', { required: 'Обязательное поле' })}
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Краткое описание</label>
            <textarea id="excerpt" rows={2} className="form-input" {...register('excerpt')} />
          </div>

          <div className="form-group">
            <label htmlFor="content">Контент *</label>
            <textarea
              id="content"
              rows={14}
              className={`form-input ${errors.content ? 'form-input--error' : ''}`}
              {...register('content', { required: 'Обязательное поле' })}
            />
            {errors.content && <span className="form-error">{errors.content.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Категория</label>
            <select id="category" className="form-input" {...register('category')}>
              <option value="">Без категории</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Теги</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={`tag tag--btn ${selectedTags.includes(t.id) ? 'tag--active' : ''}`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Обложка</label>
            {thumbPreview && (
              <img
                src={thumbPreview}
                alt="preview"
                style={{ maxHeight: 160, borderRadius: 8, marginBottom: 8, display: 'block' }}
              />
            )}
            <button
              type="button"
              className="btn btn-outline btn--sm"
              onClick={() => thumbRef.current?.click()}
            >
              Выбрать изображение
            </button>
            <input
              ref={thumbRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setThumbPreview(URL.createObjectURL(f))
              }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input id="is_published" type="checkbox" {...register('is_published')} />
            <label htmlFor="is_published" style={{ marginBottom: 0 }}>Опубликовать</label>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняю...' : isEdit ? 'Сохранить' : 'Создать'}
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
