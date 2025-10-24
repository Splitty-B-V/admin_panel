'use client'

import { useState, useEffect } from 'react'
import {
    UserGroupIcon,
    TrashIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    PencilIcon
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

    if (response.status === 204) {
        return null
    }

    return response.json()
}

interface StaffMember {
    id: number
    first_name: string
    last_name: string
    email: string
    phone?: string
    restaurant_id: number
    is_active: boolean
    is_restaurant_admin: boolean
    is_restaurant_staff: boolean
    is_super_admin: boolean
    created_at: string
}

interface PersonnelStepProps {
    restaurantId: number
    onNextStep: () => void
    onSkipStep: () => void
    saving: boolean
}

// Skeleton компонент для карточки користувача
const StaffCardSkeleton = () => (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 animate-pulse">
        <div className="flex items-start justify-between">
            <div className="flex items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div className="flex-1">
                    <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
        </div>
    </div>
)

export default function PersonnelStep({
                                          restaurantId,
                                          onNextStep,
                                          onSkipStep,
                                          saving
                                      }: PersonnelStepProps) {
    const { t } = useLanguage()

    const [staffList, setStaffList] = useState<StaffMember[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [showPersonForm, setShowPersonForm] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [generalError, setGeneralError] = useState('')
    const [editingUser, setEditingUser] = useState<number | null>(null)

    const [newPerson, setNewPerson] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirm: '',
        role: 'manager' as 'manager' | 'staff'
    })

    // Load existing staff
    useEffect(() => {
        loadStaff()
    }, [restaurantId])

    const loadStaff = async () => {
        try {
            setInitialLoading(true)
            const staff = await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/staff`)
            setStaffList(staff)
        } catch (error) {
            console.error('Error loading staff:', error)
            setGeneralError('Failed to load staff')
        } finally {
            setInitialLoading(false)
        }
    }

    const handleAddPerson = async () => {
        setEmailError('')
        setPasswordError('')
        setGeneralError('')

        // Validate
        if (newPerson.password !== newPerson.passwordConfirm) {
            setPasswordError(t('onboarding.personnel.validation.passwordsNotMatch'))
            return
        }

        if (newPerson.password.length < 8) {
            setPasswordError(t('onboarding.personnel.validation.passwordMinLength'))
            return
        }

        if (!newPerson.first_name || !newPerson.last_name || !newPerson.email || !newPerson.password) {
            return
        }

        try {
            const data = {
                first_name: newPerson.first_name,
                last_name: newPerson.last_name,
                email: newPerson.email,
                phone: newPerson.phone,
                password: newPerson.password,
                role: newPerson.role
            }

            await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/staff`, {
                method: 'POST',
                body: JSON.stringify(data)
            })

            await loadStaff()

            // Reset form
            setNewPerson({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                passwordConfirm: '',
                role: 'manager'
            })
            setShowPersonForm(false)
        } catch (error: any) {
            console.error('Error adding staff:', error)
            if (error.message.includes('already registered')) {
                setEmailError(t('onboarding.personnel.validation.emailExists'))
            } else {
                setGeneralError('Failed to add staff member')
            }
        }
    }

    const handleRemovePerson = async (userId: number) => {
        try {
            await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/staff/${userId}`, {
                method: 'DELETE'
            })
            await loadStaff()
        } catch (error) {
            console.error('Error deleting staff:', error)
            setGeneralError('Failed to delete staff member')
        }
    }

    const handleUpdateRole = async (userId: number, newRole: 'manager' | 'staff') => {
        try {
            await apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/staff/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            })
            await loadStaff()
            setEditingUser(null)
        } catch (error) {
            console.error('Error updating staff:', error)
            setGeneralError('Failed to update staff member')
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.personnel.title')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.personnel.subtitle', { count: staffList.length })}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                {generalError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{generalError}</p>
                            <button onClick={() => setGeneralError('')} className="ml-auto">
                                <XMarkIcon className="h-4 w-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Staff List або Skeleton */}
                {initialLoading ? (
                    <div className="mb-8">
                        <h4 className="text-sm font-medium text-gray-600 mb-4">{t('onboarding.personnel.addedUsers')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StaffCardSkeleton />
                            <StaffCardSkeleton />
                        </div>
                    </div>
                ) : staffList.length > 0 ? (
                    <div className="mb-8">
                        <h4 className="text-sm font-medium text-gray-600 mb-4">{t('onboarding.personnel.addedUsers')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {staffList.map((person) => (
                                <div key={person.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-green-400/30 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center flex-1">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] flex items-center justify-center text-black font-bold mr-4">
                                                {person.first_name.charAt(0)}{person.last_name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-semibold">{person.first_name} {person.last_name}</p>
                                                <p className="text-sm text-gray-600">{person.email}</p>
                                                {editingUser === person.id ? (
                                                    <div className="mt-2 flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateRole(person.id, 'manager')}
                                                            className={`px-2 py-1 text-xs rounded ${
                                                                person.is_restaurant_admin
                                                                    ? 'bg-[#2BE89A] text-black'
                                                                    : 'bg-gray-200 text-gray-700'
                                                            }`}
                                                        >
                                                            Manager
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateRole(person.id, 'staff')}
                                                            className={`px-2 py-1 text-xs rounded ${
                                                                !person.is_restaurant_admin
                                                                    ? 'bg-[#2BE89A] text-black'
                                                                    : 'bg-gray-200 text-gray-700'
                                                            }`}
                                                        >
                                                            Staff
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            person.is_restaurant_admin
                                                                ? 'bg-[#2BE89A]/10 text-[#2BE89A]'
                                                                : 'bg-gray-200 text-gray-700'
                                                        }`}>
                                                            {person.is_restaurant_admin ? t('onboarding.personnel.roles.manager') : t('onboarding.personnel.roles.staff')}
                                                        </span>
                                                        <button
                                                            onClick={() => setEditingUser(person.id)}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemovePerson(person.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Add Person Form */}
                {!initialLoading && (
                    showPersonForm ? (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-semibold text-gray-900">{t('onboarding.personnel.addNewUser')}</h4>
                                <button
                                    onClick={() => {
                                        setShowPersonForm(false)
                                        setNewPerson({
                                            first_name: '',
                                            last_name: '',
                                            email: '',
                                            phone: '',
                                            password: '',
                                            passwordConfirm: '',
                                            role: 'manager'
                                        })
                                        setEmailError('')
                                        setPasswordError('')
                                    }}
                                    className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.firstName')}</label>
                                    <input
                                        type="text"
                                        value={newPerson.first_name}
                                        onChange={(e) => setNewPerson({...newPerson, first_name: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder={t('onboarding.personnel.form.firstNamePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.lastName')}</label>
                                    <input
                                        type="text"
                                        value={newPerson.last_name}
                                        onChange={(e) => setNewPerson({...newPerson, last_name: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder={t('onboarding.personnel.form.lastNamePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.email')}</label>
                                    <input
                                        type="email"
                                        value={newPerson.email}
                                        onChange={(e) => {
                                            setNewPerson({...newPerson, email: e.target.value})
                                            setEmailError('')
                                        }}
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                                            emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                                        }`}
                                        placeholder={t('onboarding.personnel.form.emailPlaceholder')}
                                    />
                                    {emailError && (
                                        <div className="mt-1 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                            <p className="text-sm text-red-600">{emailError}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.phone')}</label>
                                    <input
                                        type="tel"
                                        value={newPerson.phone}
                                        onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder={t('onboarding.personnel.form.phonePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.password')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPerson.password}
                                            onChange={(e) => {
                                                setNewPerson({...newPerson, password: e.target.value})
                                                setPasswordError('')
                                            }}
                                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent pr-12 ${
                                                passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                                            }`}
                                            placeholder={t('onboarding.personnel.form.passwordPlaceholder')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                        >
                                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <div className="mt-1 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                            <p className="text-sm text-red-600">{passwordError}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.confirmPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswordConfirm ? "text" : "password"}
                                            value={newPerson.passwordConfirm}
                                            onChange={(e) => setNewPerson({...newPerson, passwordConfirm: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                                            placeholder={t('onboarding.personnel.form.confirmPasswordPlaceholder')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                        >
                                            {showPasswordConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-3">{t('onboarding.personnel.form.role')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewPerson({...newPerson, role: 'manager'})}
                                            className={`p-3 rounded-lg border transition-all ${
                                                newPerson.role === 'manager'
                                                    ? 'bg-white border-[#2BE89A] shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <ShieldCheckIcon className={`h-5 w-5 mx-auto mb-2 ${
                                                newPerson.role === 'manager' ? 'text-[#2BE89A]' : 'text-gray-400'
                                            }`} />
                                            <p className={`text-sm font-medium ${
                                                newPerson.role === 'manager' ? 'text-gray-900' : 'text-gray-600'
                                            }`}>{t('onboarding.personnel.roles.manager')}</p>
                                            <p className="text-xs mt-0.5 text-gray-500">{t('onboarding.personnel.roles.managerAccess')}</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewPerson({...newPerson, role: 'staff'})}
                                            className={`p-3 rounded-lg border transition-all ${
                                                newPerson.role === 'staff'
                                                    ? 'bg-white border-[#2BE89A] shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <UserGroupIcon className={`h-5 w-5 mx-auto mb-2 ${
                                                newPerson.role === 'staff' ? 'text-[#2BE89A]' : 'text-gray-400'
                                            }`} />
                                            <p className={`text-sm font-medium ${
                                                newPerson.role === 'staff' ? 'text-gray-900' : 'text-gray-600'
                                            }`}>{t('onboarding.personnel.roles.staff')}</p>
                                            <p className="text-xs mt-0.5 text-gray-500">{t('onboarding.personnel.roles.staffAccess')}</p>
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        onClick={handleAddPerson}
                                        disabled={!newPerson.first_name || !newPerson.last_name || !newPerson.email || !newPerson.password || !newPerson.passwordConfirm}
                                        className="w-full px-4 py-2.5 bg-[#2BE89A] text-black font-medium rounded-lg hover:bg-[#2BE89A]/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {t('onboarding.personnel.addUser')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowPersonForm(true)}
                            className="w-full px-5 py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2BE89A] hover:bg-gray-50 transition-all group"
                        >
                            <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-gray-400 group-hover:text-[#2BE89A] transition" />
                            <p className="text-sm font-medium group-hover:text-gray-900 transition">{t('onboarding.personnel.addNewUser')}</p>
                        </button>
                    )
                )}

                <div className="mt-6 bg-[#2BE89A]/5 rounded-lg p-3.5 border border-[#2BE89A]/20">
                    <p className="text-xs text-gray-600">
                        <span className="text-[#2BE89A] font-medium">{t('onboarding.common.tip')}</span> {t('onboarding.personnel.tip')}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onSkipStep}
                    disabled={saving || initialLoading}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('onboarding.common.skipStep')}
                </button>
                <button
                    onClick={onNextStep}
                    disabled={saving || staffList.length === 0 || initialLoading}
                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {saving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
                </button>
            </div>
        </div>
    )
}