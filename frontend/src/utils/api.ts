import axios from 'axios'
import { AuthResponse, APIError, Category, Tag, Post, PaginatedPosts } from '../types'

const API_BASE_URL = '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const err = error as { response?: { data?: APIError } }
    const message = err.response?.data?.errors?.[0]?.msg || 
                    err.response?.data?.error || 
                    err.message || 
                    '请求失败'
    return Promise.reject(new Error(message))
  }
)

// Auth API
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
}

// Categories API
export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories')
    return response.data
  },
}

// Tags API
export const tagService = {
  getAll: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('/tags')
    return response.data
  },
}

// Posts API
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

  getById: async (slug: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${slug}`)
    return response.data
  },

  create: async (post: Partial<Post>): Promise<{ message: string; post: Post }> => {
    const response = await apiClient.post<{ message: string; post: Post }>('/posts', post)
    return response.data
  },

  update: async (id: number, post: Partial<Post>): Promise<{ message: string; post: Post }> => {
    const response = await apiClient.put<{ message: string; post: Post }>(`/posts/${id}`, post)
    return response.data
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/posts/${id}`)
    return response.data
  },
}

// Profile API
export const profileService = {
  get: async (): Promise<any> => {
    const response = await apiClient.get('/profile')
    return response.data
  },

  update: async (data: { avatar?: string | null; bio?: string | null }): Promise<any> => {
    const response = await apiClient.put('/profile', data)
    return response.data
  },
}

// About API
export const aboutService = {
  get: async (): Promise<any> => {
    const response = await apiClient.get('/about')
    return response.data
  },
}
