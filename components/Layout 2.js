import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import {
  HomeIcon,
  Cog6ToothIcon,
  UsersIcon,
  CurrencyEuroIcon,
  ChevronLeftIcon,
  XMarkIcon,
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Instellingen', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Team', href: '/team', icon: UsersIcon },
  { name: 'Uitbetalingen', href: '/uitbetalingen', icon: CurrencyEuroIcon },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('nl')
  const router = useRouter()
  const { user, logout } = useAuth()

  // Check authentication
  useEffect(() => {
    if (!user && router.pathname !== '/login') {
      router.push('/login')
    }
  }, [user, router.pathname])

  // Load saved preferences
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('restaurant-sidebar-collapsed')
    if (savedCollapsed === 'true') {
      setSidebarCollapsed(true)
    }
    const savedLanguage = localStorage.getItem('restaurant-language')
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-selector-sidebar') && languageMenuOpen) {
        setLanguageMenuOpen(false)
      }
      if (!event.target.closest('.user-menu-sidebar') && userMenuOpen) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [languageMenuOpen, userMenuOpen])

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('restaurant-sidebar-collapsed', newState.toString())
  }

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'manager': return 'Restaurant Manager'
      case 'staff': return 'Medewerker'
      default: return role
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[#F9FAFB] text-[#111827]">
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out lg:transform-none lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} flex flex-col bg-white border-r border-gray-200`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute right-0 top-0 p-4">
          <button
            type="button"
            className="transition-colors duration-200 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Logo and Restaurant Info */}
        <div className="px-6 h-[120px] flex flex-col justify-center border-b border-gray-200">
          {!sidebarCollapsed && (
            <>
              <Link href="/dashboard" className="flex items-center mb-3">
                <Image
                  src="/logo-trans.webp"
                  alt="Splitty Logo"
                  width={100}
                  height={35}
                  priority
                  className="w-auto h-[35px]"
                />
              </Link>
              {user?.restaurantName && (
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                  <BuildingStorefrontIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {user.restaurantName}
                  </span>
                </div>
              )}
            </>
          )}
          {/* Collapse button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-8 h-8 transition-all duration-200 text-gray-600 hover:text-gray-900 ml-auto"
            title={sidebarCollapsed ? 'Uitklappen' : 'Inklappen'}
          >
            <svg 
              className={`h-5 w-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" strokeLinejoin="round" />
              <line x1="9" y1="3" x2="9" y2="21" strokeLinejoin="round" />
              <path d="M16 12H12M12 12L14 9M12 12L14 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href

            return (
              <div key={item.name} className="px-2 mb-1">
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (sidebarCollapsed) {
                      setSidebarCollapsed(false)
                      localStorage.setItem('restaurant-sidebar-collapsed', 'false')
                    }
                  }}
                  className={`
                    group flex items-center py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? '-ml-4 mr-0 pl-9 pr-5 bg-green-50 text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-5'
                    }
                  `}
                >
                  <div className="flex items-center">
                    {!sidebarCollapsed && (
                      <div className="w-4 mr-2" />
                    )}
                    <item.icon
                      className={`h-5 w-5 transition-all duration-200 ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="flex-1 ml-3 transition-all duration-200">
                      {item.name}
                    </span>
                  )}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-3">
            {/* Notifications */}
            <button 
              onClick={() => {
                router.push('/settings?tab=notifications')
                if (sidebarCollapsed) {
                  setSidebarCollapsed(false)
                  localStorage.setItem('restaurant-sidebar-collapsed', 'false')
                }
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 mr-3 text-gray-500" />
                {!sidebarCollapsed && (
                  <span>Notificaties</span>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center bg-green-500 text-white">
                  2
                </div>
              )}
            </button>

            {/* Theme Switcher */}
            {!sidebarCollapsed && (
              <div className="flex items-center rounded-full p-1 bg-gray-100">
                <div className="flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-white text-gray-900 shadow-sm">
                  <SunIcon className="h-4 w-4 inline mr-1" />
                  Light
                </div>
                <div
                  className="flex-1 px-3 py-1.5 rounded-full text-xs font-medium cursor-not-allowed opacity-60 text-gray-400 relative group"
                  title="Dark mode coming soon!"
                >
                  <MoonIcon className="h-4 w-4 inline mr-1" />
                  Dark
                </div>
              </div>
            )}

            {/* Language Selector */}
            {!sidebarCollapsed && (
              <div className="relative language-selector-sidebar">
                <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{selectedLanguage === 'en' ? 'English' : 'Nederlands'}</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {languageMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg py-1">
                    <button
                      onClick={() => {
                        setSelectedLanguage('en')
                        localStorage.setItem('restaurant-language', 'en')
                        setLanguageMenuOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        selectedLanguage === 'en' 
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      🇺🇸 English
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLanguage('nl')
                        localStorage.setItem('restaurant-language', 'nl')
                        setLanguageMenuOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        selectedLanguage === 'nl' 
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      🇳🇱 Nederlands
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 pt-3">
            {/* User menu */}
              <div className="relative user-menu-sidebar">
                <button
                  onClick={() => {
                    if (sidebarCollapsed) {
                      setSidebarCollapsed(false)
                      localStorage.setItem('restaurant-sidebar-collapsed', 'false')
                    } else {
                      setUserMenuOpen(!userMenuOpen)
                    }
                  }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 group bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100`}
                >
                  <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'} rounded-full flex items-center justify-center text-sm font-medium bg-gradient-to-br from-green-500 to-emerald-500 text-white flex-shrink-0`}>
                    {getInitials(user?.name)}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="font-semibold truncate">{user?.name || 'User'}</div>
                        <div className="text-xs opacity-75">{getRoleDisplay(user?.role)}</div>
                      </div>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && !sidebarCollapsed && (
                  <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg py-1">
                    <button
                      onClick={() => {
                        router.push('/settings?tab=profiel')
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <UsersIcon className="h-4 w-4 inline mr-2" />
                      Mijn Profiel
                    </button>
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
                      Instellingen
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                      Uitloggen
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* Mobile Header Only */}
        <header className="lg:hidden fixed top-0 left-0 right-0 transition-all duration-300 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6">
            <div className="flex justify-between items-center h-[72px]">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="p-2 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Logo for mobile */}
                <Image
                  src="/logo-trans.webp"
                  alt="Splitty"
                  width={100}
                  height={35}
                  className="h-[35px] w-auto"
                />
              </div>

              {/* Simple mobile user avatar */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  {getInitials(user?.name)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen transition-colors duration-300 lg:pt-0 pt-[72px] bg-[#F9FAFB]">
          {children}
        </main>
      </div>
    </div>
  )
}