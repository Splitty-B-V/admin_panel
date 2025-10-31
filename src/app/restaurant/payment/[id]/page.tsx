'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
    ArrowPathIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import {getPaymentDetails, downloadInvoice} from "@/lib/api";
import RefundModal from "@/components/restaurant/payment/RefundModal";
import SmartLayout from "@/components/common/SmartLayout";

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

interface RefundInfo {
    id: number
    uuid: string
    amount: number
    reason: string | null
    status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
    stripe_refund_id: string | null
    created_at: string
    created_by_user_id: number | null
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
    total_refunded: number
    remaining_refundable: number
    is_fully_refunded: boolean
    refunds: RefundInfo[]
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
    totalRefunded: number
    remainingRefundable: number
    isFullyRefunded: boolean
    refunds: RefundInfo[]
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
        splitSession: apiPayment.split_session,
        totalRefunded: apiPayment.total_refunded,
        remainingRefundable: apiPayment.remaining_refundable,
        isFullyRefunded: apiPayment.is_fully_refunded,
        refunds: apiPayment.refunds
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
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

    useEffect(() => {
        document.title = 'Payment - Splitty'
    }, [])

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

    const getRefundReasonDisplay = (reason: string | null) => {
        if (!reason) return '-'

        const reasonMap: { [key: string]: string } = {
            'requested_by_customer': t('refund.reasons.requested_by_customer'),
            'duplicate': t('refund.reasons.duplicate'),
            'fraudulent': t('refund.reasons.fraudulent')
        }

        return reasonMap[reason] || reason
    }

    if (loading) {
        return (
            <SmartLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">{t('payment.loading')}</p>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    if (error) {
        return (
            <SmartLayout>
                <div className="p-4 sm:p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{t('payment.error')}: {error}</p>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    if (!payment) {
        return (
            <SmartLayout>
                <div className="p-4 sm:p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">{t('payment.notFound')}</p>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    const getStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'failed': return 'bg-red-100 text-red-800 border-red-200'
            case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status: Payment['status']) => {
        switch (status) {
            case 'completed': return <CheckCircleIcon className="h-5 w-5" />
            case 'failed': return <XCircleIcon className="h-5 w-5" />
            default: return <ClockIcon className="h-5 w-5" />
        }
    }

    const getRefundStatusColor = (status: RefundInfo['status']) => {
        switch (status) {
            case 'succeeded': return 'bg-green-100 text-green-800 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'failed': return 'bg-red-100 text-red-800 border-red-200'
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getRefundStatusIcon = (status: RefundInfo['status']) => {
        switch (status) {
            case 'succeeded': return <CheckCircleIcon className="h-4 w-4" />
            case 'failed': return <XCircleIcon className="h-4 w-4" />
            case 'cancelled': return <XCircleIcon className="h-4 w-4" />
            default: return <ClockIcon className="h-4 w-4" />
        }
    }

    const getPaymentMethodDisplay = (method: Payment['paymentMethod']) => {
        switch (method) {
            case 'card': return t('payment.methods.card')
            case 'ideal': return 'iDEAL'
            case 'apple_pay': return 'Apple Pay'
            case 'google_pay': return 'Google Pay'
            default: return method
        }
    }

    return (
        <SmartLayout>
            <div className="min-h-screen bg-gray-50 pb-8">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                <span className="text-sm sm:text-base">{t("common.back")}</span>
                            </button>
                            <div className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-medium flex items-center ${getStatusColor(payment.status)}`}>
                                {getStatusIcon(payment.status)}
                                <span className="ml-1.5 capitalize">{payment.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Mobile: Single column, Desktop: Two columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Payment Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Amount Summary */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <BanknotesIcon className="h-5 w-5 mr-2 text-gray-600" />
                                        {t("payment.totalAmount")}
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="text-center py-4 sm:py-6">
                                        <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                                            €{payment.totalCharged.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">{t("payment.totalCharged")}</p>
                                    </div>

                                    {/* Breakdown - Responsive grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs sm:text-sm text-gray-500">{t("payment.orderAmount")}</p>
                                            <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-1">€{payment.orderAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs sm:text-sm text-gray-500">{t("payment.tip")}</p>
                                            <p className="text-lg sm:text-xl font-semibold text-green-600 mt-1">+€{payment.tipAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs sm:text-sm text-gray-500">{t("payment.splittyFee")}</p>
                                            <p className="text-lg sm:text-xl font-semibold text-orange-600 mt-1">€{payment.splittyFee.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm sm:text-base text-gray-600">{t("payment.netAmountReceived")}</span>
                                            <span className="text-xl sm:text-2xl font-bold text-green-600">€{payment.netAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Refund Info */}
                                    {payment.totalRefunded > 0 && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                <div className="flex items-start">
                                                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                                    <div className="ml-3 flex-1">
                                                        <p className="text-sm font-medium text-orange-900">{t('payment.refundInfo.partiallyRefunded')}</p>
                                                        <div className="mt-2 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-orange-800">{t('payment.refundInfo.totalRefunded')}:</span>
                                                                <span className="text-sm font-semibold text-orange-900">€{payment.totalRefunded.toFixed(2)}</span>
                                                            </div>
                                                            {!payment.isFullyRefunded && (
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-orange-800">{t('payment.refundInfo.remainingRefundable')}:</span>
                                                                    <span className="text-sm font-semibold text-orange-900">€{payment.remainingRefundable.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Refunds Section */}
                            {payment.refunds && payment.refunds.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-600" />
                                            {t('payment.refunds.title')} ({payment.refunds.length})
                                        </h2>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <div className="space-y-4">
                                            {payment.refunds.map((refund) => (
                                                <div key={refund.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-lg font-bold text-gray-900">
                                                                    €{refund.amount.toFixed(2)}
                                                                </span>
                                                                <div className={`px-2 py-0.5 rounded-full border text-xs font-medium flex items-center ${getRefundStatusColor(refund.status)}`}>
                                                                    {getRefundStatusIcon(refund.status)}
                                                                    <span className="ml-1 capitalize">{refund.status}</span>
                                                                </div>
                                                            </div>
                                                            {refund.reason && (
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    <span className="font-medium">{t('payment.refunds.reason')}:</span> {getRefundReasonDisplay(refund.reason)}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(refund.created_at).toLocaleString('nl-NL', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-3 border-t border-gray-100 space-y-1">
                                                        <p className="text-xs text-gray-500">
                                                            <span className="font-medium">{t('payment.refunds.refundId')}:</span>{' '}
                                                            <span className="font-mono">{refund.uuid}</span>
                                                        </p>
                                                        {refund.stripe_refund_id && (
                                                            <p className="text-xs text-gray-500">
                                                                <span className="font-medium">{t('payment.refunds.stripeId')}:</span>{' '}
                                                                <span className="font-mono">{refund.stripe_refund_id}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-600" />
                                        {t("payment.orderItems")}
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-3">
                                        {payment.items.map((item, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-0 gap-2 sm:gap-0">
                                                <div className="flex items-start sm:items-center flex-1">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0 mt-0.5 sm:mt-0">
                                                        {item.quantity}
                                                    </span>
                                                    <span className="ml-3 text-sm sm:text-base text-gray-900 break-words">{item.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end sm:ml-4 pl-9 sm:pl-0">
                                                    <span className="text-xs text-gray-500 sm:mr-4">
                                                        €{item.price.toFixed(2)} × {item.quantity}
                                                    </span>
                                                    <span className="text-sm sm:text-base font-semibold text-gray-900 ml-2">
                                                        €{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method & Times */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                                        {t("payment.paymentMethod")}
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col sm:block">
                                            <dt className="text-sm font-medium text-gray-500">{t("payment.method")}</dt>
                                            <dd className="mt-1 text-sm sm:text-base text-gray-900 font-semibold">
                                                {getPaymentMethodDisplay(payment.paymentMethod)}
                                            </dd>
                                        </div>
                                        <div className="flex flex-col sm:block">
                                            <dt className="text-sm font-medium text-gray-500">{t("payment.provider")}</dt>
                                            <dd className="mt-1 text-sm sm:text-base text-gray-900 capitalize font-semibold">
                                                {payment.paymentProvider}
                                            </dd>
                                        </div>
                                        <div className="flex flex-col sm:block">
                                            <dt className="text-sm font-medium text-gray-500">{t("payment.paymentCreatedOn")}</dt>
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
                                        <div className="flex flex-col sm:block">
                                            <dt className="text-sm font-medium text-gray-500">{t("order.completed")}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {payment.processedAt ? payment.processedAt.toLocaleString('nl-NL', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : t('common.notApplicable')}
                                            </dd>
                                        </div>
                                        <div className="flex flex-col sm:block sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">{t("payment.payoutDate")}</dt>
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
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <UsersIcon className="h-5 w-5 mr-2 text-gray-600" />
                                        {t("payment.splitSessionInfo")}
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.splitModeInfo")}</p>
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {payment.splitSession.split_mode === 'items' ? t('payment.splitModes.items') :
                                                payment.splitSession.split_mode === 'equal' ? t('payment.splitModes.equal') :
                                                    payment.splitSession.split_mode === 'custom' ? t('payment.splitModes.custom') :
                                                        payment.splitSession.split_mode}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.splitSessionStatus")}</p>
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${payment.splitSession.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <p className="font-semibold text-gray-900">
                                                {payment.splitSession.is_active ? t("payment.splitSessionStatusActive") : t("payment.splitSessionStatusInactive")}
                                            </p>
                                        </div>
                                    </div>
                                    {payment.splitSession.people_count && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{t('payment.peopleCount')}</p>
                                            <p className="font-semibold text-gray-900">{payment.splitSession.people_count}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.splitSessionInfoId")}</p>
                                        <p className="font-mono text-sm font-semibold text-gray-900 break-all">{payment.splitSession.id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
                                        {t("payment.quickInfo")}
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.paymentId")}</p>
                                        <p className="font-mono text-sm font-semibold text-gray-900 break-all">{payment.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.transactionId")}</p>
                                        <p className="font-mono text-xs sm:text-sm font-semibold text-gray-900 break-all">{payment.transactionId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.orderNumber")}</p>
                                        <p className="font-semibold text-gray-900 flex items-center">
                                            <HashtagIcon className="h-4 w-4 mr-1 text-gray-600 flex-shrink-0" />
                                            <span className="break-all">{payment.orderNumber}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.table")}</p>
                                        <p className="font-semibold text-gray-900 flex items-center">
                                            <BuildingStorefrontIcon className="h-4 w-4 mr-1 text-gray-600 flex-shrink-0" />
                                            {t("payment.table")} {payment.tableNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t("payment.time")}</p>
                                        <p className="font-semibold text-gray-900 flex items-start sm:items-center">
                                            <ClockIcon className="h-4 w-4 mr-1 text-gray-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            <span className="text-sm">{payment.timestamp.toLocaleString('nl-NL')}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">{t("payment.actions")}</h2>
                                </div>
                                <div className="p-4 sm:p-6 space-y-3">
                                    {payment.status === 'completed' && (
                                        <>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const blob = await downloadInvoice(payment.id)
                                                        const url = URL.createObjectURL(blob)
                                                        const link = document.createElement('a')
                                                        link.href = url
                                                        link.download = `invoice_${payment.id}.pdf`
                                                        link.click()
                                                        URL.revokeObjectURL(url)
                                                    } catch (error) {
                                                        console.error('Error downloading invoice:', error)
                                                    }
                                                }}
                                                className="w-full px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center"
                                            >
                                                <DocumentTextIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span>{t("payment.downloadInvoice")}</span>
                                            </button>
                                            {!payment.isFullyRefunded && payment.remainingRefundable > 0 && (
                                                <button
                                                    onClick={() => setIsRefundModalOpen(true)}
                                                    className="w-full px-4 py-2.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                                                >
                                                    {t("payment.requestRefund")}
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {payment.status === 'failed' && (
                                        <button className="w-full px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                                            {t("payment.retryPayment")}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push(`/restaurant/order/${payment?.orderNumber}`)}
                                        className="w-full px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        {t("payment.viewOrderDetails")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {payment && (
                <RefundModal
                    payment={payment}
                    isOpen={isRefundModalOpen}
                    onClose={() => setIsRefundModalOpen(false)}
                    onSuccess={() => {
                        window.location.reload()
                    }}
                />
            )}
        </SmartLayout>
    )
}

export default PaymentDetail