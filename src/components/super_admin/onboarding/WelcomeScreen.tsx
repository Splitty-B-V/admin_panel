'use client'

import {
    RocketLaunchIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface OnboardingStep {
    id: number
    name: string
    description: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface WelcomeScreenProps {
    restaurantName: string
    steps: OnboardingStep[]
    onStartSetup: () => void
}

export default function WelcomeScreen({
                                          restaurantName,
                                          steps,
                                          onStartSetup
                                      }: WelcomeScreenProps) {
    const { t } = useLanguage()

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2BE89A]/10 via-transparent to-[#4FFFB0]/10" />
                <div className="relative px-8 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] rounded-2xl mb-6">
                        <RocketLaunchIcon className="h-8 w-8 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {t('onboarding.welcome.title', { restaurant: restaurantName })}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('onboarding.welcome.description', { restaurant: restaurantName })}
                    </p>
                </div>
            </div>

            <div className="px-8 pb-8">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="bg-white rounded-lg p-5 border border-gray-200 hover:border-[#2BE89A] hover:shadow-md transition-all"
                        >
                            <step.icon className="h-8 w-8 text-[#2BE89A] mb-3" />
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.name}</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onStartSetup}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all group"
                >
                    <span className="flex items-center justify-center text-base">
                        {t('onboarding.welcome.startSetup')}
                        <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>
        </div>
    )
}