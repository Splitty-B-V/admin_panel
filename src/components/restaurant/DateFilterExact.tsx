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
    if (selectedFilter === 'lastWeek') return t('dateFilter.lastWeek')
    if (selectedFilter === 'lastMonth') return t('dateFilter.lastMonth')
    if (selectedFilter === 'lastQuarter') return t('dateFilter.lastQuarter')
    if (selectedFilter === 'lastYear') return t('dateFilter.lastYear')
    if (selectedFilter === 'weekToDate') return t('dateFilter.weekToDate')
    if (selectedFilter === 'monthToDate') return t('dateFilter.monthToDate')
    if (selectedFilter === 'quarterToDate') return t('dateFilter.quarterToDate')
    if (selectedFilter === 'yearToDate') return t('dateFilter.yearToDate')

    if (selectedFilter === 'custom' && customDateRange.start) {
      const startDate = new Date(customDateRange.start)
      const endDate = customDateRange.end ? new Date(customDateRange.end) : startDate

      if (startDate.toDateString() === endDate.toDateString()) {
        return startDate.toLocaleDateString('nl-NL')
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

        {showDatePicker && (
            <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50" style={{width: '600px', maxHeight: '400px'}}>
              <div className="flex h-full">
                <div className="w-40 border-r border-gray-200 bg-gray-50 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-2">
                    <button
                        onClick={() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          setSelectedDateRange({ start: today, end: today })
                          setTempDateFilter('today')
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                            tempDateFilter === 'today' ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    >
                      {t('dateFilter.today')}
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
                            tempDateFilter === 'yesterday' ? 'bg-white text-emerald-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    >
                      {t('dateFilter.yesterday')}
                    </button>
                  </div>

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