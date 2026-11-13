import api from './axios'

export const articlesApi = {
  // Список с фильтрами
  getList: (params) => api.get('/articles/', { params }),

  // Детали
  getById: (id) => api.get(`/articles/${id}/`),

  // CRUD
  create: (data) => {
    const isFormData = data instanceof FormData
    return api.post('/articles/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
  },
  update: (id, data) => {
    const isFormData = data instanceof FormData
    return api.patch(`/articles/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
  },
  delete: (id) => api.delete(`/articles/${id}/`),

  // Лайки
  like: (id) => api.post(`/articles/${id}/like/`),
  unlike: (id) => api.delete(`/articles/${id}/like/`),

  // Комментарии
  getComments: (id, params) => api.get(`/articles/${id}/comments/`, { params }),
  addComment: (id, text) => api.post(`/articles/${id}/comments/`, { text }),

  // Лента
  getFeed: (params) => api.get('/feed/', { params }),
}

export const categoriesApi = {
  getList: () => api.get('/categories/'),
  getBySlug: (slug) => api.get(`/categories/${slug}/`),
}

export const tagsApi = {
  getList: () => api.get('/tags/'),
}
