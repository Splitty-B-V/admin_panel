export interface BalanceAmount {
    amount: number
    currency: string
    source_types?: {
        card?: number
        bank_account?: number
        [key: string]: number | undefined
    }
}

export interface PayoutSchedule {
    interval: 'manual' | 'daily' | 'weekly' | 'monthly'
    weekly_anchor?: string
    monthly_anchor?: number
    delay_days?: number
}

export interface Balance {
    available: BalanceAmount[]
    pending: BalanceAmount[]
    connect_reserved: BalanceAmount[]
    payout_schedule: PayoutSchedule | null
    bank_account?: {
        account_number: string
        bank_name: string | null
        account_holder: string | null
        country: string
        routing_number?: string | null
    } | null
    business_name?: string | null
}

export interface TransactionBreakdown {
    payments: {
        count: number
        amount: number
        fees: number
    }
    refunds: {
        count: number
        amount: number
        fees: number
    }
    adjustments: {
        count: number
        amount: number
        fees: number
    }
    other: {
        count: number
        amount: number
        fees: number
    }
}

export interface Payout {
    id: string
    amount: number
    currency: string
    status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'
    arrival_date: string
    created: string
    method: 'standard' | 'instant'
    type: 'bank_account' | 'card'
    description?: string
    statement_descriptor?: string
    destination_id?: string
    // Enhanced details
    total_gross: number
    total_fees: number
    total_tips: number
    transaction_count: number
    period: string
    breakdown: TransactionBreakdown
}

export interface PayoutsResponse {
    payouts: Payout[]
    has_more: boolean
    next_cursor: string | null
}

export interface PayoutStatistics {
    total_pending: number
    total_paid: number
    available_balance: number
    pending_balance: number
    next_payout_date: string | null
    payout_count: number
    payout_schedule: PayoutSchedule | null
}

export interface PayoutFilters {
    status?: 'all' | 'pending' | 'in_transit' | 'paid' | 'failed'
    limit?: number
    starting_after?: string
}

// API Error type
export interface ApiError {
    status: number
    message: string
    detail?: string
}
