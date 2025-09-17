import { useState, useEffect, useCallback } from 'react'
import type {
    Payout,
    PayoutsResponse,
    Balance,
    PayoutStatistics,
    PayoutFilters,
    ApiError
} from '@/types/payouts'
import {getBalance, getPayoutDetails, getPayouts, getStatistics} from "@/lib/api";

interface UsePayoutsResult {
    payouts: Payout[]
    loading: boolean
    error: string | null
    hasMore: boolean
    nextCursor: string | null
    loadMore: () => Promise<void>
    refresh: () => Promise<void>
}

export function usePayouts(filters: PayoutFilters = {}): UsePayoutsResult {
    const [payouts, setPayouts] = useState<Payout[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | null>(null)

    const fetchPayouts = useCallback(async (reset = false) => {
        try {
            setLoading(true)
            setError(null)

            const requestFilters = reset ? filters : { ...filters, starting_after: nextCursor }
            const response = await getPayouts(requestFilters)

            if (reset) {
                setPayouts(response.payouts)
            } else {
                setPayouts(prev => [...prev, ...response.payouts])
            }

            setHasMore(response.has_more)
            setNextCursor(response.next_cursor)

        } catch (err) {
            const apiError = err as ApiError
            setError(apiError.detail || apiError.message || 'Failed to load payouts')
            console.error('Error fetching payouts:', err)
        } finally {
            setLoading(false)
        }
    }, [filters, nextCursor])

    const loadMore = useCallback(async () => {
        if (hasMore && !loading && nextCursor) {
            await fetchPayouts(false)
        }
    }, [hasMore, loading, nextCursor, fetchPayouts])

    const refresh = useCallback(async () => {
        setNextCursor(null)
        await fetchPayouts(true)
    }, [fetchPayouts])

    useEffect(() => {
        fetchPayouts(true)
    }, [JSON.stringify(filters)])

    return {
        payouts,
        loading,
        error,
        hasMore,
        nextCursor,
        loadMore,
        refresh
    }
}

interface UseBalanceResult {
    balance: Balance | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export function useBalance(): UseBalanceResult {
    const [balance, setBalance] = useState<Balance | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBalance = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getBalance()
            setBalance(response)
        } catch (err) {
            const apiError = err as ApiError
            setError(apiError.detail || apiError.message || 'Failed to load balance')
            console.error('Error fetching balance:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const refresh = useCallback(async () => {
        await fetchBalance()
    }, [fetchBalance])

    useEffect(() => {
        fetchBalance()
    }, [fetchBalance])

    return {
        balance,
        loading,
        error,
        refresh
    }
}

interface UsePayoutStatisticsResult {
    statistics: PayoutStatistics | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export function usePayoutStatistics(): UsePayoutStatisticsResult {
    const [statistics, setStatistics] = useState<PayoutStatistics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStatistics = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getStatistics()
            setStatistics(response)
        } catch (err) {
            const apiError = err as ApiError
            setError(apiError.detail || apiError.message || 'Failed to load statistics')
            console.error('Error fetching statistics:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const refresh = useCallback(async () => {
        await fetchStatistics()
    }, [fetchStatistics])

    useEffect(() => {
        fetchStatistics()
    }, [fetchStatistics])

    return {
        statistics,
        loading,
        error,
        refresh
    }
}

interface UsePayoutDetailsResult {
    payout: Payout | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export function usePayoutDetails(payoutId: string | null): UsePayoutDetailsResult {
    const [payout, setPayout] = useState<Payout | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchPayoutDetails = useCallback(async () => {
        if (!payoutId) return

        try {
            setLoading(true)
            setError(null)
            const response = await getPayoutDetails(payoutId)
            setPayout(response)
        } catch (err) {
            const apiError = err as ApiError
            setError(apiError.detail || apiError.message || 'Failed to load payout details')
            console.error('Error fetching payout details:', err)
        } finally {
            setLoading(false)
        }
    }, [payoutId])

    const refresh = useCallback(async () => {
        await fetchPayoutDetails()
    }, [fetchPayoutDetails])

    useEffect(() => {
        if (payoutId) {
            fetchPayoutDetails()
        } else {
            setPayout(null)
            setError(null)
        }
    }, [payoutId, fetchPayoutDetails])

    return {
        payout,
        loading,
        error,
        refresh
    }
}