import React, { useState, useEffect } from 'react'
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    QrCodeIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon,
    TableCellsIcon,
} from '@heroicons/react/24/outline'

interface Table {
    id: number;
    table_number: number;
    is_active: boolean;
    table_section: string | null;
    table_design: string | null;
    table_link: string | null;
}

interface TableManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    tables: Table[];
    restaurantId: string;
    restaurantName: string;
}

// Design options with QR code designs (from onboarding)
const qrDesigns = [
    { id: '1', name: 'Classic QR', image: '/images/qr-design-1.png' },
    { id: '2', name: 'Modern QR', image: '/images/qr-design-2.png' },
    { id: '3', name: 'Elegant QR', image: '/images/qr-design-3.png' },
    { id: '4', name: 'The Fourth QR', image: '/images/qr-design-4.png' },
]

const TableManagementModal: React.FC<TableManagementModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       tables,
                                                                       restaurantId,
                                                                       restaurantName,
                                                                   }) => {
    const [localTables, setLocalTables] = useState<Table[]>(tables)
    const [editingTable, setEditingTable] = useState<Table | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(false)

    // Dynamic sections from existing tables + ability to add new
    const [availableSections, setAvailableSections] = useState<string[]>([])
    const [newSectionInput, setNewSectionInput] = useState('')
    const [showNewSectionInput, setShowNewSectionInput] = useState(false)

    // Form state for editing/creating
    const [formData, setFormData] = useState({
        table_number: '',
        table_section: '',
        table_design: '1',
        is_active: true,
    })

    useEffect(() => {
        setLocalTables(tables)

        // Extract unique sections from existing tables
        // @ts-ignore
        const existingSections = [...new Set(
            tables
                .map(table => table.table_section)
                .filter(section => section && section.trim() !== '')
        )]
        setAvailableSections(existingSections)
    }, [tables])

    const handleAddNewSection = () => {
        if (newSectionInput.trim() && !availableSections.includes(newSectionInput.trim())) {
            const newSection = newSectionInput.trim()
            setAvailableSections(prev => [...prev, newSection])
            setFormData(prev => ({ ...prev, table_section: newSection }))
            setNewSectionInput('')
            setShowNewSectionInput(false)
        }
    }

    const handleEditTable = (table: Table) => {
        setEditingTable(table)
        setFormData({
            table_number: table.table_number.toString(),
            table_section: table.table_section || '',
            table_design: table.table_design || '1',
            is_active: table.is_active,
        })
        setIsCreating(false)
    }

    const handleCreateTable = () => {
        setEditingTable(null)
        setFormData({
            table_number: '',
            table_section: '',
            table_design: '1',
            is_active: true,
        })
        setIsCreating(true)
    }

    const handleSaveTable = async () => {
        setLoading(true)

        try {
            // TODO: Replace with actual API calls
            const tableData = {
                table_number: parseInt(formData.table_number),
                table_section: formData.table_section || null,
                table_design: formData.table_design,
                is_active: formData.is_active,
            }

            if (isCreating) {
                // API call to create table
                console.log('Creating table:', tableData)

                // Mock: Add to local state
                const newTable: Table = {
                    id: Date.now(), // Mock ID
                    ...tableData,
                    table_link: null,
                }
                setLocalTables(prev => [...prev, newTable])
            } else if (editingTable) {
                // API call to update table
                console.log('Updating table:', editingTable.id, tableData)

                // Mock: Update local state
                setLocalTables(prev =>
                    prev.map(table =>
                        table.id === editingTable.id
                            ? { ...table, ...tableData }
                            : table
                    )
                )
            }

            setEditingTable(null)
            setIsCreating(false)
        } catch (error) {
            console.error('Error saving table:', error)
            alert('Error saving table. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTable = async (tableId: number) => {
        if (!confirm('Are you sure you want to delete this table?')) return

        setLoading(true)
        try {
            // TODO: Replace with actual API call
            console.log('Deleting table:', tableId)

            // Mock: Remove from local state
            setLocalTables(prev => prev.filter(table => table.id !== tableId))
        } catch (error) {
            console.error('Error deleting table:', error)
            alert('Error deleting table. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateQR = async (tableId: number) => {
        setLoading(true)
        try {
            // TODO: Replace with actual API call
            console.log('Generating QR code for table:', tableId)

            // Mock: Update table with QR link
            const mockQRLink = `https://${restaurantName.toLowerCase().replace(/\s+/g, '-')}.splitty.nl/${Math.random().toString(36).substring(2, 15)}`

            setLocalTables(prev =>
                prev.map(table =>
                    table.id === tableId
                        ? { ...table, table_link: mockQRLink }
                        : table
                )
            )

            alert('QR Code generated successfully!')
        } catch (error) {
            console.error('Error generating QR code:', error)
            alert('Error generating QR code. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleActive = async (tableId: number, currentStatus: boolean) => {
        setLoading(true)
        try {
            // TODO: Replace with actual API call
            console.log('Toggling table status:', tableId, !currentStatus)

            // Mock: Update local state
            setLocalTables(prev =>
                prev.map(table =>
                    table.id === tableId
                        ? { ...table, is_active: !currentStatus }
                        : table
                )
            )
        } catch (error) {
            console.error('Error toggling table status:', error)
            alert('Error updating table status. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
                        <p className="text-gray-600 mt-1">Manage tables and QR codes for {restaurantName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Tables List */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                All Tables ({localTables.length})
                            </h3>
                            <button
                                onClick={handleCreateTable}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Table
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {localTables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`rounded-lg border-2 p-4 transition-all ${
                                        table.is_active
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            {/* Table Design Preview */}
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                                <img
                                                    src={qrDesigns.find(d => d.id === table.table_design)?.image}
                                                    alt="QR design"
                                                    className="w-8 h-8 object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                        e.currentTarget.nextElementSibling.style.display = 'block'
                                                    }}
                                                />
                                                <QrCodeIcon className="w-6 h-6 text-gray-400 hidden" />
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900">Table {table.table_number}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {table.table_section || 'No section'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            table.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                      {table.is_active ? 'Active' : 'Inactive'}
                    </span>
                                    </div>

                                    {/* QR Code Status */}
                                    <div className="mb-4">
                                        {table.table_link ? (
                                            <div className="flex items-center text-sm text-green-600">
                                                <QrCodeIcon className="w-4 h-4 mr-2" />
                                                <span>QR Code Ready</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-sm text-gray-400">
                                                <QrCodeIcon className="w-4 h-4 mr-2" />
                                                <span>No QR Code</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEditTable(table)}
                                            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            <PencilIcon className="w-4 h-4 mx-auto" />
                                        </button>

                                        <button
                                            onClick={() => handleToggleActive(table.id, table.is_active)}
                                            className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                                                table.is_active
                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                            }`}
                                        >
                                            {table.is_active ? (
                                                <EyeSlashIcon className="w-4 h-4 mx-auto" />
                                            ) : (
                                                <EyeIcon className="w-4 h-4 mx-auto" />
                                            )}
                                        </button>

                                        {!table.table_link && (
                                            <button
                                                onClick={() => handleGenerateQR(table.id)}
                                                className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                            >
                                                <ArrowPathIcon className="w-4 h-4 mx-auto" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDeleteTable(table.id)}
                                            className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                        >
                                            <TrashIcon className="w-4 h-4 mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Edit Form Sidebar */}
                    {(editingTable || isCreating) && (
                        <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {isCreating ? 'Create New Table' : 'Edit Table'}
                            </h3>

                            <div className="space-y-4">
                                {/* Table Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Table Number *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.table_number}
                                        onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter table number"
                                    />
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section
                                    </label>
                                    <div className="space-y-2">
                                        <select
                                            value={formData.table_section}
                                            onChange={(e) => setFormData(prev => ({ ...prev, table_section: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Select section</option>
                                            {availableSections.map(section => (
                                                <option key={section} value={section}>{section}</option>
                                            ))}
                                        </select>

                                        {/* Add new section */}
                                        {showNewSectionInput ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newSectionInput}
                                                    onChange={(e) => setNewSectionInput(e.target.value)}
                                                    placeholder="Enter new section name"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewSection()}
                                                />
                                                <button
                                                    onClick={handleAddNewSection}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowNewSectionInput(false)
                                                        setNewSectionInput('')
                                                    }}
                                                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowNewSectionInput(true)}
                                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-green-400 hover:text-green-600 transition text-sm"
                                            >
                                                + Add new section
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* QR Design */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        QR Code Design
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {qrDesigns.map(design => (
                                            <button
                                                key={design.id}
                                                onClick={() => setFormData(prev => ({ ...prev, table_design: design.id }))}
                                                className={`p-3 rounded-lg border-2 transition ${
                                                    formData.table_design === design.id
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={design.image}
                                                    alt={design.name}
                                                    className="w-full h-8 object-contain mb-1"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                        e.currentTarget.nextElementSibling.style.display = 'block'
                                                    }}
                                                />
                                                <QrCodeIcon className="w-8 h-8 text-gray-400 mx-auto mb-1 hidden" />
                                                <p className="text-xs text-gray-600">{design.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                        Active table
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setEditingTable(null)
                                            setIsCreating(false)
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveTable}
                                        disabled={loading || !formData.table_number}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TableManagementModal