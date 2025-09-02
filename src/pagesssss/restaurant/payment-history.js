import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
  ChevronLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

export default function PaymentHistory() {
  const router = useRouter()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const paymentsPerPage = 30

  // Generate sample payment data
  useEffect(() => {
    const generatePayments = () => {
      const samplePayments = []
      const statuses = ['paid', 'pending', 'failed']
      const statusLabels = {
        paid: language === 'nl' ? 'Betaald' : 'Paid',
        pending: language === 'nl' ? 'In afwachting' : 'Pending',
        failed: language === 'nl' ? 'Mislukt' : 'Failed'
      }
      
      // Generate 50 sample payments
      for (let i = 1; i <= 50; i++) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 90)) // Random date within last 90 days
        
        const amount = (Math.random() * 200 + 10).toFixed(2)
        const tip = (Math.random() * 20).toFixed(2)
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        samplePayments.push({
          id: 1100 - i,
          tableNumber: Math.floor(Math.random() * 20) + 1,
          amount: parseFloat(amount),
          tip: parseFloat(tip),
          total: parseFloat(amount) + parseFloat(tip),
          status: status,
          statusLabel: statusLabels[status],
          date: date,
          dateString: date.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          timeString: date.toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        })
      }
      
      // Sort by date (most recent first)
      samplePayments.sort((a, b) => b.date - a.date)
      return samplePayments
    }
    
    const data = generatePayments()
    setPayments(data)
    setFilteredPayments(data)
  }, [language])

  // Filter payments based on search and filters
  useEffect(() => {
    let filtered = [...payments]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.id.toString().includes(searchTerm) ||
        payment.tableNumber.toString().includes(searchTerm)
      )
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus)
    }
    
    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date()
      const ranges = {
        today: 0,
        week: 7,
        month: 30,
        quarter: 90
      }
      
      if (ranges[filterDateRange] !== undefined) {
        const daysAgo = new Date()
        daysAgo.setDate(now.getDate() - ranges[filterDateRange])
        filtered = filtered.filter(payment => payment.date >= daysAgo)
      }
    }
    
    setFilteredPayments(filtered)
  }, [searchTerm, filterStatus, filterDateRange, payments])

  const handleExport = () => {
    // Export to CSV functionality
    const csv = [
      ['Payment ID', 'Table', 'Amount', 'Tip', 'Total', 'Status', 'Date', 'Time'].join(','),
      ...filteredPayments.map(payment => 
        [payment.id, payment.tableNumber, payment.amount, payment.tip, payment.total, payment.status, payment.dateString, payment.timeString].join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const navigateToOrder = (orderId) => {
    router.push(`/order/${orderId}`)
  }

  const navigateToPayment = (paymentId) => {
    router.push(`/payment/${paymentId}`)
  }

  // Calculate pagination
  const indexOfLastPayment = currentPage * paymentsPerPage
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment)
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterDateRange])

  return (
    <Layout>
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header - Consistent with dashboard page */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            {language === 'nl' ? 'Terug naar dashboard' : 'Back to dashboard'}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'nl' ? 'Betalingsgeschiedenis' : 'Payment History'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'nl' 
                  ? `${filteredPayments.length} transacties gevonden`
                  : `${filteredPayments.length} transactions found`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {language === 'nl' ? 'Exporteer' : 'Export'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'nl' ? 'Zoek betaling...' : 'Search payments...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <FunnelIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                {language === 'nl' ? 'Filters' : 'Filters'}
                {(filterStatus !== 'all' || filterDateRange !== 'all') && (
                  <span className="ml-1.5 bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                    {[filterStatus !== 'all', filterDateRange !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'nl' ? 'Status' : 'Status'}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">{language === 'nl' ? 'Alle' : 'All'}</option>
                  <option value="paid">{language === 'nl' ? 'Betaald' : 'Paid'}</option>
                  <option value="pending">{language === 'nl' ? 'In afwachting' : 'Pending'}</option>
                  <option value="failed">{language === 'nl' ? 'Mislukt' : 'Failed'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'nl' ? 'Periode' : 'Period'}
                </label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">{language === 'nl' ? 'Alle' : 'All'}</option>
                  <option value="today">{language === 'nl' ? 'Vandaag' : 'Today'}</option>
                  <option value="week">{language === 'nl' ? 'Deze week' : 'This week'}</option>
                  <option value="month">{language === 'nl' ? 'Deze maand' : 'This month'}</option>
                  <option value="quarter">{language === 'nl' ? 'Dit kwartaal' : 'This quarter'}</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Payments Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'nl' ? 'Betaling' : 'Payment'}
                    </th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider hidden min-[400px]:table-cell">
                      {language === 'nl' ? 'Tafel' : 'Table'}
                    </th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'nl' ? 'Bedrag' : 'Amount'}
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {language === 'nl' ? 'Datum' : 'Date'}
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      {language === 'nl' ? 'Acties' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentPayments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                        {language === 'nl' ? 'Geen betalingen gevonden' : 'No payments found'}
                      </td>
                    </tr>
                  ) : (
                    currentPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 whitespace-nowrap text-[11px] xs:text-xs sm:text-sm font-medium text-gray-900">
                          <span className="hidden xs:inline">#</span>{payment.id}
                        </td>
                        <td className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 whitespace-nowrap text-[11px] xs:text-xs sm:text-sm text-gray-500 hidden min-[400px]:table-cell">
                          {payment.tableNumber}
                        </td>
                        <td className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 whitespace-nowrap">
                          <div>
                            <p className="text-[11px] xs:text-xs sm:text-sm font-medium text-gray-900">
                              €{payment.total.toFixed(2)}
                            </p>
                            <p className="text-[10px] xs:text-xs text-gray-500 hidden xs:block">
                              {language === 'nl' ? 'Fooi' : 'Tip'}: €{payment.tip.toFixed(2)}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-green-50 text-green-700' :
                            payment.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {payment.statusLabel}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 whitespace-nowrap text-xs text-gray-500 hidden md:table-cell">
                          {payment.dateString}, {payment.timeString}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 whitespace-nowrap text-sm hidden lg:table-cell">
                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => navigateToOrder(Math.floor(Math.random() * 100))}
                              className="font-medium text-xs text-green-600 hover:text-green-700"
                            >
                              Order
                            </button>
                            <span className="text-gray-300 text-xs">|</span>
                            <button
                              onClick={() => navigateToPayment(payment.id)}
                              className="font-medium text-xs text-green-600 hover:text-green-700"
                            >
                              {language === 'nl' ? 'Betaling' : 'Payment'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {language === 'nl' 
                      ? `${indexOfFirstPayment + 1}-${Math.min(indexOfLastPayment, filteredPayments.length)} van ${filteredPayments.length} resultaten`
                      : `Showing ${indexOfFirstPayment + 1}-${Math.min(indexOfLastPayment, filteredPayments.length)} of ${filteredPayments.length} results`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {language === 'nl' ? 'Vorige' : 'Previous'}
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = idx + 1
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx
                        } else {
                          pageNum = currentPage - 2 + idx
                        }
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-1 text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {language === 'nl' ? 'Volgende' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </Layout>
  )
}