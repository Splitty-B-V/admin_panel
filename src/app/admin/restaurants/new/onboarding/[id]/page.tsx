'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
    BuildingStorefrontIcon,
    UserGroupIcon,
    CreditCardIcon,
    WifiIcon,
    CheckCircleIcon,
    StarIcon,
    QrCodeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    PhoneIcon,
    ArrowRightIcon,
    SparklesIcon,
    ClockIcon,
    ShieldCheckIcon,
    RocketLaunchIcon,
    LockClosedIcon,
    ArrowPathIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    LinkIcon
} from '@heroicons/react/24/outline'
import {env} from "@/lib/env";
import SmartLayout from "@/components/common/SmartLayout";

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`


// Адаптированные API функции под твой бекенд с авторизацией
async function getRestaurantDetail(restaurantId: number) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}`, {
        headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch restaurant')
    return response.json()
}

async function getRestaurantOnboardingProgress(restaurantId: number) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/progress`, {
        headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch progress')
    return response.json()
}

async function completePersonnelStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/1/personnel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to complete personnel step')
    return response.json()
}

async function completeStripeStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/2/stripe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to complete stripe step')
    return response.json()
}

async function completePOSStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/3/pos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to complete POS step')
    return response.json()
}

async function completeQRStandsStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/qr/configure`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to complete QR stands step')
    return response.json()
}

async function completeGoogleReviewsStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/5/google-reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to complete Google reviews step')
    return response.json()
}

async function completeTelegramStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/6/telegram`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to complete telegram step')
    return response.json()
}

async function skipOnboardingStep(restaurantId: number, step: number) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/${step}/skip`, {
        method: 'POST',
        headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to skip step')
    return response.json()
}

interface OnboardingStep {
    id: number
    name: string
    description: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const OnboardingSteps: OnboardingStep[] = [
    {
        id: 1,
        name: 'Personnel',
        description: 'Add team members and managers',
        icon: UserGroupIcon,
    },
    {
        id: 2,
        name: 'Stripe',
        description: 'Configure payment processing',
        icon: CreditCardIcon,
    },
    {
        id: 3,
        name: 'POS System',
        description: 'Connect point of sale integration',
        icon: WifiIcon,
    },
    {
        id: 4,
        name: 'QR Stands',
        description: 'Setup table QR code stands',
        icon: QrCodeIcon,
    },
    {
        id: 5,
        name: 'Google Reviews',
        description: 'Configure review collection',
        icon: StarIcon,
    },
    {
        id: 6,
        name: 'Telegram',
        description: 'Setup notifications',
        icon: ChatBubbleLeftRightIcon,
    }
]

type StepStatus = 'completed' | 'current' | 'available' | 'locked'

export default function SuperAdminOnboardingPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const restaurantId = parseInt(params.id as string)

    // State
    const [restaurant, setRestaurant] = useState<any | null>(null)
    const [progress, setProgress] = useState<any | null>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [showWelcome, setShowWelcome] = useState(true)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Step data states
    const [personnelData, setPersonnelData] = useState<any[]>([])
    const [stripeData, setStripeData] = useState<any>({ connected: false })
    const [posData, setPosData] = useState<any>({
        pos_type: '',
        username: '',
        password: '',
        base_url: '',
        environment: 'production',
        is_active: true
    })

    const [qrStandData, setQrStandData] = useState({
        domain: '',
        notes: '',
        selected_tables: {}
    })
    const [tableSections, setTableSections] = useState([
        { id: 1, name: 'Inside', table_numbers: '', selected_design: 1 }
    ])

    const [googleReviewData, setGoogleReviewData] = useState<any>({
        place_id: '',
        review_link: ''
    })
    const [telegramData, setTelegramData] = useState<any>({
        restaurant_name: '',
        configured: false,
        group_link: ''
    })
    const [domainChecking, setDomainChecking] = useState(false)
    const [domainStatus, setDomainStatus] = useState(null) // null | 'available' | 'taken'
    const [domainMessage, setDomainMessage] = useState('')

    // Personnel form states
    const [showPersonForm, setShowPersonForm] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [phoneError, setPhoneError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [newPerson, setNewPerson] = useState<any>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirm: '',
        role: 'manager'
    })

    // Stripe states
    const [stripeConnecting, setStripeConnecting] = useState(false)

    // Telegram states
    const [telegramCreating, setTelegramCreating] = useState(false)
    const [telegramGroupLink, setTelegramGroupLink] = useState<string>('')

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
            setError('Stripe connection failed. Please try again.')
        } else if (error === 'stripe_error') {
            setError('An error occurred during Stripe setup. Please try again.')
        }

        if (step) {
            const stepNum = parseInt(step)
            if (stepNum >= 1 && stepNum <= 6) {
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

            // Set initial step based on progress
            if (progressData.completed_steps.length === 0) {
                setCurrentStep(0) // Show welcome
                setShowWelcome(true)
            } else {
                setShowWelcome(false)
                // Find first incomplete step
                let nextStep = 1
                for (let i = 1; i <= 6; i++) {
                    if (!progressData.completed_steps.includes(i)) {
                        nextStep = i
                        break
                    }
                }
                setCurrentStep(nextStep)
            }

            // Initialize form data based on restaurant
            setTelegramData(prev => ({
                ...prev,
                restaurant_name: restaurantData.name
            }))

        } catch (err: any) {
            console.error('Failed to load restaurant data:', err)
            setError(err.message || 'Failed to load restaurant data')
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

        if (progress.completed_steps.includes(stepId)) return 'completed'
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

    // NEW: Unified step handler that saves and moves to next step
    const handleNextStep = async (stepNumber: number) => {
        try {
            setSaving(true)
            setError(null)

            switch (stepNumber) {
                case 1:
                    if (personnelData.length === 0) {
                        setError('Please add at least one team member')
                        return
                    }
                    await completePersonnelStep(restaurantId, { personnel: personnelData })
                    break
                case 3:
                    if (!posData.pos_type || !posData.username || !posData.password || !posData.base_url) {
                        setError('Please fill in all required POS fields')
                        return
                    }
                    await completePOSStep(restaurantId, posData)
                    break
                case 4:
                    if (!qrStandData.domain.trim()) {
                        setError('Please enter a domain name')
                        return
                    }
                    if (domainStatus !== 'available') {
                        setError('Please check domain availability first')
                        return
                    }
                    const hasValidTables = tableSections.some(section => {
                        const numbers = section.table_numbers.split(',')
                            .map(n => parseInt(n.trim()))
                            .filter(n => !isNaN(n) && n > 0)
                        return numbers.length > 0
                    })
                    if (!hasValidTables) {
                        setError('Please specify at least one table number')
                        return
                    }
                    const selected_tables = {}
                    tableSections.forEach(section => {
                        if (section.table_numbers.trim()) {
                            const table_numbers = section.table_numbers.split(',')
                                .map(n => parseInt(n.trim()))
                                .filter(n => !isNaN(n) && n > 0)

                            if (table_numbers.length > 0) {
                                selected_tables[section.name.toLowerCase().replace(/\s+/g, '_')] = {
                                    table_numbers,
                                    selected_design: section.selected_design
                                }
                            }
                        }
                    })
                    await completeQRStandsStep(restaurantId, {
                        domain: qrStandData.domain,
                        notes: qrStandData.notes,
                        selected_tables
                    })
                    break
                case 5:
                    if (!googleReviewData.place_id) {
                        setError('Please provide a Google Place ID')
                        return
                    }
                    await completeGoogleReviewsStep(restaurantId, googleReviewData)
                    break
            }

            await refreshProgress()
            setCurrentStep(stepNumber + 1)
        } catch (err: any) {
            setError(err.message || `Failed to save step ${stepNumber} data`)
        } finally {
            setSaving(false)
        }
    }

    // Personnel handling
    const handleAddPerson = async () => {
        // Reset errors
        setEmailError('')
        setPhoneError('')
        setPasswordError('')

        // Validate
        if (newPerson.password !== newPerson.passwordConfirm) {
            setPasswordError('Passwords do not match')
            return
        }

        if (newPerson.password.length < 8) {
            setPasswordError('Password must be at least 8 characters')
            return
        }

        // Check if email already exists in current personnel list
        const emailExists = personnelData.some(p => p.email.toLowerCase() === newPerson.email.toLowerCase())
        if (emailExists) {
            setEmailError('This email is already in use')
            return
        }

        if (newPerson.first_name && newPerson.last_name && newPerson.email && newPerson.password) {
            const updatedPersonnelData = [...personnelData, {
                first_name: newPerson.first_name,
                last_name: newPerson.last_name,
                email: newPerson.email,
                phone: newPerson.phone,
                password: newPerson.password,
                role: newPerson.role
            }]

            setPersonnelData(updatedPersonnelData)

            // Reset form
            setNewPerson({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                passwordConfirm: '',
                role: 'manager'
            })
            setShowPersonForm(false)
        }
    }

    const handleRemovePerson = (index: number) => {
        const updatedPersonnelData = personnelData.filter((_, i) => i !== index)
        setPersonnelData(updatedPersonnelData)
    }

    const handleStripeConnect = async () => {
        try {
            setStripeConnecting(true)
            setError(null)

            // Get OAuth URL from backend
            const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/stripe/oauth-url`, {
                headers: getAuthHeaders()
            })
            const data = await response.json()

            if (data.oauth_url) {
                // Redirect to Stripe OAuth
                window.location.href = data.oauth_url
            } else {
                setError('Failed to generate Stripe OAuth URL')
            }
        } catch (err: any) {
            setError('Failed to start Stripe connection')
        } finally {
            setStripeConnecting(false)
        }
    }

    const handleCompleteStripeStep = async () => {
        try {
            setSaving(true)
            setError(null)

            const result = await completeStripeStep(restaurantId, stripeData)

            if (result.data?.oauth_url) {
                // Redirect to OAuth URL
                window.location.href = result.data.oauth_url
            } else {
                await refreshProgress()
                setCurrentStep(3)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save Stripe configuration')
        } finally {
            setSaving(false)
        }
    }

    async function checkDomainAvailability(restaurantId: number, domain: string) {
        const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/qr/check-domain`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ domain })
        })
        if (!response.ok) throw new Error('Failed to check domain availability')
        return response.json()
    }

    async function configureQRStands(restaurantId: number, data: any) {
        const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/qr/configure`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Failed to configure QR stands')
        return response.json()
    }

    const addTableSection = () => {
        const newId = Math.max(...tableSections.map(s => s.id)) + 1
        setTableSections([...tableSections, {
            id: newId,
            name: `Section ${newId}`,
            table_numbers: '',
            selected_design: 1
        }])
    }

    const removeTableSection = (id: number) => {
        if (tableSections.length > 1) {
            setTableSections(tableSections.filter(s => s.id !== id))
        }
    }

    const updateTableSection = (id: number, field: string, value: any) => {
        setTableSections(tableSections.map(section =>
            section.id === id ? { ...section, [field]: value } : section
        ))
    }

    const handleCheckDomain = async () => {
        if (!qrStandData.domain.trim()) {
            setError('Please enter a domain name')
            return
        }

        try {
            setDomainChecking(true)
            setError(null)

            const result = await checkDomainAvailability(restaurantId, qrStandData.domain)

            // @ts-ignore
            setDomainStatus(result.available ? 'available' : 'taken')
            setDomainMessage(result.message)
        } catch (err: any) {
            setError(err.message || 'Failed to check domain availability')
        } finally {
            setDomainChecking(false)
        }
    }

    // NEW: Final onboarding completion - only for Telegram step
    const handleCompleteOnboarding = async () => {
        if (!telegramData.restaurant_name) {
            setError('Please provide a restaurant name')
            return
        }

        try {
            setTelegramCreating(true)
            setError(null)

            const result = await completeTelegramStep(restaurantId, telegramData)

            router.push('/admin/restaurants')
            // }
        } catch (err: any) {
            setError(err.message || 'Failed to create Telegram group')
        } finally {
            setTelegramCreating(false)
        }
    }

    const handleSkipStep = async (stepNumber: number) => {
        try {
            setSaving(true)
            setError(null)
            await skipOnboardingStep(restaurantId, stepNumber)
            await refreshProgress()

            if (stepNumber < 6) {
                setCurrentStep(stepNumber + 1)
            } else {
                // Last step skipped - onboarding complete
                router.push('/restaurants')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to skip step')
        } finally {
            setSaving(false)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Add Personnel</h3>
                                    <p className="text-sm text-gray-500">
                                        Create team member accounts • {personnelData.length} users added
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            {/* Personnel List */}
                            {personnelData.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-sm font-medium text-gray-600 mb-4">Added Users</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {personnelData.map((person, index) => (
                                            <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-green-400/30 transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] flex items-center justify-center text-black font-bold mr-4">
                                                            {person.first_name.charAt(0)}{person.last_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-900 font-semibold">{person.first_name} {person.last_name}</p>
                                                            <p className="text-sm text-gray-600">{person.email}</p>
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${
                                                                person.role === 'manager'
                                                                    ? 'bg-green-100 text-green-500'
                                                                    : 'bg-blue-100 text-blue-500'
                                                            }`}>
                                {person.role === 'manager' ? 'Manager' : 'Staff'}
                              </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemovePerson(index)}
                                                        className="text-gray-600 hover:text-red-500 transition p-2"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Person Form */}
                            {showPersonForm ? (
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="text-base font-medium text-gray-900">Add New User</h4>
                                        <button
                                            onClick={() => {
                                                setShowPersonForm(false)
                                                setNewPerson({
                                                    first_name: '',
                                                    last_name: '',
                                                    email: '',
                                                    phone: '',
                                                    password: '',
                                                    passwordConfirm: '',
                                                    role: 'manager'
                                                })
                                                setEmailError('')
                                                setPhoneError('')
                                                setPasswordError('')
                                            }}
                                            className="text-gray-500 hover:text-gray-700 transition p-1.5 hover:bg-white rounded-lg"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">First Name</label>
                                                <input
                                                    type="text"
                                                    value={newPerson.first_name}
                                                    onChange={(e) => setNewPerson({...newPerson, first_name: e.target.value})}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={newPerson.last_name}
                                                    onChange={(e) => setNewPerson({...newPerson, last_name: e.target.value})}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={newPerson.email}
                                                onChange={(e) => {
                                                    setNewPerson({...newPerson, email: e.target.value})
                                                    setEmailError('')
                                                }}
                                                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                                                    emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                                                }`}
                                                placeholder="Enter email address"
                                            />
                                            {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Phone (Optional)</label>
                                            <input
                                                type="tel"
                                                value={newPerson.phone}
                                                onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Enter phone number"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPerson.password}
                                                    onChange={(e) => {
                                                        setNewPerson({...newPerson, password: e.target.value})
                                                        setPasswordError('')
                                                    }}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent pr-12 ${
                                                        passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                                                    }`}
                                                    placeholder="Enter password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                                >
                                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswordConfirm ? "text" : "password"}
                                                    value={newPerson.passwordConfirm}
                                                    onChange={(e) => setNewPerson({...newPerson, passwordConfirm: e.target.value})}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                                                    placeholder="Confirm password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                                >
                                                    {showPasswordConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-3">Role</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setNewPerson({...newPerson, role: 'manager'})}
                                                    className={`p-3 rounded-lg border transition-all ${
                                                        newPerson.role === 'manager'
                                                            ? 'bg-white border-[#2BE89A] shadow-sm'
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <ShieldCheckIcon className={`h-5 w-5 mx-auto mb-2 ${
                                                        newPerson.role === 'manager' ? 'text-[#2BE89A]' : 'text-gray-400'
                                                    }`} />
                                                    <p className={`text-sm font-medium ${
                                                        newPerson.role === 'manager' ? 'text-gray-900' : 'text-gray-600'
                                                    }`}>Manager</p>
                                                    <p className="text-xs mt-0.5 text-gray-500">Full Access</p>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewPerson({...newPerson, role: 'staff'})}
                                                    className={`p-3 rounded-lg border transition-all ${
                                                        newPerson.role === 'staff'
                                                            ? 'bg-white border-[#2BE89A] shadow-sm'
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <UserGroupIcon className={`h-5 w-5 mx-auto mb-2 ${
                                                        newPerson.role === 'staff' ? 'text-[#2BE89A]' : 'text-gray-400'
                                                    }`} />
                                                    <p className={`text-sm font-medium ${
                                                        newPerson.role === 'staff' ? 'text-gray-900' : 'text-gray-600'
                                                    }`}>Staff</p>
                                                    <p className="text-xs mt-0.5 text-gray-500">Basic Access</p>
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddPerson}
                                            disabled={!newPerson.first_name || !newPerson.last_name || !newPerson.email || !newPerson.password || !newPerson.passwordConfirm}
                                            className="w-full px-4 py-2.5 bg-[#2BE89A] text-black font-medium rounded-lg hover:bg-[#2BE89A]/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            Add User
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowPersonForm(true)}
                                    className="w-full px-5 py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2BE89A] hover:bg-gray-50 transition-all group"
                                >
                                    <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-gray-400 group-hover:text-[#2BE89A] transition" />
                                    <p className="text-sm font-medium group-hover:text-gray-900 transition">Add New User</p>
                                </button>
                            )}

                            <div className="mt-6 bg-[#2BE89A]/5 rounded-lg p-3.5 border border-[#2BE89A]/20">
                                <p className="text-xs text-gray-600">
                                    <span className="text-[#2BE89A] font-medium">Tip:</span> Add at least one manager to complete this step
                                </p>
                            </div>
                        </div>

                        {/* UPDATED BUTTONS - Next Step instead of Complete Step */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(1)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Skip Step
                            </button>
                            <button
                                onClick={() => handleNextStep(1)}
                                disabled={saving || personnelData.length === 0}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Next Step'}
                            </button>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Stripe Configuration</h3>
                                    <p className="text-sm text-gray-500">
                                        Setup payment processing for {restaurant?.name}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <CreditCardIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {progress?.stripe_connected ? (
                                    <div className="bg-[#2BE89A]/5 rounded-lg p-5 border border-[#2BE89A]/20">
                                        <div className="flex items-center mb-4">
                                            <CheckCircleIcon className="h-5 w-5 text-[#2BE89A] mr-3" />
                                            <h4 className="text-base font-medium text-gray-900">Stripe Connected</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Stripe payment processing is configured and ready to accept split payments.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                            <h4 className="text-base font-medium text-gray-900 mb-3">Connect with Stripe</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Connect your Stripe account to enable payment processing for {restaurant?.name}.
                                            </p>

                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <ShieldCheckIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                                    <p className="text-xs text-gray-600 text-center">PCI Compliant</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <ClockIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                                    <p className="text-xs text-gray-600 text-center">Daily Payouts</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <SparklesIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                                    <p className="text-xs text-gray-600 text-center">Real-time Insights</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleStripeConnect}
                                            disabled={stripeConnecting}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-[#635BFF] via-[#4F46E5] to-[#0073E6] text-white font-medium rounded-lg hover:opacity-90 flex items-center justify-center text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {stripeConnecting ? (
                                                <>
                                                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <span>Connect with Stripe</span>
                                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                                </>
                                            )}
                                        </button>

                                        <div className="bg-[#2BE89A]/5 rounded-lg p-3.5 border border-[#2BE89A]/20">
                                            <p className="text-xs text-gray-600">
                                                <span className="text-[#2BE89A] font-medium">Secure:</span> Your financial data is handled by Stripe with bank-level security.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* UPDATED BUTTONS - Next Step instead of Continue */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(2)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Skip Step
                            </button>
                            {progress?.stripe_connected && (
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition"
                                >
                                    Next Step
                                </button>
                            )}
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">POS System Configuration</h3>
                                    <p className="text-sm text-gray-500">
                                        Connect point of sale system for {restaurant?.name}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <WifiIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-5">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                            POS System <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={posData.pos_type}
                                            onChange={(e) => setPosData({...posData, pos_type: e.target.value})}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                            required
                                        >
                                            <option value="">Select POS System</option>
                                            <option value="untill">Untill</option>
                                            <option value="lightspeed">Lightspeed</option>
                                            <option value="mpluskassa">M+ Kassa</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                                Username <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={posData.username}
                                                onChange={(e) => setPosData({...posData, username: e.target.value})}
                                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                placeholder="Enter username"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={posData.password}
                                                onChange={(e) => setPosData({...posData, password: e.target.value})}
                                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                placeholder="Enter password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                            API URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://api.example.com"
                                            value={posData.base_url}
                                            onChange={(e) => setPosData({...posData, base_url: e.target.value})}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                            Environment
                                        </label>
                                        <select
                                            value={posData.environment}
                                            onChange={(e) => setPosData({...posData, environment: e.target.value as any})}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                        >
                                            <option value="production">Production</option>
                                            <option value="staging">Staging</option>
                                            <option value="development">Development</option>
                                            <option value="test">Test</option>
                                        </select>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <label htmlFor="is-active" className="text-sm font-medium text-gray-900 cursor-pointer">
                                                    Activate Integration
                                                </label>
                                                <p className="text-xs text-gray-500 mt-1">Enable POS integration for {restaurant?.name}</p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={posData.is_active}
                                                onClick={() => setPosData({...posData, is_active: !posData.is_active})}
                                                className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2BE89A] focus:ring-offset-2
                          ${posData.is_active ? 'bg-[#2BE89A]' : 'bg-gray-200'}
                        `}
                                            >
                                                <span className="sr-only">Activate POS integration</span>
                                                <span
                                                    className={`
                            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 
                            transition duration-200 ease-in-out
                            ${posData.is_active ? 'translate-x-5' : 'translate-x-0'}
                          `}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UPDATED BUTTONS - Next Step instead of Complete Step */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(3)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Skip Step
                            </button>
                            <button
                                onClick={() => handleNextStep(3)}
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Next Step'}
                            </button>
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">QR Stands Setup</h3>
                                    <p className="text-sm text-gray-500">
                                        Configure table QR code stands for {restaurant?.name}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <QrCodeIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Domain Configuration */}
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <label className="block text-xs font-medium text-gray-700 mb-4 uppercase tracking-wider">
                                        Restaurant Domain
                                    </label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Domain Name (for QR codes)</label>
                                            <div className="flex space-x-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={qrStandData.domain}
                                                        onChange={(e) => {
                                                            const domain = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                                                            setQrStandData({...qrStandData, domain})
                                                            setDomainStatus(null) // Reset status when domain changes
                                                            setDomainMessage('')
                                                        }}
                                                        placeholder="restaurant-name"
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCheckDomain}
                                                    disabled={domainChecking || !qrStandData.domain.trim()}
                                                    className="px-4 py-2 bg-[#2BE89A] text-black font-medium rounded-md hover:bg-[#2BE89A]/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {domainChecking ? (
                                                        <>
                                                            <ArrowPathIcon className="h-4 w-4 animate-spin inline mr-1" />
                                                            Checking...
                                                        </>
                                                    ) : (
                                                        'Check Domain'
                                                    )}
                                                </button>
                                            </div>

                                            {/* Domain Status */}
                                            {domainStatus && (
                                                <div className={`mt-2 p-3 rounded-md ${
                                                    domainStatus === 'available'
                                                        ? 'bg-green-50 border border-green-200'
                                                        : 'bg-red-50 border border-red-200'
                                                }`}>
                                                    <div className="flex items-center">
                                                        {domainStatus === 'available' ? (
                                                            <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                                                        ) : (
                                                            <XMarkIcon className="h-4 w-4 text-red-600 mr-2" />
                                                        )}
                                                        <p className={`text-sm ${
                                                            domainStatus === 'available' ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                            {domainMessage}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-500 mt-1">
                                                Only lowercase letters, numbers, and hyphens allowed. Final URL will be: {qrStandData.domain || 'your-domain'}.splitty.nl
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Available Designs */}
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <label className="block text-xs font-medium text-gray-700 mb-4 uppercase tracking-wider">
                                        Available Designs
                                    </label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {[
                                            { id: 1, name: 'Design 1', image: '/images/qr-design-1.png' },
                                            { id: 2, name: 'Design 2', image: '/images/qr-design-2.png' },
                                            { id: 3, name: 'Design 3', image: '/images/qr-design-3.png' },
                                            { id: 4, name: 'Design 4', image: '/images/qr-design-4.png' }
                                        ].map((design) => (
                                            <div
                                                key={design.id}
                                                className="p-4 rounded-lg border border-gray-200 bg-white"
                                            >
                                                <div className="w-full h-24 mx-auto mb-3 rounded-lg overflow-hidden shadow-sm">
                                                    <img
                                                        src={design.image}
                                                        alt={design.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <p className="text-xs font-medium text-gray-700 text-center">{design.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Select different designs for each section below
                                    </p>
                                </div>

                                {/* Dynamic Table Sections */}
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Table Sections
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addTableSection}
                                            className="inline-flex items-center px-3 py-1.5 bg-[#2BE89A] text-black text-xs font-medium rounded-md hover:bg-[#2BE89A]/90 transition"
                                        >
                                            <span className="text-lg mr-1">+</span>
                                            Add Section
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {tableSections.map((section, index) => (
                                            <div key={section.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex-1 mr-4">
                                                        <label className="block text-xs text-gray-600 mb-1.5">Section Name</label>
                                                        <input
                                                            type="text"
                                                            value={section.name}
                                                            onChange={(e) => updateTableSection(section.id, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                            placeholder="Section name"
                                                        />
                                                    </div>

                                                    {tableSections.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTableSection(section.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1.5">Table Numbers (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={section.table_numbers}
                                                            onChange={(e) => updateTableSection(section.id, 'table_numbers', e.target.value)}
                                                            placeholder="1, 2, 3, 10, 15"
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Tables: {section.table_numbers ?
                                                            section.table_numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0).length : 0}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1.5">Design</label>
                                                        <select
                                                            value={section.selected_design}
                                                            onChange={(e) => updateTableSection(section.id, 'selected_design', parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                        >
                                                            <option value={1}>Design 1</option>
                                                            <option value={2}>Design 2</option>
                                                            <option value={3}>Design 3</option>
                                                            <option value={4}>Design 4</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Calculator */}
                                    <div className="bg-white rounded-md p-3 border border-gray-200 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Total Tables</span>
                                            <span className="text-lg font-bold text-[#2BE89A]">
                                    {tableSections.reduce((total, section) => {
                                        const count = section.table_numbers ?
                                            section.table_numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0).length : 0
                                        return total + count
                                    }, 0)}
                                </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={qrStandData.notes}
                                        onChange={(e) => setQrStandData({...qrStandData, notes: e.target.value})}
                                        placeholder="Additional notes for QR stand setup..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors resize-none"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* UPDATED BUTTONS - Next Step instead of Complete Step */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(4)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Skip Step
                            </button>
                            <button
                                onClick={() => handleNextStep(4)}
                                disabled={saving || !qrStandData.domain || domainStatus !== 'available'}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Next Step'}
                            </button>
                        </div>
                    </div>
                )

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Google Reviews Setup</h3>
                                    <p className="text-sm text-gray-500">
                                        Configure Google Reviews link for {restaurant?.name}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <StarIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Instructions */}
                                <div className="bg-[#2BE89A]/5 rounded-lg p-5 border border-[#2BE89A]/20">
                                    <h4 className="text-base font-medium text-gray-900 mb-3">Set up Google Review link for {restaurant?.name}</h4>

                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">Search for {restaurant?.name} on Google</p>
                                                <a
                                                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#2BE89A] hover:text-[#2BE89A]/80 underline"
                                                >
                                                    Open Google Place ID Finder
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">Search under "Find the ID of a particular place"</p>
                                                <p className="text-gray-600">Type "{restaurant?.name}" and select the correct result</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">Copy the Place ID</p>
                                                <p className="text-gray-600">This appears below the map (e.g.: ChIJN1t_tDeuEmsRU...)</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">Paste the Place ID below</p>
                                                <p className="text-gray-600">Replace only "PLACE_ID" with the copied ID from {restaurant?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Place ID Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Google Place ID
                                    </label>
                                    <input
                                        type="text"
                                        value={googleReviewData.place_id}
                                        onChange={(e) => {
                                            const placeId = e.target.value
                                            setGoogleReviewData({
                                                place_id: placeId,
                                                review_link: placeId ? `https://search.google.com/local/writereview?placeid=${placeId}` : ''
                                            })
                                        }}
                                        placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-2 focus:ring-[#2BE89A]/20"
                                    />
                                </div>

                                {/* Generated Link */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Google Review Link
                                    </label>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-sm text-gray-700 font-mono break-all">
                                            https://search.google.com/local/writereview?placeid={googleReviewData.place_id || 'PLACE_ID'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">The restaurant can always change this later</p>
                                </div>

                                {googleReviewData.place_id && (
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <p className="text-sm text-green-700">
                                                Customers will be directed to this link to leave reviews after their visit.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* UPDATED BUTTONS - Next Step instead of Complete Step */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(5)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Skip Step
                            </button>
                            <button
                                onClick={() => handleNextStep(5)}
                                disabled={saving || !googleReviewData.place_id}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Next Step'}
                            </button>
                        </div>
                    </div>
                )

            case 6:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Telegram Notifications</h3>
                                    <p className="text-sm text-gray-500">
                                        Setup notification system for {restaurant?.name}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Restaurant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={telegramData.restaurant_name}
                                        onChange={(e) => setTelegramData({...telegramData, restaurant_name: e.target.value})}
                                        placeholder={restaurant?.name}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                {telegramGroupLink && (
                                    <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-900">Telegram Group Created</p>
                                            <button
                                                onClick={() => window.open(telegramGroupLink, '_blank')}
                                                className="text-[#2BE89A] hover:text-[#2BE89A]/80 transition"
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600 font-mono break-all">
                                            {telegramGroupLink}
                                        </p>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">What you'll get:</h4>
                                    <ul className="space-y-2 text-xs text-gray-600">
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                            New order notifications
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                            Payment confirmations
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                            Daily summaries
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                                    <p className="text-sm text-gray-700">
                                        <CheckCircleIcon className="h-5 w-5 text-[#2BE89A] inline mr-2" />
                                        Completing this step will finish the onboarding process for {restaurant?.name}.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FINAL STEP BUTTONS - Submit & Complete Onboarding */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(6)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Skip & Finish
                            </button>
                            <button
                                onClick={handleCompleteOnboarding}
                                disabled={telegramCreating || !telegramData.restaurant_name}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                            >
                                {telegramCreating ? (
                                    <>
                                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                        Completing Onboarding...
                                    </>
                                ) : (
                                    <>
                                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                                        Submit & Complete Onboarding
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900">Loading restaurant data...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">Error: {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900">Restaurant not found...</div>
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
                                onClick={() => router.push('/restaurants')}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{restaurant.name} - Onboarding</h1>
                                <p className="text-sm text-gray-600">
                                    Super Admin Setup • Step {currentStep} of 6
                                    {progress && ` • ${progress.completed_steps.length}/6 completed`}
                                </p>
                            </div>
                        </div>
                        {progress && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {progress.completed_steps.length}/6 Steps
                                    </p>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#2BE89A] transition-all duration-500"
                                            style={{ width: `${(progress.completed_steps.length / 6) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
                        <div className="p-6">
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
                                                <span className="text-xs font-medium text-gray-700">Progress</span>
                                                <span className="text-xs font-semibold text-[#2BE89A]">
                        {progress.completed_steps.length}/6
                      </span>
                                            </div>
                                            <div className="w-full rounded-full h-2 bg-gray-200">
                                                <div
                                                    className="bg-[#2BE89A] h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${(progress.completed_steps.length / 6) * 100}%` }}
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
                                    onClick={() => {
                                        setCurrentStep(0)
                                        setShowWelcome(true)
                                    }}
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
                                            <h3 className="font-semibold text-sm text-gray-900">Welcome</h3>
                                            <p className="text-xs text-gray-500">Start restaurant setup</p>
                                        </div>
                                    </div>
                                </button>

                                <div className="my-3 px-2">
                                    <div className="border-t border-gray-200"></div>
                                </div>

                                {/* Onboarding Steps */}
                                {OnboardingSteps.map((step) => {
                                    const status = getStepStatus(step.id)
                                    const isClickable = status !== 'locked'

                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => handleStepClick(step.id)}
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
                                                                : status === 'completed'
                                                                    ? 'text-[#2BE89A]'
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

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                        <div className="max-w-4xl mx-auto">
                            {showWelcome && currentStep === 0 ? (
                                // Welcome Screen
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#2BE89A]/10 via-transparent to-[#4FFFB0]/10" />
                                        <div className="relative px-8 py-12 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] rounded-2xl mb-6">
                                                <RocketLaunchIcon className="h-8 w-8 text-black" />
                                            </div>
                                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                                Setup {restaurant.name}
                                            </h1>
                                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                                Configure all necessary integrations and settings to get {restaurant.name} ready for split payments
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-8 pb-8">
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                            {OnboardingSteps.map((step) => (
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
                                            onClick={() => {
                                                setShowWelcome(false)
                                                setCurrentStep(1)
                                            }}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all group"
                                        >
                    <span className="flex items-center justify-center text-base">
                      Start Setup
                      <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Step Content
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