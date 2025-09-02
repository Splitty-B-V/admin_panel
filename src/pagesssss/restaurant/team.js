import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Toast, useToast } from '../components/Toast'
import { ConfirmModal } from '../components/ConfirmModal'
import {
  UsersIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StarIcon,
  BuildingStorefrontIcon,
  UserIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

// Mock team data
const mockTeamMembers = [
  {
    id: 1,
    name: 'Emma van Dijk',
    email: 'emma@restaurant.nl',
    phone: '+31 6 12345678',
    role: 'Medewerker',
    status: 'active',
    startDate: '2023-03-15',
    hoursThisWeek: 32,
    tipsThisMonth: 245.50,
    rating: 4.8,
    avatar: null,
  },
  {
    id: 2,
    name: 'Lucas Bakker',
    email: 'lucas@restaurant.nl',
    phone: '+31 6 23456789',
    role: 'Medewerker',
    status: 'active',
    startDate: '2023-06-01',
    hoursThisWeek: 28,
    tipsThisMonth: 189.00,
    rating: 4.6,
    avatar: null,
  },
  {
    id: 3,
    name: 'Sophie de Jong',
    email: 'sophie@restaurant.nl',
    phone: '+31 6 34567890',
    role: 'Medewerker',
    status: 'active',
    startDate: '2024-01-10',
    hoursThisWeek: 36,
    tipsThisMonth: 312.75,
    rating: 4.9,
    avatar: null,
  },
  {
    id: 4,
    name: 'Tom Jansen',
    email: 'tom@restaurant.nl',
    phone: '+31 6 45678901',
    role: 'Medewerker',
    status: 'inactive',
    startDate: '2022-11-20',
    hoursThisWeek: 0,
    tipsThisMonth: 0,
    rating: 4.5,
    avatar: null,
  },
  {
    id: 5,
    name: 'Lisa Vermeer',
    email: 'lisa@restaurant.nl',
    phone: '+31 6 56789012',
    role: 'Manager',
    status: 'active',
    startDate: '2022-01-15',
    hoursThisWeek: 40,
    tipsThisMonth: 0,
    rating: 5.0,
    avatar: null,
  },
]

export default function Team() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [teamMembers, setTeamMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [userData, setUserData] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const { toasts, showToast, removeToast } = useToast()
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  })
  const [currentUserEmail, setCurrentUserEmail] = useState('')

  // Load team members from localStorage on mount
  useEffect(() => {
    const loadTeamMembers = () => {
      const storedMembers = localStorage.getItem('restaurant_team_members')
      if (storedMembers) {
        setTeamMembers(JSON.parse(storedMembers))
      } else {
        // Initialize with mock data if no data exists
        setTeamMembers(mockTeamMembers)
        localStorage.setItem('restaurant_team_members', JSON.stringify(mockTeamMembers))
      }
    }
    loadTeamMembers()
    
    // Also load current user email
    const email = localStorage.getItem('restaurant_userEmail')
    if (email) {
      setCurrentUserEmail(email)
    }
  }, [])

  useEffect(() => {
    // Load user data from localStorage if user is not yet loaded
    if (!user) {
      const storedUser = {
        name: localStorage.getItem('restaurant_userName'),
        restaurantName: localStorage.getItem('restaurant_restaurantName'),
      }
      if (storedUser.name) {
        setUserData(storedUser)
      }
    } else {
      setUserData(user)
    }
  }, [user])

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

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'Manager': return 'bg-purple-100 text-purple-800'
      case 'Medewerker': return 'bg-gray-100 text-gray-800'
      case t('team.roles.manager'): return 'bg-purple-100 text-purple-800'
      case t('team.roles.staff'): return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteMember = (member) => {
    // Check if user is trying to delete themselves
    // currentUserEmail is now a state variable;
    if (currentUserEmail === member.email) {
      showToast(t('team.messages.cannotDeleteSelf'), 'error');
      return;
    }

    // Check if this is the last manager
    const managers = teamMembers.filter(m => m.role === 'Manager' && m.status === 'active');
    if (member.role === 'Manager' && managers.length === 1 && member.status === 'active') {
      showToast(t('team.messages.cannotDeleteLastManager'), 'error');
      return;
    }

    // Show confirm modal with name confirmation requirement
    setConfirmModal({
      isOpen: true,
      title: t('team.modals.confirmDelete.title'),
      message: t('team.modals.confirmDelete.message').replace('%s', member.name),
      confirmText: t('team.modals.confirmDelete.confirm'),
      cancelText: t('team.modals.confirmDelete.cancel'),
      type: 'danger',
      requireConfirmation: true,
      confirmationText: member.name,
      confirmationPlaceholder: t('team.modals.confirmDelete.confirmationPlaceholder').replace('%s', member.name),
      onConfirm: () => {
        try {
          // Remove from team members
          const updatedMembers = teamMembers.filter(m => m.id !== member.id);
          setTeamMembers(updatedMembers);
          localStorage.setItem('restaurant_team_members', JSON.stringify(updatedMembers));
          
          // Remove from credentials if exists
          const credentials = JSON.parse(localStorage.getItem('restaurant_credentials') || '[]');
          const updatedCredentials = credentials.filter(c => c.email !== member.email);
          localStorage.setItem('restaurant_credentials', JSON.stringify(updatedCredentials));
          
          // Success message
          showToast(t('team.messages.memberDeleted').replace('%s', member.name), 'success');
          
          // Close modal
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error) {
          showToast(t('team.messages.deleteError'), 'error');
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  }

  const toggleMemberStatus = (member) => {
    // Check if user is trying to deactivate themselves
    // currentUserEmail is now a state variable
    if (currentUserEmail === member.email && member.status === 'active') {
      showToast(t('team.messages.cannotDeactivateSelf'), 'error')
      return
    }

    // Check if this is the last active manager
    const activeManagers = teamMembers.filter(m => m.role === 'Manager' && m.status === 'active')
    if (member.role === 'Manager' && activeManagers.length === 1 && member.status === 'active') {
      showToast(t('team.messages.cannotDeactivateLastManager'), 'error')
      return
    }

    // Toggle status
    const newStatus = member.status === 'active' ? 'inactive' : 'active'
    const updatedMember = { ...member, status: newStatus }
    
    // Update team members list
    const updatedMembers = teamMembers.map(m => 
      m.id === member.id ? updatedMember : m
    )
    setTeamMembers(updatedMembers)
    localStorage.setItem('restaurant_team_members', JSON.stringify(updatedMembers))
    
    // Update credentials to prevent/allow login
    const credentials = JSON.parse(localStorage.getItem('restaurant_credentials') || '[]')
    if (newStatus === 'inactive') {
      // Mark as inactive in credentials (don't remove, just flag)
      const updatedCredentials = credentials.map(c => 
        c.email === member.email ? { ...c, status: 'inactive' } : c
      )
      localStorage.setItem('restaurant_credentials', JSON.stringify(updatedCredentials))
    } else {
      // Reactivate in credentials
      const updatedCredentials = credentials.map(c => 
        c.email === member.email ? { ...c, status: 'active' } : c
      )
      localStorage.setItem('restaurant_credentials', JSON.stringify(updatedCredentials))
    }
    
    showToast(t('team.messages.memberStatusChanged').replace('%s', member.name).replace('%s', newStatus === 'active' ? t('team.messages.activated') : t('team.messages.deactivated')), 'success')
  }

  return (
    <Layout>
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
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 xs:mb-1">{t('team.stats.total')}</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{teamMembers.length}</p>
              </div>
              <UsersIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-gray-300" />
            </div>
          </div>
          <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 xs:mb-1">{t('team.stats.active')}</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <CheckCircleIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-green-400" />
            </div>
          </div>
        </div>

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
                  <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-medium text-xs xs:text-sm">
                    {getInitials(member.name)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm xs:text-base font-medium text-gray-900">{member.name}</div>
                    <div className="text-[10px] xs:text-xs text-gray-500">{t('team.table.since')} {new Date(member.startDate).toLocaleDateString('nl-NL')}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleMemberStatus(member)}
                  className="group"
                  title={member.status === 'active' ? t('team.table.clickToDeactivate') : t('team.table.clickToActivate')}
                >
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800 group-hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                  } transition-colors cursor-pointer`}>
                    <span className={`w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full mr-1 ${
                      member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></span>
                    {member.status === 'active' ? t('team.table.active') : t('team.table.inactive')}
                  </span>
                </button>
              </div>
              
              <div className="space-y-2 text-[10px] xs:text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{t('team.table.role')}:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
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
                <button
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition flex items-center justify-center"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  {t('team.table.edit')}
                </button>
                {!(member.role === 'Manager' && teamMembers.filter(m => m.role === 'Manager').length === 1) && member.email !== currentUserEmail && (
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
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                            {getInitials(member.name)}
                          </div>
                          <div className="ml-2 sm:ml-3 md:ml-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-[10px] sm:text-xs md:text-sm text-gray-500">{t('team.table.since')} {new Date(member.startDate).toLocaleDateString('nl-NL')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleMemberStatus(member)}
                          className="group"
                          title={member.status === 'active' ? t('team.table.clickToDeactivate') : t('team.table.clickToActivate')}
                        >
                          {member.status === 'active' ? (
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
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {member.phone}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <a href={`mailto:${member.email}`} className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {member.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteMember(member);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title={`${t('team.table.remove')} ${member.name}`}>
                          <TrashIcon className="h-5 w-5" />
                        </button>
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
                    setShowAddModal(false);
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
                
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const firstName = formData.get('firstName');
                  const lastName = formData.get('lastName');
                  const email = formData.get('email');
                  const phone = formData.get('phone') || '';
                  const password = formData.get('password');
                  const confirmPassword = formData.get('confirmPassword');
                  const role = formData.get('role');
                  
                  // Validate passwords match
                  if (password !== confirmPassword) {
                    showToast(t('team.messages.passwordMismatch'), 'error');
                    return;
                  }
                  
                  // Create new team member
                  const newMember = {
                    id: Date.now(), // Simple ID generation
                    name: `${firstName} ${lastName}`,
                    email: email,
                    phone: phone,
                    role: role === 'manager' ? 'Manager' : 'Medewerker',
                    status: 'active',
                    startDate: new Date().toISOString().split('T')[0],
                    hoursThisWeek: 0,
                    tipsThisMonth: 0,
                    rating: 0,
                    avatar: null,
                    password: password // In production, this would be hashed
                  };
                  
                  // Update team members list
                  const updatedMembers = [...teamMembers, newMember];
                  setTeamMembers(updatedMembers);
                  
                  // Save to localStorage
                  localStorage.setItem('restaurant_team_members', JSON.stringify(updatedMembers));
                  
                  // Also save credentials for login (in production, this would be handled by backend)
                  const existingCredentials = JSON.parse(localStorage.getItem('restaurant_credentials') || '[]');
                  existingCredentials.push({
                    email: email,
                    password: password,
                    name: `${firstName} ${lastName}`,
                    role: role
                  });
                  localStorage.setItem('restaurant_credentials', JSON.stringify(existingCredentials));
                  
                  // Reset form and close modal
                  e.target.reset();
                  setShowAddModal(false);
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  
                  // Show success message
                  showToast(t('team.messages.memberAdded'), 'success');
                }}>
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
                          minLength="8"
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
                          minLength="8"
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
                        setShowAddModal(false);
                        setShowPassword(false);
                        setShowConfirmPassword(false);
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
              
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                // Update member data
                const updatedMember = {
                  ...selectedMember,
                  name: `${formData.get('first_name')} ${formData.get('last_name')}`,
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  role: formData.get('role') === 'Manager' ? 'Manager' : 'Medewerker'
                };
                
                // Update team members list
                const updatedMembers = teamMembers.map(m => 
                  m.id === selectedMember.id ? updatedMember : m
                );
                setTeamMembers(updatedMembers);
                localStorage.setItem('restaurant_team_members', JSON.stringify(updatedMembers));
                
                // Update credentials if email changed
                const credentials = JSON.parse(localStorage.getItem('restaurant_credentials') || '[]');
                const credIndex = credentials.findIndex(c => c.email === selectedMember.email);
                if (credIndex !== -1) {
                  credentials[credIndex] = {
                    ...credentials[credIndex],
                    email: updatedMember.email,
                    name: updatedMember.name,
                    role: updatedMember.role.toLowerCase()
                  };
                  localStorage.setItem('restaurant_credentials', JSON.stringify(credentials));
                }
                
                setSelectedMember(null);
                showToast(t('team.messages.memberUpdated'), 'success');
              }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.firstName')}</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      defaultValue={selectedMember.name.split(' ')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('team.modals.addMember.lastName')}</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      defaultValue={selectedMember.name.split(' ').slice(1).join(' ')}
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
                    defaultValue={selectedMember.phone}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">{t('team.modals.addMember.role')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="relative">
                      <input 
                        type="radio" 
                        name="role" 
                        value="Medewerker" 
                        className="sr-only peer" 
                        defaultChecked={selectedMember.role === 'Medewerker'}
                      />
                      <div className={`p-3 rounded-lg border transition-all bg-white cursor-pointer hover:bg-gray-50 ${
                        selectedMember.role === 'Medewerker' ? 'border-green-500 bg-green-50' : 'border-gray-200'
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
                        defaultChecked={selectedMember.role === 'Manager'}
                      />
                      <div className={`p-3 rounded-lg border transition-all bg-white cursor-pointer hover:bg-gray-50 ${
                        selectedMember.role === 'Manager' ? 'border-green-500 bg-green-50' : 'border-gray-200'
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
                    onClick={() => {
                      setSelectedMember(null);
                      setShowPasswordModal(true);
                    }}
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
        {showPasswordModal && (
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => {
              setShowPasswordModal(false)
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
                <h3 className="text-xl font-semibold ml-3 text-gray-900">{t('team.modals.changePassword.title')}</h3>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  showToast(t('team.messages.passwordMismatch'), 'error')
                  return
                }
                if (passwordForm.newPassword.length < 8) {
                  showToast(t('team.messages.passwordTooShort'), 'error')
                  return
                }
                // Handle password change
                showToast(t('team.messages.passwordChanged'), 'success')
                setShowPasswordModal(false)
                setPasswordForm({ newPassword: '', confirmPassword: '' })
                setShowNewPassword(false)
                setShowConfirmNewPassword(false)
              }}>
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium mb-2 text-gray-700">
                    {t('team.modals.changePassword.newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new_password"
                      required
                      minLength="8"
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
    </Layout>
  )
}