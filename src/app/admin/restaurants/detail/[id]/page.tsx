'use client'

import type { NextPage } from 'next'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SmartLayout from '@/components/common/SmartLayout'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  StarIcon,
  Cog6ToothIcon,
  TrashIcon,
  ArrowRightIcon,
  TableCellsIcon,
  PlusIcon,
  WifiIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import {env} from "@/lib/env"
import { TableManagementModal } from '@/components/super_admin/tables/TableManagementModal'


// TypeScript interfaces
interface RestaurantDetailResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  contact_email: string;
  contact_phone: string;
  website: string | null;
  logo_url: string | null;
  banner_url: string | null;
  stripe_account_id: string | null;
  service_fee_amount: number;
  service_fee_type: string;
  kvk_number: string | null;
  vat_number: string | null;
  is_active: boolean;
  google_place_id: string | null;
  google_review_link: string | null;
  google_sheet_export: string | null;
  fin_header: {
    revenue: number;
    transactions: number;
    avg_amount: number;
    rating: number;
  };
  staff_info: Array<{
    first_name: string;
    last_name: string;
    full_name: string;
    restaurant_role: string;
  }>;
  pos_info: {
    id: number;
    pos_type: string;
    username: string;
    password: string;
    base_url: string;
    is_connected: boolean;
    is_active: boolean;
  } | null;
  tables_info: Array<{
    id: number;
    table_number: number;
    is_active: boolean;
    table_section: string | null;
    table_design: string | null;
    table_link: string | null;
  }>;
}

interface QRTable {
  id: number;
  table_number: number;
  table_section: string;
  table_design: string;
  table_link: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface POSTestResult {
  success: boolean;
  message: string;
}

interface POSConfigResponse {
  pos_type: string;
  username: string;
  password: string;
  base_url: string;
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
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

async function testPOSConnection(restaurantId: number, posData: {
  pos_type: string;
  username: string;
  password: string;
  base_url: string;
}): Promise<POSTestResult> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/pos/test`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(posData)
  })

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return Promise.reject(new Error('Unauthorized'))
  }

  const result = await response.json()

  return {
    success: response.ok && result.status_code === 200,
    message: result.message || 'Connection test completed'
  }
}

async function configurePOSConnection(restaurantId: number, posData: {
  pos_type: string;
  username: string;
  password: string;
  base_url: string;
}): Promise<POSConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/pos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(posData)
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
    throw new Error(errorData.detail || 'Failed to configure POS connection')
  }

  return response.json()
}

async function archiveRestaurant(restaurantId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/archive`, {
    method: 'PATCH',
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to archive restaurant')
  }
}

async function deleteRestaurant(restaurantId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}`, {
    method: 'DELETE',
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to delete restaurant')
  }
}

async function restoreRestaurant(restaurantId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/restore`, {
    method: 'PATCH',
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to restore restaurant')
  }
}

async function getRestaurantTables(restaurantId: number): Promise<QRTable[]> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr/all`, {
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
  if (!response.ok) throw new Error('Failed to fetch tables')
  return response.json()
}

async function createTable(restaurantId: number, tableData: any): Promise<QRTable> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tableData)
  })
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')

    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return Promise.reject(new Error('Unauthorized'))
  }
  if (!response.ok) throw new Error('Failed to create table')
  return response.json()
}

async function deleteTable(restaurantId: number, tableId: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr/${tableId}`, {
    method: 'DELETE',
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
  if (!response.ok) throw new Error('Failed to delete table')
  return true
}

async function toggleTableStatus(restaurantId: number, tableId: number): Promise<QRTable> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr/${tableId}/toggle`, {
    method: 'PATCH',
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
  if (!response.ok) throw new Error('Failed to toggle table status')
  return response.json()
}

// QR Code generator component
const QRCodeDisplay: React.FC<{ url: string; size?: number }> = ({ url, size = 100 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    if (url) {
      QRCode.toDataURL(url, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl).catch(console.error)
    }
  }, [url, size])

  if (!qrCodeUrl) return <div className="bg-gray-200 animate-pulse" style={{ width: size, height: size }} />

  return <img src={qrCodeUrl} alt="QR Code" className="rounded-lg" />
}

// Archive/Delete Confirmation Modal
const ArchiveDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantDetailResponse | null;
  onConfirm: () => void;
  isArchive: boolean;
}> = ({ isOpen, onClose, restaurant, onConfirm, isArchive }) => {
  const { t } = useLanguage()
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen || !restaurant) return null

  const canConfirm = confirmText === restaurant.name

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-full ${isArchive ? 'bg-yellow-100' : 'bg-red-100'}`}>
              {isArchive ? (
                  <ArchiveBoxIcon className="h-6 w-6 text-yellow-600" />
              ) : (
                  <TrashIcon className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isArchive ? t('restaurant.detail.modal.archive.title') : t('restaurant.detail.modal.delete.title')}
              </h3>
              <p className="text-sm text-gray-500">
                {isArchive ? t('restaurant.detail.modal.archive.subtitle') : t('restaurant.detail.modal.delete.subtitle')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              {isArchive
                  ? t('restaurant.detail.modal.archive.description', { name: restaurant.name })
                  : t('restaurant.detail.modal.delete.description', { name: restaurant.name })
              }
            </p>

            {!isArchive && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">
                        {t('restaurant.detail.modal.delete.warning.title')}
                      </h4>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        <li>{t('restaurant.detail.modal.delete.warning.data')}</li>
                        <li>{t('restaurant.detail.modal.delete.warning.tables')}</li>
                        <li>{t('restaurant.detail.modal.delete.warning.staff')}</li>
                        <li>{t('restaurant.detail.modal.delete.warning.transactions')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
            )}

            {!isArchive && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.detail.modal.delete.confirm.label', { name: restaurant.name })}
                  </label>
                  <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={t('restaurant.detail.modal.delete.confirm.placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              {t('common.cancel')}
            </button>
            <button
                onClick={onConfirm}
                disabled={!isArchive && !canConfirm}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    isArchive
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              {isArchive ? t('restaurant.detail.modal.archive.confirm') : t('restaurant.detail.modal.delete.confirm')}
            </button>
          </div>
        </div>
      </div>
  )
}

const RestaurantDetail: NextPage = () => {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  // State for restaurant data
  const [restaurant, setRestaurant] = useState<RestaurantDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Modal states
  const [showArchiveDeleteModal, setShowArchiveDeleteModal] = useState(false)
  const [showPOSModal, setShowPOSModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)

  // POS form data - Updated to match backend schema
  const [posFormData, setPosFormData] = useState({
    pos_type: '',
    username: '',
    password: '',
    base_url: '',
    port: '' // For MPLUS port handling
  })
  const [posTestResult, setPosTestResult] = useState<POSTestResult | null>(null)
  const [posLoading, setPosLoading] = useState(false)

  useEffect(() => {
    document.title = t('restaurant.detail.pageTitle')
  }, [t])

  // Load restaurant data
  useEffect(() => {
    if (id) {
      loadRestaurantData()
    }
  }, [id])

  // Load existing POS configuration when modal opens
  useEffect(() => {
    if (showPOSModal && restaurant?.pos_info) {
      const posInfo = restaurant.pos_info
      setPosFormData({
        pos_type: posInfo.pos_type || '',
        username: posInfo.username || '',
        password: posInfo.password || '',
        base_url: posInfo.base_url || '',
        port: '' // Extract port if it's MPLUS
      })

      // If it's MPLUS, extract port from base_url
      if (posInfo.pos_type === 'mpluskassa' && posInfo.base_url) {
        const match = posInfo.base_url.match(/https:\/\/api\.mpluskassa\.nl:(\d+)/)
        if (match) {
          setPosFormData(prev => ({
            ...prev,
            port: match[1]
          }))
        }
      }
    } else if (showPOSModal) {
      // Reset form for new configuration
      setPosFormData({
        pos_type: '',
        username: '',
        password: '',
        base_url: '',
        port: ''
      })
    }
    setPosTestResult(null)
  }, [showPOSModal, restaurant])

  useEffect(() => {
    // Check URL parameters for Stripe callback
    const urlParams = new URLSearchParams(window.location.search)
    const stripeSuccess = urlParams.get('stripe_success')

    if (stripeSuccess === 'true') {
      // Refresh restaurant data after successful connection
      loadRestaurantData()

      // Clear URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRestaurantDetail(parseInt(id))
      setRestaurant(data)
    } catch (err: any) {
      console.error('Failed to load restaurant:', err)
      setError(err.message || t('restaurant.detail.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showPOSModal || showArchiveDeleteModal || showTableModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPOSModal, showArchiveDeleteModal, showTableModal])

  // Helper function to get the full base_url for API calls
  const getFullBaseUrl = () => {
    if (posFormData.pos_type === 'mpluskassa') {
      return `https://api.mpluskassa.nl:${posFormData.port}`
    }
    return posFormData.base_url
  }

  // Helper function to update POS form data with proper URL handling
  const updatePosFormData = (field: string, value: string) => {
    if (field === 'pos_type') {
      // Reset base_url and port when changing POS type
      setPosFormData(prev => ({
        ...prev,
        pos_type: value,
        base_url: value === 'mpluskassa' ? '' : prev.base_url,
        port: value === 'mpluskassa' ? prev.port : ''
      }))
    } else if (field === 'port' && posFormData.pos_type === 'mpluskassa') {
      setPosFormData(prev => ({
        ...prev,
        port: value,
        base_url: value ? `https://api.mpluskassa.nl:${value}` : ''
      }))
    } else {
      setPosFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleTestPOSConnection = async () => {
    try {
      setPosLoading(true)
      setPosTestResult(null)

      const fullBaseUrl = getFullBaseUrl()

      if (!posFormData.pos_type || !posFormData.username || !posFormData.password || !fullBaseUrl) {
        setPosTestResult({
          success: false,
          message: t('restaurant.detail.pos.modal.validation.allFieldsRequired')
        })
        return
      }

      const testData = {
        pos_type: posFormData.pos_type,
        username: posFormData.username,
        password: posFormData.password,
        base_url: fullBaseUrl
      }

      const result = await testPOSConnection(parseInt(id), testData)
      setPosTestResult(result)
    } catch (err: any) {
      setPosTestResult({
        success: false,
        message: err.message || t('restaurant.detail.pos.modal.errors.testFailed')
      })
    } finally {
      setPosLoading(false)
    }
  }

  const handleConfigurePOS = async () => {
    try {
      setPosLoading(true)

      const fullBaseUrl = getFullBaseUrl()

      if (!posFormData.pos_type || !posFormData.username || !posFormData.password || !fullBaseUrl) {
        setPosTestResult({
          success: false,
          message: t('restaurant.detail.pos.modal.validation.allFieldsRequired')
        })
        return
      }

      const configData = {
        pos_type: posFormData.pos_type,
        username: posFormData.username,
        password: posFormData.password,
        base_url: fullBaseUrl
      }

      await configurePOSConnection(parseInt(id), configData)

      // Refresh restaurant data to show updated POS info
      await loadRestaurantData()

      // Close modal and show success
      setShowPOSModal(false)
      setPosTestResult({
        success: true,
        message: t('restaurant.detail.pos.modal.success.configured')
      })

    } catch (err: any) {
      setPosTestResult({
        success: false,
        message: err.message || t('restaurant.detail.pos.modal.errors.configurationFailed')
      })
    } finally {
      setPosLoading(false)
    }
  }

  const handleStripeConnect = async () => {
    try {
      setActionLoading(true)
      setError(null)

      // Get OAuth URL from backend (используем тот же эндпоинт что и в онбординге)
      const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${id}/onboarding/stripe/oauth-url`, {
        headers: getAuthHeaders()
      })

      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        throw new Error(t('restaurant.detail.errors.stripeOAuthFailed'))
      }

      const data = await response.json()

      if (data.oauth_url) {
        // Redirect to Stripe OAuth
        window.location.href = data.oauth_url
      } else {
        setError(t('restaurant.detail.errors.stripeOAuthUrlFailed'))
      }
    } catch (err: any) {
      setError(err.message || t('restaurant.detail.errors.stripeConnectionFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleArchiveRestore = async () => {
    if (!restaurant) return

    try {
      setActionLoading(true)

      if (restaurant.is_active) {
        // Archive restaurant
        await archiveRestaurant(parseInt(id))
        setRestaurant({...restaurant, is_active: false})
      } else {
        // Restore restaurant
        await restoreRestaurant(parseInt(id))
        setRestaurant({...restaurant, is_active: true})
      }

      setShowArchiveDeleteModal(false)
    } catch (err: any) {
      console.error('Failed to archive/restore restaurant:', err)
      setError(err.message || t('restaurant.detail.errors.statusUpdateFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const handlePermanentDelete = async () => {
    if (!restaurant) return

    try {
      setActionLoading(true)
      await deleteRestaurant(parseInt(id))
      router.push('/admin/restaurants')
    } catch (err: any) {
      console.error('Failed to delete restaurant:', err)
      setError(err.message || t('restaurant.detail.errors.deleteFailed'))
      setActionLoading(false)
    }
  }

  const StripeIcon = () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
      </svg>
  )

  // Quick stats from backend data
  const quickStats = [
    {
      label: t('restaurant.detail.stats.revenue'),
      value: restaurant?.fin_header?.revenue ? `€${restaurant.fin_header.revenue.toFixed(2)}` : '€0',
      icon: BanknotesIcon,
      color: 'from-[#2BE89A] to-[#4FFFB0]',
      trend: null
    },
    {
      label: t('restaurant.detail.stats.transactions'),
      value: restaurant?.fin_header?.transactions || 0,
      icon: ShoppingBagIcon,
      color: 'from-[#4ECDC4] to-[#44A08D]',
      trend: null
    },
    {
      label: t('restaurant.detail.stats.averageAmount'),
      value: restaurant?.fin_header?.avg_amount ? `€${restaurant.fin_header.avg_amount.toFixed(2)}` : '€0',
      icon: CreditCardIcon,
      color: 'from-[#667EEA] to-[#764BA2]',
      trend: null
    },
    {
      label: t('restaurant.detail.stats.rating'),
      value: restaurant?.fin_header?.rating || 0,
      icon: StarIcon,
      color: 'from-[#FF6B6B] to-[#FF8E53]',
      trend: null
    },
  ]

  if (loading) {
    return (
        <SmartLayout>
          <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
            <div className="text-center">
              <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              <h3 className="mt-4 text-base font-medium text-gray-900">{t('restaurant.detail.loading')}</h3>
            </div>
          </div>
        </SmartLayout>
    )
  }

  if (error) {
    return (
        <SmartLayout>
          <div className="min-h-screen bg-[#F9FAFB]">
            <div className="bg-red-50 border-b border-red-200 px-6 py-3">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  {t('common.retry')}
                </button>
              </div>
            </div>
          </div>
        </SmartLayout>
    )
  }

  if (!restaurant) {
    return (
        <SmartLayout>
          <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
            <div className="text-gray-900">{t('restaurant.detail.notFound')}</div>
          </div>
        </SmartLayout>
    )
  }

  return (
      <SmartLayout>
        <div className="min-h-screen bg-[#F9FAFB]">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {/* Back Button */}
              <Link
                  href="/admin/restaurants"
                  className="inline-flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium group bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-100 hover:border-green-300"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t('restaurant.detail.navigation.backToRestaurants')}
              </Link>

              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-[#111827] mb-1">
                    {restaurant.name || t('restaurant.detail.title')}
                  </h1>
                  <p className="text-[#6B7280]">
                    {t('restaurant.detail.subtitle')}
                  </p>
                </div>
                <div className="flex gap-3">
                  {restaurant.is_active ? (
                      // Show Archive button for active restaurants
                      <button
                          onClick={() => setShowArchiveDeleteModal(true)}
                          disabled={actionLoading}
                          className="inline-flex items-center px-4 py-2.5 border border-yellow-300 text-yellow-600 font-medium rounded-lg hover:bg-yellow-50 transition-all disabled:opacity-50"
                      >
                        {actionLoading ? (
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                            <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                        )}
                        {t('restaurant.detail.actions.archive')}
                      </button>
                  ) : (
                      // Show Restore and Delete buttons for archived restaurants
                      <>
                        <button
                            onClick={handleArchiveRestore}
                            disabled={actionLoading}
                            className="inline-flex items-center px-4 py-2.5 border border-green-300 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-all disabled:opacity-50"
                        >
                          {actionLoading ? (
                              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                          ) : (
                              <ArrowPathIcon className="h-5 w-5 mr-2" />
                          )}
                          {t('restaurant.detail.actions.restore')}
                        </button>
                        <button
                            onClick={() => setShowArchiveDeleteModal(true)}
                            disabled={actionLoading}
                            className="inline-flex items-center px-4 py-2.5 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5 mr-2" />
                          {t('restaurant.detail.actions.deletePermanently')}
                        </button>
                      </>
                  )}

                  <Link
                      href={`/admin/restaurants/edit/${id}`}
                      className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    {t('restaurant.detail.actions.edit')}
                  </Link>
                </div>
              </div>

              {/* Archived Banner */}
              {!restaurant.is_active && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ArchiveBoxIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          {t('restaurant.detail.archived.title')}
                        </h4>
                        <p className="text-sm text-yellow-700">
                          {t('restaurant.detail.archived.description')}
                        </p>
                      </div>
                    </div>
                  </div>
              )}

              {/* Restaurant Profile Card */}
              <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Banner */}
                <div className="relative h-32 md:h-40 bg-gradient-to-r from-green-400 to-green-500">
                  {restaurant.banner_url && (
                      <img
                          src={restaurant.banner_url}
                          alt={t('restaurant.detail.profile.bannerAlt', { name: restaurant.name })}
                          className="w-full h-full object-cover opacity-90"
                      />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      restaurant.is_active
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                    {restaurant.is_active ? t('common.active') : t('common.archived')}
                  </span>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="relative px-4 lg:px-6 pb-4">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16">
                    <div className="flex items-end space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-xl overflow-hidden border-4 border-white shadow-xl relative bg-white">
                          {restaurant.logo_url ? (
                              <img
                                  src={restaurant.logo_url}
                                  alt={t('restaurant.detail.profile.logoAlt', { name: restaurant.name })}
                                  className="h-full w-full object-cover"
                              />
                          ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-500 text-white font-bold text-2xl">
                                {restaurant.name.charAt(0)}
                              </div>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <h1 className="text-2xl font-bold text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)'}}>
                          {restaurant.name}
                        </h1>
                        <div className="flex items-center mt-1 text-sm text-[#6B7280]">
                          <MapPinIcon className="h-4 w-4 mr-1.5" />
                          {restaurant.city}, {restaurant.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3 lg:mt-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 border border-gray-200">
                      <BuildingStorefrontIcon className="h-3.5 w-3.5 mr-1 text-gray-600" />
                      <span className="text-gray-900">{t('restaurant.detail.profile.tablesCount', { count: restaurant.tables_info?.length || 0 })}</span>
                    </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                    {quickStats.map((stat, index) => (
                        <div key={index} className="rounded-lg p-4 bg-gray-50 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${stat.color}`}>
                              {stat.icon && React.createElement(stat.icon, { className: "h-4 w-4 text-white" })}
                            </div>
                            {stat.trend && (
                                <span className="text-xs text-green-500 flex items-center">
                            <ArrowTrendingUpIcon className="h-2.5 w-2.5 mr-0.5" />
                                  {stat.trend}
                          </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280]">{stat.label}</p>
                          <p className="text-lg font-bold mt-0.5 text-[#111827]">{stat.value}</p>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="space-y-8">
                {/* Setup Essentials Section */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#111827] mb-2">{t('restaurant.detail.sections.setupEssentials.title')}</h2>
                    <p className="text-[#6B7280]">{t('restaurant.detail.sections.setupEssentials.description')}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Contact Information */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <MapPinIcon className="h-5 w-5 mr-2 text-green-500" />
                          {t('restaurant.detail.sections.contactInfo.title')}
                        </h3>
                        <Link
                            href={`/admin/restaurants/edit/${id}`}
                            className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1 text-[#9CA3AF]">{t('restaurant.detail.sections.contactInfo.address')}</p>
                          <p className="text-sm leading-snug text-[#111827]">
                            {restaurant.address}<br />
                            {restaurant.postal_code} {restaurant.city}
                          </p>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-[#9CA3AF]">{t('restaurant.detail.sections.contactInfo.email')}</p>
                            <a href={`mailto:${restaurant.contact_email}`} className="text-sm transition text-[#111827] hover:text-green-600">
                              {restaurant.contact_email}
                            </a>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-[#9CA3AF]">{t('restaurant.detail.sections.contactInfo.phone')}</p>
                            <a href={`tel:${restaurant.contact_phone}`} className="text-sm transition text-[#111827] hover:text-green-600">
                              {restaurant.contact_phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Restaurant Staff */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <UserGroupIcon className="h-5 w-5 mr-2 text-green-500" />
                          {t('restaurant.detail.sections.staff.title')}
                          {restaurant.staff_info && restaurant.staff_info.length > 0 && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">{restaurant.staff_info.length}</span>
                          )}
                        </h3>
                      </div>

                      {(!restaurant.staff_info || restaurant.staff_info.length === 0) ? (
                          <div className="text-center py-6">
                            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-gray-100">
                              <UserIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <p className="text-sm mb-3 text-[#6B7280]">{t('restaurant.detail.sections.staff.empty')}</p>
                            <Link
                                href={`/restaurants/${id}/users`}
                                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                              <PlusIcon className="h-4 w-4 mr-1" />
                              {t('restaurant.detail.sections.staff.addStaff')}
                            </Link>
                          </div>
                      ) : (
                          <div className="space-y-3">
                            {restaurant.staff_info.slice(0, restaurant.staff_info.length >= 3 ? 1 : 2).map((member, index) => (
                                <div key={index} className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-xs font-semibold">
                                      {member.first_name?.[0] || ''}{member.last_name?.[0] || ''}
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-[#111827]">{member.full_name || t('restaurant.detail.sections.staff.unknownUser')}</p>
                                      <p className="text-xs text-[#6B7280]">{member.restaurant_role || t('restaurant.detail.sections.staff.defaultRole')}</p>
                                    </div>
                                  </div>
                                </div>
                            ))}
                            {restaurant.staff_info.length >= 3 && (
                                <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                                  <p className="text-sm text-center text-[#6B7280]">
                                    {t('restaurant.detail.sections.staff.moreMembers', { count: restaurant.staff_info.length - 1 })}
                                  </p>
                                </div>
                            )}
                            <Link
                                href={`/admin/restaurants/detail/${id}/team`}
                                className="block w-full text-center py-2.5 text-sm font-medium rounded-lg transition bg-gray-50 border border-gray-200 text-green-600 hover:text-green-700 hover:bg-gray-100">
                              {t('restaurant.detail.sections.staff.manage')}
                            </Link>
                          </div>
                      )}
                    </div>

                    {/* Payment Settings (Stripe) */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <CreditCardIcon className="h-5 w-5 mr-2 text-green-500" />
                          {t('restaurant.detail.sections.payment.title')}
                        </h3>
                        {restaurant.stripe_account_id && (
                            <Link
                                href={`/restaurants/${id}/stripe-transactions`}
                                className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </Link>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                          <p className="text-xs mb-1 text-[#9CA3AF]">{t('restaurant.detail.sections.payment.serviceFee')}</p>
                          <p className="text-lg font-bold text-[#111827]">
                            {restaurant.service_fee_type === 'flat' ? '€' : ''}
                            {restaurant.service_fee_amount}
                            {restaurant.service_fee_type === 'percentage' ? '%' : ''}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {restaurant.service_fee_type === 'flat'
                                ? t('restaurant.detail.sections.payment.perOrder')
                                : t('restaurant.detail.sections.payment.percentage')
                            }
                          </p>
                        </div>

                        {restaurant.stripe_account_id ? (
                            <div className="flex items-center justify-between rounded-lg p-3 bg-gray-50 border border-gray-200">
                              <div className="flex items-center">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg mr-2">
                                  <StripeIcon />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#111827]">{t('restaurant.detail.sections.payment.stripeConnected')}</p>
                                  <p className="text-xs text-[#6B7280]">{t('restaurant.detail.sections.payment.activeAccount')}</p>
                                </div>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">
                            {t('common.active')}
                          </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleStripeConnect}
                                disabled={actionLoading}
                                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 flex items-center justify-center text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading ? (
                                  <>
                                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                    <span>{t('restaurant.detail.sections.payment.connecting')}</span>
                                  </>
                              ) : (
                                  <>
                                    <span>{t('restaurant.detail.sections.payment.startStripeOnboarding')}</span>
                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                  </>
                              )}
                            </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* POS Integration */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <WifiIcon className="h-5 w-5 mr-2 text-green-500" />
                          {t('restaurant.detail.sections.pos.title')}
                        </h3>
                        <button
                            onClick={() => setShowPOSModal(true)}
                            className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                          <Cog6ToothIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {!restaurant.pos_info ? (
                          <div className="text-center py-6">
                            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-gray-100">
                              <WifiIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <p className="text-sm mb-3 text-[#6B7280]">{t('restaurant.detail.sections.pos.notConnected')}</p>
                            <button
                                onClick={() => setShowPOSModal(true)}
                                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                              <PlusIcon className="h-4 w-4 mr-1" />
                              {t('restaurant.detail.sections.pos.configure')}
                            </button>
                          </div>
                      ) : (
                          <div className="space-y-3">
                            <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-[#111827]">{t('restaurant.detail.sections.pos.connectedSystem')}</p>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    restaurant.pos_info.is_connected
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                }`}>
                              {restaurant.pos_info.is_connected ? t('restaurant.detail.sections.pos.connected') : t('restaurant.detail.sections.pos.disconnected')}
                            </span>
                              </div>
                              <p className="text-sm text-[#6B7280] capitalize">{restaurant.pos_info.pos_type}</p>
                            </div>
                          </div>
                      )}
                    </div>

                    {/* Tables Configuration - Enhanced */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <QrCodeIcon className="h-5 w-5 mr-2 text-green-500" />
                          {t('restaurant.detail.sections.tables.title')}
                        </h3>
                        <button
                            onClick={() => setShowTableModal(true)}
                            className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {(!restaurant.tables_info || restaurant.tables_info.length === 0) ? (
                          <div className="text-center py-6">
                            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-gray-100">
                              <TableCellsIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <p className="text-sm mb-3 text-[#6B7280]">{t('restaurant.detail.sections.tables.notConfigured')}</p>
                            <button
                                onClick={() => setShowTableModal(true)}
                                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                              <PlusIcon className="h-4 w-4 mr-1" />
                              {t('restaurant.detail.sections.tables.setup')}
                            </button>
                          </div>
                      ) : (
                          <div className="space-y-3">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                                <p className="text-xs text-[#9CA3AF] mb-1">{t('restaurant.detail.sections.tables.totalTables')}</p>
                                <p className="text-lg font-bold text-[#111827]">{restaurant.tables_info.length}</p>
                              </div>
                              <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                                <p className="text-xs text-[#9CA3AF] mb-1">{t('common.active')}</p>
                                <p className="text-lg font-bold text-[#111827]">
                                  {restaurant.tables_info.filter(table => table.is_active).length}
                                </p>
                              </div>
                            </div>

                            {/* Preview Tables with QR Codes */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-[#111827] mb-2">{t('restaurant.detail.sections.tables.preview')}</p>
                              {restaurant.tables_info.slice(0, 2).map((table) => (
                                  <div key={table.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                      {/* Mini QR Code */}
                                      <div className="w-8 h-8">
                                        <QRCodeDisplay url={table.table_link || ''} size={32} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-[#111827]">{t('restaurant.tables.card.tableNumber', { number: table.table_number })}</p>
                                        <p className="text-xs text-[#6B7280]">{table.table_section || t('restaurant.tables.noSection')}</p>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        table.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {table.is_active ? t('common.active') : t('common.inactive')}
                                    </span>
                                  </div>
                              ))}
                              {restaurant.tables_info.length > 2 && (
                                  <div className="text-center text-xs text-[#6B7280] py-1">
                                    {t('restaurant.detail.sections.tables.moreTables', { count: restaurant.tables_info.length - 2 })}
                                  </div>
                              )}
                            </div>

                            <button
                                onClick={() => setShowTableModal(true)}
                                className="block w-full text-center py-2.5 text-sm font-medium rounded-lg transition bg-gray-50 border border-gray-200 text-green-600 hover:text-green-700 hover:bg-gray-100">
                              {t('restaurant.detail.sections.tables.manageAll')}
                            </button>
                          </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations & Analytics Section */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#111827] mb-2">{t('restaurant.detail.sections.operations.title')}</h2>
                    <p className="text-[#6B7280]">{t('restaurant.detail.sections.operations.description')}</p>
                  </div>

                  {/* Active Tables - Full Width */}
                  <div className="rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold flex items-center text-[#111827]">
                        <TableCellsIcon className="h-6 w-6 mr-3 text-green-500" />
                        {t('restaurant.detail.sections.operations.activeTables')}
                      </h3>
                      <button
                          onClick={() => setShowTableModal(true)}
                          className="inline-flex items-center text-sm font-medium transition text-green-600 hover:text-green-700">
                        <span>{t('common.viewAll')}</span>
                        <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                      </button>
                    </div>

                    {/* Empty state for active tables */}
                    <div className="text-center py-16 rounded-xl bg-gray-50">
                      <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-white border border-gray-200">
                        <TableCellsIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-medium mb-2 text-[#111827]">{t('restaurant.detail.sections.operations.noActiveTables')}</h4>
                      <p className="text-[#6B7280]">{t('restaurant.detail.sections.operations.activeTablesDescription')}</p>
                    </div>
                  </div>

                  {/* Transaction Analytics - Full Width */}
                  <div className="rounded-xl p-6 mt-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold flex items-center text-[#111827]">
                        <ChartBarIcon className="h-6 w-6 mr-3 text-green-500" />
                        {t('restaurant.detail.sections.operations.transactionAnalytics')}
                      </h3>
                      <Link
                          href={`/restaurants/${id}/transactions`}
                          className="inline-flex items-center text-sm font-medium transition text-green-600 hover:text-green-700">
                        <span>{t('common.viewAll')}</span>
                        <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4" />
                      </Link>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#6B7280]">{t('restaurant.detail.sections.operations.thisMonth')}</p>
                          <div className="p-2 bg-gradient-to-r from-green-400 to-green-500 rounded-lg">
                            <ShoppingBagIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#111827]">
                          {restaurant.fin_header?.transactions || 0}
                        </p>
                        <p className="text-xs mt-1 text-[#6B7280]">
                          {new Date().toLocaleDateString('en-US', { month: 'long' })}
                        </p>
                      </div>
                      <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#6B7280]">{t('restaurant.detail.stats.revenue')}</p>
                          <div className="p-2 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] rounded-lg">
                            <BanknotesIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#111827]">
                          €{restaurant.fin_header?.revenue?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs mt-1 text-[#6B7280]">{t('restaurant.detail.sections.operations.totalRevenue')}</p>
                      </div>
                      <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#6B7280]">{t('restaurant.detail.sections.operations.average')}</p>
                          <div className="p-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-lg">
                            <CreditCardIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#111827]">
                          €{restaurant.fin_header?.avg_amount?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs mt-1 text-[#6B7280]">{t('restaurant.detail.sections.operations.perTransaction')}</p>
                      </div>
                    </div>

                    {/* Empty state for recent transactions */}
                    <div className="text-center py-16 rounded-xl bg-gray-50">
                      <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-white border border-gray-200">
                        <ChartBarIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-medium mb-2 text-[#111827]">{t('restaurant.detail.sections.operations.noRecentTransactions')}</h4>
                      <p className="text-[#6B7280]">{t('restaurant.detail.sections.operations.transactionsDescription')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Management Modal */}
        <TableManagementModal
            isOpen={showTableModal}
            onClose={() => setShowTableModal(false)}
            restaurantId={parseInt(id)}
            restaurantName={restaurant.name}
            googleSheetUrl={restaurant.google_sheet_export}
        />

        {/* Archive/Delete Confirmation Modal */}
        <ArchiveDeleteModal
            isOpen={showArchiveDeleteModal}
            onClose={() => setShowArchiveDeleteModal(false)}
            restaurant={restaurant}
            onConfirm={restaurant.is_active ? handleArchiveRestore : handlePermanentDelete}
            isArchive={restaurant.is_active}
        />

        {/* POS Integration Modal - Enhanced with working logic */}
        {showPOSModal && (
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                onClick={() => setShowPOSModal(false)}
            >
              <div
                  className="bg-white rounded-xl max-w-3xl w-full p-8 border border-gray-200 max-h-[90vh] overflow-y-auto mx-4"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('restaurant.detail.pos.modal.title')}</h3>
                    <p className="text-gray-600">{t('restaurant.detail.pos.modal.subtitle', { name: restaurant?.name })}</p>
                  </div>
                  <button
                      onClick={() => setShowPOSModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* POS System */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      {t('restaurant.detail.pos.modal.fields.posSystem')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={posFormData.pos_type}
                        onChange={(e) => updatePosFormData('pos_type', e.target.value)}
                        required
                    >
                      <option value="">{t('restaurant.detail.pos.modal.placeholders.selectPosSystem')}</option>
                      <option value="untill">Untill</option>
                      <option value="lightspeed">Lightspeed</option>
                      <option value="mpluskassa">M+ Kassa</option>
                      <option value="other">{t('restaurant.detail.pos.modal.options.other')}</option>
                    </select>
                  </div>

                  {/* Username and Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        {t('restaurant.detail.pos.modal.fields.username')} <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={t('restaurant.detail.pos.modal.placeholders.username')}
                          value={posFormData.username}
                          onChange={(e) => updatePosFormData('username', e.target.value)}
                          required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        {t('restaurant.detail.pos.modal.fields.password')} <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="password"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={t('restaurant.detail.pos.modal.placeholders.password')}
                          value={posFormData.password}
                          onChange={(e) => updatePosFormData('password', e.target.value)}
                          required
                      />
                    </div>
                  </div>

                  {/* API URL - Dynamic based on POS type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      {posFormData.pos_type === 'mpluskassa'
                          ? t('restaurant.detail.pos.modal.fields.port')
                          : t('restaurant.detail.pos.modal.fields.apiUrl')
                      } <span className="text-red-500">*</span>
                    </label>

                    {posFormData.pos_type === 'mpluskassa' ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">https://api.mpluskassa.nl:</span>
                          </div>
                          <input
                              type="text"
                              placeholder="34562"
                              className="w-full pl-48 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              value={posFormData.port}
                              onChange={(e) => updatePosFormData('port', e.target.value)}
                              required
                          />
                        </div>
                    ) : (
                        <input
                            type="text"
                            placeholder="https://api.example.com"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={posFormData.base_url}
                            onChange={(e) => updatePosFormData('base_url', e.target.value)}
                            required
                        />
                    )}

                    {posFormData.pos_type === 'mpluskassa' && posFormData.port && (
                        <p className="mt-2 text-sm text-gray-600">
                          Full URL: https://api.mpluskassa.nl:{posFormData.port}
                        </p>
                    )}
                  </div>

                  {/* Test Result Display */}
                  {posTestResult && (
                      <div className={`p-4 rounded-lg border ${
                          posTestResult.success
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                      }`}>
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
                      </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {/* Test Connection Button */}
                    <button
                        onClick={handleTestPOSConnection}
                        disabled={posLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {posLoading ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin inline" />
                            {t('restaurant.detail.pos.modal.actions.testing')}
                          </>
                      ) : (
                          t('restaurant.detail.pos.modal.actions.testConnection')
                      )}
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={handleConfigurePOS}
                        disabled={posLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {posLoading ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin inline" />
                            {t('restaurant.detail.pos.modal.actions.saving')}
                          </>
                      ) : (
                          t('restaurant.detail.pos.modal.actions.save')
                      )}
                    </button>
                  </div>

                  {/* Information Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <WifiIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">
                          {t('restaurant.detail.pos.modal.info.title')}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {t('restaurant.detail.pos.modal.info.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </SmartLayout>
  )
}

export default RestaurantDetail