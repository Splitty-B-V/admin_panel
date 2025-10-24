'use client'

import { useState, useEffect } from 'react'
import {
    WifiIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { env } from '@/lib/env'

const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

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

interface POSStepProps {
    restaurantId: number
    restaurantName: string
    onSkipStep: () => void
    onNextStep: () => void
    saving: boolean
}

const POSFormSkeleton = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-5 animate-pulse">
        <div className="h-10 bg-gray-300 rounded w-full"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
    </div>
)

export default function POSStep({
                                    restaurantId,
                                    restaurantName,
                                    onSkipStep,
                                    onNextStep,
                                    saving
                                }: POSStepProps) {
    const { t } = useLanguage()

    const [initialLoading, setInitialLoading] = useState(true)
    const [posData, setPosData] = useState({
        pos_type: '',
        username: '',
        password: '',
        base_url: '',
        // Для MplusKASSA
        mplus_port: '',
        // Для unTill
        untill_ip: '',
        untill_port: '',
        untill_db: ''
    })
    const [posErrors, setPosErrors] = useState({
        pos_type: '',
        username: '',
        password: '',
        base_url: ''
    })
    const [posTestResult, setPosTestResult] = useState<{
        success: boolean
        message: string
        show: boolean
    }>({ success: false, message: '', show: false })
    const [testing, setTesting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        loadPOSConfig()
    }, [restaurantId])

    const loadPOSConfig = async () => {
        try {
            setInitialLoading(true)
            const config = await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/pos`)

            if (config.pos_type) {
                const baseUrl = config.base_url || ''

                if (config.pos_type === 'mpluskassa') {
                    const match = baseUrl.match(/:(\d+)$/)
                    const port = match ? match[1] : ''

                    setPosData({
                        pos_type: config.pos_type,
                        username: config.username || '',
                        password: config.password || '',  // <-- ВОТ ТУТ
                        base_url: baseUrl,
                        mplus_port: port,
                        untill_ip: '',
                        untill_port: '',
                        untill_db: ''
                    })
                } else if (config.pos_type === 'untill') {
                    const urlMatch = baseUrl.match(/^https?:\/\/([^:]+):(\d+)\/api\/v1\/(.+)$/)

                    if (urlMatch) {
                        setPosData({
                            pos_type: config.pos_type,
                            username: config.username || '',
                            password: config.password || '',  // <-- И ТУТ
                            base_url: baseUrl,
                            mplus_port: '',
                            untill_ip: urlMatch[1],
                            untill_port: urlMatch[2],
                            untill_db: urlMatch[3]
                        })
                    }
                }
            }
        } catch (error) {
            console.error('Error loading POS config:', error)
        } finally {
            setInitialLoading(false)
        }
    }

    // Будуємо URL для unTill
    const buildUntillUrl = () => {
        if (posData.untill_ip && posData.untill_port && posData.untill_db) {
            return `http://${posData.untill_ip}:${posData.untill_port}/api/v1/${posData.untill_db}`
        }
        return ''
    }

    // Будуємо URL для MplusKASSA
    const buildMplusUrl = () => {
        if (posData.mplus_port) {
            return `https://api.mpluskassa.nl:${posData.mplus_port}`
        }
        return ''
    }

    const handleSavePOSConfig = async () => {
        setPosErrors({ pos_type: '', username: '', password: '', base_url: '' })

        // Валидация
        if (!posData.pos_type) {
            setPosErrors(prev => ({ ...prev, pos_type: t('onboarding.pos.validation.posTypeRequired') }))
            return
        }

        if (!posData.username) {
            setPosErrors(prev => ({ ...prev, username: t('onboarding.pos.validation.usernameRequired') }))
            return
        }

        if (!posData.password) {
            setPosErrors(prev => ({ ...prev, password: t('onboarding.pos.validation.passwordRequired') }))
            return
        }

        let fullBaseUrl = ''
        if (posData.pos_type === 'mpluskassa') {
            fullBaseUrl = buildMplusUrl()
        } else if (posData.pos_type === 'untill') {
            fullBaseUrl = buildUntillUrl()
        }

        if (!fullBaseUrl) {
            setPosErrors(prev => ({ ...prev, base_url: t('onboarding.pos.validation.apiUrlRequired') }))
            return
        }

        try {
            setIsSaving(true)

            const saveData = {
                pos_type: posData.pos_type,
                username: posData.username,
                password: posData.password,
                base_url: fullBaseUrl,
                environment: 'production',
                is_active: true
            }

            await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/pos`, {
                method: 'POST',
                body: JSON.stringify(saveData)
            })

            // Успех - переходим на следующий шаг
            onNextStep()
        } catch (error: any) {
            console.error('Error saving POS config:', error)
            setPosTestResult({
                success: false,
                message: error.message || 'Failed to save POS configuration',
                show: true
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleTestConnection = async () => {
        setPosErrors({ pos_type: '', username: '', password: '', base_url: '' })
        setPosTestResult({ success: false, message: '', show: false })

        if (!posData.pos_type || !posData.username || !posData.password) {
            setPosTestResult({
                success: false,
                message: t('onboarding.pos.validation.allFieldsRequired'),
                show: true
            })
            return
        }

        let fullBaseUrl = ''

        if (posData.pos_type === 'mpluskassa') {
            fullBaseUrl = buildMplusUrl()
        } else if (posData.pos_type === 'untill') {
            fullBaseUrl = buildUntillUrl()
        }

        if (!fullBaseUrl) {
            setPosTestResult({
                success: false,
                message: t('onboarding.pos.validation.apiUrlRequired'),
                show: true
            })
            return
        }

        try {
            setTesting(true)

            const testData = {
                pos_type: posData.pos_type,
                username: posData.username,
                password: posData.password,
                base_url: fullBaseUrl
            }

            const response = await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/pos/test`, {
                method: 'POST',
                body: JSON.stringify(testData)
            })

            if (response.status_code === 200) {
                setPosTestResult({
                    success: true,
                    message: response.message || t('onboarding.pos.test.success'),
                    show: true
                })
            } else {
                setPosTestResult({
                    success: false,
                    message: response.message || t('onboarding.pos.test.failed'),
                    show: true
                })
            }
        } catch (err: any) {
            setPosTestResult({
                success: false,
                message: err.message || t('onboarding.pos.test.failed'),
                show: true
            })
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.pos.title')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.pos.subtitle', { restaurant: restaurantName })}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <WifiIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    {initialLoading ? (
                        <POSFormSkeleton />
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-5">
                            {/* POS Type */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                    {t('onboarding.pos.form.posSystem')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={posData.pos_type}
                                    onChange={(e) => {
                                        setPosData({
                                            ...posData,
                                            pos_type: e.target.value,
                                            base_url: '',
                                            mplus_port: '',
                                            untill_ip: '',
                                            untill_port: '',
                                            untill_db: ''
                                        })
                                        setPosErrors({...posErrors, pos_type: ''})
                                    }}
                                    className={`w-full px-3 py-2.5 bg-white border rounded-md text-gray-900 text-sm focus:outline-none transition-colors ${
                                        posErrors.pos_type
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                    }`}
                                >
                                    <option value="">{t('onboarding.pos.form.selectPOS')}</option>
                                    <option value="untill">unTill</option>
                                    <option value="mpluskassa">MplusKASSA</option>
                                </select>
                                {posErrors.pos_type && (
                                    <div className="mt-1 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                        <p className="text-sm text-red-600">{posErrors.pos_type}</p>
                                    </div>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                    {t('onboarding.pos.form.username')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={posData.username}
                                    onChange={(e) => {
                                        setPosData({...posData, username: e.target.value})
                                        setPosErrors({...posErrors, username: ''})
                                    }}
                                    className={`w-full px-3 py-2.5 bg-white border rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                        posErrors.username
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                    }`}
                                    placeholder={t('onboarding.pos.form.usernamePlaceholder')}
                                />
                                {posErrors.username && (
                                    <div className="mt-1 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                        <p className="text-sm text-red-600">{posErrors.username}</p>
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                    {t('onboarding.pos.form.password')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={posData.password}
                                    onChange={(e) => {
                                        setPosData({...posData, password: e.target.value})
                                        setPosErrors({...posErrors, password: ''})
                                    }}
                                    className={`w-full px-3 py-2.5 bg-white border rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                        posErrors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                    }`}
                                    placeholder={t('onboarding.pos.form.passwordPlaceholder')}
                                />
                                {posErrors.password && (
                                    <div className="mt-1 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                        <p className="text-sm text-red-600">{posErrors.password}</p>
                                    </div>
                                )}
                            </div>

                            {/* MplusKASSA Fields */}
                            {posData.pos_type === 'mpluskassa' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                        Port <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-sm">https://api.mpluskassa.nl:</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="34562"
                                                value={posData.mplus_port}
                                                onChange={(e) => {
                                                    const port = e.target.value
                                                    setPosData({
                                                        ...posData,
                                                        mplus_port: port,
                                                        base_url: port ? `https://api.mpluskassa.nl:${port}` : ''  // <-- ОБНОВИ base_url
                                                    })
                                                    setPosErrors({...posErrors, base_url: ''})
                                                }}
                                                className="w-full pl-48 pr-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                            />
                                        </div>
                                        {posData.pos_type === 'mpluskassa' && (
                                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                                                    API URL
                                                </p>
                                                <p className="text-sm font-mono text-gray-900 break-all">
                                                    {posData.mplus_port
                                                        ? `https://api.mpluskassa.nl:${posData.mplus_port}`
                                                        : 'https://api.mpluskassa.nl:_____'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* unTill Fields */}
                            {posData.pos_type === 'untill' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                            Database Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="13333-POS-K1"
                                            value={posData.untill_db}
                                            onChange={(e) => {
                                                const db = e.target.value
                                                setPosData({
                                                    ...posData,
                                                    untill_db: db,
                                                    base_url: posData.untill_ip && posData.untill_port && db
                                                        ? `http://${posData.untill_ip}:${posData.untill_port}/api/v1/${db}`
                                                        : ''
                                                })
                                                setPosErrors({...posErrors, base_url: ''})
                                            }}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                                IP Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="92.64.126.160"
                                                value={posData.untill_ip}
                                                onChange={(e) => {
                                                    const ip = e.target.value
                                                    setPosData({
                                                        ...posData,
                                                        untill_ip: ip,
                                                        base_url: ip && posData.untill_port && posData.untill_db
                                                            ? `http://${ip}:${posData.untill_port}/api/v1/${posData.untill_db}`
                                                            : ''
                                                    })
                                                    setPosErrors({...posErrors, base_url: ''})
                                                }}
                                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                                Port <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="3064"
                                                value={posData.untill_port}
                                                onChange={(e) => {
                                                    const port = e.target.value
                                                    setPosData({
                                                        ...posData,
                                                        untill_port: port,
                                                        base_url: posData.untill_ip && port && posData.untill_db
                                                            ? `http://${posData.untill_ip}:${port}/api/v1/${posData.untill_db}`
                                                            : ''
                                                    })
                                                    setPosErrors({...posErrors, base_url: ''})
                                                }}
                                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {posData.pos_type === 'untill' && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                                                API URL
                                            </p>
                                            <p className="text-sm font-mono text-gray-900 break-all">
                                                http://{posData.untill_ip || '___.___.___.___'}:{posData.untill_port || '____'}/api/v1/{posData.untill_db || '_____'}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Test Connection Button */}
                            <div className="pt-3 border-t border-gray-200">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing || !posData.pos_type || !posData.username || !posData.password ||
                                        (posData.pos_type === 'mpluskassa' && !posData.mplus_port) ||
                                        (posData.pos_type === 'untill' && (!posData.untill_db || !posData.untill_ip || !posData.untill_port))
                                    }
                                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {testing ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin inline" />
                                            {t('onboarding.pos.test.testing')}
                                        </>
                                    ) : (
                                        <>
                                            <WifiIcon className="h-4 w-4 mr-2 inline" />
                                            {t('onboarding.pos.test.button')}
                                        </>
                                    )}
                                </button>

                                {/* Test Result Display */}
                                {posTestResult.show && (
                                    <div className={`mt-4 p-4 rounded-lg border ${
                                        posTestResult.success
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {posTestResult.success ? (
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <p className={`text-sm font-medium ${
                                                    posTestResult.success ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                    {posTestResult.message}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setPosTestResult({ success: false, message: '', show: false })}
                                                className={`p-1 rounded-md ${
                                                    posTestResult.success
                                                        ? 'text-green-500 hover:text-green-700 hover:bg-green-100'
                                                        : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                                                } transition`}
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onSkipStep}
                    disabled={isSaving || initialLoading}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('onboarding.common.skipStep')}
                </button>
                <button
                    onClick={handleSavePOSConfig}
                    disabled={isSaving || initialLoading}
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