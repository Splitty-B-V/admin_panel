'use client'

import { useState, useEffect } from 'react'
import {
    QrCodeIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XMarkIcon,
    TrashIcon,
    DocumentIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { env } from '@/lib/env'

const API_BASE_URL = `http://${env.apiUrl}/${env.apiVersion}`

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// API request handler
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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `API Error: ${response.statusText}`)
    }

    return response.json()
}

// API Functions for Sections and Tables
async function createSection(restaurantId: number, name: string, design: string, sectionPlanUrl?: string | null) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections`, {
        method: 'POST',
        body: JSON.stringify({
            name,
            design,
            section_plan_url: sectionPlanUrl || null
        })
    })
}

async function createTablesBatch(restaurantId: number, sectionId: number, tableNumbers: number[]) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/${sectionId}/tables/batch`, {
        method: 'POST',
        body: JSON.stringify({
            table_numbers: tableNumbers
        })
    })
}

async function getRestaurantSections(restaurantId: number) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections`)
}

async function getRestaurantDomainNotes(restaurantId: number) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/qr/domain-notes`)
}

async function updateRestaurantDomainNotes(restaurantId: number, domain: string, notes: string) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/qr/domain-notes`, {
        method: 'POST',
        body: JSON.stringify({
            domain,
            notes
        })
    })
}

async function checkDomainAvailability(restaurantId: number, domain: string) {
    return apiRequest(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/qr/check-domain`, {
        method: 'POST',
        body: JSON.stringify({ domain })
    })
}

// Upload floor plan for NEW sections (temp upload without section_id)
async function uploadTempFloorPlan(restaurantId: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/upload-floor-plan-temp`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        }
    )

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Unauthorized')
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `API Error: ${response.statusText}`)
    }

    return response.json()
}

// Upload floor plan for EXISTING sections (with section_id)
async function uploadSectionFloorPlan(restaurantId: number, sectionId: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/${sectionId}/upload-floor-plan`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        }
    )

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Unauthorized')
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `API Error: ${response.statusText}`)
    }

    return response.json()
}

// Delete floor plan from EXISTING section
async function deleteSectionFloorPlan(restaurantId: number, sectionId: number) {
    return apiRequest(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/${sectionId}/floor-plan`,
        {
            method: 'DELETE'
        }
    )
}

interface TableSection {
    id: number
    name: string
    tableCount: number
    tableNumbers: number[]
    selected_design: number
    originalTableNumbers?: number[]
    section_plan_url?: string | null
    uploadingPlan?: boolean
}

interface QRStandsStepProps {
    restaurantId: number
    restaurantName: string
    onSkipStep: () => void
    onNextStep: () => void
    saving: boolean
}

export default function QRStandsStep({
                                         restaurantId,
                                         restaurantName,
                                         onSkipStep,
                                         onNextStep,
                                         saving
                                     }: QRStandsStepProps) {
    const { t } = useLanguage()

    // Внутренний стейт компонента
    const [tableSections, setTableSections] = useState<TableSection[]>([{
        id: Date.now(),
        name: '',
        tableCount: 0,
        tableNumbers: [],
        selected_design: 1,
        section_plan_url: null
    }])

    const [qrStandData, setQrStandData] = useState({
        domain: '',
        notes: ''
    })

    const [qrErrors, setQrErrors] = useState({
        domain: '',
        tables: ''
    })

    const [domainChecking, setDomainChecking] = useState(false)
    const [domainStatus, setDomainStatus] = useState<'available' | 'taken' | null>(null)
    const [domainMessage, setDomainMessage] = useState('')

    const [internalSaving, setInternalSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Reverse mapping для дизайнов: с бекенда на фронтенд
    const designToNumber = (design: string | null): number => {
        if (!design) return 1

        const mapping: { [key: string]: number } = {
            'Splitty Oak Display 4': 1,
            'Splitty Steel Plate 1B': 2,
            'design3': 3,
            'design4': 4
        }

        return mapping[design] || 1
    }

    // Загрузка существующих секций и столов
    useEffect(() => {
        const loadExistingData = async () => {
            try {
                setLoading(true)

                const [sections, domainNotesData] = await Promise.all([
                    getRestaurantSections(restaurantId),
                    getRestaurantDomainNotes(restaurantId)
                ])

                if (sections && sections.length > 0) {
                    const mappedSections = sections.map((section: any) => {
                        const tableNumbers = section.tables?.map((table: any) => table.table_number).sort((a: number, b: number) => a - b) || []
                        return {
                            id: section.id,
                            name: section.name,
                            tableCount: tableNumbers.length,
                            tableNumbers: [...tableNumbers],
                            originalTableNumbers: [...tableNumbers],
                            selected_design: designToNumber(section.design),
                            section_plan_url: section.section_plan_url || null
                        }
                    })

                    setTableSections(mappedSections)
                } else {
                    setTableSections([{
                        id: Date.now(),
                        name: '',
                        tableCount: 0,
                        tableNumbers: [],
                        selected_design: 1,
                        section_plan_url: null
                    }])
                }

                if (domainNotesData) {
                    setQrStandData({
                        domain: domainNotesData.domain || '',
                        notes: domainNotesData.notes || ''
                    })

                    if (domainNotesData.domain) {
                        setDomainStatus('available')
                        setDomainMessage('Domain is configured for this restaurant')
                    }
                }
            } catch (err: any) {
                console.error('Error loading sections:', err)
                setTableSections([{
                    id: Date.now(),
                    name: '',
                    tableCount: 0,
                    tableNumbers: [],
                    selected_design: 1,
                    section_plan_url: null
                }])
            } finally {
                setLoading(false)
            }
        }

        if (restaurantId) {
            loadExistingData()
        }
    }, [restaurantId])

    const addTableSection = () => {
        const newId = Date.now()

        setTableSections([...tableSections, {
            id: newId,
            name: '',
            tableCount: 0,
            tableNumbers: [],
            selected_design: 1,
            section_plan_url: null
        }])
    }

    const removeTableSection = (id: number) => {
        if (tableSections.length > 1) {
            setTableSections(tableSections.filter(s => s.id !== id))
        }
    }

    const getNextSuggestedNumber = (index: number) => {
        let maxNumber = 0
        for (let i = 0; i <= index; i++) {
            const sectionNumbers = tableSections[i].tableNumbers
            if (sectionNumbers && sectionNumbers.length > 0) {
                maxNumber = Math.max(maxNumber, ...sectionNumbers)
            }
        }
        return maxNumber + 1
    }

    const handleTableCountChange = (index: number, newCount: number) => {
        const newSections = [...tableSections]
        newSections[index].tableCount = newCount

        if (!newSections[index].tableNumbers) {
            newSections[index].tableNumbers = []
        }

        const currentNumbers = newSections[index].tableNumbers

        if (newCount > currentNumbers.length) {
            const numbersToAdd = newCount - currentNumbers.length
            let nextNum = getNextSuggestedNumber(index)
            for (let i = 0; i < numbersToAdd; i++) {
                currentNumbers.push(nextNum++)
            }
        } else if (newCount < currentNumbers.length) {
            newSections[index].tableNumbers = currentNumbers.slice(0, newCount)
        }

        setTableSections(newSections)
    }

    const handleTableNumberChange = (sectionIndex: number, tableIndex: number, value: string) => {
        const newSections = [...tableSections]

        if (!newSections[sectionIndex].tableNumbers) {
            newSections[sectionIndex].tableNumbers = []
        }

        const currentNumbers = [...newSections[sectionIndex].tableNumbers]
        currentNumbers[tableIndex] = parseInt(value) || 0
        newSections[sectionIndex].tableNumbers = currentNumbers
        setTableSections(newSections)
    }

    // Floor Plan Upload Handler
    const handleFloorPlanUpload = async (sectionIndex: number, file: File) => {
        const section = tableSections[sectionIndex]

        // Валідація типу файлу
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Please upload JPG, PNG, WEBP or PDF')
            return
        }

        // Валідація розміру файлу (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            setError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 5MB`)
            return
        }

        try {
            // Set uploading state
            setTableSections(prevSections =>
                prevSections.map((s, idx) =>
                    idx === sectionIndex
                        ? { ...s, uploadingPlan: true }  // Створюємо НОВИЙ об'єкт
                        : s
                )
            )
            setError(null)

            // Перевіряємо чи це нова секція (id > 1000000000000) чи існуюча
            const isNewSection = section.id > 1000000000000

            let uploadedUrl: string

            if (isNewSection) {
                // Для НОВИХ секцій - загружаємо temp без section_id
                const result = await uploadTempFloorPlan(restaurantId, file)
                uploadedUrl = result.url
                console.log('Temp floor plan uploaded:', uploadedUrl)
            } else {
                // Для ІСНУЮЧИХ секцій - загружаємо з section_id і відразу оновлюємо в БД
                const result = await uploadSectionFloorPlan(restaurantId, section.id, file)
                uploadedUrl = result.url
                console.log('Floor plan uploaded for existing section:', uploadedUrl)
            }

            // Update with uploaded URL
            setTableSections(prevSections =>
                prevSections.map((s, idx) =>
                    idx === sectionIndex
                        ? { ...s, section_plan_url: uploadedUrl, uploadingPlan: false }  // Створюємо НОВИЙ об'єкт
                        : s
                )
            )

        } catch (err: any) {
            console.error('Error uploading floor plan:', err)
            setError(err.message || 'Failed to upload floor plan')

            // Clear uploading state on error
            setTableSections(prevSections =>
                prevSections.map((s, idx) =>
                    idx === sectionIndex
                        ? { ...s, uploadingPlan: false }  // Створюємо НОВИЙ об'єкт
                        : s
                )
            )
        }
    }

    // Floor Plan Remove Handler
    const handleFloorPlanRemove = async (sectionIndex: number) => {
        const section = tableSections[sectionIndex]

        try {
            setError(null)

            const isNewSection = section.id > 1000000000000

            if (isNewSection) {
                // Для нових секцій - просто очищаємо state
                setTableSections(prevSections =>
                    prevSections.map((s, idx) =>
                        idx === sectionIndex
                            ? { ...s, section_plan_url: null }  // Створюємо НОВИЙ об'єкт
                            : s
                    )
                )
            } else {
                // Для існуючих секцій - викликаємо API для видалення
                await deleteSectionFloorPlan(restaurantId, section.id)

                setTableSections(prevSections =>
                    prevSections.map((s, idx) =>
                        idx === sectionIndex
                            ? { ...s, section_plan_url: null }  // Створюємо НОВИЙ об'єкт
                            : s
                    )
                )
                console.log('Floor plan deleted for existing section')
            }

        } catch (err: any) {
            console.error('Error removing floor plan:', err)
            setError(err.message || 'Failed to remove floor plan')
        }
    }

    const handleCheckDomain = async () => {
        if (!qrStandData.domain.trim()) {
            setQrErrors({...qrErrors, domain: t('onboarding.qr.validation.enterDomain') || 'Please enter a domain'})
            return
        }

        try {
            setDomainChecking(true)
            setQrErrors({...qrErrors, domain: ''})

            const result = await checkDomainAvailability(restaurantId, qrStandData.domain)

            setDomainStatus(result.available ? 'available' : 'taken')
            setDomainMessage(result.message)
        } catch (err: any) {
            setError(err.message || 'Failed to check domain availability')
        } finally {
            setDomainChecking(false)
        }
    }

    const validateStep = () => {
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
            const numbers = section.tableNumbers || []
            return numbers.filter(n => n > 0).length > 0
        })

        if (!hasValidTables) {
            errors.tables = t('onboarding.qr.validation.atLeastOneTable')
            hasErrors = true
        }

        const sectionsWithTables = tableSections.filter(section => {
            const numbers = section.tableNumbers || []
            return numbers.filter(n => n > 0).length > 0
        })

        const hasEmptyNames = sectionsWithTables.some(section => !section.name.trim())
        if (hasEmptyNames) {
            errors.tables = t('onboarding.qr.validation.sectionNameRequired') || 'Please fill in all section names'
            hasErrors = true
        }

        setQrErrors(errors)
        return !hasErrors
    }

    const handleSaveAndNext = async () => {
        if (!validateStep()) {
            return
        }

        try {
            setInternalSaving(true)
            setError(null)

            // 1. Зберігаємо domain і notes
            await updateRestaurantDomainNotes(
                restaurantId,
                qrStandData.domain,
                qrStandData.notes || ''
            )

            // 2. Обробляємо секції
            const sectionsToProcess = tableSections.filter(section => {
                const validNumbers = (section.tableNumbers || []).filter(n => n > 0)
                return validNumbers.length > 0 && section.name.trim()
            })

            if (sectionsToProcess.length === 0) {
                throw new Error('No valid sections to create')
            }

            const designMap: { [key: number]: string } = {
                1: 'Splitty Oak Display 4',
                2: 'Splitty Steel Plate 1B',
                3: 'design3',
                4: 'design4'
            }

            for (const section of sectionsToProcess) {
                const designString = designMap[section.selected_design] || 'Splitty Oak Display 4'
                const validTableNumbers = section.tableNumbers.filter(n => n > 0)
                const isNewSection = section.id > 1000000000000

                if (isNewSection) {
                    // Створюємо нову секцію з section_plan_url (якщо є)
                    const createdSection = await createSection(
                        restaurantId,
                        section.name,
                        designString,
                        section.section_plan_url  // Передаємо URL який вже на Cloudinary
                    )

                    // Створюємо столи
                    if (validTableNumbers.length > 0) {
                        await createTablesBatch(
                            restaurantId,
                            createdSection.id,
                            validTableNumbers
                        )
                    }
                } else {
                    // Існуюча секція - тільки нові столи
                    const originalNumbers = section.originalTableNumbers || []
                    const newTableNumbers = validTableNumbers.filter(
                        num => !originalNumbers.includes(num)
                    )

                    if (newTableNumbers.length > 0) {
                        await createTablesBatch(
                            restaurantId,
                            section.id,
                            newTableNumbers
                        )
                        console.log(`Added ${newTableNumbers.length} new tables to section: ${section.name}`)
                    }
                }
            }

            onNextStep()

        } catch (err: any) {
            console.error('Error saving QR sections and tables:', err)
            setError(err.message || 'Failed to save sections and tables')
        } finally {
            setInternalSaving(false)
        }
    }

    const isSaving = saving || internalSaving

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-48 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('onboarding.qr.title')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.qr.subtitle', { restaurant: restaurantName })}
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

                    {/* QR Stand Design Showcase */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-700 mb-4 uppercase tracking-wider">
                            {t('onboarding.qr.designShowcase.title')}
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { id: 1, name: 'Splitty Oak Display 4', image: '/images/qr-design-1.png' },
                                { id: 2, name: 'Splitty Steel Plate 1B', image: '/images/qr-design-2.png' },
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

                    {/* Table Sections - Dynamic */}
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
                                    {/* Section Name and Design row */}
                                    <div className="flex items-end gap-4 mb-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-600 mb-1.5">
                                                {t('onboarding.qr.sections.sectionName')}
                                            </label>
                                            <input
                                                value={section.name}
                                                onChange={(e) => {
                                                    const newSections = [...tableSections];
                                                    newSections[index].name = e.target.value;
                                                    setTableSections(newSections);
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                placeholder={t('onboarding.qr.sections.sectionNamePlaceholder')}
                                                type="text"
                                            />
                                        </div>

                                        <div className="w-48">
                                            <label className="block text-xs text-gray-600 mb-1.5">
                                                {t('onboarding.qr.sections.design')}
                                            </label>
                                            <select
                                                value={section.selected_design}
                                                onChange={(e) => {
                                                    const newSections = [...tableSections];
                                                    newSections[index].selected_design = parseInt(e.target.value);
                                                    setTableSections(newSections);
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                            >
                                                <option value="1">Splitty Oak Display 4</option>
                                                <option value="2">Splitty Steel Plate 1B</option>
                                                <option value="3">{t('onboarding.qr.designs.design3')}</option>
                                                <option value="4">{t('onboarding.qr.designs.design4')}</option>
                                            </select>
                                        </div>

                                        {tableSections.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTableSection(section.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Floor Plan Upload */}
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-600 mb-1.5">
                                            {t('onboarding.qr.sections.floorPlan') || 'Floor Plan (Optional)'}
                                        </label>

                                        {!section.section_plan_url ? (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            handleFloorPlanUpload(index, file)
                                                        }
                                                    }}
                                                    disabled={section.uploadingPlan}
                                                    className="hidden"
                                                    id={`floor-plan-${section.id}`}
                                                />
                                                <label
                                                    htmlFor={`floor-plan-${section.id}`}
                                                    className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${
                                                        section.uploadingPlan
                                                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                                            : 'border-gray-300 hover:border-[#2BE89A] hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {section.uploadingPlan ? (
                                                        <>
                                                            <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin mr-2" />
                                                            <span className="text-sm text-gray-500">Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            <span className="text-sm text-gray-600">
                                                                {t('onboarding.qr.sections.uploadFloorPlan') || 'Upload floor plan (JPG, PNG, PDF)'}
                                                            </span>
                                                        </>
                                                    )}
                                                </label>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Max 5MB • JPG, PNG, WEBP or PDF
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        {section.section_plan_url.toLowerCase().endsWith('.pdf') ? (
                                                            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                                                <DocumentIcon className="h-6 w-6 text-red-600" />
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={section.section_plan_url}
                                                                alt="Floor plan preview"
                                                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-700 truncate">
                                                                Floor plan uploaded
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Click remove to change
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFloorPlanRemove(index)}
                                                        className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                                                        title="Remove floor plan"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Number of Tables */}
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-600 mb-1.5">
                                            {t('onboarding.qr.sections.numberOfTables')}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={section.tableCount || ''}
                                            onChange={(e) => {
                                                const newCount = parseInt(e.target.value) || 0
                                                handleTableCountChange(index, newCount)
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                            placeholder={t('onboarding.qr.sections.tableNumbersPlaceholder')}
                                        />
                                    </div>

                                    {/* Individual Table Number Inputs */}
                                    {section.tableCount > 0 && (
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-2">
                                                {t('onboarding.qr.sections.tableNumbers')}
                                            </label>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                                {Array.from({ length: section.tableCount }).map((_, tableIndex) => (
                                                    <div key={tableIndex}>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={(section.tableNumbers || [])[tableIndex] || ''}
                                                            onChange={(e) => handleTableNumberChange(index, tableIndex, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-gray-900 text-xs text-center focus:outline-none focus:border-[#2BE89A] focus:ring-1 focus:ring-[#2BE89A] transition-colors"
                                                            placeholder={`${tableIndex + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {(section.tableNumbers || []).filter(n => n > 0).length} {t('onboarding.qr.sections.of')} {section.tableCount} {t('onboarding.qr.sections.tablesConfigured')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Total Calculator */}
                        <div className="bg-white rounded-md p-3 border border-gray-200 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    {t('onboarding.qr.sections.totalTables')}
                                </span>
                                <span className="text-lg font-bold text-[#2BE89A]">
                                    {tableSections.reduce((total, section) => total + ((section.tableNumbers || []).length), 0)}
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
                    onClick={onSkipStep}
                    disabled={isSaving}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    {t('onboarding.common.skipStep')}
                </button>
                <button
                    onClick={handleSaveAndNext}
                    disabled={isSaving || !qrStandData.domain || domainStatus !== 'available'}
                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {isSaving ? t('onboarding.common.saving') : t('onboarding.common.nextStep')}
                </button>
            </div>
        </div>
    )
}