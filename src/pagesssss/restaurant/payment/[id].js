import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  ArrowLeftIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  CalendarIcon,
  HashtagIcon,
  UserIcon,
  BuildingStorefrontIcon,
  ReceiptPercentIcon,
  ClockIcon,
  InformationCircleIcon,
  BanknotesIcon,
  CalculatorIcon,
  DocumentTextIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  GiftIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

// Generate mock payment data with all details
const generatePaymentData = (paymentId) => {
  const payments = {
    '1078': {
      id: 'SPL-2024-1078',
      transactionId: 'TRX-1078-2024',
      tableNumber: 5,
      orderNumber: 'ORD-20240005',
      orderAmount: 42.50,
      tipAmount: 3.50,
      splittyFee: 0.70,
      totalCharged: 46.70, // orderAmount + tipAmount + splittyFee
      netAmount: 46.00, // What restaurant receives (orderAmount + tipAmount)
      status: 'completed',
      paymentMethod: 'iDEAL',
      paymentProvider: 'Stripe',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      processedAt: new Date(Date.now() - 9 * 60 * 1000),
      settlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      items: [
        { name: 'Burger Deluxe', price: 18.50, quantity: 1 },
        { name: 'Cola', price: 3.50, quantity: 1 },
        { name: 'Frites', price: 4.50, quantity: 1 },
        { name: 'Caesar Salad', price: 14.50, quantity: 1 },
        { name: 'Mayonaise', price: 1.50, quantity: 1 }
      ],
      splitDetails: {
        splitType: 'items', // items, equal, custom
        paidPart: '1/4 gasten',
        totalBillAmount: 103.50
      },
      deviceInfo: {
        type: 'iOS',
        model: 'iPhone 14 Pro',
        appVersion: '2.1.3'
      },
      qrCode: 'QR-TABLE-5-SESSION-A3F2',
      ipAddress: '84.241.XXX.XXX',
      refundStatus: null,
      notes: null
    },
    '1077': {
      id: 'SPL-2024-1077',
      transactionId: 'TRX-1077-2024',
      tableNumber: 12,
      orderNumber: 'ORD-20240012',
      orderAmount: 85.00,
      tipAmount: 4.50,
      splittyFee: 0.70,
      totalCharged: 90.20,
      netAmount: 89.50,
      status: 'completed',
      paymentMethod: 'Apple Pay',
      paymentProvider: 'Stripe',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      processedAt: new Date(Date.now() - 24 * 60 * 1000),
      settlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: [
        { name: '1/2 van totale rekening', price: 85.00, quantity: 1, description: 'Gelijk verdeeld (€170.00 / 2 gasten)' }
      ],
      splitDetails: {
        splitType: 'equal',
        paidPart: '1/2 gasten',
        totalBillAmount: 170.00
      },
      deviceInfo: {
        type: 'Android',
        model: 'Samsung Galaxy S23',
        appVersion: '2.1.2'
      },
      qrCode: 'QR-TABLE-12-SESSION-B7K9',
      ipAddress: '145.132.XXX.XXX',
      refundStatus: null,
      notes: 'Guest requested split bill'
    },
    '1076': {
      id: 'SPL-2024-1076',
      transactionId: 'TRX-1076-2024',
      tableNumber: 3,
      orderNumber: 'ORD-20240003',
      orderAmount: 32.50,
      tipAmount: 2.25,
      splittyFee: 0.70,
      totalCharged: 35.45,
      netAmount: 34.75,
      status: 'completed',
      paymentMethod: 'Credit Card',
      paymentProvider: 'Stripe',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      processedAt: new Date(Date.now() - 44 * 60 * 1000),
      settlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Aangepast bedrag', price: 32.50, quantity: 1, description: 'Zelf gekozen bedrag van totale rekening' }
      ],
      splitDetails: {
        splitType: 'custom',
        paidAmount: 32.50,
        remainingAmount: 65.00,
        totalBillAmount: 97.50
      },
      deviceInfo: {
        type: 'iOS',
        model: 'iPhone 13',
        appVersion: '2.1.3'
      },
      qrCode: 'QR-TABLE-3-SESSION-M2L8',
      ipAddress: '213.127.XXX.XXX',
      refundStatus: null,
      notes: null
    },
    '1075': {
      id: 'SPL-2024-1075',
      transactionId: 'TRX-1075-2024',
      tableNumber: 9,
      orderNumber: 'ORD-20240009',
      orderAmount: 145.00,
      tipAmount: 11.20,
      splittyFee: 0.70,
      totalCharged: 156.90,
      netAmount: 156.20,
      status: 'completed',
      paymentMethod: 'iDEAL',
      paymentProvider: 'Stripe',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      processedAt: new Date(Date.now() - 59 * 60 * 1000),
      settlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Hele rekening', price: 145.00, quantity: 1, description: 'Volledige rekening in één keer betaald' }
      ],
      splitDetails: {
        splitType: 'whole',
        paidPart: '1 persoon voor hele groep',
        totalBillAmount: 145.00
      },
      deviceInfo: {
        type: 'Android',
        model: 'Google Pixel 7',
        appVersion: '2.1.3'
      },
      qrCode: 'QR-TABLE-9-SESSION-P9Q3',
      ipAddress: '77.251.XXX.XXX',
      refundStatus: null,
      notes: 'Birthday celebration'
    },
    '1074': {
      id: 'SPL-2024-1074',
      transactionId: 'TRX-1074-2024',
      tableNumber: 1,
      orderNumber: 'ORD-20240001',
      orderAmount: 22.50,
      tipAmount: 0,
      splittyFee: 0.70,
      totalCharged: 23.20,
      netAmount: 22.50,
      status: 'failed',
      paymentMethod: 'Credit Card',
      paymentProvider: 'Stripe',
      timestamp: new Date(Date.now() - 75 * 60 * 1000),
      processedAt: null,
      settlementDate: null,
      items: [
        { name: 'Pasta Carbonara', price: 15.50, quantity: 1 },
        { name: 'Tiramisu', price: 7.00, quantity: 1 }
      ],
      splitDetails: {
        splitType: 'items',
        paidPart: '0/2 delen',
        totalBillAmount: 45.00
      },
      deviceInfo: {
        type: 'iOS',
        model: 'iPhone 12',
        appVersion: '2.1.1'
      },
      qrCode: 'QR-TABLE-1-SESSION-R4T6',
      ipAddress: '62.195.XXX.XXX',
      refundStatus: null,
      failureReason: 'Insufficient funds',
      notes: 'Customer retry pending'
    },
    '1073': {
      id: 'SPL-2024-1073',
      transactionId: 'TRX-1073-2024',
      tableNumber: 15,
      orderNumber: 'ORD-20240015',
      orderAmount: 73.00,
      tipAmount: 5.90,
      splittyFee: 0.70,
      totalCharged: 79.60,
      netAmount: 78.90,
      status: 'completed',
      paymentMethod: 'Google Pay',
      paymentProvider: 'Stripe',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      processedAt: new Date(Date.now() - 89 * 60 * 1000),
      settlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Tournedos', price: 32.50, quantity: 1 },
        { name: 'Rode Wijn', price: 7.50, quantity: 2 },
        { name: 'Crème Brûlée', price: 8.50, quantity: 1 },
        { name: 'Koffie', price: 3.00, quantity: 2 },
        { name: 'Kaasplateau', price: 11.00, quantity: 1 }
      ],
      splitDetails: {
        splitType: 'items',
        itemsPaid: 5,
        totalItems: 12,
        totalBillAmount: 195.00
      },
      deviceInfo: {
        type: 'iOS',
        model: 'iPad Pro',
        appVersion: '2.1.3'
      },
      qrCode: 'QR-TABLE-15-SESSION-V8X2',
      ipAddress: '94.213.XXX.XXX',
      refundStatus: null,
      notes: null
    }
  }

  // Default payment if ID not found
  const defaultPayment = payments['1078']
  return payments[paymentId] || { ...defaultPayment, id: `SPL-2024-${paymentId}` }
}

export default function PaymentDetail() {
  const router = useRouter()
  const { id } = router.query
  const { t } = useLanguage()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      // Simulate loading payment data
      setTimeout(() => {
        const paymentData = generatePaymentData(id)
        setPayment(paymentData)
        setLoading(false)
      }, 500)
    }
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'iDEAL': return '🏦'
      case 'Apple Pay': return '🍎'
      case 'Google Pay': return '🔍'
      case 'Credit Card': return '💳'
      default: return '💰'
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
            {t('payment.backToOverview')}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('payment.title')}</h1>
              <p className="text-gray-600 mt-1">{t('payment.transactionId')} {payment.transactionId}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push(`/order/${payment.tableNumber}`)}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center"
              >
                <ReceiptPercentIcon className="h-4 w-4 mr-2" />
                {t('payment.viewOrder')}
              </button>
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                {payment.status === 'completed' && <CheckCircleIcon className="h-4 w-4 inline mr-1" />}
                {payment.status === 'failed' && <XCircleIcon className="h-4 w-4 inline mr-1" />}
                {payment.status === 'completed' ? t('payment.paid') : payment.status === 'failed' ? t('payment.failed') : t('payment.pending')}
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
                  {t('payment.financialOverview')}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Order Amount */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <ReceiptPercentIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{t('payment.orderAmount')}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">€{payment.orderAmount.toFixed(2)}</span>
                  </div>

                  {/* Tip */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <GiftIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{t('payment.tip')}</span>
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
                      <span className="text-gray-700">{t('payment.serviceFee')}</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {t('payment.paidByCustomer')}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">€{payment.splittyFee.toFixed(2)}</span>
                  </div>

                  {/* Total Charged to Customer */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <BanknotesIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-gray-700 font-medium">{t('payment.totalCharged')}</span>
                        <p className="text-xs text-gray-500">{t('payment.includingTip')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">€{payment.totalCharged.toFixed(2)}</span>
                  </div>

                  {/* Net Amount Restaurant Receives */}
                  <div className="flex justify-between items-center bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <span className="text-green-900 font-semibold">{t('payment.restaurantReceives')}</span>
                        <p className="text-xs text-green-700">{t('payment.orderAmountPlusTip')}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-600">€{payment.netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details Based on Split Mode */}
            {payment.splitDetails?.splitType === 'items' ? (
              // Show individual items for "items" split mode
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-600" />
                    {t('payment.paidItems')}
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
                        <span className="text-sm font-medium text-gray-700">{t('payment.subtotalItems')}</span>
                        <span className="font-semibold text-gray-900">€{payment.orderAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Show payment details for other split modes
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Betalingsdetails
                  </h2>
                </div>
                <div className="p-6">
                  {payment.splitDetails?.splitType === 'equal' ? (
                  // Show equal division details
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">Gelijk Verdeelde Betaling</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        De totale rekening van €{payment.splitDetails.totalBillAmount?.toFixed(2)} is gelijk verdeeld
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Totale rekening</span>
                        <span className="font-medium text-gray-900">€{payment.splitDetails.totalBillAmount?.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Jouw deel</span>
                          <span className="font-semibold text-gray-900">€{payment.orderAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : payment.splitDetails?.splitType === 'custom' ? (
                  // Show custom amount details
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CalculatorIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium text-purple-900">Aangepast Bedrag</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Gast heeft zelf een bedrag gekozen om te betalen
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Totale rekening</span>
                        <span className="font-medium text-gray-900">€{payment.splitDetails.totalBillAmount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dit bedrag betaald</span>
                        <span className="font-semibold text-green-600">€{payment.orderAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Resterend bedrag</span>
                        <span className="font-medium text-orange-600">€{payment.splitDetails.remainingAmount?.toFixed(2) || (payment.splitDetails.totalBillAmount - payment.orderAmount).toFixed(2)}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-gray-100">
                      </div>
                    </div>
                  </div>
                ) : payment.splitDetails?.splitType === 'whole' ? (
                  // Show whole bill payment details
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CreditCardIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">Volledige Rekening</span>
                      </div>
                      <p className="text-sm text-green-700">
                        De complete rekening is in één keer betaald
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Totaal betaald</span>
                          <span className="font-semibold text-gray-900">€{payment.orderAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Fallback for payments without split details
                  <div className="space-y-3">
                    {payment.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-gray-700">{item.name}</span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 ml-4">€{item.price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Payment Method & Processing */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-medium text-gray-900">
                  {t('payment.paymentMethod')} & {t('payment.processing') || 'Verwerking'}
                </h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="flex items-center justify-between sm:block">
                    <dt className="text-sm font-medium text-gray-500">{t('payment.paymentMethod')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <CreditCardIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                      {payment.paymentMethod}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between sm:block">
                    <dt className="text-sm font-medium text-gray-500">{t('payment.paymentProvider')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{payment.paymentProvider}</dd>
                  </div>
                  <div className="flex items-center justify-between sm:block">
                    <dt className="text-sm font-medium text-gray-500">{t('payment.processedAt')}</dt>
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
                    <dt className="text-sm font-medium text-gray-500">{t('payment.settlementDate')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {payment.settlementDate ? payment.settlementDate.toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N.v.t.'}
                    </dd>
                  </div>
                </dl>
                
                {payment.failureReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Reden mislukt:</span> {payment.failureReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Split Payment Info */}
            {payment.splitDetails && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-gray-600" />
                    {payment.splitDetails.splitType === 'items' && t('payment.splitMode.items')}
                    {payment.splitDetails.splitType === 'equal' && t('payment.splitMode.equal')}
                    {payment.splitDetails.splitType === 'custom' && t('payment.splitMode.custom')}
                    {payment.splitDetails.splitType === 'whole' && t('payment.splitMode.whole')}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('payment.splitDetails.paymentMode')}</p>
                    <p className="font-semibold text-gray-900">
                      {payment.splitDetails.splitType === 'items' && t('payment.splitMode.items')}
                      {payment.splitDetails.splitType === 'equal' && t('payment.splitMode.equal')}
                      {payment.splitDetails.splitType === 'custom' && t('payment.splitMode.custom')}
                      {payment.splitDetails.splitType === 'whole' && t('payment.splitMode.whole')}
                    </p>
                  </div>
                  {payment.splitDetails.splitType === 'equal' && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Deel van betaling</p>
                      <p className="font-semibold text-gray-900">{payment.splitDetails.paidPart}</p>
                    </div>
                  )}
                  {payment.splitDetails.splitType === 'custom' && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('payment.splitDetails.paidAmount')}</p>
                      <p className="font-semibold text-gray-900">€{payment.orderAmount.toFixed(2)}</p>
                    </div>
                  )}
                  {payment.splitDetails.splitType === 'items' && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('payment.splitDetails.numberOfItems')}</p>
                      <p className="font-semibold text-gray-900">{payment.items?.length || 0} items</p>
                    </div>
                  )}
                  {payment.splitDetails.splitType === 'whole' && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('payment.splitDetails.paidFor') || 'Betaald voor'}</p>
                      <p className="font-semibold text-gray-900">{t('payment.splitDetails.wholeGroup') || 'Hele groep'}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('payment.splitDetails.totalBill')}</p>
                    <p className="font-semibold text-gray-900">€{payment.splitDetails.totalBillAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
                  {t('payment.quickInfo')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{payment.id}</p>
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
                  <p className="text-sm text-gray-500 mb-1">{t('payment.time')}</p>
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
                <h2 className="text-lg font-semibold text-gray-900">{t('payment.actions')}</h2>
              </div>
              <div className="p-6 space-y-3">
                {payment.status === 'completed' && (
                  <>
                    <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      {t('payment.downloadInvoice')}
                    </button>
                    <button className="w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                      {t('payment.requestRefund')}
                    </button>
                  </>
                )}
                {payment.status === 'failed' && (
                  <button className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                    {t('payment.retryPayment')}
                  </button>
                )}
                <button 
                  onClick={() => router.push(`/order/${payment.tableNumber}`)}
                  className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  {t('payment.viewOrderDetails')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {payment.notes && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Notities:</strong> {payment.notes}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}