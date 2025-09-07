'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'  // Изменено для App Router
import {apiGetCurrentUser, apiLoginRestaurant} from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  restaurantId: string
  restaurantName: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{success: boolean, user?: User, error?: string}>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadUserFromServer = async (token: string): Promise<User | null> => {
    try {
      const userData = await apiGetCurrentUser()
      return userData
    } catch (error) {
      // Если токен невалидный, очищаем localStorage
      localStorage.removeItem('restaurant_token')
      localStorage.removeItem('restaurant_user')
      return null
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('restaurant_token')
    const userData = localStorage.getItem('restaurant_user')

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await apiLoginRestaurant(email, password)

      const userData: User = {
        id: Date.now().toString(),
        email: email,
        name: 'Anatolii Test',
        role: 'restaurant_admin',
        restaurantId: '17',
        restaurantName: 'Anatolii Restaurant'
      }

      localStorage.setItem('restaurant_token', data.access_token)
      localStorage.setItem('restaurant_user', JSON.stringify(userData))

      setUser(userData)
      return { success: true, user: userData }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('restaurant_token')
    localStorage.removeItem('restaurant_user')
    setUser(null)
    router.push('/login')
  }

  return (
      <AuthContext.Provider value={{ user, login, logout, loading }}>
        {children}
      </AuthContext.Provider>
  )
}