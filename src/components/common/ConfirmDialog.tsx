'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    onConfirm: () => void
    onCancel: () => void
    type?: 'danger' | 'warning' | 'info'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                                isOpen,
                                                                title,
                                                                message,
                                                                confirmText,
                                                                cancelText,
                                                                onConfirm,
                                                                onCancel,
                                                                type = 'danger'
                                                            }) => {
    if (!isOpen) return null

    const colors = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600',
        info: 'bg-blue-500 hover:bg-blue-600'
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 2147483646 }}>
            <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-lg transition ${colors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}