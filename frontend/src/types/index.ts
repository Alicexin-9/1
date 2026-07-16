export interface User {
  id: number
  username: string
  email: string
  avatar?: string | null
  bio?: string | null
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
}

export interface Post {
  id: number
  title: string
  slug: string
  content: string
  contentHtml?: string
  excerpt?: string | null
  cover_image?: string | null
  category_id?: number | null
  category_name?: string | null
  category_slug?: string | null
  author_id: number
  author_username: string
  author_avatar?: string | null
  author_bio?: string | null
  view_count: number
  is_published: boolean
  published_at?: string | null
  created_at: string
  updated_at: string
  tags?: Tag[]
  tag_names?: string | null
}

export interface AuthResponse {
  user: User
  token: string
  message?: string
}

export interface APIError {
  error: string
  errors?: Array<{ msg: string; param: string }>
}

export interface PaginatedPosts {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
