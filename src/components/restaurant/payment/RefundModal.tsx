'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import {env} from "@/lib/env";

interface Payment {
    id: string
    totalCharged: number
    splittyFee: number
    totalRefunded?: number
    remainingRefundable?: number
}

interface RefundModalProps {
    payment: Payment
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

export default function RefundModal({ payment, isOpen, onClose, onSuccess }: RefundModalProps) {
    const { t } = useLanguage()

    const REFUND_REASONS = [
        { value: 'requested_by_customer', label: t('refund.reasons.requested_by_customer') },
        { value: 'duplicate', label: t('refund.reasons.duplicate') },
        { value: 'fraudulent', label: t('refund.reasons.fraudulent') }
    ] as const

    // Безопасный расчет maxRefundable с явным приведением к числу
    const maxRefundable = Number(
        payment.remainingRefundable ??
        (payment.totalCharged - payment.splittyFee - (payment.totalRefunded ?? 0))
    )

    const [amount, setAmount] = useState(0)
    const [reason, setReason] = useState<string>('requested_by_customer')
    const [notes, setNotes] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Устанавливаем amount когда модал открывается
    useEffect(() => {
        if (isOpen && maxRefundable > 0) {
            setAmount(maxRefundable)
        }
    }, [isOpen, maxRefundable])

    const handleRefund = async () => {
        setError(null)
        setSuccess(false)

        // Validation
        if (amount <= 0 || amount > maxRefundable) {
            setError(t('refund.error.invalidAmount'))
            return
        }

        setIsProcessing(true)

        const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

        try {
            const response = await fetch(
                `${API_BASE_URL}/restaurant_admin/payments/${payment.id}/refund`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        amount: amount,
                        reason: reason,
                        notes: notes.trim() || null
                    })
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || t('refund.error.failed'))
            }

            const result = await response.json()
            console.log('Refund successful:', result)

            setSuccess(true)

            setTimeout(() => {
                onSuccess()
                onClose()
            }, 1500)

        } catch (err: any) {
            console.error('Refund error:', err)
            setError(err.message || t('refund.error.unexpected'))
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        if (!isProcessing) {
            setError(null)
            setSuccess(false)
            setAmount(0)
            setReason('requested_by_customer')
            setNotes('')
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={handleClose}
                />

                <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {t('refund.title')}
                        </h3>
                        <button
                            onClick={handleClose}
                            disabled={isProcessing}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-green-800">
                                        {t('refund.success.title')}
                                    </h4>
                                    <p className="mt-1 text-sm text-green-700">
                                        {t('refund.success.message')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!success && (
                        <>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-yellow-800">
                                            {t('refund.warning.title')}
                                        </h4>
                                        <p className="mt-1 text-sm text-yellow-700">
                                            {t('refund.warning.message')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    {t('refund.breakdown.title')}
                                </h4>
                                <dl className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-600">{t('refund.breakdown.totalPaid')}</dt>
                                        <dd className="font-medium text-gray-900">€{Number(payment.totalCharged).toFixed(2)}</dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-600">{t('refund.breakdown.splittyFee')}</dt>
                                        <dd className="font-medium text-orange-600">-€{Number(payment.splittyFee).toFixed(2)}</dd>
                                    </div>
                                    {payment.totalRefunded && payment.totalRefunded > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-600">{t('refund.breakdown.alreadyRefunded')}</dt>
                                            <dd className="font-medium text-red-600">-€{Number(payment.totalRefunded).toFixed(2)}</dd>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-gray-200">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-semibold text-gray-900">
                                                {t('refund.breakdown.maxRefundable')}
                                            </dt>
                                            <dd className="text-base font-bold text-green-600">
                                                €{Number(maxRefundable).toFixed(2)}
                                            </dd>
                                        </div>
                                    </div>
                                </dl>
                            </div>

                            {/* Amount input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('refund.form.amount.label')} *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">€</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={maxRefundable}
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        disabled={isProcessing}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {t('refund.form.amount.hint', { max: maxRefundable.toFixed(2) })}
                                </p>
                            </div>

                            {/* Reason select */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('refund.form.reason.label')} *
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    disabled={isProcessing}
                                >
                                    {REFUND_REASONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes textarea */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('refund.form.notes.label')}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t('refund.form.notes.placeholder')}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                                    disabled={isProcessing}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {t('refund.form.notes.hint')}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('refund.actions.cancel')}
                                </button>
                                <button
                                    onClick={handleRefund}
                                    disabled={isProcessing || amount <= 0 || amount > maxRefundable}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isProcessing ? t('refund.actions.processing') : t('refund.actions.confirm')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}