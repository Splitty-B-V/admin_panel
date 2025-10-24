'use client'

import React, { useState } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/useToast'

interface BatchCreateTableModalProps {
    isOpen: boolean
    onClose: () => void
    sectionName: string
    onSubmit: (tableNumbers: number[]) => Promise<void>
}

export const BatchCreateTableModal: React.FC<BatchCreateTableModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                sectionName,
                                                                                onSubmit
                                                                            }) => {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [tableNumbers, setTableNumbers] = useState<string>('')

    const handleSubmit = async () => {
        // Парсим номера столов из строки
        const numbers = tableNumbers
            .split(',')
            .map(n => n.trim())
            .filter(n => n !== '')
            .map(n => parseInt(n))
            .filter(n => !isNaN(n))

        if (numbers.length === 0) {
            showToast(t('restaurant.tables.batch.validation.numbersRequired'), 'warning')
            return
        }

        // Проверяем на дубликаты
        const uniqueNumbers = Array.from(new Set(numbers))
        if (uniqueNumbers.length !== numbers.length) {
            showToast(t('restaurant.tables.batch.validation.duplicates'), 'warning')
            return
        }

        try {
            setLoading(true)
            await onSubmit(uniqueNumbers)
            setTableNumbers('')
            onClose()
        } catch (error: any) {
            showToast(error.message || t('restaurant.tables.batch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                        {t('restaurant.tables.batch.title')}
                    </h4>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    {t('restaurant.tables.create.sectionLabel')}: <span className="font-medium text-gray-900">{sectionName}</span>
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('restaurant.tables.batch.fields.tableNumbers')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={tableNumbers}
                            onChange={(e) => setTableNumbers(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                            placeholder={t('restaurant.tables.batch.placeholders.tableNumbers')}
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('restaurant.tables.batch.hint')}
                        </p>
                    </div>

                    {/* Preview */}
                    {tableNumbers && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-800 mb-3">
                                {t('restaurant.tables.batch.preview')}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tableNumbers
                                    .split(/[\s,]+/)  // Разделяем по пробелам И запятым
                                    .filter(n => n !== '')
                                    .map((num, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                isNaN(parseInt(num))
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-green-500 text-white'
                                            }`}
                                        >
                        {num}
                    </span>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                        {loading ? t('common.creating') : t('restaurant.tables.batch.submit')}
                    </button>
                </div>
            </div>
        </div>
    )
}