'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Toast, ToastType, ToastData } from '@/components/common/Toast'

interface ToastContextType {
    toasts: ToastData[]
    showToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const showToast = (message: string, type: ToastType = 'success', duration: number = 3000) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type, duration }])
    }

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            {/* Render toasts in portal to body */}
            {mounted && typeof window !== 'undefined' && createPortal(
                <div
                    className="fixed top-4 right-4 space-y-2"
                    style={{
                        zIndex: 2147483647,
                        pointerEvents: 'none'
                    }}
                >
                    {toasts.map((toast) => (
                        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                            <Toast
                                message={toast.message}
                                type={toast.type}
                                duration={toast.duration}
                                onClose={() => removeToast(toast.id)}
                            />
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    )
}

export function useToastGlobal() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToastGlobal must be used within ToastProvider')
    }
    return context
}