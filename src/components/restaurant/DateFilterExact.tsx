'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface DateRange {
  start: string | null
  end: string | null
}

interface DateFilterExactProps {
  selectedFilter: string
  onFilterChange: (filter: string, dateRange?: DateRange) => void
}

export default function DateFilterExact({ selectedFilter, onFilterChange }: DateFilterExactProps) {
  const { t, locale } = useLanguage()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDateFilter, setTempDateFilter] = useState<string | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
  const [calendarView, setCalendarView] = useState(new Date())
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ start: null, end: null })
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
        setTempDateFilter(null)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(startDate.getDate() - daysToSubtract)

    const days: Date[] = []
    const currentDate = new Date(startDate)
    while (currentDate <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    while (days.length < 42) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const isInCurrentMonth = (date: Date, monthDate: Date) => {
    return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date: Date) => {
    if (!selectedDateRange.start) return false

    if (!selectedDateRange.end) {
      return date.toDateString() === selectedDateRange.start.toDateString()
    }

    return date >= selectedDateRange.start && date <= selectedDateRange.end
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDateSelect = (date: Date) => {
    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      setSelectedDateRange({ start: date, end: null })
    } else {
      if (date < selectedDateRange.start) {
        setSelectedDateRange({ start: date, end: selectedDateRange.start })
      } else {
        setSelectedDateRange({ start: selectedDateRange.start, end: date })
      }
    }
    setTempDateFilter('custom')
  }

  const getFilterLabel = () => {
    if (selectedFilter === 'today') return t('dateFilter.today')
    if (selectedFilter === 'yesterday') return t('dateFilter.yesterday')
    if (selectedFilter === 'last7days') return t('time.lastWeek') || 'Afgelopen 7 dagen'
    if (selectedFilter === 'last30days') return t('time.lastMonth') || 'Afgelopen 30 dagen'
    if (selectedFilter === 'last90days') return t('dateFilter.lastQuarter') || 'Afgelopen 90 dagen'
    if (selectedFilter === 'last365days') return t('dateFilter.lastYear') || 'Afgelopen 365 dagen'
    if (selectedFilter === 'lastWeek') return t('dateFilter.lastWeek')
    if (selectedFilter === 'lastMonth') return t('dateFilter.lastMonth')
    if (selectedFilter === 'lastQuarter') return t('dateFilter.lastQuarter')
    if (selectedFilter === 'lastYear') return t('dateFilter.lastYear')
    if (selectedFilter === 'weekToDate') return t('dateFilter.weekToDate')
    if (selectedFilter === 'monthToDate') return t('dateFilter.monthToDate')
    if (selectedFilter === 'quarterToDate') return t('dateFilter.quarterToDate')
    if (selectedFilter === 'yearToDate') return t('dateFilter.yearToDate')

    if (selectedFilter === 'custom' && customDateRange.start) {
      const startDate = typeof customDateRange.start === 'string'
          ? new Date(...(customDateRange.start.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)) as [number, number, number]))
          : new Date(customDateRange.start)

      let endDate = null
      if (customDateRange.end) {
        endDate = typeof customDateRange.end === 'string'
            ? new Date(...(customDateRange.end.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)) as [number, number, number]))
            : new Date(customDateRange.end)
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      startDate.setHours(0, 0, 0, 0)

      if (!endDate || customDateRange.start === customDateRange.end) {
        return startDate.getTime() === today.getTime() ? t('dateFilter.today') : startDate.toLocaleDateString(locale === 'en' ? 'en-US' : 'nl-NL')
      } else {
        return `${startDate.toLocaleDateString('nl-NL')} - ${endDate.toLocaleDateString('nl-NL')}`
      }
    }

    return t('dateFilter.today')
  }

  return (
      <div className="relative" ref={datePickerRef}>
        <button
            onClick={() => {
              if (!showDatePicker) {
                setTempDateFilter(selectedFilter)

                if (selectedFilter === 'today') {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  setSelectedDateRange({ start: today, end: today })
                } else if (selectedFilter === 'yesterday') {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  yesterday.setHours(0, 0, 0, 0)
                  setSelectedDateRange({ start: yesterday, end: yesterday })
                } else if (selectedFilter === 'custom' && customDateRange.start) {
                  const startDate = typeof customDateRange.start === 'string'
                      ? new Date(...(customDateRange.start.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)) as [number, number, number]))
                      : new Date(customDateRange.start)
                  const endDate = customDateRange.end
                      ? (typeof customDateRange.end === 'string'
                          ? new Date(...(customDateRange.end.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)) as [number, number, number]))
                          : new Date(customDateRange.end))
                      : startDate
                  setSelectedDateRange({ start: startDate, end: endDate })
                } else {
                  setSelectedDateRange({ start: null, end: null })
                }
              }
              setShowDatePicker(!showDatePicker)
            }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all flex items-center gap-2 text-sm"
        >
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">{getFilterLabel()}</span>
        </button>

        {/* Professional Dropdown Menu */}
        {showDatePicker && (
            <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50" style={{width: '600px', maxHeight: '400px'}}>
              <div className="flex h-full" style={{maxHeight: '400px'}}>
                {/* Left Sidebar with Options */}
                <div className="w-40 border-r border-gray-200 bg-gray-50 flex flex-col" style={{maxHeight: '400px'}}>
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {/* Quick Options */}
                    <div className="p-2">
                      <button
                          onClick={() => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start: today, end: today })
                            setTempDateFilter('today')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                              (tempDateFilter ? tempDateFilter === 'today' : selectedFilter === 'today') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.today')}
                        {selectedFilter === 'today' && (
                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                      </button>
                      <button
                          onClick={() => {
                            const yesterday = new Date()
                            yesterday.setDate(yesterday.getDate() - 1)
                            yesterday.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start: yesterday, end: yesterday })
                            setTempDateFilter('yesterday')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'yesterday' : selectedFilter === 'yesterday') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.yesterday')}
                      </button>
                    </div>

                    <div className="border-t border-gray-200 mx-2"></div>

                    {/* Period Options */}
                    <div className="p-2">
                      <button
                          onClick={() => {
                            const today = new Date()
                            const start = new Date()
                            const dayOfWeek = today.getDay()
                            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                            start.setDate(today.getDate() - daysToSubtract - 7)
                            const end = new Date(start)
                            end.setDate(start.getDate() + 6)
                            start.setHours(0, 0, 0, 0)
                            end.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end })
                            setTempDateFilter('lastWeek')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'lastWeek' : selectedFilter === 'lastWeek') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.lastWeek')}
                      </button>
                      <button
                          onClick={() => {
                            const today = new Date()
                            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                            const end = new Date(today.getFullYear(), today.getMonth(), 0)
                            start.setHours(0, 0, 0, 0)
                            end.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end })
                            setTempDateFilter('lastMonth')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'lastMonth' : selectedFilter === 'lastMonth') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.lastMonth')}
                      </button>
                      <button
                          onClick={() => {
                            const today = new Date()
                            const quarter = Math.floor(today.getMonth() / 3)
                            const start = new Date(today.getFullYear(), (quarter - 1) * 3, 1)
                            const end = new Date(today.getFullYear(), quarter * 3, 0)
                            start.setHours(0, 0, 0, 0)
                            end.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end })
                            setTempDateFilter('lastQuarter')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'lastQuarter' : selectedFilter === 'lastQuarter') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.lastQuarter')}
                      </button>
                      <button
                          onClick={() => {
                            const today = new Date()
                            const start = new Date(today.getFullYear() - 1, 0, 1)
                            const end = new Date(today.getFullYear() - 1, 11, 31)
                            start.setHours(0, 0, 0, 0)
                            end.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end })
                            setTempDateFilter('lastYear')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'lastYear' : selectedFilter === 'lastYear') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.lastYear')}
                      </button>
                    </div>

                    <div className="border-t border-gray-200 mx-2"></div>

                    {/* To Date Options */}
                    <div className="p-2">
                      <button
                          onClick={() => {
                            const today = new Date()
                            const start = new Date()
                            const dayOfWeek = today.getDay()
                            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                            start.setDate(today.getDate() - daysToSubtract)
                            start.setHours(0, 0, 0, 0)
                            today.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end: today })
                            setTempDateFilter('weekToDate')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'weekToDate' : selectedFilter === 'weekToDate') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.weekToDate')}
                      </button>
                      <button
                          onClick={() => {
                            const today = new Date()
                            const start = new Date(today.getFullYear(), today.getMonth(), 1)
                            start.setHours(0, 0, 0, 0)
                            today.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end: today })
                            setTempDateFilter('monthToDate')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'monthToDate' : selectedFilter === 'monthToDate') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.monthToDate')}
                      </button>
                      <button
                          onClick={() => {
                            const today = new Date()
                            const quarter = Math.floor(today.getMonth() / 3)
                            const start = new Date(today.getFullYear(), quarter * 3, 1)
                            start.setHours(0, 0, 0, 0)
                            today.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end: today })
                            setTempDateFilter('quarterToDate')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'quarterToDate' : selectedFilter === 'quarterToDate') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.quarterToDate')}
                      </button>
                      <button
                          onClick={() => {
                            const today = new Date()
                            const start = new Date(today.getFullYear(), 0, 1)
                            start.setHours(0, 0, 0, 0)
                            today.setHours(0, 0, 0, 0)
                            setSelectedDateRange({ start, end: today })
                            setTempDateFilter('yearToDate')
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              (tempDateFilter ? tempDateFilter === 'yearToDate' : selectedFilter === 'yearToDate') ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        {t('dateFilter.yearToDate')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Calendar and Date Inputs */}
                <div className="flex-1 overflow-y-auto" style={{maxHeight: '400px'}}>
                  <div className="p-4 space-y-4">
                    {/* Date Range Inputs */}
                    <div className="grid grid-cols-5 gap-2 items-end">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">{t('dateFilter.from')}</label>
                        <input
                            type="text"
                            placeholder={t('dateFilter.dateFormat')}
                            value={selectedDateRange.start ? selectedDateRange.start.toLocaleDateString('nl-NL') : ''}
                            onChange={(e) => {
                              const parts = e.target.value.split('-')
                              if (parts.length === 3) {
                                const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
                                if (!isNaN(date.getTime())) {
                                  setSelectedDateRange({...selectedDateRange, start: date})
                                  setTempDateFilter('custom')
                                }
                              }
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        />
                      </div>
                      <div className="flex justify-center pb-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">{t('dateFilter.to')}</label>
                        <input
                            type="text"
                            placeholder={t('dateFilter.dateFormat')}
                            value={selectedDateRange.end ? selectedDateRange.end.toLocaleDateString('nl-NL') : (selectedDateRange.start && !selectedDateRange.end ? selectedDateRange.start.toLocaleDateString('nl-NL') : '')}
                            onChange={(e) => {
                              const parts = e.target.value.split('-')
                              if (parts.length === 3) {
                                const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
                                if (!isNaN(date.getTime())) {
                                  setSelectedDateRange({...selectedDateRange, end: date})
                                  setTempDateFilter('custom')
                                }
                              }
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Full Calendar */}
                    <div>
                      {/* Calendar Header with Navigation */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => {
                              const newDate = new Date(calendarView)
                              newDate.setMonth(newDate.getMonth() - 1)
                              setCalendarView(newDate)
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div className="flex-1 flex justify-between px-8">
                          <div className="text-left">
                            <h3 className="text-xs font-semibold text-gray-700 capitalize">
                              {new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1).toLocaleDateString(locale === 'en' ? 'en-US' : 'nl-NL', { month: 'long', year: 'numeric' })}
                            </h3>
                          </div>
                          <div className="text-right">
                            <h3 className="text-xs font-bold text-gray-900 capitalize">
                              {calendarView.toLocaleDateString(locale === 'en' ? 'en-US' : 'nl-NL', { month: 'long', year: 'numeric' })}
                            </h3>
                          </div>
                        </div>

                        <button
                            onClick={() => {
                              const newDate = new Date(calendarView)
                              newDate.setMonth(newDate.getMonth() + 1)
                              setCalendarView(newDate)
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Two Month Calendar Grid */}
                      <div className="flex gap-3">
                        {/* Previous Month */}
                        <div className="flex-1">
                          <table className="w-full">
                            <thead>
                            <tr className="text-[10px] text-gray-500">
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.mon')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.tue')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.wed')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.thu')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.fri')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.sat')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.sun')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[0, 1, 2, 3, 4, 5].map((weekIndex) => {
                              const prevMonth = new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1)
                              const days = generateCalendarDays(prevMonth)
                              const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7)

                              return (
                                  <tr key={weekIndex}>
                                    {weekDays.map((day, dayIndex) => {
                                      const inMonth = isInCurrentMonth(day, prevMonth)
                                      const today = isToday(day)
                                      const selected = isSelected(day)

                                      return (
                                          <td key={dayIndex} className="p-0.5">
                                            {inMonth ? (
                                                <button
                                                    onClick={() => handleDateSelect(day)}
                                                    className={`w-6 h-6 text-[10px] rounded transition-all ${
                                                        selected ? 'bg-emerald-100 text-emerald-700 font-medium' :
                                                            'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                  {day.getDate()}
                                                </button>
                                            ) : (
                                                <div className="w-6 h-6"></div>
                                            )}
                                          </td>
                                      )
                                    })}
                                  </tr>
                              )
                            })}
                            </tbody>
                          </table>
                        </div>

                        {/* Current Month */}
                        <div className="flex-1">
                          <table className="w-full">
                            <thead>
                            <tr className="text-[10px] text-gray-500">
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.mon')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.tue')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.wed')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.thu')}</th>
                              <th className="pb-1 font-normal">{t('dateFilter.weekDays.fri')}</th>
                              <th className="pb-1 font-bold text-gray-700">{t('dateFilter.weekDays.sat')}</th>
                              <th className="pb-1 font-bold text-gray-700">{t('dateFilter.weekDays.sun')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[0, 1, 2, 3, 4, 5].map((weekIndex) => {
                              const days = generateCalendarDays(calendarView)
                              const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7)

                              return (
                                  <tr key={weekIndex}>
                                    {weekDays.map((day, dayIndex) => {
                                      const inMonth = isInCurrentMonth(day, calendarView)
                                      const today = isToday(day)
                                      const selected = isSelected(day)
                                      const futureDate = day > new Date()

                                      return (
                                          <td key={dayIndex} className="p-0.5">
                                            {inMonth ? (
                                                <button
                                                    onClick={() => handleDateSelect(day)}
                                                    className={`w-6 h-6 text-[10px] rounded transition-all ${
                                                        futureDate ? 'text-gray-300 cursor-not-allowed' :
                                                            selected ? 'bg-emerald-100 text-emerald-700 font-medium' :
                                                                'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                    disabled={futureDate}
                                                >
                                                  {day.getDate()}
                                                </button>
                                            ) : (
                                                <div className="w-6 h-6"></div>
                                            )}
                                          </td>
                                      )
                                    })}
                                  </tr>
                              )
                            })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Apply/Cancel Buttons - Fixed at bottom */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                          onClick={() => {
                            setSelectedDateRange({ start: null, end: null })
                            setShowDatePicker(false)
                            setTempDateFilter(null)
                          }}
                          className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      >
                        {t('dateFilter.cancel')}
                      </button>
                      <button
                          onClick={() => {
                            if (tempDateFilter) {
                              if (tempDateFilter === 'custom' && selectedDateRange.start) {
                                const dateRange = {
                                  start: formatDateForInput(selectedDateRange.start),
                                  end: formatDateForInput(selectedDateRange.end || selectedDateRange.start)
                                }
                                onFilterChange(tempDateFilter, dateRange)
                                setCustomDateRange(dateRange)
                              } else {
                                onFilterChange(tempDateFilter)
                              }
                            }
                            setShowDatePicker(false)
                            setTempDateFilter(null)
                          }}
                          className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                      >
                        {t('dateFilter.apply')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}