'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
    CalendarDaysIcon,
    UserGroupIcon,
    CreditCardIcon,
    WifiIcon,
    StarIcon,
    QrCodeIcon,
    ChevronLeftIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import {env} from "@/lib/env"
import SmartLayout from "@/components/common/SmartLayout"
import { useLanguage } from '@/contexts/LanguageContext'
import AppointmentStep from '@/components/super_admin/onboarding/AppointmentStep'
import SummaryStep from '@/components/super_admin/onboarding/SummaryStep'
import OnboardingSidebar from '@/components/super_admin/onboarding/OnboardingSidebar'
import WelcomeScreen from "@/components/super_admin/onboarding/WelcomeScreen"
import PersonnelStep from "@/components/super_admin/onboarding/PersonnelStep"
import StripeStep from "@/components/super_admin/onboarding/StripeStep"
import POSStep from "@/components/super_admin/onboarding/POSStep"
import QRStandsStep from "@/components/super_admin/onboarding/QRStandsStep"
import GoogleReviewsStep from "@/components/super_admin/onboarding/GoogleReviewsStep"
import TelegramStep from "@/components/super_admin/onboarding/TelegramStep"

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

const API_BASE_URL = `http://${env.apiUrl}/${env.apiVersion}`

// Unified API request handler
async function apiRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    })

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Unauthorized')
    }

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
}

// API Functions
async function getRestaurantDetail(restaurantId: number) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}`)
}

async function getRestaurantOnboardingProgress(restaurantId: number) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/progress`)
}

interface OnboardingStep {
    id: number
    name: string
    description: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type StepStatus = 'completed' | 'current' | 'available' | 'locked'

export default function SuperAdminOnboardingPage() {
    const { t } = useLanguage()
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const restaurantId = parseInt(params.id as string)

    useEffect(() => {
        document.title = 'Admin Panel - Splitty'
    }, [])

    const OnboardingSteps: OnboardingStep[] = [
        {
            id: 1,
            name: t('onboarding.steps.appointment.name'),
            description: t('onboarding.steps.appointment.description'),
            icon: CalendarDaysIcon,
        },
        {
            id: 2,
            name: t('onboarding.steps.personnel.name'),
            description: t('onboarding.steps.personnel.description'),
            icon: UserGroupIcon,
        },
        {
            id: 3,
            name: t('onboarding.steps.stripe.name'),
            description: t('onboarding.steps.stripe.description'),
            icon: CreditCardIcon,
        },
        {
            id: 4,
            name: t('onboarding.steps.pos.name'),
            description: t('onboarding.steps.pos.description'),
            icon: WifiIcon,
        },
        {
            id: 5,
            name: t('onboarding.steps.qr.name'),
            description: t('onboarding.steps.qr.description'),
            icon: QrCodeIcon,
        },
        {
            id: 6,
            name: t('onboarding.steps.googleReviews.name'),
            description: t('onboarding.steps.googleReviews.description'),
            icon: StarIcon,
        },
        {
            id: 7,
            name: t('onboarding.steps.telegram.name'),
            description: t('onboarding.steps.telegram.description'),
            icon: ChatBubbleLeftRightIcon,
        },
        {
            id: 8,
            name: t('onboarding.steps.summary.name'),
            description: t('onboarding.steps.summary.description'),
            icon: DocumentTextIcon,
        }
    ]

    // State
    const [restaurant, setRestaurant] = useState<any | null>(null)
    const [progress, setProgress] = useState<any | null>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [showWelcome, setShowWelcome] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reset all form states when restaurant ID changes
    useEffect(() => {
        if (restaurantId) {
            setCurrentStep(0)
            setShowWelcome(true)
        }
    }, [restaurantId])

    // Load initial data
    useEffect(() => {
        if (restaurantId) {
            loadRestaurantData()
        }
    }, [restaurantId])

    // Handle URL parameters (like Stripe callback errors)
    useEffect(() => {
        const error = searchParams.get('error')
        const step = searchParams.get('step')

        if (error === 'stripe_failed') {
            setError(t('onboarding.stripe.errors.connectionFailed'))
        } else if (error === 'stripe_error') {
            setError(t('onboarding.stripe.errors.setupError'))
        }

        if (step) {
            const stepNum = parseInt(step)
            if (stepNum >= 1 && stepNum <= 8) {
                setCurrentStep(stepNum)
                setShowWelcome(false)
            }
        }
    }, [searchParams])

    const loadRestaurantData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [restaurantData, progressData] = await Promise.all([
                getRestaurantDetail(restaurantId),
                getRestaurantOnboardingProgress(restaurantId)
            ])

            setRestaurant(restaurantData)
            setProgress(progressData)

            // Set initial step based on progress - Find first incomplete step
            let nextStep = 1
            if (!progressData.appointments_step) nextStep = 1
            else if (!progressData.personnel_step) nextStep = 2
            else if (!progressData.stripe_step) nextStep = 3
            else if (!progressData.pos_step) nextStep = 4
            else if (!progressData.qr_stands_step) nextStep = 5
            else if (!progressData.google_reviews_step) nextStep = 6
            else if (!progressData.telegram_step) nextStep = 7
            else nextStep = 8 // All done, go to summary

            setCurrentStep(nextStep)
            setShowWelcome(nextStep === 1) // Show welcome only if starting from step 1

        } catch (err: any) {
            console.error('Failed to load restaurant data:', err)
            setError(err.message || t('onboarding.errors.loadRestaurantData'))
        } finally {
            setLoading(false)
        }
    }

    const refreshProgress = async () => {
        try {
            const progressData = await getRestaurantOnboardingProgress(restaurantId)
            setProgress(progressData)
        } catch (err: any) {
            console.error('Failed to refresh progress:', err)
        }
    }

    const getStepStatus = (stepId: number): StepStatus => {
        if (!progress) return 'locked'

        // Map stepId to progress field
        const stepCompleted = {
            1: progress.appointments_step,
            2: progress.personnel_step,
            3: progress.stripe_step,
            4: progress.pos_step,
            5: progress.qr_stands_step,
            6: progress.google_reviews_step,
            7: progress.telegram_step,
            8: progress.summary_step
        }[stepId]

        if (stepCompleted) return 'completed'
        if (stepId === currentStep) return 'current'
        return 'available' // Super admin can access any step
    }

    const handleStepClick = (stepId: number) => {
        const status = getStepStatus(stepId)
        if (status !== 'locked') {
            setCurrentStep(stepId)
            setShowWelcome(false)
        }
    }

    const handleNextStep = async (currentStepId: number) => {
        try {
            setSaving(true)
            setError(null)

            await refreshProgress()
            setCurrentStep(currentStepId + 1)
        } catch (err: any) {
            setError(err.message || t('onboarding.errors.saveStepData'))
        } finally {
            setSaving(false)
        }
    }

    const handleSkipStep = async (stepNumber: number) => {
        await refreshProgress()
        if (stepNumber < 8) {
            setCurrentStep(stepNumber + 1)
        } else {
            // Last step skipped - onboarding complete
            router.push('/admin/restaurants')
        }
    }

    const handleCompleteOnboarding = async () => {
        router.push('/admin/restaurants')
    }

    // Calculate completed steps count (8 total)
    const completedStepsCount = progress ? [
        progress.appointments_step,
        progress.personnel_step,
        progress.stripe_step,
        progress.pos_step,
        progress.qr_stands_step,
        progress.google_reviews_step,
        progress.telegram_step,
        progress.summary_step
    ].filter(Boolean).length : 0

    const totalSteps = 8
    const progressPercentage = (completedStepsCount / totalSteps) * 100

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <AppointmentStep
                        restaurantId={restaurantId}
                        restaurant={restaurant}
                        onNext={() => setCurrentStep(2)}
                        onSkip={() => handleSkipStep(1)}
                        saving={saving}
                        API_BASE_URL={API_BASE_URL}
                    />
                )

            case 2:
                return (
                    <PersonnelStep
                        restaurantId={restaurantId}
                        onNextStep={() => handleNextStep(2)}
                        onSkipStep={() => handleSkipStep(2)}
                        saving={saving}
                    />
                )

            case 3:
                return (
                    <StripeStep
                        restaurantId={restaurantId}
                        restaurantName={restaurant?.name}
                        onSkipStep={() => handleSkipStep(3)}
                        onNextStep={() => handleNextStep(3)}
                        saving={saving}
                    />
                )

            case 4:
                return (
                    <POSStep
                        restaurantId={restaurantId}
                        restaurantName={restaurant?.name}
                        onSkipStep={() => handleSkipStep(4)}
                        onNextStep={() => handleNextStep(4)}
                        saving={saving}
                    />
                )

            case 5:
                return (
                    <QRStandsStep
                        restaurantId={restaurantId}
                        restaurantName={restaurant?.name}
                        onSkipStep={() => handleSkipStep(5)}
                        onNextStep={() => handleNextStep(5)}
                        saving={saving}
                    />
                )

            case 6:
                return (
                    <GoogleReviewsStep
                        restaurantId={restaurantId}
                        onSkipStep={() => handleSkipStep(6)}
                        onNextStep={() => handleNextStep(6)}
                    />
                )

            case 7:
                return (
                    <TelegramStep
                        restaurantId={restaurantId}
                        restaurantName={restaurant?.name}
                        onSkipStep={() => handleSkipStep(7)}
                        onNextStep={() => handleNextStep(7)}
                    />
                )

            case 8:
                return (
                    <SummaryStep
                        restaurantId={restaurantId}
                        restaurant={restaurant}
                        onComplete={() => handleCompleteOnboarding()}
                        onSkip={() => handleSkipStep(8)}
                        saving={saving}
                        API_BASE_URL={API_BASE_URL}
                    />
                )

            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900">{t('onboarding.loading.restaurant')}</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{t('onboarding.error.label')} {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        {t('onboarding.error.retry')}
                    </button>
                </div>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900">{t('onboarding.loading.notFound')}</div>
            </div>
        )
    }

    return (
        <SmartLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto p-1 text-red-500 hover:text-red-700"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.push('/admin/restaurants')}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {restaurant.name} - {t('onboarding.header.title')}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {t('onboarding.header.subtitle', { step: currentStep })}
                                    {progress && ` • ${t('onboarding.header.progress', {
                                        completed: completedStepsCount
                                    })}`}
                                </p>
                            </div>
                        </div>
                        {progress && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {t('onboarding.header.stepsCount', {
                                            completed: completedStepsCount
                                        })}
                                    </p>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#2BE89A] transition-all duration-500"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <OnboardingSidebar
                        currentStep={currentStep}
                        progress={progress}
                        restaurant={restaurant}
                        onStepClick={handleStepClick}
                        onWelcomeClick={() => {
                            setCurrentStep(0)
                            setShowWelcome(true)
                        }}
                        steps={OnboardingSteps}
                        getStepStatus={getStepStatus}
                    />

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                        <div className="max-w-4xl mx-auto">
                            {showWelcome && currentStep === 0 ? (
                                <WelcomeScreen
                                    restaurantName={restaurant.name}
                                    steps={OnboardingSteps}
                                    onStartSetup={() => {
                                        setShowWelcome(false)
                                        setCurrentStep(1)
                                    }}
                                />
                            ) : (
                                <div className="space-y-6">
                                    {renderStepContent()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SmartLayout>
    )
}