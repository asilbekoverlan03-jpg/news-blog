import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { articlesApi, categoriesApi } from '../../api/articles'
import { useAuth } from '../../context/AuthContext'
import ArticleCard from '../../components/ui/ArticleCard'
import Spinner from '../../components/ui/Spinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Pagination from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { useDebounce } from '../../hooks/useDebounce'

// ─── Данные feature-карточек ──────────────────────────────────────────────────
const FEATURES = [
  {
    emoji: '✍️',
    title: 'Пишите статьи',
    text: 'Создавайте публикации с обложкой, описанием, категорией и тегами. Сохраняйте черновики и публикуйте, когда будете готовы.',
  },
  {
    emoji: '💬',
    title: 'Обсуждайте',
    text: 'Оставляйте комментарии под статьями и общайтесь с авторами.',
  },
  {
    emoji: '❤️',
    title: 'Ставьте лайки',
    text: 'Отмечайте статьи, которые понравились, и поддерживайте авторов.',
  },
  {
    emoji: '👥',
    title: 'Подписывайтесь',
    text: 'Следите за любимыми авторами и читайте их новые статьи в своей ленте.',
  },
  {
    emoji: '🏷️',
    title: 'Категории и теги',
    text: 'Находите материалы по темам: технологии, спорт, наука и другие.',
  },
  {
    emoji: '👤',
    title: 'Свой профиль',
    text: 'Добавьте аватар, биографию и ссылку на соцсеть, чтобы читатели узнали вас лучше.',
  },
]

export default function ArticlesListPage() {
  const { user } = useAuth()
  const articlesRef = useRef(null)

  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const { page, setPage, nextPage, prevPage, setCount, totalPages } = usePagination()

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => { setPage(1) }, [debouncedSearch, category])

  useEffect(() => {
    categoriesApi.getList().then(({ data }) => setCategories(data.results ?? data))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = { page, is_published: true }
    if (debouncedSearch) params.search = debouncedSearch
    if (category) params['category__slug'] = category
    articlesApi
      .getList(params)
      .then(({ data }) => {
        setArticles(data.results)
        setCount(data.count)
      })
      .catch(() => setError('Не удалось загрузить статьи.'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, category])

  const scrollToArticles = () => {
    articlesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="hero"
        aria-label="Приветствие"
        style={{ backgroundImage: "url('/blog-bg.jpg')" }}
      >
        <div className="hero__overlay" aria-hidden="true" />
        <div className="container hero__content">
          <h1 className="hero__title">Пиши. Делись. Вдохновляй.</h1>
          <p className="hero__sub">
            Платформа для авторов и читателей: публикуйте статьи, находите интересные темы
            и следите за любимыми авторами.
          </p>
          <div className="hero__actions">
            {user ? (
              <>
                <Link to="/articles/new" className="btn btn-primary hero__btn">
                  + Написать статью
                </Link>
                <Link to="/feed" className="btn hero__btn hero__btn--ghost">
                  Моя лента
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary hero__btn">
                  Начать писать
                </Link>
                <button
                  type="button"
                  onClick={scrollToArticles}
                  className="btn hero__btn hero__btn--ghost"
                >
                  Читать статьи
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="features" aria-label="Возможности платформы">
        <div className="container">
          <h2 className="features__title">Что умеет приложение</h2>
          <div className="features__grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-card__icon" aria-hidden="true">{f.emoji}</span>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Список статей ─────────────────────────────────────────────── */}
      <div ref={articlesRef} className="container articles-section">
        <h2 className="page-title">Статьи</h2>

        {/* Фильтры */}
        <div className="filters">
          <input
            type="search"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input filters__search"
            aria-label="Поиск статей"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input filters__select"
            aria-label="Выбор категории"
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <ErrorMessage error={error} />

        {loading
          ? <Spinner />
          : articles.length === 0
            ? <p className="empty-state">Статей не найдено.</p>
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
    </div>
  )
}
