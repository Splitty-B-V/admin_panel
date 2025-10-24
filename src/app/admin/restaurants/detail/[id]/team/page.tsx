'use client'

import type { NextPage } from 'next'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import SmartLayout from '@/components/common/SmartLayout'
import { useLanguage } from '@/contexts/LanguageContext'
import { env } from "@/lib/env"
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    UserPlusIcon,
    UserIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    ChevronRightIcon,
    HomeIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

// TypeScript interfaces
interface TeamMember {
    id: number
    first_name: string
    last_name: string
    email: string
    phone?: string
    is_restaurant_admin: boolean
    is_restaurant_staff: boolean
    is_active: boolean
    profile_picture_url?: string
    last_login_at?: string
}

interface TeamStatInfo {
    restaurant_name: string
    team: TeamMember[]
    total: number
    admin_count: number
    staff_count: number
}

interface CreateTeamMemberRequest {
    first_name: string
    last_name: string
    email: string
    phone?: string
    password: string
    role: string
}

interface UpdateTeamMemberRequest {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    is_restaurant_admin?: boolean
    is_restaurant_staff?: boolean
    password?: string
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
async function getTeamMembers(restaurantId: number): Promise<TeamStatInfo> {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/team`, {
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

    if (!response.ok) throw new Error('Failed to fetch team members')
    return response.json()
}

async function createTeamMember(restaurantId: number, data: CreateTeamMemberRequest): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/team`, {
        method: 'POST',
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
        throw new Error(errorData.detail || 'Failed to create team member')
    }

    return response.json()
}

async function updateTeamMember(restaurantId: number, memberId: number, data: UpdateTeamMemberRequest): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/team/${memberId}`, {
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
        throw new Error(errorData.detail || 'Failed to update team member')
    }

    return response.json()
}

async function deleteTeamMember(restaurantId: number, memberId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/team/${memberId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ member_id: memberId })
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
        throw new Error(errorData.detail || 'Failed to delete team member')
    }
}

const RestaurantStaffManagement: NextPage = () => {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string

    const { t } = useLanguage()

    // State for data
    const [teamData, setTeamData] = useState<TeamStatInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State for UI
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null)

    // State for forms
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'staff'
    })
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'staff'
    })
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Load data on mount
    useEffect(() => {
        if (id) {
            loadData()
        }
    }, [id])

    // Lock body scroll when modals are open
    useEffect(() => {
        if (showAddModal || showEditModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showAddModal, showEditModal])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await getTeamMembers(parseInt(id as string))
            setTeamData(data)
        } catch (err: any) {
            console.error('Error loading data:', err)
            setError(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    // Helper function to get role from boolean fields
    const getMemberRole = (member: TeamMember): string => {
        if (member.is_restaurant_admin) return 'manager'
        if (member.is_restaurant_staff) return 'staff'
        return 'staff'
    }

    // Helper function to format last login
    const formatLastLogin = (lastLogin?: string): string => {
        if (!lastLogin) return t('restaurants.staff.table.neverLoggedIn')

        const date = new Date(lastLogin)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return t('restaurants.staff.table.justNow')
        if (diffInHours < 24) return t('restaurants.staff.table.hoursAgo', { hours: diffInHours })

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return t('restaurants.staff.table.daysAgo', { days: diffInDays })

        return date.toLocaleDateString()
    }

    // Filter team members
    const filteredStaff = teamData?.team?.filter((member) => {
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
        const email = member.email.toLowerCase()
        const searchLower = searchQuery.toLowerCase()

        const matchesSearch =
            fullName.includes(searchLower) ||
            email.includes(searchLower)

        const memberRole = getMemberRole(member)
        const matchesRole = selectedRole === 'all' || memberRole === selectedRole

        return matchesSearch && matchesRole
    }) || []

    // Validate form
    const validateForm = (data: any, isEdit = false): boolean => {
        const errors: Record<string, string> = {}

        if (!data.firstName?.trim()) errors.firstName = t('restaurants.staff.validation.firstNameRequired')
        if (!data.lastName?.trim()) errors.lastName = t('restaurants.staff.validation.lastNameRequired')
        if (!data.email?.trim()) errors.email = t('restaurants.staff.validation.emailRequired')
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = t('restaurants.staff.validation.invalidEmail')
        }

        if (!isEdit) {
            if (!data.password) errors.password = t('restaurants.staff.validation.passwordRequired')
            else if (data.password.length < 8) errors.password = t('restaurants.staff.validation.passwordMinLength')

            if (data.password !== data.confirmPassword) {
                errors.confirmPassword = t('restaurants.staff.validation.passwordMismatch')
            }
        }

        // Phone validation (same as restaurant edit)
        if (data.phone?.trim()) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/
            if (!phoneRegex.test(data.phone)) {
                errors.phone = t('restaurants.staff.validation.invalidPhone')
            }
            const digitsOnly = data.phone.replace(/[\s\-\(\)\+]/g, '')
            if (digitsOnly.length < 10) {
                errors.phone = t('restaurants.staff.validation.phoneMinLength')
            }
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle phone input (same as restaurant edit)
    const handlePhoneChange = (value: string, isEdit = false) => {
        // Allow only digits, spaces, +, -, ( and )
        const cleanValue = value.replace(/[^0-9\s\+\-\(\)]/g, '')

        if (isEdit) {
            setEditFormData(prev => ({ ...prev, phone: cleanValue }))
        } else {
            setFormData(prev => ({ ...prev, phone: cleanValue }))
        }

        // Clear error when user starts typing
        if (formErrors.phone) {
            setFormErrors(prev => ({ ...prev, phone: '' }))
        }
    }

    // Handle create team member
    const handleCreateTeamMember = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm(formData)) return

        try {
            setActionLoading(true)

            const createData: CreateTeamMemberRequest = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone || undefined,
                password: formData.password,
                role: formData.role === 'manager' ? 'manager' : 'staff'
            }

            await createTeamMember(parseInt(id as string), createData)

            // Reset form and close modal
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                role: 'staff'
            })
            setFormErrors({})
            setShowAddModal(false)

            // Reload data
            await loadData()

        } catch (err: any) {
            console.error('Error creating team member:', err)
            setFormErrors({ general: err.message || 'Failed to create team member' })
        } finally {
            setActionLoading(false)
        }
    }

    // Handle update team member
    const handleUpdateTeamMember = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUser || !validateForm(editFormData, true)) return

        try {
            setActionLoading(true)

            const updateData: UpdateTeamMemberRequest = {
                first_name: editFormData.firstName,
                last_name: editFormData.lastName,
                email: editFormData.email,
                phone: editFormData.phone || undefined,
                is_restaurant_admin: editFormData.role === 'manager',
                is_restaurant_staff: editFormData.role === 'staff'
            }

            // Add password if changed
            if (showPasswordSection && newPassword) {
                if (newPassword !== confirmNewPassword) {
                    setFormErrors({ password: t('restaurants.staff.validation.passwordMismatch') })
                    return
                }
                if (newPassword.length < 8) {
                    setFormErrors({ password: t('restaurants.staff.validation.passwordMinLength') })
                    return
                }
                updateData.password = newPassword
            }

            await updateTeamMember(parseInt(id as string), selectedUser.id, updateData)

            // Reset and close modal
            setEditFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                role: 'staff'
            })
            setFormErrors({})
            setShowEditModal(false)
            setSelectedUser(null)
            setShowPasswordSection(false)
            setNewPassword('')
            setConfirmNewPassword('')

            // Reload data
            await loadData()

        } catch (err: any) {
            console.error('Error updating team member:', err)
            setFormErrors({ general: err.message || 'Failed to update team member' })
        } finally {
            setActionLoading(false)
        }
    }

    // Handle delete team member
    const handleDeleteTeamMember = async (member: TeamMember) => {
        if (!confirm(t('restaurants.staff.deleteConfirmation', { name: `${member.first_name} ${member.last_name}` }))) {
            return
        }

        try {
            setActionLoading(true)
            await deleteTeamMember(parseInt(id as string), member.id)
            await loadData()
        } catch (err: any) {
            console.error('Error deleting team member:', err)
            setError(err.message || 'Failed to delete team member')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <SmartLayout>
                <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-[#111827]">Loading team members...</p>
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
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
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

    return (
        <SmartLayout>
            <div className="min-h-screen bg-[#F9FAFB]">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        {/* Breadcrumb */}
                        <nav className="mb-5" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-1 text-sm">
                                <li>
                                    <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors duration-200">
                                        <HomeIcon className="h-4 w-4" />
                                        <span className="sr-only">Dashboard</span>
                                    </Link>
                                </li>
                                <li className="flex items-center">
                                    <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                    <Link href="/admin/restaurants" className="ml-1 text-gray-500 hover:text-gray-900 transition-colors duration-200">
                                        {t('sidebar.menu.restaurants')}
                                    </Link>
                                </li>
                                <li className="flex items-center">
                                    <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                    <Link href={`/admin/restaurants/detail/${id}`} className="ml-1 text-gray-500 hover:text-gray-900 transition-colors duration-200">
                                        {teamData?.restaurant_name || 'Restaurant'}
                                    </Link>
                                </li>
                                <li className="flex items-center">
                                    <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                    <span className="ml-1 font-medium text-gray-900" aria-current="page">
                    {t('restaurants.staff.title')}
                  </span>
                                </li>
                            </ol>
                        </nav>

                        {/* Back Button */}
                        <Link
                            href={`/admin/restaurants/detail/${id}`}
                            className="inline-flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium mb-6 group bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-100 hover:border-green-300"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            {t('restaurants.staff.backToRestaurant', { name: teamData?.restaurant_name || 'Restaurant' })}
                        </Link>

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900 mb-1">{t('restaurants.staff.title')}</h1>
                                <p className="text-gray-600">{t('restaurants.staff.subtitle', { name: teamData?.restaurant_name || 'Restaurant' })}</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                            >
                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                {t('restaurants.staff.addStaff')}
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-5 rounded-lg bg-white border border-gray-200">
                                <p className="text-xs text-gray-500">{t('restaurants.staff.stats.total')}</p>
                                <p className="text-2xl font-semibold mt-1 text-gray-900">{teamData?.total || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('restaurants.staff.stats.members')}</p>
                            </div>
                            <div className="p-5 rounded-lg bg-white border border-gray-200">
                                <p className="text-xs text-gray-500">{t('restaurants.staff.stats.admins')}</p>
                                <p className="text-2xl font-semibold mt-1 text-gray-900">{teamData?.admin_count || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('restaurants.staff.roles.restaurantAdmin')}</p>
                            </div>
                            <div className="p-5 rounded-lg bg-white border border-gray-200">
                                <p className="text-xs text-gray-500">{t('restaurants.staff.stats.staff')}</p>
                                <p className="text-2xl font-semibold mt-1 text-gray-900">{teamData?.staff_count || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('restaurants.staff.roles.restaurantStaff')}</p>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600 focus:outline-none"
                                        placeholder={t('restaurants.staff.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="px-4 py-2.5 rounded-lg border transition-colors bg-white border-gray-200 text-gray-900 focus:outline-none"
                                >
                                    <option value="all">{t('restaurants.staff.filters.allRoles')}</option>
                                    <option value="manager">{t('restaurants.staff.roles.restaurantAdmin')}</option>
                                    <option value="staff">{t('restaurants.staff.roles.restaurantStaff')}</option>
                                </select>
                            </div>
                        </div>

                        {filteredStaff.length === 0 ? (
                            <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                                <div className="text-center py-20">
                                    <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <UserGroupIcon className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('restaurants.staff.empty.title')}</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-8">{t('restaurants.staff.empty.description')}</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                                    >
                                        <UserPlusIcon className="h-5 w-5 mr-2" />
                                        {t('restaurants.staff.empty.addFirst')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="border-b bg-gray-50 border-gray-200">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                {t('restaurants.staff.table.user')}
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                {t('restaurants.staff.table.role')}
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                {t('common.status')}
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                {t('restaurants.staff.table.lastActivity')}
                                            </th>
                                            <th scope="col" className="relative px-6 py-4">
                                                <span className="sr-only">{t('common.actions')}</span>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {filteredStaff.map((member) => {
                                            const memberRole = getMemberRole(member)
                                            return (
                                                <tr key={member.id} className="transition-colors hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold bg-green-100 text-green-700">
                                                                {`${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{`${member.first_name} ${member.last_name}`}</div>
                                                                <div className="text-sm text-gray-500">{member.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {memberRole === 'manager' ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                                  {t('restaurants.staff.roles.restaurantAdmin')}
                                </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700">
                                  {t('restaurants.staff.roles.restaurantStaff')}
                                </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                  member.is_active
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-gray-50 text-gray-700'
                              }`}>
                                {member.is_active ? t('common.active') : t('common.inactive')}
                              </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{formatLastLogin(member.last_login_at)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditFormData({
                                                                        firstName: member.first_name,
                                                                        lastName: member.last_name,
                                                                        email: member.email,
                                                                        phone: member.phone || '',
                                                                        role: memberRole
                                                                    })
                                                                    setSelectedUser(member)
                                                                    setShowEditModal(true)
                                                                }}
                                                                className="text-sm font-medium transition-colors text-green-600 hover:text-green-700"
                                                            >
                                                                {t('common.edit')}
                                                            </button>
                                                            <span className="text-gray-300">•</span>
                                                            <button
                                                                onClick={() => handleDeleteTeamMember(member)}
                                                                disabled={actionLoading}
                                                                className="text-sm font-medium transition-colors text-red-600 hover:text-red-700 disabled:opacity-50"
                                                            >
                                                                {t('common.delete')}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Footer */}
                                <div className="px-6 py-4 border-t bg-gray-50 border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium text-gray-900">{filteredStaff.length}</span> {t('restaurants.staff.table.usersFound')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full p-8 border border-gray-200 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('restaurants.staff.modal.addTitle')}</h3>
                                <p className="text-gray-600">{t('restaurants.staff.modal.addSubtitle', { name: teamData?.restaurant_name || 'Restaurant' })}</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-600 hover:text-gray-900 transition p-2"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* General Error */}
                        {formErrors.general && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex">
                                    <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                                    <p className="text-sm text-red-700">{formErrors.general}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <form className="space-y-4" onSubmit={handleCreateTeamMember}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.firstName')}</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                formErrors.firstName ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            placeholder={t('restaurants.staff.modal.firstNamePlaceholder')}
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            required
                                        />
                                        {formErrors.firstName && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.lastName')}</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                formErrors.lastName ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            placeholder={t('restaurants.staff.modal.lastNamePlaceholder')}
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            required
                                        />
                                        {formErrors.lastName && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.email')}</label>
                                    <input
                                        type="email"
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                            formErrors.email ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder={t('restaurants.staff.modal.emailPlaceholder')}
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.phone')}</label>
                                    <input
                                        type="tel"
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                            formErrors.phone ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder={t('restaurants.staff.modal.phonePlaceholder')}
                                        value={formData.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value, false)}
                                    />
                                    {formErrors.phone && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.password')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 ${
                                                formErrors.password ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            placeholder={t('restaurants.staff.modal.passwordPlaceholder')}
                                            minLength={8}
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.password && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.confirmPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 ${
                                                formErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            placeholder={t('restaurants.staff.modal.confirmPasswordPlaceholder')}
                                            minLength={8}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-3">{t('restaurants.staff.modal.role')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="relative">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="staff"
                                                className="sr-only peer"
                                                checked={formData.role === 'staff'}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            />
                                            <div className="p-4 rounded-lg border-2 transition-all bg-gray-50 border-gray-200 peer-checked:bg-blue-50 peer-checked:border-blue-400 cursor-pointer">
                                                <UserIcon className="h-6 w-6 mx-auto mb-2" />
                                                <p className="font-medium text-center">{t('restaurants.staff.modal.staff')}</p>
                                                <p className="text-xs mt-1 text-center opacity-75">Basic access</p>
                                            </div>
                                        </label>
                                        <label className="relative">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="manager"
                                                className="sr-only peer"
                                                checked={formData.role === 'manager'}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            />
                                            <div className="p-4 rounded-lg border-2 transition-all bg-gray-50 border-gray-200 peer-checked:bg-blue-50 peer-checked:border-blue-400 cursor-pointer">
                                                <ShieldCheckIcon className="h-6 w-6 mx-auto mb-2" />
                                                <p className="font-medium text-center">{t('restaurants.staff.modal.manager')}</p>
                                                <p className="text-xs mt-1 text-center opacity-75">Full access</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {actionLoading ? t('restaurants.staff.modal.creating') : t('restaurants.staff.modal.addUser')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full p-8 border border-gray-200 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('restaurants.staff.modal.editTitle')}</h3>
                                <p className="text-gray-600">{t('restaurants.staff.modal.editSubtitle', { name: `${selectedUser.first_name} ${selectedUser.last_name}` })}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditModal(false)
                                    setShowPasswordSection(false)
                                    setNewPassword('')
                                    setConfirmNewPassword('')
                                    setFormErrors({})
                                }}
                                className="text-gray-600 hover:text-gray-900 transition p-2"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* General Error */}
                        {formErrors.general && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex">
                                    <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                                    <p className="text-sm text-red-700">{formErrors.general}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <form className="space-y-4" onSubmit={handleUpdateTeamMember}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.firstName')}</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                formErrors.firstName ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            value={editFormData.firstName}
                                            onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                                            required
                                        />
                                        {formErrors.firstName && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.lastName')}</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                formErrors.lastName ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            value={editFormData.lastName}
                                            onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                                            required
                                        />
                                        {formErrors.lastName && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.email')}</label>
                                    <input
                                        type="email"
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                            formErrors.email ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                        required
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('restaurants.staff.modal.phone')}</label>
                                    <input
                                        type="tel"
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                            formErrors.phone ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder={t('restaurants.staff.modal.phonePlaceholder')}
                                        value={editFormData.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value, true)}
                                    />
                                    {formErrors.phone && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-3">{t('restaurants.staff.modal.role')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="relative">
                                            <input
                                                type="radio"
                                                name="edit-role"
                                                value="staff"
                                                className="sr-only peer"
                                                checked={editFormData.role === 'staff'}
                                                onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                                            />
                                            <div className="p-4 rounded-lg border-2 transition-all bg-gray-50 border-gray-200 peer-checked:bg-blue-50 peer-checked:border-blue-400 cursor-pointer">
                                                <UserIcon className="h-6 w-6 mx-auto mb-2" />
                                                <p className="font-medium text-center">{t('restaurants.staff.modal.staff')}</p>
                                                <p className="text-xs mt-1 text-center opacity-75">Basic access</p>
                                            </div>
                                        </label>
                                        <label className="relative">
                                            <input
                                                type="radio"
                                                name="edit-role"
                                                value="manager"
                                                className="sr-only peer"
                                                checked={editFormData.role === 'manager'}
                                                onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                                            />
                                            <div className="p-4 rounded-lg border-2 transition-all bg-gray-50 border-gray-200 peer-checked:bg-blue-50 peer-checked:border-blue-400 cursor-pointer">
                                                <ShieldCheckIcon className="h-6 w-6 mx-auto mb-2" />
                                                <p className="font-medium text-center">{t('restaurants.staff.modal.manager')}</p>
                                                <p className="text-xs mt-1 text-center opacity-75">Full access</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Password Change Section - simplified */}
                                <div className="border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordSection(!showPasswordSection)
                                            setNewPassword('')
                                            setConfirmNewPassword('')
                                            setFormErrors({})
                                        }}
                                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
                                    >
                                        {showPasswordSection ? 'Cancel password change' : 'Change password'}
                                    </button>

                                    {showPasswordSection && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">New password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 ${
                                                            formErrors.password ? 'border-red-500' : 'border-gray-200'
                                                        }`}
                                                        placeholder="Enter new password"
                                                        minLength={8}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {formErrors.password && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">Confirm new password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmNewPassword ? "text" : "password"}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                                                        placeholder="Confirm new password"
                                                        minLength={8}
                                                        value={confirmNewPassword}
                                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                                    >
                                                        {showConfirmNewPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {actionLoading ? t('restaurants.staff.modal.updating') : 'Save changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </SmartLayout>
    )
}

export default RestaurantStaffManagement