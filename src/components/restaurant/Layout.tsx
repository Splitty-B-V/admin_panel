'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  icon: React.ComponentType<{ className?: string }>
  submenu?: NavigationItem[]
  adminOnly?: boolean
}

interface LayoutProps {
  children: ReactNode
}

const getNavigation = (t: (key: string) => string, user: any): NavigationItem[] => {
  const baseNavigation: NavigationItem[] = [
    { name: t('nav.dashboard'), href: '/restaurant/dashboard', icon: HomeIcon },
  ]

  // Add admin-only items
  if (user?.is_restaurant_admin) {
    baseNavigation.push(
        { name: t('nav.payments'), href: '/payouts', icon: CurrencyEuroIcon, adminOnly: true },
        {
          name: t('nav.management'),
          href: '',
          icon: Cog6ToothIcon,
          adminOnly: true,
          submenu: [
            { name: t('nav.settings'), href: '/restaurant/settings', icon: Cog6ToothIcon },
            { name: t('nav.team'), href: '/restaurant/team', icon: UsersIcon, adminOnly: true },
          ]
        }
    )
  } else {
    // For staff, only add settings without submenu
    baseNavigation.push(
        { name: t('nav.settings'), href: '/restaurant/settings', icon: Cog6ToothIcon }
    )
  }

  return baseNavigation
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('restaurant-sidebar-collapsed') === 'true'
    }
    return false
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const router = useRouter()
  const { user, restaurant, logout } = useAuth()
  const { locale, setLocale, t, availableLanguages } = useLanguage()

  // Auto-expand Management menu when navigating to Settings or Team (admin only)
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.is_restaurant_admin) {
      const pathname = window.location.pathname
      if (pathname === '/restaurant/settings' || pathname === '/restaurant/team') {
        setExpandedMenu(t('nav.management'))
      }
    }
  }, [t, user?.is_restaurant_admin])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.language-selector-sidebar') && languageMenuOpen) {
        setLanguageMenuOpen(false)
      }
      if (!target.closest('.user-menu-sidebar') && userMenuOpen) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const isCurrentPath = (path: string) => {
    if (typeof window === 'undefined') return false
    return window.location.pathname === path
  }

  // Get data from context or fallback
  const restaurantLogo = restaurant?.logo_url || '/logo-trans.webp'
  const restaurantName = restaurant?.name || 'Restaurant'
  const userName = user?.full_name || 'User'
  const userRole = user?.role || 'Staff'
  const userProfilePicture = user?.profile_picture_url

  return (
      <div className="h-screen overflow-hidden flex">
        {/* Mobile sidebar backdrop */}
        <div
            className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
        />

        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-72'
        }`}>
          {/* Logo Section */}
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
                            {restaurantName}
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

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            {getNavigation(t, user).map((item) => {
              const isActive = isCurrentPath(item.href) ||
                  (item.submenu && item.submenu.some(sub => isCurrentPath(sub.href)))
              const isExpanded = expandedMenu === item.name

              return (
                  <div key={item.name} className="px-2 mb-1">
                    <div
                        onClick={() => {
                          if (item.submenu) {
                            setExpandedMenu(isExpanded ? null : item.name)
                          } else if (item.href) {
                            router.push(item.href)
                          }
                        }}
                        className={`group flex items-center justify-between py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                            isActive
                                ? '-ml-4 mr-0 pl-9 pr-5 bg-green-50 text-gray-900 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-5'
                        }`}
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

                    {/* Submenu */}
                    {!sidebarCollapsed && item.submenu && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="mt-1 ml-4 space-y-1 pb-1">
                            {item.submenu.map((subItem) => {
                              const isSubActive = isCurrentPath(subItem.href)
                              return (
                                  <Link
                                      key={subItem.name}
                                      href={subItem.href}
                                      className={`group flex items-center py-2 pl-11 pr-5 text-sm rounded-lg transition-all duration-200 transform ${
                                          isSubActive
                                              ? 'bg-green-50 text-gray-900 font-medium'
                                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                      } ${isExpanded ? 'translate-x-0' : '-translate-x-2'}`}
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

          {/* Bottom Section */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-3">

            {/* Language Selector */}
            {!sidebarCollapsed && (
                <div className="language-selector-sidebar relative">
                  <button
                      onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                      </svg>
                      <span>{availableLanguages?.find(l => l.code === locale)?.name || 'Nederlands'}</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {languageMenuOpen && (
                      <div className="fixed bottom-20 left-4 right-4 lg:absolute lg:bottom-full lg:left-0 lg:right-auto lg:mb-2 lg:w-full rounded-lg bg-white border border-gray-200 shadow-xl py-1 z-[100]">
                        {availableLanguages?.map(lang => (
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
            )}

            {/* User Menu */}
            <div className="user-menu-sidebar relative border-t border-gray-200 pt-3">
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
                  <div className="fixed bottom-4 left-4 right-4 lg:absolute lg:bottom-full lg:left-0 lg:right-auto lg:mb-2 lg:w-full rounded-lg bg-white border border-gray-200 shadow-xl py-1 z-[100]">
                    <button
                        onClick={() => {
                          router.push('/restaurant/settings?tab=profile')
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <UsersIcon className="h-4 w-4 inline mr-2" />
                      {t('settings.tabs.profile')}
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
          </div>
        </div>

        {/* Mobile Sidebar - Similar structure but with mobile data */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col bg-white border-r border-gray-200`}>
          {/* Mobile close button */}
          <div className="absolute right-0 top-0 p-4">
            <button
                type="button"
                className="transition-colors duration-200 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile header */}
          <div className="border-b border-gray-100">
            <div className="px-6 py-6">
              <Link href="/restaurant/dashboard" className="flex items-center group">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 group-hover:border-green-200 transition-all duration-200 shadow-sm">
                  <img src={restaurantLogo} alt="Restaurant Logo" className="w-full h-full object-cover" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {restaurantName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('layout.restaurantAdmin')}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            {getNavigation(t, user).map((item) => {
              const isActive = item.submenu
                  ? item.submenu.some(sub => isCurrentPath(sub.href))
                  : isCurrentPath(item.href)
              const isExpanded = expandedMenu === item.name

              return (
                  <div key={item.name} className="px-2 mb-1">
                    <div
                        onClick={() => {
                          if (item.submenu) {
                            setExpandedMenu(isExpanded ? null : item.name)
                          } else if (item.href) {
                            router.push(item.href)
                            setSidebarOpen(false)
                          }
                        }}
                        className={`group flex items-center justify-between py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                            isActive
                                ? '-ml-4 mr-0 pl-9 pr-5 bg-green-50 text-gray-900 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-5'
                        }`}
                    >
                      <div className="flex items-center">
                        <div className="w-4 mr-2" />
                        <item.icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                        <span className="ml-3 transition-all duration-200">{item.name}</span>
                      </div>
                      {item.submenu && (
                          <ChevronRightIcon
                              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                              }`}
                          />
                      )}
                    </div>

                    {item.submenu && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="mt-1 ml-4 space-y-1 pb-1">
                            {item.submenu.map((subItem) => {
                              const isSubActive = isCurrentPath(subItem.href)
                              return (
                                  <Link
                                      key={subItem.name}
                                      href={subItem.href}
                                      onClick={() => setSidebarOpen(false)}
                                      className={`group flex items-center py-2 pl-11 pr-5 text-sm rounded-lg transition-all duration-200 transform ${
                                          isSubActive
                                              ? 'bg-green-50 text-gray-900 font-medium'
                                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                      } ${isExpanded ? 'translate-x-0' : '-translate-x-2'}`}
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

          {/* Mobile Bottom Section */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-3">
            <div className="language-selector-sidebar relative">
              <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                  </svg>
                  <span>{availableLanguages?.find(l => l.code === locale)?.name || 'Nederlands'}</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {languageMenuOpen && (
                  <div className="fixed bottom-20 left-4 right-4 rounded-lg bg-white border border-gray-200 shadow-xl py-1 z-[100]">
                    {availableLanguages?.map(lang => (
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

            <div className="user-menu-sidebar relative">
              <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {userProfilePicture ? (
                    <div className="w-10 h-10 mr-3 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0">
                      <img src={userProfilePicture} alt={userName} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-10 h-10 mr-3 rounded-full flex items-center justify-center text-sm font-medium bg-gradient-to-br from-green-500 to-emerald-500 text-white flex-shrink-0">
                      {getInitials(userName)}
                    </div>
                )}
                <div className="flex-1 text-left">
                  <div className="font-semibold truncate">{userName}</div>
                  <div className="text-xs opacity-75">{getRoleDisplay(userRole)}</div>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                  <div className="fixed bottom-4 left-4 right-4 rounded-lg bg-white border border-gray-200 shadow-xl py-1 z-[100]">
                    <button
                        onClick={() => {
                          router.push('/restaurant/settings?tab=profile')
                          setUserMenuOpen(false)
                          setSidebarOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <UsersIcon className="h-4 w-4 inline mr-2" />
                      {t('settings.tabs.profile')}
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                        onClick={() => {
                          logout()
                          setSidebarOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                      {t('nav.logout')}
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bars3Icon className="w-6 h-6" />
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
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
  )
}

export default Layout