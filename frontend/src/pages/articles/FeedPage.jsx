import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { articlesApi } from '../../api/articles'
import ArticleCard from '../../components/ui/ArticleCard'
import Spinner from '../../components/ui/Spinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Pagination from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'

export default function FeedPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { page, nextPage, prevPage, setCount, totalPages } = usePagination()

  useEffect(() => {
    setLoading(true)
    articlesApi
      .getFeed({ page })
      .then(({ data }) => {
        setArticles(data.results)
        setCount(data.count)
      })
      .catch(() => setError('Не удалось загрузить ленту.'))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h1 className="page-title">Лента подписок</h1>
      <ErrorMessage error={error} />
      {loading
        ? <Spinner />
        : articles.length === 0
          ? (
            <div className="feed-empty">
              <span className="feed-empty__icon" aria-hidden="true">📭</span>
              <p>Здесь пока пусто. Подпишитесь на авторов, чтобы видеть их статьи.</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
                Смотреть все статьи
              </Link>
            </div>
          )
          : (
            <>
              <div className="articles-grid">
                {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} />
            </>
          )
      }
    </div>
  )
}
