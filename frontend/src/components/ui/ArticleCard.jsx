import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ArticleCard({ article }) {
  const date = article.published_date
    ? format(new Date(article.published_date), 'd MMM yyyy', { locale: ru })
    : null

  return (
    <article className="article-card">
      {article.thumbnail && (
        <Link to={`/articles/${article.id}`}>
          <img
            src={article.thumbnail}
            alt={article.title}
            className="article-card__thumb"
            loading="lazy"
          />
        </Link>
      )}
      <div className="article-card__body">
        {article.category && (
          <span className="article-card__category">{article.category.name}</span>
        )}
        <h2 className="article-card__title">
          <Link to={`/articles/${article.id}`}>{article.title}</Link>
        </h2>
        {article.excerpt && (
          <p className="article-card__excerpt">{article.excerpt}</p>
        )}
        <div className="article-card__meta">
          <Link to={`/profile/${article.author.id}`} className="article-card__author">
            {article.author.avatar
              ? <img src={article.author.avatar} alt={article.author.username} />
              : <span className="avatar-fallback">{article.author.username[0].toUpperCase()}</span>
            }
            {article.author.username}
          </Link>
          {date && <span className="article-card__date">{date}</span>}
          <span className="article-card__stats">
            ❤️ {article.like_count} · 💬 {article.comment_count} · 👁 {article.views_count}
          </span>
        </div>
        {article.tags?.length > 0 && (
          <div className="article-card__tags">
            {article.tags.map((t) => (
              <span key={t.id} className="tag">#{t.name}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
