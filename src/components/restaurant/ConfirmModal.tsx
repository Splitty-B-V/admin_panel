'use client'

import {JSX, useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// Type definitions
export type ModalType = 'danger' | 'warning' | 'info'

export interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (() => void) | null
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: ModalType
    requireConfirmation?: boolean
    confirmationText?: string
    confirmationPlaceholder?: string
}

export function ConfirmModal({
                                 isOpen,
                                 onClose,
                                 onConfirm,
                                 title = 'Bevestig actie',
                                 message,
                                 confirmText = 'Bevestigen',
                                 cancelText = 'Annuleren',
                                 type = 'danger',
                                 requireConfirmation = false,
                                 confirmationText = '',
                                 confirmationPlaceholder = 'Type ter bevestiging'
                             }: ConfirmModalProps): JSX.Element | null {
    const [confirmInput, setConfirmInput] = useState<string>('')

    if (!isOpen) return null

    const handleConfirm = (): void => {
        if (requireConfirmation && confirmInput !== confirmationText) {
            return // Don't confirm if text doesn't match
        }
        if (onConfirm) {
            onConfirm()
        }
        setConfirmInput('') // Reset input
    }

    const handleClose = (): void => {
        setConfirmInput('') // Reset input
        onClose()
    }

    const getButtonStyle = (): string => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
            default:
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        }
    }

    const getIconColor = (): string => {
        switch (type) {
            case 'danger':
                return 'text-red-600'
            case 'warning':
                return 'text-yellow-600'
            default:
                return 'text-green-600'
        }
    }

    const getBackgroundColor = (): string => {
        switch (type) {
            case 'danger':
                return 'bg-red-100'
            case 'warning':
                return 'bg-yellow-100'
            default:
                return 'bg-green-100'
        }
    }

    const isConfirmDisabled = requireConfirmation && confirmInput !== confirmationText

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal panel */}
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-opacity-10 sm:mx-0 sm:h-10 sm:w-10 ${getBackgroundColor()}`}>
                                <ExclamationTriangleIcon className={`h-6 w-6 ${getIconColor()}`} />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                    {requireConfirmation && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type <span className="font-semibold text-red-600">"{confirmationText}"</span> om te bevestigen:
                                            </label>
                                            <input
                                                type="text"
                                                value={confirmInput}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmInput(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                placeholder={confirmationPlaceholder}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                                isConfirmDisabled
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : getButtonStyle()
                            }`}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
