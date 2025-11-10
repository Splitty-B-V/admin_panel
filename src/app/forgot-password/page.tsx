'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import {
    EnvelopeIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    GlobeAltIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline'
import {env} from "@/lib/env";

export default function ForgotPassword() {
    const router = useRouter()
    const { t, locale, setLocale } = useLanguage()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    const languages = [
        { code: 'nl', name: 'Nederlands' },
        { code: 'en', name: 'English' },
        { code: 'de', name: 'Deutsch' },
    ]

    useEffect(() => {
        setMounted(true)
        document.title = 'Forgot Password - Splitty'
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
            } else {
                setError(data.detail || 'Failed to send reset email')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
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
                                    {t('forgotPassword.title') || 'Forgot Password?'}
                                </h2>
                                <p className="text-gray-600">
                                    {t('forgotPassword.subtitle') || 'Enter your email address and we\'ll send you a link to reset your password.'}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('forgotPassword.email') || 'Email Address'}
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
                                            placeholder={t('forgotPassword.emailPlaceholder') || 'your@email.com'}
                                            required
                                        />
                                    </div>
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
                                            {t('forgotPassword.sending') || 'Sending...'}
                                        </>
                                    ) : (
                                        t('forgotPassword.sendButton') || 'Send Reset Link'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm text-green-600 hover:text-green-700 transition font-medium"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                    {t('forgotPassword.backToLogin') || 'Back to Login'}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="rounded-full bg-green-100 p-3">
                                    <CheckCircleIcon className="h-12 w-12 text-green-600" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {t('forgotPassword.successTitle') || 'Check Your Email'}
                            </h2>

                            <p className="text-gray-600 mb-8">
                                {'If an account with that email exists, you will receive a password reset link shortly.'}
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    {t('forgotPassword.checkSpam') || 'Didn\'t receive the email? Check your spam folder.'}
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm text-green-600 hover:text-green-700 transition font-medium"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                {t('forgotPassword.backToLogin') || 'Back to Login'}
                            </Link>
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