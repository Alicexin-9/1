import { useState, useEffect } from 'react'

type User = {
  id: number
  username: string
  email: string
  avatar?: string | null
  bio?: string | null
}

interface AuthState {
  user: User | null
  token: string | null
}

let authState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null
}

const listeners: Array<() => void> = []

export const useAuthStore = () => {
  const [state, setState] = useState(authState)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]))
        authState.user = payload
        authState.token = savedToken
      } catch {}
    }
    setState({ ...authState })
  }, [])

  const login = (user: User, token: string) => {
    authState.user = user
    authState.token = token
    localStorage.setItem('token', token)
    listeners.forEach(l => l())
    setState({ ...authState })
  }

  const logout = () => {
    authState.user = null
    authState.token = null
    localStorage.removeItem('token')
    listeners.forEach(l => l())
    setState({ ...authState })
  }

  return {
    ...state,
    login,
    logout
  }
}
