'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import SmartLayout from '@/components/common/SmartLayout'
import Breadcrumb from '@/components/super_admin/Breadcrumb'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getRestaurants,
  getRestaurantStats,
  deleteRestaurant,
  restoreRestaurant,
  type RestaurantListItem,
  type RestaurantStats
} from '@/lib/super_admin'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ChartBarIcon,
  StarIcon,
  TrashIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

const StripeIcon = () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
)

const Restaurants: NextPage = () => {
  // State для данных
  const [allRestaurants, setAllRestaurants] = useState<RestaurantListItem[]>([])
  const [stats, setStats] = useState<RestaurantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State для фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // State для модального окна удаления
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [restaurantToDelete, setRestaurantToDelete] = useState<RestaurantListItem | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const { t } = useLanguage()

  // Дебаунсинг для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Первоначальная загрузка данных
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [restaurantsData, statsData] = await Promise.all([
        getRestaurants({ limit: 100 }),
        getRestaurantStats()
      ])

      setAllRestaurants(restaurantsData)
      setStats(statsData)
    } catch (err: any) {
      console.error('Error loading initial data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Поиск с сервера (только когда есть поисковый запрос)
  const searchRestaurants = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return

    try {
      setSearching(true)
      const searchResults = await getRestaurants({
        search: searchTerm,
        limit: 100
      })
      setAllRestaurants(searchResults)
    } catch (err: any) {
      console.error('Error searching restaurants:', err)
    } finally {
      setSearching(false)
    }
  }, [])

  // Загрузка при монтировании
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Поиск при изменении запроса
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchRestaurants(debouncedSearch)
    } else if (debouncedSearch === '' && searchQuery === '') {
      // Если очистили поиск, загружаем все данные заново
      loadInitialData()
    }
  }, [debouncedSearch, searchRestaurants, loadInitialData, searchQuery])

  // Правильная фильтрация: All = все кроме deleted, Onboarding = только onboarding, Archived = только deleted
  const filteredRestaurants = allRestaurants.filter((restaurant) => {
    // Фильтр по статусу
    let matchesStatus = false
    if (statusFilter === 'all') {
      matchesStatus = restaurant.status !== 'deleted' // Все кроме удаленных
    } else if (statusFilter === 'deleted') {
      matchesStatus = restaurant.status === 'deleted' // Только удаленные
    } else {
      matchesStatus = restaurant.status === statusFilter // Конкретный статус
    }

    // Фильтр по локации
    const matchesLocation = selectedFilter === 'all' ||
        restaurant.city.toLowerCase().includes(selectedFilter.toLowerCase())

    return matchesStatus && matchesLocation
  })

  // Счетчики для всех табов (независимо от активного)
  const allActiveRestaurants = allRestaurants.filter(r => r.status !== 'deleted') // Все кроме deleted
  const onboardingRestaurants = allRestaurants.filter(r => r.status === 'onboarding')
  const deletedRestaurants = allRestaurants.filter(r => r.status === 'deleted')

  // Обработчики действий
  const handleDeleteClick = (restaurant: RestaurantListItem) => {
    setRestaurantToDelete(restaurant)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (restaurantToDelete) {
      try {
        await deleteRestaurant(restaurantToDelete.id)
        setDeleteModalOpen(false)
        setRestaurantToDelete(null)
        setDeleteConfirmText('')
        // Обновляем локальные данные
        setAllRestaurants(prev => prev.filter(r => r.id !== restaurantToDelete.id))
      } catch (err: any) {
        console.error('Error deleting restaurant:', err)
        setError(err.message || 'Failed to delete restaurant')
      }
    }
  }

  const handleRestore = async (restaurantId: number) => {
    try {
      await restoreRestaurant(restaurantId)
      // Обновляем статус локально
      setAllRestaurants(prev =>
          prev.map(r => r.id === restaurantId ? { ...r, status: 'active' as const, is_active: true } : r)
      )
    } catch (err: any) {
      console.error('Error restoring restaurant:', err)
      setError(err.message || 'Failed to restore restaurant')
    }
  }

  const DeleteConfirmationModal = () => {
    if (!deleteModalOpen || !restaurantToDelete) return null

    const canDelete = deleteConfirmText === restaurantToDelete.name

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                onClick={() => setDeleteModalOpen(false)}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full bg-white">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {t('restaurants.deleteModal.title')}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {t('restaurants.deleteModal.warning')} <span className="font-semibold">{restaurantToDelete.name}</span>.
                      </p>
                      <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm font-semibold text-red-800">
                          {t('restaurants.deleteModal.cautionTitle')}
                        </p>
                        <p className="text-sm mt-2 text-red-700">
                          {t('restaurants.deleteModal.cautionText')}
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('restaurants.deleteModal.confirmLabel')} <span className="font-semibold">{restaurantToDelete.name}</span>
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={t('restaurants.deleteModal.confirmPlaceholder')}
                            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-50">
                <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={!canDelete}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all ${
                        canDelete
                            ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed opacity-50'
                    }`}
                >
                  {t('restaurants.deleteModal.confirmButton')}
                </button>
                <button
                    type="button"
                    onClick={() => {
                      setDeleteModalOpen(false)
                      setDeleteConfirmText('')
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  {t('restaurants.deleteModal.cancelButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
    )
  }

  if (loading) {
    return (
        <SmartLayout>
          <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
            <div className="text-center">
              <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              <h3 className="mt-4 text-base font-medium text-gray-900">Loading restaurants...</h3>
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
              <h3 className="mt-4 text-base font-medium text-gray-900">Error loading restaurants</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <button
                  onClick={loadInitialData}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all"
              >
                <ArrowPathIcon className="mr-2 h-5 w-5" />
                Retry
              </button>
            </div>
          </div>
        </SmartLayout>
    )
  }

  return (
      <SmartLayout>
        <DeleteConfirmationModal />
        <div className="min-h-screen bg-[#F9FAFB]">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb items={[{ label: t('sidebar.menu.restaurants') }]} />

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-[#111827] mb-1">
                    {t('restaurants.title')}
                  </h1>
                  <p className="text-[#6B7280]">
                    {t('restaurants.subtitle')}
                  </p>
                </div>
                <Link
                    href="/admin/restaurants/new"
                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  {t('restaurants.newRestaurant')}
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-xl transition-all bg-white shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-100">
                      <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                        {t('restaurants.stats.totalPartners')}
                      </p>
                      <p className="text-2xl font-bold mt-2 text-[#111827]">
                        {stats?.total_partners || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl transition-all bg-white shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <ClockIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                        {t('restaurants.stats.setupRequired')}
                      </p>
                      <p className="text-2xl font-bold mt-2 text-[#111827]">
                        {stats?.setup_required || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl transition-all bg-white shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-red-50">
                      <TrashIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                        {t('restaurants.stats.archived')}
                      </p>
                      <p className="text-2xl font-bold mt-2 text-[#111827]">
                        {stats?.archived || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-2 p-1.5 rounded-xl shadow-sm bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        statusFilter === 'all'
                            ? 'bg-white text-gray-900 shadow-md border border-gray-200 transform scale-[1.02]'
                            : 'bg-white/70 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border-gray-300 cursor-pointer'
                    }`}
                >
                <span className="flex items-center justify-center gap-2">
                  <BuildingStorefrontIcon className={`h-4 w-4 ${
                      statusFilter === 'all'
                          ? 'text-green-500'
                          : ''
                  }`} />
                  {t('restaurants.tabs.all')}
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                      statusFilter === 'all'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {allActiveRestaurants.length}
                  </span>
                </span>
                </button>
                <button
                    onClick={() => setStatusFilter('onboarding')}
                    className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        statusFilter === 'onboarding'
                            ? 'bg-white text-gray-900 shadow-md border border-gray-200 transform scale-[1.02]'
                            : 'bg-white/70 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border-gray-300 cursor-pointer'
                    }`}
                >
                <span className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className={`h-4 w-4 ${
                      statusFilter === 'onboarding'
                          ? 'text-yellow-500 animate-spin'
                          : ''
                  }`} />
                  {t('restaurants.tabs.onboarding')}
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                      statusFilter === 'onboarding'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {onboardingRestaurants.length}
                  </span>
                </span>
                </button>
                <button
                    onClick={() => setStatusFilter('deleted')}
                    className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        statusFilter === 'deleted'
                            ? 'bg-white text-gray-900 shadow-md border border-gray-200 transform scale-[1.02]'
                            : 'bg-white/70 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border-gray-300 cursor-pointer'
                    }`}
                >
                <span className="flex items-center justify-center gap-2">
                  <ArchiveBoxIcon className={`h-4 w-4 ${
                      statusFilter === 'deleted'
                          ? 'text-red-500'
                          : ''
                  }`} />
                  {t('restaurants.tabs.deleted')}
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                      statusFilter === 'deleted'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {deletedRestaurants.length}
                  </span>
                </span>
                </button>
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
                          placeholder={t('restaurants.search')}
                      />
                    </div>

                    <div className="relative lg:w-48">
                      <select
                          value={selectedFilter}
                          onChange={(e) => setSelectedFilter(e.target.value)}
                          className="appearance-none w-full pl-3 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 cursor-pointer transition text-sm bg-white border border-gray-200 text-gray-900 focus:ring-green-500 hover:border-gray-300"
                      >
                        <option value="all">{t('restaurants.filterByLocation')}</option>
                        <option value="amsterdam">Amsterdam</option>
                        <option value="rotterdam">Rotterdam</option>
                        <option value="utrecht">Utrecht</option>
                        <option value="den haag">Den Haag</option>
                        <option value="eindhoven">Eindhoven</option>
                        <option value="zaandam">Zaandam</option>
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

              {/* Restaurant List */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredRestaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        className={`rounded-lg p-5 transition-all flex flex-col relative ${
                            restaurant.status === 'onboarding'
                                ? 'bg-white border border-emerald-400 hover:shadow-md animate-pulse-border'
                                : 'bg-white border border-gray-200 hover:shadow-md hover:border-gray-300'
                        }`}
                    >
                      {/* Header with logo and name */}
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-white transition-all duration-200 relative border border-gray-200">
                          {restaurant.logo_url ? (
                              <img
                                  src={restaurant.logo_url}
                                  alt={restaurant.name}
                                  className="h-full w-full object-cover"
                              />
                          ) : (
                              <div className="h-full w-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-semibold text-base">
                                {restaurant.name.charAt(0).toUpperCase()}
                              </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-base font-semibold mb-1 text-[#111827]">
                            {restaurant.name}
                          </h3>
                          <div className="flex items-center flex-wrap gap-2">
                            {restaurant.status === 'deleted' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <ArchiveBoxIcon className="h-3 w-3 mr-1" />
                                  {t('restaurants.status.archived')}
                          </span>
                            ) : restaurant.status === 'onboarding' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                            {t('restaurants.status.setupRequired')}
                          </span>
                            ) : restaurant.status === 'active' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            {t('restaurants.status.active')}
                          </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                            {t('restaurants.status.inactive')}
                          </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location and stats */}
                      <div className="flex-1 space-y-3 mb-4">
                        <div className="flex items-center text-sm text-[#6B7280]">
                          <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          {restaurant.city}, {restaurant.address}
                        </div>

                        {restaurant.status !== 'deleted' && restaurant.status !== 'onboarding' && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                          <span className="block text-xs mb-1 text-[#9CA3AF]">
                            {t('dashboard.sections.bestPerforming.columns.revenue')}
                          </span>
                                <span className="font-semibold text-sm text-[#111827]">
                            {restaurant.revenue}
                          </span>
                              </div>
                              <div>
                          <span className="block text-xs mb-1 text-[#9CA3AF]">
                            {t('dashboard.sections.bestPerforming.columns.transactions')}
                          </span>
                                <span className="font-semibold text-sm text-[#111827]">
                            {restaurant.total_orders}
                          </span>
                              </div>
                            </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-gray-200">
                        {restaurant.status === 'deleted' ? (
                            <div className="flex gap-2">
                              <Link
                                  href={`/admin/restaurants/detail/${restaurant.id}`}
                                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                {t('restaurants.profile.viewDetails')}
                              </Link>
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRestore(restaurant.id)
                                  }}
                                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-green-50 text-green-600 hover:bg-green-100"
                              >
                                {t('restaurants.actions.restore')}
                              </button>
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteClick(restaurant)
                                  }}
                                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                {t('restaurants.actions.deleteAction')}
                              </button>
                            </div>
                        ) : (
                            <Link
                                href={restaurant.status === 'onboarding' ? `/admin/restaurants/new/onboarding/${restaurant.id}` : `/admin/restaurants/detail/${restaurant.id}`}
                                className={`w-full inline-flex items-center justify-center px-3.5 py-2 rounded-md transition-all text-sm font-medium ${
                                    restaurant.status === 'onboarding'
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                            >
                              {restaurant.status === 'onboarding' ? t('restaurants.actions.continueOnboarding') : t('restaurants.profile.viewDetails')}
                              <ChevronRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        )}
                      </div>
                    </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredRestaurants.length === 0 && (
                  <div className="text-center py-16 rounded-xl bg-white shadow-sm">
                    <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-base font-medium text-[#111827]">
                      {statusFilter === 'deleted'
                          ? t('restaurants.emptyState.noArchived')
                          : t('restaurants.emptyState.noFound')
                      }
                    </h3>
                    <p className="mt-2 text-sm text-[#6B7280]">
                      {statusFilter === 'deleted'
                          ? t('restaurants.emptyState.archivedDescription')
                          : t('restaurants.emptyState.foundDescription')
                      }
                    </p>
                    {statusFilter !== 'deleted' && (
                        <Link
                            href="/admin/restaurants/new"
                            className="mt-6 inline-flex items-center px-4 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all"
                        >
                          <PlusIcon className="mr-2 h-5 w-5" />
                          {t('restaurants.emptyState.addFirst')}
                        </Link>
                    )}
                  </div>
              )}
            </div>
          </div>
        </div>
      </SmartLayout>
  )
}

export default Restaurants