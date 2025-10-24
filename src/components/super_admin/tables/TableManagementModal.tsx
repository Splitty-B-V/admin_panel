'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/useToast'
import { Section } from '@/lib/api/sections'
import * as SectionsApi from '@/lib/api/sections'
import * as TablesApi from '@/lib/api/tables'
import { SectionCard } from './SectionCard'
import { CreateSectionModal } from './CreateSectionModal'

interface TableManagementModalProps {
    isOpen: boolean
    onClose: () => void
    restaurantId: number
    restaurantName: string
    googleSheetUrl?: string | null
    onGoogleSheetUpdate?: (url: string) => void
}

export const TableManagementModal: React.FC<TableManagementModalProps> = ({
                                                                              isOpen,
                                                                              onClose,
                                                                              restaurantId,
                                                                              restaurantName,
                                                                              googleSheetUrl: initialGoogleSheetUrl,
                                                                              onGoogleSheetUpdate
                                                                          }) => {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const [sections, setSections] = useState<Section[]>([])
    const [loading, setLoading] = useState(false)
    const [showCreateSectionModal, setShowCreateSectionModal] = useState(false)
    const [googleSheetUrl, setGoogleSheetUrl] = useState<string | null>(initialGoogleSheetUrl || null)
    const [isExporting, setIsExporting] = useState(false)

    const loadSections = async () => {
        try {
            setLoading(true)
            const data = await SectionsApi.getSectionsWithTables(restaurantId)
            setSections(data)
        } catch (error) {
            console.error('Failed to load sections:', error)
            showToast(t('restaurant.sections.loadError') || 'Failed to load sections', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadSections()
            setGoogleSheetUrl(initialGoogleSheetUrl || null)
        }
    }, [isOpen, restaurantId, initialGoogleSheetUrl])

    const handleCreateSection = async (data: { name: string; design: string }) => {
        try {
            await SectionsApi.createSection(restaurantId, data)
            await loadSections()
            showToast(t('restaurant.sections.createSuccess') || 'Section created successfully', 'success')
        } catch (error) {
            console.error('Failed to create section:', error)
            showToast(t('restaurant.sections.createError') || 'Failed to create section', 'error')
        }
    }

    const handleDeleteSection = async (sectionId: number) => {
        try {
            await SectionsApi.deleteSection(restaurantId, sectionId)
            await loadSections()
            showToast(t('restaurant.sections.deleteSuccess') || 'Section deleted successfully', 'success')
        } catch (error) {
            console.error('Failed to delete section:', error)
            showToast(t('restaurant.sections.deleteError') || 'Failed to delete section', 'error')
        }
    }

    const handleCreateTable = async (sectionId: number, tableNumber: number) => {
        try {
            await TablesApi.createTable(restaurantId, sectionId, tableNumber)
            await loadSections()
        } catch (error) {
            console.error('Failed to create table:', error)
            showToast(t('restaurant.tables.createError') || 'Failed to create table', 'error')
        }
    }

    const handleCreateTablesBatch = async (sectionId: number, tableNumbers: number[]) => {
        try {
            await TablesApi.createTablesBatch(restaurantId, sectionId, tableNumbers)
            await loadSections()
            showToast(t('restaurant.tables.createBatch.success') || 'Tables created successfully', 'success')
        } catch (error) {
            console.error('Failed to create tables batch:', error)
            showToast(t('restaurant.tables.createBatch.error') || 'Failed to create tables', 'error')
        }
    }

    const handleDeleteTable = async (tableId: number) => {
        try {
            await TablesApi.deleteTable(restaurantId, tableId)
            await loadSections()
        } catch (error) {
            console.error('Failed to delete table:', error)
            showToast(t('restaurant.tables.deleteError') || 'Failed to delete table', 'error')
        }
    }

    const handleToggleTableStatus = async (tableId: number) => {
        try {
            await TablesApi.toggleTableStatus(restaurantId, tableId)
            await loadSections()
        } catch (error) {
            console.error('Failed to toggle table status:', error)
            showToast(t('restaurant.tables.toggleError') || 'Failed to toggle table status', 'error')
        }
    }

    const handleExportToGoogleSheets = async (regenerate: boolean = false) => {
        try {
            setIsExporting(true)

            // Показываем Toast что начали процесс
            showToast(
                regenerate
                    ? t('restaurant.tables.googleSheets.regenerateStarted') || 'Regenerating Google Sheet...'
                    : t('restaurant.tables.googleSheets.exportStarted') || 'Exporting to Google Sheets...',
                'info'
            )

            // Делаем запрос (он может быть долгим)
            const result = await TablesApi.exportToGoogleSheets(restaurantId, regenerate)

            // Обновляем URL
            setGoogleSheetUrl(result.sheet_url)

            // Уведомляем родительский компонент
            if (onGoogleSheetUpdate) {
                onGoogleSheetUpdate(result.sheet_url)
            }

            // Показываем Toast об успехе (даже если модалка закрыта)
            showToast(
                regenerate
                    ? t('restaurant.tables.googleSheets.regenerateSuccess') || 'Google Sheet regenerated successfully!'
                    : t('restaurant.tables.googleSheets.exportSuccess') || 'Exported to Google Sheets successfully!',
                'success'
            )
        } catch (error) {
            console.error('Failed to export to Google Sheets:', error)

            // Показываем Toast об ошибке (даже если модалка закрыта)
            showToast(
                regenerate
                    ? t('restaurant.tables.googleSheets.regenerateError') || 'Failed to regenerate Google Sheet'
                    : t('restaurant.tables.googleSheets.exportError') || 'Failed to export to Google Sheets',
                'error'
            )
        } finally {
            setIsExporting(false)
        }
    }

    if (!isOpen) return null

    const totalTables = sections.reduce((sum, section) => sum + (section.tables?.length || 0), 0)

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div
                    className="bg-white rounded-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="table-management-title"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                        <div>
                            <h3 id="table-management-title" className="text-2xl font-bold text-gray-900">
                                {t('restaurant.tables.modal.title')}
                            </h3>
                            <p className="text-gray-600">
                                {t('restaurant.tables.modal.subtitle', {
                                    name: restaurantName,
                                    count: totalTables
                                })}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Google Sheets Export/Open Buttons */}
                            {!googleSheetUrl ? (
                                <button
                                    onClick={() => handleExportToGoogleSheets(false)}
                                    disabled={isExporting || totalTables === 0}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={t('restaurant.tables.googleSheets.export')}
                                >
                                    {isExporting ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                            {t('restaurant.tables.googleSheets.exporting')}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h5v4h-5V5zm0 6h5v4h-5v-4zm-6-6h4v10H6V5zm6 12h5v2h-5v-2zm-6 0h4v2H6v-2z"/>
                                            </svg>
                                            {t('restaurant.tables.googleSheets.export')}
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <a
                                        href={googleSheetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                        aria-label={t('restaurant.tables.googleSheets.openSheet')}
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h5v4h-5V5zm0 6h5v4h-5v-4zm-6-6h4v10H6V5zm6 12h5v2h-5v-2zm-6 0h4v2H6v-2z"/>
                                        </svg>
                                        {t('restaurant.tables.googleSheets.openSheet')}
                                    </a>
                                    <button
                                        onClick={() => handleExportToGoogleSheets(true)}
                                        disabled={isExporting}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={t('restaurant.tables.googleSheets.regenerate')}
                                        aria-label={t('restaurant.tables.googleSheets.regenerate')}
                                    >
                                        {isExporting ? (
                                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowPathIcon className="h-4 w-4" />
                                        )}
                                        {t('restaurant.tables.googleSheets.regenerate')}
                                    </button>
                                </div>
                            )}

                            {/* Add Section Button */}
                            <button
                                onClick={() => setShowCreateSectionModal(true)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition flex items-center gap-2"
                                aria-label={t('restaurant.sections.actions.add')}
                            >
                                <PlusIcon className="h-4 w-4" />
                                {t('restaurant.sections.actions.add')}
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading && sections.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                            </div>
                        ) : sections.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-gray-100">
                                    <PlusIcon className="h-8 w-8 text-gray-600" />
                                </div>
                                <h4 className="text-lg font-medium mb-2 text-gray-900">
                                    {t('restaurant.sections.empty.title')}
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    {t('restaurant.sections.empty.description')}
                                </p>
                                <button
                                    onClick={() => setShowCreateSectionModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    {t('restaurant.sections.actions.createFirst')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sections.map((section) => (
                                    <SectionCard
                                        key={section.id}
                                        section={section}
                                        onDeleteSection={handleDeleteSection}
                                        onCreateTable={handleCreateTable}
                                        onCreateTablesBatch={handleCreateTablesBatch}
                                        onDeleteTable={handleDeleteTable}
                                        onToggleTableStatus={handleToggleTableStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Section Modal */}
            <CreateSectionModal
                isOpen={showCreateSectionModal}
                onClose={() => setShowCreateSectionModal(false)}
                onSubmit={handleCreateSection}
            />
        </>
    )
}