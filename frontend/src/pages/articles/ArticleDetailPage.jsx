import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { articlesApi } from '../../api/articles'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    articlesApi
      .getById(id)
      .then(({ data }) => {
        setArticle(data)
        setLiked(data.is_liked)
        setLikeCount(data.like_count)
      })
      .catch(() => setError('Статья не найдена.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!user) { navigate('/login'); return }
    try {
      if (liked) {
        await articlesApi.unlike(id)
        setLiked(false)
        setLikeCount((c) => c - 1)
      } else {
        await articlesApi.like(id)
        setLiked(true)
        setLikeCount((c) => c + 1)
      }
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    if (!window.confirm('Удалить статью?')) return
    await articlesApi.delete(id)
    navigate('/')
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentLoading(true)
    try {
      const { data } = await articlesApi.addComment(id, comment.trim())
      setArticle((prev) => ({
        ...prev,
        comments: [data, ...(prev.comments || [])],
      }))
      setComment('')
    } catch { /* ignore */ }
    finally { setCommentLoading(false) }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!article) return null

  const isAuthor = user?.id === article.author.id
  const date = article.published_date
    ? format(new Date(article.published_date), 'd MMMM yyyy', { locale: ru })
    : null

  return (
    <article className="article-detail">
      {/* Обложка */}
      {article.thumbnail && (
        <img src={article.thumbnail} alt={article.title} className="article-detail__thumb" />
      )}

      {/* Заголовок */}
      <h1 className="article-detail__title">{article.title}</h1>

      {/* Мета */}
      <div className="article-detail__meta">
        <Link to={`/profile/${article.author.id}`} className="article-card__author">
          {article.author.avatar
            ? <img src={article.author.avatar} alt={article.author.username} />
            : <span className="avatar-fallback">{article.author.username[0].toUpperCase()}</span>
          }
          {article.author.username}
        </Link>
        {date && <span>{date}</span>}
        {article.category && <span className="article-card__category">{article.category.name}</span>}
        <span>👁 {article.views_count}</span>
      </div>

      {/* Теги */}
      {article.tags?.length > 0 && (
        <div className="article-card__tags" style={{ marginBottom: 16 }}>
          {article.tags.map((t) => <span key={t.id} className="tag">#{t.name}</span>)}
        </div>
      )}

      {/* Действия автора */}
      {isAuthor && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Link to={`/articles/${id}/edit`} className="btn btn-outline btn--sm">✏️ Редактировать</Link>
          <button onClick={handleDelete} className="btn btn--sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            🗑 Удалить
          </button>
        </div>
      )}

      {/* Контент */}
      <div
        className="article-detail__content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Лайк */}
      <div className="article-detail__actions">
        <button
          onClick={handleLike}
          className={`btn ${liked ? 'btn-primary' : 'btn-outline'}`}
          aria-pressed={liked}
        >
          ❤️ {likeCount}
        </button>
      </div>

      {/* Комментарии */}
      <section className="comments" aria-label="Комментарии">
        <h2>Комментарии ({article.comments?.length ?? 0})</h2>

        {user && (
          <form onSubmit={handleComment} className="comment-form">
            <textarea
              rows={3}
              placeholder="Напишите комментарий..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-input"
              required
              aria-label="Текст комментария"
            />
            <button type="submit" className="btn btn-primary" disabled={commentLoading}>
              {commentLoading ? 'Отправляю...' : 'Отправить'}
            </button>
          </form>
        )}

        <div className="comments__list">
          {(article.comments || []).map((c) => (
            <div key={c.id} className="comment">
              <div className="comment__header">
                <Link to={`/profile/${c.author.id}`} className="article-card__author">
                  {c.author.avatar
                    ? <img src={c.author.avatar} alt={c.author.username} />
                    : <span className="avatar-fallback">{c.author.username[0].toUpperCase()}</span>
                  }
                  {c.author.username}
                </Link>
                <span className="comment__date">
                  {format(new Date(c.created_date), 'd MMM yyyy', { locale: ru })}
                </span>
              </div>
              <p className="comment__text">{c.text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
