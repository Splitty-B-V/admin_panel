import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/forgot-password', '/reset-password']
    const isPublicRoute = publicRoutes.includes(router.pathname)

    if (!loading) {
      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access a protected route
        // Store the attempted URL to redirect back after login
        if (router.pathname !== '/') {
          sessionStorage.setItem('restaurant_redirect_url', router.pathname)
        }
        router.replace('/login')
      } else if (user && router.pathname === '/login') {
        // User is authenticated and trying to access login page
        // Check if there's a redirect URL stored
        const redirectUrl = sessionStorage.getItem('restaurant_redirect_url')
        if (redirectUrl) {
          sessionStorage.removeItem('restaurant_redirect_url')
          router.replace(redirectUrl)
        } else {
          router.replace('/dashboard')
        }
      }
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  // For public routes, show the page
  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  if (publicRoutes.includes(router.pathname)) {
    return children
  }

  // For protected routes, only show if user is authenticated
  if (!user) {
    return null // Will redirect to login via useEffect
  }

  return children
}