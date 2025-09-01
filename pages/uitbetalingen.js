import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
  CurrencyEuroIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

// Mock payout data
const mockPayouts = [
  {
    id: 'PAY-2025-001',
    date: '2025-01-15',
    amount: 2345.60,
    status: 'completed',
    period: '8 jan - 14 jan 2025',
    orders: 156,
    tips: 245.60,
    fees: 45.80,
    bankAccount: 'NL91 ABNA 0417164300',
  },
  {
    id: 'PAY-2025-002',
    date: '2025-01-22',
    amount: 2867.90,
    status: 'pending',
    period: '15 jan - 21 jan 2025',
    orders: 189,
    tips: 312.40,
    fees: 52.10,
    bankAccount: 'NL91 ABNA 0417164300',
  },
  {
    id: 'PAY-2024-052',
    date: '2025-01-08',
    amount: 1989.30,
    status: 'completed',
    period: '1 jan - 7 jan 2025',
    orders: 134,
    tips: 198.50,
    fees: 38.20,
    bankAccount: 'NL91 ABNA 0417164300',
  },
  {
    id: 'PAY-2024-051',
    date: '2025-01-01',
    amount: 3456.80,
    status: 'completed',
    period: '25 dec - 31 dec 2024',
    orders: 245,
    tips: 456.80,
    fees: 68.90,
    bankAccount: 'NL91 ABNA 0417164300',
  },
]

const mockTipsDistribution = [
  { name: 'Emma van Dijk', amount: 245.50, percentage: 28 },
  { name: 'Lucas Bakker', amount: 189.00, percentage: 22 },
  { name: 'Sophie de Jong', amount: 312.75, percentage: 36 },
  { name: 'Tom Jansen', amount: 122.75, percentage: 14 },
]

export default function Uitbetalingen() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedPayout, setSelectedPayout] = useState(null)

  // Calculate totals
  const totalPending = mockPayouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalCompleted = mockPayouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalTips = mockPayouts.reduce((sum, p) => sum + p.tips, 0)

  // Filter payouts
  const filteredPayouts = mockPayouts.filter(payout => {
    if (filterStatus === 'all') return true
    return payout.status === filterStatus
  })

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            {t('payouts.paidOut')}
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            {t('payouts.inProgress')}
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            {t('payouts.failed')}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('payouts.title')}</h1>
              <p className="text-gray-600 mt-1">{t('payouts.subtitle')}</p>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {t('payouts.exportCSV')}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <CurrencyEuroIcon className="h-8 w-8 text-green-400" />
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              €{totalPending.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600 mt-1">{t('payouts.nextPayout')}</p>
            <p className="text-xs text-gray-500 mt-2">22 januari 2025</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BanknotesIcon className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              €{totalCompleted.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600 mt-1">{t('payouts.totalPaidOut')}</p>
            <p className="text-xs text-gray-500 mt-2">{t('payouts.thisMonth')}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              €{totalTips.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600 mt-1">{t('payouts.totalTips')}</p>
            <p className="text-xs text-gray-500 mt-2">{t('payouts.distributedOverTeam')}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stripe Connect Payouts Embed - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white text-gray-900 border border-gray-300 shadow-sm">
              <div className="flex flex-col space-y-1.5 border-b border-gray-100 p-4 md:p-6">
                <div className="tracking-tight text-xl md:text-2xl font-bold text-gray-900">
                  {t('payouts.title')}
                </div>
              </div>
              <div className="p-2 md:p-8">
                <div style={{ width: '100%' }}>
                  {/* Stripe Connect Payouts Component Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <BanknotesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('payouts.stripeConnectTitle')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('payouts.stripeConnectDesc')}
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-xs text-gray-500 mb-2">{t('payouts.embedCode')}:</p>
                      <code className="text-xs text-gray-600 block">
                        &lt;stripe-connect-payouts /&gt;
                      </code>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      {t('payouts.productionNote')}
                    </p>
                  </div>
                  {/* 
                    In production, replace the placeholder above with:
                    <stripe-connect-payouts />
                    This will load the Stripe Connect UI for payouts
                  */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Bank Account Info - Clean Design */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('payouts.bankAccount')}</h3>
                <div className="p-2 rounded-lg bg-emerald-50">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('payouts.accountNumber')}</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">NL91 ABNA 0417164300</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('payouts.accountHolder')}</p>
                  <p className="text-sm font-semibold text-gray-900">{user?.restaurantName || 'Demo Restaurant'}</p>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-600">
                      {t('payouts.payoutSchedule')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Details Modal */}
        {selectedPayout && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('payouts.payoutDetails')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedPayout.id}</p>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{t('payouts.period')}</p>
                    <p className="font-medium text-gray-900">{selectedPayout.period}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{t('payouts.status')}</p>
                    <div className="mt-1">{getStatusBadge(selectedPayout.status)}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('payouts.breakdown')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('payouts.revenue')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        €{(selectedPayout.amount - selectedPayout.tips + selectedPayout.fees).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('payouts.tips')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        €{selectedPayout.tips.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('payouts.transactionFees')}</span>
                      <span className="text-sm font-medium text-red-600">
                        -€{selectedPayout.fees.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">{t('payouts.total')}</span>
                        <span className="text-lg font-bold text-gray-900">
                          €{selectedPayout.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('payouts.bankDetails')}</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t('payouts.accountNumber')}</p>
                    <p className="font-mono text-sm text-gray-900 mt-1">{selectedPayout.bankAccount}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedPayout(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {t('payouts.close')}
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm">
                    {t('payouts.downloadPDF')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}