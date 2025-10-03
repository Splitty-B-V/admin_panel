'use client'

import type { NextPage } from 'next'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SmartLayout from '@/components/common/SmartLayout'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'
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
  ArrowDownTrayIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline'
import {env} from "@/lib/env"

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

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

// API functions
async function getRestaurantDetail(restaurantId: number): Promise<RestaurantDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/detail/${restaurantId}`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch restaurant detail')
  return response.json()
}

async function getRestaurantTables(restaurantId: number): Promise<QRTable[]> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr/all`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch tables')
  return response.json()
}

async function createTable(restaurantId: number, tableData: any): Promise<QRTable> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tableData)
  })
  if (!response.ok) throw new Error('Failed to create table')
  return response.json()
}

async function deleteTable(restaurantId: number, tableId: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr/${tableId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Failed to delete table')
  return true
}

async function toggleTableStatus(restaurantId: number, tableId: number): Promise<QRTable> {
  const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/qr/${tableId}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  })
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

// Table management modal component
const TableManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number;
  restaurantName: string;
}> = ({ isOpen, onClose, restaurantId, restaurantName }) => {
  const [tables, setTables] = useState<QRTable[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>('all')
  const [newTable, setNewTable] = useState({
    table_number: '',
    table_section: '',
    table_design: 'default',
    is_active: true
  })

  // Load tables
  const loadTables = async () => {
    try {
      setLoading(true)
      const tablesData = await getRestaurantTables(restaurantId)
      setTables(tablesData)
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadTables()
    }
  }, [isOpen, restaurantId])

  // Excel export function
  const exportToExcel = async () => {
    try {
      setLoading(true)

      const wb = XLSX.utils.book_new()

      // Main table data
      const allTablesData = tables.map(table => ({
        'Table #': table.table_number,
        'Section': table.table_section || 'No Section',
        'QR Link': table.table_link,
        'Status': table.is_active ? 'Active' : 'Inactive'
      }))

      const allTablesWs = XLSX.utils.json_to_sheet(allTablesData)
      allTablesWs['!cols'] = [
        { wch: 10 }, // Table #
        { wch: 15 }, // Section
        { wch: 50 }, // QR Link
        { wch: 12 }  // Status
      ]

      XLSX.utils.book_append_sheet(wb, allTablesWs, "All Tables")

      // Section sheets
      const groupedBySections = tables.reduce((acc, table) => {
        const section = table.table_section || 'No Section'
        if (!acc[section]) acc[section] = []
        acc[section].push(table)
        return acc
      }, {} as Record<string, QRTable[]>)

      Object.entries(groupedBySections).forEach(([sectionName, sectionTables]) => {
        const sectionData = sectionTables.map(table => ({
          'Table #': table.table_number,
          'QR Link': table.table_link,
          'Status': table.is_active ? 'Active' : 'Inactive'
        }))

        const sectionWs = XLSX.utils.json_to_sheet(sectionData)
        sectionWs['!cols'] = [
          { wch: 10 }, // Table #
          { wch: 50 }, // QR Link
          { wch: 10 }  // Status
        ]

        const cleanSectionName = sectionName.replace(/[^\w\s]/gi, '').substring(0, 31)
        XLSX.utils.book_append_sheet(wb, sectionWs, cleanSectionName)
      })

      // Generate filename
      const date = new Date().toISOString().split('T')[0]
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
      const restaurantSlug = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `${restaurantSlug}_tables_${date}_${time}.xlsx`

      XLSX.writeFile(wb, filename)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export Excel file')
    } finally {
      setLoading(false)
    }
  }

  // Get unique sections
  const sections = ['all', ...Array.from(new Set(tables.map(t => t.table_section).filter(Boolean)))]

  // Filter tables by section
  const filteredTables = selectedSection === 'all'
      ? tables
      : tables.filter(t => t.table_section === selectedSection)

  // Group tables by section
  const groupedTables = filteredTables.reduce((acc, table) => {
    const section = table.table_section || 'No Section'
    if (!acc[section]) acc[section] = []
    acc[section].push(table)
    return acc
  }, {} as Record<string, QRTable[]>)

  const handleCreateTable = async () => {
    try {
      if (!newTable.table_number || !newTable.table_section) {
        alert('Please fill in table number and section')
        return
      }

      await createTable(restaurantId, newTable)
      setNewTable({
        table_number: '',
        table_section: '',
        table_design: 'default',
        is_active: true
      })
      setShowCreateForm(false)
      loadTables()
    } catch (error) {
      console.error('Failed to create table:', error)
      alert('Failed to create table')
    }
  }

  const handleToggleStatus = async (tableId: number) => {
    try {
      await toggleTableStatus(restaurantId, tableId)
      loadTables()
    } catch (error) {
      console.error('Failed to toggle table status:', error)
    }
  }

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      await deleteTable(restaurantId, tableId)
      loadTables()
    } catch (error) {
      console.error('Failed to delete table:', error)
    }
  }

  if (!isOpen) return null

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Table Management</h3>
              <p className="text-gray-600">{restaurantName} - {tables.length} tables</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                  onClick={exportToExcel}
                  disabled={loading || tables.length === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export to Excel
              </button>
              <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Table
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Section Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-2 overflow-x-auto">
              {sections.map(section => (
                  <button
                      key={section}
                      onClick={() => setSelectedSection(section)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                          selectedSection === section
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {section === 'all' ? 'All Tables' : section}
                  </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
                <div className="text-center py-8">Loading tables...</div>
            ) : Object.keys(groupedTables).length === 0 ? (
                <div className="text-center py-12">
                  <TableCellsIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Tables Found</h4>
                  <p className="text-gray-600 mb-4">Start by adding your first table</p>
                  <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Add Table
                  </button>
                </div>
            ) : (
                <div className="space-y-6">
                  {Object.entries(groupedTables).map(([section, sectionTables]) => (
                      <div key={section}>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">{section}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sectionTables.map(table => (
                              <div key={table.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h5 className="font-semibold text-gray-900">Table {table.table_number}</h5>
                                    <p className="text-sm text-gray-600">{table.table_section}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                      table.is_active
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-gray-100 text-gray-600'
                                  }`}>
                            {table.is_active ? 'Active' : 'Inactive'}
                          </span>
                                </div>

                                {/* QR Code */}
                                <div className="flex justify-center mb-3">
                                  <QRCodeDisplay url={table.table_link} size={80} />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                      onClick={() => handleToggleStatus(table.id)}
                                      className={`flex-1 px-3 py-2 text-xs rounded-lg transition ${
                                          table.is_active
                                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      }`}
                                  >
                                    {table.is_active ? (
                                        <>
                                          <EyeSlashIcon className="h-3 w-3 inline mr-1" />
                                          Deactivate
                                        </>
                                    ) : (
                                        <>
                                          <EyeIcon className="h-3 w-3 inline mr-1" />
                                          Activate
                                        </>
                                    )}
                                  </button>
                                  <button
                                      onClick={() => handleDeleteTable(table.id)}
                                      className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* Table link */}
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                  <p className="text-gray-600 truncate">{table.table_link}</p>
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* Create Table Form Modal */}
          {showCreateForm && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h4 className="text-lg font-semibold mb-4">Add New Table</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Table Number
                      </label>
                      <input
                          type="text"
                          value={newTable.table_number}
                          onChange={(e) => setNewTable({...newTable, table_number: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., 1, A1, VIP-01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      <input
                          type="text"
                          value={newTable.table_section}
                          onChange={(e) => setNewTable({...newTable, table_section: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., Main Hall, Terrace, VIP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Design
                      </label>
                      <select
                          value={newTable.table_design}
                          onChange={(e) => setNewTable({...newTable, table_design: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                          type="checkbox"
                          id="is_active"
                          checked={newTable.is_active}
                          onChange={(e) => setNewTable({...newTable, is_active: e.target.checked})}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleCreateTable}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Create Table
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  )
}

const RestaurantDetail: NextPage = () => {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  // State for restaurant data
  const [restaurant, setRestaurant] = useState<RestaurantDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPOSModal, setShowPOSModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)

  // POS form data
  const [posFormData, setPosFormData] = useState({
    posSystem: '',
    username: '',
    password: '',
    apiUrl: '',
    environment: 'production',
    isActive: true
  })

  // Load restaurant data
  useEffect(() => {
    if (id) {
      loadRestaurantData()
    }
  }, [id])

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRestaurantDetail(parseInt(id))
      setRestaurant(data)
    } catch (err: any) {
      console.error('Failed to load restaurant:', err)
      setError(err.message || 'Failed to load restaurant data')
    } finally {
      setLoading(false)
    }
  }

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showPOSModal || showDeleteModal || showTableModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPOSModal, showDeleteModal, showTableModal])

  const handleDeleteConfirm = () => {
    // TODO: Implement real delete API call
    console.log('Delete restaurant:', id)
    router.push('/restaurants')
  }

  const StripeIcon = () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
      </svg>
  )

  // Quick stats from backend data
  const quickStats = [
    {
      label: 'Revenue',
      value: restaurant?.fin_header?.revenue ? `€${restaurant.fin_header.revenue.toFixed(2)}` : '€0',
      icon: BanknotesIcon,
      color: 'from-[#2BE89A] to-[#4FFFB0]',
      trend: null
    },
    {
      label: 'Transactions',
      value: restaurant?.fin_header?.transactions || 0,
      icon: ShoppingBagIcon,
      color: 'from-[#4ECDC4] to-[#44A08D]',
      trend: null
    },
    {
      label: 'Average Amount',
      value: restaurant?.fin_header?.avg_amount ? `€${restaurant.fin_header.avg_amount.toFixed(2)}` : '€0',
      icon: CreditCardIcon,
      color: 'from-[#667EEA] to-[#764BA2]',
      trend: null
    },
    {
      label: 'Rating',
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
            <div className="text-gray-900">Loading restaurant details...</div>
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
                  Retry
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
            <div className="text-gray-900">Restaurant not found</div>
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
                Back to Restaurants
              </Link>

              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-[#111827] mb-1">
                    {restaurant.name || 'Restaurant Details'}
                  </h1>
                  <p className="text-[#6B7280]">
                    Manage all your restaurant partners and their performance
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center px-4 py-2.5 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Archive
                  </button>
                  <Link
                      href={`/restaurants/${id}/edit`}
                      className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Restaurant
                  </Link>
                </div>
              </div>

              {/* Restaurant Profile Card */}
              <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Banner */}
                <div className="relative h-32 md:h-40 bg-gradient-to-r from-green-400 to-green-500">
                  {restaurant.banner_url && (
                      <img
                          src={restaurant.banner_url}
                          alt={`${restaurant.name} banner`}
                          className="w-full h-full object-cover opacity-90"
                      />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      restaurant.is_active
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                    {restaurant.is_active ? 'Active' : 'Inactive'}
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
                                  alt={`${restaurant.name} logo`}
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
                        <h1 className="text-2xl font-bold text-[#111827]">{restaurant.name}</h1>
                        <div className="flex items-center mt-1 text-sm text-[#6B7280]">
                          <MapPinIcon className="h-4 w-4 mr-1.5" />
                          {restaurant.city}, {restaurant.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3 lg:mt-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 border border-gray-200">
                      <BuildingStorefrontIcon className="h-3.5 w-3.5 mr-1 text-gray-600" />
                      <span className="text-gray-900">{restaurant.tables_info?.length || 0} Tables</span>
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
                    <h2 className="text-2xl font-bold text-[#111827] mb-2">Setup Essentials</h2>
                    <p className="text-[#6B7280]">Technical configuration and integrations</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Contact Information */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <MapPinIcon className="h-5 w-5 mr-2 text-green-500" />
                          Contact Information
                        </h3>
                        <Link
                            href={`/restaurants/${id}/edit`}
                            className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1 text-[#9CA3AF]">Address</p>
                          <p className="text-sm leading-snug text-[#111827]">
                            {restaurant.address}<br />
                            {restaurant.postal_code} {restaurant.city}
                          </p>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Email</p>
                            <a href={`mailto:${restaurant.contact_email}`} className="text-sm transition text-[#111827] hover:text-green-600">
                              {restaurant.contact_email}
                            </a>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Phone</p>
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
                          Restaurant Staff
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
                            <p className="text-sm mb-3 text-[#6B7280]">No staff added</p>
                            <Link
                                href={`/restaurants/${id}/users`}
                                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Add Staff
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
                                      <p className="text-sm font-medium text-[#111827]">{member.full_name || 'Unknown User'}</p>
                                      <p className="text-xs text-[#6B7280]">{member.restaurant_role || 'User'}</p>
                                    </div>
                                  </div>
                                </div>
                            ))}
                            {restaurant.staff_info.length >= 3 && (
                                <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                                  <p className="text-sm text-center text-[#6B7280]">
                                    +{restaurant.staff_info.length - 1} more staff members
                                  </p>
                                </div>
                            )}
                            <Link
                                href={`/restaurants/${id}/users`}
                                className="block w-full text-center py-2.5 text-sm font-medium rounded-lg transition bg-gray-50 border border-gray-200 text-green-600 hover:text-green-700 hover:bg-gray-100">
                              Manage Staff
                            </Link>
                          </div>
                      )}
                    </div>

                    {/* Payment Settings (Stripe) */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <CreditCardIcon className="h-5 w-5 mr-2 text-green-500" />
                          Payment Settings
                        </h3>
                        <Link
                            href={`/restaurants/${id}/stripe-transactions`}
                            className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                          <p className="text-xs mb-1 text-[#9CA3AF]">Service Fee</p>
                          <p className="text-lg font-bold text-[#111827]">
                            {restaurant.service_fee_type === 'flat' ? '€' : ''}
                            {restaurant.service_fee_amount}
                            {restaurant.service_fee_type === 'percentage' ? '%' : ''}
                          </p>
                          <p className="text-xs text-[#6B7280]">{restaurant.service_fee_type === 'flat' ? 'Per order' : 'Percentage'}</p>
                        </div>

                        {restaurant.stripe_account_id ? (
                            <div className="flex items-center justify-between rounded-lg p-3 bg-gray-50 border border-gray-200">
                              <div className="flex items-center">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg mr-2">
                                  <StripeIcon />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#111827]">Stripe Connected</p>
                                  <p className="text-xs text-[#6B7280]">Active account</p>
                                </div>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">
                            Active
                          </span>
                            </div>
                        ) : (
                            <div className="rounded-lg p-3 bg-yellow-50 border border-yellow-200">
                              <div className="flex items-center mb-2">
                                <CreditCardIcon className="h-4 w-4 mr-2 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-700">Stripe Required</span>
                              </div>
                              <p className="text-xs text-[#6B7280]">Setup Stripe for payments</p>
                            </div>
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
                          POS Integration
                        </h3>
                        <button
                            onClick={() => setShowPOSModal(true)}
                            className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                          <Cog6ToothIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {!restaurant.pos_info || !restaurant.pos_info.is_connected ? (
                          <div className="text-center py-6">
                            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-gray-100">
                              <WifiIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <p className="text-sm mb-3 text-[#6B7280]">No POS connected</p>
                            <button
                                onClick={() => setShowPOSModal(true)}
                                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Configure POS
                            </button>
                          </div>
                      ) : (
                          <div className="space-y-3">
                            <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-[#111827]">Connected System</p>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                              {restaurant.pos_info.is_active ? 'Active' : 'Inactive'}
                            </span>
                              </div>
                              <p className="text-sm text-[#6B7280]">{restaurant.pos_info.pos_type}</p>
                            </div>
                            <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                              <p className="text-xs mb-1 text-[#9CA3AF]">Status</p>
                              <p className="text-lg font-bold text-[#111827]">
                                {restaurant.pos_info.is_connected ? 'Connected' : 'Disconnected'}
                              </p>
                            </div>
                          </div>
                      )}
                    </div>

                    {/* Tables Configuration - Enhanced */}
                    <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                          <QrCodeIcon className="h-5 w-5 mr-2 text-green-500" />
                          Tables & QR Codes
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
                            <p className="text-sm mb-3 text-[#6B7280]">No tables configured</p>
                            <button
                                onClick={() => setShowTableModal(true)}
                                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Setup Tables
                            </button>
                          </div>
                      ) : (
                          <div className="space-y-3">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                                <p className="text-xs text-[#9CA3AF] mb-1">Total Tables</p>
                                <p className="text-lg font-bold text-[#111827]">{restaurant.tables_info.length}</p>
                              </div>
                              <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                                <p className="text-xs text-[#9CA3AF] mb-1">Active</p>
                                <p className="text-lg font-bold text-[#111827]">
                                  {restaurant.tables_info.filter(table => table.is_active).length}
                                </p>
                              </div>
                            </div>

                            {/* Preview Tables with QR Codes */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-[#111827] mb-2">Table Preview</p>
                              {restaurant.tables_info.slice(0, 2).map((table) => (
                                  <div key={table.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                      {/* Mini QR Code */}
                                      <div className="w-8 h-8">
                                        <QRCodeDisplay url={table.table_link || ''} size={32} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-[#111827]">Table {table.table_number}</p>
                                        <p className="text-xs text-[#6B7280]">{table.table_section || 'No section'}</p>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        table.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {table.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                              ))}
                              {restaurant.tables_info.length > 2 && (
                                  <div className="text-center text-xs text-[#6B7280] py-1">
                                    +{restaurant.tables_info.length - 2} more tables
                                  </div>
                              )}
                            </div>

                            <button
                                onClick={() => setShowTableModal(true)}
                                className="block w-full text-center py-2.5 text-sm font-medium rounded-lg transition bg-gray-50 border border-gray-200 text-green-600 hover:text-green-700 hover:bg-gray-100">
                              Manage All Tables
                            </button>
                          </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations & Analytics Section */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#111827] mb-2">Operations & Analytics</h2>
                    <p className="text-[#6B7280]">Real-time operational data and performance metrics</p>
                  </div>

                  {/* Active Tables - Full Width */}
                  <div className="rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold flex items-center text-[#111827]">
                        <TableCellsIcon className="h-6 w-6 mr-3 text-green-500" />
                        Active Tables
                      </h3>
                      <button
                          onClick={() => setShowTableModal(true)}
                          className="inline-flex items-center text-sm font-medium transition text-green-600 hover:text-green-700">
                        <span>View All</span>
                        <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                      </button>
                    </div>

                    {/* Empty state for active tables */}
                    <div className="text-center py-16 rounded-xl bg-gray-50">
                      <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-white border border-gray-200">
                        <TableCellsIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-medium mb-2 text-[#111827]">No Active Tables</h4>
                      <p className="text-[#6B7280]">Active table sessions will appear here in real-time</p>
                    </div>
                  </div>

                  {/* Transaction Analytics - Full Width */}
                  <div className="rounded-xl p-6 mt-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold flex items-center text-[#111827]">
                        <ChartBarIcon className="h-6 w-6 mr-3 text-green-500" />
                        Transaction Analytics
                      </h3>
                      <Link
                          href={`/restaurants/${id}/transactions`}
                          className="inline-flex items-center text-sm font-medium transition text-green-600 hover:text-green-700">
                        <span>View All</span>
                        <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4" />
                      </Link>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#6B7280]">This Month</p>
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
                          <p className="text-sm font-medium text-[#6B7280]">Revenue</p>
                          <div className="p-2 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] rounded-lg">
                            <BanknotesIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#111827]">
                          €{restaurant.fin_header?.revenue?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs mt-1 text-[#6B7280]">Total revenue</p>
                      </div>
                      <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#6B7280]">Average</p>
                          <div className="p-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-lg">
                            <CreditCardIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#111827]">
                          €{restaurant.fin_header?.avg_amount?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs mt-1 text-[#6B7280]">Per transaction</p>
                      </div>
                    </div>

                    {/* Empty state for recent transactions */}
                    <div className="text-center py-16 rounded-xl bg-gray-50">
                      <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-white border border-gray-200">
                        <ChartBarIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-medium mb-2 text-[#111827]">No Recent Transactions</h4>
                      <p className="text-[#6B7280]">Transaction data will appear here once orders start coming in</p>
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
        />

        {/* Delete Modal - Simple confirmation for now */}
        {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <TrashIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">Archive Restaurant</h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to archive <span className="font-semibold">{restaurant.name}</span>?
                  This will temporarily disable the restaurant.
                </p>

                <div className="flex gap-3">
                  <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleDeleteConfirm}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* POS Integration Modal */}
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">POS Integration</h3>
                    <p className="text-gray-600">Configure POS system for {restaurant?.name}</p>
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
                      POS System <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={posFormData.posSystem}
                        onChange={(e) => setPosFormData({...posFormData, posSystem: e.target.value})}
                        required
                    >
                      <option value="">Select POS System</option>
                      <option value="untill">Untill</option>
                      <option value="lightspeed">Lightspeed</option>
                      <option value="mpluskassa">M+ Kassa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Username and Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter username"
                          value={posFormData.username}
                          onChange={(e) => setPosFormData({...posFormData, username: e.target.value})}
                          required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="password"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter password"
                          value={posFormData.password}
                          onChange={(e) => setPosFormData({...posFormData, password: e.target.value})}
                          required
                      />
                    </div>
                  </div>

                  {/* API URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      API URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="https://api.example.com"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={posFormData.apiUrl}
                        onChange={(e) => setPosFormData({...posFormData, apiUrl: e.target.value})}
                        required
                    />
                  </div>

                  {/* Environment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Environment</label>
                    <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={posFormData.environment}
                        onChange={(e) => setPosFormData({...posFormData, environment: e.target.value})}
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                      <option value="test">Test</option>
                    </select>
                  </div>

                  {/* Active Checkbox */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                          id="is-active"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-200 bg-gray-50 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                          checked={posFormData.isActive}
                          onChange={(e) => setPosFormData({...posFormData, isActive: e.target.checked})}
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="is-active" className="text-sm font-medium text-gray-900">Activate Integration</label>
                      <p className="text-sm text-gray-600">Enable POS integration for {restaurant?.name}</p>
                    </div>
                  </div>

                  {/* Test Connection Button */}
                  <button
                      onClick={() => {
                        console.log('Testing POS connection:', posFormData)
                        alert('Testing connection...')
                      }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg"
                  >
                    Test Connection
                  </button>
                </div>
              </div>
            </div>
        )}
      </SmartLayout>
  )
}

export default RestaurantDetail