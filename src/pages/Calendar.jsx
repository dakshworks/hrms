import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const MOCK_EVENTS = [
  { date: '2026-04-03', title: 'Design review', time: '10 AM', color: 'bg-blue-100 text-blue-800' },
  { date: '2026-04-03', title: 'Sales meeting', time: '2 PM', color: 'bg-gray-100 text-gray-800' },
  { date: '2026-04-07', title: 'Code Review', time: '6 PM', color: 'bg-gray-100 text-gray-800' },
  { date: '2026-04-12', title: 'Sam\'s birthday p...', time: '2 PM', color: 'bg-indigo-600 text-white', dot: true },
  { date: '2026-04-22', title: 'Maple syrup muse...', time: '3 PM', color: 'bg-gray-100 text-gray-800' },
  { date: '2026-04-22', title: 'Hockey game', time: '7 PM', color: 'bg-gray-100 text-gray-800' },
  { date: '2026-05-04', title: 'Cinema with friends', time: '9 PM', color: 'bg-gray-100 text-gray-800' },
]

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026 default for demo
  
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1)
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 0-6 relative to Mon-Sun
    
    // Get last day of month
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    
    // Get days from previous month to pad the first row
    const daysFromPrevMonth = startingDayOfWeek
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    
    const days = []
    
    // Previous Month padding
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i
      const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      days.push({ day: dayNum, dateStr, isCurrentMonth: false })
    }
    
    // Current Month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({ day: i, dateStr, isCurrentMonth: true })
    }
    
    // Next Month padding
    const remainingSlots = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingSlots; i++) {
      const dateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({ day: i, dateStr, isCurrentMonth: false })
    }
    
    return days
  }, [currentDate])

  const goPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Map events to days
  const getEventsForDay = (dateStr) => MOCK_EVENTS.filter(e => e.date === dateStr)

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#1a1a1a]">{monthYearString}</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm">
            <button onClick={goPrevMonth} className="px-3 py-1.5 text-gray-500 hover:text-gray-900 border-r border-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={goToday} className="px-4 py-1.5 text-sm font-medium text-[#1a1a1a] hover:bg-gray-50 transition-colors">
              Today
            </button>
            <button onClick={goNextMonth} className="px-3 py-1.5 text-gray-500 hover:text-gray-900 border-l border-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <select className="bg-white border border-gray-300 text-sm font-medium rounded-md px-3 py-2 outline-none shadow-sm text-[#1a1a1a]">
            <option>Month view</option>
            {/* Week, Day, Year purposefully omitted per plan */}
          </select>
          
          <Link to="/dashboard/events" className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm cursor-pointer">
            Add event
          </Link>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
        {DAYS_OF_WEEK.map((day, i) => (
          <div key={day} className={`py-3 text-center text-xs font-semibold ${i === 4 ? 'text-gray-900 flex items-center justify-center gap-1' : 'text-gray-600'}`}>
            {i === 4 && <span className="w-1 h-1 rounded-full bg-red-500 block"></span>} 
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {calendarGrid.map((dayObj, i) => {
          const events = getEventsForDay(dayObj.dateStr)
          
          return (
            <div 
              key={i} 
              className={`border-b border-r border-gray-200 p-2 min-h-[100px] flex flex-col transition-colors hover:bg-gray-50 group
                ${!dayObj.isCurrentMonth ? 'bg-gray-50' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm flex items-center justify-center font-medium
                  ${events.some(e => e.dot) ? 'bg-indigo-600 text-white w-7 h-7 rounded-full' : 
                    dayObj.isCurrentMonth ? 'text-gray-700 h-7' : 'text-gray-400 h-7'}
                `}>
                  {dayObj.day}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                {events.map((evt, idx) => (
                   <div key={idx} className={`text-xs px-2 py-1 rounded truncate flex justify-between items-center ${evt.color}`}>
                     {evt.dot ? (
                        <div className="w-full flex items-center gap-1 font-medium bg-transparent">
                           <span className="truncate">{evt.title}</span>
                           <span className="ml-auto text-[0.65rem] opacity-80 shrink-0">{evt.time}</span>
                        </div>
                     ) : (
                        <>
                          <span className="truncate flex-1 font-medium bg-transparent">{evt.title}</span>
                          <span className="text-[0.65rem] leading-none opacity-60 ml-2 bg-transparent shrink-0">{evt.time}</span>
                        </>
                     )}
                   </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
      `}} />
    </div>
  )
}
