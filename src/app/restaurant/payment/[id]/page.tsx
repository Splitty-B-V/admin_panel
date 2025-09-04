'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/components/restaurant/Layout'
import { useLanguage } from '@/contexts/LanguageContext'
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    CreditCardIcon,
    HashtagIcon,
    BuildingStorefrontIcon,
    ReceiptPercentIcon,
    ClockIcon,
    InformationCircleIcon,
    BanknotesIcon,
    CalculatorIcon,
    DocumentTextIcon,
    GiftIcon,
    ClipboardDocumentListIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'
import {getPaymentDetails} from "@/lib/api";

// TypeScript interfaces based on API response
interface PaymentItem {
    name: string
    price: number
    quantity: number
}

interface SplitSession {
    id: number
    split_mode: 'items' | 'equal' | 'custom'
    is_active: boolean
    people_count: number | null
    created_at: string
}

interface ApiPaymentResponse {
    id: number
    transaction_id: string
    table_number: number
    order_number: number
    order_amount: number
    tip_amount: number
    splitty_fee: number
    total_charged: number
    net_amount: number
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    payment_method: 'card' | 'ideal' | 'apple_pay' | 'google_pay'
    payment_provider: string
    created_at: string
    completed_at: string | null
    settlement_date: string
    items: PaymentItem[]
    split_session: SplitSession
}

// Processed payment interface for component
interface Payment {
    id: string
    transactionId: string
    tableNumber: number
    orderNumber: string
    orderAmount: number
    tipAmount: number
    splittyFee: number
    totalCharged: number
    netAmount: number
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    paymentMethod: 'card' | 'ideal' | 'apple_pay' | 'google_pay'
    paymentProvider: string
    timestamp: Date
    processedAt: Date | null
    settlementDate: Date
    items: PaymentItem[]
    splitSession: SplitSession
}


// Transform API response to component format
const transformApiPayment = (apiPayment: ApiPaymentResponse): Payment => {
    return {
        id: apiPayment.id.toString(),
        transactionId: apiPayment.transaction_id,
        tableNumber: apiPayment.table_number,
        orderNumber: apiPayment.order_number.toString(),
        orderAmount: apiPayment.order_amount,
        tipAmount: apiPayment.tip_amount,
        splittyFee: apiPayment.splitty_fee,
        totalCharged: apiPayment.total_charged,
        netAmount: apiPayment.net_amount,
        status: apiPayment.status,
        paymentMethod: apiPayment.payment_method,
        paymentProvider: apiPayment.payment_provider,
        timestamp: new Date(apiPayment.created_at),
        processedAt: apiPayment.completed_at ? new Date(apiPayment.completed_at) : null,
        settlementDate: new Date(apiPayment.settlement_date),
        items: apiPayment.items,
        splitSession: apiPayment.split_session
    }
}

const PaymentDetail: React.FC = () => {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const { t } = useLanguage()
    const [payment, setPayment] = useState<Payment | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPayment = async () => {
            if (!id) return

            try {
                setLoading(true)
                setError(null)

                const apiPayment = await getPaymentDetails(id)

                const transformedPayment = transformApiPayment(apiPayment)
                setPayment(transformedPayment)
            } catch (err: any) {
                console.error('Error fetching payment:', err)
                setError(err.message || 'Failed to load payment')
            } finally {
                setLoading(false)
            }
        }

        fetchPayment()
    }, [id])

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">Betaling laden...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">Fout bij laden betaling: {error}</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!payment) {
        return (
            <Layout>
                <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">Betaling niet gevonden</p>
                    </div>
                </div>
            </Layout>
        )
    }

    const getStatusColor = (status: Payment['status']): string => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'failed': return 'bg-red-100 text-red-800 border-red-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getPaymentMethodDisplayName = (method: Payment['paymentMethod']): string => {
        switch(method) {
            case 'ideal': return 'iDEAL'
            case 'apple_pay': return 'Apple Pay'
            case 'google_pay': return 'Google Pay'
            case 'card': return 'Credit Card'
            default: return method
        }
    }

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Terug naar overzicht
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Betalingsdetails</h1>
                            <p className="text-gray-600 mt-1">Transaction ID: {payment.transactionId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push(`/restaurant/order/${payment.tableNumber}`)}
                                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center"
                            >
                                <ReceiptPercentIcon className="h-4 w-4 mr-2" />
                                Bekijk bestelling
                            </button>
                            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                                {payment.status === 'completed' && <CheckCircleIcon className="h-4 w-4 inline mr-1" />}
                                {payment.status === 'failed' && <XCircleIcon className="h-4 w-4 inline mr-1" />}
                                {payment.status === 'completed' ? 'Betaald' : payment.status === 'failed' ? 'Mislukt' : payment.status === 'pending' ? 'In behandeling' : 'Terugbetaald'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Financial Breakdown */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <CalculatorIcon className="h-5 w-5 mr-2 text-green-600" />
                                    Financieel overzicht
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {/* Order Amount */}
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <div className="flex items-center">
                                            <ReceiptPercentIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            <span className="text-gray-700">Bestelbedrag</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">€{payment.orderAmount.toFixed(2)}</span>
                                    </div>

                                    {/* Tip */}
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <div className="flex items-center">
                                            <GiftIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            <span className="text-gray-700">Fooi</span>
                                            {payment.tipAmount > 0 && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {((payment.tipAmount / payment.orderAmount) * 100).toFixed(1)}%
                        </span>
                                            )}
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">€{payment.tipAmount.toFixed(2)}</span>
                                    </div>

                                    {/* Splitty Fee */}
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <div className="flex items-center">
                                            <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            <span className="text-gray-700">Servicekosten</span>
                                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Door klant betaald
                      </span>
                                        </div>
                                        <span className="text-lg font-semibold text-blue-600">€{payment.splittyFee.toFixed(2)}</span>
                                    </div>

                                    {/* Total Charged to Customer */}
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                        <div className="flex items-center">
                                            <BanknotesIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-700 font-medium">Totaal berekend</span>
                                                <p className="text-xs text-gray-500">Inclusief fooi en kosten</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">€{payment.totalCharged.toFixed(2)}</span>
                                    </div>

                                    {/* Net Amount Restaurant Receives */}
                                    <div className="flex justify-between items-center bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <BuildingStorefrontIcon className="h-6 w-6 text-green-600 mr-3" />
                                            <div>
                                                <span className="text-green-900 font-semibold">Restaurant ontvangt</span>
                                                <p className="text-xs text-green-700">Bestelbedrag + fooi</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-green-600">€{payment.netAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Items */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-600" />
                                    Betaalde items
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {payment.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                          <span className="text-gray-700">
                            {item.name}
                              {item.quantity && item.quantity !== 1 && (
                                  <span className="ml-2 text-sm text-gray-500">x{item.quantity}</span>
                              )}
                          </span>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 ml-4">€{item.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">Subtotaal items</span>
                                            <span className="font-semibold text-gray-900">€{payment.orderAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method & Processing */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-base font-medium text-gray-900">
                                    Betaalmethode & Verwerking
                                </h2>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="flex items-center justify-between sm:block">
                                        <dt className="text-sm font-medium text-gray-500">Betaalmethode</dt>
                                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                            <CreditCardIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                            {getPaymentMethodDisplayName(payment.paymentMethod)}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between sm:block">
                                        <dt className="text-sm font-medium text-gray-500">Payment Provider</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{payment.paymentProvider}</dd>
                                    </div>
                                    <div className="flex items-center justify-between sm:block">
                                        <dt className="text-sm font-medium text-gray-500">Aangemaakt op</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {payment.timestamp.toLocaleString('nl-NL', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between sm:block">
                                        <dt className="text-sm font-medium text-gray-500">Voltooid op</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {payment.processedAt ? payment.processedAt.toLocaleString('nl-NL', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N.v.t.'}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between sm:block">
                                        <dt className="text-sm font-medium text-gray-500">Uitbetaaldatum</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {payment.settlementDate.toLocaleDateString('nl-NL', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Additional Info */}
                    <div className="space-y-6">
                        {/* Split Session Info */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <UsersIcon className="h-5 w-5 mr-2 text-gray-600" />
                                    Split Sessie
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Split Mode</p>
                                    <p className="font-semibold text-gray-900 capitalize">
                                        {payment.splitSession.split_mode === 'items' ? 'Items' :
                                            payment.splitSession.split_mode === 'equal' ? 'Gelijk verdeeld' :
                                                payment.splitSession.split_mode === 'custom' ? 'Aangepast' :
                                                    payment.splitSession.split_mode}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Session Status</p>
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${payment.splitSession.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <p className="font-semibold text-gray-900">
                                            {payment.splitSession.is_active ? 'Actief' : 'Beëindigd'}
                                        </p>
                                    </div>
                                </div>
                                {payment.splitSession.people_count && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Aantal personen</p>
                                        <p className="font-semibold text-gray-900">{payment.splitSession.people_count}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Session ID</p>
                                    <p className="font-mono text-sm font-semibold text-gray-900">{payment.splitSession.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
                                    Snelle info
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Payment ID</p>
                                    <p className="font-mono text-sm font-semibold text-gray-900">{payment.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                                    <p className="font-mono text-sm font-semibold text-gray-900">{payment.transactionId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order Nummer</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <HashtagIcon className="h-4 w-4 mr-1 text-gray-600" />
                                        {payment.orderNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tafel</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <BuildingStorefrontIcon className="h-4 w-4 mr-1 text-gray-600" />
                                        Tafel {payment.tableNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tijdstip</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <ClockIcon className="h-4 w-4 mr-1 text-gray-600" />
                                        {payment.timestamp.toLocaleString('nl-NL')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Acties</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                {payment.status === 'completed' && (
                                    <>
                                        <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center">
                                            <DocumentTextIcon className="h-4 w-4 mr-2" />
                                            Download factuur
                                        </button>
                                        <button className="w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                                            Terugbetaling aanvragen
                                        </button>
                                    </>
                                )}
                                {payment.status === 'failed' && (
                                    <button className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                                        Opnieuw proberen
                                    </button>
                                )}
                                <button
                                    onClick={() => router.push(`/restaurant/order/${payment.tableNumber}`)}
                                    className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                >
                                    Bekijk bestelling details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PaymentDetail