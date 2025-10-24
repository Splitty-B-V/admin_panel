'use client'

import {
    BuildingStorefrontIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

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
}

export default function OnboardingSidebar({
                                              currentStep,
                                              progress,
                                              restaurant,
                                              onStepClick,
                                              onWelcomeClick,
                                              steps,
                                              getStepStatus
                                          }: OnboardingSidebarProps) {
    const { t } = useLanguage()

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
                </div>
            </div>
        </div>
    )
}