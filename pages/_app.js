import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import AuthGuard from '../components/AuthGuard'
import { useEffect } from 'react'
import { initializeDefaultUsers } from '../utils/initializeAuth'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize default users on app load
    const initialized = initializeDefaultUsers()
    if (initialized) {
      // Default admin account has been created
    }
  }, [])

  return (
    <LanguageProvider>
      <AuthProvider>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </AuthProvider>
    </LanguageProvider>
  )
}