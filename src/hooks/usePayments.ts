import { useState, useEffect } from 'react'
import { getRecentPayments } from "@/lib/api"

export const useRecentPayments = (limit = 6) => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPayments = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getRecentPayments(limit)
            // @ts-ignore
            setPayments(data.payments || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [limit])

    return { payments, loading, error, refetch: fetchPayments }
}
