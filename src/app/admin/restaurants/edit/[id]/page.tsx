'use client'

import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import {useParams, useRouter} from 'next/navigation'
import Link from 'next/link'
import SmartLayout from '@/components/common/SmartLayout'
import Breadcrumb from '@/components/super_admin/Breadcrumb'
import { useLanguage } from '@/contexts/LanguageContext'
import { env } from "@/lib/env"
import {
    ArrowLeftIcon,
    BuildingStorefrontIcon,
    MapPinIcon,
    EnvelopeIcon,
    PhoneIcon,
    PhotoIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

// TypeScript interfaces
interface RestaurantUpdateRequest {
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    contact_email: string
    contact_phone?: string
    website?: string
}

interface RestaurantDetailResponse {
    id: number
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    contact_email: string
    contact_phone: string | null
    website: string | null
    logo_url: string | null
    banner_url: string | null
    is_active: boolean
}

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

function getMultipartAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Authorization': `Bearer ${token}`
    }
}

const API_BASE_URL = `http://${env.apiUrl}/${env.apiVersion}`

// API functions
async function getRestaurantDetail(restaurantId: number): Promise<RestaurantDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/detail/${restaurantId}`, {
        headers: getAuthHeaders()
    })

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) throw new Error('Failed to fetch restaurant detail')
    return response.json()
}

async function updateRestaurant(restaurantId: number, data: RestaurantUpdateRequest): Promise<RestaurantDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to update restaurant')
    }

    return response.json()
}

async function updateRestaurantLogo(restaurantId: number, logoFile: File): Promise<void> {
    const formData = new FormData()
    formData.append('logo', logoFile)

    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/logo`, {
        method: 'PUT',
        headers: getMultipartAuthHeaders(),
        body: formData
    })

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to update logo')
    }
}

async function updateRestaurantBanner(restaurantId: number, bannerFile: File): Promise<void> {
    const formData = new FormData()
    formData.append('banner', bannerFile)

    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/banner`, {
        method: 'PUT',
        headers: getMultipartAuthHeaders(),
        body: formData
    })

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to update banner')
    }
}

const EditRestaurant: NextPage = () => {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string

    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [restaurant, setRestaurant] = useState<RestaurantDetailResponse | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        postal_code: '',
        city: '',
        country: 'Netherlands',
        website: '',
        logo: null as File | null,
        logoPreview: null as string | null,
        banner: null as File | null,
        bannerPreview: null as string | null,
    })

    // Load restaurant data
    useEffect(() => {
        if (id) {
            loadRestaurantData()
        }
    }, [id])

    const loadRestaurantData = async () => {
        try {
            setInitialLoading(true)
            const restaurantData = await getRestaurantDetail(parseInt(id as string))
            setRestaurant(restaurantData)

            setFormData({
                name: restaurantData.name || '',
                contact_email: restaurantData.contact_email || '',
                contact_phone: restaurantData.contact_phone || '',
                address: restaurantData.address || '',
                postal_code: restaurantData.postal_code || '',
                city: restaurantData.city || '',
                country: restaurantData.country || 'Netherlands',
                website: restaurantData.website || '',
                logo: null,
                logoPreview: restaurantData.logo_url,
                banner: null,
                bannerPreview: restaurantData.banner_url,
            })
        } catch (error: any) {
            console.error('Error loading restaurant:', error)
            setErrors({ general: error.message || 'Failed to load restaurant data' })
        } finally {
            setInitialLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    logo: file,
                    logoPreview: reader.result as string
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    banner: file,
                    bannerPreview: reader.result as string
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = t('restaurants.edit.validation.nameRequired')
        if (!formData.contact_email.trim()) newErrors.contact_email = t('restaurants.edit.validation.emailRequired')
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
            newErrors.contact_email = t('restaurants.edit.validation.invalidEmail')
        }

        // Обновленная валидация телефона
        if (!formData.contact_phone?.trim()) {
            newErrors.contact_phone = t('restaurants.edit.validation.phoneRequired')
        } else {
            // Валидация только цифр, пробелов, + и - (для международных номеров)
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/
            if (!phoneRegex.test(formData.contact_phone)) {
                newErrors.contact_phone = t('restaurants.edit.validation.invalidPhone')
            }
            // Проверка минимальной длины (без пробелов и символов)
            const digitsOnly = formData.contact_phone.replace(/[\s\-\(\)\+]/g, '')
            if (digitsOnly.length < 10) {
                newErrors.contact_phone = t('restaurants.edit.validation.phoneMinLength')
            }
        }

        if (!formData.address.trim()) newErrors.address = t('restaurants.edit.validation.streetRequired')
        if (!formData.postal_code.trim()) newErrors.postal_code = t('restaurants.edit.validation.postalCodeRequired')
        if (!formData.city.trim()) newErrors.city = t('restaurants.edit.validation.cityRequired')

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            // Update basic restaurant info
            const updateData: RestaurantUpdateRequest = {
                name: formData.name,
                contact_email: formData.contact_email,
                contact_phone: formData.contact_phone || undefined,
                address: formData.address,
                postal_code: formData.postal_code,
                city: formData.city,
                country: formData.country,
                website: formData.website || undefined,
            }

            await updateRestaurant(parseInt(id as string), updateData)

            // Update logo if changed
            if (formData.logo) {
                await updateRestaurantLogo(parseInt(id as string), formData.logo)
            }

            // Update banner if changed
            if (formData.banner) {
                await updateRestaurantBanner(parseInt(id as string), formData.banner)
            }

            router.push(`/admin/restaurants/detail/${id}`)
        } catch (error: any) {
            console.error('Error updating restaurant:', error)
            setErrors({ general: error.message || 'Failed to update restaurant' })
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <SmartLayout>
                <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-[#111827]">Loading restaurant details...</p>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    if (!restaurant) {
        return (
            <SmartLayout>
                <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                    <p className="text-[#111827]">Restaurant not found</p>
                </div>
            </SmartLayout>
        )
    }

    return (
        <SmartLayout>
            <div className="min-h-screen bg-[#F9FAFB]">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Breadcrumb */}
                        <Breadcrumb items={[
                            { label: 'Restaurants', href: '/admin/restaurants' },
                            { label: restaurant.name || 'Restaurant', href: `/admin/restaurants/detail/${id}` },
                            { label: t('restaurants.actions.edit') }
                        ]} />

                        {/* Back Button */}
                        <Link
                            href={`/admin/restaurants/detail/${id}`}
                            className="inline-flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium mb-4 group bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-100 hover:border-green-300"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            {t('restaurants.backToProfile')}
                        </Link>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-[#111827] mb-1">
                                {t('restaurants.edit.title')}
                            </h1>
                            <p className="text-[#6B7280]">{t('restaurants.edit.subtitle')}</p>
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex">
                                    <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                                    <p className="text-sm text-red-700">{errors.general}</p>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="rounded-xl p-6 bg-white shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center text-[#111827]">
                                    <BuildingStorefrontIcon className="h-6 w-6 mr-2 text-green-500" />
                                    {t('restaurants.edit.basicInfo')}
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('restaurants.edit.restaurantName')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border ${errors.name ? 'border-red-500' : 'border-gray-200'} text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300`}
                                            placeholder={t('restaurants.edit.namePlaceholder')}
                                        />
                                        {errors.name && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('restaurants.edit.website')}
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            id="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300"
                                            placeholder="https://www.example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="logo" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('restaurants.edit.restaurantLogo')}
                                        </label>
                                        <div className="flex items-center space-x-6">
                                            {formData.logoPreview && (
                                                <div className="h-20 w-20 rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img
                                                        src={formData.logoPreview}
                                                        alt="Logo preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <label className="cursor-pointer">
                                                    <div className="px-4 py-2.5 rounded-lg transition inline-flex items-center bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                                                        <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
                                                        {formData.logoPreview ? t('restaurants.edit.changeLogo') : t('restaurants.edit.uploadLogo')}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs mt-2 text-gray-500">{t('restaurants.edit.imageRequirements')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="banner" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('restaurants.edit.restaurantBanner')}
                                        </label>
                                        <div className="space-y-4">
                                            {formData.bannerPreview && (
                                                <div className="w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img
                                                        src={formData.bannerPreview}
                                                        alt="Banner preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <label className="cursor-pointer">
                                                <div className="px-4 py-2.5 rounded-lg transition inline-flex items-center bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                                                    <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
                                                    {formData.bannerPreview ? t('restaurants.edit.changeBanner') : t('restaurants.edit.uploadBanner')}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleBannerChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500">{t('restaurants.edit.bannerRequirements')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="rounded-xl p-6 bg-white shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center text-[#111827]">
                                    <EnvelopeIcon className="h-6 w-6 mr-2 text-green-500" />
                                    {t('restaurants.edit.contactInfo')}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="contact_email" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('common.email')} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="contact_email"
                                                id="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border ${errors.contact_email ? 'border-red-500' : 'border-gray-200'} text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300`}
                                                placeholder={t('restaurants.edit.emailPlaceholder')}
                                            />
                                        </div>
                                        {errors.contact_email && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                                {errors.contact_email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="contact_phone" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('common.phone')} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <PhoneIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="contact_phone"
                                                id="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border ${errors.contact_phone ? 'border-red-500' : 'border-gray-200'} text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300`}
                                                placeholder="+31 20 123 4567"
                                            />
                                        </div>
                                        {errors.contact_phone && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                                {errors.contact_phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="rounded-xl p-6 bg-white shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center text-[#111827]">
                                    <MapPinIcon className="h-6 w-6 mr-2 text-green-500" />
                                    {t('restaurants.edit.addressInfo')}
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('restaurants.edit.streetAndNumber')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            id="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border ${errors.address ? 'border-red-500' : 'border-gray-200'} text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300`}
                                            placeholder="Herengracht 182"
                                        />
                                        {errors.address && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="postal_code" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                                {t('restaurants.edit.postalCode')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="postal_code"
                                                id="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border ${errors.postal_code ? 'border-red-500' : 'border-gray-200'} text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300`}
                                                placeholder="1016 BR"
                                            />
                                            {errors.postal_code && (
                                                <p className="mt-2 text-sm text-red-500 flex items-center">
                                                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                                    {errors.postal_code}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                                {t('restaurants.edit.city')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                id="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border ${errors.city ? 'border-red-500' : 'border-gray-200'} text-gray-900 placeholder-gray-500 focus:ring-green-500 hover:border-gray-300`}
                                                placeholder="Amsterdam"
                                            />
                                            {errors.city && (
                                                <p className="mt-2 text-sm text-red-500 flex items-center">
                                                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                                    {errors.city}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium mb-2 text-[#6B7280]">
                                            {t('restaurants.edit.country')}
                                        </label>
                                        <select
                                            name="country"
                                            id="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition bg-white border border-gray-200 text-gray-900 focus:ring-green-500 hover:border-gray-300"
                                        >
                                            <option value="Netherlands">{t('restaurants.edit.countries.netherlands')}</option>
                                            <option value="Belgium">{t('restaurants.edit.countries.belgium')}</option>
                                            <option value="Germany">{t('restaurants.edit.countries.germany')}</option>
                                            <option value="France">{t('restaurants.edit.countries.france')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4">
                                <Link
                                    href={`/admin/restaurants/detail/${id}`}
                                    className="px-4 py-2.5 font-medium rounded-lg transition-all bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm disabled:opacity-50"
                                >
                                    {loading ? t('restaurants.edit.saving') : t('restaurants.edit.saveChanges')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SmartLayout>
    )
}

export default EditRestaurant