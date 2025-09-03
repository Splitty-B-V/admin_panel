export type TableStatus = 'Bezet' | 'Wacht' | 'Vrij'
export type SplitMode = 'items' | 'equal' | 'custom'
export type PaymentStatus = 'completed' | 'failed' | 'pending'
export type PaymentMethod = 'Splitty' | 'iDEAL' | 'Apple Pay' | 'Credit Card' | 'Google Pay' | 'Pin' | 'Cash'

export interface MenuItem {
    name: string
    price: number
    paid: boolean
}

export interface OrderItem {
    name: string
    price: number
    paid?: boolean
}

export interface GuestOrder {
    guest: string
    items: MenuItem[]
}

export interface CustomPayment {
    guest: string
    amount: number
    paid: boolean
}

export interface TablePayment {
    id: string
    guestName: string
    amount: number
    method: PaymentMethod
    status: PaymentStatus
    time: Date
    items: string[]
    failureReason?: string
}

export interface Table {
    num: number
    guests: number
    status: TableStatus
    amount?: number
    paid?: number
    duration?: string
    splitMode?: SplitMode
    startTime?: string
    waiter?: string
    section?: string
    createdAt?: Date
    orderNumber?: string
    lastOrder?: number
    freed?: string
    total?: number
    orders?: (GuestOrder | OrderItem)[]
    sharedItems?: OrderItem[]
    customPayments?: CustomPayment[]
    paidGuests?: number
    payments?: TablePayment[]
}

export interface Payment {
    id: number
    table?: number
    tableNumber?: number
    amount: number
    tip: number
    fee: number
    status: PaymentStatus
    time: Date
    timestamp?: string | Date
    method: PaymentMethod
}

export interface Review {
    id: number
    author: string
    rating: number
    date: Date
    text: string
    url: string
    verified: boolean
}

export interface StatsData {
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

export interface UserData {
    name: string
    restaurantName: string
}

export interface ChartDataPoint {
    time: string
    omzet: number
    betalingen: number
    fooien: number
}

export interface DateRange {
    start: string
    end?: string
}

export type MetricType = 'all' | 'revenue' | 'payments' | 'tips' | 'reviews'

export interface StatsCardProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    value: string
    change?: string
    subtitle?: string
    onClick?: () => void
    isClickable?: boolean
    isActive?: boolean
}