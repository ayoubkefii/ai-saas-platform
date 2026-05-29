/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const chatApi = {
  getChats: () => api.get('/chats'),
  getChat: (id: string) => api.get(`/chats/${id}`),
  createChat: (title?: string) => api.post('/chats', { title }),
  deleteChat: (id: string) => api.delete(`/chats/${id}`),
  updateChat: (id: string, title: string) => api.patch(`/chats/${id}`, { title }),
  sendMessage: (chatId: string, content: string) =>
    api.post(`/chats/${chatId}/messages`, { content }),
  streamMessage: (chatId: string, content: string) => {
    const token = localStorage.getItem('token')
    return fetch(`${BASE_URL}/chats/${chatId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })
  },
}

export const tasksApi = {
  getTasks: () => api.get('/tasks'),
  createTask: (task: Partial<import('../types').Task>) => api.post('/tasks', task),
  updateTask: (id: string, updates: Partial<import('../types').Task>) =>
    api.patch(`/tasks/${id}`, updates),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  reorderTasks: (tasks: Array<{ id: string; status: string; order: number }>) =>
    api.post('/tasks/reorder', { tasks }),
}

export const documentsApi = {
  getDocuments: () => api.get('/documents'),
  uploadDocument: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocument: (id: string) => api.get(`/documents/${id}`),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  askQuestion: (id: string, question: string) =>
    api.post(`/documents/${id}/ask`, { question }),
  streamAsk: (id: string, question: string) => {
    const token = localStorage.getItem('token')
    return fetch(`${BASE_URL}/documents/${id}/stream-ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question }),
    })
  },
}

export const analyticsApi = {
  getAnalytics: () => api.get('/analytics'),
}

export const userApi = {
  updateProfile: (updates: Partial<import('../types').User>) =>
    api.patch('/users/profile', updates),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/users/password', { currentPassword, newPassword }),
  uploadAvatar: (formData: FormData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
