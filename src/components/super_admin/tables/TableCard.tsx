'use client'

import React, { useState } from 'react'
import {TrashIcon, EyeIcon, EyeSlashIcon, ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/useToast'
import { Table } from '@/lib/api/sections'
import QRCode from 'qrcode'
import {ConfirmDialog} from "@/components/common/ConfirmDialog";
import {ClipboardDocumentIcon} from "@heroicons/react/16/solid";

interface TableCardProps {
    table: Table
    onDelete: (tableId: number) => Promise<void>
    onToggleStatus: (tableId: number) => Promise<void>
}

// QR Code Display Component
const QRCodeDisplay: React.FC<{ url: string; size?: number }> = ({ url, size = 80 }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

    React.useEffect(() => {
        if (url) {
            QRCode.toDataURL(url, { width: size, margin: 1 })
                .then(setQrCodeUrl)
                .catch(console.error)
        }
    }, [url, size])

    if (!qrCodeUrl) return <div style={{ width: size, height: size }} className="bg-gray-200 rounded" />

    return <img src={qrCodeUrl} alt="QR Code" className="rounded" style={{ width: size, height: size }} />
}

export const TableCard: React.FC<TableCardProps> = ({
                                                        table,
                                                        onDelete,
                                                        onToggleStatus
                                                    }) => {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDelete = async () => {
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        try {
            setLoading(true)
            setShowDeleteConfirm(false)
            await onDelete(table.id)
            showToast(t('restaurant.tables.delete.success'), 'success')
        } catch (error: any) {
            showToast(error.message || t('restaurant.tables.delete.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        try {
            setLoading(true)
            await onToggleStatus(table.id)
            showToast(
                table.is_active
                    ? t('restaurant.tables.toggle.deactivated')
                    : t('restaurant.tables.toggle.activated'),
                'success'
            )
        } catch (error: any) {
            showToast(error.message || t('restaurant.tables.toggle.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 transition">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        {/* QR Code */}
                        {table.table_link && (
                            <div className="flex-shrink-0">
                                <QRCodeDisplay url={table.table_link} size={60} />
                            </div>
                        )}

                        {/* Table Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900">
                                {t('restaurant.tables.card.tableNumber', { number: table.table_number })}
                            </h4>
                            <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                                    table.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                  {table.is_active ? t('common.active') : t('common.inactive')}
                </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleToggleStatus}
                            disabled={loading}
                            className="p-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
                            title={table.is_active ? t('restaurant.tables.actions.deactivate') : t('restaurant.tables.actions.activate')}
                        >
                            {table.is_active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                            title={t('restaurant.tables.actions.delete')}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Table Link */}
                {table.table_link && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-gray-600 truncate flex-1">{table.table_link}</p>
                            <div className="flex gap-1 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(table.table_link)
                                        showToast(t('common.copied'), 'success')
                                    }}
                                    className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    title={t('common.copy')}
                                >
                                    <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => window.open(table.table_link, '_blank')}
                                    className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    title={t('common.open')}
                                >
                                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title={t('restaurant.delete.title')}
                message={t('restaurant.tables.delete.confirmation')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                type="danger"
            />
        </>
    )
}