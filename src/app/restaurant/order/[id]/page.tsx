'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    UsersIcon,
    ClockIcon,
    UserIcon,
    CurrencyEuroIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClipboardDocumentListIcon,
    CreditCardIcon,
    ReceiptPercentIcon,
    CalendarIcon,
    HashtagIcon,
    BuildingStorefrontIcon,
    BanknotesIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    CalculatorIcon,
    QrCodeIcon,
    ChartBarIcon,
    DocumentTextIcon,
    PrinterIcon,
    GiftIcon,
} from '@heroicons/react/24/outline'
import {getOrderDetail} from "@/lib/api";
import SmartLayout from "@/components/common/SmartLayout";

// TypeScript interfaces
interface OrderDetailResponse {
    id: number
    table_number: number
    status: string
    order_number: string
    total_amount: number
    paid_amount: number
    remaining_amount: number
    created_at: string
    pos_created_at?: string
    customer_name?: string
    covers?: number
    items: OrderItem[]
    payments: Payment[]
}

interface OrderItem {
    name: string
    price: number
    quantity: number
    paid: boolean
}

interface Payment {
    id: string
    transaction_id: string
    amount: number
    tip: number
    fee: number
    method: string
    status: 'completed' | 'failed' | 'pending'
    time: string
    split_mode: 'items' | 'equal' | 'custom' | 'whole'
    items: string[]
    failure_reason?: string
}

const OrderDetail: React.FC = () => {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const { t } = useLanguage()
    const [orderData, setOrderData] = useState<OrderDetailResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        document.title = 'Order - Splitty'
    }, [])

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!id) return

            try {
                setLoading(true)
                setError(null)

                const data = await getOrderDetail(id)
                setOrderData(data)

            } catch (error) {
                console.error('Error fetching order detail:', error)
                setError('Failed to load order details')
            } finally {
                setLoading(false)
            }
        }

        fetchOrderDetail()
    }, [id])

    // Вычисляемые значения на основе реальных данных
    const orderTotal = orderData?.total_amount || 0
    const paidAmount = orderData?.paid_amount || 0
    const remainingAmount = orderData?.remaining_amount || 0
    const paymentProgress = orderTotal > 0 ? (paidAmount / orderTotal) * 100 : 0

    // Calculate tips and fees from real payments
    const totalTips = orderData?.payments?.reduce((sum, p) => sum + (p.tip || 0), 0) || 0
    const totalFees = orderData?.payments?.reduce((sum, p) => sum + (p.fee || 0), 0) || 0

    const getStatusColor = (status: string): string => {
        switch(status) {
            case 'free': return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'occupied': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getPaymentMethodIcon = (method: string): string => {
        switch(method?.toLowerCase()) {
            case 'ideal': return '🏦'
            case 'apple_pay': return '🍎'
            case 'google_pay': return '🔍'
            case 'card': return '💳'
            default: return '💰'
        }
    }

    if (loading) {
        return (
            <SmartLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">Loading order...</p>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    if (error || !orderData) {
        return (
            <SmartLayout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error || `Order ${id} not found`}</p>
                        <button
                            onClick={() => router.push('/restaurant/dashboard')}
                            className="mt-2 text-red-600 hover:text-red-700 underline"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    if (orderData.status === 'free') {
        return (
            <SmartLayout>
                <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">No active order for table {orderData.table_number}</p>
                        <button
                            onClick={() => router.push('/restaurant/dashboard')}
                            className="mt-2 text-yellow-600 hover:text-yellow-700 underline"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    return (
        <SmartLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/restaurant/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        {t('order.backToOrders')}
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('order.title')}</h1>
                            <p className="text-gray-600 mt-1">
                                {t('order.table')} {orderData.table_number} - {t('order.orderNumber')}{orderData.order_number}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                {t('order.refresh')}
                            </button>
                            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(orderData.status)}`}>
                                {orderData.status === 'occupied' && <ClockIcon className="h-4 w-4 inline mr-1" />}
                                {orderData.status === 'waiting' && <ExclamationCircleIcon className="h-4 w-4 inline mr-1" />}
                                {orderData.status === 'occupied' ? t('order.tableStatus.occupied') :
                                    orderData.status === 'waiting' ? t('order.tableStatus.waiting') :
                                        t('order.tableStatus.free')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Financial Overview */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <CalculatorIcon className="h-5 w-5 mr-2 text-green-600" />
                                    {t('order.orderOverview')}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {/* Order Total */}
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <div className="flex items-center">
                                            <ReceiptPercentIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            <span className="text-gray-700">{t('order.totalOrder')}</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">€{orderTotal.toFixed(2)}</span>
                                    </div>

                                    {/* Paid Amount */}
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            <span className="text-gray-700">{t('order.paidAmount')}</span>
                                            {paidAmount > 0 && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    {Math.round(paymentProgress)}%
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-lg font-semibold text-green-600">€{paidAmount.toFixed(2)}</span>
                                    </div>

                                    {/* Tips */}
                                    {totalTips > 0 && (
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                            <div className="flex items-center">
                                                <BanknotesIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                <span className="text-gray-700">{t('order.tipsReceived')}</span>
                                            </div>
                                            <span className="text-lg font-semibold text-purple-600">€{totalTips.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Remaining Amount */}
                                    <div className="flex justify-between items-center bg-orange-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <ExclamationCircleIcon className="h-6 w-6 text-orange-600 mr-3" />
                                            <div>
                                                <span className="text-orange-900 font-semibold">{t('order.outstandingAmount')}</span>
                                                <p className="text-xs text-orange-700">{t('order.stillToPay')}</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-orange-600">€{remainingAmount.toFixed(2)}</span>
                                    </div>

                                    {/* Payment Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{t('order.paymentProgressPercent')}</span>
                                            <span>{Math.round(paymentProgress)}{t('order.percentComplete')}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        {orderData.items && orderData.items.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-600" />
                                        {t('order.orderedItems')}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {orderData.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2">
                                                <div className="flex items-center">
                                                    <span className="text-gray-700">
                                                        {item.quantity > 1 && <span className="font-medium mr-2">{item.quantity}x</span>}
                                                        {item.name}
                                                    </span>
                                                    {item.paid && (
                                                        <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    €{(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payments History */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                                    {t('order.paymentHistory')}
                                </h2>
                            </div>
                            <div className="p-6">
                                {orderData.payments && orderData.payments.length > 0 ? (
                                    <div className="space-y-4">
                                        {orderData.payments.map((payment, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-medium text-gray-900">{payment.id}</h4>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                payment.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                                    payment.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                                                        'bg-red-50 text-red-700'
                                                            }`}>
                                                                {payment.status === 'completed' ? t('order.completed') :
                                                                    payment.status === 'pending' ? t('order.pending') :
                                                                        t('order.failed')}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center space-x-4 text-gray-500">
                                                                <span>{new Date(payment.time).toLocaleString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    day: 'numeric',
                                                                    month: 'short'
                                                                })}</span>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-900">€{payment.amount.toFixed(2)}</p>
                                                                {payment.tip > 0 && (
                                                                    <p className="text-xs text-gray-500">+€{payment.tip.toFixed(2)} tip</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between">
                                                            <span className="text-xs text-gray-400">
                                                                {getPaymentMethodIcon(payment.method)} {payment.method}
                                                            </span>
                                                            <button
                                                                onClick={() => router.push(`/restaurant/payment/${payment.id.split('-').pop()}`)}
                                                                className="text-xs text-green-600 hover:text-green-700 font-medium"
                                                            >
                                                                {t('order.viewDetails')} →
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {payment.failure_reason && (
                                                    <p className="mt-2 text-xs text-red-600">{payment.failure_reason}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No payments received yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Info & Actions */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
                                    {t('order.quickInfo')}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{t('order.orderNumberLabel')}</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <HashtagIcon className="h-4 w-4 mr-1 text-gray-600" />
                                        {orderData.order_number}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Table</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <BuildingStorefrontIcon className="h-4 w-4 mr-1 text-gray-600" />
                                        Table {orderData.table_number}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Created</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-600" />
                                        {new Date(orderData.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
                                    {t('order.statistics')}
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('order.tipPercentage')}</span>
                                    <span className="font-semibold text-purple-600">
                                        {orderTotal > 0 ? ((totalTips / orderTotal) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('order.splittyFees')}</span>
                                    <span className="font-semibold text-blue-600">
                                        €{totalFees.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SmartLayout>
    )
}

export default OrderDetail