'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/restaurant/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getRecentPayments } from '@/lib/api'
import {
    ChevronLeftIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

interface Payment {
    id: string
    tableNumber: number
    amount: number
    tip: number
    status: 'completed' | 'pending' | 'failed'
    paymentMethod: string
    timestamp: string
    orderNumber: number
}

interface PaymentsResponse {
    payments: Payment[]
    total: number
    hasMore: boolean
}

interface ProcessedPayment extends Payment {
    total: number
    statusLabel: string
    dateString: string
    timeString: string
    date: Date
}

export default function PaymentHistory() {
    const router = useRouter()
    const { user } = useAuth()
    const { t, locale } = useLanguage()

    // States
    const [payments, setPayments] = useState<ProcessedPayment[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'quarter'>('all')
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPayments, setTotalPayments] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const ITEMS_PER_PAGE = 30

    useEffect(() => {
        document.title = 'Payments History - Splitty'
    }, [])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Process payment data
    const processPayment = useCallback((payment: Payment): ProcessedPayment => {
        const date = new Date(payment.timestamp)

        const statusLabels = {
            completed: locale === 'nl' ? 'Voltooid' : 'Completed',
            pending: locale === 'nl' ? 'In afwachting' : 'Pending',
            failed: locale === 'nl' ? 'Mislukt' : 'Failed'
        }

        return {
            ...payment,
            total: payment.amount + payment.tip,
            statusLabel: statusLabels[payment.status],
            date,
            dateString: date.toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }),
            timeString: date.toLocaleTimeString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }, [locale])

    // Calculate date range for API
    const getDateRange = useCallback(() => {
        if (dateFilter === 'all') return { dateFrom: undefined, dateTo: undefined }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        let dateFrom: Date
        let dateTo: Date = now

        switch (dateFilter) {
            case 'today':
                dateFrom = today
                dateTo = new Date(today.getTime() + 24 * 60 * 60 * 1000)
                break
            case 'week':
                dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case 'month':
                dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                break
            case 'quarter':
                dateFrom = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
                break
            default:
                return { dateFrom: undefined, dateTo: undefined }
        }

        return {
            dateFrom: dateFrom.toISOString(),
            dateTo: dateTo.toISOString()
        }
    }, [dateFilter])

    // Fetch payments
    const fetchPayments = useCallback(async (page: number = 1) => {
        setLoading(true)
        setError(null)

        try {
            const offset = (page - 1) * ITEMS_PER_PAGE
            const { dateFrom, dateTo } = getDateRange()

            const response: PaymentsResponse = await getRecentPayments(
                ITEMS_PER_PAGE,
                offset,
                undefined, // tableNumber not used
                debouncedSearch || undefined,
                statusFilter !== 'all' ? statusFilter : undefined,
                dateFrom,
                dateTo
            )

            const processedPayments = response.payments.map(processPayment)
            setPayments(processedPayments)
            setTotalPayments(response.total)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payments')
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, statusFilter, getDateRange, processPayment])

    // Effects
    useEffect(() => {
        setCurrentPage(1)
        fetchPayments(1)
    }, [fetchPayments])

    useEffect(() => {
        fetchPayments(currentPage)
    }, [currentPage])

    // Handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleExport = async () => {
        setLoading(true)
        try {
            const { dateFrom, dateTo } = getDateRange()

            const response: PaymentsResponse = await getRecentPayments(
                5000, // Large limit for export
                0,
                undefined,
                debouncedSearch || undefined,
                statusFilter !== 'all' ? statusFilter : undefined,
                dateFrom,
                dateTo
            )

            const exportPayments = response.payments.map(processPayment)

            const csv = [
                ['Payment ID', 'Order Number', 'Table', 'Amount', 'Tip', 'Total', 'Status', 'Payment Method', 'Date', 'Time'].join(','),
                ...exportPayments.map(payment =>
                    [
                        payment.id,
                        payment.orderNumber,
                        payment.tableNumber,
                        payment.amount,
                        payment.tip,
                        payment.total.toFixed(2),
                        payment.status,
                        payment.paymentMethod,
                        payment.dateString,
                        payment.timeString
                    ].join(',')
                )
            ].join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setError('Failed to export payments')
        } finally {
            setLoading(false)
        }
    }

    // Pagination calculations
    const totalPages = Math.ceil(totalPayments / ITEMS_PER_PAGE)
    // const hasActiveFilters = debouncedSearch || statusFilter !== 'all' || dateFilter !== 'all'

    // Loading state
    if (loading && payments.length === 0) {
        return (
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading payments...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    // Error state
    if (error && payments.length === 0) {
        return (
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchPayments(1)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="p-3 sm:p-4 md:p-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/restaurant/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ChevronLeftIcon className="h-5 w-5 mr-2" />
                        {locale === 'nl' ? 'Terug naar dashboard' : 'Back to dashboard'}
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {locale === 'nl' ? 'Betalingsgeschiedenis' : 'Payment History'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {totalPayments > 0 && (
                                    <>
                                        {locale === 'nl' ? `${totalPayments} transacties` : `${totalPayments} transactions`}
                                        {/*{hasActiveFilters && (*/}
                                        {/*    <span className="text-green-600">*/}
                                        {/*        {' '}({locale === 'nl' ? 'gefilterd' : 'filtered'})*/}
                                        {/*    </span>*/}
                                        {/*)}*/}
                                    </>
                                )}
                            </p>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={loading || totalPayments === 0}
                            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            {locale === 'nl' ? 'Exporteren' : 'Export'}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={locale === 'nl' ? 'Zoek betaling, tafel of bestelling...' : 'Search payment, table or order...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            {searchTerm !== debouncedSearch && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                </div>
                            )}
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center"
                        >
                            <FunnelIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                            {locale === 'nl' ? 'Filters' : 'Filters'}
                            {(statusFilter !== 'all' || dateFilter !== 'all') && (
                                <span className="ml-1.5 bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                                    {[statusFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">{locale === 'nl' ? 'Alle' : 'All'}</option>
                                    <option value="completed">{locale === 'nl' ? 'Voltooid' : 'Completed'}</option>
                                    <option value="pending">{locale === 'nl' ? 'In afwachting' : 'Pending'}</option>
                                    <option value="failed">{locale === 'nl' ? 'Mislukt' : 'Failed'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {locale === 'nl' ? 'Periode' : 'Period'}
                                </label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">{locale === 'nl' ? 'Alle' : 'All'}</option>
                                    <option value="today">{locale === 'nl' ? 'Vandaag' : 'Today'}</option>
                                    <option value="week">{locale === 'nl' ? 'Deze week' : 'This week'}</option>
                                    <option value="month">{locale === 'nl' ? 'Deze maand' : 'This month'}</option>
                                    <option value="quarter">{locale === 'nl' ? 'Dit kwartaal' : 'This quarter'}</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading indicator */}
                {loading && payments.length > 0 && (
                    <div className="mb-4 flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>
                )}

                {/* Error indicator */}
                {error && payments.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Payments Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {locale === 'nl' ? 'Betaling' : 'Payment'}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                    {locale === 'nl' ? 'Tafel' : 'Table'}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {locale === 'nl' ? 'Bedrag' : 'Amount'}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    {locale === 'nl' ? 'Datum' : 'Date'}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                    {locale === 'nl' ? 'Acties' : 'Actions'}
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                        {locale === 'nl' ? 'Geen betalingen gevonden' : 'No payments found'}
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{payment.id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                            {payment.tableNumber}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    €{payment.total.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {locale === 'nl' ? 'Fooi' : 'Tip'}: €{payment.tip.toFixed(2)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                    {payment.statusLabel}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                            {payment.dateString}, {payment.timeString}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm hidden lg:table-cell">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => router.push(`/order/${payment.orderNumber}`)}
                                                    className="text-green-600 hover:text-green-700 font-medium"
                                                >
                                                    {locale === 'nl' ? 'Bestelling' : 'Order'}
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => router.push(`/payment/${payment.id}`)}
                                                    className="text-green-600 hover:text-green-700 font-medium"
                                                >
                                                    {locale === 'nl' ? 'Details' : 'Details'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    {locale === 'nl'
                                        ? `Pagina ${currentPage} van ${totalPages} (${totalPayments} totaal)`
                                        : `Page ${currentPage} of ${totalPages} (${totalPayments} total)`}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {locale === 'nl' ? 'Vorige' : 'Previous'}
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex space-x-1">
                                        {/* Always show page 1 */}
                                        {currentPage > 3 && (
                                            <>
                                                <button
                                                    onClick={() => handlePageChange(1)}
                                                    className="w-8 h-8 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    1
                                                </button>
                                                {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                                            </>
                                        )}

                                        {/* Current page range */}
                                        {(() => {
                                            const start = Math.max(1, currentPage - 2)
                                            const end = Math.min(totalPages, currentPage + 2)
                                            const pages = []

                                            for (let i = start; i <= end; i++) {
                                                if (i === 1 && currentPage > 3) continue

                                                pages.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => handlePageChange(i)}
                                                        className={`w-8 h-8 text-sm rounded-lg ${
                                                            currentPage === i
                                                                ? 'bg-green-600 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {i}
                                                    </button>
                                                )
                                            }
                                            return pages
                                        })()}

                                        {/* Always show last page */}
                                        {currentPage < totalPages - 2 && (
                                            <>
                                                {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className="w-8 h-8 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || loading}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {locale === 'nl' ? 'Volgende' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}