import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export default function ResetPassword() {
  const router = useRouter()
  const { token, email } = router.query
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState([])

  // Password requirements
  const passwordRequirements = [
    { id: 'length', label: 'Minimaal 8 karakters', regex: /.{8,}/ },
    { id: 'uppercase', label: 'Minimaal 1 hoofdletter', regex: /[A-Z]/ },
    { id: 'lowercase', label: 'Minimaal 1 kleine letter', regex: /[a-z]/ },
    { id: 'number', label: 'Minimaal 1 cijfer', regex: /[0-9]/ },
    { id: 'special', label: 'Minimaal 1 speciaal teken (!@#$%^&*)', regex: /[!@#$%^&*]/ },
  ]

  useEffect(() => {
    if (token && email) {
      validateToken()
    }
  }, [token, email])

  useEffect(() => {
    // Check password strength
    const feedback = passwordRequirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }))
    setPasswordFeedback(feedback)
    
    const strength = feedback.filter(f => f.met).length
    setPasswordStrength(strength)
  }, [password])

  const validateToken = () => {
    if (!token || !email) {
      setTokenValid(false)
      setError('Ongeldige herstel link')
      return
    }

    // Get stored recovery tokens
    const recoveryTokens = JSON.parse(localStorage.getItem('recovery_tokens') || '[]')
    
    // Find matching token
    const tokenData = recoveryTokens.find(
      t => t.token === token && t.email === decodeURIComponent(email) && !t.used
    )

    if (!tokenData) {
      setTokenValid(false)
      setError('Ongeldige of al gebruikte herstel link')
      return
    }

    // Check if token is expired (15 minutes)
    if (Date.now() > tokenData.expiresAt) {
      setTokenValid(false)
      setTokenExpired(true)
      setError('Deze herstel link is verlopen')
      return
    }

    setTokenValid(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    // Validate password strength
    if (passwordStrength < 5) {
      setError('Wachtwoord voldoet niet aan alle vereisten')
      return
    }

    setLoading(true)

    try {
      // Re-validate token before proceeding
      const recoveryTokens = JSON.parse(localStorage.getItem('recovery_tokens') || '[]')
      const tokenIndex = recoveryTokens.findIndex(
        t => t.token === token && t.email === decodeURIComponent(email) && !t.used
      )

      if (tokenIndex === -1) {
        setError('Herstel link is niet meer geldig')
        setLoading(false)
        return
      }

      const tokenData = recoveryTokens[tokenIndex]

      // Check expiration again
      if (Date.now() > tokenData.expiresAt) {
        setError('Deze herstel link is verlopen')
        setTokenExpired(true)
        setLoading(false)
        return
      }

      // Update user password (in production, this would be an API call)
      const users = JSON.parse(localStorage.getItem('restaurant_users') || '[]')
      const userIndex = users.findIndex(u => u.email === decodeURIComponent(email))
      
      if (userIndex !== -1) {
        users[userIndex].password = password // In production, hash the password
        users[userIndex].passwordChangedAt = Date.now()
        localStorage.setItem('restaurant_users', JSON.stringify(users))
      }

      // Mark token as used
      recoveryTokens[tokenIndex].used = true
      recoveryTokens[tokenIndex].usedAt = Date.now()
      localStorage.setItem('recovery_tokens', JSON.stringify(recoveryTokens))

      // Log password reset for security audit
      const securityLog = JSON.parse(localStorage.getItem('security_log') || '[]')
      securityLog.push({
        type: 'password_reset',
        email: decodeURIComponent(email),
        timestamp: Date.now(),
        ip: 'client', // In production, capture actual IP
      })
      localStorage.setItem('security_log', JSON.stringify(securityLog))

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-orange-500'
    if (passwordStrength <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Zwak'
    if (passwordStrength <= 3) return 'Matig'
    if (passwordStrength <= 4) return 'Goed'
    return 'Sterk'
  }

  // Show loading while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Herstel link valideren...</p>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image 
              src="/logo-trans.webp" 
              alt="Splitty" 
              width={200} 
              height={70}
              className="mx-auto mb-8"
            />
            
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {tokenExpired ? (
                <ClockIcon className="h-8 w-8 text-red-600" />
              ) : (
                <XCircleIcon className="h-8 w-8 text-red-600" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {tokenExpired ? 'Link verlopen' : 'Ongeldige link'}
            </h2>
            <p className="text-gray-600 mb-6">
              {tokenExpired 
                ? 'Deze herstel link is verlopen. Herstel links zijn slechts 15 minuten geldig voor je veiligheid.'
                : 'Deze herstel link is ongeldig of is al gebruikt.'}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-800">
                Vraag een nieuwe herstel link aan om je wachtwoord te wijzigen.
              </p>
            </div>

            <div className="space-y-3">
              <Link 
                href="/forgot-password"
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm flex items-center justify-center"
              >
                Nieuwe link aanvragen
              </Link>
              
              <Link 
                href="/login"
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
              >
                Terug naar inloggen
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image 
              src="/logo-trans.webp" 
              alt="Splitty" 
              width={200} 
              height={70}
              className="mx-auto mb-8"
            />
            
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wachtwoord gewijzigd!</h2>
            <p className="text-gray-600 mb-6">
              Je wachtwoord is succesvol gewijzigd. Je wordt doorgestuurd naar de inlogpagina...
            </p>

            <div className="animate-pulse">
              <Link 
                href="/login"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                Direct naar inloggen →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image 
            src="/logo-trans.webp" 
            alt="Splitty" 
            width={200} 
            height={70}
            className="mx-auto"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nieuw wachtwoord instellen</h2>
          <p className="text-gray-600">
            Kies een sterk wachtwoord voor je account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nieuw wachtwoord
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Wachtwoord sterkte</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength <= 2 ? 'text-red-600' : 
                    passwordStrength <= 3 ? 'text-orange-600' : 
                    passwordStrength <= 4 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {password && (
              <div className="mt-3 space-y-1">
                {passwordFeedback.map(req => (
                  <div key={req.id} className="flex items-center text-xs">
                    {req.met ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-gray-300 mr-2" />
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Bevestig wachtwoord
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Wachtwoorden komen niet overeen</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="mt-1 text-xs text-green-600">Wachtwoorden komen overeen</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordStrength < 5 || password !== confirmPassword}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Wachtwoord wijzigen...
              </>
            ) : (
              'Wachtwoord wijzigen'
            )}
          </button>

          {/* Cancel */}
          <Link 
            href="/login"
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
          >
            Annuleren
          </Link>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Splitty B.V. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </div>
  )
}