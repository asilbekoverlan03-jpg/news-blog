import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Pages
import ArticlesListPage from './pages/articles/ArticlesListPage'
import ArticleDetailPage from './pages/articles/ArticleDetailPage'
import ArticleFormPage from './pages/articles/ArticleFormPage'
import FeedPage from './pages/articles/FeedPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ProfileEditPage from './pages/auth/ProfileEditPage'
import ProfilePage from './pages/profile/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route index element={<ArticlesListPage />} />
            <Route path="articles/:id" element={<ArticleDetailPage />} />
            <Route path="profile/:id" element={<ProfilePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected */}
            <Route
              path="feed"
              element={<ProtectedRoute><FeedPage /></ProtectedRoute>}
            />
            <Route
              path="articles/new"
              element={<ProtectedRoute><ArticleFormPage /></ProtectedRoute>}
            />
            <Route
              path="articles/:id/edit"
              element={<ProtectedRoute><ArticleFormPage /></ProtectedRoute>}
            />
            <Route
              path="profile/edit"
              element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
