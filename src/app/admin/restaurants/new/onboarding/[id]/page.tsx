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
import { useLanguage } from '@/contexts/LanguageContext'

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
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to fetch restaurant')
    return response.json()
}

async function getRestaurantOnboardingProgress(restaurantId: number) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/progress`, {
        headers: getAuthHeaders()
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to fetch progress')
    return response.json()
}

async function completePersonnelStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/1/personnel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to complete personnel step')
    return response.json()
}

async function completeStripeStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/2/stripe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to complete stripe step')
    return response.json()
}

async function completePOSStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/3/pos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to complete POS step')
    return response.json()
}

async function completeQRStandsStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/qr/configure`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to complete QR stands step')
    return response.json()
}

async function completeGoogleReviewsStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/5/google-reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to complete Google reviews step')
    return response.json()
}

async function completeTelegramStep(restaurantId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/6/telegram`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to complete telegram step')
    return response.json()
}

async function skipOnboardingStep(restaurantId: number, step: number) {
    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/step/${step}/skip`, {
        method: 'POST',
        headers: getAuthHeaders()
    })
    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }
    if (!response.ok) throw new Error('Failed to skip step')
    return response.json()
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
            name: t('onboarding.steps.personnel.name'),
            description: t('onboarding.steps.personnel.description'),
            icon: UserGroupIcon,
        },
        {
            id: 2,
            name: t('onboarding.steps.stripe.name'),
            description: t('onboarding.steps.stripe.description'),
            icon: CreditCardIcon,
        },
        {
            id: 3,
            name: t('onboarding.steps.pos.name'),
            description: t('onboarding.steps.pos.description'),
            icon: WifiIcon,
        },
        {
            id: 4,
            name: t('onboarding.steps.qr.name'),
            description: t('onboarding.steps.qr.description'),
            icon: QrCodeIcon,
        },
        {
            id: 5,
            name: t('onboarding.steps.googleReviews.name'),
            description: t('onboarding.steps.googleReviews.description'),
            icon: StarIcon,
        },
        {
            id: 6,
            name: t('onboarding.steps.telegram.name'),
            description: t('onboarding.steps.telegram.description'),
            icon: ChatBubbleLeftRightIcon,
        }
    ]

    // State
    const [restaurant, setRestaurant] = useState<any | null>(null)
    const [progress, setProgress] = useState<any | null>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [showWelcome, setShowWelcome] = useState(true)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Field-level error states
    const [posErrors, setPosErrors] = useState({
        pos_type: '',
        username: '',
        password: '',
        base_url: ''
    })

    const [personnelErrors, setPersonnelErrors] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    })

    const [qrErrors, setQrErrors] = useState({
        domain: '',
        tables: ''
    })

    const [googleErrors, setGoogleErrors] = useState({
        place_id: ''
    })

    const [telegramErrors, setTelegramErrors] = useState({
        restaurant_name: ''
    })

    // Step data states
    const [personnelData, setPersonnelData] = useState<any[]>([])
    const [stripeData, setStripeData] = useState<any>({ connected: false })
    const [posData, setPosData] = useState<any>({
        pos_type: '',
        username: '',
        password: '',
        base_url: '',
        port: '' // For MPLUS handling
    })

    const [qrStandData, setQrStandData] = useState({
        domain: '',
        notes: '',
        selected_tables: {}
    })
    const [tableSections, setTableSections] = useState([
        { id: 1, name: t('onboarding.qr.sections.inside'), table_numbers: '', selected_design: 1 }
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

    // POS Test states
    const [posTestResult, setPosTestResult] = useState<{
        success: boolean
        message: string
        show: boolean
    }>({ success: false, message: '', show: false })

    // Field validation functions
    const validatePersonnelStep = () => {
        const errors = {
            first_name: '',
            last_name: '',
            email: '',
            password: ''
        }

        let hasErrors = false

        if (personnelData.length === 0) {
            // If no personnel added, check if form is being filled
            if (showPersonForm) {
                if (!newPerson.first_name.trim()) {
                    errors.first_name = t('onboarding.personnel.validation.firstNameRequired')
                    hasErrors = true
                }
                if (!newPerson.last_name.trim()) {
                    errors.last_name = t('onboarding.personnel.validation.lastNameRequired')
                    hasErrors = true
                }
                if (!newPerson.email.trim()) {
                    errors.email = t('onboarding.personnel.validation.emailRequired')
                    hasErrors = true
                }
                if (!newPerson.password.trim()) {
                    errors.password = t('onboarding.personnel.validation.passwordRequired')
                    hasErrors = true
                }
            } else {
                // No personnel added and form not shown
                setError(t('onboarding.personnel.validation.atLeastOneMember'))
                return false
            }
        }

        setPersonnelErrors(errors)
        return !hasErrors
    }

    const validatePOSStep = () => {
        const errors = {
            pos_type: '',
            username: '',
            password: '',
            base_url: ''
        }

        let hasErrors = false

        if (!posData.pos_type.trim()) {
            errors.pos_type = t('onboarding.pos.validation.selectSystem')
            hasErrors = true
        }
        if (!posData.username.trim()) {
            errors.username = t('onboarding.pos.validation.usernameRequired')
            hasErrors = true
        }
        if (!posData.password.trim()) {
            errors.password = t('onboarding.pos.validation.passwordRequired')
            hasErrors = true
        }

        // Check base_url based on POS type
        if (posData.pos_type === 'mpluskassa') {
            if (!posData.port?.trim()) {
                errors.base_url = t('onboarding.pos.validation.portRequired')
                hasErrors = true
            }
        } else {
            if (!posData.base_url.trim()) {
                errors.base_url = t('onboarding.pos.validation.apiUrlRequired')
                hasErrors = true
            }
        }

        setPosErrors(errors)
        return !hasErrors
    }

    const validateQRStep = () => {
        const errors = {
            domain: '',
            tables: ''
        }

        let hasErrors = false

        if (!qrStandData.domain.trim()) {
            errors.domain = t('onboarding.qr.validation.domainRequired')
            hasErrors = true
        } else if (domainStatus !== 'available') {
            errors.domain = t('onboarding.qr.validation.checkDomainFirst')
            hasErrors = true
        }

        const hasValidTables = tableSections.some(section => {
            const numbers = section.table_numbers.split(',')
                .map(n => parseInt(n.trim()))
                .filter(n => !isNaN(n) && n > 0)
            return numbers.length > 0
        })

        if (!hasValidTables) {
            errors.tables = t('onboarding.qr.validation.atLeastOneTable')
            hasErrors = true
        }

        setQrErrors(errors)
        return !hasErrors
    }

    const validateGoogleStep = () => {
        const errors = {
            place_id: ''
        }

        let hasErrors = false

        if (!googleReviewData.place_id.trim()) {
            errors.place_id = t('onboarding.google.validation.placeIdRequired')
            hasErrors = true
        }

        setGoogleErrors(errors)
        return !hasErrors
    }

    const validateTelegramStep = () => {
        const errors = {
            restaurant_name: ''
        }

        let hasErrors = false

        if (!telegramData.restaurant_name.trim()) {
            errors.restaurant_name = t('onboarding.telegram.validation.restaurantNameRequired')
            hasErrors = true
        }

        setTelegramErrors(errors)
        return !hasErrors
    }

    // Reset all form states when restaurant ID changes
    useEffect(() => {
        if (restaurantId) {
            setPersonnelData([])
            setNewPerson({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                passwordConfirm: '',
                role: 'manager'
            })
            setPosData({
                pos_type: '',
                username: '',
                password: '',
                base_url: '',
                port: ''
            })
            setStripeData({ connected: false })
            setQrStandData({
                domain: '',
                notes: '',
                selected_tables: {}
            })
            setTableSections([
                { id: 1, name: t('onboarding.qr.sections.inside'), table_numbers: '', selected_design: 1 }
            ])
            setGoogleReviewData({
                place_id: '',
                review_link: ''
            })
            setTelegramData({
                restaurant_name: '',
                configured: false,
                group_link: ''
            })
            setShowPersonForm(false)
            setEmailError('')
            setPhoneError('')
            setPasswordError('')
            setCurrentStep(0)
            setShowWelcome(true)

            // Reset all error states
            setPosErrors({ pos_type: '', username: '', password: '', base_url: '' })
            setPersonnelErrors({ first_name: '', last_name: '', email: '', password: '' })
            setQrErrors({ domain: '', tables: '' })
            setGoogleErrors({ place_id: '' })
            setTelegramErrors({ restaurant_name: '' })
        }
    }, [restaurantId, t])

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
            if (stepNum >= 1 && stepNum <= 6) {
                setCurrentStep(stepNum)
                setShowWelcome(false)
            }
        }
    }, [searchParams, t])

    const loadRestaurantData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Reset all form states when loading new restaurant
            setPersonnelData([])
            setNewPerson({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                passwordConfirm: '',
                role: 'manager'
            })
            setPosData({
                pos_type: '',
                username: '',
                password: '',
                base_url: '',
                port: ''
            })
            setStripeData({ connected: false })
            setQrStandData({
                domain: '',
                notes: '',
                selected_tables: {}
            })
            setTableSections([
                { id: 1, name: t('onboarding.qr.sections.inside'), table_numbers: '', selected_design: 1 }
            ])
            setGoogleReviewData({
                place_id: '',
                review_link: ''
            })
            setShowPersonForm(false)
            setEmailError('')
            setPhoneError('')
            setPasswordError('')

            // Reset all error states
            setPosErrors({ pos_type: '', username: '', password: '', base_url: '' })
            setPersonnelErrors({ first_name: '', last_name: '', email: '', password: '' })
            setQrErrors({ domain: '', tables: '' })
            setGoogleErrors({ place_id: '' })
            setTelegramErrors({ restaurant_name: '' })

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

    // Updated step handler with validation
    const handleNextStep = async (stepNumber: number) => {
        try {
            setSaving(true)
            setError(null) // Clear general error

            // Clear all field errors first
            setPosErrors({ pos_type: '', username: '', password: '', base_url: '' })
            setPersonnelErrors({ first_name: '', last_name: '', email: '', password: '' })
            setQrErrors({ domain: '', tables: '' })
            setGoogleErrors({ place_id: '' })
            setTelegramErrors({ restaurant_name: '' })

            let isValid = false

            switch (stepNumber) {
                case 1:
                    isValid = validatePersonnelStep()
                    if (isValid) {
                        await completePersonnelStep(restaurantId, { personnel: personnelData })
                    }
                    break
                case 3:
                    isValid = validatePOSStep()
                    if (isValid) {
                        // Prepare POS data for backend
                        const posPayload = {
                            pos_type: posData.pos_type,
                            username: posData.username,
                            password: posData.password,
                            base_url: posData.pos_type === 'mpluskassa'
                                ? `https://api.mpluskassa.nl:${posData.port}`
                                : posData.base_url
                        }
                        await completePOSStep(restaurantId, posPayload)
                    }
                    break
                case 4:
                    isValid = validateQRStep()
                    if (isValid) {
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
                    }
                    break
                case 5:
                    isValid = validateGoogleStep()
                    if (isValid) {
                        await completeGoogleReviewsStep(restaurantId, googleReviewData)
                    }
                    break
            }

            if (isValid) {
                await refreshProgress()
                setCurrentStep(stepNumber + 1)
            }
        } catch (err: any) {
            setError(err.message || t('onboarding.errors.saveStepData', { step: stepNumber }))
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
            setPasswordError(t('onboarding.personnel.validation.passwordsNotMatch'))
            return
        }

        if (newPerson.password.length < 8) {
            setPasswordError(t('onboarding.personnel.validation.passwordMinLength'))
            return
        }

        // Check if email already exists in current personnel list
        const emailExists = personnelData.some(p => p.email.toLowerCase() === newPerson.email.toLowerCase())
        if (emailExists) {
            setEmailError(t('onboarding.personnel.validation.emailExists'))
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
                setError(t('onboarding.stripe.errors.generateOAuthUrl'))
            }
        } catch (err: any) {
            setError(t('onboarding.stripe.errors.startConnection'))
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
            setError(err.message || t('onboarding.stripe.errors.saveConfiguration'))
        } finally {
            setSaving(false)
        }
    }

    const addTableSection = () => {
        const newId = Math.max(...tableSections.map(s => s.id)) + 1
        setTableSections([...tableSections, {
            id: newId,
            name: t('onboarding.qr.sections.section', { number: newId }),
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
            setQrErrors({...qrErrors, domain: t('onboarding.qr.validation.enterDomain')})
            return
        }

        try {
            setDomainChecking(true)
            setQrErrors({...qrErrors, domain: ''})

            const result = await checkDomainAvailability(restaurantId, qrStandData.domain)

            // @ts-ignore
            setDomainStatus(result.available ? 'available' : 'taken')
            setDomainMessage(result.message)
        } catch (err: any) {
            setError(err.message || t('onboarding.qr.errors.checkDomainAvailability'))
        } finally {
            setDomainChecking(false)
        }
    }

    // Final onboarding completion - only for Telegram step
    const handleCompleteOnboarding = async () => {
        if (!validateTelegramStep()) {
            return
        }

        try {
            setTelegramCreating(true)
            setError(null)

            const result = await completeTelegramStep(restaurantId, telegramData)

            router.push('/admin/restaurants')
        } catch (err: any) {
            setError(err.message || t('onboarding.telegram.errors.createGroup'))
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
                router.push('/admin/restaurants')
            }
        } catch (err: any) {
            setError(err.message || t('onboarding.errors.skipStep'))
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
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.personnel.title')}</h3>
                                    <p className="text-sm text-gray-500">
                                        {t('onboarding.personnel.subtitle', { count: personnelData.length })}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            {/* Personnel List */}
                            {personnelData.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-sm font-medium text-gray-600 mb-4">{t('onboarding.personnel.addedUsers')}</h4>
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
                                {person.role === 'manager' ? t('onboarding.personnel.roles.manager') : t('onboarding.personnel.roles.staff')}
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
                                        <h4 className="text-base font-medium text-gray-900">{t('onboarding.personnel.addNewUser')}</h4>
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
                                                setPersonnelErrors({ first_name: '', last_name: '', email: '', password: '' })
                                            }}
                                            className="text-gray-500 hover:text-gray-700 transition p-1.5 hover:bg-white rounded-lg"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.firstName')}</label>
                                                <input
                                                    type="text"
                                                    value={newPerson.first_name}
                                                    onChange={(e) => {
                                                        setNewPerson({...newPerson, first_name: e.target.value})
                                                        setPersonnelErrors({...personnelErrors, first_name: ''})
                                                    }}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                                                        personnelErrors.first_name
                                                            ? 'border-red-500 focus:ring-red-500'
                                                            : 'border-gray-200 focus:ring-green-500'
                                                    }`}
                                                    placeholder={t('onboarding.personnel.form.firstNamePlaceholder')}
                                                />
                                                {personnelErrors.first_name && (
                                                    <div className="mt-1 flex items-center">
                                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                        <p className="text-sm text-red-600">{personnelErrors.first_name}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.lastName')}</label>
                                                <input
                                                    type="text"
                                                    value={newPerson.last_name}
                                                    onChange={(e) => {
                                                        setNewPerson({...newPerson, last_name: e.target.value})
                                                        setPersonnelErrors({...personnelErrors, last_name: ''})
                                                    }}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                                                        personnelErrors.last_name
                                                            ? 'border-red-500 focus:ring-red-500'
                                                            : 'border-gray-200 focus:ring-green-500'
                                                    }`}
                                                    placeholder={t('onboarding.personnel.form.lastNamePlaceholder')}
                                                />
                                                {personnelErrors.last_name && (
                                                    <div className="mt-1 flex items-center">
                                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                        <p className="text-sm text-red-600">{personnelErrors.last_name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.email')}</label>
                                            <input
                                                type="email"
                                                value={newPerson.email}
                                                onChange={(e) => {
                                                    setNewPerson({...newPerson, email: e.target.value})
                                                    setEmailError('')
                                                    setPersonnelErrors({...personnelErrors, email: ''})
                                                }}
                                                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                                                    emailError || personnelErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                                                }`}
                                                placeholder={t('onboarding.personnel.form.emailPlaceholder')}
                                            />
                                            {(emailError || personnelErrors.email) && (
                                                <div className="mt-1 flex items-center">
                                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                    <p className="text-sm text-red-600">{emailError || personnelErrors.email}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.phone')}</label>
                                            <input
                                                type="tel"
                                                value={newPerson.phone}
                                                onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder={t('onboarding.personnel.form.phonePlaceholder')}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.password')}</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPerson.password}
                                                    onChange={(e) => {
                                                        setNewPerson({...newPerson, password: e.target.value})
                                                        setPasswordError('')
                                                        setPersonnelErrors({...personnelErrors, password: ''})
                                                    }}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent pr-12 ${
                                                        passwordError || personnelErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                                                    }`}
                                                    placeholder={t('onboarding.personnel.form.passwordPlaceholder')}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                                >
                                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {(passwordError || personnelErrors.password) && (
                                                <div className="mt-1 flex items-center">
                                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                    <p className="text-sm text-red-600">{passwordError || personnelErrors.password}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.personnel.form.confirmPassword')}</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswordConfirm ? "text" : "password"}
                                                    value={newPerson.passwordConfirm}
                                                    onChange={(e) => setNewPerson({...newPerson, passwordConfirm: e.target.value})}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                                                    placeholder={t('onboarding.personnel.form.confirmPasswordPlaceholder')}
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
                                            <label className="block text-sm font-medium text-gray-600 mb-3">{t('onboarding.personnel.form.role')}</label>
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
                                                    }`}>{t('onboarding.personnel.roles.manager')}</p>
                                                    <p className="text-xs mt-0.5 text-gray-500">{t('onboarding.personnel.roles.managerAccess')}</p>
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
                                                    }`}>{t('onboarding.personnel.roles.staff')}</p>
                                                    <p className="text-xs mt-0.5 text-gray-500">{t('onboarding.personnel.roles.staffAccess')}</p>
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddPerson}
                                            disabled={!newPerson.first_name || !newPerson.last_name || !newPerson.email || !newPerson.password || !newPerson.passwordConfirm}
                                            className="w-full px-4 py-2.5 bg-[#2BE89A] text-black font-medium rounded-lg hover:bg-[#2BE89A]/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            {t('onboarding.personnel.addUser')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowPersonForm(true)}
                                    className="w-full px-5 py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2BE89A] hover:bg-gray-50 transition-all group"
                                >
                                    <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-gray-400 group-hover:text-[#2BE89A] transition" />
                                    <p className="text-sm font-medium group-hover:text-gray-900 transition">{t('onboarding.personnel.addNewUser')}</p>
                                </button>
                            )}

                            <div className="mt-6 bg-[#2BE89A]/5 rounded-lg p-3.5 border border-[#2BE89A]/20">
                                <p className="text-xs text-gray-600">
                                    <span className="text-[#2BE89A] font-medium">{t('onboarding.common.tip')}</span> {t('onboarding.personnel.tip')}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(1)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {t('onboarding.common.skipStep')}
                            </button>
                            <button
                                onClick={() => handleNextStep(1)}
                                disabled={saving || personnelData.length === 0}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            >
                                {saving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
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
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.stripe.title')}</h3>
                                    <p className="text-sm text-gray-500">
                                        {t('onboarding.stripe.subtitle', { restaurant: restaurant?.name })}
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
                                            <h4 className="text-base font-medium text-gray-900">{t('onboarding.stripe.connected')}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {t('onboarding.stripe.connectedDescription')}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                            <h4 className="text-base font-medium text-gray-900 mb-3">{t('onboarding.stripe.connectWith')}</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                {t('onboarding.stripe.connectDescription', { restaurant: restaurant?.name })}
                                            </p>

                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <ShieldCheckIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                                    <p className="text-xs text-gray-600 text-center">{t('onboarding.stripe.features.pciCompliant')}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <ClockIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                                    <p className="text-xs text-gray-600 text-center">{t('onboarding.stripe.features.dailyPayouts')}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <SparklesIcon className="h-5 w-5 text-[#2BE89A] mx-auto mb-2" />
                                                    <p className="text-xs text-gray-600 text-center">{t('onboarding.stripe.features.realTimeInsights')}</p>
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
                                                    {t('onboarding.stripe.connecting')}
                                                </>
                                            ) : (
                                                <>
                                                    <span>{t('onboarding.stripe.connectWith')}</span>
                                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                                </>
                                            )}
                                        </button>

                                        <div className="bg-[#2BE89A]/5 rounded-lg p-3.5 border border-[#2BE89A]/20">
                                            <p className="text-xs text-gray-600">
                                                <span className="text-[#2BE89A] font-medium">{t('onboarding.common.secure')}</span> {t('onboarding.stripe.securityNote')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(2)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {t('onboarding.common.skipStep')}
                            </button>
                            {progress?.stripe_connected && (
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition"
                                >
                                    {t('onboarding.common.nextStep')}
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
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.pos.title')}</h3>
                                    <p className="text-sm text-gray-500">
                                        {t('onboarding.pos.subtitle', { restaurant: restaurant?.name })}
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
                                            {t('onboarding.pos.form.posSystem')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={posData.pos_type}
                                            onChange={(e) => {
                                                const newPosType = e.target.value
                                                setPosData({
                                                    ...posData,
                                                    pos_type: newPosType,
                                                    base_url: newPosType === 'mpluskassa' ? '' : posData.base_url,
                                                    port: newPosType === 'mpluskassa' ? '' : undefined
                                                })
                                                setPosErrors({...posErrors, pos_type: ''})
                                            }}
                                            className={`w-full px-3 py-2.5 bg-white border rounded-md text-gray-900 text-sm focus:outline-none transition-colors ${
                                                posErrors.pos_type
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                    : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                            }`}
                                        >
                                            <option value="">{t('onboarding.pos.form.selectPosSystem')}</option>
                                            <option value="untill">Untill</option>
                                            <option value="lightspeed">Lightspeed</option>
                                            <option value="mpluskassa">M+ Kassa</option>
                                            <option value="other">{t('onboarding.pos.form.other')}</option>
                                        </select>
                                        {posErrors.pos_type && (
                                            <div className="mt-1 flex items-center">
                                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                <p className="text-sm text-red-600">{posErrors.pos_type}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                                {t('onboarding.pos.form.username')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={posData.username}
                                                onChange={(e) => {
                                                    setPosData({...posData, username: e.target.value})
                                                    setPosErrors({...posErrors, username: ''})
                                                }}
                                                className={`w-full px-3 py-2.5 bg-white border rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                                    posErrors.username
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                        : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                                }`}
                                                placeholder={t('onboarding.pos.form.usernamePlaceholder')}
                                            />
                                            {posErrors.username && (
                                                <div className="mt-1 flex items-center">
                                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                    <p className="text-sm text-red-600">{posErrors.username}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                                {t('onboarding.pos.form.password')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={posData.password}
                                                onChange={(e) => {
                                                    setPosData({...posData, password: e.target.value})
                                                    setPosErrors({...posErrors, password: ''})
                                                }}
                                                className={`w-full px-3 py-2.5 bg-white border rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                                    posErrors.password
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                        : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                                }`}
                                                placeholder={t('onboarding.pos.form.passwordPlaceholder')}
                                            />
                                            {posErrors.password && (
                                                <div className="mt-1 flex items-center">
                                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                    <p className="text-sm text-red-600">{posErrors.password}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* API URL - Dynamic based on POS type */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                            {posData.pos_type === 'mpluskassa'
                                                ? t('onboarding.pos.form.port')
                                                : t('onboarding.pos.form.apiUrl')
                                            } <span className="text-red-500">*</span>
                                        </label>

                                        {posData.pos_type === 'mpluskassa' ? (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 text-sm">https://api.mpluskassa.nl:</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="34562"
                                                        value={posData.port || ''}
                                                        onChange={(e) => {
                                                            const port = e.target.value
                                                            setPosData({
                                                                ...posData,
                                                                port: port,
                                                                base_url: port ? `https://api.mpluskassa.nl:${port}` : ''
                                                            })
                                                            setPosErrors({...posErrors, base_url: ''})
                                                        }}
                                                        className={`w-full pl-48 pr-3 py-2.5 bg-white border rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                                            posErrors.base_url
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                                : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                                        }`}
                                                    />
                                                </div>
                                                {posData.port && (
                                                    <p className="text-xs text-gray-600">
                                                        Full URL: https://api.mpluskassa.nl:{posData.port}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="https://api.example.com"
                                                value={posData.base_url}
                                                onChange={(e) => {
                                                    setPosData({...posData, base_url: e.target.value})
                                                    setPosErrors({...posErrors, base_url: ''})
                                                }}
                                                className={`w-full px-3 py-2.5 bg-white border rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                                    posErrors.base_url
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                        : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                                }`}
                                            />
                                        )}

                                        {posErrors.base_url && (
                                            <div className="mt-1 flex items-center">
                                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                <p className="text-sm text-red-600">{posErrors.base_url}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Test Connection Button */}
                                    <div className="pt-3 border-t border-gray-200">
                                        <button
                                            onClick={async () => {
                                                // Clear errors first
                                                setPosErrors({ pos_type: '', username: '', password: '', base_url: '' })
                                                setPosTestResult({ success: false, message: '', show: false })

                                                // Validate required fields
                                                if (!posData.pos_type || !posData.username || !posData.password) {
                                                    setPosTestResult({
                                                        success: false,
                                                        message: t('onboarding.pos.validation.allFieldsRequired'),
                                                        show: true
                                                    })
                                                    return
                                                }

                                                const fullBaseUrl = posData.pos_type === 'mpluskassa' && posData.port
                                                    ? `https://api.mpluskassa.nl:${posData.port}`
                                                    : posData.base_url

                                                if (!fullBaseUrl) {
                                                    setPosTestResult({
                                                        success: false,
                                                        message: t('onboarding.pos.validation.apiUrlRequired'),
                                                        show: true
                                                    })
                                                    return
                                                }

                                                try {
                                                    setSaving(true)

                                                    const testData = {
                                                        pos_type: posData.pos_type,
                                                        username: posData.username,
                                                        password: posData.password,
                                                        base_url: fullBaseUrl
                                                    }

                                                    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/pos/test`, {
                                                        method: 'POST',
                                                        headers: getAuthHeaders(),
                                                        body: JSON.stringify(testData)
                                                    })

                                                    if (response.status === 401) {
                                                        localStorage.removeItem('auth_token')
                                                        sessionStorage.removeItem('auth_token')
                                                        window.location.href = '/login'
                                                        return
                                                    }

                                                    const result = await response.json()

                                                    if (response.ok && result.status_code === 200) {
                                                        setPosTestResult({
                                                            success: true,
                                                            message: result.message || t('onboarding.pos.test.success'),
                                                            show: true
                                                        })
                                                    } else {
                                                        setPosTestResult({
                                                            success: false,
                                                            message: result.message || t('onboarding.pos.test.failed'),
                                                            show: true
                                                        })
                                                    }
                                                } catch (err: any) {
                                                    setPosTestResult({
                                                        success: false,
                                                        message: err.message || t('onboarding.pos.test.failed'),
                                                        show: true
                                                    })
                                                } finally {
                                                    setSaving(false)
                                                }
                                            }}
                                            disabled={saving || !posData.pos_type || !posData.username || !posData.password || (!posData.base_url && (!posData.port || posData.pos_type !== 'mpluskassa'))}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? (
                                                <>
                                                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin inline" />
                                                    {t('onboarding.pos.test.testing')}
                                                </>
                                            ) : (
                                                <>
                                                    <WifiIcon className="h-4 w-4 mr-2 inline" />
                                                    {t('onboarding.pos.test.button')}
                                                </>
                                            )}
                                        </button>

                                        {/* Test Result Display */}
                                        {posTestResult.show && (
                                            <div className={`mt-4 p-4 rounded-lg border ${
                                                posTestResult.success
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-red-50 border-red-200'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {posTestResult.success ? (
                                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                                        ) : (
                                                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                                        )}
                                                        <p className={`text-sm font-medium ${
                                                            posTestResult.success ? 'text-green-800' : 'text-red-800'
                                                        }`}>
                                                            {posTestResult.message}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setPosTestResult({ success: false, message: '', show: false })}
                                                        className={`p-1 rounded-md ${
                                                            posTestResult.success
                                                                ? 'text-green-500 hover:text-green-700 hover:bg-green-100'
                                                                : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                                                        } transition`}
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(3)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {t('onboarding.common.skipStep')}
                            </button>
                            <button
                                onClick={() => handleNextStep(3)}
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            >
                                {saving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
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
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.qr.title')}</h3>
                                    <p className="text-sm text-gray-500">
                                        {t('onboarding.qr.subtitle', { restaurant: restaurant?.name })}
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
                                        {t('onboarding.qr.domain.title')}
                                    </label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">{t('onboarding.qr.domain.name')}</label>
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
                                                            setQrErrors({...qrErrors, domain: ''})
                                                        }}
                                                        placeholder={t('onboarding.qr.domain.placeholder')}
                                                        className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-colors ${
                                                            qrErrors.domain
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                                : 'border-gray-200 focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A]'
                                                        }`}
                                                    />
                                                    {qrErrors.domain && (
                                                        <div className="mt-1 flex items-center">
                                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                            <p className="text-sm text-red-600">{qrErrors.domain}</p>
                                                        </div>
                                                    )}
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
                                                            {t('onboarding.qr.domain.checking')}
                                                        </>
                                                    ) : (
                                                        t('onboarding.qr.domain.checkDomain')
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
                                                {t('onboarding.qr.domain.note', { domain: qrStandData.domain || t('onboarding.qr.domain.yourDomain') })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Available Designs */}
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <label className="block text-xs font-medium text-gray-700 mb-4 uppercase tracking-wider">
                                        {t('onboarding.qr.designs.title')}
                                    </label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {[
                                            { id: 1, name: t('onboarding.qr.designs.design1'), image: '/images/qr-design-1.png' },
                                            { id: 2, name: t('onboarding.qr.designs.design2'), image: '/images/qr-design-2.png' },
                                            { id: 3, name: t('onboarding.qr.designs.design3'), image: '/images/qr-design-3.png' },
                                            { id: 4, name: t('onboarding.qr.designs.design4'), image: '/images/qr-design-4.png' }
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
                                        {t('onboarding.qr.designs.selectNote')}
                                    </p>
                                </div>

                                {/* Dynamic Table Sections */}
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            {t('onboarding.qr.sections.title')}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addTableSection}
                                            className="inline-flex items-center px-3 py-1.5 bg-[#2BE89A] text-black text-xs font-medium rounded-md hover:bg-[#2BE89A]/90 transition"
                                        >
                                            <span className="text-lg mr-1">+</span>
                                            {t('onboarding.qr.sections.addSection')}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {tableSections.map((section, index) => (
                                            <div key={section.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex-1 mr-4">
                                                        <label className="block text-xs text-gray-600 mb-1.5">{t('onboarding.qr.sections.sectionName')}</label>
                                                        <input
                                                            type="text"
                                                            value={section.name}
                                                            onChange={(e) => updateTableSection(section.id, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                            placeholder={t('onboarding.qr.sections.sectionNamePlaceholder')}
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
                                                        <label className="block text-xs text-gray-600 mb-1.5">{t('onboarding.qr.sections.tableNumbers')}</label>
                                                        <input
                                                            type="text"
                                                            value={section.table_numbers}
                                                            onChange={(e) => updateTableSection(section.id, 'table_numbers', e.target.value)}
                                                            placeholder={t('onboarding.qr.sections.tableNumbersPlaceholder')}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {t('onboarding.qr.sections.tablesCount', {
                                                                count: section.table_numbers ?
                                                                    section.table_numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0).length : 0
                                                            })}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1.5">{t('onboarding.qr.sections.design')}</label>
                                                        <select
                                                            value={section.selected_design}
                                                            onChange={(e) => updateTableSection(section.id, 'selected_design', parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                        >
                                                            <option value={1}>{t('onboarding.qr.designs.design1')}</option>
                                                            <option value={2}>{t('onboarding.qr.designs.design2')}</option>
                                                            <option value={3}>{t('onboarding.qr.designs.design3')}</option>
                                                            <option value={4}>{t('onboarding.qr.designs.design4')}</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Calculator */}
                                    <div className="bg-white rounded-md p-3 border border-gray-200 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">{t('onboarding.qr.sections.totalTables')}</span>
                                            <span className="text-lg font-bold text-[#2BE89A]">
                                    {tableSections.reduce((total, section) => {
                                        const count = section.table_numbers ?
                                            section.table_numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0).length : 0
                                        return total + count
                                    }, 0)}
                                </span>
                                        </div>
                                    </div>

                                    {qrErrors.tables && (
                                        <div className="mt-2 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                            <p className="text-sm text-red-600">{qrErrors.tables}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Notes Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        {t('onboarding.qr.notes.title')}
                                    </label>
                                    <textarea
                                        value={qrStandData.notes}
                                        onChange={(e) => setQrStandData({...qrStandData, notes: e.target.value})}
                                        placeholder={t('onboarding.qr.notes.placeholder')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors resize-none"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(4)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {t('onboarding.common.skipStep')}
                            </button>
                            <button
                                onClick={() => handleNextStep(4)}
                                disabled={saving || !qrStandData.domain || domainStatus !== 'available'}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            >
                                {saving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
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
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.google.title')}</h3>
                                    <p className="text-sm text-gray-500">
                                        {t('onboarding.google.subtitle', { restaurant: restaurant?.name })}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <StarIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Instructions */}
                                <div className="bg-[#2BE89A]/5 rounded-lg p-5 border border-[#2BE89A]/20">
                                    <h4 className="text-base font-medium text-gray-900 mb-3">{t('onboarding.google.setup', { restaurant: restaurant?.name })}</h4>

                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step1', { restaurant: restaurant?.name })}</p>
                                                <a
                                                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#2BE89A] hover:text-[#2BE89A]/80 underline"
                                                >
                                                    {t('onboarding.google.placeIdFinder')}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step2')}</p>
                                                <p className="text-gray-600">{t('onboarding.google.step2Description', { restaurant: restaurant?.name })}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step3')}</p>
                                                <p className="text-gray-600">{t('onboarding.google.step3Description')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-[#2BE89A] text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">{t('onboarding.google.step4')}</p>
                                                <p className="text-gray-600">{t('onboarding.google.step4Description', { restaurant: restaurant?.name })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Place ID Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('onboarding.google.placeId')}
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
                                            setGoogleErrors({...googleErrors, place_id: ''})
                                        }}
                                        placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-colors ${
                                            googleErrors.place_id
                                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:border-[#2BE89A] focus:ring-2 focus:ring-[#2BE89A]/20'
                                        }`}
                                    />
                                    {googleErrors.place_id && (
                                        <div className="mt-1 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                            <p className="text-sm text-red-600">{googleErrors.place_id}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Generated Link */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('onboarding.google.reviewLink')}
                                    </label>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-sm text-gray-700 font-mono break-all">
                                            https://search.google.com/local/writereview?placeid={googleReviewData.place_id || 'PLACE_ID'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{t('onboarding.google.changeLater')}</p>
                                </div>

                                {googleReviewData.place_id && (
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <p className="text-sm text-green-700">
                                                {t('onboarding.google.customerRedirection')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(5)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {t('onboarding.common.skipStep')}
                            </button>
                            <button
                                onClick={() => handleNextStep(5)}
                                disabled={saving || !googleReviewData.place_id}
                                className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
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
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.telegram.title')}</h3>
                                    <p className="text-sm text-gray-500">
                                        {t('onboarding.telegram.subtitle', { restaurant: restaurant?.name })}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        {t('onboarding.telegram.restaurantName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={telegramData.restaurant_name}
                                        onChange={(e) => {
                                            setTelegramData({...telegramData, restaurant_name: e.target.value})
                                            setTelegramErrors({...telegramErrors, restaurant_name: ''})
                                        }}
                                        placeholder={restaurant?.name}
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
                                            telegramErrors.restaurant_name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                                        }`}
                                    />
                                    {telegramErrors.restaurant_name && (
                                        <div className="mt-1 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                                            <p className="text-sm text-red-600">{telegramErrors.restaurant_name}</p>
                                        </div>
                                    )}
                                </div>

                                {telegramGroupLink && (
                                    <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-900">{t('onboarding.telegram.groupCreated')}</p>
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
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t('onboarding.telegram.features.title')}</h4>
                                    <ul className="space-y-2 text-xs text-gray-600">
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                            {t('onboarding.telegram.features.orderNotifications')}
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                            {t('onboarding.telegram.features.paymentConfirmations')}
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-[#2BE89A] mr-2" />
                                            {t('onboarding.telegram.features.dailySummaries')}
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                                    <p className="text-sm text-gray-700">
                                        <CheckCircleIcon className="h-5 w-5 text-[#2BE89A] inline mr-2" />
                                        {t('onboarding.telegram.completionNote', { restaurant: restaurant?.name })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleSkipStep(6)}
                                disabled={saving}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {t('onboarding.telegram.skipAndFinish')}
                            </button>
                            <button
                                onClick={handleCompleteOnboarding}
                                disabled={telegramCreating || !telegramData.restaurant_name}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                            >
                                {telegramCreating ? (
                                    <>
                                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                        {t('onboarding.telegram.completing')}
                                    </>
                                ) : (
                                    <>
                                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                                        {t('onboarding.telegram.submitAndComplete')}
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
                                <h1 className="text-xl font-semibold text-gray-900">{restaurant.name} - {t('onboarding.header.title')}</h1>
                                <p className="text-sm text-gray-600">
                                    {t('onboarding.header.subtitle', { step: currentStep })}
                                    {progress && ` • ${t('onboarding.header.progress', { completed: progress.completed_steps.length })}`}
                                </p>
                            </div>
                        </div>
                        {progress && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {t('onboarding.header.stepsCount', { completed: progress.completed_steps.length })}
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
                                                <span className="text-xs font-medium text-gray-700">{t('onboarding.sidebar.progress')}</span>
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
                                            <h3 className="font-semibold text-sm text-gray-900">{t('onboarding.sidebar.welcome.title')}</h3>
                                            <p className="text-xs text-gray-500">{t('onboarding.sidebar.welcome.description')}</p>
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
                                                {t('onboarding.welcome.title', { restaurant: restaurant.name })}
                                            </h1>
                                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                                {t('onboarding.welcome.description', { restaurant: restaurant.name })}
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
                      {t('onboarding.welcome.startSetup')}
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