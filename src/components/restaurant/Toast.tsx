'use client'

import { useState, useEffect, JSX } from 'react'
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

// Type definitions
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
    id: number
    message: string
    type: ToastType
    duration: number
}

export interface ToastProps {
    message: string
    type?: ToastType
    duration?: number
    onClose: () => void
}

export interface UseToastReturn {
    toasts: ToastData[]
    showToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: number) => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps): JSX.Element {
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const [isExiting, setIsExiting] = useState<boolean>(false)

    useEffect(() => {
        // Animate in
        setIsVisible(true)

        // Set timer to start exit animation
        const timer = setTimeout(() => {
            setIsExiting(true)
            // Close after animation completes
            setTimeout(onClose, 300)
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const getIcon = (): JSX.Element => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />
            case 'error':
                return <XCircleIcon className="w-5 h-5 text-red-500" />
            case 'warning':
                return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
            case 'info':
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            default:
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
        }
    }

    const getBackgroundColor = (): string => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200'
            case 'info':
                return 'bg-blue-50 border-blue-200'
            default:
                return 'bg-blue-50 border-blue-200'
        }
    }

    const handleClose = (): void => {
        setIsExiting(true)
        setTimeout(onClose, 300)
    }

    return (
        <div
            className={`
                fixed bottom-4 right-4 z-50
                transition-all duration-300 ease-in-out
                ${isVisible && !isExiting
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0'
            }
            `}
        >
            <div
                className={`
                    w-80 max-w-sm
                    bg-white border rounded-lg shadow-lg
                    ${getBackgroundColor()}
                    overflow-hidden
                `}
            >
                <div className="p-4">
                    <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            {getIcon()}
                        </div>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-5">
                                {message}
                            </p>
                        </div>

                        {/* Close button */}
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <span className="sr-only">Dismiss</span>
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function useToast(): UseToastReturn {
    const [toasts, setToasts] = useState<ToastData[]>([])

    const showToast = (message: string, type: ToastType = 'success', duration: number = 3000): void => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type, duration }])
    }

    const removeToast = (id: number): void => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    return {
        toasts,
        showToast,
        removeToast
    }
}