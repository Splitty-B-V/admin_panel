'use client'

import { useState, useEffect } from 'react'
import {
    StarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
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

interface GoogleReviewsStepProps {
    restaurantId: number
    onSkipStep: () => void
    onNextStep: () => void
}

export default function GoogleReviewsStep({
                                              restaurantId,
                                              onSkipStep,
                                              onNextStep
                                          }: GoogleReviewsStepProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [restaurantName, setRestaurantName] = useState('')
    const [googleReviewData, setGoogleReviewData] = useState({
        place_id: '',
        review_link: ''
    })
    const [googleErrors, setGoogleErrors] = useState({
        place_id: ''
    })

    useEffect(() => {
        loadGoogleData()
    }, [restaurantId])

    const loadGoogleData = async () => {
        try {
            setLoading(true)
            const restaurant = await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}`)

            setRestaurantName(restaurant.name)

            if (restaurant.google_place_id) {
                setGoogleReviewData({
                    place_id: restaurant.google_place_id,
                    review_link: `https://search.google.com/local/writereview?placeid=${restaurant.google_place_id}`
                })
            }
        } catch (error) {
            console.error('Error loading Google data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveAndNext = async () => {
        if (!googleReviewData.place_id) {
            setGoogleErrors({ place_id: 'Place ID is required' })
            return
        }

        try {
            setIsSaving(true)

            await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/google-reviews`, {
                method: 'POST',
                body: JSON.stringify({
                    place_id: googleReviewData.place_id
                })
            })

            onNextStep()
        } catch (error: any) {
            console.error('Error saving Google reviews:', error)
            setGoogleErrors({ place_id: error.message || 'Failed to save' })
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.google.title')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.google.subtitle', { restaurant: restaurantName })}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <StarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-[#2BE89A]/5 rounded-lg p-5 border border-[#2BE89A]/20">
                        <h4 className="text-base font-medium text-gray-900 mb-3">{t('onboarding.google.setup', { restaurant: restaurantName })}</h4>

                        <div className="space-y-4 text-sm">
                            <div className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                                <div>
                                    <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step1', { restaurant: restaurantName })}</p>
                                    <a
                                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#2BE89A] hover:text-[#2BE89A]/80 underline"
                                    >
                                        {t('onboarding.google.placeIdFinder')}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                                <div>
                                    <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step2')}</p>
                                    <p className="text-gray-600">{t('onboarding.google.step2Description', { restaurant: restaurantName })}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                                <div>
                                    <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step3')}</p>
                                    <p className="text-gray-600">{t('onboarding.google.step3Description')}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                                <div>
                                    <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step4')}</p>
                                    <p className="text-gray-600">{t('onboarding.google.step4Description', { restaurant: restaurantName })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Place ID Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('onboarding.google.placeId')}
                        </label>
                        <input
                            type="text"
                            value={googleReviewData.place_id}
                            onChange={(e) => {
                                const placeId = e.target.value
                                setGoogleReviewData({
                                    place_id: placeId,
                                    review_link: placeId ? `https://search.google.com/local/writereview?placeid=${placeId}` : ''
                                })
                                setGoogleErrors({ place_id: '' })
                            }}
                            placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                googleErrors.place_id
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-gray-200 focus:border-[#2BE89A] focus:ring-2 focus:ring-[#2BE89A]/20'
                            }`}
                        />
                        {googleErrors.place_id && (
                            <div className="mt-1 flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                <p className="text-sm text-red-600">{googleErrors.place_id}</p>
                            </div>
                        )}
                    </div>

                    {/* Generated Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('onboarding.google.reviewLink')}
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-700 font-mono break-all">
                                https://search.google.com/local/writereview?placeid={googleReviewData.place_id || 'PLACE_ID'}
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{t('onboarding.google.changeLater')}</p>
                    </div>

                    {googleReviewData.place_id && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <p className="text-sm text-green-700">
                                    {t('onboarding.google.customerRedirection')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onSkipStep}
                    disabled={isSaving || loading}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('onboarding.common.skipStep')}
                </button>
                <button
                    onClick={handleSaveAndNext}
                    disabled={isSaving || loading || !googleReviewData.place_id}
                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
                </button>
            </div>
        </div>
    )
}