'use client'

import { useState, useEffect } from 'react'
import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ClockIcon,
    LinkIcon,
    PlusIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import EmailTemplateEditor from '@/components/super_admin/onboarding/EmailTemplateEditor'

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

interface Appointment {
    id: number
    selected_datetime: string
    notes: string
    google_event_id: string | null
    google_event_link: string | null
    created_at: string
    created_by: number
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
    const [initialLoading, setInitialLoading] = useState(true)
    const [googleCalendarStatus, setGoogleCalendarStatus] = useState<GoogleCalendarStatus | null>(null)
    const [connectingCalendar, setConnectingCalendar] = useState(false)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [showEmailEditor, setShowEmailEditor] = useState(false)
    const [appointmentData, setAppointmentData] = useState<AppointmentData>({
        selected_datetime: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: ''
    })
    const [appointmentErrors, setAppointmentErrors] = useState({
        datetime: '',
        general: ''
    })

    // Load data on mount
    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        setInitialLoading(true)
        await Promise.all([
            checkGoogleCalendarStatus(),
            loadAppointments()
        ])
        setInitialLoading(false)
    }

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

    const loadAppointments = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/appointments`,
                { headers: getAuthHeaders() }
            )

            if (response.ok) {
                const data = await response.json()
                setAppointments(data.appointments || [])
            }
        } catch (error) {
            console.error('Failed to load appointments:', error)
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

    const handleEmailSent = () => {
        setShowEmailEditor(false)
        loadAppointments()
    }

    const handleAppointmentDataChange = (data: Partial<AppointmentData>) => {
        setAppointmentData(prev => ({ ...prev, ...data }))
    }

    const handleResendEmail = () => {
        setShowEmailEditor(true)
        setAppointmentData({
            selected_datetime: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notes: ''
        })
    }

    const formatDateTime = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return isoString
        }
    }

    // Loading state
    if (initialLoading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Calendar Status Skeleton */}
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <div className="h-5 bg-gray-200 rounded w-48 mb-3 animate-pulse"></div>
                            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <div className="h-5 bg-gray-200 rounded w-56 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
            </div>
        )
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

                    {/* Sent Appointments List */}
                    {appointments.length > 0 && !showEmailEditor && (
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-medium text-gray-900">
                                    {t('onboarding.appointment.sentEmails.title')}
                                </h4>
                                {googleCalendarStatus?.connected && (
                                    <button
                                        onClick={handleResendEmail}
                                        className="inline-flex items-center px-3 py-1.5 bg-[#2BE89A] text-black text-sm font-medium rounded-md hover:bg-[#2BE89A]/90 transition"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        {t('onboarding.appointment.sentEmails.resendEmail')}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="bg-white rounded-lg p-4 border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatDateTime(appointment.selected_datetime)}
                                                    </span>
                                                </div>

                                                {appointment.notes && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {appointment.notes}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    {appointment.google_event_link && (
                                                        <a
                                                            href={appointment.google_event_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-[#2BE89A] hover:text-[#2BE89A]/80 flex items-center"
                                                        >
                                                            <LinkIcon className="h-3 w-3 mr-1" />
                                                            {t('onboarding.appointment.sentEmails.viewInCalendar')}
                                                        </a>
                                                    )}

                                                    <span className="text-xs text-gray-500">
                                                        {t('onboarding.appointment.sentEmails.sent')}: {formatDateTime(appointment.created_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="ml-4">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircleIcon className="h-5 w-5 text-[#2BE89A]" />
                                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Email Template Editor */}
                    {googleCalendarStatus?.connected && (showEmailEditor || appointments.length === 0) && (
                        <EmailTemplateEditor
                            restaurantId={restaurantId}
                            restaurant={restaurant}
                            appointmentData={appointmentData}
                            API_BASE_URL={API_BASE_URL}
                            onEmailSent={handleEmailSent}
                            onAppointmentDataChange={handleAppointmentDataChange}
                        />
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
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {saving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
                </button>
            </div>
        </div>
    )
}

export default AppointmentStep