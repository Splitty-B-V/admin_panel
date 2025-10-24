'use client'

import { useState, useEffect } from 'react'
import {
    PaperAirplaneIcon,
    EyeIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface EmailTemplateEditorProps {
    restaurantId: number
    restaurant?: any
    appointmentData?: {
        selected_datetime: string
        timezone: string
        notes: string
        google_event_link?: string
    }
    API_BASE_URL: string
    onEmailSent?: () => void
    onAppointmentDataChange?: (data: Partial<any>) => void
}

interface EmailVariables {
    restaurantName: string
    contactName: string
    appointmentDate: string
    appointmentTime: string
    restaurantAddress: string
    splittyContactName: string
    splittyContactPhone: string
    recipientEmail: string
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
                                                                     restaurantId,
                                                                     restaurant,
                                                                     appointmentData,
                                                                     API_BASE_URL,
                                                                     onEmailSent,
                                                                     onAppointmentDataChange
                                                                 }) => {
    const { t } = useLanguage()

    const [emailVariables, setEmailVariables] = useState<EmailVariables>({
        restaurantName: restaurant?.name || '',
        contactName: '',
        appointmentDate: '',
        appointmentTime: '',
        restaurantAddress: restaurant?.address || '',
        splittyContactName: '',
        splittyContactPhone: '',
        recipientEmail: ''
    })

    const [editingField, setEditingField] = useState<string | null>(null)
    const [tempValue, setTempValue] = useState('')
    const [sendingEmail, setSendingEmail] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [error, setError] = useState('')
    const [selectedDateTime, setSelectedDateTime] = useState('')

    // Initialize appointment date/time from appointmentData
    useEffect(() => {
        if (appointmentData?.selected_datetime) {
            const date = new Date(appointmentData.selected_datetime)
            setEmailVariables(prev => ({
                ...prev,
                appointmentDate: date.toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                appointmentTime: date.toLocaleTimeString('nl-NL', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }))
            setSelectedDateTime(appointmentData.selected_datetime)
        }
    }, [appointmentData])

    const handleFieldEdit = (fieldKey: string, currentValue: string) => {
        setEditingField(fieldKey)
        setTempValue(currentValue)
    }

    const handleFieldSave = () => {
        if (editingField) {
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

    const handleDateTimeChange = (value: string) => {
        setSelectedDateTime(value)
        if (value) {
            const date = new Date(value)
            const newDateString = date.toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            const newTimeString = date.toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit'
            })

            setEmailVariables(prev => ({
                ...prev,
                appointmentDate: newDateString,
                appointmentTime: newTimeString
            }))

            // Update parent component
            onAppointmentDataChange?.({ selected_datetime: value })
        }
    }

    const getMinDateTime = () => {
        const now = new Date()
        now.setHours(now.getHours() + 1)
        return now.toISOString().slice(0, 16)
    }

    const EditableField: React.FC<{
        fieldKey: string
        value: string
        placeholder: string
        className?: string
        isRequired?: boolean
    }> = ({ fieldKey, value, placeholder, className = '', isRequired = false }) => {
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
                } ${className}`}
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
        const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Afspraak bevestiging | API aanvraag restaurant</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .email-container {
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-gif {
            width: 100%;
            height: auto;
            display: block;
        }

        .content {
            padding: 30px;
        }

        h1 {
            color: #04d15e;
            font-size: 24px;
            margin-bottom: 20px;
        }

        h2 {
            color: #333;
            font-size: 18px;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #04d15e;
            padding-bottom: 5px;
        }

        .btn {
            display: inline-block;
            background-color: #04d15e;
            color: white !important;
            padding: 12px 26px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin: 10px 0;
            text-align: center;
        }

        .btn:hover {
            background-color: #03b84f;
        }

        ul {
            list-style-type: none;
            padding-left: 0;
        }

        ul li {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }

        ul li:before {
            content: "✅";
            position: absolute;
            left: 0;
        }

        ol {
            counter-reset: item;
        }

        ol li {
            display: block;
            margin: 15px 0;
            padding-left: 10px;
        }

        ol li:before {
            content: counter(item) ".";
            counter-increment: item;
            font-weight: bold;
            color: #04d15e;
            margin-right: 10px;
        }

        .appointment-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .appointment-details ul li:before {
            content: "📅";
        }

        .appointment-details ul li:nth-child(2):before {
            content: "⏰";
        }

        .appointment-details ul li:nth-child(3):before {
            content: "📍";
        }

        .appointment-details ul li:nth-child(4):before {
            content: "👤";
        }

        strong {
            color: #333;
        }

        .closing {
            margin-top: 30px;
            font-size: 16px;
        }

        .rocket {
            font-size: 20px;
        }

        @media (max-width: 600px) {
            body {
                padding: 10px;
            }

            .content {
                padding: 20px;
            }

            h1 {
                font-size: 20px;
            }

            h2 {
                font-size: 16px;
            }

            .header-gif {
                width: 100%;
                height: auto;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <img src="https://res.cloudinary.com/dtncsjbtg/image/upload/v1760672456/Emailtempalteimg-ezgif.com-video-to-gif-converter_kor2f1.gif"
             alt="Splitty - De toekomst van soepel betalen in de horeca"
             class="header-gif"
             style="width: 500px; max-width: 100%; height: auto;">

        <div class="content">
            <h1>Beste ${emailVariables.contactName || '[Naam contactpersoon]'},</h1>

            <p>Bedankt voor het inplannen van onze afspraak met <strong>Splitty</strong>.<br>
            We komen op <strong>${emailVariables.appointmentDate || '[Datum]'} om ${emailVariables.appointmentTime || '[Tijd]'}</strong> langs bij <strong>${emailVariables.restaurantName || '[Restaurant naam]'}</strong> voor de onboarding en live-koppeling.</p>

            <h2>Wat we gaan doen</h2>
            <ul>
                <li>Koppeling met jullie POS (unTill of MplusKassa)</li>
                <li>Test van QR-betalingen aan tafel met een testbestelling en QR</li>
                <li>Aanmaken van jullie <strong>Stripe-account</strong> (voor uitbetalingen)</li>
                <li>Korte training voor jullie team + Q&A</li>
                <li>Bestellen van jullie <strong>prachtige Splitty QR-houders</strong></li>
                <li>Aanmaken van <strong>dashboard-inloggegevens</strong> voor het Splitty Admin-paneel</li>
                <li>Toevoegen aan de <strong>WhatsApp supportgroep</strong> voor snelle hulp en updates</li>
            </ul>

            <h2>Wat jullie vóór de afspraak regelen</h2>
            <ol>
                <li>
                    <p><strong>API-toegang POS</strong></p>
                    <ul style="list-style-type: disc; padding-left: 20px;">
                        <li>
                            <p><strong>Gebruik je unTill?</strong><br>
                            Klik hier, en vul in om de koppeling aan te vragen bij UnTill:<br>
                            <a href="https://untill.nl/koppelingen/koppeling-aanvragen-tp-api-standaard/?koppeling=Splitty" class="btn">Vraag unTill API aan</a></p>
                        </li>
                        <li>
                            <p><strong>Gebruik je MplusKassa?</strong><br>
                            Klik op de knop hieronder om automatisch een <strong>kant-en-klare aanvraagmail</strong> naar MplusKassa te openen. Pas alleen de <strong>invulvelden</strong> (restaurantnaam, adres, KVK, contact) aan en <strong>stuur</strong> de mail.<br>
                            <a href="mailto:support@mpluskassa.nl?cc=milad@splitty.nl&subject=Aanvraag%20API-toegang%20t.b.v.%20Splitty-koppeling%20-%20${encodeURIComponent(emailVariables.restaurantName || 'Restaurant')}&body=Beste%20MplusKassa,%0D%0A%0D%0AWij%20willen%20graag%20gebruikmaken%20van%20de%20oplossing%20van%20www.splitty.nl%20en%20deze%20koppelen%20aan%20ons%20kassasysteem.%0D%0A%0D%0AZouden%20jullie%20voor%20ons%20restaurant,%20${encodeURIComponent(emailVariables.restaurantName || 'Restaurant')},%20de%20API-toegang%20kunnen%20activeren%20en%20de%20benodigde%20gegevens%20kunnen%20aanleveren%3F%0D%0A%0D%0ABenodigd%20voor%20de%20Splitty-koppeling:%0D%0AHost:%0D%0AServerport:%0D%0AEndpoint%20URL%20van%20ons%20Mplus-systeem%0D%0AAPI-gebruikersnaam%0D%0AAPI-wachtwoord%0D%0A%0D%0ADaarnaast%20verzoeken%20wij%20om%20het%20volgende%20IP-adres%20van%20Splitty%20toe%20te%20voegen%20aan%20de%20whitelist:%0D%0A208.77.244.15%0D%0A%0D%0ABedrijfsgegevens:%0D%0ARestaurantnaam:%20${encodeURIComponent(emailVariables.restaurantName || 'Restaurant')}%0D%0AAdres:%20${encodeURIComponent(emailVariables.restaurantAddress || '[Adres]')}%0D%0AContactpersoon:%20${encodeURIComponent(emailVariables.contactName || '[Naam]')}%0D%0ATelefoonnummer:%20%5BTelefoonnummer%5D%0D%0AE-mailadres:%20${encodeURIComponent(emailVariables.recipientEmail || '[Email]')}%0D%0A%0D%0ADe%20API-gegevens%20kunnen%20in%20CC%20worden%20doorgestuurd%20naar:%20milad@splitty.nl%20van%20Splitty.%0D%0A%0D%0AAlvast%20hartelijk%20dank%20voor%20jullie%20snelle%20hulp!%0D%0A%0D%0AMet%20vriendelijke%20groet,%0D%0A${encodeURIComponent(emailVariables.contactName || '[Naam]')}%0D%0A${encodeURIComponent(emailVariables.restaurantName || 'Restaurant')}" class="btn">Stuur Mplus-mail</a></p>
                        </li>
                    </ul>
                </li>
                <li>
                    <p><strong>Wat we nodig hebben tijdens de afspraak</strong> (voor Stripe):</p>
                    <ul style="list-style-type: disc; padding-left: 20px;">
                        <li><strong>Rekeningnummer (IBAN)</strong> voor uitbetalingen</li>
                        <li><strong>Legitimatie/ID</strong> van de eigenaar(s)/tekenbevoegde(n)</li>
                        <li><strong>Alle bedrijfsgegevens: bedrijfsnaam, KVK-nummer, btw-nummer, adres en telefoonnummer.</strong></li>
                        <li><strong>De eigenaar(s)</strong> of <strong>tekenbevoegde(n)</strong> moeten tijdens de afspraak <strong>aanwezig zijn voor identiteits- en bedrijfsverificatie.</strong></li>
                    </ul>
                </li>
            </ol>

            <div class="appointment-details">
                <h2>Afspraakgegevens</h2>
                <ul>
                    <li>Datum: <strong>${emailVariables.appointmentDate || '[Datum]'}</strong></li>
                    <li>Tijd: <strong>${emailVariables.appointmentTime || '[Tijd]'}</strong></li>
                    <li>Locatie: <strong>${emailVariables.restaurantAddress || '[Adres]'}</strong></li>
                    <li>Splitty contactpersoon: <strong>${emailVariables.splittyContactName || '[Naam]'} – ${emailVariables.splittyContactPhone || '[Telefoon]'}</strong></li>
                </ul>
            </div>

            <div class="closing">
                <p>Heb je vragen of lukt het niet met de API toegang aanvraag bij je kassasysteem? Laat het ons weten, dan helpen we je direct zodat we goed voorbereid naar de afspraak kunnen komen.</p>

                <p>We hebben er zin in om jullie restaurant binnenkort live te zien gaan met Splitty <span class="rocket">🚀</span></p>
            </div>
        </div>
    </div>
</body>
</html>`

        return html.trim()
    }

    const handleSendEmail = async () => {
        // Validate required fields
        const requiredFields = ['contactName', 'recipientEmail', 'splittyContactName', 'splittyContactPhone']
        const missingFields = requiredFields.filter(field => !emailVariables[field as keyof EmailVariables])

        if (missingFields.length > 0) {
            setError('Please fill in all required fields before sending the email.')
            return
        }

        if (!selectedDateTime) {
            setError('Please select a date and time for the appointment first.')
            return
        }

        try {
            setSendingEmail(true)
            setError('')

            // Generate the email HTML
            const emailHTML = generateEmailHTML()

            // Make API call to backend
            const response = await fetch(`${API_BASE_URL}/super_admin/restaurants/${restaurantId}/send-appointment-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    selected_datetime: selectedDateTime,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    notes: appointmentData?.notes || `Onboarding meeting for ${emailVariables.restaurantName}`,
                    to: emailVariables.recipientEmail,
                    subject: `Afspraak bevestiging | ${emailVariables.restaurantName} - Splitty onboarding`,
                    html: emailHTML
                })
            })

            // Handle authentication errors
            if (response.status === 401) {
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')
                window.location.href = '/login'
                return
            }

            if (response.ok) {
                const result = await response.json()
                // Update appointment data with backend response
                onAppointmentDataChange?.({
                    google_event_id: result.google_event_id,
                    google_event_link: result.google_event_link
                })

                setEmailSent(true)
                onEmailSent?.()
            } else {
                const errorData = await response.json()
                setError(errorData.detail || 'Failed to create appointment and send email.')
            }
        } catch (err) {
            setError('Something went wrong while processing the request.')
        } finally {
            setSendingEmail(false)
        }
    }

    if (emailSent) {
        return (
            <div className="bg-[#2BE89A]/5 rounded-lg p-6 border border-[#2BE89A]/20">
                <div className="flex items-center mb-4">
                    <CheckIcon className="h-6 w-6 text-[#2BE89A] mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Appointment created and email sent!
                    </h3>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        ✅ <strong>Appointment</strong> has been added to Google Calendar
                    </p>
                    <p className="text-sm text-gray-600">
                        ✅ <strong>Confirmation email</strong> has been sent to <strong>{emailVariables.recipientEmail}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                        ✅ <strong>Date & time:</strong> {emailVariables.appointmentDate} at {emailVariables.appointmentTime}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                    Appointment Confirmation Email
                </h4>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Quick datetime selector */}
                <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={selectedDateTime}
                        onChange={(e) => handleDateTimeChange(e.target.value)}
                        min={getMinDateTime()}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2BE89A] focus:border-transparent"
                    />
                </div>

                {/* Email Preview with inline editing */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">To:</span>
                                <EditableField
                                    fieldKey="recipientEmail"
                                    value={emailVariables.recipientEmail}
                                    placeholder="email@restaurant.nl"
                                    isRequired
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                <strong>Subject:</strong> Afspraak bevestiging | {emailVariables.restaurantName || '[Restaurant naam]'} - Splitty onboarding
                            </p>
                        </div>
                    </div>

                    <div className="p-6 max-h-[500px] overflow-y-auto">
                        {/* Email content with inline editing */}
                        <div className="space-y-4">
                            <img
                                src="https://res.cloudinary.com/dtncsjbtg/image/upload/v1760672456/Emailtempalteimg-ezgif.com-video-to-gif-converter_kor2f1.gif"
                                alt="Splitty - De toekomst van soepel betalen in de horeca"
                                className="w-[500px] h-auto rounded-lg"
                            />

                            <div className="space-y-4 text-gray-900">
                                <h1 className="text-2xl font-bold text-[#04d15e]">
                                    Beste <EditableField
                                    fieldKey="contactName"
                                    value={emailVariables.contactName}
                                    placeholder="Naam contactpersoon"
                                    isRequired
                                />,
                                </h1>

                                <p>
                                    Bedankt voor het inplannen van onze afspraak met <strong>Splitty</strong>.<br/>
                                    We komen op <strong>{emailVariables.appointmentDate || '[Datum]'} om {emailVariables.appointmentTime || '[Tijd]'}</strong> langs bij <strong>{emailVariables.restaurantName || '[Restaurant naam]'}</strong> voor de onboarding en live-koppeling.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-[#04d15e] pb-1">
                                    Wat we gaan doen
                                </h2>
                                <ul className="space-y-2 pl-0">
                                    <li className="flex items-start">
                                        <span className="mr-2">✅</span>
                                        Koppeling met jullie POS (unTill of MplusKassa)
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">✅</span>
                                        Test van QR-betalingen aan tafel met een testbestelling en QR
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">✅</span>
                                        Aanmaken van jullie <strong>Stripe-account</strong> (voor uitbetalingen)
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">✅</span>
                                        Korte training voor jullie team + Q&A
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">✅</span>
                                        Bestellen van jullie <strong>prachtige Splitty QR-houders</strong>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">✅</span>
                                        Aanmaken van <strong>dashboard-inloggegevens</strong> voor het Splitty Admin-paneel
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">✅</span>
                                        Toevoegen aan de <strong>WhatsApp supportgroep</strong> voor snelle hulp en updates
                                    </li>
                                </ul>

                                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-[#04d15e] pb-1">
                                    Wat jullie vóór de afspraak regelen
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="font-semibold">1. API-toegang POS</p>
                                        <div className="ml-4 space-y-3">
                                            <div>
                                                <p><strong>Gebruik je unTill?</strong><br/>
                                                    Klik hier, en vul in om de koppeling aan te vragen bij UnTill:</p>
                                                <a href="https://untill.nl/koppelingen/koppeling-aanvragen-tp-api-standaard/?koppeling=Splitty"
                                                   className="inline-block bg-[#04d15e] text-white px-6 py-3 rounded-lg font-semibold mt-2 hover:bg-[#03b84f] transition">
                                                    Vraag unTill API aan
                                                </a>
                                            </div>
                                            <div>
                                                <p><strong>Gebruik je MplusKassa?</strong><br/>
                                                    Klik op de knop hieronder om automatisch een <strong>kant-en-klare aanvraagmail</strong> naar MplusKassa te openen. Pas alleen de <strong>invulvelden</strong> aan en <strong>stuur</strong> de mail.</p>
                                                <a href={`mailto:support@mpluskassa.nl?cc=milad@splitty.nl&subject=Aanvraag%20API-toegang%20t.b.v.%20Splitty-koppeling%20-%20${encodeURIComponent(emailVariables.restaurantName || 'Restaurant')}`}
                                                   className="inline-block bg-[#04d15e] text-white px-6 py-3 rounded-lg font-semibold mt-2 hover:bg-[#03b84f] transition">
                                                    Stuur Mplus-mail
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-semibold">2. Wat we nodig hebben tijdens de afspraak (voor Stripe):</p>
                                        <ul className="ml-4 space-y-1 list-disc">
                                            <li><strong>Rekeningnummer (IBAN)</strong> voor uitbetalingen</li>
                                            <li><strong>Legitimatie/ID</strong> van de eigenaar(s)/tekenbevoegde(n)</li>
                                            <li><strong>Alle bedrijfsgegevens: bedrijfsnaam, KVK-nummer, btw-nummer, adres en telefoonnummer.</strong></li>
                                            <li><strong>De eigenaar(s)</strong> of <strong>tekenbevoegde(n)</strong> moeten tijdens de afspraak <strong>aanwezig zijn voor identiteits- en bedrijfsverificatie.</strong></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Afspraakgegevens</h2>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <span className="mr-2">📅</span>
                                            <span>Datum: <strong>{emailVariables.appointmentDate || '[Datum]'}</strong></span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2">⏰</span>
                                            <span>Tijd: <strong>{emailVariables.appointmentTime || '[Tijd]'}</strong></span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2">📍</span>
                                            <span>Locatie: <strong><EditableField
                                                fieldKey="restaurantAddress"
                                                value={emailVariables.restaurantAddress}
                                                placeholder="Restaurant adres"
                                            /></strong></span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2">👤</span>
                                            <span>Splitty contactpersoon: <strong><EditableField
                                                fieldKey="splittyContactName"
                                                value={emailVariables.splittyContactName}
                                                placeholder="Naam Splitty medewerker"
                                                isRequired
                                            /> – <EditableField
                                                fieldKey="splittyContactPhone"
                                                value={emailVariables.splittyContactPhone}
                                                placeholder="+31 6 12345678"
                                                isRequired
                                            /></strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p>Heb je vragen of lukt het niet met de API toegang aanvraag bij je kassasysteem? Laat het ons weten, dan helpen we je direct zodat we goed voorbereid naar de afspraak kunnen komen.</p>

                                    <p>We hebben er zin in om jullie restaurant binnenkort live te zien gaan met Splitty 🚀</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail || !selectedDateTime || !emailVariables.contactName || !emailVariables.recipientEmail || !emailVariables.splittyContactName || !emailVariables.splittyContactPhone}
                        className="px-6 py-3 bg-gradient-to-r from-[#2BE89A] to-[#4FFFB0] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center"
                    >
                        {sendingEmail ? (
                            <>
                                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                Creating appointment & sending email...
                            </>
                        ) : (
                            <>
                                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                Create appointment & send email
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmailTemplateEditor