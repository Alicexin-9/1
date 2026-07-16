import axios from 'axios'
import { AuthResponse, APIError, Category, Tag, Post, PaginatedPosts } from '../types'

const API_BASE_URL = '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const err = error as { response?: { data?: APIError } }
    const message = err.response?.data?.errors?.[0]?.msg ||
                    err.response?.data?.error ||
                    (error as any).message ||
                    '请求失败'
    return Promise.reject(new Error(message))
  }
)

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { username, password })
    return response.data
  },
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', { username, email, password })
    return response.data
  },
  logout: (): void => {
    localStorage.removeItem('token')
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/auth/password', { oldPassword, newPassword })
    return response.data
  },
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get('/profile')
    return response.data
  },
  updateProfile: async (data: { avatar?: string | null; bio?: string | null }): Promise<any> => {
    const response = await apiClient.put('/profile', data)
    return response.data
  },
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories')
    return response.data
  },
  create: async (name: string, description?: string): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', { name, description })
    return response.data
  },
  update: async (id: number, name: string, description?: string): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, { name, description })
    return response.data
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/categories/${id}`)
    return response.data
  },
}

export const tagService = {
  getAll: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('/tags')
    return response.data
  },
  create: async (name: string): Promise<Tag> => {
    const response = await apiClient.post<Tag>('/tags', { name })
    return response.data
  },
  update: async (id: number, name: string): Promise<Tag> => {
    const response = await apiClient.put<Tag>(`/tags/${id}`, { name })
    return response.data
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/tags/${id}`)
    return response.data
  },
}

export const postService = {
  getAll: async (params: {
    page?: number
    limit?: number
    categoryId?: number
    tagId?: number
    search?: string
  }): Promise<PaginatedPosts> => {
    const response = await apiClient.get<PaginatedPosts>('/posts', { params })
    return response.data
  },
  getBySlug: async (slug: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${slug}`)
    return response.data
  },
  getMyPosts: async (): Promise<any[]> => {
    const response = await apiClient.get('/posts/me/list')
    return response.data
  },
  create: async (post: {
    title: string
    content: string
    excerpt?: string
    cover_image?: string
    category_id?: number | null
    tags?: string[]
    is_published?: boolean
  }): Promise<{ message: string; post: Post }> => {
    const response = await apiClient.post<{ message: string; post: Post }>('/posts', post)
    return response.data
  },
  update: async (id: number, post: {
    title?: string
    content?: string
    excerpt?: string
    cover_image?: string
    category_id?: number | null
    tags?: string[]
    is_published?: boolean
  }): Promise<{ message: string; post: Post }> => {
    const response = await apiClient.put<{ message: string; post: Post }>(`/posts/${id}`, post)
    return response.data
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/posts/${id}`)
    return response.data
  },
}

export const aboutService = {
  get: async (): Promise<any> => {
    const response = await apiClient.get('/about')
    return response.data
  },
}
