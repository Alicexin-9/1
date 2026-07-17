import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider } from '../contexts/ThemeContext'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

function mockHomeApiCalls(posts: any[] = [], categories: any[] = [], tags: any[] = []) {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url === '/api/posts') {
      return Promise.resolve({
        data: {
          posts,
          pagination: { page: 1, limit: 6, total: posts.length, totalPages: Math.ceil(posts.length / 6) || 1 }
        }
      })
    }
    return Promise.resolve({ data: categories })
  })
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <ThemeProvider>{ui}</ThemeProvider>
    </BrowserRouter>
  )
}

describe('App - Home Page', () => {
  it('renders the blog title', async () => {
    mockHomeApiCalls()
    const Home = (await import('../pages/Home')).default
    renderWithProviders(<Home />)
    expect(screen.getByText('欢迎来到我的博客')).toBeInTheDocument()
  })

  it('renders empty state when no posts', async () => {
    mockHomeApiCalls()
    const Home = (await import('../pages/Home')).default
    renderWithProviders(<Home />)
    await waitFor(() => {
      expect(screen.getByText('暂无文章内容')).toBeInTheDocument()
    })
  })

  it('renders post list from API', async () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Content',
        excerpt: 'A test excerpt',
        category_name: 'Tech',
        view_count: 10,
        is_published: true,
        published_at: '2024-01-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        author_id: 1,
        tag_names: 'javascript'
      }
    ]
    mockHomeApiCalls(mockPosts)
    const Home = (await import('../pages/Home')).default
    renderWithProviders(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
      expect(screen.getByText('A test excerpt')).toBeInTheDocument()
    })
  })
})

describe('App - Login Page', () => {
  it('renders login form', async () => {
    const Login = (await import('../pages/Login')).default
    renderWithProviders(<Login />)

    expect(screen.getByText('欢迎回来')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument()
    expect(screen.getByText('立即登录')).toBeInTheDocument()
  })

  it('shows test account info', async () => {
    const Login = (await import('../pages/Login')).default
    renderWithProviders(<Login />)

    expect(screen.getByText('测试账号：')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('admin123')).toBeInTheDocument()
  })
})

describe('App - Navbar', () => {
  it('renders navigation links', async () => {
    const Navbar = (await import('../components/Navbar')).default
    renderWithProviders(<Navbar />)

    expect(screen.getByText('我的博客')).toBeInTheDocument()
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('关于我')).toBeInTheDocument()
  })

  it('shows login/register when not authenticated', async () => {
    localStorage.removeItem('token')
    const Navbar = (await import('../components/Navbar')).default
    renderWithProviders(<Navbar />)

    expect(screen.getByText('登录')).toBeInTheDocument()
    expect(screen.getByText('注册')).toBeInTheDocument()
  })
})
