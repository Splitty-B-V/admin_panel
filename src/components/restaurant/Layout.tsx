'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  HomeIcon,
  Cog6ToothIcon,
  UsersIcon,
  CurrencyEuroIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: any
  submenu?: NavigationItem[]
}

interface LayoutProps {
  children: ReactNode
}

interface User {
  name?: string
  role?: string
  restaurantName?: string
}

interface LanguageOption {
  code: string
  name: string
}

const getNavigation = (t: any): NavigationItem[] => [
  { name: t('nav.dashboard'), href: '/restaurant/dashboard', icon: HomeIcon },
  { name: t('nav.payments'), href: '/restaurant/payments', icon: CurrencyEuroIcon },
  {
    name: t('nav.management'),
    href: '/restaurant/settings', // Navigate to settings when clicked
    icon: Cog6ToothIcon,
    submenu: [
      { name: t('nav.settings'), href: '/restaurant/settings', icon: Cog6ToothIcon },
      { name: t('nav.team'), href: '/restaurant/team', icon: UsersIcon },
    ]
  },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage immediately to prevent flash
    if (typeof window !== 'undefined') {
      return localStorage.getItem('restaurant-sidebar-collapsed') === 'true'
    }
    return false
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [restaurantLogo, setRestaurantLogo] = useState('/images/logo-trans.webp')
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { locale, setLocale, t, availableLanguages } = useLanguage()

  // Auto-expand Management menu when on Settings, Team or Support pages
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)

  // Authentication check
  useEffect(() => {
    // Проверяем наличие токена И что user загружен из AuthContext
    const token = localStorage.getItem('restaurant_token')
    if (!token && !user && !pathname.includes('/login')) {
      router.push('/login')
    }
  }, [user, pathname, router])

  // Auto-expand Management menu when navigating to Settings or Team
  useEffect(() => {
    if (pathname.includes('/settings') || pathname.includes('/team')) {
      setExpandedMenu(t('nav.management'))
    }
  }, [pathname, t])

  // Load preferences and data
  useEffect(() => {
    // Load restaurant logo
    const loadRestaurantLogo = () => {
      const savedLogo = localStorage.getItem('restaurant_logo')
      if (savedLogo) {
        setRestaurantLogo(savedLogo)
      }
    }

    // Load user profile data
    const loadUserProfileData = () => {
      const savedProfilePic = localStorage.getItem('restaurant_userProfilePicture')
      const savedUserName = localStorage.getItem('restaurant_userName')
      const savedUserRole = localStorage.getItem('restaurant_userRole')

      setUserProfilePicture(savedProfilePic)
      setUserName(savedUserName || user?.name || 'User')
      setUserRole(savedUserRole || user?.role || 'staff')
    }

    loadRestaurantLogo()
    loadUserProfileData()

    // Listen for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'restaurant_logo') {
        loadRestaurantLogo()
      }
      if (e.key === 'restaurant_userProfilePicture' ||
          e.key === 'restaurant_userName' ||
          e.key === 'restaurant_userRole') {
        loadUserProfileData()
      }
    }

    const handleRestaurantLogoUpdated = () => {
      loadRestaurantLogo()
    }

    const handleUserProfileUpdated = () => {
      loadUserProfileData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('restaurantLogoUpdated', handleRestaurantLogoUpdated)
    window.addEventListener('userProfileUpdated', handleUserProfileUpdated)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('restaurantLogoUpdated', handleRestaurantLogoUpdated)
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdated)
    }
  }, [user])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.language-selector-sidebar') && languageMenuOpen) {
        setLanguageMenuOpen(false)
      }
      if (!(event.target as Element).closest('.user-menu-sidebar') && userMenuOpen) {
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

  const getRoleDisplay = (role: string) => {
    const roleKey = `layout.roles.${role}`
    const translated = t(roleKey)
    return translated !== roleKey ? translated : role
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Components
  const Logo = () => (
      <div className="border-b border-gray-100">
        <div className={`${sidebarCollapsed ? 'px-4' : 'px-6'} py-6`}>
          <div className={`group flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {sidebarCollapsed ? (
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="flex items-center cursor-pointer"
                    title={t('layout.expand')}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:border-green-200 transition-all duration-200 shadow-sm">
                    <img src={restaurantLogo} alt="Restaurant Logo" className="w-full h-full object-cover" />
                  </div>
                </button>
            ) : (
                <>
                  <Link href="/restaurant/dashboard" className="flex items-center">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 group-hover:border-green-200 transition-all duration-200 shadow-sm">
                      <img src={restaurantLogo} alt="Restaurant Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {user?.restaurantName || 'Test Restaurant'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{t('layout.restaurantAdmin')}</p>
                    </div>
                  </Link>
                  <button
                      type="button"
                      onClick={toggleSidebar}
                      className="hidden lg:flex items-center justify-center w-8 h-8 ml-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      title={t('layout.collapse')}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                </>
            )}
          </div>
        </div>
      </div>
  )

  const Navigation = () => (
      <nav className="flex-1 py-6 overflow-y-auto">
        {getNavigation(t).map((item) => {
          const isActive = pathname === item.href ||
              (item.submenu && item.submenu.some(sub => pathname === sub.href))
          const isExpanded = expandedMenu === item.name

          return (
              <div key={item.name} className="px-2 mb-1">
                <div
                    onClick={() => {
                      if (item.submenu) {
                        // Toggle expansion and navigate if there's an href
                        setExpandedMenu(isExpanded ? null : item.name)
                        if (item.href && !isExpanded) {
                          router.push(item.href)
                        }
                      } else if (item.href) {
                        router.push(item.href)
                      }
                    }}
                    className={`
                group flex items-center justify-between py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
                ${isActive
                        ? '-ml-4 mr-0 pl-9 pr-5 bg-green-50 text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-5'
                    }
              `}
                >
                  <div className="flex items-center">
                    {!sidebarCollapsed && <div className="w-4 mr-2" />}
                    <item.icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                    {!sidebarCollapsed && (
                        <span className="ml-3 transition-all duration-200">{item.name}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && item.submenu && (
                      <ChevronRightIcon
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                          }`}
                      />
                  )}
                </div>

                {/* Submenu with smooth animation */}
                {!sidebarCollapsed && item.submenu && (
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="mt-1 ml-4 space-y-1 pb-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.href
                          return (
                              <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`
                          group flex items-center py-2 pl-11 pr-5 text-sm rounded-lg transition-all duration-200 transform
                          ${isSubActive
                                      ? 'bg-green-50 text-gray-900 font-medium'
                                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                  }
                          ${isExpanded ? 'translate-x-0' : '-translate-x-2'}
                        `}
                                  style={{
                                    transitionDelay: isExpanded ? `${item.submenu!.indexOf(subItem) * 50}ms` : '0ms'
                                  }}
                              >
                                <subItem.icon className={`h-4 w-4 mr-3 transition-all duration-200 ${
                                    isSubActive ? 'text-gray-900' : 'text-gray-500'
                                }`} />
                                <span>{subItem.name}</span>
                              </Link>
                          )
                        })}
                      </div>
                    </div>
                )}
              </div>
          )
        })}
      </nav>
  )

  const SupportButton = () => (
      <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            router.push('/restaurant/support')
          }}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-red-50 text-red-700 hover:text-red-900 hover:bg-red-100 border border-red-200"
      >
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-red-500" />
          {!sidebarCollapsed && <span>{t('nav.support')}</span>}
        </div>
        {!sidebarCollapsed && (
            <div className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded">
              Help
            </div>
        )}
      </button>
  )

  const NotificationButton = () => (
      <button
          onClick={() => router.push('/restaurant/settings?tab=notifications')}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      >
        <div className="flex items-center">
          <BellIcon className="h-5 w-5 mr-3 text-gray-500" />
          {!sidebarCollapsed && <span>Notificaties</span>}
        </div>
        {!sidebarCollapsed && (
            <div className="w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center bg-green-500 text-white">
              2
            </div>
        )}
      </button>
  )

  const LanguageSelector = () => (
      !sidebarCollapsed && (
          <div className="relative language-selector-sidebar">
            <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                </svg>
                <span>{availableLanguages?.find((l: LanguageOption) => l.code === locale)?.name || 'Nederlands'}</span>
              </div>
              <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {languageMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg py-1">
                  {availableLanguages?.map((lang: LanguageOption) => (
                      <button
                          key={lang.code}
                          onClick={() => {
                            setLocale(lang.code)
                            setLanguageMenuOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2 ${
                              locale === lang.code
                                  ? 'text-green-600 bg-green-50'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                      >
                        <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {lang.name}
                      </button>
                  ))}
                </div>
            )}
          </div>
      )
  )

  const UserMenu = () => (
      <div className="relative user-menu-sidebar">
        <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 group bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100`}
        >
          {userProfilePicture ? (
              <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'} rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0`}>
                <img src={userProfilePicture} alt={userName} className="w-full h-full object-cover" />
              </div>
          ) : (
              <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'} rounded-full flex items-center justify-center text-sm font-medium bg-gradient-to-br from-green-500 to-emerald-500 text-white flex-shrink-0`}>
                {getInitials(userName)}
              </div>
          )}
          {!sidebarCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <div className="font-semibold truncate">{userName}</div>
                  <div className="text-xs opacity-75">{getRoleDisplay(userRole)}</div>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </>
          )}
        </button>

        {userMenuOpen && !sidebarCollapsed && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg py-1">
              <button
                  onClick={() => {
                    router.push('/restaurant/settings?tab=profiel')
                    setUserMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <UsersIcon className="h-4 w-4 inline mr-2" />
                Mijn Profiel
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                {t('nav.logout')}
              </button>
            </div>
        )}
      </div>
  )

  const MobileHeader = () => (
      <header className="lg:hidden fixed top-0 left-0 right-0 transition-all duration-300 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6">
          <div className="flex justify-between items-center h-[72px]">
            <div className="flex items-center gap-4">
              <button
                  type="button"
                  className="p-2 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
                <img src={restaurantLogo} alt="Restaurant Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex items-center">
              {userProfilePicture ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500">
                    <img src={userProfilePicture} alt={userName} className="w-full h-full object-cover" />
                  </div>
              ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    {getInitials(userName)}
                  </div>
              )}
            </div>
          </div>
        </div>
      </header>
  )

  return (
      <div className="min-h-screen flex transition-colors duration-300 bg-[#F9FAFB] text-[#111827]">
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
            } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} flex flex-col bg-white border-r border-gray-200 h-screen`}
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

          <Logo />
          <Navigation />

          {/* Bottom Section */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-3 flex-shrink-0">
            <SupportButton />
            <NotificationButton />
            <LanguageSelector />
            <div className="border-t border-gray-200 pt-3">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <MobileHeader />
          <main className="flex-1 overflow-y-auto lg:pt-0 pt-[72px] bg-[#F9FAFB]">
            {children}
          </main>
        </div>
      </div>
  )
}