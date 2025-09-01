import { useState, useEffect, useRef } from 'react'
import { CalendarIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const dateOptions = [
  { id: 'today', label: 'Vandaag', group: 'quick' },
  { id: 'yesterday', label: 'Gisteren', group: 'quick' },
  { id: 'last7', label: 'Afgelopen 7 dagen', group: 'relative' },
  { id: 'last30', label: 'Afgelopen 30 dagen', group: 'relative' },
  { id: 'last90', label: 'Afgelopen 90 dagen', group: 'relative' },
  { id: 'last365', label: 'Afgelopen 365 dagen', group: 'relative' },
  { id: 'lastWeek', label: 'Afgelopen week', group: 'period' },
  { id: 'lastMonth', label: 'Afgelopen maand', group: 'period' },
  { id: 'lastQuarter', label: 'Afgelopen kwartaal', group: 'period' },
  { id: 'lastYear', label: 'Afgelopen jaar', group: 'period' },
  { id: 'weekToDate', label: 'Week tot nu', group: 'todate' },
  { id: 'monthToDate', label: 'Maand tot nu', group: 'todate' },
  { id: 'quarterToDate', label: 'Kwartaal tot nu', group: 'todate' },
  { id: 'yearToDate', label: 'Jaar tot nu', group: 'todate' },
]

export default function DateFilter({ selectedFilter, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [fromDate, setFromDate] = useState('12-8-2025')
  const [toDate, setToDate] = useState('12-8-2025')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getFilterLabel = () => {
    const option = dateOptions.find(opt => opt.id === selectedFilter)
    return option ? option.label : 'Vandaag'
  }

  const handleOptionClick = (optionId) => {
    onFilterChange(optionId)
    setIsOpen(false)
  }

  const renderCalendar = (month, year, isCurrentMonth = false) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    const today = new Date()
    const currentDate = today.getDate()
    
    const days = []
    const weeks = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    // Group days into weeks
    while (days.length > 0) {
      weeks.push(days.splice(0, 7))
    }
    
    // Ensure last week has 7 cells
    if (weeks[weeks.length - 1].length < 7) {
      const lastWeek = weeks[weeks.length - 1]
      while (lastWeek.length < 7) {
        lastWeek.push(null)
      }
    }

    return (
      <table className="w-full">
        <thead>
          <tr className="text-[10px] text-gray-500">
            <th className="pb-1 font-normal">ma</th>
            <th className="pb-1 font-normal">di</th>
            <th className="pb-1 font-normal">wo</th>
            <th className="pb-1 font-normal">do</th>
            <th className="pb-1 font-normal">vr</th>
            <th className={`pb-1 ${isCurrentMonth ? 'font-bold text-gray-700' : 'font-normal'}`}>za</th>
            <th className={`pb-1 ${isCurrentMonth ? 'font-bold text-gray-700' : 'font-normal'}`}>zo</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => (
                <td key={dayIndex} className="p-0.5">
                  {day ? (
                    <button
                      className={`w-6 h-6 text-[10px] rounded transition-all ${
                        isCurrentMonth && day === currentDate
                          ? 'bg-emerald-100 text-emerald-700 font-medium'
                          : isCurrentMonth && day > currentDate
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      disabled={isCurrentMonth && day > currentDate}
                    >
                      {day}
                    </button>
                  ) : (
                    <div className="w-6 h-6"></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all flex items-center gap-2 text-sm"
      >
        <CalendarIcon className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700 font-medium">{getFilterLabel()}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
          style={{ width: '600px', maxHeight: '400px' }}
        >
          <div className="flex h-full" style={{ maxHeight: '400px' }}>
            {/* Left sidebar with options */}
            <div className="w-40 border-r border-gray-200 bg-gray-50 flex flex-col" style={{ maxHeight: '400px' }}>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {/* Quick options */}
                <div className="p-2">
                  {dateOptions.filter(opt => opt.group === 'quick').map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                        selectedFilter === option.id
                          ? 'bg-white text-emerald-700 font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {option.label}
                      {selectedFilter === option.id && (
                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-200 mx-2"></div>

                {/* Relative date options */}
                <div className="p-2">
                  {dateOptions.filter(opt => opt.group === 'relative').map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        selectedFilter === option.id
                          ? 'bg-white text-emerald-700 font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-200 mx-2"></div>

                {/* Period options */}
                <div className="p-2">
                  {dateOptions.filter(opt => opt.group === 'period').map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        selectedFilter === option.id
                          ? 'bg-white text-emerald-700 font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-200 mx-2"></div>

                {/* To date options */}
                <div className="p-2">
                  {dateOptions.filter(opt => opt.group === 'todate').map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        selectedFilter === option.id
                          ? 'bg-white text-emerald-700 font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side with calendar */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
              <div className="p-4 space-y-4">
                {/* Date inputs */}
                <div className="grid grid-cols-5 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Van</label>
                    <input
                      type="text"
                      placeholder="DD-MM-JJJJ"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <div className="flex justify-center pb-1.5">
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Tot</label>
                    <input
                      type="text"
                      placeholder="DD-MM-JJJJ"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>

                {/* Calendar navigation */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex-1 flex justify-between px-8">
                      <div className="text-left">
                        <h3 className="text-xs font-semibold text-gray-700 capitalize">juli 2025</h3>
                      </div>
                      <div className="text-right">
                        <h3 className="text-xs font-bold text-gray-900 capitalize">augustus 2025</h3>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Calendars */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      {renderCalendar(6, 2025)} {/* July 2025 */}
                    </div>
                    <div className="flex-1">
                      {renderCalendar(7, 2025, true)} {/* August 2025 */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                  >
                    Toepassen
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