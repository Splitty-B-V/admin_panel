'use client'

import { useState, useEffect, ReactNode, MouseEvent, memo, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
    HomeIcon,
    BuildingStorefrontIcon,
    BeakerIcon,
    UsersIcon,
    Cog6ToothIcon,
    XMarkIcon,
    Bars3Icon,
    BellIcon,
    ChevronDownIcon,
    ArrowRightOnRectangleIcon,
    ChevronRightIcon,
    GlobeAltIcon,
    ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'

interface LayoutProps {
    children: ReactNode
}

type UserRole = 'admin' | 'account_manager' | 'support' | 'developer'

interface NavigationItem {
    name: string
    href: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    roles: UserRole[]
    submenu?: SubMenuItem[]
}

interface SubMenuItem {
    name: string
    href: string
    roles: UserRole[]
}

interface ExpandedMenus {
    [key: string]: boolean
}

const SuperAdminLayout: React.FC<LayoutProps> = ({ children }): React.ReactElement => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
    const { t, locale, setLocale, availableLanguages } = useLanguage()
    const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false)
    const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false)
    const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('super-admin-expanded-menus')
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    // If parsing fails, continue with default logic
                }
            }

            const initialExpanded: ExpandedMenus = {}
            const restaurantPaths = ['/admin/restaurants', '/admin/pos', '/admin/payments/payouts']
            if (restaurantPaths.includes(window.location.pathname)) {
                initialExpanded['Restaurants'] = true
            }
            return initialExpanded
        }
        return {}
    })

    const { user, logout, userType } = useAuth()
    const router = useRouter()

    // Redirect restaurant users to their dashboard
    useEffect(() => {
        if (userType === 'restaurant') {
            router.push('/restaurant/dashboard')
        }
    }, [userType, router])

    // Navigation configuration for super admin
    const allNavigation: NavigationItem[] = useMemo(() => [
        { name: t('sidebar.menu.dashboard'), href: '/admin/dashboard', icon: HomeIcon, roles: ['admin', 'account_manager', 'support', 'developer'] },
        {
            name: t('sidebar.menu.restaurants'),
            href: '/admin/restaurants',
            icon: BuildingStorefrontIcon,
            roles: ['admin', 'account_manager'],
            submenu: [
                { name: t('sidebar.menu.allRestaurants'), href: '/admin/restaurants', roles: ['admin', 'account_manager'] },
                { name: t('sidebar.menu.posConnections'), href: '/admin/restaurants/pos', roles: ['admin', 'developer'] },
                { name: t('sidebar.menu.payouts'), href: '/admin/payments/payouts', roles: ['admin'] },
            ]
        },
        { name: t('sidebar.menu.allSplittys'), href: '/admin/orders', icon: ArrowsRightLeftIcon, roles: ['admin', 'account_manager', 'support'] },
        { name: t('sidebar.menu.testOrder'), href: '/admin/test-order', icon: BeakerIcon, roles: ['admin', 'developer'] },
        { name: t('sidebar.menu.splittyTeam'), href: '/admin/users', icon: UsersIcon, roles: ['admin'] },
        { name: t('sidebar.menu.settings'), href: '/admin/settings', icon: Cog6ToothIcon, roles: ['admin', 'account_manager', 'support', 'developer'] },
    ], [t])

    // Determine user role for filtering navigation
    const getCurrentUserRole = (): UserRole => {
        if (user?.is_admin) return 'admin'
        // Add logic for other roles when available
        return 'admin' // fallback
    }

    // Filter navigation based on user role
    const navigation = useMemo(() => {
        const userRole = getCurrentUserRole()

        return allNavigation.filter(item =>
            item.roles && item.roles.includes(userRole)
        ).map(item => {
            if (item.submenu) {
                return {
                    ...item,
                    submenu: item.submenu?.filter(subItem =>
                        subItem.roles && subItem.roles.includes(userRole)
                    )
                }
            }
            return item
        })
    }, [allNavigation, user])

    // Only show for super admin users
    if (userType !== 'super_admin') {
        return <div>Loading...</div>
    }

    const userName = user?.full_name || 'Admin'
    const userRole = 'Super Admin'
    const userAvatar = user?.profile_picture_url

    const getRoleDisplay = (role: string): string => {
        return role
    }

    const getInitials = (name: string): string => {
        if (!name) return 'A'
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const toggleSidebar = (): void => {
        const newState = !sidebarCollapsed
        setSidebarCollapsed(newState)
        localStorage.setItem('super-admin-sidebar-collapsed', newState.toString())
    }

    const toggleSubmenu = (itemHref: string): void => {
        setExpandedMenus(prev => {
            const newState = {
                ...prev,
                [itemHref]: !prev[itemHref]
            }
            localStorage.setItem('super-admin-expanded-menus', JSON.stringify(newState))
            return newState
        })
    }

    const isCurrentPath = (path: string) => {
        if (typeof window === 'undefined') return false
        return window.location.pathname === path
    }

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

        document.addEventListener('mousedown', handleClickOutside as any)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside as any)
        }
    }, [languageMenuOpen, userMenuOpen])

    return (
        <div className="h-screen overflow-hidden flex transition-colors duration-300 bg-[#F9FAFB] text-[#111827]">
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
                {/* Logo */}
                <div className="border-b border-gray-100">
                    <div className="px-6 py-6">
                        <div className="group flex items-center justify-between">
                            {!sidebarCollapsed ? (
                                <>
                                    <Link href="/admin/dashboard" className="flex items-center flex-1">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 group-hover:border-blue-200 transition-all duration-200 shadow-sm flex items-center justify-center">
                                            <Image
                                                src="/favicon-splitty.png"
                                                alt="Splitty Logo"
                                                width={32}
                                                height={32}
                                                priority
                                                className="w-8 h-8 object-contain"
                                            />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                Splitty Admin
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Super Administrator
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={toggleSidebar}
                                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
                                        title="Collapse sidebar"
                                    >
                                        <ChevronRightIcon className="h-4 w-4 rotate-180" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={toggleSidebar}
                                    className="flex items-center justify-center w-full"
                                    title="Expand sidebar"
                                >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-200 transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer">
                                        <Image
                                            src="/favicon-splitty.png"
                                            alt="Splitty Logo"
                                            width={32}
                                            height={32}
                                            priority
                                            className="w-8 h-8 object-contain"
                                        />
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 overflow-y-auto overscroll-none">
                    {navigation.map((item) => {
                        const isActive = (router.pathname === item.href && !item.submenu) ||
                            (item.submenu && item.submenu?.some(sub => router.pathname === sub.href))
                        const isExpanded = expandedMenus[item.href]
                        const hasSubmenu = item.submenu && item.submenu?.length > 0

                        return (
                            <div key={item.href} className="relative mb-1">
                                {hasSubmenu ? (
                                    <div className="px-2">
                                        <button
                                            onClick={() => {
                                                if (sidebarCollapsed) {
                                                    setSidebarCollapsed(false)
                                                    localStorage.setItem('super-admin-sidebar-collapsed', 'false')
                                                    setTimeout(() => {
                                                        toggleSubmenu(item.href)
                                                    }, 100)
                                                } else {
                                                    toggleSubmenu(item.href)
                                                }
                                            }}
                                            className={`
                        w-full group flex items-center justify-between py-3 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                                                isActive && hasSubmenu && item.submenu?.some(sub => router.pathname === sub.href)
                                                    ? '-ml-4 mr-0 pl-9 pr-5 bg-blue-50 text-gray-900 font-medium'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-5'
                                            }
                      `}
                                        >
                                            <div className="flex items-center">
                                                {!sidebarCollapsed && <div className="w-4 mr-2" />}
                                                <item.icon
                                                    className={`h-5 w-5 transition-all duration-200 ${
                                                        isActive && hasSubmenu && item.submenu?.some(sub => router.pathname === sub.href)
                                                            ? 'text-gray-900'
                                                            : 'text-gray-500'
                                                    }`}
                                                />
                                                {!sidebarCollapsed && (
                                                    <span className="ml-3 transition-all duration-200">
                            {item.name}
                          </span>
                                                )}
                                            </div>
                                            {!sidebarCollapsed && (
                                                <ChevronRightIcon
                                                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                                        isExpanded ? 'rotate-90' : ''
                                                    }`}
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="px-2">
                                        <Link
                                            href={item.href}
                                            onClick={() => {
                                                setExpandedMenus({})
                                                localStorage.setItem('super-admin-expanded-menus', JSON.stringify({}))

                                                if (sidebarCollapsed) {
                                                    setSidebarCollapsed(false)
                                                    localStorage.setItem('super-admin-sidebar-collapsed', 'false')
                                                }
                                            }}
                                            className={`
                        group flex items-center py-3 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                                                isActive
                                                    ? '-ml-4 mr-0 pl-9 pr-5 bg-blue-50 text-gray-900 font-medium'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-5'
                                            }
                      `}
                                        >
                                            <div className="flex items-center">
                                                {!sidebarCollapsed && <div className="w-4 mr-2" />}
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
                                )}

                                {/* Submenu */}
                                {hasSubmenu && !sidebarCollapsed && (
                                    <div className={`transition-all duration-300 ease-in-out ${
                                        isExpanded ? 'mt-1' : ''
                                    }`}>
                                        <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                                            isExpanded ? 'max-h-40' : 'max-h-0'
                                        }`}>
                                            {item.submenu && item.submenu?.map((subItem) => {
                                                const isSubActive = router.pathname === subItem.href
                                                return (
                                                    <div key={subItem.href} className="px-2 mb-1">
                                                        <Link
                                                            href={subItem.href}
                                                            className={`
                                group flex items-center py-3 text-sm font-medium rounded-lg transition-all duration-200
                                ${
                                                                isSubActive
                                                                    ? '-ml-4 mr-0 pl-9 pr-5 bg-blue-50 text-gray-900 font-medium'
                                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-5'
                                                            }
                              `}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="w-4 mr-2" />
                                                                <div className="w-5" />
                                                            </div>
                                                            <span className="flex-1 ml-3">
                                {subItem.name}
                              </span>
                                                        </Link>
                                                    </div>
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
                    {/* Notifications */}
                    <button
                        onClick={() => {
                            router.push('/admin/settings?tab=notifications')
                            if (sidebarCollapsed) {
                                setSidebarCollapsed(false)
                                localStorage.setItem('super-admin-sidebar-collapsed', 'false')
                            }
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <div className="flex items-center">
                            <BellIcon className="h-5 w-5 mr-3 text-gray-500" />
                            {!sidebarCollapsed && <span>Notifications</span>}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center bg-blue-500 text-white">
                                3
                            </div>
                        )}
                    </button>

                    {/* Language Selector */}
                    {!sidebarCollapsed && (
                        <div className="relative language-selector-sidebar">
                            <button
                                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <GlobeAltIcon className="h-5 w-5 mr-3 text-gray-500" />
                                    <span>{availableLanguages?.find(l => l.code === locale)?.name || 'English'}</span>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {languageMenuOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg py-1">
                                    {availableLanguages?.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLocale(lang.code)
                                                setLanguageMenuOpen(false)
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2 ${
                                                locale === lang.code
                                                    ? 'text-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-500" />
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
                            onClick={() => {
                                if (sidebarCollapsed) {
                                    setSidebarCollapsed(false)
                                    localStorage.setItem('super-admin-sidebar-collapsed', 'false')
                                } else {
                                    setUserMenuOpen(!userMenuOpen)
                                }
                            }}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 group bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100`}
                        >
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'} rounded-full object-cover border-2 border-gray-200 flex-shrink-0`}
                                />
                            ) : (
                                <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'} rounded-full flex items-center justify-center text-sm font-medium bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex-shrink-0`}>
                                    {getInitials(userName)}
                                </div>
                            )}
                            {!sidebarCollapsed && (
                                <>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold truncate">{userName}</div>
                                        <div className="text-xs opacity-75">{userRole}</div>
                                    </div>
                                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        {userMenuOpen && !sidebarCollapsed && (
                            <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg py-1">
                                <button
                                    onClick={() => {
                                        router.push('/admin/settings?tab=profile')
                                        setUserMenuOpen(false)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <UsersIcon className="h-4 w-4 inline mr-2" />
                                    My Profile
                                </button>
                                <button
                                    onClick={() => {
                                        router.push('/admin/settings')
                                        setUserMenuOpen(false)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
                                    Settings
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${
                    sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
                }`}
            >
                {/* Mobile Header */}
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
                                <Image
                                    src="/logo-trans.webp"
                                    alt="Splitty"
                                    width={100}
                                    height={35}
                                    className="h-[35px] w-auto"
                                />
                            </div>
                            <div className="flex items-center">
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                        {getInitials(userName)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto overscroll-none transition-colors duration-300 lg:pt-0 pt-[72px] bg-[#F9FAFB]">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default SuperAdminLayout