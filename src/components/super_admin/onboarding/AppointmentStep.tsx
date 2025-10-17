'use client'

import { useState, useEffect } from 'react'
import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ClockIcon,
    UserIcon,
    EnvelopeIcon,
    LinkIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

interface AppointmentStepProps {
    restaurantId: number
    restaurant?: any
    onNext: () => void
    onSkip: () => void
    saving?: boolean
    API_BASE_URL: string
}

interface GoogleCalendarStatus {
    connected: boolean
    calendar_id?: string
    last_sync_at?: string
}

interface AppointmentData {
    selected_datetime: string
    timezone: string
    notes: string
    google_event_id?: string
    google_event_link?: string
}

const AppointmentStep: React.FC<AppointmentStepProps> = ({
                                                             restaurantId,
                                                             restaurant,
                                                             onNext,
                                                             onSkip,
                                                             saving = false,
                                                             API_BASE_URL
                                                         }) => {
    const { t } = useLanguage()

    // States
    const [googleCalendarStatus, setGoogleCalendarStatus] = useState<GoogleCalendarStatus | null>(null)
    const [connectingCalendar, setConnectingCalendar] = useState(false)
    const [appointmentData, setAppointmentData] = useState<AppointmentData>({
        selected_datetime: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Автоматически определяем timezone
        notes: ''
    })
    const [appointmentErrors, setAppointmentErrors] = useState({
        datetime: '',
        general: ''
    })
    const [creatingAppointment, setCreatingAppointment] = useState(false)
    const [appointmentCreated, setAppointmentCreated] = useState(false)

    // Load Google Calendar status on mount
    useEffect(() => {
        checkGoogleCalendarStatus()
    }, [])

    const checkGoogleCalendarStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/super_admin/auth/google-calendar/status`, {
                headers: getAuthHeaders()
            })

            if (response.status === 401) {
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')
                window.location.href = '/login'
                return
            }

            if (response.ok) {
                const status = await response.json()
                setGoogleCalendarStatus(status)
            }
        } catch (error) {
            console.error('Failed to check Google Calendar status:', error)
        }
    }

    const handleConnectGoogleCalendar = async () => {
        try {
            setConnectingCalendar(true)
            setAppointmentErrors(prev => ({ ...prev, general: '' }))

            const response = await fetch(`${API_BASE_URL}/super_admin/auth/google-calendar/connect`, {
                headers: getAuthHeaders()
            })

            if (response.status === 401) {
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')
                window.location.href = '/login'
                return
            }

            if (response.ok) {
                const data = await response.json()
                if (data.authorization_url) {
                    // Redirect to Google OAuth
                    window.location.href = data.authorization_url
                }
            } else {
                setAppointmentErrors(prev => ({
                    ...prev,
                    general: t('onboarding.appointment.errors.connectCalendar')
                }))
            }
        } catch (error) {
            setAppointmentErrors(prev => ({
                ...prev,
                general: t('onboarding.appointment.errors.connectCalendar')
            }))
        } finally {
            setConnectingCalendar(false)
        }
    }

    const validateAppointment = () => {
        const errors = {
            datetime: '',
            general: ''
        }

        let hasErrors = false

        if (!appointmentData.selected_datetime) {
            errors.datetime = t('onboarding.appointment.validation.datetimeRequired')
            hasErrors = true
        } else {
            // Check if datetime is in the future
            const selectedDate = new Date(appointmentData.selected_datetime)
            const now = new Date()
            if (selectedDate <= now) {
                errors.datetime = t('onboarding.appointment.validation.futureDateRequired')
                hasErrors = true
            }
        }

        if (!googleCalendarStatus?.connected) {
            errors.general = t('onboarding.appointment.validation.calendarRequired')
            hasErrors = true
        }

        setAppointmentErrors(errors)
        return !hasErrors
    }

    const handleCreateAppointment = async () => {
        if (!validateAppointment()) {
            return
        }

        try {
            setCreatingAppointment(true)
            setAppointmentErrors({ datetime: '', general: '' })

            const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/appointments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    selected_datetime: appointmentData.selected_datetime,
                    timezone: appointmentData.timezone,
                    notes: appointmentData.notes
                })
            })

            if (response.status === 401) {
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')
                window.location.href = '/login'
                return
            }

            if (response.ok) {
                const result = await response.json()
                setAppointmentData(prev => ({
                    ...prev,
                    google_event_id: result.google_event_id,
                    google_event_link: result.google_event_link
                }))
                setAppointmentCreated(true)
            } else {
                const errorData = await response.json()
                setAppointmentErrors(prev => ({
                    ...prev,
                    general: errorData.message || t('onboarding.appointment.errors.createAppointment')
                }))
            }
        } catch (error) {
            setAppointmentErrors(prev => ({
                ...prev,
                general: t('onboarding.appointment.errors.createAppointment')
            }))
        } finally {
            setCreatingAppointment(false)
        }
    }

    // Get minimum datetime (current time + 1 hour)
    const getMinDateTime = () => {
        const now = new Date()
        now.setHours(now.getHours() + 1)
        return now.toISOString().slice(0, 16)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {t('onboarding.appointment.title')}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.appointment.subtitle', { restaurant: restaurant?.name })}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                {/* Error Display */}
                {appointmentErrors.general && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{appointmentErrors.general}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Google Calendar Integration */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h4 className="text-base font-medium text-gray-900 mb-3">
                            {t('onboarding.appointment.googleCalendar.title')}
                        </h4>

                        {googleCalendarStatus?.connected ? (
                            <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                                <div className="flex items-center mb-2">
                                    <CheckCircleIcon className="h-5 w-5 text-[#2BE89A] mr-3" />
                                    <h5 className="text-sm font-medium text-gray-900">
                                        {t('onboarding.appointment.googleCalendar.connected')}
                                    </h5>
                                </div>
                                <p className="text-xs text-gray-600">
                                    {t('onboarding.appointment.googleCalendar.connectedDescription')}
                                </p>
                                {googleCalendarStatus.last_sync_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('onboarding.appointment.googleCalendar.lastSync')}: {' '}
                                        {new Date(googleCalendarStatus.last_sync_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    {t('onboarding.appointment.googleCalendar.description')}
                                </p>
                                <button
                                    onClick={handleConnectGoogleCalendar}
                                    disabled={connectingCalendar}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                                >
                                    {connectingCalendar ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                            {t('onboarding.appointment.googleCalendar.connecting')}
                                        </>
                                    ) : (
                                        <>
                                            <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                            {t('onboarding.appointment.googleCalendar.connect')}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Appointment Form */}
                    {googleCalendarStatus?.connected && !appointmentCreated && (
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <h4 className="text-base font-medium text-gray-900 mb-4">
                                {t('onboarding.appointment.schedule.title')}
                            </h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('onboarding.appointment.schedule.datetime')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={appointmentData.selected_datetime}
                                        onChange={(e) => {
                                            setAppointmentData(prev => ({ ...prev, selected_datetime: e.target.value }))
                                            setAppointmentErrors(prev => ({ ...prev, datetime: '' }))
                                        }}
                                        min={getMinDateTime()}
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent ${
                                            appointmentErrors.datetime
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 focus:ring-[#2BE89A]'
                                        }`}
                                    />
                                    {appointmentErrors.datetime && (
                                        <div className="mt-1 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                            <p className="text-sm text-red-600">{appointmentErrors.datetime}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('onboarding.appointment.schedule.notes')}
                                    </label>
                                    <textarea
                                        value={appointmentData.notes}
                                        onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder={t('onboarding.appointment.schedule.notesPlaceholder')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2BE89A] focus:border-transparent resize-none"
                                        rows={3}
                                    />
                                </div>

                                <button
                                    onClick={handleCreateAppointment}
                                    disabled={creatingAppointment || !appointmentData.selected_datetime}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                                >
                                    {creatingAppointment ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                            {t('onboarding.appointment.schedule.creating')}
                                        </>
                                    ) : (
                                        <>
                                            <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                            {t('onboarding.appointment.schedule.create')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Appointment Created Success */}
                    {appointmentCreated && (
                        <div className="bg-[#2BE89A]/5 rounded-lg p-5 border border-[#2BE89A]/20">
                            <div className="flex items-center mb-4">
                                <CheckCircleIcon className="h-6 w-6 text-[#2BE89A] mr-3" />
                                <h4 className="text-base font-medium text-gray-900">
                                    {t('onboarding.appointment.success.title')}
                                </h4>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-700">
                                    <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>
                                        {new Date(appointmentData.selected_datetime).toLocaleString()}
                                    </span>
                                </div>

                                {appointmentData.google_event_link && (
                                    <div className="flex items-center">
                                        <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        <a
                                            href={appointmentData.google_event_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#2BE89A] hover:text-[#2BE89A]/80 underline"
                                        >
                                            {t('onboarding.appointment.success.viewInCalendar')}
                                        </a>
                                    </div>
                                )}

                                <p className="text-sm text-gray-600">
                                    {t('onboarding.appointment.success.description')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                        <p className="text-sm text-gray-700">
                            <span className="text-[#2BE89A] font-medium">
                                {t('onboarding.common.tip')}
                            </span>{' '}
                            {t('onboarding.appointment.tip')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onSkip}
                    disabled={saving}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    {t('onboarding.common.skipStep')}
                </button>

                <button
                    onClick={onNext}
                    disabled={saving || (!appointmentCreated && googleCalendarStatus?.connected)}
                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {saving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
                </button>
            </div>
        </div>
    )
}

export default AppointmentStep