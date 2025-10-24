'use client'

import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/useToast'

interface CreateSectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { name: string; design: string }) => Promise<void>
}

export const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          onSubmit
                                                                      }) => {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        design: 'Splitty Oak Display 4'
    })

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showToast(t('restaurant.sections.create.validation.nameRequired'), 'warning')
            return
        }

        try {
            setLoading(true)
            await onSubmit(formData)
            setFormData({ name: '', design: 'Splitty Oak Display 4' })
            onClose()
        } catch (error: any) {
            showToast(error.message || t('restaurant.sections.create.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                        {t('restaurant.sections.create.title')}
                    </h4>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Section Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('restaurant.sections.create.fields.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={t('restaurant.sections.create.placeholders.name')}
                            disabled={loading}
                        />
                    </div>

                    {/* Design Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('restaurant.sections.create.fields.design')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.design}
                            onChange={(e) => setFormData({ ...formData, design: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={loading}
                        >
                            <option value="Splitty Oak Display 4">Splitty Oak Display 4</option>
                            <option value="Splitty Steel Plate 1B">Splitty Steel Plate 1B</option>
                            <option value="3">Design 3</option>
                            <option value="4">Design 4</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
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
                        {loading ? t('common.saving') : t('restaurant.sections.create.submit')}
                    </button>
                </div>
            </div>
        </div>
    )
}