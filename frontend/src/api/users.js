import api from './axios'

export const usersApi = {
  getProfile: (id) => api.get(`/users/${id}/`),
  getUserArticles: (id, params) => api.get(`/users/${id}/articles/`, { params }),
  getFollowers: (id) => api.get(`/users/${id}/followers/`),
  getFollowing: (id) => api.get(`/users/${id}/following/`),
  follow: (id) => api.post(`/users/${id}/follow/`),
  unfollow: (id) => api.delete(`/users/${id}/follow/`),
}
