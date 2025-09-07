'use client'

import React, {useState, useEffect, useMemo} from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/restaurant/Layout'
import DateFilterExact from '@/components/restaurant/DateFilterExact'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRecentPayments } from '@/hooks/usePayments'
import { QRCodeSVG } from 'qrcode.react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {exportAnalyticsPDF, getActiveTablesList, getDashboardAnalytics} from '@/lib/api'
import jsPDF from 'jspdf'
import {
    CurrencyEuroIcon,
    UsersIcon,
    ChartBarIcon,
    CreditCardIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarIcon,
    XMarkIcon,
    UserIcon,
    ReceiptPercentIcon,
    BanknotesIcon,
    QrCodeIcon,
    StarIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import {downloadBlob, generateReportFilename} from "@/utils/downloadHelper";


interface MockData {
    revenue: string
    orders: number
    tips: string
    avgPayment: string
    growth: string
    newCustomers: number
    returningCustomers: number
    peakHour: string
    avgTableTime: string
}

interface ChartDataPoint {
    time: string
    omzet: number
    betalingen: number
    fooien: number
}

interface DateRange {
    start: string
    end?: string
}

interface User {
    name?: string
}

interface UserData {
    name: string
    restaurantName: string
}

interface RecentOrder {
    id: string
    table: string
    amount: number
    time: string
    status: string
    method: string
    guests: number
}

interface RecentPayment {
    id: number
    table: number
    amount: number
    tip: number
    fee: number
    status: 'completed' | 'failed'
    time: Date
    method: string
}

interface StatsCardProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    value: string
    change?: string
    subtitle?: string
    onClick?: () => void
    isClickable?: boolean
    isActive?: boolean
}

interface ActiveTableData {
    order_id: number
    table_number: number
    table_link: string
    total_amount: number
    paid_amount: number
    remaining_amount: number
}

interface DashboardAnalyticsResponse {
    summary: {
        revenue: number
        orders: number
        tips: number
        avg_payment: number
        growth: string
        new_customers: number
        returning_customers: number
        peak_hour: string
        avg_table_time: string
    }
    chart_data: Array<{
        time: string
        revenue: number
        payments: number
        tips: number
    }>
}

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, title, value, change, subtitle, onClick, isClickable = false, isActive = false }) => (
    <div
        className={`bg-white rounded-lg sm:rounded-xl border p-2.5 xs:p-3 sm:p-4 md:p-6 transition-all duration-200 ${
            isClickable ? 'cursor-pointer hover:shadow-lg hover:border-green-400' : 'hover:shadow-lg'
        } ${
            isActive ? 'border-green-500 shadow-lg ring-2 ring-green-100' : 'border-gray-200'
        }`}
        onClick={onClick}
    >
        <div className="flex items-center justify-between mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">
            <div className={`p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-green-50' : 'bg-gray-50'
            }`}>
                <Icon className={`h-3.5 xs:h-4 sm:h-5 w-3.5 xs:w-4 sm:w-5 transition-colors duration-200 ${
                    isActive ? 'text-green-600' : 'text-gray-600'
                }`} />
            </div>
            {change && (
                <span className={`hidden xs:flex items-center text-xs sm:text-sm font-medium ${
                    change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
          {change.startsWith('+') ? (
              <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
          ) : (
              <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
          )}
                    <span className="hidden min-[400px]:inline">{change}</span>
        </span>
            )}
        </div>
        <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{value}</p>
        <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 line-clamp-2 leading-tight">{title}</p>
        {subtitle && (
            <p className="text-[10px] xs:text-xs text-gray-400 mt-1 sm:mt-2 truncate hidden min-[400px]:block">{subtitle}</p>
        )}
    </div>
)

const Dashboard: React.FC = () => {
    const { user } = useAuth()
    const router = useRouter()
    const { locale, setLocale, t } = useLanguage()
    const [dateFilter, setDateFilter] = useState<string>('today')
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
    const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null)

    const [allAnalyticsData, setAllAnalyticsData] = useState<DashboardAnalyticsResponse | null>(null)
    const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true)
    const [analyticsError, setAnalyticsError] = useState<string | null>(null)

    const [greeting, setGreeting] = useState<string>('')
    const [userData, setUserData] = useState<UserData | null>(null)
    const [tables, setTables] = useState<ActiveTableData[]>([])
    const [tablesLoading, setTablesLoading] = useState<boolean>(true)
    const [selectedMetric, setSelectedMetric] = useState<'all' | 'revenue' | 'payments' | 'tips'>('all')
    const { payments, loading: paymentsLoading } = useRecentPayments(6)

    useEffect(() => {
        document.title = 'Dashboard - Splitty'
    }, [])

    // Helper function to get date filter label
    const getDateFilterLabel = (): string => {
        if (customDateRange && customDateRange.start) {
            const start = new Date(customDateRange.start)
            const end = new Date(customDateRange.end || customDateRange.start)
            if (start.toDateString() === end.toDateString()) {
                return start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
            }
            return `${start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`
        }

        switch(dateFilter) {
            case 'today': return t('dateFilter.today')
            case 'yesterday': return t('dateFilter.yesterday')
            case 'last7days': return t('dashboard.charts.lastDays')
            case 'thisWeek': return t('time.thisWeek')
            case 'lastWeek': return t('dateFilter.lastWeek')
            case 'thisMonth': return t('time.thisMonth')
            case 'lastMonth': return t('dateFilter.lastMonth')
            case 'thisYear': return t('time.thisYear')
            default: return t('dateFilter.today')
        }
    }

    // useEffect(() => {
    //     // Update data when filter changes
    //     setFilteredData(generateMockData(dateFilter, customDateRange))
    //     setFilteredOrders(generateRecentOrders(dateFilter))
    //     setChartData(generateChartData(dateFilter, customDateRange))
    // }, [dateFilter, customDateRange])

    useEffect(() => {
        const fetchActiveTables = async () => {
            try {
                setTablesLoading(true)
                const activeTablesData = await getActiveTablesList()
                setTables(activeTablesData)
            } catch (error) {
                console.error('Error fetching active tables:', error)
                setTables([])
            } finally {
                setTablesLoading(false)
            }
        }

        fetchActiveTables()
    }, [])

    useEffect(() => {
        // Set greeting based on time of day
        const hour = new Date().getHours()
        if (hour < 12) {
            setGreeting(t('dashboard.greeting.morning'))
        } else if (hour < 18) {
            setGreeting(t('dashboard.greeting.afternoon'))
        } else {
            setGreeting(t('dashboard.greeting.evening'))
        }

        // Simulate loading user data
        if (user) {
            setUserData({
                name: user.name || 'Manager',
                restaurantName: 'Limon Food & Drinks'
            })
        }
    }, [locale, t, user])

    const fetchDashboardData = async () => {
        try {
            setAnalyticsLoading(true)
            setAnalyticsError(null)

            const analyticsData = await getDashboardAnalytics({
                dateFilter,
                customDateRange
            })

            setAllAnalyticsData(analyticsData)

        } catch (error) {
            console.error('Error fetching dashboard analytics:', error)
            setAnalyticsError('Failed to load analytics data')
            setAllAnalyticsData(null)
        } finally {
            setAnalyticsLoading(false)
        }
    }

    const summaryData = useMemo(() => {
        if (!allAnalyticsData) {
            return {
                revenue: '0.00',
                orders: 0,
                tips: '0.00',
                avgPayment: '0.00',
                growth: '0%',
                newCustomers: 0,
                returningCustomers: 0,
                peakHour: '-',
                avgTableTime: '-'
            }
        }

        return {
            revenue: allAnalyticsData.summary.revenue.toFixed(2),
            orders: allAnalyticsData.summary.orders,
            tips: allAnalyticsData.summary.tips.toFixed(2),
            avgPayment: allAnalyticsData.summary.avg_payment.toFixed(2),
            growth: allAnalyticsData.summary.growth,
            newCustomers: allAnalyticsData.summary.new_customers,
            returningCustomers: allAnalyticsData.summary.returning_customers,
            peakHour: allAnalyticsData.summary.peak_hour,
            avgTableTime: allAnalyticsData.summary.avg_table_time
        }
    }, [allAnalyticsData])

    const chartData = useMemo(() => {
        if (!allAnalyticsData) return []

        return allAnalyticsData.chart_data.map(item => ({
            time: item.time,
            omzet: item.revenue,
            betalingen: item.payments,
            fooien: item.tips
        }))
    }, [allAnalyticsData])

// Замените useEffect:
    useEffect(() => {
        fetchDashboardData()
    }, [dateFilter, customDateRange]) // БЕЗ selectedMetric

    const handleTableClick = (table: ActiveTableData): void => {
        router.push(`/restaurant/order/${table.order_id}`)
    }

    const exportToPDF = async (): Promise<void> => {
        // const loadingToast = toast.loading('Generating PDF report...')

        try {
            const blob = await exportAnalyticsPDF({
                dateFilter,
                customDateRange
            })

            const filename = generateReportFilename(dateFilter)
            downloadBlob(blob, filename)

            // toast.dismiss(loadingToast)
            // toast.success('PDF report downloaded successfully!')

        } catch (error) {
            console.error('Export failed:', error)
            // toast.dismiss(loadingToast)
            // toast.error('Failed to generate PDF report. Please try again.')
        }
    }

    const getSplitModeLabel = (mode: string): string => {
        switch(mode) {
            case 'items': return 'Betaal voor items'
            case 'equal': return 'Gelijk verdelen'
            case 'custom': return 'Aangepast bedrag'
            default: return mode
        }
    }

    const getSplitModeIcon = (mode: string): React.ComponentType<{ className?: string }> => {
        switch(mode) {
            case 'items': return ReceiptPercentIcon
            case 'equal': return UsersIcon
            case 'custom': return BanknotesIcon
            default: return CreditCardIcon
        }
    }

    return (
        <Layout>
            <div className="p-3 sm:p-4 md:p-6">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {greeting}, {userData?.name || user?.name}!
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        {t('dashboard.welcome')}
                    </p>
                </div>

                {/* Date Filter and Export Button */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                    <DateFilterExact
                        selectedFilter={dateFilter}
                        onFilterChange={(filter: string, dateRange?: DateRange) => {
                            setDateFilter(filter)
                            setCustomDateRange(dateRange || null)
                        }}
                    />
                    <button
                        onClick={exportToPDF}
                        className="px-3 py-2 sm:px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        {t('dashboard.export.pdf') || 'Export PDF'}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                    <StatsCard
                        icon={CurrencyEuroIcon}
                        title={`${t('dashboard.stats.todayRevenue')} ${getDateFilterLabel()}`}
                        value={`€${parseFloat(summaryData.revenue).toLocaleString('nl-NL')}`}
                        change={summaryData.growth}
                        subtitle={t('dashboard.stats.viaSplitty')}
                        isClickable={true}
                        isActive={selectedMetric === 'revenue'}
                        onClick={() => setSelectedMetric(selectedMetric === 'revenue' ? 'all' : 'revenue')}
                    />
                    <StatsCard
                        icon={CreditCardIcon}
                        title={`${t('dashboard.stats.todayPayments')} ${getDateFilterLabel()}`}
                        value={summaryData.orders.toString()}
                        change={summaryData.growth}
                        subtitle={t('dashboard.stats.viaSplitty')}
                        isClickable={true}
                        isActive={selectedMetric === 'payments'}
                        onClick={() => setSelectedMetric(selectedMetric === 'payments' ? 'all' : 'payments')}
                    />
                    <StatsCard
                        icon={UsersIcon}
                        title={`${t('nav.tips') || 'Fooien'} ${getDateFilterLabel()}`}
                        value={`€${parseFloat(summaryData.tips).toLocaleString('nl-NL')}`}
                        change={summaryData.growth}
                        subtitle={t('dashboard.stats.distributedTeam')}
                        isClickable={true}
                        isActive={selectedMetric === 'tips'}
                        onClick={() => setSelectedMetric(selectedMetric === 'tips' ? 'all' : 'tips')}
                    />
                    <StatsCard
                        icon={StarIcon}
                        title={`${t('dashboard.stats.googleReviews')} ${getDateFilterLabel()}`}
                        value="0"
                        change="+0%"
                        subtitle={`0 ${t('dashboard.stats.averageRating')} - ${t('dashboard.stats.generatedViaSplitty')}`}
                    />
                </div>

                {/* Analytics Chart Section */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg xs:rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg p-2.5 xs:p-3 sm:p-4 md:p-6 overflow-hidden relative">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 xs:w-48 sm:w-64 h-32 xs:h-48 sm:h-64 bg-gradient-to-br from-green-100/20 to-emerald-100/20 rounded-full blur-2xl xs:blur-3xl -mr-16 xs:-mr-24 sm:-mr-32 -mt-16 xs:-mt-24 sm:-mt-32"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        {selectedMetric === 'revenue' ? t('dashboard.charts.revenueOverview') :
                                            selectedMetric === 'payments' ? t('dashboard.charts.paymentsOverview') :
                                                selectedMetric === 'tips' ? t('dashboard.charts.tipsOverview') :
                                                    t('dashboard.charts.revenueOverview')}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                      {(() => {
                          if (customDateRange && customDateRange.start) {
                              const start = new Date(customDateRange.start)
                              const end = new Date(customDateRange.end || customDateRange.start)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)

                              // Check if it's a single day
                              if (start.toDateString() === end.toDateString()) {
                                  if (start.toDateString() === today.toDateString()) {
                                      return t('dateFilter.today')
                                  } else {
                                      const yesterday = new Date(today)
                                      yesterday.setDate(yesterday.getDate() - 1)
                                      if (start.toDateString() === yesterday.toDateString()) {
                                          return t('dateFilter.yesterday')
                                      }
                                      return start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
                                  }
                              }

                              // For date ranges
                              const diffTime = Math.abs(end.getTime() - start.getTime())
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

                              // Check if it's current month
                              if (start.getMonth() === today.getMonth() && start.getFullYear() === today.getFullYear()) {
                                  if (start.getDate() === 1 && end.getDate() === today.getDate()) {
                                      return t('dateFilter.monthToDate')
                                  }
                              }

                              // Check if it's last month
                              const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                              const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
                              if (start.getDate() === lastMonth.getDate() &&
                                  start.getMonth() === lastMonth.getMonth() &&
                                  end.getDate() === lastMonthEnd.getDate() &&
                                  end.getMonth() === lastMonthEnd.getMonth()) {
                                  return t('dateFilter.lastMonth')
                              }

                              // Check week patterns
                              if (diffDays === 7) {
                                  const thisWeekStart = new Date(today)
                                  const dayOfWeek = today.getDay()
                                  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                                  thisWeekStart.setDate(today.getDate() - daysToSubtract)
                                  thisWeekStart.setHours(0, 0, 0, 0)

                                  if (start.getTime() === thisWeekStart.getTime()) {
                                      return t('time.thisWeek')
                                  }

                                  const lastWeekStart = new Date(thisWeekStart)
                                  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
                                  if (start.getTime() === lastWeekStart.getTime()) {
                                      return t('dateFilter.lastWeek')
                                  }
                              }

                              // Default: show date range
                              return `${start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`
                          }

                          // Fallback to predefined filters
                          switch (dateFilter) {
                              case 'today': return t('dateFilter.today')
                              case 'yesterday': return t('dateFilter.yesterday')
                              case 'lastWeek': return t('dateFilter.lastWeek')
                              case 'lastMonth': return t('dateFilter.lastMonth')
                              case 'lastQuarter': return t('dateFilter.lastQuarter')
                              case 'lastYear': return t('dateFilter.lastYear')
                              case 'weekToDate': return t('dateFilter.weekToDate')
                              case 'monthToDate': return t('dateFilter.monthToDate')
                              case 'quarterToDate': return t('dateFilter.quarterToDate')
                              case 'yearToDate': return t('dateFilter.yearToDate')
                              default: return t('dateFilter.today')
                          }
                      })()}
                    </span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedMetric !== 'all' && (
                                        <button
                                            onClick={() => setSelectedMetric('all')}
                                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-xs font-medium"
                                        >
                                            {t('dashboard.quickActions.seeAll')}
                                        </button>
                                    )}
                                    {(selectedMetric === 'all' || selectedMetric === 'revenue') && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"></div>
                                            <span className="text-xs font-medium text-gray-700">{t('dashboard.charts.revenue')}</span>
                                        </div>
                                    )}
                                    {(selectedMetric === 'all' || selectedMetric === 'payments') && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                                            <span className="text-xs font-medium text-gray-700">{t('dashboard.charts.payments')}</span>
                                        </div>
                                    )}
                                    {(selectedMetric === 'all' || selectedMetric === 'tips') && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
                                            <span className="text-xs font-medium text-gray-700">{t('dashboard.charts.tips')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
                                {analyticsLoading ? (
                                    <div className="flex items-center justify-center h-[320px]">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                                        <span className="text-gray-600">Loading analytics...</span>
                                    </div>
                                ) : analyticsError ? (
                                    <div className="flex items-center justify-center h-[320px] bg-red-50 rounded-xl">
                                        <div className="text-center">
                                            <p className="text-red-600 font-medium mb-4">{analyticsError}</p>
                                            <button
                                                onClick={fetchDashboardData}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                ) : chartData && chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={320}>
                                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                            <defs>
                                                <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorBetalingen" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorFooien" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                stroke="#9ca3af"
                                                style={{ fontSize: '11px' }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#9ca3af"
                                                style={{ fontSize: '11px' }}
                                                tickFormatter={(value: number) => `€${value}`}
                                                tickLine={false}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#9ca3af"
                                                style={{ fontSize: '11px' }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    padding: '10px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                                }}
                                                formatter={(value: number, name: string) => {
                                                    const formattedName = name === 'omzet' ? 'Omzet' :
                                                        name === 'betalingen' ? 'Betalingen' :
                                                            'Fooien'
                                                    if (name === 'omzet' || name === 'fooien') {
                                                        return [`€${value}`, formattedName]
                                                    }
                                                    return [value, formattedName]
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                            />
                                            {(selectedMetric === 'all' || selectedMetric === 'revenue') && (
                                                <Line
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="omzet"
                                                    stroke="url(#gradientGreen)"
                                                    strokeWidth={selectedMetric === 'revenue' ? 4 : 3}
                                                    dot={{ fill: '#10b981', r: selectedMetric === 'revenue' ? 4 : 0 }}
                                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                                    fill="url(#colorOmzet)"
                                                    animationDuration={500}
                                                >
                                                    <defs>
                                                        <linearGradient id="gradientGreen" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#34d399" />
                                                            <stop offset="100%" stopColor="#10b981" />
                                                        </linearGradient>
                                                    </defs>
                                                </Line>
                                            )}
                                            {(selectedMetric === 'all' || selectedMetric === 'payments') && (
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="betalingen"
                                                    stroke="url(#gradientBlue)"
                                                    strokeWidth={selectedMetric === 'payments' ? 4 : 3}
                                                    dot={{ fill: '#3b82f6', r: selectedMetric === 'payments' ? 4 : 0 }}
                                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                                    fill="url(#colorBetalingen)"
                                                    animationDuration={500}
                                                >
                                                    <defs>
                                                        <linearGradient id="gradientBlue" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#60a5fa" />
                                                            <stop offset="100%" stopColor="#3b82f6" />
                                                        </linearGradient>
                                                    </defs>
                                                </Line>
                                            )}
                                            {(selectedMetric === 'all' || selectedMetric === 'tips') && (
                                                <Line
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="fooien"
                                                    stroke="url(#gradientPurple)"
                                                    strokeWidth={selectedMetric === 'tips' ? 4 : 3}
                                                    dot={{ fill: '#a855f7', r: selectedMetric === 'tips' ? 4 : 0 }}
                                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                                    fill="url(#colorFooien)"
                                                    animationDuration={500}
                                                >
                                                    <defs>
                                                        <linearGradient id="gradientPurple" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#c084fc" />
                                                            <stop offset="100%" stopColor="#a855f7" />
                                                        </linearGradient>
                                                    </defs>
                                                </Line>
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[320px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <ChartBarIcon className="h-8 w-8 text-gray-500" />
                                            </div>
                                            <p className="text-gray-600 font-medium">No data available</p>
                                            <p className="text-gray-400 text-sm mt-1">Select a different period</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Tables Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('dashboard.activeTables.title')}</h2>
                    <p className="text-sm text-gray-500 mb-4">{t('dashboard.activeTables.clickToView') || 'Klik op een tafel om de besteldetails te bekijken'}</p>

                    {tablesLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                            <span className="text-gray-500">Loading tables...</span>
                        </div>
                    ) : tables.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {tables.map((table) => {
                                const paymentProgress = table.total_amount > 0 ? (table.paid_amount / table.total_amount) * 100 : 0
                                return (
                                    <div
                                        key={table.table_number}
                                        onClick={() => handleTableClick(table)}
                                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden relative"
                                    >
                                        {/* Status indicator line */}
                                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                                            paymentProgress === 100 ? 'from-green-400 to-emerald-500' :
                                                paymentProgress > 50 ? 'from-yellow-400 to-orange-500' :
                                                    'from-blue-400 to-indigo-500'
                                        }`} />

                                        <div className="p-4">
                                            {/* Header - Cleaner design */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="text-sm sm:text-base font-bold text-gray-900">T{table.table_number}</h4>
                                                </div>
                                                {/* QR Code - Smaller and positioned top-right */}

                                            <a
                                                href={table.table_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-400 transition-all duration-200 group-hover:scale-105"
                                                title={`Open Splitty voor Tafel ${table.table_number}`}
                                                >
                                                <QRCodeSVG
                                                    value={table.table_link}
                                                    size={32}
                                                    level="M"
                                                    includeMargin={false}
                                                    fgColor="#059669"
                                                    bgColor="transparent"
                                                />
                                            </a>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-3">
                                            {/* Amount display - Cleaner layout */}
                                            <div className="bg-white rounded-lg p-2 border border-gray-100">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-xs text-gray-500">{t('dashboard.activeTables.total')}</span>
                                                    <span className="text-sm font-bold text-gray-900">€{table.total_amount.toFixed(2)}</span>
                                                </div>
                                                {table.paid_amount > 0 && (
                                                    <div className="flex justify-between items-baseline mt-1">
                                                        <span className="text-xs text-gray-500">{t('dashboard.activeTables.paid')}</span>
                                                        <span className="text-sm font-semibold text-green-600">€{table.paid_amount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-baseline mt-0.5 xs:mt-1 pt-0.5 xs:pt-1 border-t border-gray-100">
                                                    <span className="text-[10px] xs:text-xs font-medium text-gray-600">{t('dashboard.activeTables.outstanding')}</span>
                                                    <span className="text-xs xs:text-sm font-bold text-orange-600">€{table.remaining_amount.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {/* Progress indicator - Minimalist */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                                                paymentProgress === 100 ? 'from-green-400 to-emerald-500' :
                                                                    paymentProgress > 50 ? 'from-yellow-400 to-orange-500' :
                                                                        'from-blue-400 to-indigo-500'
                                                            }`}
                                                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="ml-2 text-xs font-medium text-gray-600">
                                        {Math.round(paymentProgress)}%
                                    </span>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            )
                            })}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <p className="text-gray-500">{t('dashboard.recentPayments.title')}</p>
                            <p className="text-sm text-gray-400 mt-1">{t("dashboardEmptyTablesText")}</p>
                        </div>
                    )}
                </div>


                {/* Recent Splitty Payments */}
                <div className="bg-white rounded-lg xs:rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900">{t('dashboard.recentPayments.title')}</h2>
                            <button
                                onClick={() => router.push('/restaurant/payment-history')}
                                className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium hidden xs:block"
                            >
                                {t('dashboard.recentPayments.viewAll')} →
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.recentPayments.id')}</th>
                                <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider hidden min-[400px]:table-cell">{t('dashboard.recentPayments.table')}</th>
                                <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.recentPayments.amount')}</th>
                                <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.recentPayments.status')}</th>
                                <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('dashboard.recentPayments.time')}</th>
                                <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('dashboard.recentPayments.actions')}</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {paymentsLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                            Loading payments...
                                        </div>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No recent payments found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 whitespace-nowrap text-[11px] xs:text-xs sm:text-sm font-medium text-gray-900">
                                            <span className="hidden xs:inline">#</span>{payment.id}
                                        </td>
                                        <td className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 whitespace-nowrap text-[11px] xs:text-xs sm:text-sm text-gray-500 hidden min-[400px]:table-cell">
                                            {payment.tableNumber}
                                        </td>
                                        <td className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 whitespace-nowrap">
                                            <div>
                                                <p className="text-[11px] xs:text-xs sm:text-sm font-medium text-gray-900">€{payment.amount.toFixed(2)}</p>
                                                {payment.tip > 0 && (
                                                    <p className="text-[10px] xs:text-xs text-gray-500 hidden xs:block">{t('dashboard.recentPayments.tip')}: €{payment.tip.toFixed(2)}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-1 sm:mr-1.5 hidden sm:inline-block ${
                                    payment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                <span className="hidden sm:inline">{payment.status === 'completed' ? t('dashboard.recentPayments.paid') : t('dashboard.recentPayments.failed')}</span>
                                <span className="sm:hidden">{payment.status === 'completed' ? '✓' : '✕'}</span>
                            </span>
                                        </td>
                                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 whitespace-nowrap text-xs text-gray-500 hidden sm:table-cell" suppressHydrationWarning>
                                            {typeof window !== 'undefined' ? new Date(payment.timestamp).toLocaleDateString('nl-NL', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '-'}
                                        </td>
                                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 whitespace-nowrap text-sm hidden md:table-cell">
                                            <div className="flex gap-1.5 items-center">
                                                <button
                                                    onClick={() => router.push(`/restaurant/order/${payment.orderNumber}`)}
                                                    className="font-medium text-xs text-green-600 hover:text-green-700"
                                                >
                                                    {t('dashboard.recentPayments.order')}
                                                </button>
                                                <span className="text-gray-300 text-xs">|</span>
                                                <button
                                                    onClick={() => router.push(`/restaurant/payment/${payment.id}`)}
                                                    className="font-medium text-xs text-green-600 hover:text-green-700"
                                                >
                                                    {t('dashboard.recentPayments.payment')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table Detail Modal - Removed, now using dedicated page */}
                {false && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <h2 className="text-xl font-bold text-gray-900">Tafel {/* selectedTable.num */}</h2>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                    {/* selectedTable.status */}
                  </span>
                                    <span className="flex items-center space-x-1 text-sm text-gray-600">
                    <QrCodeIcon className="h-4 w-4" />
                    <span>QR Gescand</span>
                  </span>
                                </div>
                                <button
                                    onClick={() => {/* setShowTableModal(false) */}}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {/* Additional modal content would go here */}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    )
}

export default Dashboard