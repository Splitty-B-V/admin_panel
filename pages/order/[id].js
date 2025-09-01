import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useLanguage } from '../../contexts/LanguageContext'
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
} from '@heroicons/react/24/outline'

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const { t } = useLanguage()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      // Get table data from localStorage
      const tablesData = JSON.parse(localStorage.getItem('restaurant_tables') || '[]')
      const table = tablesData.find(t => t.num === parseInt(id))
      
      if (table) {
        // Add mock payments for demonstration
        if (table.num === 5 && table.paid > 0) {
          table.payments = [
            { 
              id: 'SPL-2024-1078',
              transactionId: 'TRX-1078-2024',
              amount: 22.00,
              tip: 1.50,
              fee: 0.70,
              method: 'iDEAL',
              status: 'completed',
              time: new Date(Date.now() - 35 * 60 * 1000),
              items: ['Burger Deluxe', 'Cola'],
              splitMode: 'items',
              guestsPaid: '1/4'
            },
            { 
              id: 'SPL-2024-1077',
              transactionId: 'TRX-1077-2024',
              amount: 14.50,
              tip: 0,
              fee: 0.70,
              method: 'Apple Pay', 
              status: 'failed',
              time: new Date(Date.now() - 28 * 60 * 1000),
              items: ['Caesar Salad'],
              failureReason: 'insufficientBalance',
              splitMode: 'items',
              guestsPaid: '2/4'
            },
            { 
              id: 'SPL-2024-1076',
              transactionId: 'TRX-1076-2024',
              amount: 14.50,
              tip: 1.00,
              fee: 0.70,
              method: 'iDEAL',
              status: 'completed',
              time: new Date(Date.now() - 25 * 60 * 1000),
              items: ['Caesar Salad'],
              splitMode: 'items',
              guestsPaid: '3/4'
            },
            { 
              id: 'SPL-2024-1075',
              transactionId: 'TRX-1075-2024',
              amount: 9.50,
              tip: 1.00,
              fee: 0.70,
              method: 'Google Pay',
              status: 'completed',
              time: new Date(Date.now() - 10 * 60 * 1000),
              items: ['Witte Wijn', 'Spa Rood'],
              splitMode: 'items',
              guestsPaid: '4/4'
            }
          ]
        } else if (table.paid > 0) {
          // Generate generic payments for other tables
          table.payments = [
            {
              id: `SPL-2024-${(1070 + parseInt(id)).toString()}`,
              transactionId: `TRX-${(1070 + parseInt(id)).toString()}-2024`,
              amount: table.paid * 0.6,
              tip: table.paid * 0.05,
              fee: 0.70,
              method: 'iDEAL',
              status: 'completed',
              time: new Date(Date.now() - 20 * 60 * 1000),
              items: ['Diverse items'],
              splitMode: 'equal',
              guestsPaid: `${table.guests || 2}/${table.guests || 2}`
            },
            {
              id: `SPL-2024-${(1060 + parseInt(id)).toString()}`,
              transactionId: `TRX-${(1060 + parseInt(id)).toString()}-2024`,
              amount: table.paid * 0.4,
              tip: table.paid * 0.03,
              fee: 0.70,
              method: 'Credit Card',
              status: 'completed',
              time: new Date(Date.now() - 15 * 60 * 1000),
              items: ['Diverse items'],
              splitMode: 'items',
              guestsPaid: `1/${table.guests || 2}`
            }
          ]
        }
        setOrder(table)
      }
      setLoading(false)
    }
  }, [id])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Vrij': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Bezet': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Wacht': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Gereserveerd': return 'bg-blue-100 text-blue-800 border-blue-200'
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

  const getSplitModeLabel = (mode) => {
    switch(mode) {
      case 'items': return t('order.splitModes.paidForItems')
      case 'equal': return t('order.splitModes.splitEqually')
      case 'custom': return t('order.splitModes.customAmountPaid')
      default: return t('order.splitModes.default')
    }
  }

  const getSplitModeIcon = (mode) => {
    switch(mode) {
      case 'items': return ReceiptPercentIcon
      case 'equal': return UsersIcon
      case 'custom': return BanknotesIcon
      default: return CreditCardIcon
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Order laden...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!order || order.status === 'Vrij') {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Geen actieve bestelling voor tafel {id}</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Calculate totals
  const orderTotal = order.amount || 0
  const paidAmount = order.paid || 0
  const remainingAmount = orderTotal - paidAmount
  const paymentProgress = orderTotal > 0 ? (paidAmount / orderTotal) * 100 : 0

  // Calculate tips from payments
  const totalTips = order.payments?.reduce((sum, p) => sum + (p.tip || 0), 0) || 0
  const totalFees = order.payments?.reduce((sum, p) => sum + (p.fee || 0), 0) || 0

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {t('order.backToOrders')}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('order.title')}</h1>
              <p className="text-gray-600 mt-1">{t('order.table')} {order.num} - {t('order.orderNumber')}{order.orderNumber || `2024${order.num.toString().padStart(4, '0')}`}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {t('order.refresh')}
              </button>
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {order.status === 'Bezet' && <ClockIcon className="h-4 w-4 inline mr-1" />}
                {order.status === 'Wacht' && <ExclamationCircleIcon className="h-4 w-4 inline mr-1" />}
                {order.status === 'Bezet' ? t('order.tableStatus.occupied') : order.status === 'Wacht' ? t('order.tableStatus.waiting') : t('order.tableStatus.free')}
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
                  {/* Split Mode */}
                  {order.payments && order.payments.length > 0 && order.payments[0].splitMode && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="flex items-center">
                        {(() => {
                          const mode = order.payments[0].splitMode
                          const Icon = getSplitModeIcon(mode)
                          return <Icon className="h-5 w-5 text-gray-400 mr-3" />
                        })()}
                        <span className="text-gray-700">{t('order.partiallyPaid')}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {(() => {
                          const mode = order.payments[0].splitMode
                          if (mode === 'items') return t('order.splitModes.paidForItems')
                          if (mode === 'equal') return t('order.splitModes.splitEqually')
                          if (mode === 'custom') return t('order.splitModes.customAmountPaid')
                          if (mode === 'whole') return t('order.splitModes.wholeBill')
                          return t('order.splitModes.none')
                        })()}
                      </span>
                    </div>
                  )}
                  
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

                  {/* Tips Collected */}
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
            {(order.orders || order.items) && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-600" />
                    {t('order.orderedItems')}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {(() => {
                      // Group items for display
                      const itemGroups = {}
                      
                      if (order.splitMode === 'items' && order.orders?.[0]?.guest) {
                        order.orders?.forEach(guest => {
                          guest.items?.forEach(item => {
                            if (!itemGroups[item.name]) {
                              itemGroups[item.name] = { name: item.name, price: item.price, count: 0, paid: item.paid }
                            }
                            itemGroups[item.name].count++
                          })
                        })
                      } else if (order.orders?.length > 0) {
                        order.orders?.forEach(item => {
                          const name = item.name || item
                          if (!itemGroups[name]) {
                            itemGroups[name] = { name, price: item.price || 0, count: 0 }
                          }
                          itemGroups[name].count++
                        })
                      }
                      
                      return Object.values(itemGroups).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <div className="flex items-center">
                            <span className="text-gray-700">
                              {item.count > 1 && <span className="font-medium mr-2">{item.count}x</span>}
                              {item.name}
                            </span>
                            {item.paid && (
                              <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            €{(item.price * item.count).toFixed(2)}
                          </span>
                        </div>
                      ))
                    })()}
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
                {order.payments && order.payments.length > 0 ? (
                  <div className="space-y-4">
                    {order.payments.map((payment, index) => (
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
                                 payment.status === 'pending' ? t('order.pending') : t('order.failed')}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-4 text-gray-500">
                                <span>{payment.time.toLocaleString('nl-NL', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  day: 'numeric',
                                  month: 'short'
                                })}</span>
                                {payment.splitMode && (
                                  <span className="flex items-center">
                                    {(() => {
                                      const Icon = getSplitModeIcon(payment.splitMode)
                                      return <Icon className="h-3.5 w-3.5 mr-1" />
                                    })()}
                                    <span className="text-xs">
                                      {payment.splitMode === 'items' && t('order.splitModes.itemsPaid')}
                                      {payment.splitMode === 'equal' && t('order.splitModes.equalSplit')}
                                      {payment.splitMode === 'custom' && t('order.splitModes.customAmount')}
                                      {payment.splitMode === 'whole' && t('order.splitModes.wholeBill')}
                                    </span>
                                  </span>
                                )}
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
                                onClick={() => router.push(`/payment/${payment.id.split('-').pop()}`)}
                                className="text-xs text-green-600 hover:text-green-700 font-medium"
                              >
                                {t('order.viewDetails')} →
                              </button>
                            </div>
                          </div>
                        </div>
                        {payment.failureReason && (
                          <p className="mt-2 text-xs text-red-600">{payment.failureReason === 'insufficientBalance' ? t('order.insufficientBalance') : payment.failureReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nog geen betalingen ontvangen</p>
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
                    {order.orderNumber || `2024${order.num.toString().padStart(4, '0')}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tafel</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <BuildingStorefrontIcon className="h-4 w-4 mr-1 text-gray-600" />
                    Tafel {order.num}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('order.tableTime')}</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1 text-gray-600" />
                    {order.duration || '45m'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('order.startTime')}</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-600" />
                    {order.startTime || '19:45'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{t('order.actions')}</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  {t('order.downloadInvoice')}
                </button>
                {remainingAmount === 0 && (
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    Sluit Bestelling
                  </button>
                )}
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
    </Layout>
  )
}