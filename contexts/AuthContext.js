import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const clearAuthData = () => {
    localStorage.removeItem('restaurant_isAuthenticated')
    localStorage.removeItem('restaurant_userId')
    localStorage.removeItem('restaurant_userEmail')
    localStorage.removeItem('restaurant_userName')
    localStorage.removeItem('restaurant_userRole')
    localStorage.removeItem('restaurant_restaurantId')
    localStorage.removeItem('restaurant_restaurantName')
    localStorage.removeItem('restaurant_authExpiry')
  }

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('restaurant_isAuthenticated')
      const authExpiry = localStorage.getItem('restaurant_authExpiry')
      
      if (isAuthenticated === 'true' && authExpiry) {
        // Check if auth has expired (7 days)
        const expiryDate = new Date(authExpiry)
        const now = new Date()
        
        if (now > expiryDate) {
          // Auth has expired, clear everything
          clearAuthData()
          setUser(null)
          setLoading(false)
          return
        }
        
        const userData = {
          id: localStorage.getItem('restaurant_userId'),
          email: localStorage.getItem('restaurant_userEmail'),
          name: localStorage.getItem('restaurant_userName'),
          role: localStorage.getItem('restaurant_userRole'),
          restaurantId: localStorage.getItem('restaurant_restaurantId'),
          restaurantName: localStorage.getItem('restaurant_restaurantName'),
        }
        setUser(userData)
      }
      setLoading(false)
    }

    checkAuth()
    
    // Check auth expiry every minute
    const interval = setInterval(checkAuth, 60000)
    
    // Listen for storage changes to sync auth state
    window.addEventListener('storage', checkAuth)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  const login = async (email, password) => {
    try {
      // Check stored credentials first
      const storedCredentials = JSON.parse(localStorage.getItem('restaurant_credentials') || '[]')
      const matchingUser = storedCredentials.find(cred => 
        cred.email === email && cred.password === password
      )
      
      // Also check team members for backward compatibility
      const teamMembers = JSON.parse(localStorage.getItem('restaurant_team_members') || '[]')
      const teamMember = teamMembers.find(member => 
        member.email === email && member.password === password
      )
      
      if (matchingUser || teamMember) {
        const user = matchingUser || teamMember
        
        // Check if user is inactive
        if (user.status === 'inactive' || (teamMember && teamMember.status === 'inactive')) {
          return { success: false, error: 'Dit account is gedeactiveerd. Neem contact op met je manager.' }
        }
        
        const userData = {
          id: Date.now().toString(),
          email: email,
          name: user.name,
          role: user.role && user.role.toLowerCase() === 'manager' ? 'manager' : 'staff',
          restaurantId: '1',
          restaurantName: 'Limon Food & Drinks',
        }

        // Store auth data with 7-day expiry
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 7) // Add 7 days
        
        localStorage.setItem('restaurant_isAuthenticated', 'true')
        localStorage.setItem('restaurant_userId', userData.id)
        localStorage.setItem('restaurant_userEmail', userData.email)
        localStorage.setItem('restaurant_userName', userData.name)
        localStorage.setItem('restaurant_userRole', userData.role)
        localStorage.setItem('restaurant_restaurantId', userData.restaurantId)
        localStorage.setItem('restaurant_restaurantName', userData.restaurantName)
        localStorage.setItem('restaurant_authExpiry', expiryDate.toISOString())

        setUser(userData)
        return { success: true, user: userData }
      } else {
        return { success: false, error: 'Ongeldige e-mail of wachtwoord' }
      }
    } catch (error) {
      return { success: false, error: 'Er is een fout opgetreden bij het inloggen' }
    }
  }

  const logout = () => {
    // Clear all auth data
    clearAuthData()
    setUser(null)
    router.push('/login')
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}