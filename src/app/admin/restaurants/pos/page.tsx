'use client'

import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import SmartLayout from '@/components/common/SmartLayout'
import Breadcrumb from '@/components/super_admin/Breadcrumb'
import { useLanguage } from '@/contexts/LanguageContext'
import {env} from "@/lib/env";
import {
    BuildingStorefrontIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    WifiIcon,
    ArrowPathIcon,
    CpuChipIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// Updated interfaces to match backend response
interface RestaurantPosDetails {
    id: number
    pos_type: string
    username: string
    password: string
    base_url: string
    is_connected: boolean
    is_active: boolean
}

interface RestaurantPOS {
    id: number
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    logo_url?: string
    is_active: boolean
    pos_info: RestaurantPosDetails | null
}

interface RestaurantPOSPageResponse {
    restaurants: RestaurantPOS[]
    total_amount: number
    total_configured: number
    total_connected: number
    offset: number
    limit: number
}



const POSIntegration: NextPage = () => {
    const { t } = useLanguage()

    // State для данных
    const [restaurantData, setRestaurantData] = useState<RestaurantPOSPageResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searching, setSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State для поиска и фильтров
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('all')

    useEffect(() => {
        document.title = 'Admin Panel - Splitty'
    }, [])

    // Дебаунсинг для поиска
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Загрузка ресторанов
    const loadRestaurants = async (searchTerm?: string) => {
        try {
            setError(null)
            if (searchTerm) {
                setSearching(true)
            } else {
                setLoading(true)
            }

            const params = new URLSearchParams()

            // Только добавляем параметры если они есть
            if (searchTerm && searchTerm.trim()) {
                params.append('search', searchTerm.trim())
            }
            if (selectedFilter && selectedFilter !== 'all') {
                params.append('location', selectedFilter)
            }

            // Всегда добавляем limit и offset
            params.append('limit', '1000')
            params.append('offset', '0')

            const url = `${API_BASE_URL}/super_admin/restaurants/pos_connections?${params}`
            console.log('Making request to:', url)
            console.log('Request headers:', getAuthHeaders())

            const response = await fetch(url, {
                headers: getAuthHeaders()
            })

            console.log('Response status:', response.status)
            console.log('Response headers:', response.headers)

            // Добавить обработку 401
            if (response.status === 401) {
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')

                // Редирект на логин
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
                return Promise.reject(new Error('Unauthorized'))
            }

            if (response.status === 422) {
                const errorData = await response.json()
                console.error('422 Validation Error:', errorData)
                throw new Error(`Validation Error: ${JSON.stringify(errorData)}`)
            }

            if (response.ok) {
                const data: RestaurantPOSPageResponse = await response.json()
                console.log('Received data:', data)
                setRestaurantData(data)
            } else {
                const errorText = await response.text()
                console.error('Error response:', errorText)
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }
        } catch (err: any) {
            console.error('Error loading restaurants:', err)
            setError(err.message || t('pos.errors.loadRestaurants'))
        } finally {
            setLoading(false)
            setSearching(false)
        }
    }



    // Первоначальная загрузка
    useEffect(() => {
        loadRestaurants()
    }, [])

    // Поиск при изменении запроса (только если не пустой)
    useEffect(() => {
        if (debouncedSearch.trim()) {
            loadRestaurants(debouncedSearch)
        } else if (debouncedSearch === '' && searchQuery === '') {
            // Перезагружаем только если очистили поиск
            loadRestaurants()
        }
    }, [debouncedSearch])

    // Поиск при изменении фильтра локации (но не при первом рендере)
    useEffect(() => {
        // Не вызываем при первоначальной загрузке
        if (restaurantData !== null) {
            loadRestaurants(searchQuery)
        }
    }, [selectedFilter])

    // Обновление данных
    const handleRefresh = async () => {
        setRefreshing(true)
        await loadRestaurants(searchQuery)
        setRefreshing(false)
    }

    // Фильтрация ресторанов (дополнительная фильтрация на фронте если нужно)
    const filteredRestaurants = restaurantData?.restaurants.filter((restaurant) => {
        return restaurant.is_active
    }) || []

    // Статистика из backend response
    const totalAmount = restaurantData?.total_amount || 0
    const configuredCount = restaurantData?.total_configured || 0
    const connectedCount = restaurantData?.total_connected || 0

    if (loading) {
        return (
            <SmartLayout>
                <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                    <div className="text-center">
                        <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                        <h3 className="mt-4 text-base font-medium text-gray-900">{t('pos.loading.data')}</h3>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    if (error) {
        return (
            <SmartLayout>
                <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                    <div className="text-center">
                        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                        <h3 className="mt-4 text-base font-medium text-gray-900">{t('pos.error.loading')}</h3>
                        <p className="mt-2 text-sm text-gray-500">{error}</p>
                        <button
                            onClick={() => loadRestaurants()}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all"
                        >
                            <ArrowPathIcon className="mr-2 h-5 w-5" />
                            {t('pos.error.retry')}
                        </button>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    return (
        <SmartLayout>
            <div className="min-h-screen bg-[#F9FAFB]">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        {/* Breadcrumb */}
                        <Breadcrumb items={[{ label: t('pos.title') }]} />

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-[#111827] mb-1">
                                    {t('pos.title')}
                                </h1>
                                <p className="text-[#6B7280]">
                                    {t('pos.subtitle')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className={`inline-flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 border border-gray-200 text-[#6B7280] bg-white hover:bg-gray-50 shadow-sm ${
                                    refreshing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={refreshing}
                            >
                                <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''} text-gray-500`} />
                                {refreshing ? t('pos.refreshing') : t('pos.refreshStatus')}
                            </button>
                        </div>

                        {/* Stats Cards - теперь используем данные из backend */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div className="p-6 rounded-xl bg-white shadow-sm">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-green-100">
                                        <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                                            {t('pos.stats.totalRestaurants')}
                                        </p>
                                        <p className="text-2xl font-bold mt-2 text-[#111827]">
                                            {totalAmount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-white shadow-sm">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-emerald-50">
                                        <CpuChipIcon className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                                            {t('pos.stats.configured')}
                                        </p>
                                        <p className="text-2xl font-bold mt-2 text-[#111827]">
                                            {configuredCount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-white shadow-sm">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-green-50">
                                        <WifiIcon className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                                            {t('pos.stats.connected')}
                                        </p>
                                        <p className="text-2xl font-bold mt-2 text-[#111827]">
                                            {connectedCount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-white shadow-sm">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-red-50">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                                            {t('pos.stats.issues')}
                                        </p>
                                        <p className="text-2xl font-bold mt-2 text-[#111827]">
                                            0
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="rounded-xl bg-white shadow-sm">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {searching ? (
                                                <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                                            ) : (
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300"
                                            placeholder={t('pos.search.placeholder')}
                                        />
                                    </div>

                                    <div className="relative lg:w-48">
                                        <select
                                            value={selectedFilter}
                                            onChange={(e) => setSelectedFilter(e.target.value)}
                                            className="appearance-none w-full pl-3 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 cursor-pointer transition text-sm bg-white border border-gray-200 text-gray-900 focus:ring-green-500 hover:border-gray-300"
                                        >
                                            <option value="all">{t('pos.filter.allLocations')}</option>
                                            <option value="amsterdam">{t('pos.filter.locations.amsterdam')}</option>
                                            <option value="rotterdam">{t('pos.filter.locations.rotterdam')}</option>
                                            <option value="utrecht">{t('pos.filter.locations.utrecht')}</option>
                                            <option value="den haag">{t('pos.filter.locations.denHaag')}</option>
                                            <option value="eindhoven">{t('pos.filter.locations.eindhoven')}</option>
                                            <option value="zaandam">{t('pos.filter.locations.zaandam')}</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Restaurant POS Status List */}
                        <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-[#111827]">
                                    {t('pos.list.title')}
                                </h2>
                            </div>

                            <div className="p-4 space-y-3">
                                {filteredRestaurants.map((restaurant) => {
                                    const isConfigured = restaurant.pos_info !== null
                                    const isConnected = restaurant.pos_info?.is_connected || false
                                    const isActive = restaurant.pos_info?.is_active || false

                                    // Определяем фон и бордер карточки
                                    let cardBg = ''
                                    let borderClass = ''

                                    if (isConnected && isActive) {
                                        // Нормальные - зеленый фон и бордер
                                        cardBg = 'bg-green-50/60'
                                        borderClass = 'border border-green-200 hover:border-green-300'
                                    } else if (isConfigured && !isConnected) {
                                        // Не подключены - желтый фон и бордер
                                        cardBg = 'bg-yellow-50/60'
                                        borderClass = 'border border-yellow-200 hover:border-yellow-300'
                                    } else {
                                        // Нет POS - красный фон и бордер
                                        cardBg = 'bg-red-50/60'
                                        borderClass = 'border border-red-200 hover:border-red-300'
                                    }

                                    return (
                                        <div
                                            key={restaurant.id}
                                            className={`p-5 rounded-lg transition-all ${cardBg} ${borderClass}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {/* Restaurant Logo */}
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                                                        {restaurant.logo_url ? (
                                                            <img
                                                                src={restaurant.logo_url}
                                                                alt={restaurant.name}
                                                                className="h-full w-full object-contain p-0.5"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                                                <BuildingStorefrontIcon className="h-5 w-5 text-gray-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-sm font-medium text-gray-900">
                                                                {restaurant.name}
                                                            </h3>
                                                            {restaurant.pos_info && (
                                                                <span className="text-xs text-gray-400">
                                                                    {restaurant.pos_info.pos_type}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs mt-1 text-gray-500">
                                                            {restaurant.city}, {restaurant.country}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    {/* Status */}
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                                        isConnected && isActive
                                                            ? 'bg-green-50 text-green-700'
                                                            : !isConfigured
                                                                ? 'bg-red-50 text-red-600'
                                                                : !isConnected
                                                                    ? 'bg-red-50 text-red-600'
                                                                    : 'bg-yellow-50 text-yellow-700'
                                                    }`}>
                                                        {isConnected && isActive ? (
                                                            <>
                                                                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                                                {t('pos.status.active')}
                                                            </>
                                                        ) : !isConfigured ? (
                                                            <>
                                                                <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                                                                {t('pos.status.notConnected')}
                                                            </>
                                                        ) : !isConnected ? (
                                                            <>
                                                                <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                                                                {t('pos.status.notConnected')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                                                {t('pos.status.inactive')}
                                                            </>
                                                        )}
                                                    </span>

                                                    {/* Action */}
                                                    <Link
                                                        href={`/admin/restaurants/detail/${restaurant.id}`}
                                                        className="text-sm font-medium text-gray-600 hover:text-gray-700"
                                                    >
                                                        {t('pos.actions.details')} →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Empty State */}
                        {filteredRestaurants.length === 0 && (
                            <div className="text-center py-16 rounded-xl bg-white shadow-sm">
                                <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-base font-medium text-[#111827]">
                                    {t('pos.empty.title')}
                                </h3>
                                <p className="mt-2 text-sm text-[#6B7280]">
                                    {t('pos.empty.description')}
                                </p>
                                <Link
                                    href="/admin/restaurants/new"
                                    className="mt-6 inline-flex items-center px-4 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all"
                                >
                                    <BuildingStorefrontIcon className="mr-2 h-5 w-5" />
                                    {t('pos.empty.addRestaurant')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SmartLayout>
    )
}

export default POSIntegration