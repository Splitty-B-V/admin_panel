'use client'

import {createContext, ReactNode, useContext, useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {apiGetCurrentUser, apiGetRestaurantInfo, apiLoginRestaurant, User} from '@/lib/api'

// Restaurant interface matching backend RestaurantInfoResponse
interface RestaurantInfo {
  id: number
  name: string
  logo_url?: string
  address?: string
  email?: string
  website?: string
  description?: string
  is_active: boolean
  created_at: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

interface AuthContextType {
  user: User | null
  restaurant: RestaurantInfo | null
  login: (email: string, password: string) => Promise<{success: boolean, user?: User, error?: string}>
  logout: () => void
  loading: boolean
  refreshUser: () => Promise<void>
  refreshRestaurant: () => Promise<void>
  updateRestaurantData: (updatedData: Partial<RestaurantInfo>) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadUserFromServer = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('restaurant_token')
      if (!token) return null

      return await apiGetCurrentUser()
    } catch (error) {
      console.error('Failed to load user from server:', error)
      localStorage.removeItem('restaurant_token')
      localStorage.removeItem('restaurant_user')
      localStorage.removeItem('restaurant_info')
      return null
    }
  }

  const loadRestaurantFromServer = async (): Promise<RestaurantInfo | null> => {
    try {
      const token = localStorage.getItem('restaurant_token')
      if (!token) return null

      const restaurantData: RestaurantInfo = await apiGetRestaurantInfo()
      return restaurantData
    } catch (error) {
      console.error('Failed to load restaurant from server:', error)
      return null
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await loadUserFromServer()
      if (userData) {
        setUser(userData)
        localStorage.setItem('restaurant_user', JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem('restaurant_user')
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const refreshRestaurant = async (): Promise<void> => {
    try {
      const restaurantData = await loadRestaurantFromServer()
      if (restaurantData) {
        setRestaurant(restaurantData)
        localStorage.setItem('restaurant_info', JSON.stringify(restaurantData))
      } else {
        setRestaurant(null)
        localStorage.removeItem('restaurant_info')
      }
    } catch (error) {
      console.error('Failed to refresh restaurant:', error)
    }
  }

  const updateRestaurantData = (updatedData: Partial<RestaurantInfo>): void => {
    if (restaurant) {
      const updated = { ...restaurant, ...updatedData }
      setRestaurant(updated)
      localStorage.setItem('restaurant_info', JSON.stringify(updated))
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('restaurant_token')
      const storedUserData = localStorage.getItem('restaurant_user')
      const storedRestaurantData = localStorage.getItem('restaurant_info')

      if (token) {
        // Use stored data temporarily while fetching fresh data
        if (storedUserData) {
          try {
            setUser(JSON.parse(storedUserData))
          } catch (error) {
            console.error('Failed to parse stored user data:', error)
            localStorage.removeItem('restaurant_user')
          }
        }

        if (storedRestaurantData) {
          try {
            setRestaurant(JSON.parse(storedRestaurantData))
          } catch (error) {
            console.error('Failed to parse stored restaurant data:', error)
            localStorage.removeItem('restaurant_info')
          }
        }

        // Always fetch fresh data on app load
        const [freshUserData, freshRestaurantData] = await Promise.all([
          loadUserFromServer(),
          loadRestaurantFromServer()
        ])

        if (freshUserData) {
          setUser(freshUserData)
          localStorage.setItem('restaurant_user', JSON.stringify(freshUserData))
        } else {
          setUser(null)
        }

        if (freshRestaurantData) {
          setRestaurant(freshRestaurantData)
          localStorage.setItem('restaurant_info', JSON.stringify(freshRestaurantData))
        } else {
          setRestaurant(null)
        }
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Backend returns LoginResponse with access_token and user data
      const loginResponse: LoginResponse = await apiLoginRestaurant(email, password)

      // Store token
      localStorage.setItem('restaurant_token', loginResponse.access_token)

      // Store user data
      setUser(loginResponse.user)
      localStorage.setItem('restaurant_user', JSON.stringify(loginResponse.user))

      // Load restaurant data
      const restaurantData = await loadRestaurantFromServer()
      if (restaurantData) {
        setRestaurant(restaurantData)
        localStorage.setItem('restaurant_info', JSON.stringify(restaurantData))
      }

      return { success: true, user: loginResponse.user }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('restaurant_token')
    localStorage.removeItem('restaurant_user')
    localStorage.removeItem('restaurant_info')
    setUser(null)
    setRestaurant(null)
    router.push('/login')
  }

  return (
      <AuthContext.Provider value={{
        user,
        restaurant,
        login,
        logout,
        loading,
        refreshUser,
        refreshRestaurant,
        updateRestaurantData
      }}>
        {children}
      </AuthContext.Provider>
  )
}