'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import {
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    XCircleIcon,
    GlobeAltIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline'
import {env} from "@/lib/env";

const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

export default function ResetPassword() {
    const router = useRouter()
    const params = useParams()
    const token = params?.token as string
    const { t, locale, setLocale } = useLanguage()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    const [tokenError, setTokenError] = useState('')
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    const languages = [
        { code: 'nl', name: 'Nederlands' },
        { code: 'en', name: 'English' },
        { code: 'de', name: 'Deutsch' },
    ]

    useEffect(() => {
        setMounted(true)
        document.title = 'Reset Password - Splitty'
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest('.language-selector') && languageDropdownOpen) {
                setLanguageDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [languageDropdownOpen])

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setTokenError('Invalid reset link')
            setVerifying(false)
            return
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/auth/verify-reset-token/${token}`
                )
                const data = await response.json()

                if (data.valid) {
                    setTokenValid(true)
                } else {
                    setTokenError(data.message || 'Invalid or expired reset link')
                }
            } catch (err) {
                setTokenError('Failed to verify reset link')
            } finally {
                setVerifying(false)
            }
        }

        verifyToken()
    }, [token])

    const validatePassword = (pwd: string): string[] => {
        const errors: string[] = []

        if (pwd.length < 8) {
            errors.push(t('resetPassword.errors.minLength') || 'Password must be at least 8 characters')
        }
        if (!/[A-Z]/.test(pwd)) {
            errors.push(t('resetPassword.errors.uppercase') || 'Password must contain at least one uppercase letter')
        }
        if (!/[a-z]/.test(pwd)) {
            errors.push(t('resetPassword.errors.lowercase') || 'Password must contain at least one lowercase letter')
        }
        if (!/[0-9]/.test(pwd)) {
            errors.push(t('resetPassword.errors.digit') || 'Password must contain at least one digit')
        }

        return errors
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate password match
        if (password !== confirmPassword) {
            setError(t('resetPassword.errors.passwordMismatch') || 'Passwords do not match')
            return
        }

        // Validate password strength
        const validationErrors = validatePassword(password)
        if (validationErrors.length > 0) {
            setError(validationErrors.join('. '))
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    new_password: password,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            } else {
                setError(data.detail || 'Failed to reset password')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Show loading state while verifying token
    if (verifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">{t('resetPassword.verifying') || 'Verifying reset link...'}</p>
                </div>
            </div>
        )
    }

    // Show error if token is invalid
    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {mounted && (
                    <div className="absolute top-6 right-6">
                        <div className="relative language-selector">
                            <button
                                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                <GlobeAltIcon className="h-5 w-5 text-gray-500" />
                                <span>{languages.find(l => l.code === locale)?.name}</span>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {languageDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLocale(lang.code)
                                                setLanguageDropdownOpen(false)
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition ${
                                                locale === lang.code ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-red-100 p-3">
                                <XCircleIcon className="h-12 w-12 text-red-600" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('resetPassword.invalidTitle') || 'Invalid Reset Link'}
                        </h2>

                        <p className="text-gray-600 mb-8">
                            {tokenError}
                        </p>

                        <Link
                            href="/forgot-password"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition"
                        >
                            {t('resetPassword.requestNew') || 'Request New Reset Link'}
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {mounted && (
                <div className="absolute top-6 right-6">
                    <div className="relative language-selector">
                        <button
                            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            <GlobeAltIcon className="h-5 w-5 text-gray-500" />
                            <span>{languages.find(l => l.code === locale)?.name}</span>
                            <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {languageDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLocale(lang.code)
                                            setLanguageDropdownOpen(false)
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm transition ${
                                            locale === lang.code ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Image
                            src="/images/logo-trans.webp"
                            alt="Splitty"
                            width={200}
                            height={70}
                            className="mx-auto"
                        />
                    </div>

                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {t('resetPassword.title') || 'Reset Your Password'}
                                </h2>
                                <p className="text-gray-600">
                                    {t('resetPassword.subtitle') || 'Enter your new password below'}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('resetPassword.newPassword') || 'New Password'}
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
                                            placeholder={t('resetPassword.passwordPlaceholder') || 'Enter new password'}
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
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('resetPassword.confirmPassword') || 'Confirm Password'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                            placeholder={t('resetPassword.confirmPlaceholder') || 'Confirm new password'}
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
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-600 mb-2 font-medium">
                                        {t('resetPassword.requirements') || 'Password must contain:'}
                                    </p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li className="flex items-center">
                                            <span className={password.length >= 8 ? 'text-green-600' : ''}>
                                                {password.length >= 8 ? '✓' : '○'} {t('resetPassword.req1') || 'At least 8 characters'}
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                                                {/[A-Z]/.test(password) ? '✓' : '○'} {t('resetPassword.req2') || 'One uppercase letter'}
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                                                {/[a-z]/.test(password) ? '✓' : '○'} {t('resetPassword.req3') || 'One lowercase letter'}
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                                                {/[0-9]/.test(password) ? '✓' : '○'} {t('resetPassword.req4') || 'One number'}
                                            </span>
                                        </li>
                                    </ul>
                                </div>

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
                                            {t('resetPassword.resetting') || 'Resetting...'}
                                        </>
                                    ) : (
                                        t('resetPassword.resetButton') || 'Reset Password'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="rounded-full bg-green-100 p-3">
                                    <CheckCircleIcon className="h-12 w-12 text-green-600" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {t('resetPassword.successTitle') || 'Password Reset Successfully!'}
                            </h2>

                            <p className="text-gray-600 mb-8">
                                {t('resetPassword.successMessage') || 'Your password has been reset. Redirecting to login...'}
                            </p>

                            <div className="flex justify-center">
                                <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <p className="text-xs text-gray-500">
                            {t('login.copyright') || '© 2025 Splitty. All rights reserved.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}