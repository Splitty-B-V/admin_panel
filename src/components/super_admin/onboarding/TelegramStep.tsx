'use client'

import { useState, useEffect } from 'react'
import {
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    LinkIcon
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

interface TelegramStepProps {
    restaurantId: number
    restaurantName: string
    onSkipStep: () => void
    onNextStep: () => void
}

export default function TelegramStep({
                                         restaurantId,
                                         restaurantName,
                                         onSkipStep,
                                         onNextStep
                                     }: TelegramStepProps) {
    const { t } = useLanguage()
    const [isSaving, setIsSaving] = useState(false)
    const [telegramData, setTelegramData] = useState({
        restaurant_name: '',
        group_link: ''
    })
    const [telegramErrors, setTelegramErrors] = useState({
        restaurant_name: ''
    })

    useEffect(() => {
        setTelegramData(prev => ({
            ...prev,
            restaurant_name: restaurantName
        }))
    }, [restaurantName])

    const handleSaveAndNext = async () => {
        if (!telegramData.restaurant_name) {
            setTelegramErrors({ restaurant_name: 'Restaurant name is required' })
            return
        }

        try {
            setIsSaving(true)

            await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/telegram`, {
                method: 'POST',
                body: JSON.stringify({
                    restaurant_name: telegramData.restaurant_name
                })
            })

            onNextStep()
        } catch (error: any) {
            console.error('Error saving Telegram:', error)
            setTelegramErrors({ restaurant_name: error.message || 'Failed to save' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.telegram.title')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.telegram.subtitle', { restaurant: restaurantName })}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            {t('onboarding.telegram.restaurantName')}
                        </label>
                        <input
                            type="text"
                            value={telegramData.restaurant_name}
                            onChange={(e) => {
                                setTelegramData({...telegramData, restaurant_name: e.target.value})
                                setTelegramErrors({...telegramErrors, restaurant_name: ''})
                            }}
                            placeholder={restaurantName}
                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
                                telegramErrors.restaurant_name
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                            }`}
                        />
                        {telegramErrors.restaurant_name && (
                            <div className="mt-1 flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                <p className="text-sm text-red-600">{telegramErrors.restaurant_name}</p>
                            </div>
                        )}
                    </div>

                    {telegramData.group_link && (
                        <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900">{t('onboarding.telegram.groupCreated')}</p>
                                <button
                                    onClick={() => window.open(telegramData.group_link, '_blank')}
                                    className="text-[#2BE89A] hover:text-[#2BE89A]/80 transition"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 font-mono break-all">
                                {telegramData.group_link}
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('onboarding.telegram.features.title')}</h4>
                        <ul className="space-y-2 text-xs text-gray-600">
                            <li className="flex items-center">
                                <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                {t('onboarding.telegram.features.orderNotifications')}
                            </li>
                            <li className="flex items-center">
                                <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                {t('onboarding.telegram.features.paymentConfirmations')}
                            </li>
                            <li className="flex items-center">
                                <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                {t('onboarding.telegram.features.dailySummaries')}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onSkipStep}
                    disabled={isSaving}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('onboarding.common.skipStep')}
                </button>
                <button
                    onClick={handleSaveAndNext}
                    disabled={isSaving || !telegramData.restaurant_name}
                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin inline" />
                            {t('onboarding.common.saving')}
                        </>
                    ) : (
                        t('onboarding.common.nextStep')
                    )}
                </button>
            </div>
        </div>
    )
}