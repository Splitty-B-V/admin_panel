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
  login: (email: string, password: string) => Promise<{success: boolean, user?: User, userType?: 'restaurant' | 'super_admin', error?: string}>
  logout: () => void
  loading: boolean
  refreshUser: () => Promise<void>
  refreshRestaurant: () => Promise<void>
  updateRestaurantData: (updatedData: Partial<RestaurantInfo>) => void
  userType: 'restaurant' | 'super_admin' | null
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<'restaurant' | 'super_admin' | null>(null)
  const router = useRouter()

  const determineUserType = (user: User): 'restaurant' | 'super_admin' => {
    if (user.is_admin) return 'super_admin'
    if (user.is_restaurant_admin || user.is_restaurant_staff) return 'restaurant'
    return 'super_admin' // fallback
  }

  const loadUserFromServer = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return null

      return await apiGetCurrentUser()
    } catch (error) {
      console.error('Failed to load user from server:', error)
      // Clear tokens on error
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('restaurant_info')
      return null
    }
  }

  const loadRestaurantFromServer = async (): Promise<RestaurantInfo | null> => {
    try {
      const token = localStorage.getItem('auth_token')
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
        const type = determineUserType(userData)
        setUser(userData)
        setUserType(type)
        localStorage.setItem('auth_user', JSON.stringify(userData))
      } else {
        setUser(null)
        setUserType(null)
        localStorage.removeItem('auth_user')
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const refreshRestaurant = async (): Promise<void> => {
    // Only load restaurant data for restaurant users
    if (userType !== 'restaurant') return

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
    if (restaurant && userType === 'restaurant') {
      const updated = { ...restaurant, ...updatedData }
      setRestaurant(updated)
      localStorage.setItem('restaurant_info', JSON.stringify(updated))
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing token
        const token = localStorage.getItem('auth_token')

        if (token) {
          // Load stored user data temporarily
          const storedUserData = localStorage.getItem('auth_user')

          let tempUserType: 'restaurant' | 'super_admin' | null = null

          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData)
              tempUserType = determineUserType(userData)
              setUser(userData)
              setUserType(tempUserType)

              // Load restaurant data for restaurant users
              if (tempUserType === 'restaurant') {
                const storedRestaurantData = localStorage.getItem('restaurant_info')
                if (storedRestaurantData) {
                  try {
                    setRestaurant(JSON.parse(storedRestaurantData))
                  } catch (error) {
                    console.error('Failed to parse stored restaurant data:', error)
                    localStorage.removeItem('restaurant_info')
                  }
                }
              }
            } catch (error) {
              console.error('Failed to parse stored user data:', error)
              localStorage.removeItem('auth_user')
            }
          }

          // Always fetch fresh data
          try {
            const freshUserData = await loadUserFromServer()

            if (freshUserData) {
              const type = determineUserType(freshUserData)
              setUser(freshUserData)
              setUserType(type)
              localStorage.setItem('auth_user', JSON.stringify(freshUserData))

              // Load restaurant data for restaurant users
              if (type === 'restaurant') {
                const freshRestaurantData = await loadRestaurantFromServer()
                if (freshRestaurantData) {
                  setRestaurant(freshRestaurantData)
                  localStorage.setItem('restaurant_info', JSON.stringify(freshRestaurantData))
                }
              } else {
                setRestaurant(null)
              }
            } else {
              setUser(null)
              setUserType(null)
              setRestaurant(null)
            }
          } catch (error) {
            console.error('Failed to load fresh data:', error)
            setUser(null)
            setUserType(null)
            setRestaurant(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Use existing restaurant login endpoint for all users
      const loginResponse: LoginResponse = await apiLoginRestaurant(email, password)
      const type = determineUserType(loginResponse.user)

      // Store token with single key for all users
      localStorage.setItem('auth_token', loginResponse.access_token)

      // Store user data
      setUser(loginResponse.user)
      setUserType(type)
      localStorage.setItem('auth_user', JSON.stringify(loginResponse.user))

      // Load restaurant data only for restaurant users
      if (type === 'restaurant') {
        try {
          const restaurantData = await loadRestaurantFromServer()
          if (restaurantData) {
            setRestaurant(restaurantData)
            localStorage.setItem('restaurant_info', JSON.stringify(restaurantData))
          }
        } catch (error) {
          console.error('Failed to load restaurant data:', error)
        }
      } else {
        setRestaurant(null)
      }

      return { success: true, user: loginResponse.user, userType: type }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setLoading(true) // Показываем загрузку на момент очистки

    // Clear all auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('restaurant_info')

    setUser(null)
    setRestaurant(null)
    setUserType(null)

    setLoading(false) // Убираем загрузку
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
        updateRestaurantData,
        userType
      }}>
        {children}
      </AuthContext.Provider>
  )
}