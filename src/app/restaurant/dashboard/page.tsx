'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/restaurant/Layout'
import DateFilterExact from '@/components/restaurant/DateFilterExact'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRecentPayments } from '@/hooks/usePayments'
import { QRCodeSVG } from 'qrcode.react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

// Type definitions
interface PaymentDetail {
    id: string
    guestName: string
    amount: number
    method: string
    status: 'completed' | 'failed'
    time: Date
    items: string[]
    failureReason?: string
}

interface OrderItem {
    name: string
    price: number
    paid: boolean
}

interface GuestOrder {
    guest: string
    items: OrderItem[]
}

interface CustomPayment {
    guest: string
    amount: number
    paid: boolean
}

interface SimpleOrder {
    name: string
    price: number
}

interface TableData {
    num: number
    guests: number
    status: 'Bezet' | 'Vrij' | 'Wacht'
    amount?: number
    paid?: number
    duration?: string
    splitMode?: 'items' | 'equal' | 'custom'
    startTime?: string
    waiter?: string
    section?: string
    createdAt?: Date
    orderNumber?: string
    payments?: PaymentDetail[]
    orders?: GuestOrder[] | SimpleOrder[]
    sharedItems?: OrderItem[]
    customPayments?: CustomPayment[]
    paidGuests?: number
    lastOrder?: number
    freed?: string
    total?: number
}

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

interface Review {
    id: number
    author: string
    rating: number
    date: Date
    text: string
    url: string
    verified: boolean
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

// Comprehensive table data with detailed orders
const generateTableData = (): TableData[] => {
    return [
        {
            num: 5,
            guests: 4,
            status: 'Bezet',
            amount: 103.50,
            paid: 46.00,
            duration: '45m',
            splitMode: 'items', // Pay for own items
            startTime: '19:45',
            waiter: 'Emma',
            section: 'Hoofdzaal',
            createdAt: new Date(Date.now() - 45 * 60 * 1000),
            orderNumber: '20240005',
            payments: [
                {
                    id: 'SPL-2024-0005-001',
                    guestName: 'Gast 1',
                    amount: 22.00,
                    method: 'Splitty',
                    status: 'completed',
                    time: new Date(Date.now() - 35 * 60 * 1000),
                    items: ['Burger Deluxe', 'Cola']
                },
                {
                    id: 'SPL-2024-0005-002',
                    guestName: 'Gast 2',
                    amount: 14.50,
                    method: 'Splitty',
                    status: 'failed',
                    time: new Date(Date.now() - 28 * 60 * 1000),
                    items: ['Caesar Salad'],
                    failureReason: 'Onvoldoende saldo'
                },
                {
                    id: 'SPL-2024-0005-003',
                    guestName: 'Gast 2',
                    amount: 14.50,
                    method: 'Splitty',
                    status: 'completed',
                    time: new Date(Date.now() - 25 * 60 * 1000),
                    items: ['Caesar Salad']
                },
                {
                    id: 'SPL-2024-0005-004',
                    guestName: 'Gast 3',
                    amount: 9.50,
                    method: 'Splitty',
                    status: 'completed',
                    time: new Date(Date.now() - 10 * 60 * 1000),
                    items: ['Spa Rood', 'Bier']
                }
            ],
            orders: [
                { guest: 'Gast 1', items: [
                        { name: 'Burger Deluxe', price: 18.50, paid: true },
                        { name: 'Cola', price: 3.50, paid: true }
                    ]},
                { guest: 'Gast 2', items: [
                        { name: 'Caesar Salad', price: 14.50, paid: true },
                        { name: 'Witte Wijn', price: 6.50, paid: false }
                    ]},
                { guest: 'Gast 3', items: [
                        { name: 'Pizza Margherita', price: 16.50, paid: false },
                        { name: 'Bier', price: 4.50, paid: false }
                    ]},
                { guest: 'Gast 4', items: [
                        { name: 'Pasta Carbonara', price: 15.50, paid: false },
                        { name: 'Spa Rood', price: 3.00, paid: true }
                    ]}
            ] as GuestOrder[],
            sharedItems: [
                { name: 'Broodplank', price: 8.50, paid: false },
                { name: 'Nachos', price: 12.50, paid: false }
            ]
        }
    ]
}

// Mock data generators based on date filter
const generateMockData = (filter: string, customDateRange: DateRange | null = null): MockData => {
    // Splitty launched on Friday, August 1st, 2025
    const launchDate = new Date(2025, 7, 1) // August 1, 2025 (Friday)
    const today = new Date() // Current date

    // Daily revenue data (varied by day of week)
    const dailyData: Record<string, { revenue: number; orders: number; tips: number }> = {
        // Friday Aug 1 - Launch day (lower due to first day)
        '2025-08-01': { revenue: 1850.40, orders: 32, tips: 145.20 },
        // Saturday Aug 2 - CLOSED
        '2025-08-02': { revenue: 0, orders: 0, tips: 0 },
        // Sunday Aug 3 - CLOSED
        '2025-08-03': { revenue: 0, orders: 0, tips: 0 },
        // Monday Aug 4
        '2025-08-04': { revenue: 2234.60, orders: 41, tips: 178.30 },
        // Tuesday Aug 5
        '2025-08-05': { revenue: 2567.80, orders: 48, tips: 195.40 },
        // Wednesday Aug 6
        '2025-08-06': { revenue: 2812.30, orders: 52, tips: 210.50 },
        // Thursday Aug 7
        '2025-08-07': { revenue: 2945.70, orders: 54, tips: 225.80 },
        // Friday Aug 8
        '2025-08-08': { revenue: 3156.40, orders: 58, tips: 248.90 },
        // Saturday Aug 9 - CLOSED
        '2025-08-09': { revenue: 0, orders: 0, tips: 0 },
        // Sunday Aug 10 - CLOSED
        '2025-08-10': { revenue: 0, orders: 0, tips: 0 },
        // Monday Aug 11
        '2025-08-11': { revenue: 2423.50, orders: 44, tips: 187.60 },
        // Tuesday Aug 12
        '2025-08-12': { revenue: 2678.90, orders: 49, tips: 198.70 },
        // Wednesday Aug 13
        '2025-08-13': { revenue: 2891.20, orders: 53, tips: 215.40 },
        // Thursday Aug 14
        '2025-08-14': { revenue: 3012.80, orders: 55, tips: 232.10 },
        // Friday Aug 15 (today)
        '2025-08-15': { revenue: 3287.60, orders: 61, tips: 256.30 },
    }

    // Helper function to check if date is weekend
    const isWeekend = (date: Date): boolean => {
        const day = date.getDay()
        return day === 0 || day === 6 // Sunday = 0, Saturday = 6
    }

    // Helper function to get date string
    const getDateString = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Calculate data based on filter
    let revenue = 0
    let orders = 0
    let tips = 0
    let daysWithData = 0

    // Handle custom date range
    if (customDateRange && customDateRange.start && customDateRange.end) {
        const startDate = new Date(customDateRange.start)
        const endDate = new Date(customDateRange.end)

        // Check if range is before launch
        if (endDate < launchDate) {
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

        // Calculate for custom range
        for (let d = new Date(Math.max(startDate.getTime(), launchDate.getTime())); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = getDateString(d)
            if (dailyData[dateStr]) {
                revenue += dailyData[dateStr].revenue
                orders += dailyData[dateStr].orders
                tips += dailyData[dateStr].tips
                if (dailyData[dateStr].revenue > 0) daysWithData++
            }
        }
    } else {
        // Handle predefined filters
        const todayStr = '2025-08-15' // Current day in our mock
        const yesterdayStr = '2025-08-14'

        switch(filter) {
            case 'today':
                const todayData = dailyData[todayStr] || { revenue: 0, orders: 0, tips: 0 }
                revenue = todayData.revenue
                orders = todayData.orders
                tips = todayData.tips
                break

            case 'yesterday':
                const yesterdayData = dailyData[yesterdayStr] || { revenue: 0, orders: 0, tips: 0 }
                revenue = yesterdayData.revenue
                orders = yesterdayData.orders
                tips = yesterdayData.tips
                break

            case 'last7days':
                // Last 7 days including today
                for (let i = 0; i < 7; i++) {
                    const date = new Date(2025, 7, 15 - i)
                    const dateStr = getDateString(date)
                    if (dailyData[dateStr]) {
                        revenue += dailyData[dateStr].revenue
                        orders += dailyData[dateStr].orders
                        tips += dailyData[dateStr].tips
                        if (dailyData[dateStr].revenue > 0) daysWithData++
                    }
                }
                break

            case 'thisMonth':
                // All of August so far
                Object.values(dailyData).forEach(day => {
                    revenue += day.revenue
                    orders += day.orders
                    tips += day.tips
                    if (day.revenue > 0) daysWithData++
                })
                break

            default:
                // Default to today
                const defaultData = dailyData[todayStr] || { revenue: 0, orders: 0, tips: 0 }
                revenue = defaultData.revenue
                orders = defaultData.orders
                tips = defaultData.tips
        }
    }

    // Calculate growth (comparing to previous period)
    let growth = '0%'
    if (filter === 'today' && dailyData['2025-08-14']) {
        const yesterdayRev = dailyData['2025-08-14'].revenue
        if (yesterdayRev > 0) {
            const change = ((revenue - yesterdayRev) / yesterdayRev * 100).toFixed(1)
            growth = change >= '0' ? `+${change}%` : `${change}%`
        }
    } else if (daysWithData > 1) {
        growth = '+12.5%' // Mock growth for other periods
    }

    return {
        revenue: revenue.toFixed(2),
        orders: orders,
        tips: tips.toFixed(2),
        avgPayment: orders > 0 ? (revenue / orders).toFixed(2) : '0.00',
        growth: growth,
        newCustomers: Math.floor(orders * 0.3),
        returningCustomers: Math.floor(orders * 0.7),
        peakHour: orders > 0 ? '19:00 - 20:00' : '-',
        avgTableTime: orders > 0 ? '1u 25m' : '-'
    }
}

// Generate chart data based on date filter
const generateChartData = (filter: string, customDateRange: DateRange | null = null): ChartDataPoint[] => {
    const launchDate = new Date(2025, 7, 1) // August 1, 2025

    // Hourly patterns for a typical day (when open)
    const hourlyPattern: Record<string, { factor: number }> = {
        '11:00': { factor: 0.3 },  // Lunch start
        '12:00': { factor: 0.8 },  // Lunch peak
        '13:00': { factor: 0.9 },  // Lunch peak
        '14:00': { factor: 0.6 },  // After lunch
        '15:00': { factor: 0.3 },  // Afternoon slow
        '16:00': { factor: 0.3 },  // Afternoon
        '17:00': { factor: 0.5 },  // Early dinner
        '18:00': { factor: 0.7 },  // Dinner start
        '19:00': { factor: 1.0 },  // Dinner peak
        '20:00': { factor: 0.95 }, // Dinner peak
        '21:00': { factor: 0.6 },  // Late dinner
        '22:00': { factor: 0.3 }   // Closing
    }

    // Check if custom date range is before launch
    if (customDateRange && customDateRange.end && new Date(customDateRange.end) < launchDate) {
        return [] // No data before launch
    }

    if (filter === 'today') {
        // Today is Friday Aug 15 - Show hourly data
        const todayRevenue = 3287.60
        const todayOrders = 61
        const todayTips = 256.30

        return Object.entries(hourlyPattern).map(([time, { factor }]) => ({
            time,
            omzet: Math.round(todayRevenue * factor / 6), // Divide by 6 for hourly average
            betalingen: Math.round(todayOrders * factor / 6),
            fooien: Math.round(todayTips * factor / 6)
        }))
    } else if (filter === 'yesterday') {
        // Yesterday was Thursday Aug 14 - Show hourly data
        const yesterdayRevenue = 3012.80
        const yesterdayOrders = 55
        const yesterdayTips = 232.10

        return Object.entries(hourlyPattern).map(([time, { factor }]) => ({
            time,
            omzet: Math.round(yesterdayRevenue * factor / 6),
            betalingen: Math.round(yesterdayOrders * factor / 6),
            fooien: Math.round(yesterdayTips * factor / 6)
        }))
    } else if (filter === 'last7days') {
        // Last 7 days - Aug 9-15
        // Note: t function would need to be passed as parameter in real implementation
        const weekDaysShort = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
        return [
            { time: `${weekDaysShort[6]} 9`, omzet: 0, betalingen: 0, fooien: 0 }, // Saturday - CLOSED
            { time: `${weekDaysShort[0]} 10`, omzet: 0, betalingen: 0, fooien: 0 }, // Sunday - CLOSED
            { time: `${weekDaysShort[1]} 11`, omzet: 2423.50, betalingen: 44, fooien: 187.60 },
            { time: `${weekDaysShort[2]} 12`, omzet: 2678.90, betalingen: 49, fooien: 198.70 },
            { time: `${weekDaysShort[3]} 13`, omzet: 2891.20, betalingen: 53, fooien: 215.40 },
            { time: `${weekDaysShort[4]} 14`, omzet: 3012.80, betalingen: 55, fooien: 232.10 },
            { time: `${weekDaysShort[5]} 15`, omzet: 3287.60, betalingen: 61, fooien: 256.30 }
        ]
    } else if (filter === 'thisMonth' || filter === 'lastMonth') {
        // All of August (by week)
        return [
            { time: 'Week 1', omzet: 4085.00, betalingen: 80, fooien: 323.50 }, // Aug 1-3 (Fri + weekend closed)
            { time: 'Week 2', omzet: 13702.40, betalingen: 252, fooien: 1058.90 }, // Aug 4-10 (5 days open)
            { time: 'Week 3', omzet: 14294.00, betalingen: 262, fooien: 1090.10 }, // Aug 11-15 (5 days open)
        ]
    } else if (customDateRange) {
        // Custom date range - aggregate by day
        const startDate = new Date(Math.max(new Date(customDateRange.start).getTime(), launchDate.getTime()))
        const endDate = new Date(customDateRange.end || customDateRange.start)
        const data: ChartDataPoint[] = []

        const dailyValues: Record<string, { omzet: number; betalingen: number; fooien: number }> = {
            '2025-08-01': { omzet: 1850.40, betalingen: 32, fooien: 145.20 },
            '2025-08-02': { omzet: 0, betalingen: 0, fooien: 0 },
            '2025-08-03': { omzet: 0, betalingen: 0, fooien: 0 },
            '2025-08-04': { omzet: 2234.60, betalingen: 41, fooien: 178.30 },
            '2025-08-05': { omzet: 2567.80, betalingen: 48, fooien: 195.40 },
            '2025-08-06': { omzet: 2812.30, betalingen: 52, fooien: 210.50 },
            '2025-08-07': { omzet: 2945.70, betalingen: 54, fooien: 225.80 },
            '2025-08-08': { omzet: 3156.40, betalingen: 58, fooien: 248.90 },
            '2025-08-09': { omzet: 0, betalingen: 0, fooien: 0 },
            '2025-08-10': { omzet: 0, betalingen: 0, fooien: 0 },
            '2025-08-11': { omzet: 2423.50, betalingen: 44, fooien: 187.60 },
            '2025-08-12': { omzet: 2678.90, betalingen: 49, fooien: 198.70 },
            '2025-08-13': { omzet: 2891.20, betalingen: 53, fooien: 215.40 },
            '2025-08-14': { omzet: 3012.80, betalingen: 55, fooien: 232.10 },
            '2025-08-15': { omzet: 3287.60, betalingen: 61, fooien: 256.30 }
        }

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const dayData = dailyValues[dateStr] || { omzet: 0, betalingen: 0, fooien: 0 }
            const weekDaysShort = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
            const dayName = weekDaysShort[d.getDay()]

            data.push({
                time: `${dayName} ${d.getDate()}`,
                ...dayData
            })
        }

        return data
    } else {
        // Default - show last 7 days
        return generateChartData('last7days')
    }
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
    const [filteredData, setFilteredData] = useState<MockData>(generateMockData('today'))
    // const [filteredOrders, setFilteredOrders] = useState<RecentOrder[]>(generateRecentOrders('today'))
    const [chartData, setChartData] = useState<ChartDataPoint[]>(generateChartData('today'))
    const [greeting, setGreeting] = useState<string>('')
    const [userData, setUserData] = useState<UserData | null>(null)
    const [tables, setTables] = useState<TableData[]>([])
    const [selectedMetric, setSelectedMetric] = useState<'all' | 'revenue' | 'payments' | 'tips' | 'reviews'>('all')
    const { payments, loading: paymentsLoading } = useRecentPayments(6)

    // Mock reviews data
    const mockReviews: Review[] = [
        {
            id: 1,
            author: 'Jan de Vries',
            rating: 5,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            text: 'Fantastisch eten en super snelle betaling via Splitty! Echt een aanrader.',
            url: 'https://g.page/r/CZtzRJhn9YkEBAg/review',
            verified: true
        },
        {
            id: 2,
            author: 'Maria Jansen',
            rating: 5,
            date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            text: 'Geweldige service! Het splitsen van de rekening was nog nooit zo makkelijk.',
            url: 'https://g.page/r/CZtzRJhn9YkEBAg/review',
            verified: true
        },
        {
            id: 3,
            author: 'Peter Bakker',
            rating: 4,
            date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            text: 'Lekker gegeten, handig betaalsysteem. Komt zeker terug!',
            url: 'https://g.page/r/CZtzRJhn9YkEBAg/review',
            verified: true
        },
        {
            id: 4,
            author: 'Sophie van Dijk',
            rating: 5,
            date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            text: 'Perfect! Eindelijk een restaurant waar je makkelijk de rekening kunt splitten.',
            url: 'https://g.page/r/CZtzRJhn9YkEBAg/review',
            verified: true
        },
        {
            id: 5,
            author: 'Tom Hendriks',
            rating: 5,
            date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            text: 'Top ervaring! De QR-code betaling werkt perfect.',
            url: 'https://g.page/r/CZtzRJhn9YkEBAg/review',
            verified: true
        },
        {
            id: 6,
            author: 'Lisa Smit',
            rating: 4,
            date: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
            text: 'Heel fijn dat je zo makkelijk apart kunt betalen. Eten was ook heerlijk!',
            url: 'https://g.page/r/CZtzRJhn9YkEBAg/review',
            verified: true
        },
        {
            id: 7,
            author: 'Mark Visser',
            rating: 5,
            date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            text: 'Innovatief betaalsysteem en uitstekende keuken. Aanrader!',
            url: 'https://g.page/r/CZtzRJhn9YkEBAg/review',
            verified: true
        }
    ]

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
        // Always use fresh table data with correct amounts
        const newTables = generateTableData()
        setTables(newTables)
        if (typeof window !== 'undefined') {
            localStorage.setItem('restaurant_tables', JSON.stringify(newTables))
        }
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

    const handleTableClick = (table: TableData): void => {
        if (table.status !== 'Vrij') {
            router.push(`/restaurant/order/${table.num}`)
        }
    }

    // Export to PDF function
    const exportToPDF = (): void => {
        const doc = new jsPDF()
        const pageHeight = doc.internal.pageSize.height
        const pageWidth = doc.internal.pageSize.width

        // Generate mock transaction data based on filter
        const generateTransactions = () => {
            const transactions: Array<{
                id: string
                amount: number
                tip: number
                time: string
                date: string
            }> = []
            const baseTime = new Date()
            const numTransactions = parseInt(filteredData.orders.toString()) || 50

            for (let i = 0; i < numTransactions; i++) {
                const hours = Math.floor(Math.random() * 12) + 10 // Between 10:00 and 22:00
                const minutes = Math.floor(Math.random() * 60)
                const amount = Math.floor(Math.random() * 80) + 20 // Between €20 and €100
                const tipPercent = Math.random() * 0.15 // Up to 15% tip
                const tip = Math.round(amount * tipPercent * 100) / 100

                transactions.push({
                    id: `SPL-2024-${String(i + 1).padStart(4, '0')}`,
                    amount: amount,
                    tip: tip,
                    time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
                    date: baseTime.toLocaleDateString('nl-NL')
                })
            }

            return transactions.sort((a, b) => b.time.localeCompare(a.time))
        }

        const transactions = generateTransactions()

        // PAGE 1: SUMMARY
        let yPosition = 40

        // Add logo/header area
        doc.setFillColor(34, 197, 94) // Green color
        doc.rect(0, 0, pageWidth, 30, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont(undefined, 'bold')
        doc.text('Splitty Payment Report', pageWidth / 2, 20, { align: 'center' })

        // Reset text color
        doc.setTextColor(0, 0, 0)

        // Restaurant info
        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text(userData?.restaurantName || 'Restaurant', pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 8

        doc.setFontSize(11)
        doc.setFont(undefined, 'normal')
        doc.text(`Report Period: ${getDateFilterLabel()}`, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 6
        doc.text(`Generated: ${new Date().toLocaleString('nl-NL')}`, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 20

        // Summary boxes
        const boxWidth = 80
        const boxHeight = 50
        const boxStartX = (pageWidth - (2 * boxWidth + 20)) / 2

        // Box 1: Total Revenue
        doc.setFillColor(240, 253, 244)
        doc.rect(boxStartX, yPosition, boxWidth, boxHeight, 'F')
        doc.setDrawColor(34, 197, 94)
        doc.setLineWidth(1)
        doc.rect(boxStartX, yPosition, boxWidth, boxHeight, 'S')

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Amount Paid via Splitty', boxStartX + boxWidth/2, yPosition + 10, { align: 'center' })
        doc.setFontSize(20)
        doc.setFont(undefined, 'bold')
        doc.text(`€${parseFloat(filteredData.revenue).toLocaleString('nl-NL')}`, boxStartX + boxWidth/2, yPosition + 30, { align: 'center' })

        // Box 2: Total Splits
        doc.setFillColor(240, 253, 244)
        doc.rect(boxStartX + boxWidth + 20, yPosition, boxWidth, boxHeight, 'F')
        doc.setDrawColor(34, 197, 94)
        doc.rect(boxStartX + boxWidth + 20, yPosition, boxWidth, boxHeight, 'S')

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Total Splits', boxStartX + boxWidth + 20 + boxWidth/2, yPosition + 10, { align: 'center' })
        doc.setFontSize(20)
        doc.setFont(undefined, 'bold')
        doc.text(filteredData.orders.toString(), boxStartX + boxWidth + 20 + boxWidth/2, yPosition + 30, { align: 'center' })

        yPosition += boxHeight + 20

        // Box 3: Tips
        doc.setFillColor(240, 253, 244)
        doc.rect(boxStartX, yPosition, boxWidth, boxHeight, 'F')
        doc.setDrawColor(34, 197, 94)
        doc.rect(boxStartX, yPosition, boxWidth, boxHeight, 'S')

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Tip Amount', boxStartX + boxWidth/2, yPosition + 10, { align: 'center' })
        doc.setFontSize(20)
        doc.setFont(undefined, 'bold')
        doc.text(`€${parseFloat(filteredData.tips).toLocaleString('nl-NL')}`, boxStartX + boxWidth/2, yPosition + 30, { align: 'center' })

        // Box 4: Reviews
        doc.setFillColor(240, 253, 244)
        doc.rect(boxStartX + boxWidth + 20, yPosition, boxWidth, boxHeight, 'F')
        doc.setDrawColor(34, 197, 94)
        doc.rect(boxStartX + boxWidth + 20, yPosition, boxWidth, boxHeight, 'S')

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Google Reviews', boxStartX + boxWidth + 20 + boxWidth/2, yPosition + 10, { align: 'center' })
        doc.setFontSize(20)
        doc.setFont(undefined, 'bold')
        doc.text('47', boxStartX + boxWidth + 20 + boxWidth/2, yPosition + 25, { align: 'center' })
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('★★★★★ 4.8', boxStartX + boxWidth + 20 + boxWidth/2, yPosition + 35, { align: 'center' })

        yPosition += boxHeight + 30

        // Summary text
        doc.setFontSize(11)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text('This report contains all Splitty payment transactions for the selected period.', pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 6
        doc.text('Detailed transaction list follows on the next page.', pageWidth / 2, yPosition, { align: 'center' })

        // Footer for page 1
        doc.setFontSize(8)
        doc.setFont(undefined, 'italic')
        doc.setTextColor(150, 150, 150)
        doc.text('Powered by Splitty - Smart Payment Solutions', pageWidth / 2, pageHeight - 10, { align: 'center' })

        // PAGE 2+: TRANSACTION LIST
        doc.addPage()
        yPosition = 20

        // Header for transaction pages
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.setFont(undefined, 'bold')
        doc.text('Transaction Details', pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text(`Period: ${getDateFilterLabel()}`, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 15

        // Table header
        doc.setFillColor(245, 245, 245)
        doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F')

        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('Payment ID', 20, yPosition)
        doc.text('Amount', 70, yPosition)
        doc.text('Tip', 105, yPosition)
        doc.text('Time', 130, yPosition)
        doc.text('Date', 160, yPosition)
        yPosition += 10

        // Add line under header
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.line(15, yPosition - 3, pageWidth - 15, yPosition - 3)

        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)

        // Add transactions
        transactions.forEach((transaction, index) => {
            if (yPosition > pageHeight - 20) {
                // Add footer before new page
                doc.setFontSize(8)
                doc.setFont(undefined, 'italic')
                doc.setTextColor(150, 150, 150)
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

                doc.addPage()
                yPosition = 20

                // Repeat header on new page
                doc.setTextColor(0, 0, 0)
                doc.setFillColor(245, 245, 245)
                doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F')

                doc.setFontSize(10)
                doc.setFont(undefined, 'bold')
                doc.text('Payment ID', 20, yPosition)
                doc.text('Amount', 70, yPosition)
                doc.text('Tip', 105, yPosition)
                doc.text('Time', 130, yPosition)
                doc.text('Date', 160, yPosition)
                yPosition += 10

                doc.setDrawColor(200, 200, 200)
                doc.setLineWidth(0.5)
                doc.line(15, yPosition - 3, pageWidth - 15, yPosition - 3)

                doc.setFont(undefined, 'normal')
                doc.setFontSize(9)
            }

            // Alternate row background
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250)
                doc.rect(15, yPosition - 4, pageWidth - 30, 7, 'F')
            }

            doc.setTextColor(0, 0, 0)
            doc.text(transaction.id, 20, yPosition)
            doc.text(`€${transaction.amount.toFixed(2)}`, 70, yPosition)
            doc.text(`€${transaction.tip.toFixed(2)}`, 105, yPosition)
            doc.text(transaction.time, 130, yPosition)
            doc.text(transaction.date, 160, yPosition)
            yPosition += 7
        })

        // Final footer
        doc.setFontSize(8)
        doc.setFont(undefined, 'italic')
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${doc.internal.getNumberOfPages()} - Total transactions: ${transactions.length}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

        // Save the PDF
        const fileName = `splitty-report-${dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
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

    const recentPayments: RecentPayment[] = [
        { id: 1078, table: 5, amount: 46.00, tip: 3.50, fee: 0.70, status: 'paid', time: new Date(Date.now() - 10 * 60 * 1000), method: 'iDEAL' },
        { id: 1077, table: 12, amount: 89.50, tip: 4.50, fee: 0.70, status: 'paid', time: new Date(Date.now() - 25 * 60 * 1000), method: 'Apple Pay' },
        { id: 1076, table: 3, amount: 34.75, tip: 2.25, fee: 0.70, status: 'paid', time: new Date(Date.now() - 45 * 60 * 1000), method: 'Credit Card' },
        { id: 1075, table: 9, amount: 156.20, tip: 11.20, fee: 0.70, status: 'paid', time: new Date(Date.now() - 60 * 60 * 1000), method: 'iDEAL' },
        { id: 1074, table: 1, amount: 22.50, tip: 0, fee: 0.70, status: 'failed', time: new Date(Date.now() - 75 * 60 * 1000), method: 'Credit Card' },
        { id: 1073, table: 15, amount: 78.90, tip: 5.90, fee: 0.70, status: 'paid', time: new Date(Date.now() - 90 * 60 * 1000), method: 'Google Pay' },
    ]

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
                        value={`€${parseFloat(filteredData.revenue).toLocaleString('nl-NL')}`}
                        change={filteredData.growth}
                        subtitle={t('dashboard.stats.viaSplitty')}
                        isClickable={true}
                        isActive={selectedMetric === 'revenue'}
                        onClick={() => setSelectedMetric(selectedMetric === 'revenue' ? 'all' : 'revenue')}
                    />
                    <StatsCard
                        icon={CreditCardIcon}
                        title={`${t('dashboard.stats.todayPayments')} ${getDateFilterLabel()}`}
                        value={filteredData.orders.toString()}
                        change={filteredData.growth}
                        subtitle={`${filteredData.newCustomers} ${t('dashboard.stats.newGuests') || 'nieuwe gasten'}`}
                        isClickable={true}
                        isActive={selectedMetric === 'payments'}
                        onClick={() => setSelectedMetric(selectedMetric === 'payments' ? 'all' : 'payments')}
                    />
                    <StatsCard
                        icon={UsersIcon}
                        title={`${t('nav.tips') || 'Fooien'} ${getDateFilterLabel()}`}
                        value={`€${parseFloat(filteredData.tips).toLocaleString('nl-NL')}`}
                        change={filteredData.growth}
                        subtitle={t('dashboard.stats.distributedTeam')}
                        isClickable={true}
                        isActive={selectedMetric === 'tips'}
                        onClick={() => setSelectedMetric(selectedMetric === 'tips' ? 'all' : 'tips')}
                    />
                    <StatsCard
                        icon={StarIcon}
                        title={`${t('dashboard.stats.googleReviews')} ${getDateFilterLabel()}`}
                        value="47"
                        change="+12%"
                        subtitle={`4.8 ${t('dashboard.stats.averageRating')} - ${t('dashboard.stats.generatedViaSplitty')}`}
                        isClickable={true}
                        isActive={selectedMetric === 'reviews'}
                        onClick={() => setSelectedMetric(selectedMetric === 'reviews' ? 'all' : 'reviews')}
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
                                                    selectedMetric === 'reviews' ? t('dashboard.stats.googleReviews') :
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
                                        {selectedMetric !== 'reviews' && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <span>
                          {(() => {
                              if (customDateRange && customDateRange.start) {
                                  const start = new Date(customDateRange.start)
                                  const end = new Date(customDateRange.end || customDateRange.start)
                                  const diffTime = Math.abs(end.getTime() - start.getTime())
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

                                  if (diffDays === 1) return t('dashboard.charts.perHour')
                                  if (diffDays <= 7) return t('dashboard.charts.perDay')
                                  if (diffDays <= 31) return t('dashboard.charts.perDay')
                                  return t('dashboard.charts.perWeek')
                              }

                              // Fallback for predefined filters
                              if (dateFilter === 'today' || dateFilter === 'yesterday') return t('dashboard.charts.perHour')
                              if (dateFilter === 'lastWeek' || dateFilter === 'weekToDate') return t('dashboard.charts.perDay')
                              if (dateFilter === 'lastMonth' || dateFilter === 'monthToDate') return t('dashboard.charts.perDay')
                              return t('dashboard.charts.perDay')
                          })()}
                        </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedMetric !== 'all' && selectedMetric !== 'reviews' && (
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
                                {selectedMetric === 'reviews' ? (
                                    // Reviews List View
                                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                                        {mockReviews.map((review) => (
                                            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <StarIcon
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">{review.author}</span>
                                                        {review.verified && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                                {t('dashboard.reviews.verified') || 'Verified'}
                              </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                            {review.date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                                                </div>
                                                <p className="text-sm text-gray-700 mb-3">{review.text}</p>
                                                <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {t('dashboard.stats.generatedViaSplitty')}
                          </span>
                                                    <a
                                                        href={review.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                                                    >
                                                        {t('dashboard.reviews.viewOnGoogle') || 'View on Google'}
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
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
                                            <p className="text-gray-600 font-medium">Geen data beschikbaar</p>
                                            <p className="text-gray-400 text-sm mt-1">Selecteer een andere periode</p>
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
                    {tables.filter(table => table.status === 'Bezet' || table.status === 'Wacht').length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {tables.filter(table => table.status === 'Bezet' || table.status === 'Wacht').map((table) => {
                                const paymentProgress = table.status !== 'Vrij' && table.amount && table.paid !== undefined ? (table.paid / table.amount) * 100 : 0
                                return (
                                    <div
                                        key={table.num}
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
                                                    <h4 className="text-sm sm:text-base font-bold text-gray-900">T{table.num}</h4>
                                                    <span className="text-xs text-gray-500 mt-0.5 hidden sm:block">{table.duration}</span>
                                                </div>
                                                {/* QR Code - Smaller and positioned top-right */}
                                                <a
                                                    href={`https://webappsplittyvision.netlify.app/?table=${table.num}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-400 transition-all duration-200 group-hover:scale-105"
                                                    title={`Open Splitty voor Tafel ${table.num}`}
                                                >
                                                    <QRCodeSVG
                                                        value={`https://webappsplittyvision.netlify.app/?table=${table.num}`}
                                                        size={32}
                                                        level="M"
                                                        includeMargin={false}
                                                        fgColor="#059669"
                                                        bgColor="transparent"
                                                    />
                                                </a>
                                            </div>

                                            {/* Content */}
                                            {table.status === 'Vrij' ? (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-gray-500">Beschikbaar</p>
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <p className="text-xs text-gray-400">Vrij {table.freed}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {/* Amount display - Cleaner layout */}
                                                    <div className="bg-white rounded-lg p-2 border border-gray-100">
                                                        <div className="flex justify-between items-baseline">
                                                            <span className="text-xs text-gray-500">{t('dashboard.activeTables.total')}</span>
                                                            <span className="text-sm font-bold text-gray-900">€{table.amount?.toFixed(2)}</span>
                                                        </div>
                                                        {table.paid !== undefined && table.paid > 0 && (
                                                            <div className="flex justify-between items-baseline mt-1">
                                                                <span className="text-xs text-gray-500">{t('dashboard.activeTables.paid')}</span>
                                                                <span className="text-sm font-semibold text-green-600">€{table.paid.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-baseline mt-0.5 xs:mt-1 pt-0.5 xs:pt-1 border-t border-gray-100">
                                                            <span className="text-[10px] xs:text-xs font-medium text-gray-600">{t('dashboard.activeTables.outstanding')}</span>
                                                            <span className="text-xs xs:text-sm font-bold text-orange-600">€{((table.amount || 0) - (table.paid || 0)).toFixed(2)}</span>
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
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <p className="text-gray-500">Geen actieve tafels op dit moment</p>
                            <p className="text-sm text-gray-400 mt-1">Tafels met bestellingen verschijnen hier</p>
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