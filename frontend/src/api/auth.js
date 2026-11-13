import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
  getMe: () => api.get('/auth/me/'),
  updateMe: (data) => {
    // Если есть файл — multipart, иначе JSON
    const isFormData = data instanceof FormData
    return api.patch('/auth/me/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
  },
}
