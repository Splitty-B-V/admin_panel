'use client'

import { useState } from 'react'
import {
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
    PencilIcon,
    CheckIcon,
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

interface SummaryStepProps {
    restaurantId: number
    restaurant?: any
    onComplete: () => void
    onSkip: () => void
    saving?: boolean
    API_BASE_URL: string
}

interface EmailVariables {
    contactName: string
    recipientEmail: string
    ccEmails: string
}

interface OnboardingItems {
    dashboard: boolean
    posApi: boolean
    stripe: boolean
    tableNumbers: boolean
    qrHolder: boolean
}

const SummaryStep: React.FC<SummaryStepProps> = ({
                                                     restaurantId,
                                                     restaurant,
                                                     onComplete,
                                                     onSkip,
                                                     saving = false,
                                                     API_BASE_URL
                                                 }) => {
    const { t } = useLanguage()

    const [emailSent, setEmailSent] = useState(false)
    const [sending, setSending] = useState(false)
    const [completing, setCompleting] = useState(false)
    const [error, setError] = useState('')

    const [editingField, setEditingField] = useState<string | null>(null)
    const [tempValue, setTempValue] = useState('')

    // Checklist items - user can toggle these on/off
    const [onboardingItems, setOnboardingItems] = useState<OnboardingItems>({
        dashboard: true,
        posApi: true,
        stripe: true,
        tableNumbers: true,
        qrHolder: true
    })

    // Get current date in Dutch format
    const getCurrentDate = () => {
        const now = new Date()
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
        return now.toLocaleDateString('nl-NL', options)
    }

    const [emailVariables, setEmailVariables] = useState<EmailVariables>({
        contactName: '',
        recipientEmail: restaurant?.contact_email || '',
        ccEmails: ''
    })

    const restaurantName = restaurant?.name || '[restaurant naam]'
    const [currentDate, setCurrentDate] = useState(getCurrentDate())

    const handleFieldEdit = (fieldKey: string, currentValue: string) => {
        setEditingField(fieldKey)
        setTempValue(currentValue)
    }

    const handleFieldSave = () => {
        if (editingField === 'currentDate') {
            setCurrentDate(tempValue)
        } else if (editingField) {
            setEmailVariables(prev => ({
                ...prev,
                [editingField]: tempValue
            }))
        }
        setEditingField(null)
        setTempValue('')
    }

    const handleFieldCancel = () => {
        setEditingField(null)
        setTempValue('')
    }

    const EditableField: React.FC<{
        fieldKey: string
        value: string
        placeholder: string
        isRequired?: boolean
    }> = ({ fieldKey, value, placeholder, isRequired = false }) => {
        const isEditing = editingField === fieldKey
        const isEmpty = !value

        if (isEditing) {
            return (
                <span className="inline-flex items-center gap-1">
                    <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="px-2 py-1 border border-[#2BE89A] rounded text-sm min-w-[120px] bg-white"
                        placeholder={placeholder}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFieldSave()
                            if (e.key === 'Escape') handleFieldCancel()
                        }}
                    />
                    <button
                        onClick={handleFieldSave}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                        <CheckIcon className="h-3 w-3" />
                    </button>
                    <button
                        onClick={handleFieldCancel}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                        <XMarkIcon className="h-3 w-3" />
                    </button>
                </span>
            )
        }

        return (
            <span
                onClick={() => handleFieldEdit(fieldKey, value)}
                className={`cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    isEmpty
                        ? 'bg-yellow-100 border border-yellow-300 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-[#2BE89A]/10 border border-[#2BE89A]/30 text-gray-900 hover:bg-[#2BE89A]/20'
                }`}
                title={isEmpty ? `Click to fill ${placeholder.toLowerCase()}` : 'Click to edit'}
            >
                {isEmpty ? (
                    <>
                        <span className="text-yellow-600 font-medium">[{placeholder}]</span>
                        {isRequired && <span className="text-red-500">*</span>}
                    </>
                ) : (
                    <strong>{value}</strong>
                )}
                <PencilIcon className="h-3 w-3 opacity-50" />
            </span>
        )
    }

    const generateEmailHTML = () => {
        // Build list items based on what's checked
        let listItems = ''

        if (onboardingItems.dashboard) {
            listItems += `
        <li>Splitty dashboard omgeving aangemaakt<br>
        → Inloggen kan via: <a href="https://admin.splitty.nl" style="color: #333; font-weight: bold; text-decoration: none;">https://admin.splitty.nl</a><br>
        (Gebruik de inloggegevens die we samen hebben ingesteld.)</li>
            `
        }

        if (onboardingItems.posApi) {
            listItems += `
        <li>POS API-gegevens ontvangen en koppeling gestart<br>
        → De verbinding wordt nog door ons team afgerond.</li>
            `
        }

        if (onboardingItems.stripe) {
            listItems += `
        <li>Stripe-account aangemaakt en geactiveerd<br>
        → Het account is succesvol ingesteld voor betalingen via Splitty.</li>
            `
        }

        if (onboardingItems.tableNumbers) {
            listItems += `
        <li>Tafelnummers en plattegrond aangeleverd<br>
        → Wij koppelen de tafelnummers aan het juiste overzicht in Splitty.<br>
        Indien er wijzigingen zijn, ontvangen we die graag per e-mail of WhatsApp.</li>
            `
        }

        if (onboardingItems.qrHolder) {
            listItems += `
        <li>QR-houder design gekozen<br>
        → Het geselecteerde design zal worden toegepast op de QR-houders die op de tafels worden geplaatst.</li>
            `
        }

        const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Onboarding Samenvatting</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
    <p>Beste ${emailVariables.contactName || '[Naam]'},</p>

    <p>Bedankt voor de prettige samenwerking op ${currentDate} tijdens de onboarding bij ${restaurantName}. Hierbij stuur ik een korte samenvatting van wat er die dag is uitgevoerd tijdens de installatie en inrichting van Splitty.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

    <p><strong>${currentDate} uitgevoerd</strong></p>

    <ul style="list-style-type: disc; padding-left: 20px;">
        ${listItems}
    </ul>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

    <p><strong>Vervolg</strong></p>

    <p>Wij verwerken alle gegevens en koppelingen in de komende dagen. U ontvangt een vervolgmail zodra de QR-houders klaar zijn voor verzending, inclusief track & trace.</p>

    <p>Nogmaals bedankt voor de fijne samenwerking en het vertrouwen in Splitty.<br>
    We kijken ernaar uit om uw restaurant binnenkort volledig live te zien gaan!</p>

    <p>Met vriendelijke groet, Best regards<br>
    Team Splitty</p>

    <p>+31 85 060 2019 | <a href="https://www.splitty.nl" style="color: #333; font-weight: bold; text-decoration: none;">www.splitty.nl</a></p>

    <img src="https://res.cloudinary.com/dtncsjbtg/image/upload/v1761110236/email_gif_qa8cf4.gif" width="200" alt="Splitty Logo" style="display: block; margin: 20px 0;" />
</body>
</html>
        `.trim()

        return html
    }

    const handleSendEmail = async () => {
        // Validate required fields
        if (!emailVariables.contactName) {
            setError(t('onboarding.summary.errors.contactNameRequired'))
            return
        }

        if (!emailVariables.recipientEmail) {
            setError(t('onboarding.summary.errors.toRequired'))
            return
        }

        try {
            setSending(true)
            setError('')

            const emailHTML = generateEmailHTML()

            // Parse CC emails
            const ccList = emailVariables.ccEmails
                ? emailVariables.ccEmails.split(',').map(email => email.trim()).filter(email => email)
                : []

            const response = await fetch(
                `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/send-email`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        email_type: 'summary',
                        to: emailVariables.recipientEmail,
                        cc: ccList.length > 0 ? ccList : null,
                        subject: `Onboarding voltooid – samenvatting & vervolgstappen voor ${restaurantName}`,
                        html: emailHTML,
                        restaurant_id: restaurantId
                    })
                }
            )

            if (response.status === 401) {
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')
                window.location.href = '/login'
                return
            }

            if (response.ok) {
                setEmailSent(true)
            } else {
                const errorData = await response.json()
                setError(errorData.message || t('onboarding.summary.errors.sendFailed'))
            }
        } catch (error) {
            console.error('Failed to send email:', error)
            setError(t('onboarding.summary.errors.sendFailed'))
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {t('onboarding.summary.title')}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t('onboarding.summary.subtitle', { restaurant: restaurantName })}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Email Preview */}
                    {!emailSent && (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <h4 className="text-base font-medium text-gray-900 mb-4">
                                {t('onboarding.summary.preview.title')}
                            </h4>

                            {/* Onboarding Items Checklist */}
                            <div className="mb-6 p-4 bg-white rounded border border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                    {t('onboarding.summary.selectItems')}
                                </p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onboardingItems.dashboard}
                                            onChange={(e) => setOnboardingItems(prev => ({ ...prev, dashboard: e.target.checked }))}
                                            className="w-4 h-4 text-[#2BE89A] border-gray-300 rounded focus:ring-[#2BE89A]"
                                        />
                                        <span className="text-sm text-gray-700">Splitty dashboard omgeving aangemaakt</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onboardingItems.posApi}
                                            onChange={(e) => setOnboardingItems(prev => ({ ...prev, posApi: e.target.checked }))}
                                            className="w-4 h-4 text-[#2BE89A] border-gray-300 rounded focus:ring-[#2BE89A]"
                                        />
                                        <span className="text-sm text-gray-700">POS API-gegevens ontvangen en koppeling gestart</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onboardingItems.stripe}
                                            onChange={(e) => setOnboardingItems(prev => ({ ...prev, stripe: e.target.checked }))}
                                            className="w-4 h-4 text-[#2BE89A] border-gray-300 rounded focus:ring-[#2BE89A]"
                                        />
                                        <span className="text-sm text-gray-700">Stripe-account aangemaakt en geactiveerd</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onboardingItems.tableNumbers}
                                            onChange={(e) => setOnboardingItems(prev => ({ ...prev, tableNumbers: e.target.checked }))}
                                            className="w-4 h-4 text-[#2BE89A] border-gray-300 rounded focus:ring-[#2BE89A]"
                                        />
                                        <span className="text-sm text-gray-700">Tafelnummers en plattegrond aangeleverd</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onboardingItems.qrHolder}
                                            onChange={(e) => setOnboardingItems(prev => ({ ...prev, qrHolder: e.target.checked }))}
                                            className="w-4 h-4 text-[#2BE89A] border-gray-300 rounded focus:ring-[#2BE89A]"
                                        />
                                        <span className="text-sm text-gray-700">QR-houder design gekozen</span>
                                    </label>
                                </div>
                            </div>

                            {/* Email Preview with integrated header */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {/* Email Header - looks like email client */}
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 space-y-2">
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-600 font-medium min-w-[60px] pt-1">To:</span>
                                        <div className="flex-1">
                                            <EditableField
                                                fieldKey="recipientEmail"
                                                value={emailVariables.recipientEmail}
                                                placeholder="Email"
                                                isRequired
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-600 font-medium min-w-[60px] pt-1">CC:</span>
                                        <div className="flex-1">
                                            <EditableField
                                                fieldKey="ccEmails"
                                                value={emailVariables.ccEmails}
                                                placeholder="CC emails (comma separated)"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-600 font-medium min-w-[60px] pt-1">Subject:</span>
                                        <div className="flex-1 pt-1">
                                            <span className="text-gray-900 font-medium">
                                                Onboarding voltooid – samenvatting & vervolgstappen voor {restaurantName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="p-6 text-sm leading-relaxed">
                                    <p className="mb-4">
                                        Beste <EditableField
                                        fieldKey="contactName"
                                        value={emailVariables.contactName}
                                        placeholder="Naam"
                                        isRequired
                                    />,
                                    </p>

                                    <p className="mb-4">
                                        Bedankt voor de prettige samenwerking op <EditableField
                                        fieldKey="currentDate"
                                        value={currentDate}
                                        placeholder="Datum"
                                    /> tijdens de onboarding bij <strong>{restaurantName}</strong>. Hierbij stuur ik een korte samenvatting van wat er die dag is uitgevoerd tijdens de installatie en inrichting van Splitty.
                                    </p>

                                    <hr className="my-4 border-gray-300" />

                                    <p className="mb-2"><strong>{currentDate} uitgevoerd</strong></p>

                                    <ul className="list-disc pl-5 space-y-2 mb-4">
                                        {onboardingItems.dashboard && (
                                            <li>
                                                Splitty dashboard omgeving aangemaakt<br />
                                                → Inloggen kan via: <a href="https://admin.splitty.nl" className="underline">https://admin.splitty.nl</a><br />
                                                (Gebruik de inloggegevens die we samen hebben ingesteld.)
                                            </li>
                                        )}
                                        {onboardingItems.posApi && (
                                            <li>
                                                POS API-gegevens ontvangen en koppeling gestart<br />
                                                → De verbinding wordt nog door ons team afgerond.
                                            </li>
                                        )}
                                        {onboardingItems.stripe && (
                                            <li>
                                                Stripe-account aangemaakt en geactiveerd<br />
                                                → Het account is succesvol ingesteld voor betalingen via Splitty.
                                            </li>
                                        )}
                                        {onboardingItems.tableNumbers && (
                                            <li>
                                                Tafelnummers en plattegrond aangeleverd<br />
                                                → Wij koppelen de tafelnummers aan het juiste overzicht in Splitty.<br />
                                                Indien er wijzigingen zijn, ontvangen we die graag per e-mail of WhatsApp.
                                            </li>
                                        )}
                                        {onboardingItems.qrHolder && (
                                            <li>
                                                QR-houder design gekozen<br />
                                                → Het geselecteerde design zal worden toegepast op de QR-houders die op de tafels worden geplaatst.
                                            </li>
                                        )}
                                    </ul>

                                    <hr className="my-4 border-gray-300" />

                                    <p className="mb-2"><strong>Vervolg</strong></p>

                                    <p className="mb-4">
                                        Wij verwerken alle gegevens en koppelingen in de komende dagen. U ontvangt een vervolgmail zodra de QR-houders klaar zijn voor verzending, inclusief track & trace.
                                    </p>

                                    <p className="mb-4">
                                        Nogmaals bedankt voor de fijne samenwerking en het vertrouwen in Splitty.<br />
                                        We kijken ernaar uit om uw restaurant binnenkort volledig live te zien gaan!
                                    </p>

                                    <p className="mb-2">
                                        Met vriendelijke groet, Best regards<br />
                                        Team Splitty
                                    </p>

                                    <p className="mb-4">
                                        +31 85 060 2019 | <a href="https://www.splitty.nl" className="underline">www.splitty.nl</a>
                                    </p>

                                    <img
                                        src="https://res.cloudinary.com/dtncsjbtg/image/upload/v1761110236/email_gif_qa8cf4.gif"
                                        width="200"
                                        alt="Splitty Logo"
                                        className="mt-4"
                                    />
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendEmail}
                                disabled={sending}
                                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                            >
                                {sending ? (
                                    <>
                                        <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                                        {t('onboarding.summary.form.sending')}
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                                        {t('onboarding.summary.form.send')}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Success State */}
                    {emailSent && (
                        <div className="bg-[#2BE89A]/5 rounded-lg p-5 border border-[#2BE89A]/20">
                            <div className="flex items-center mb-4">
                                <CheckCircleIcon className="h-6 w-6 text-[#2BE89A] mr-3" />
                                <h4 className="text-base font-medium text-gray-900">
                                    {t('onboarding.summary.success.title')}
                                </h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                {t('onboarding.summary.success.description')}
                            </p>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-[#2BE89A]/5 rounded-lg p-4 border border-[#2BE89A]/20">
                        <p className="text-sm text-gray-700">
                            <span className="text-[#2BE89A] font-medium">
                                {t('onboarding.common.tip')}
                            </span>{' '}
                            {t('onboarding.summary.tip')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onSkip}
                    disabled={saving || completing}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    {t('onboarding.common.skipStep')}
                </button>

                <button
                    onClick={async () => {
                        try {
                            setCompleting(true)
                            const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/onboarding/finish`, {
                                method: 'POST',
                                headers: getAuthHeaders()
                            })
                            if (response.ok) {
                                window.location.href = `/admin/restaurants/detail/${restaurantId}`
                            }
                        } catch (err) {
                            console.error(err)
                            setCompleting(false)
                        }
                    }}
                    disabled={saving || completing}
                    className="px-8 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center"
                >
                    {completing ? (
                        <>
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            {t('onboarding.common.complete')}
                        </>
                    ) : (
                        t('onboarding.common.complete')
                    )}
                </button>
            </div>
        </div>
    )
}

export default SummaryStep