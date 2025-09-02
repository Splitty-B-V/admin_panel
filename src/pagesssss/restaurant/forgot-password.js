import { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)

  // Mailgun configuration (in production, these should be environment variables)
  const MAILGUN_DOMAIN = 'mg.splitty.nl'
  const MAILGUN_API_KEY = 'YOUR_MAILGUN_API_KEY' // Replace with actual API key
  const MAILGUN_API_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`
  const RECOVERY_BASE_URL = 'https://admin.splitty.nl' // Your production URL

  const generateRecoveryToken = () => {
    // Generate a secure random token
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  const sendRecoveryEmail = async (recipientEmail, token) => {
    // In production, this should be a server-side API call
    const recoveryLink = `${RECOVERY_BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(recipientEmail)}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { max-width: 150px; margin-bottom: 24px; }
            h1 { color: #111827; font-size: 24px; margin: 0 0 8px 0; }
            .subtitle { color: #6b7280; font-size: 14px; }
            .content { margin: 32px 0; }
            .button { display: inline-block; background: linear-gradient(to right, #10b981, #059669); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 24px 0; }
            .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin: 24px 0; color: #92400e; font-size: 14px; }
            .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
            .link { color: #10b981; text-decoration: none; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://splitty.nl/logo.png" alt="Splitty" class="logo">
              <h1>Wachtwoord herstellen</h1>
              <p class="subtitle">Restaurant Admin Portal</p>
            </div>
            
            <div class="content">
              <p>Hallo,</p>
              <p>We hebben een verzoek ontvangen om het wachtwoord voor je Splitty Restaurant account te herstellen.</p>
              
              <center>
                <a href="${recoveryLink}" class="button">Herstel wachtwoord</a>
              </center>
              
              <div class="warning">
                <strong>⏱️ Let op:</strong> Deze link is slechts 15 minuten geldig om veiligheidsredenen. Als de link verlopen is, vraag dan een nieuwe aan.
              </div>
              
              <p>Of kopieer deze link in je browser:</p>
              <p><a href="${recoveryLink}" class="link">${recoveryLink}</a></p>
              
              <p>Als je geen wachtwoordherstel hebt aangevraagd, kun je deze e-mail veilig negeren. Je wachtwoord blijft ongewijzigd.</p>
            </div>
            
            <div class="footer">
              <p>© 2025 Splitty B.V. | Alle rechten voorbehouden</p>
              <p>Deze e-mail is automatisch verzonden, reageer niet op dit bericht.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
Wachtwoord herstellen - Splitty Restaurant Admin

Hallo,

We hebben een verzoek ontvangen om het wachtwoord voor je Splitty Restaurant account te herstellen.

Klik op de volgende link om je wachtwoord te herstellen:
${recoveryLink}

LET OP: Deze link is slechts 15 minuten geldig om veiligheidsredenen.

Als je geen wachtwoordherstel hebt aangevraagd, kun je deze e-mail veilig negeren.

© 2025 Splitty B.V.
    `

    // For development, we'll simulate the email sending
    // In production, this should make an actual API call to Mailgun

    // Simulated Mailgun API call (replace with actual fetch in production)
    /*
    const formData = new FormData()
    formData.append('from', 'Splitty Support <noreply@splitty.nl>')
    formData.append('to', recipientEmail)
    formData.append('subject', 'Wachtwoord herstellen - Splitty Restaurant Admin')
    formData.append('text', emailText)
    formData.append('html', emailHtml)
    
    const response = await fetch(MAILGUN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    */

    // For development, return success
    return { success: true, messageId: 'dev-' + Date.now() }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setRateLimitWarning(false)

    try {
      // Check for existing recovery attempts (rate limiting)
      const recoveryAttempts = JSON.parse(localStorage.getItem('recovery_attempts') || '[]')
      const recentAttempts = recoveryAttempts.filter(
        attempt => Date.now() - attempt.timestamp < 3600000 // 1 hour
      )
      
      if (recentAttempts.length >= 3) {
        setError('Te veel herstel pogingen. Probeer het over een uur opnieuw.')
        setRateLimitWarning(true)
        setLoading(false)
        return
      }

      // Check if user exists (in production, verify against database)
      const users = JSON.parse(localStorage.getItem('restaurant_users') || '[]')
      const userExists = users.some(u => u.email === email) || email === 'demo@restaurant.nl'

      if (!userExists) {
        // Don't reveal if email exists or not for security
        setSuccess(true)
        setLoading(false)
        return
      }

      // Generate recovery token with 15-minute expiration
      const token = generateRecoveryToken()
      const expiresAt = Date.now() + (15 * 60 * 1000) // 15 minutes from now

      // Store recovery token with timestamp
      const recoveryTokens = JSON.parse(localStorage.getItem('recovery_tokens') || '[]')
      
      // Remove any existing tokens for this email
      const filteredTokens = recoveryTokens.filter(t => t.email !== email)
      
      // Add new token
      filteredTokens.push({
        email,
        token,
        createdAt: Date.now(),
        expiresAt,
        used: false
      })

      localStorage.setItem('recovery_tokens', JSON.stringify(filteredTokens))

      // Record recovery attempt
      recoveryAttempts.push({
        email,
        timestamp: Date.now()
      })
      localStorage.setItem('recovery_attempts', JSON.stringify(recoveryAttempts))

      // Send recovery email via Mailgun
      await sendRecoveryEmail(email, token)

      // Show success message
      setSuccess(true)

      // Clean up expired tokens periodically
      const allTokens = JSON.parse(localStorage.getItem('recovery_tokens') || '[]')
      const validTokens = allTokens.filter(t => t.expiresAt > Date.now())
      localStorage.setItem('recovery_tokens', JSON.stringify(validTokens))

    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setLoading(false)
    }
  }

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
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Controleer je e-mail</h2>
            <p className="text-gray-600 mb-6">
              We hebben een herstel link naar <strong>{email}</strong> gestuurd als dit account bestaat.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-800 mb-1">Link verloopt na 15 minuten</p>
                  <p className="text-xs text-amber-700">
                    Om veiligheidsredenen is de herstel link slechts 15 minuten geldig. 
                    Vraag een nieuwe aan als de link verlopen is.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSuccess(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Nieuwe link aanvragen
              </button>
              
              <Link 
                href="/login"
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm flex items-center justify-center"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Terug naar inloggen
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Wachtwoord vergeten?</h2>
          <p className="text-gray-600">
            Geen probleem! Vul je e-mailadres in en we sturen je een link om je wachtwoord te herstellen.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <div>
                <p className="text-red-600 text-sm">{error}</p>
                {rateLimitWarning && (
                  <p className="text-red-500 text-xs mt-1">
                    Voor beveiliging beperken we het aantal herstel pogingen.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mailadres
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="je@restaurant.nl"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Vul het e-mailadres in dat je gebruikt voor je restaurant account
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Versturen...
              </>
            ) : (
              <>
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Stuur herstel link
              </>
            )}
          </button>

          {/* Back to Login */}
          <Link 
            href="/login"
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Terug naar inloggen
          </Link>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Snelle beveiliging</p>
              <p className="text-xs">
                De herstel link is slechts 15 minuten geldig voor maximale beveiliging van je account.
              </p>
            </div>
          </div>
        </div>

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