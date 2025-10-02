'use client'

import {useState, useEffect, JSX, useRef} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Toast, useToast } from '@/components/restaurant/Toast'
import { ConfirmModal } from '@/components/restaurant/ConfirmModal'
import {
    UsersIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XMarkIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline'

// API imports
import {
    apiGetTeamMembers,
    apiCreateTeamMember,
    apiUpdateTeamMember,
    apiDeleteTeamMember,
    apiChangeTeamMemberStatus,
    apiChangeTeamMemberPassword,
    apiGetTeamStats,
    MessageResponse
} from '@/lib/api'

import {
    TeamMember,
    TeamMemberCreateRequest,
    TeamMemberUpdateRequest,
    TeamMemberPasswordChangeRequest,
    TeamStatsResponse,
} from '@/types/team'
import SmartLayout from '@/components/common/SmartLayout'

interface ConfirmModalState {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'info'
    requireConfirmation?: boolean
    confirmationText?: string
    confirmationPlaceholder?: string
    onConfirm: (() => void) | null
}

interface TeamMemberFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
    role: 'manager' | 'staff'
}

interface PasswordChangeFormData {
    newPassword: string
    confirmPassword: string
}

export default function Team(): JSX.Element {
    const { user } = useAuth()
    const { t } = useLanguage()

    // State management
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [teamStats, setTeamStats] = useState<TeamStatsResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [filterRole, setFilterRole] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // Modal states
    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)
    const [selectedMemberForPassword, setSelectedMemberForPassword] = useState<TeamMember | null>(null)

    // Form states
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false)
    const [passwordForm, setPasswordForm] = useState<PasswordChangeFormData>({
        newPassword: '',
        confirmPassword: ''
    })
    const addMemberFormRef = useRef<HTMLFormElement>(null)

    // Toast and confirmation
    const { toasts, showToast, removeToast } = useToast()
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    })

    // Load team data on component mount
    useEffect(() => {
        loadTeamData()
    }, [])

    // Lock body scroll when modals are open
    useEffect(() => {
        if (showAddModal || selectedMember || showPasswordModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showAddModal, selectedMember, showPasswordModal])

    const loadTeamData = async (): Promise<void> => {
        try {
            setLoading(true)
            const [membersResponse, statsResponse] = await Promise.all([
                apiGetTeamMembers(true),
                apiGetTeamStats()
            ])

            setTeamMembers(membersResponse.members)
            setTeamStats(statsResponse)
        } catch (error: any) {
            console.error('Error loading team data:', error)
            showToast(error.message || 'Failed to load team data', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Filter team members
    const filteredMembers = teamMembers.filter((member: TeamMember) => {
        const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' ||
            (filterRole === 'Manager' && member.is_restaurant_admin) ||
            (filterRole === 'Staff' && !member.is_restaurant_admin)
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && member.is_active) ||
            (filterStatus === 'inactive' && !member.is_active)
        return matchesSearch && matchesRole && matchesStatus
    })

    const getInitials = (name: string): string => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getRoleColor = (isAdmin: boolean): string => {
        return isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
    }

    const getRoleDisplay = (isAdmin: boolean): string => {
        return isAdmin ? t('team.roles.manager') : t('team.roles.staff')
    }

    const handleDeleteMember = (member: TeamMember): void => {
        // Check if user is trying to delete themselves
        if (user?.email === member.email) {
            showToast(t('team.messages.cannotDeleteSelf'), 'error')
            return
        }

        // Show confirm modal with name confirmation requirement
        setConfirmModal({
            isOpen: true,
            title: t('team.modals.confirmDelete.title'),
            message: t('team.modals.confirmDelete.message').replace('%s', member.full_name),
            confirmText: t('team.modals.confirmDelete.confirm'),
            cancelText: t('team.modals.confirmDelete.cancel'),
            type: 'danger',
            requireConfirmation: true,
            confirmationText: member.full_name,
            confirmationPlaceholder: t('team.modals.confirmDelete.confirmationPlaceholder').replace('%s', member.full_name),
            onConfirm: async () => {
                try {
                    const response = await apiDeleteTeamMember(member.id)
                    await loadTeamData() // Reload data
                    showToast(response.message, 'success')
                    setConfirmModal({ ...confirmModal, isOpen: false })
                } catch (error: any) {
                    console.error('Error deleting member:', error)
                    showToast(error.message || t('team.messages.deleteError'), 'error')
                    setConfirmModal({ ...confirmModal, isOpen: false })
                }
            }
        })
    }

    const toggleMemberStatus = async (member: TeamMember): Promise<void> => {
        // Check if user is trying to deactivate themselves
        if (user?.email === member.email && member.is_active) {
            showToast(t('team.messages.cannotDeactivateSelf'), 'error')
            return
        }

        try {
            const newStatus = !member.is_active
            await apiChangeTeamMemberStatus(member.id, newStatus)
            await loadTeamData() // Reload data

            const statusText = newStatus ? t('team.messages.activated') : t('team.messages.deactivated')
            showToast(
                t('team.messages.memberStatusChanged')
                    .replace('%s', member.full_name)
                    .replace('%s', statusText),
                'success'
            )
        } catch (error: any) {
            console.error('Error changing member status:', error)
            showToast(error.message || 'Failed to change member status', 'error')
        }
    }

    const handleAddMemberSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const firstName = formData.get('firstName') as string
        const lastName = formData.get('lastName') as string
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string
        const role = formData.get('role') as string

        // Validate passwords match
        if (password !== confirmPassword) {
            showToast(t('team.messages.passwordMismatch'), 'error')
            return
        }

        try {
            const memberData: TeamMemberCreateRequest = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone || undefined,
                password: password,
                is_restaurant_admin: role === 'manager'
            }

            await apiCreateTeamMember(memberData)

            // Сначала закрываем модал и сбрасываем форму
            addMemberFormRef.current?.reset()
            setShowAddModal(false)
            setShowPassword(false)
            setShowConfirmPassword(false)

            // Потом обновляем данные и показываем уведомление
            await loadTeamData()
            showToast(t('team.messages.memberAdded'), 'success')

        } catch (error: any) {
            console.error('Error creating member:', error)
            showToast(error.message || 'Failed to create team member', 'error')
        }
    }

    const handleEditMemberSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()
        if (!selectedMember) return

        const formData = new FormData(e.currentTarget)

        try {
            const updateData: TeamMemberUpdateRequest = {
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                email: formData.get('email') as string,
                phone: (formData.get('phone') as string) || undefined,
                is_restaurant_admin: (formData.get('role') as string) === 'Manager'
            }

            await apiUpdateTeamMember(selectedMember.id, updateData)
            await loadTeamData() // Reload data

            setSelectedMember(null)
            showToast(t('team.messages.memberUpdated'), 'success')
        } catch (error: any) {
            console.error('Error updating member:', error)
            showToast(error.message || 'Failed to update team member', 'error')
        }
    }

    const handlePasswordChangeSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()
        if (!selectedMemberForPassword) return

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast(t('team.messages.passwordMismatch'), 'error')
            return
        }

        if (passwordForm.newPassword.length < 8) {
            showToast(t('team.messages.passwordTooShort'), 'error')
            return
        }

        try {
            const passwordData: TeamMemberPasswordChangeRequest = {
                new_password: passwordForm.newPassword,
                confirm_password: passwordForm.confirmPassword
            }

            const response = await apiChangeTeamMemberPassword(selectedMemberForPassword.id, passwordData)

            setShowPasswordModal(false)
            setSelectedMemberForPassword(null)
            setPasswordForm({ newPassword: '', confirmPassword: '' })
            setShowNewPassword(false)
            setShowConfirmNewPassword(false)

            showToast(response.message, 'success')
        } catch (error: any) {
            console.error('Error changing password:', error)
            showToast(error.message || 'Failed to change password', 'error')
        }
    }

    const openPasswordModal = (member: TeamMember): void => {
        setSelectedMember(null)
        setSelectedMemberForPassword(member)
        setShowPasswordModal(true)
    }

    const canManageMember = (member: TeamMember): boolean => {
        // Если текущий пользователь не админ, не может управлять никем
        if (!user?.is_restaurant_admin) return false

        // Нельзя управлять собой
        if (user.email === member.email) return false

        // Менеджеры не могут управлять другими менеджерами
        if (member.is_restaurant_admin) return false

        return true
    }

    if (loading) {
        return (
            <SmartLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                        <p className="mt-4 text-gray-600">Loading team data...</p>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    return (
        <SmartLayout>
            <div className="p-2 xs:p-3 sm:p-4 md:p-6">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                        <div>
                            <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{t('team.title')}</h1>
                            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">{t('team.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-md xs:rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm flex items-center justify-center text-[10px] xs:text-xs sm:text-sm w-full sm:w-auto"
                        >
                            <UserPlusIcon className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 mr-1 xs:mr-1.5 sm:mr-2" />
                            {t('team.addEmployee')}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {teamStats && (
                    <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
                        <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 xs:mb-1">{t('team.stats.total')}</p>
                                    <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{teamStats.total_members}</p>
                                </div>
                                <UsersIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-gray-300" />
                            </div>
                        </div>
                        <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 xs:mb-1">{t('team.stats.active')}</p>
                                    <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{teamStats.active_members}</p>
                                </div>
                                <CheckCircleIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-green-400" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-md xs:rounded-lg sm:rounded-xl border border-gray-200 mb-3 xs:mb-4 sm:mb-6">
                    <div className="p-2 xs:p-3 sm:p-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('team.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 xs:pl-10 pr-2 xs:pr-3 sm:pr-4 py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm border border-gray-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Members Table */}
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-3">
                    {filteredMembers.map((member) => (
                        <div key={member.id} className="bg-white rounded-md xs:rounded-lg border border-gray-200 p-3 xs:p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    {member.profile_picture_url ? (
                                        <img
                                            src={member.profile_picture_url}
                                            alt={member.full_name}
                                            className="w-10 h-10 xs:w-12 xs:h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-medium text-xs xs:text-sm">
                                            {getInitials(member.full_name)}
                                        </div>
                                    )}
                                    <div className="ml-3">
                                        <div className="text-sm xs:text-base font-medium text-gray-900">{member.full_name}</div>
                                        <div className="text-[10px] xs:text-xs text-gray-500">{t('team.table.since')} {new Date(member.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                {canManageMember(member) ? (
                                    <button
                                        onClick={() => toggleMemberStatus(member)}
                                        className="group"
                                        title={member.is_active ? t('team.table.clickToDeactivate') : t('team.table.clickToActivate')}
                                    >
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${
                                            member.is_active
                                                ? 'bg-green-100 text-green-800 group-hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                                        } transition-colors cursor-pointer`}>
                                            <span className={`w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full mr-1 ${
                                                member.is_active ? 'bg-green-500' : 'bg-gray-500'
                                            }`}></span>
                                            {member.is_active ? t('team.table.active') : t('team.table.inactive')}
                                        </span>
                                    </button>
                                ) : (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${
                                        member.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full mr-1 ${
                                            member.is_active ? 'bg-green-500' : 'bg-gray-500'
                                        }`}></span>
                                        {member.is_active ? t('team.table.active') : t('team.table.inactive')}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-[10px] xs:text-xs sm:text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">{t('team.table.role')}:</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${getRoleColor(member.is_restaurant_admin)}`}>
                                        {getRoleDisplay(member.is_restaurant_admin)}
                                    </span>
                                </div>

                                {member.phone && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">{t('team.table.phone')}:</span>
                                        <a href={`tel:${member.phone}`} className="text-gray-900 hover:text-gray-700">
                                            {member.phone}
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">{t('team.table.email')}:</span>
                                    <a href={`mailto:${member.email}`} className="text-gray-900 hover:text-gray-700 truncate ml-2">
                                        {member.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                {canManageMember(member) && (
                                    <button
                                        onClick={() => setSelectedMember(member)}
                                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition flex items-center justify-center"
                                    >
                                        <PencilIcon className="h-3 w-3 mr-1" />
                                        {t('team.table.edit')}
                                    </button>
                                )}
                                {canManageMember(member) && (
                                    <button
                                        onClick={() => handleDeleteMember(member)}
                                        className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-md hover:bg-red-100 transition flex items-center justify-center"
                                    >
                                        <TrashIcon className="h-3 w-3 mr-1" />
                                        {t('team.table.delete')}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('team.table.employee')}
                                </th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('team.table.role')}
                                </th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('team.table.status')}
                                </th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('team.table.phone')}
                                </th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('team.table.email')}
                                </th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('team.table.actions')}
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {member.profile_picture_url ? (
                                                <img
                                                    src={member.profile_picture_url}
                                                    alt={member.full_name}
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                                                    {getInitials(member.full_name)}
                                                </div>
                                            )}
                                            <div className="ml-2 sm:ml-3 md:ml-4">
                                                <div className="text-xs sm:text-sm font-medium text-gray-900">{member.full_name}</div>
                                                <div className="text-[10px] sm:text-xs md:text-sm text-gray-500">{t('team.table.since')} {new Date(member.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getRoleColor(member.is_restaurant_admin)}`}>
                                                {getRoleDisplay(member.is_restaurant_admin)}
                                            </span>
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        {canManageMember(member) ? (
                                            <button
                                                onClick={() => toggleMemberStatus(member)}
                                                className="group"
                                                title={member.is_active ? t('team.table.clickToDeactivate') : t('team.table.clickToActivate')}
                                            >
                                                {member.is_active ? (
                                                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors cursor-pointer">
                                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mr-0.5 sm:mr-1"></span>
                                                                                        {t('team.statusBadge.active')}
                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-800 group-hover:bg-gray-200 transition-colors cursor-pointer">
                                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500 mr-0.5 sm:mr-1"></span>
                                                                                        {t('team.statusBadge.inactive')}
                                                    </span>
                                                                                )}
                                            </button>
                                        ) : (
                                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                                                member.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-0.5 sm:mr-1 ${
                                                member.is_active ? 'bg-green-500' : 'bg-gray-500'
                                            }`}></span>
                                                {member.is_active ? t('team.statusBadge.active') : t('team.statusBadge.inactive')}
                                        </span>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        {member.phone ? (
                                            <div className="flex items-center text-sm text-gray-900">
                                                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                {member.phone}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <a href={`mailto:${member.email}`} className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            {member.email}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {canManageMember(member) && (
                                            <button
                                                onClick={() => setSelectedMember(member)}
                                                className="text-gray-600 hover:text-gray-900 mr-3"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {canManageMember(member) && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteMember(member)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Member Modal */}
                {showAddModal && (
                    <div
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl max-w-lg w-full mx-3 sm:mx-4 p-3 xs:p-4 sm:p-5 md:p-6 shadow-xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{t('team.modals.addMember.title')}</h3>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setShowPassword(false)
                                        setShowConfirmPassword(false)
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg"
                                >
                                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>

                            <form ref={addMemberFormRef} className="space-y-4" onSubmit={handleAddMemberSubmit}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.firstName')}</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder={t('team.modals.addMember.firstNamePlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.lastName')}</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder={t('team.modals.addMember.lastNamePlaceholder')}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder={t('team.modals.addMember.emailPlaceholder')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.phone')} <span className="text-gray-400 font-normal">{t('team.modals.addMember.phoneOptional')}</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder={t('team.modals.addMember.phonePlaceholder')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="w-full px-3 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder={t('team.modals.addMember.passwordPlaceholder')}
                                                minLength={8}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.confirmPassword')}</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                className="w-full px-3 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder={t('team.modals.addMember.confirmPlaceholder')}
                                                minLength={8}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">{t('team.modals.addMember.role')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="relative">
                                            <input type="radio" name="role" value="staff" className="sr-only peer" defaultChecked />
                                            <div className="p-3 rounded-lg border transition-all bg-white border-gray-200 peer-checked:bg-green-50 peer-checked:border-green-500 cursor-pointer hover:bg-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <UsersIcon className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">{t('team.modals.addMember.roleStaff')}</p>
                                                        <p className="text-xs text-gray-500">{t('team.modals.addMember.roleBasic')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                        <label className="relative">
                                            <input type="radio" name="role" value="manager" className="sr-only peer" />
                                            <div className="p-3 rounded-lg border transition-all bg-white border-gray-200 peer-checked:bg-green-50 peer-checked:border-green-500 cursor-pointer hover:bg-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">{t('team.modals.addMember.roleManager')}</p>
                                                        <p className="text-xs text-gray-500">{t('team.modals.addMember.roleFull')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false)
                                            setShowPassword(false)
                                            setShowConfirmPassword(false)
                                        }}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                                    >
                                        {t('team.modals.addMember.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                                    >
                                        {t('team.modals.addMember.add')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Member Modal */}
                {selectedMember && (
                    <div
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => setSelectedMember(null)}
                    >
                        <div
                            className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl max-w-lg w-full mx-3 sm:mx-4 p-3 xs:p-4 sm:p-5 md:p-6 shadow-xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{t('team.modals.editMember.title')}</h3>
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="text-gray-400 hover:text-gray-600 transition p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg"
                                >
                                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>

                            <form className="space-y-4" onSubmit={handleEditMemberSubmit}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.firstName')}</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            required
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            defaultValue={selectedMember.first_name}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.lastName')}</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            required
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            defaultValue={selectedMember.last_name}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        defaultValue={selectedMember.email}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.phone')} <span className="text-gray-400 font-normal">{t('team.modals.addMember.phoneOptional')}</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        defaultValue={selectedMember.phone || ''}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">{t('team.modals.addMember.role')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="relative">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="Staff"
                                                className="sr-only peer"
                                                defaultChecked={!selectedMember.is_restaurant_admin}
                                            />
                                            <div className={`p-3 rounded-lg border transition-all bg-white cursor-pointer hover:bg-gray-50 ${
                                                !selectedMember.is_restaurant_admin ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <UsersIcon className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">{t('team.modals.addMember.roleStaff')}</p>
                                                        <p className="text-xs text-gray-500">{t('team.modals.addMember.roleBasic')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                        <label className="relative">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="Manager"
                                                className="sr-only peer"
                                                defaultChecked={selectedMember.is_restaurant_admin}
                                            />
                                            <div className={`p-3 rounded-lg border transition-all bg-white cursor-pointer hover:bg-gray-50 ${
                                                selectedMember.is_restaurant_admin ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">{t('team.modals.addMember.roleManager')}</p>
                                                        <p className="text-xs text-gray-500">{t('team.modals.addMember.roleFull')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => openPasswordModal(selectedMember)}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                                    >
                                        {t('team.modals.editMember.changePassword')} →
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMember(null)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                                    >
                                        {t('team.modals.addMember.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                                    >
                                        {t('team.modals.editMember.save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Password Change Modal */}
                {showPasswordModal && selectedMemberForPassword && (
                    <div
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => {
                            setShowPasswordModal(false)
                            setSelectedMemberForPassword(null)
                            setPasswordForm({ newPassword: '', confirmPassword: '' })
                            setShowNewPassword(false)
                            setShowConfirmNewPassword(false)
                        }}
                    >
                        <div
                            className="rounded-xl p-6 max-w-md w-full mx-4 bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-6 w-6 text-green-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-xl font-semibold text-gray-900">{t('team.modals.changePassword.title')}</h3>
                                    <p className="text-sm text-gray-600">{selectedMemberForPassword.full_name}</p>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={handlePasswordChangeSubmit}>
                                <div>
                                    <label htmlFor="new_password" className="block text-sm font-medium mb-2 text-gray-700">
                                        {t('team.modals.changePassword.newPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            id="new_password"
                                            required
                                            minLength={8}
                                            className="w-full px-4 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 transition bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-green-500 focus:border-transparent"
                                            placeholder={t('team.modals.changePassword.passwordPlaceholder')}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showNewPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirm_new_password" className="block text-sm font-medium mb-2 text-gray-700">
                                        {t('team.modals.changePassword.confirmNewPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            id="confirm_new_password"
                                            required
                                            className="w-full px-4 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 transition bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-green-500 focus:border-transparent"
                                            placeholder={t('team.modals.changePassword.passwordPlaceholder')}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showConfirmNewPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordModal(false)
                                            setSelectedMemberForPassword(null)
                                            setPasswordForm({ newPassword: '', confirmPassword: '' })
                                            setShowNewPassword(false)
                                            setShowConfirmNewPassword(false)
                                        }}
                                        className="px-6 py-2.5 font-medium rounded-lg transition bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    >
                                        {t('team.modals.changePassword.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 font-medium rounded-lg transition bg-green-600 text-white hover:bg-green-700"
                                    >
                                        {t('team.modals.changePassword.change')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toast notifications */}
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}

                {/* Confirm Modal */}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText={confirmModal.confirmText || 'Bevestigen'}
                    cancelText={confirmModal.cancelText || 'Annuleren'}
                    type={confirmModal.type || 'danger'}
                    requireConfirmation={confirmModal.requireConfirmation || false}
                    confirmationText={confirmModal.confirmationText || ''}
                    confirmationPlaceholder={confirmModal.confirmationPlaceholder || 'Type ter bevestiging'}
                />
            </div>
        </SmartLayout>
    )
}
