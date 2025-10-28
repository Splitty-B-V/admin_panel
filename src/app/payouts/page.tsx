'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePayouts, useBalance, usePayoutStatistics, usePayoutDetails } from '@/hooks/usePayouts'
import type { Payout } from '@/types/payouts'
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
    ArrowPathIcon,
    ExclamationTriangleIcon,
    EyeIcon,
} from '@heroicons/react/24/outline'
import SmartLayout from '@/components/common/SmartLayout'

export default function Uitbetalingen() {
    const { t } = useLanguage()
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_transit' | 'paid' | 'failed'>('all')
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
    const [selectedPeriod, setSelectedPeriod] = useState('month')

    // Prepare filters
    const filters = {
        limit: 20,
        ...(filterStatus !== 'all' && { status: filterStatus })
    }

    // Use hooks for data fetching
    const {
        payouts,
        loading: payoutsLoading,
        error: payoutsError,
        hasMore,
        loadMore,
        refresh: refreshPayouts
    } = usePayouts(filters)

    const {
        balance,
        loading: balanceLoading,
        error: balanceError,
        refresh: refreshBalance
    } = useBalance()

    const {
        statistics,
        loading: statsLoading,
        error: statsError,
        refresh: refreshStats
    } = usePayoutStatistics()

    // Calculate totals from real data
    const totalPending = statistics?.total_pending || 0
    const totalCompleted = statistics?.total_paid || 0
    const totalTips = payouts.reduce((sum, p) => sum + (p.total_tips || 0), 0)

    const getStatusBadge = (status: Payout['status']) => {
        switch(status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        {t('payouts.status.paid')}
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {t('payouts.status.pending')}
                    </span>
                )
            case 'in_transit':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        {t('payouts.status.inTransit')}
                    </span>
                )
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        {t('payouts.status.failed')}
                    </span>
                )
            default:
                return null
        }
    }

    const getStatusText = (status: string) => {
        switch(status) {
            case 'paid': return t('payouts.status.paid')
            case 'pending': return t('payouts.status.pending')
            case 'in_transit': return t('payouts.status.inTransit')
            case 'failed': return t('payouts.status.failed')
            default: return status
        }
    }

    const exportToCSV = () => {
        const headers = [
            t('payouts.table.id'),
            t('payouts.table.date'),
            t('payouts.table.amount'),
            t('payouts.table.status'),
            t('payouts.table.period'),
            t('payouts.table.fees'),
            t('payouts.table.tips')
        ]
        const rows = payouts.map(payout => [
            payout.id,
            new Date(payout.created).toLocaleDateString('nl-NL'),
            `€${payout.amount.toFixed(2)}`,
            getStatusText(payout.status),
            payout.period,
            `€${(payout.total_fees || 0).toFixed(2)}`,
            `€${(payout.total_tips || 0).toFixed(2)}`
        ])

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const refreshAll = async () => {
        await Promise.all([
            refreshPayouts(),
            refreshBalance(),
            refreshStats()
        ])
    }

    // Error handling
    if (payoutsError || balanceError || statsError) {
        return (
            <SmartLayout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    {t('payouts.error.title')}
                                </h3>
                                <p className="text-sm text-red-700 mt-1">
                                    {payoutsError || balanceError || statsError}
                                </p>
                                <button
                                    onClick={refreshAll}
                                    className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                                >
                                    {t('payouts.error.tryAgain')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SmartLayout>
        )
    }

    return (
        <SmartLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('payouts.title')}</h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">{t('payouts.subtitle')}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={refreshAll}
                                disabled={payoutsLoading || balanceLoading || statsLoading}
                                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center justify-center disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`h-5 w-5 sm:mr-2 ${(payoutsLoading || balanceLoading || statsLoading) ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">{t('payouts.actions.refresh')}</span>
                            </button>
                            <button
                                onClick={exportToCSV}
                                disabled={payouts.length === 0}
                                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center justify-center disabled:opacity-50"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 sm:mr-2" />
                                <span className="hidden sm:inline">{t('payouts.actions.exportCsv')}</span>
                            </button>
                        </div>
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
                        <p className="text-sm text-gray-600 mt-1">{t('payouts.stats.nextPayout')}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {statistics?.next_payout_date &&
                                new Date(statistics.next_payout_date).toLocaleDateString('nl-NL')
                            }
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <BanknotesIcon className="h-8 w-8 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            €{totalCompleted.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{t('payouts.stats.totalPaidOut')}</p>
                        <p className="text-xs text-gray-500 mt-2">{t('payouts.stats.thisMonth')}</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <UsersIcon className="h-8 w-8 text-yellow-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            €{totalTips.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{t('payouts.stats.totalTips')}</p>
                        <p className="text-xs text-gray-500 mt-2">{t('payouts.stats.distributedToTeam')}</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payouts List - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg bg-white text-gray-900 border border-gray-300 shadow-sm">
                            <div className="flex flex-col space-y-1.5 border-b border-gray-100 p-4 md:p-6">
                                <div className="flex justify-between items-center">
                                    <div className="tracking-tight text-xl md:text-2xl font-bold text-gray-900">
                                        {t('payouts.list.title')}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {payouts.length} {t('payouts.list.countLabel')}
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 md:p-6">
                                {payoutsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                                        <span className="ml-2 text-gray-600">{t('payouts.list.loading')}</span>
                                    </div>
                                ) : payouts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BanknotesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {t('payouts.list.empty.title')}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t('payouts.list.empty.description')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {t('payouts.table.date')}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {t('payouts.table.amount')}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {t('payouts.table.status')}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {t('payouts.table.period')}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {t('payouts.table.tips')}
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {t('payouts.table.actions')}
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {payouts.map((payout) => (
                                                    <tr key={payout.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(payout.created).toLocaleDateString('nl-NL')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            €{payout.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(payout.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {payout.period}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            €{(payout.total_tips || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => setSelectedPayout(payout)}
                                                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                                {t('payouts.table.viewDetails')}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Load More Button */}
                                        {hasMore && (
                                            <div className="mt-6 text-center">
                                                <button
                                                    onClick={loadMore}
                                                    disabled={payoutsLoading}
                                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                                                >
                                                    {payoutsLoading ? (
                                                        <>
                                                            <ArrowPathIcon className="h-4 w-4 mr-2 inline animate-spin" />
                                                            {t('payouts.list.loadingMore')}
                                                        </>
                                                    ) : (
                                                        t('payouts.list.loadMore')
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Bank Account Info - Clean Design */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{t('payouts.bankAccount.title')}</h3>
                                <div className="p-2 rounded-lg bg-emerald-50">
                                    <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                            </div>

                            {balanceLoading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('payouts.bankAccount.accountNumber')}</p>
                                        <p className="font-mono text-sm font-semibold text-gray-900">
                                            {balance?.bank_account ?
                                                `${balance.bank_account.country}** **** **** **${balance.bank_account.account_number}` :
                                                t('payouts.bankAccount.notConfigured')
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('payouts.bankAccount.accountHolder')}</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {balance?.business_name || balance?.bank_account?.account_holder || t('payouts.bankAccount.notConfigured')}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs text-gray-600">
                                                {t('payouts.bankAccount.schedule')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payout Details Modal */}
                {selectedPayout && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{t('payouts.details.title')}</h3>
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
                                        <p className="text-sm text-gray-600 mb-1">{t('payouts.details.period')}</p>
                                        <p className="font-medium text-gray-900">{selectedPayout.period}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">{t('payouts.details.status')}</p>
                                        <div className="mt-1">{getStatusBadge(selectedPayout.status)}</div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">{t('payouts.details.breakdown.title')}</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">{t('payouts.details.breakdown.revenue')}</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                €{(selectedPayout.amount - (selectedPayout.total_tips || 0) + (selectedPayout.total_fees || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">{t('payouts.details.breakdown.tips')}</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                €{(selectedPayout.total_tips || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">{t('payouts.details.breakdown.fees')}</span>
                                            <span className="text-sm font-medium text-red-600">
                                                -€{(selectedPayout.total_fees || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-900">{t('payouts.details.breakdown.total')}</span>
                                                <span className="text-lg font-bold text-gray-900">
                                                    €{selectedPayout.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">{t('payouts.details.bankDetails')}</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">{t('payouts.bankAccount.accountNumber')}</p>
                                        <p className="font-mono text-sm text-gray-900 mt-1">
                                            {balance?.bank_account ?
                                                `${balance.bank_account.country}** **** **** **${balance.bank_account.account_number}` :
                                                'NL91 ABNA 0417164300'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setSelectedPayout(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        {t('payouts.details.close')}
                                    </button>
                                    <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-sm">
                                        {t('payouts.details.downloadPdf')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SmartLayout>
    )
}