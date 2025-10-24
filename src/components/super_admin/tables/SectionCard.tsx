'use client'

import React, { useState } from 'react'
import { PlusIcon, TrashIcon, PencilIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/useToast'
import { Section } from '@/lib/api/sections'
import { TableCard } from './TableCard'
import { CreateTableModal } from './CreateTableModal'
import { BatchCreateTableModal } from './BatchCreateTableModal'
import {ConfirmDialog} from "@/components/common/ConfirmDialog";

interface SectionCardProps {
    section: Section
    onDeleteSection: (sectionId: number) => Promise<void>
    onCreateTable: (sectionId: number, tableNumber: number) => Promise<void>
    onCreateTablesBatch: (sectionId: number, tableNumbers: number[]) => Promise<void>
    onDeleteTable: (tableId: number) => Promise<void>
    onToggleTableStatus: (tableId: number) => Promise<void>
}

export const SectionCard: React.FC<SectionCardProps> = ({
                                                            section,
                                                            onDeleteSection,
                                                            onCreateTable,
                                                            onCreateTablesBatch,
                                                            onDeleteTable,
                                                            onToggleTableStatus
                                                        }) => {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [showCreateTableModal, setShowCreateTableModal] = useState(false)
    const [showBatchCreateModal, setShowBatchCreateModal] = useState(false)
    const [isExpanded, setIsExpanded] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDeleteSection = async () => {
        if (section.tables && section.tables.length > 0) {
            showToast(t('restaurant.sections.delete.hasTables'), 'warning')
            return
        }

        setShowDeleteConfirm(true)
    }

    const confirmDeleteSection = async () => {
        try {
            setLoading(true)
            setShowDeleteConfirm(false)
            await onDeleteSection(section.id)
            showToast(t('restaurant.sections.delete.success'), 'success')
        } catch (error: any) {
            showToast(error.message || t('restaurant.sections.delete.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTable = async (tableNumber: number) => {
        await onCreateTable(section.id, tableNumber)
    }

    const handleCreateTablesBatch = async (tableNumbers: number[]) => {
        await onCreateTablesBatch(section.id, tableNumbers)
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                <Squares2X2Icon className="h-5 w-5" />
                            </button>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                                <p className="text-sm text-gray-600">
                                    Design {section.design} • {section.tables?.length || 0} {t('restaurant.sections.card.tables')}
                                </p>
                            </div>
                        </div>

                        {/* Section Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateTableModal(true)}
                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-1 text-sm"
                            >
                                <PlusIcon className="h-4 w-4" />
                                {t('restaurant.tables.actions.addSingle')}
                            </button>
                            <button
                                onClick={() => setShowBatchCreateModal(true)}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 text-sm"
                            >
                                <PlusIcon className="h-4 w-4" />
                                {t('restaurant.tables.actions.addBatch')}
                            </button>
                            <button
                                onClick={handleDeleteSection}
                                disabled={loading || (section.tables && section.tables.length > 0)}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title={t('restaurant.sections.actions.delete')}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tables Grid */}
                {isExpanded && (
                    <div className="p-6">
                        {!section.tables || section.tables.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-gray-100">
                                    <Squares2X2Icon className="h-6 w-6 text-gray-600" />
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    {t('restaurant.sections.card.noTables')}
                                </p>
                                <button
                                    onClick={() => setShowCreateTableModal(true)}
                                    className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    {t('restaurant.tables.actions.addFirst')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {section.tables.map((table) => (
                                    <TableCard
                                        key={table.id}
                                        table={table}
                                        onDelete={onDeleteTable}
                                        onToggleStatus={onToggleTableStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateTableModal
                isOpen={showCreateTableModal}
                onClose={() => setShowCreateTableModal(false)}
                sectionName={section.name}
                onSubmit={handleCreateTable}
            />

            <BatchCreateTableModal
                isOpen={showBatchCreateModal}
                onClose={() => setShowBatchCreateModal(false)}
                sectionName={section.name}
                onSubmit={handleCreateTablesBatch}
            />

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title={t('restaurant.delete.title')}
                message={t('restaurant.sections.delete.confirmation')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                onConfirm={confirmDeleteSection}
                onCancel={() => setShowDeleteConfirm(false)}
                type="danger"
            />
        </>
    )
}