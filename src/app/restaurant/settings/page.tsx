'use client'

import { useState, useEffect, JSX } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import * as settingsApi from '@/lib/api'
import {
    BuildingStorefrontIcon,
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon,
    PhotoIcon,
    CheckIcon,
    XMarkIcon,
    ChevronDownIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

// Types and Interfaces
interface PasswordForm {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

interface Tab {
    id: string
    name: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type TabId = 'profile' | 'general' | 'notifications' | 'security'

// TabContent component moved outside to prevent recreation on every render
const TabContent = ({
                        activeTab,
                        userProfile,
                        setUserProfile,
                        restaurantSettings,
                        setRestaurantSettings,
                        notificationSettings,
                        setNotificationSettings,
                        telegramSettings,
                        setTelegramSettings,
                        previewProfilePic,
                        previewLogo,
                        previewBanner,
                        saving,
                        t,
                        locale,
                        handleProfilePicFile,
                        handleLogoFile,
                        handleBannerFile,
                        handleTestNotification,
                        setShowPasswordModal
                    }: {
    activeTab: TabId
    userProfile: settingsApi.UserProfile | null
    setUserProfile: (profile: settingsApi.UserProfile) => void
    restaurantSettings: settingsApi.RestaurantSettings | null
    setRestaurantSettings: (settings: settingsApi.RestaurantSettings) => void
    notificationSettings: settingsApi.NotificationSettings | null
    setNotificationSettings: (settings: settingsApi.NotificationSettings) => void
    telegramSettings: settingsApi.TelegramSettings | null
    setTelegramSettings: (settings: settingsApi.TelegramSettings) => void
    previewProfilePic: string | null
    previewLogo: string | null
    previewBanner: string | null
    saving: boolean
    t: (key: string) => string
    locale: string
    handleProfilePicFile: (file: File | null) => Promise<void>
    handleLogoFile: (file: File | null) => Promise<void>
    handleBannerFile: (file: File | null) => Promise<void>
    handleTestNotification: () => Promise<void>
    setShowPasswordModal: (show: boolean) => void
}): JSX.Element | null => {
    switch (activeTab) {
        case 'profile':
            if (!userProfile) return null

            return (
                <div className="space-y-6">
                    {/* Profile Picture and Basic Info */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.profile.personalInfo')}</h3>

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
                                            onChange={(e) => handleProfilePicFile(e.target.files?.[0] || null)}
                                            disabled={saving}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.firstName')}</label>
                                    <input
                                        type="text"
                                        value={userProfile.first_name}
                                        onChange={(e) => setUserProfile({
                                            ...userProfile,
                                            first_name: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={saving}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.lastName')}</label>
                                    <input
                                        type="text"
                                        value={userProfile.last_name}
                                        onChange={(e) => setUserProfile({
                                            ...userProfile,
                                            last_name: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={saving}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.email')}</label>
                                    <input
                                        type="email"
                                        value={userProfile.email}
                                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={saving}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.phone')}</label>
                                    <input
                                        type="tel"
                                        value={userProfile.phone || ''}
                                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value || null })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={saving}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.role')}</label>
                                    <input
                                        type="text"
                                        value={t('layout.roles.manager')}
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
                                        {userProfile.created_at
                                            ? new Date(userProfile.created_at).toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                            })
                                            : '-'
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{t('settings.profile.lastLogin')}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                    {userProfile.last_login_at
                                        ? (() => {
                                            const lastLogin = new Date(userProfile.last_login_at);
                                            const today = new Date();
                                            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                                            // Сравниваем даты в локальном времени пользователя
                                            const lastLoginLocal = new Date(lastLogin.toLocaleString('en-US', { timeZone: userTimeZone }));
                                            const todayLocal = new Date(today.toLocaleString('en-US', { timeZone: userTimeZone }));
                                            const isToday = lastLoginLocal.toDateString() === todayLocal.toDateString();

                                            if (isToday) {
                                                return `${locale === 'nl' ? 'Vandaag' : 'Today'}, ${lastLogin.toLocaleTimeString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZone: userTimeZone
                                                })}`;
                                            } else {
                                                return lastLogin.toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    timeZone: userTimeZone
                                                }) + ', ' + lastLogin.toLocaleTimeString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZone: userTimeZone
                                                });
                                            }
                                        })()
                                        : '-'
                                    }
                                </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )

        case 'general':
            if (!restaurantSettings) return null

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
                                                onChange={(e) => handleLogoFile(e.target.files?.[0] || null)}
                                                disabled={saving}
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
                                            onChange={(e) => handleLogoFile(e.target.files?.[0] || null)}
                                            disabled={saving}
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
                                                onChange={(e) => handleBannerFile(e.target.files?.[0] || null)}
                                                disabled={saving}
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
                                            onChange={(e) => handleBannerFile(e.target.files?.[0] || null)}
                                            disabled={saving}
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
                                    value={restaurantSettings.name}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('settings.profile.phone')}
                                </label>
                                <input
                                    type="tel"
                                    value={restaurantSettings.contact_phone || ''}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, contact_phone: e.target.value || null })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('settings.profile.email')}
                                </label>
                                <input
                                    type="email"
                                    value={restaurantSettings.contact_email}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, contact_email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
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
                                    value={restaurantSettings.address}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('settings.general.postalCode')}
                                </label>
                                <input
                                    type="text"
                                    value={restaurantSettings.postal_code}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, postal_code: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('settings.general.city')}
                                </label>
                                <input
                                    type="text"
                                    value={restaurantSettings.city}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
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
                                    value={restaurantSettings.kvk_number || ''}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, kvk_number: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('settings.general.vatNumber')}
                                </label>
                                <input
                                    type="text"
                                    value={restaurantSettings.vat_number || ''}
                                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, vat_number: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={saving}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )

        case 'notifications':
            if (!notificationSettings || !telegramSettings) return null

            return (
                <div className="space-y-8">
                    {/* Telegram Notifications */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.notifications.telegram.title')}</h3>

                        {/* Connection Status */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${
                                        telegramSettings.is_connected ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {telegramSettings.is_connected
                                                ? t('settings.notifications.telegram.connected')
                                                : t('settings.notifications.telegram.disconnected')
                                            }
                                        </p>
                                        {telegramSettings.is_connected && telegramSettings.group_name && (
                                            <p className="text-sm text-gray-600">
                                                {t('settings.notifications.telegram.groupName')}: {telegramSettings.group_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {telegramSettings.is_connected && (
                                    <button
                                        onClick={handleTestNotification}
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition flex items-center disabled:opacity-50"
                                    >
                                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                                        {t('settings.notifications.telegram.testNotification')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {telegramSettings.is_connected ? (
                            <div className="space-y-6">
                                {/* Language Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('settings.notifications.telegram.language')}
                                    </label>
                                    <select
                                        value={telegramSettings.notification_language}
                                        onChange={(e) => setTelegramSettings({
                                            ...telegramSettings,
                                            notification_language: e.target.value
                                        })}
                                        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={saving}
                                    >
                                        <option value="en">English</option>
                                        <option value="nl">Nederlands</option>
                                        <option value="de">Deutsch</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    {t('settings.notifications.telegram.notConnected')}
                                </h4>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    {t('settings.notifications.telegram.contactSupport')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* System Notifications */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.notifications.system.title')}</h3>
                        <div className="space-y-4">
                            {/* New Orders */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {t('settings.notifications.telegram.orderCompleted')}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {t('settings.notifications.telegram.orderCompletedDesc')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotificationSettings({
                                        ...notificationSettings,
                                        new_orders: !notificationSettings.new_orders
                                    })}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                        notificationSettings.new_orders ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            notificationSettings.new_orders ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Payment Received */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {t('settings.notifications.telegram.paymentReceived')}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {t('settings.notifications.telegram.paymentReceivedDesc')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotificationSettings({
                                        ...notificationSettings,
                                        payment_received: !notificationSettings.payment_received
                                    })}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                        notificationSettings.payment_received ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            notificationSettings.payment_received ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Daily Summary */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {t('settings.notifications.telegram.dailySummary')}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {t('settings.notifications.telegram.dailySummaryDesc')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotificationSettings({
                                        ...notificationSettings,
                                        daily_summary: !notificationSettings.daily_summary
                                    })}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                        notificationSettings.daily_summary ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            notificationSettings.daily_summary ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Weekly Report */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {t('settings.notifications.telegram.weeklyReport')}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {t('settings.notifications.telegram.weeklyReportDesc')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotificationSettings({
                                        ...notificationSettings,
                                        weekly_report: !notificationSettings.weekly_report
                                    })}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                        notificationSettings.weekly_report ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            notificationSettings.weekly_report ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
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

const Settings: React.FC = () => {
    const { user, updateRestaurantData } = useAuth()
    const { t, locale } = useLanguage()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabId>('profile')
    const [saved, setSaved] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [saving, setSaving] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

    // API Data states
    const [userProfile, setUserProfile] = useState<settingsApi.UserProfile | null>(null)
    const [restaurantSettings, setRestaurantSettings] = useState<settingsApi.RestaurantSettings | null>(null)
    const [notificationSettings, setNotificationSettings] = useState<settingsApi.NotificationSettings | null>(null)
    const [telegramSettings, setTelegramSettings] = useState<settingsApi.TelegramSettings | null>(null)

    // Preview states for file uploads
    const [previewProfilePic, setPreviewProfilePic] = useState<string | null>(null)
    const [previewLogo, setPreviewLogo] = useState<string | null>(null)
    const [previewBanner, setPreviewBanner] = useState<string | null>(null)

    // Password change modal
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false)
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

    // Role-based tabs
    const getAllTabs = (): Tab[] => [
        { id: 'profile', name: t('settings.tabs.profile'), icon: UserCircleIcon },
        { id: 'general', name: t('settings.tabs.general'), icon: BuildingStorefrontIcon },
        { id: 'notifications', name: t('settings.tabs.notifications'), icon: BellIcon },
        { id: 'security', name: t('settings.tabs.security'), icon: ShieldCheckIcon },
    ]

    const getAvailableTabs = (): Tab[] => {
        const allTabs = getAllTabs()
        if (user?.is_restaurant_admin) {
            return allTabs
        } else {
            // For restaurant_staff, only show profile and security
            return allTabs.filter(tab => tab.id === 'profile' || tab.id === 'security')
        }
    }

    const tabs = getAvailableTabs()

    // Load data on mount
    useEffect(() => {
        loadData()
    }, [])

    // Check if current tab is available for user role
    useEffect(() => {
        const availableTabs = getAvailableTabs()
        const currentTabAvailable = availableTabs.some(tab => tab.id === activeTab)

        if (!currentTabAvailable) {
            setActiveTab('profile') // Default to profile if current tab is not available
        }
    }, [user?.is_restaurant_admin, activeTab])

    const loadData = async () => {
        setLoading(true)
        setError(null)

        try {
            // Always load user profile
            const profileData = await settingsApi.getUserProfile()
            setUserProfile(profileData)

            // Set preview image for profile
            if (profileData.profile_picture_url) {
                setPreviewProfilePic(profileData.profile_picture_url)
            }

            // Load additional data only for admins
            if (user?.is_restaurant_admin) {
                const [restaurantData, notificationsData, telegramData] = await Promise.all([
                    settingsApi.getRestaurantSettings(),
                    settingsApi.getNotificationSettings(),
                    settingsApi.getTelegramSettings()
                ])

                setRestaurantSettings(restaurantData)
                setNotificationSettings(notificationsData)
                setTelegramSettings(telegramData)

                // Set preview images for restaurant
                if (restaurantData.logo_url) {
                    setPreviewLogo(restaurantData.logo_url)
                }
                if (restaurantData.banner_url) {
                    setPreviewBanner(restaurantData.banner_url)
                }
            }

        } catch (err: any) {
            console.error('Error loading settings:', err)
            setError(err.message || 'Failed to load settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (): Promise<void> => {
        if (!userProfile) return

        setSaving(true)
        setError(null)

        try {
            if (activeTab === 'profile') {
                const updatedProfile = await settingsApi.updateUserProfile({
                    first_name: userProfile.first_name,
                    last_name: userProfile.last_name,
                    email: userProfile.email,
                    phone: userProfile.phone
                })
                setUserProfile(updatedProfile)
            }

            // Only admins can save general and notification settings
            if (user?.is_restaurant_admin) {
                if (activeTab === 'general' && restaurantSettings) {
                    const updatedRestaurant = await settingsApi.updateRestaurantSettings({
                        name: restaurantSettings.name,
                        address: restaurantSettings.address,
                        city: restaurantSettings.city,
                        postal_code: restaurantSettings.postal_code,
                        country: restaurantSettings.country,
                        contact_email: restaurantSettings.contact_email,
                        contact_phone: restaurantSettings.contact_phone,
                        kvk_number: restaurantSettings.kvk_number,
                        vat_number: restaurantSettings.vat_number
                    })
                    setRestaurantSettings(updatedRestaurant)

                    // Update restaurant data in AuthContext for immediate UI update
                    updateRestaurantData({
                        name: updatedRestaurant.name,
                        logo_url: updatedRestaurant.logo_url
                    })
                }

                if (activeTab === 'notifications' && notificationSettings) {
                    const updatedNotifications = await settingsApi.updateNotificationSettings(notificationSettings)
                    setNotificationSettings(updatedNotifications)

                    if (telegramSettings) {
                        const updatedTelegram = await settingsApi.updateTelegramSettings({
                            notification_language: telegramSettings.notification_language
                        })
                        setTelegramSettings(updatedTelegram)
                    }
                }
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)

        } catch (err: any) {
            console.error('Error saving settings:', err)
            setError(err.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const handleProfilePicFile = async (file: File | null): Promise<void> => {
        if (!file) return

        try {
            setSaving(true)
            const result = await settingsApi.uploadProfileAvatar(file)
            setPreviewProfilePic(result.url)

            if (userProfile) {
                setUserProfile({ ...userProfile, profile_picture_url: result.url })
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            console.error('Error uploading avatar:', err)
            setError(err.message || 'Failed to upload avatar')
        } finally {
            setSaving(false)
        }
    }

    const handleLogoFile = async (file: File | null): Promise<void> => {
        if (!file || !user?.is_restaurant_admin) return

        try {
            setSaving(true)
            const result = await settingsApi.uploadRestaurantLogo(file)
            setPreviewLogo(result.url)

            if (restaurantSettings) {
                setRestaurantSettings({ ...restaurantSettings, logo_url: result.url })
            }

            // Update restaurant logo in AuthContext immediately
            updateRestaurantData({ logo_url: result.url })

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            console.error('Error uploading logo:', err)
            setError(err.message || 'Failed to upload logo')
        } finally {
            setSaving(false)
        }
    }

    const handleBannerFile = async (file: File | null): Promise<void> => {
        if (!file || !user?.is_restaurant_admin) return

        try {
            setSaving(true)
            const result = await settingsApi.uploadRestaurantBanner(file)
            setPreviewBanner(result.url)

            if (restaurantSettings) {
                setRestaurantSettings({ ...restaurantSettings, banner_url: result.url })
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            console.error('Error uploading banner:', err)
            setError(err.message || 'Failed to upload banner')
        } finally {
            setSaving(false)
        }
    }

    const handleTestNotification = async (): Promise<void> => {
        if (!user?.is_restaurant_admin) return

        try {
            setSaving(true)
            await settingsApi.sendTestTelegramNotification()
        } catch (err: any) {
            console.error('Error sending test notification:', err)
            setError(err.message || 'Failed to send test notification')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async (): Promise<void> => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            setSaving(true)
            await settingsApi.changePassword({
                current_password: passwordForm.currentPassword,
                new_password: passwordForm.newPassword,
                confirm_password: passwordForm.confirmPassword
            })

            setShowPasswordModal(false)
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            console.error('Error changing password:', err)
            setError(err.message || 'Failed to change password')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <SmartLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                        <p className="mt-4 text-gray-600">Loading settings...</p>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    return (
        <SmartLayout>
            <div className="min-h-screen bg-gray-50 w-full overflow-x-auto">
                {/* Error Display */}
                {error && (
                    <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                            <span className="text-red-800">{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

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

                {/* Mobile Layout (<1024px) */}
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
                                                const Icon = tabs.find(tab => tab.id === activeTab)!.icon
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
                                                setActiveTab(tab.id as TabId)
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
                                <TabContent
                                    activeTab={activeTab}
                                    userProfile={userProfile}
                                    setUserProfile={setUserProfile}
                                    restaurantSettings={restaurantSettings}
                                    setRestaurantSettings={setRestaurantSettings}
                                    notificationSettings={notificationSettings}
                                    setNotificationSettings={setNotificationSettings}
                                    telegramSettings={telegramSettings}
                                    setTelegramSettings={setTelegramSettings}
                                    previewProfilePic={previewProfilePic}
                                    previewLogo={previewLogo}
                                    previewBanner={previewBanner}
                                    saving={saving}
                                    t={t}
                                    locale={locale}
                                    handleProfilePicFile={handleProfilePicFile}
                                    handleLogoFile={handleLogoFile}
                                    handleBannerFile={handleBannerFile}
                                    handleTestNotification={handleTestNotification}
                                    setShowPasswordModal={setShowPasswordModal}
                                />
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
                                    disabled={saving}
                                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : t('settings.saveChanges')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout (1024px+) */}
                <div className="hidden lg:block">
                    <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
                        <div className="bg-white rounded-xl border border-gray-200 mb-6">
                            {/* Tabs inside card */}
                            <div className="border-b border-gray-200">
                                <nav className="flex">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as TabId)}
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
                                <TabContent
                                    activeTab={activeTab}
                                    userProfile={userProfile}
                                    setUserProfile={setUserProfile}
                                    restaurantSettings={restaurantSettings}
                                    setRestaurantSettings={setRestaurantSettings}
                                    notificationSettings={notificationSettings}
                                    setNotificationSettings={setNotificationSettings}
                                    telegramSettings={telegramSettings}
                                    setTelegramSettings={setTelegramSettings}
                                    previewProfilePic={previewProfilePic}
                                    previewLogo={previewLogo}
                                    previewBanner={previewBanner}
                                    saving={saving}
                                    t={t}
                                    locale={locale}
                                    handleProfilePicFile={handleProfilePicFile}
                                    handleLogoFile={handleLogoFile}
                                    handleBannerFile={handleBannerFile}
                                    handleTestNotification={handleTestNotification}
                                    setShowPasswordModal={setShowPasswordModal}
                                />
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
                                    disabled={saving}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : t('settings.saveChanges')}
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
                                    onClick={handlePasswordChange}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                                >
                                    {saving ? 'Updating...' : t('settings.security.updatePassword')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SmartLayout>
    )
}

export default Settings