import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import ArticleCard from '../../components/ui/ArticleCard'
import Spinner from '../../components/ui/Spinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Pagination from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'

export default function ProfilePage() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const { page, setPage, nextPage, prevPage, setCount, count, totalPages } = usePagination()

  const isOwn = me?.id === Number(id)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      usersApi.getProfile(id),
      usersApi.getUserArticles(id, { page }),
    ])
      .then(([profileRes, articlesRes]) => {
        setProfile(profileRes.data)
        setFollowing(profileRes.data.is_following)
        setArticles(articlesRes.data.results)
        setCount(articlesRes.data.count)
      })
      .catch(() => setError('Не удалось загрузить профиль.'))
      .finally(() => setLoading(false))
  }, [id, page])

  const handleFollow = async () => {
    if (!me) return
    setFollowLoading(true)
    try {
      if (following) {
        await usersApi.unfollow(id)
        setFollowing(false)
        setProfile((p) => ({ ...p, followers_count: p.followers_count - 1 }))
      } else {
        await usersApi.follow(id)
        setFollowing(true)
        setProfile((p) => ({ ...p, followers_count: p.followers_count + 1 }))
      }
    } catch { /* ignore */ }
    finally { setFollowLoading(false) }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!profile) return null

  return (
    <div>
      {/* Шапка профиля */}
      <div className="profile-header">
        <div className="profile-header__avatar">
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.username} />
            : <span>{profile.username[0].toUpperCase()}</span>
          }
        </div>
        <div className="profile-header__info">
          <h1>{profile.username}</h1>
          {(profile.first_name || profile.last_name) && (
            <p className="profile-header__name">{profile.first_name} {profile.last_name}</p>
          )}
          {profile.bio && <p className="profile-header__bio">{profile.bio}</p>}
          {profile.social_link && (
            <a href={profile.social_link} target="_blank" rel="noreferrer" className="profile-header__link">
              🔗 {profile.social_link}
            </a>
          )}
          <div className="profile-header__stats">
            <span><strong>{profile.articles_count}</strong> статей</span>
            <span><strong>{profile.followers_count}</strong> подписчиков</span>
            <span><strong>{profile.following_count}</strong> подписок</span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {isOwn
              ? <Link to="/profile/edit" className="btn btn-outline">Редактировать профиль</Link>
              : me && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`btn ${following ? 'btn-outline' : 'btn-primary'}`}
                >
                  {following ? 'Отписаться' : 'Подписаться'}
                </button>
              )
            }
          </div>
        </div>
      </div>

      {/* Статьи */}
      <h2 style={{ marginTop: 32, marginBottom: 16 }}>Статьи</h2>
      {articles.length === 0
        ? <p className="empty-state">Статей пока нет.</p>
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
