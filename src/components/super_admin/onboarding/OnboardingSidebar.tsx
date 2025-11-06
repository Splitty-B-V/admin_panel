'use client'

import {
    BuildingStorefrontIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
    ArchiveBoxIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'
import {env} from "@/lib/env";

interface OnboardingStep {
    id: number
    name: string
    description: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type StepStatus = 'completed' | 'current' | 'available' | 'locked'

interface OnboardingSidebarProps {
    currentStep: number
    progress: any
    restaurant: any
    onStepClick: (stepId: number) => void
    onWelcomeClick: () => void
    steps: OnboardingStep[]
    getStepStatus: (stepId: number) => StepStatus
    onArchive?: () => void
}

const API_BASE_URL = `http://${env.apiUrl}/${env.apiVersion}`

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// Archive Confirmation Modal Component
const ArchiveModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    restaurant: any;
    onConfirm: () => void;
    isArchiving: boolean;
}> = ({ isOpen, onClose, restaurant, onConfirm, isArchiving }) => {
    const { t } = useLanguage()

    if (!isOpen || !restaurant) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                <div className="flex items-center mb-6">
                    <div className="p-3 rounded-full bg-yellow-100">
                        <ArchiveBoxIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {t('onboarding.sidebar.archive.modal.title')}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.sidebar.archive.modal.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        {t('onboarding.sidebar.archive.modal.description', { name: restaurant.name })}
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                                    {t('onboarding.sidebar.archive.modal.warning.title')}
                                </h4>
                                <p className="text-sm text-yellow-700">
                                    {t('onboarding.sidebar.archive.modal.warning.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isArchiving}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isArchiving}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isArchiving ? (
                            <>
                                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                {t('onboarding.sidebar.archive.archiving')}
                            </>
                        ) : (
                            t('onboarding.sidebar.archive.modal.confirm')
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function OnboardingSidebar({
                                              currentStep,
                                              progress,
                                              restaurant,
                                              onStepClick,
                                              onWelcomeClick,
                                              steps,
                                              getStepStatus,
                                              onArchive
                                          }: OnboardingSidebarProps) {
    const { t } = useLanguage()
    const [isArchiving, setIsArchiving] = useState(false)
    const [showArchiveModal, setShowArchiveModal] = useState(false)

    // Calculate completed steps (8 total)
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

    const handleArchive = async () => {
        try {
            setIsArchiving(true)

            const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurant.id}/archive`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            })

            if (response.status === 401) {
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')
                window.location.href = '/login'
                return
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || 'Failed to archive restaurant')
            }

            // Success - redirect to restaurants list
            if (onArchive) {
                onArchive()
            } else {
                window.location.href = '/admin/restaurants'
            }
        } catch (error) {
            console.error('Failed to archive restaurant:', error)
            alert(t('onboarding.sidebar.archive.error') || 'Failed to archive restaurant')
        } finally {
            setIsArchiving(false)
            setShowArchiveModal(false)
        }
    }

    return (
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
                {/* Restaurant Info */}
                <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] rounded-lg flex items-center justify-center mr-3">
                                <BuildingStorefrontIcon className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                                <p className="text-xs text-gray-500">{restaurant.city}</p>
                            </div>
                        </div>
                        {progress && (
                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-700">
                                        {t('onboarding.sidebar.progress')}
                                    </span>
                                    <span className="text-xs font-semibold text-[#2BE89A]">
                                        {completedStepsCount}/{totalSteps}
                                    </span>
                                </div>
                                <div className="w-full rounded-full h-2 bg-gray-200">
                                    <div
                                        className="bg-[#2BE89A] h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                    {/* Welcome Step */}
                    <button
                        onClick={onWelcomeClick}
                        className={`w-full text-left rounded-lg transition-all duration-200 p-4 ${
                            currentStep === 0
                                ? 'bg-gradient-to-r from-[#2BE89A]/10 to-[#4FFFB0]/10 border-2 border-[#2BE89A] shadow-sm'
                                : 'bg-white border border-gray-200 hover:border-[#2BE89A]/50 hover:shadow-sm'
                        }`}
                    >
                        <div className="flex items-center">
                            <div className={`p-1.5 rounded-md mr-3 ${
                                currentStep === 0 ? 'bg-[#2BE89A]' : 'bg-[#2BE89A]/20'
                            }`}>
                                <RocketLaunchIcon className={`h-4 w-4 ${
                                    currentStep === 0 ? 'text-black' : 'text-[#2BE89A]'
                                }`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-900">
                                    {t('onboarding.sidebar.welcome.title')}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {t('onboarding.sidebar.welcome.description')}
                                </p>
                            </div>
                        </div>
                    </button>

                    <div className="my-3 px-2">
                        <div className="border-t border-gray-200"></div>
                    </div>

                    {/* Onboarding Steps */}
                    {steps.map((step) => {
                        const status = getStepStatus(step.id)
                        const isClickable = status !== 'locked'

                        return (
                            <button
                                key={step.id}
                                onClick={() => onStepClick(step.id)}
                                disabled={!isClickable}
                                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                                    status === 'current'
                                        ? 'bg-white border-2 border-[#2BE89A] shadow-sm'
                                        : status === 'completed'
                                            ? 'bg-white border border-gray-200 hover:border-[#2BE89A] hover:shadow-sm'
                                            : status === 'available'
                                                ? 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                : 'bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <div className="flex items-start">
                                    <div className={`p-2 rounded-lg mr-3 transition-all ${
                                        status === 'current'
                                            ? 'bg-[#2BE89A]'
                                            : status === 'completed'
                                                ? 'bg-[#2BE89A]/20'
                                                : status === 'available'
                                                    ? 'bg-gray-100'
                                                    : 'bg-gray-50'
                                    }`}>
                                        {status === 'completed' ? (
                                            <CheckCircleIcon className="h-5 w-5 text-[#2BE89A]" />
                                        ) : (
                                            <step.icon className={`h-5 w-5 ${
                                                status === 'current'
                                                    ? 'text-black'
                                                    : status === 'available'
                                                        ? 'text-gray-600'
                                                        : 'text-gray-400'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-medium ${
                                                status === 'current' || status === 'completed'
                                                    ? 'text-gray-900'
                                                    : 'text-gray-600'
                                            }`}>
                                                {step.name}
                                            </h3>
                                            <div className={`w-2 h-2 rounded-full ${
                                                status === 'completed' || status === 'current'
                                                    ? 'bg-[#2BE89A]'
                                                    : 'bg-gray-300'
                                            }`} />
                                        </div>
                                        <p className="text-xs mt-1 text-gray-500">{step.description}</p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}

                    {/* Archive Button - Below Summary Step */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => setShowArchiveModal(true)}
                            disabled={isArchiving}
                            className="w-full px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center border border-yellow-200"
                        >
                            <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                            {t('onboarding.sidebar.archive.button')}
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            {t('onboarding.sidebar.archive.hint')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Archive Confirmation Modal */}
            <ArchiveModal
                isOpen={showArchiveModal}
                onClose={() => setShowArchiveModal(false)}
                restaurant={restaurant}
                onConfirm={handleArchive}
                isArchiving={isArchiving}
            />
        </div>
    )
}