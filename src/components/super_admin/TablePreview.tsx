import React from 'react'
import Link from 'next/link'
import {
    TableCellsIcon,
    PlusIcon,
    ArrowTopRightOnSquareIcon,
    QrCodeIcon,
    WifiIcon,
    CheckCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'

interface Table {
    id: number;
    table_number: number;
    is_active: boolean;
    table_section: string | null;
    table_design: string | null;
    table_link: string | null;
}

interface TablePreviewProps {
    tables: Table[];
    restaurantId: string;
    onManageTables: () => void;
}

// QR design images mapping - these are the designs from onboarding
const getQRDesignImage = (design: string | null) => {
    switch (design) {
        case '1':
            return '/images/qr-design-1.png' // Classic QR design
        case '2':
            return '/images/qr-design-2.png' // Modern QR design
        case '3':
            return '/images/qr-design-3.png' // Elegant QR design
        default:
            return '/images/qr-design-4.png' // Default QR design
    }
}

const getQRDesignName = (design: string | null) => {
    switch (design) {
        case '1':
            return 'Classic QR'
        case '2':
            return 'Modern QR'
        case '3':
            return 'Elegant QR'
        default:
            return 'Standard QR'
    }
}

const TablePreview: React.FC<TablePreviewProps> = ({ tables, restaurantId, onManageTables }) => {
    const activeTables = tables.filter(table => table.is_active)
    const previewTables = activeTables.slice(0, 3)

    if (!tables || tables.length === 0) {
        return (
            <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                        <QrCodeIcon className="h-5 w-5 mr-2 text-green-500" />
                        Tables & QR Codes
                    </h3>
                    <button
                        onClick={onManageTables}
                        className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="text-center py-6">
                    <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-gray-100">
                        <TableCellsIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-sm mb-3 text-[#6B7280]">No tables configured</p>
                    <button
                        onClick={onManageTables}
                        className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Setup Tables
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-5 rounded-xl h-fit bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center text-[#111827]">
                    <QrCodeIcon className="h-5 w-5 mr-2 text-green-500" />
                    Tables & QR Codes
                </h3>
                <button
                    onClick={onManageTables}
                    className="p-1.5 rounded-lg transition text-gray-600 hover:text-green-600 hover:bg-gray-100">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                        <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Total</p>
                        <p className="text-xl font-bold text-[#111827]">{tables.length}</p>
                    </div>
                    <div className="rounded-lg p-3 bg-green-50 border border-green-200">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Active</p>
                        <p className="text-xl font-bold text-green-700">{activeTables.length}</p>
                    </div>
                </div>

                {/* Table Previews */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[#111827]">Recent Tables</h4>
                    {previewTables.map((table) => (
                        <div key={table.id} className="rounded-lg border border-gray-200 p-3 hover:border-green-300 transition-colors">
                            <div className="flex items-center space-x-3">
                                {/* Table Design Image */}
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={getQRDesignImage(table.table_design)}
                                            alt={`Table ${table.table_number} QR design`}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => {
                                                // Fallback to icon if image fails to load
                                                e.currentTarget.style.display = 'none'
                                                e.currentTarget.nextElementSibling.style.display = 'block'
                                            }}
                                        />
                                        <QrCodeIcon className="w-6 h-6 text-gray-400 hidden" />
                                    </div>
                                </div>

                                {/* Table Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#111827]">
                                                Table {table.table_number}
                                            </p>
                                            <p className="text-xs text-[#6B7280]">
                                                {table.table_section || 'No section'} • {getQRDesignName(table.table_design)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {/* QR Code Status */}
                                            {table.table_link ? (
                                                <div className="flex items-center text-xs text-green-600">
                                                    <QrCodeIcon className="w-3 h-3 mr-1" />
                                                    <span>QR Ready</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <QrCodeIcon className="w-3 h-3 mr-1" />
                                                    <span>No QR</span>
                                                </div>
                                            )}

                                            {/* Active Status */}
                                            {table.is_active ? (
                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XMarkIcon className="w-4 h-4 text-red-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show More Button */}
                {tables.length > 3 && (
                    <div className="text-center pt-2">
                        <button
                            onClick={onManageTables}
                            className="text-sm text-green-600 hover:text-green-700 font-medium">
                            +{tables.length - 3} more tables
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onManageTables}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg transition bg-gray-50 border border-gray-200 text-green-600 hover:text-green-700 hover:bg-gray-100">
                        Manage All Tables
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TablePreview