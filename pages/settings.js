import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
  BuildingStorefrontIcon,
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  DeviceTabletIcon,
  ShieldCheckIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  Bars3Icon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  WifiIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

export default function SettingsNew() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    profilePicture: null
  })
  
  // Restaurant info
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Limon Food & Drinks',
    address: 'Damrak 123',
    city: 'Amsterdam',
    postalCode: '1012 LG',
    phone: '+31 20 123 4567',
    email: 'info@limonfooddrinks.nl',
    website: 'www.limonfooddrinks.nl',
    kvk: '12345678',
    btw: 'NL123456789B01',
    logo: '/logo-trans.webp',
    banner: null,
  })
  
  const [previewLogo, setPreviewLogo] = useState(restaurantInfo.logo)
  const [previewBanner, setPreviewBanner] = useState(restaurantInfo.banner)
  const [previewProfilePic, setPreviewProfilePic] = useState(null)
  
  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCard: true,
    acceptIdeal: true,
    tipPercentages: ['5', '10', '15'],
    autoTip: false,
    minOrderAmount: '10.00',
  })
  
  // Notifications
  const [notifications, setNotifications] = useState({
    newOrders: true,
    paymentReceived: true,
    staffActivity: false,
    dailySummary: true,
    weeklyReport: true,
    emailNotifications: true,
    pushNotifications: false,
  })
  
  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const tabs = [
    { id: 'profile', name: t('settings.tabs.profile'), icon: UserCircleIcon },
    { id: 'general', name: t('settings.tabs.general'), icon: BuildingStorefrontIcon },
    { id: 'payment', name: t('settings.tabs.payment'), icon: CreditCardIcon },
    { id: 'notifications', name: t('settings.tabs.notifications'), icon: BellIcon },
    { id: 'security', name: t('settings.tabs.security'), icon: ShieldCheckIcon },
  ]
  
  // Load data on mount
  useEffect(() => {
    // Load user profile data
    const userName = localStorage.getItem('restaurant_userName') || user?.name || 'Jan Jansen'
    const userEmail = localStorage.getItem('restaurant_userEmail') || user?.email || 'jan@restaurant.nl'
    const userRole = localStorage.getItem('restaurant_userRole') || 'manager'
    const savedProfilePic = localStorage.getItem('restaurant_userProfilePicture')
    
    const teamMembers = JSON.parse(localStorage.getItem('restaurant_team_members') || '[]')
    const currentMember = teamMembers.find(m => m.email === userEmail)
    const userPhone = currentMember?.phone || '+31 6 12345678'
    
    setProfileData({
      name: userName,
      email: userEmail,
      phone: userPhone,
      role: userRole === 'manager' ? t('layout.roles.manager') : t('layout.roles.staff'),
      profilePicture: savedProfilePic
    })
    
    if (savedProfilePic) {
      setPreviewProfilePic(savedProfilePic)
    }
    
    // Load restaurant logo and banner
    const savedLogo = localStorage.getItem('restaurant_logo')
    if (savedLogo) {
      setPreviewLogo(savedLogo)
      setRestaurantInfo(prev => ({ ...prev, logo: savedLogo }))
    }
    
    const savedBanner = localStorage.getItem('restaurant_banner')
    if (savedBanner) {
      setPreviewBanner(savedBanner)
      setRestaurantInfo(prev => ({ ...prev, banner: savedBanner }))
    }
    
    // Load other settings
    const savedRestaurantInfo = localStorage.getItem('restaurant_info')
    if (savedRestaurantInfo) {
      const parsedInfo = JSON.parse(savedRestaurantInfo)
      setRestaurantInfo(prev => ({ ...prev, ...parsedInfo }))
      if (savedLogo) {
        setRestaurantInfo(prev => ({ ...prev, logo: savedLogo }))
        setPreviewLogo(savedLogo)
      }
      if (savedBanner) {
        setRestaurantInfo(prev => ({ ...prev, banner: savedBanner }))
        setPreviewBanner(savedBanner)
      }
    }
    
    const savedPaymentSettings = localStorage.getItem('restaurant_payment_settings')
    if (savedPaymentSettings) {
      setPaymentSettings(JSON.parse(savedPaymentSettings))
    }
    
    const savedNotifications = localStorage.getItem('restaurant_notifications')
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [user, t])
  
  const handleSave = () => {
    // Save profile data
    if (activeTab === 'profile') {
      localStorage.setItem('restaurant_userName', profileData.name)
      localStorage.setItem('restaurant_userEmail', profileData.email)
      
      if (profileData.profilePicture) {
        localStorage.setItem('restaurant_userProfilePicture', profileData.profilePicture)
      } else {
        localStorage.removeItem('restaurant_userProfilePicture')
      }
      
      window.dispatchEvent(new Event('userProfileUpdated'))
      
      // Update team members data
      const teamMembers = JSON.parse(localStorage.getItem('restaurant_team_members') || '[]')
      const currentUserEmail = localStorage.getItem('restaurant_userEmail')
      const memberIndex = teamMembers.findIndex(m => m.email === currentUserEmail)
      
      if (memberIndex !== -1) {
        teamMembers[memberIndex] = {
          ...teamMembers[memberIndex],
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          profilePicture: profileData.profilePicture
        }
        localStorage.setItem('restaurant_team_members', JSON.stringify(teamMembers))
      }
    }
    
    // Save restaurant settings
    if (activeTab === 'general') {
      localStorage.setItem('restaurant_info', JSON.stringify(restaurantInfo))
      if (previewLogo) {
        localStorage.setItem('restaurant_logo', previewLogo)
        window.dispatchEvent(new Event('restaurantLogoUpdated'))
      }
      if (previewBanner) {
        localStorage.setItem('restaurant_banner', previewBanner)
      }
    }
    
    // Save payment settings
    if (activeTab === 'payment') {
      localStorage.setItem('restaurant_payment_settings', JSON.stringify(paymentSettings))
    }
    
    // Save notification settings
    if (activeTab === 'notifications') {
      localStorage.setItem('restaurant_notifications', JSON.stringify(notifications))
    }
    
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }
  
  const handleLogoFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size <= 10 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewLogo(reader.result)
          setRestaurantInfo({ ...restaurantInfo, logo: reader.result })
        }
        reader.readAsDataURL(file)
      } else {
        alert(t('settings.general.fileTooLarge'))
      }
    }
  }
  
  const handleBannerFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size <= 10 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewBanner(reader.result)
          setRestaurantInfo({ ...restaurantInfo, banner: reader.result })
        }
        reader.readAsDataURL(file)
      } else {
        alert(t('settings.general.fileTooLarge'))
      }
    }
  }
  
  const handleProfilePicFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewProfilePic(reader.result)
          setProfileData({ ...profileData, profilePicture: reader.result })
        }
        reader.readAsDataURL(file)
      } else {
        alert(t('settings.general.fileTooLarge'))
      }
    }
  }
  
  const TabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.profile.personalInfo')}</h3>
              
              {/* Mobile: Stack vertically, Desktop: Side by side */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-6 lg:space-y-0">
                {/* Profile Picture */}
                <div className="flex flex-col items-center lg:items-start">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('settings.profile.profilePhoto')}
                  </label>
                  <div className="relative">
                    {previewProfilePic ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                        <img src={previewProfilePic} alt="Profile" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <UserCircleIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer border border-gray-200">
                      <PhotoIcon className="h-5 w-5 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProfilePicFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.name')}</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.email')}</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.phone')}</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.role')}</label>
                    <input
                      type="text"
                      value={profileData.role}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Activity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.profile.accountActivity')}</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('settings.profile.accountCreated')}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('settings.profile.lastLogin')}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {language === 'nl' ? 'Vandaag' : 'Today'}, {new Date().toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('settings.profile.twoFactorAuth')}</span>
                    <span className="text-sm font-medium text-gray-500">
                      {language === 'nl' ? 'Uitgeschakeld' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'general':
        return (
          <div className="space-y-6">
            {/* Logo and Banner */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.general.branding')}</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('settings.general.logo')}
                  </label>
                  {previewLogo ? (
                    <div className="relative">
                      <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img src={previewLogo} alt="Logo" className="h-full w-full object-contain bg-gray-50" />
                      </div>
                      <label className="absolute top-2 right-2 bg-white rounded-lg px-3 py-1 shadow-lg cursor-pointer border border-gray-200">
                        <span className="text-sm">{t('settings.general.changeLogo')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:border-green-400 transition">
                        <div className="text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <span className="mt-2 block text-sm font-medium text-gray-600">
                            {t('settings.general.uploadLogo')}
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoFile(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
                
                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('settings.general.banner')}
                  </label>
                  {previewBanner ? (
                    <div className="relative">
                      <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img src={previewBanner} alt="Banner" className="h-full w-full object-cover" />
                      </div>
                      <label className="absolute top-2 right-2 bg-white rounded-lg px-3 py-1 shadow-lg cursor-pointer border border-gray-200">
                        <span className="text-sm">{t('settings.general.changeBanner')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleBannerFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:border-green-400 transition">
                        <div className="text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <span className="mt-2 block text-sm font-medium text-gray-600">
                            {t('settings.general.uploadBanner')}
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleBannerFile(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            
            {/* Restaurant Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.general.restaurantInfo')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.general.restaurantName')}
                  </label>
                  <input
                    type="text"
                    value={restaurantInfo.name}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={restaurantInfo.phone}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.profile.email')}
                  </label>
                  <input
                    type="email"
                    value={restaurantInfo.email}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.general.website')}
                  </label>
                  <input
                    type="text"
                    value={restaurantInfo.website}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.general.addressInfo')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.general.streetNumber')}
                  </label>
                  <input
                    type="text"
                    value={restaurantInfo.address}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.general.postalCode')}
                  </label>
                  <input
                    type="text"
                    value={restaurantInfo.postalCode}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, postalCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.general.city')}
                  </label>
                  <input
                    type="text"
                    value={restaurantInfo.city}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.general.businessInfo')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.general.kvkNumber')}
                  </label>
                  <input
                    type="text"
                    value={restaurantInfo.kvk}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, kvk: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.general.vatNumber')}
                  </label>
                  <input
                    type="text"
                    value={restaurantInfo.btw}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, btw: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'payment':
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <CheckIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('settings.payment.setupComplete')}
              </h3>
              <p className="text-gray-600">
                {t('settings.payment.accountReady')}
              </p>
            </div>
          </div>
        )
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">{t('settings.notifications.title')}</h3>
            
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {t(`settings.notifications.${key}`)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {t(`settings.notifications.${key}Desc`)}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">{t('settings.security.title')}</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
              >
                <LockClosedIcon className="h-5 w-5 mr-2" />
                {t('settings.security.changePassword')}
              </button>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 w-full overflow-x-auto">
        {/* Mobile Header (<1024px) */}
        <div className="lg:hidden bg-white shadow-sm">
          <div className="px-4 sm:px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
          </div>
        </div>
        
        {/* Desktop Header (1024px+) */}
        <div className="hidden lg:block p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
          </div>
        </div>
        
        {/* Mobile Layout (<1024px) - Keep existing design */}
        <div className="lg:hidden">
          {/* Mobile Tab Selector */}
          <div className="bg-white border-b">
            <div className="px-4 py-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  {tabs.find(tab => tab.id === activeTab)?.icon && (
                    <div className="mr-2">
                      {(() => {
                        const Icon = tabs.find(tab => tab.id === activeTab).icon
                        return <Icon className="h-5 w-5 text-green-600" />
                      })()}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name}
                  </span>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-500 transform transition ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mobile Menu Dropdown */}
              {mobileMenuOpen && (
                <div className="mt-2 bg-white rounded-lg border border-gray-200 shadow-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                        activeTab === tab.id ? 'bg-green-50 text-green-600' : 'text-gray-700'
                      }`}
                    >
                      <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} />
                      {tab.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Content */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 overflow-x-auto">
                <TabContent />
              </div>
              
              {/* Save Button */}
              <div className="border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  {saved && (
                    <div className="flex items-center text-green-600">
                      <CheckIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">{t('settings.changesSaved')}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm"
                >
                  {t('settings.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Layout (1024px+) - Card Design */}
        <div className="hidden lg:block">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              {/* Tabs inside card */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Content inside card */}
              <div className="p-8">
                <TabContent />
              </div>
              
              {/* Save Button inside card */}
              <div className="border-t px-8 py-6 flex justify-between items-center">
                <div>
                  {saved && (
                    <div className="flex items-center text-green-600">
                      <CheckIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">{t('settings.changesSaved')}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm"
                >
                  {t('settings.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('settings.security.changePassword')}</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.security.currentPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.security.newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.security.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    // Handle password change
                    setShowPasswordModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  {t('settings.security.updatePassword')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}