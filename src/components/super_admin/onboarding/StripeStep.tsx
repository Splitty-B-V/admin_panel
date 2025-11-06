'use client'

import { useState, useEffect } from 'react'
import {
    CreditCardIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ClockIcon,
    SparklesIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { env } from '@/lib/env'

const API_BASE_URL = `http://${env.apiUrl}/${env.apiVersion}`

function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function apiRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    })

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Unauthorized')
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `API Error: ${response.statusText}`)
    }

    return response.json()
}

interface StripeStepProps {
    restaurantId: number
    restaurantName: string
    onSkipStep: () => void
    onNextStep: () => void
    saving: boolean
}

// Skeleton для Stripe статусу
const StripeStatusSkeleton = () => (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-48 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
)

export default function StripeStep({
                                       restaurantId,
                                       restaurantName,
                                       onSkipStep,
                                       onNextStep,
                                       saving
                                   }: StripeStepProps) {
    const { t } = useLanguage()

    const [initialLoading, setInitialLoading] = useState(true)
    const [stripeConnected, setStripeConnected] = useState(false)
    const [stripeConnecting, setStripeConnecting] = useState(false)

    useEffect(() => {
        checkStripeStatus()
    }, [restaurantId])

    const checkStripeStatus = async () => {
        try {
            setInitialLoading(true)
            const restaurant = await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}`)
            setStripeConnected(!!restaurant.stripe_account_id)
        } catch (error) {
            console.error('Error checking Stripe status:', error)
        } finally {
            setInitialLoading(false)
        }
    }

    const handleStripeConnect = async () => {
        try {
            setStripeConnecting(true)
            const response = await apiRequest(
                `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/stripe/oauth-url`
            )

            if (response.oauth_url) {
                window.location.href = response.oauth_url
            }
        } catch (error) {
            console.error('Error getting Stripe OAuth URL:', error)
        } finally {
            setStripeConnecting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.stripe.title')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.stripe.subtitle', { restaurant: restaurantName })}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <CreditCardIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-6">
                    {initialLoading ? (
                        <StripeStatusSkeleton />
                    ) : stripeConnected ? (
                        <div className="bg-[#2BE89A]/5 rounded-lg p-5 border border-[#2BE89A]/20">
                            <div className="flex items-center mb-4">
                                <CheckCircleIcon className="h-5 w-5 text-[#2BE89A] mr-3" />
                                <h4 className="text-base font-medium text-gray-900">{t('onboarding.stripe.connected')}</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                {t('onboarding.stripe.connectedDescription')}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                <h4 className="text-base font-medium text-gray-900 mb-3">{t('onboarding.stripe.connectWith')}</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    {t('onboarding.stripe.connectDescription', { restaurant: restaurantName })}
                                </p>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                        <ShieldCheckIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                        <p className="text-xs text-gray-600 text-center">{t('onboarding.stripe.features.pciCompliant')}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                        <ClockIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                        <p className="text-xs text-gray-600 text-center">{t('onboarding.stripe.features.dailyPayouts')}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                        <SparklesIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                        <p className="text-xs text-gray-600 text-center">{t('onboarding.stripe.features.realTimeInsights')}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStripeConnect}
                                disabled={stripeConnecting}
                                className="w-full px-4 py-3 bg-gradient-to-r from-[#635BFF] via-[#4F46E5] to-[#0073E6] text-white font-medium rounded-lg hover:opacity-90 flex items-center justify-center text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {stripeConnecting ? (
                                    <>
                                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                        {t('onboarding.stripe.connecting')}
                                    </>
                                ) : (
                                    <>
                                        <span>{t('onboarding.stripe.connectWith')}</span>
                                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </button>

                            <div className="bg-[#2BE89A]/5 rounded-lg p-3.5 border border-[#2BE89A]/20">
                                <p className="text-xs text-gray-600">
                                    <span className="text-[#2BE89A] font-medium">{t('onboarding.common.secure')}</span> {t('onboarding.stripe.securityNote')}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onSkipStep}
                    disabled={saving || initialLoading}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    {t('onboarding.common.skipStep')}
                </button>
                {stripeConnected && !initialLoading && (
                    <button
                        onClick={onNextStep}
                        className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition"
                    >
                        {t('onboarding.common.nextStep')}
                    </button>
                )}
            </div>
        </div>
    )
}