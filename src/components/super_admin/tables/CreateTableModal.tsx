'use client'

import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/useToast'

interface CreateTableModalProps {
    isOpen: boolean
    onClose: () => void
    sectionName: string
    onSubmit: (tableNumber: number) => Promise<void>
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      sectionName,
                                                                      onSubmit
                                                                  }) => {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [tableNumber, setTableNumber] = useState('')

    const handleSubmit = async () => {
        const num = parseInt(tableNumber)

        if (!tableNumber || isNaN(num)) {
            showToast(t('restaurant.tables.create.validation.numberRequired'), 'warning')
            return
        }

        try {
            setLoading(true)
            await onSubmit(num)
            setTableNumber('')
            onClose()
        } catch (error: any) {
            showToast(error.message || t('restaurant.tables.create.error'), 'error')
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
                        {t('restaurant.tables.create.title')}
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
                            {t('restaurant.tables.create.fields.tableNumber')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={t('restaurant.tables.create.placeholders.tableNumber')}
                            disabled={loading}
                        />
                    </div>
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
                        {loading ? t('common.creating') : t('restaurant.tables.create.submit')}
                    </button>
                </div>
            </div>
        </div>
    )
}