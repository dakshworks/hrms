import { useState, useMemo, useEffect } from 'react'
import { checkIn, checkOut, getMyAttendance, getCheckInStatus, transformPagination } from '../api/attendance.api'
import { toast } from 'react-toastify'

export default function Attendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0) // Zero-indexed for Spring Page
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [attendanceData, setAttendanceData] = useState(null)
  const [pagination, setPagination] = useState(null)

  // Load check-in status on mount
  useEffect(() => {
    loadCheckInStatus()
    loadAttendanceHistory()
  }, [])

  useEffect(() => {
    loadAttendanceHistory()
  }, [currentPage, recordsPerPage])

  const loadCheckInStatus = async () => {
    try {
      const status = await getCheckInStatus()
      setIsCheckedIn(status.isCheckedIn)
      setCheckInTime(status.checkInTime)
    } catch (error) {
      console.error('Failed to load check-in status:', error)
      // Endpoint might not exist yet, use fallback
    }
  }

  const loadAttendanceHistory = async () => {
    setLoading(true)
    try {
      const response = await getMyAttendance(currentPage, recordsPerPage, 'date')
      setAttendanceData(response.content)
      setPagination(transformPagination(response))
    } catch (error) {
      console.error('Failed to load attendance history:', error)
      toast.error('Failed to load attendance history')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckInOut = async () => {
    setLoading(true)
    try {
      if (isCheckedIn) {
        await checkOut()
        setIsCheckedIn(false)
        setCheckInTime(null)
        toast.success('Checked out successfully')
      } else {
        const today = new Date().toISOString().split('T')[0]
        const response = await checkIn(today)
        setIsCheckedIn(true)
        setCheckInTime(response.checkIn)
        toast.success('Checked in successfully')
      }
      // Reload attendance history
      loadAttendanceHistory()
    } catch (error) {
      console.error('Check-in/out failed:', error)
      toast.error('Check-in/out failed')
    } finally {
      setLoading(false)
    }
  }

  // Calculate Average Hours (Excluding Holidays/Zero days)
  const averageHours = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return 0
    const validDays = attendanceData.filter(d => d.checkIn && d.checkOut)
    if (validDays.length === 0) return 0
    
    let totalHours = 0
    validDays.forEach(day => {
      if (day.checkIn && day.checkOut) {
        const checkIn = new Date(`2000-01-01T${day.checkIn}`)
        const checkOut = new Date(`2000-01-01T${day.checkOut}`)
        const hours = (checkOut - checkIn) / (1000 * 60 * 60)
        totalHours += hours
      }
    })
    return (totalHours / validDays.length).toFixed(1)
  }, [attendanceData])

  const totalPages = pagination?.totalPages || 0

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0d1f3c]">Attendance Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your daily check-ins and monitor your working hours.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Action Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center shadow-sm text-center">
            <h2 className="text-lg font-semibold text-[#0d1f3c] mb-2">{isCheckedIn ? "You are Checked In" : "Ready to Start?"}</h2>
            <p className="text-sm text-gray-500 mb-6 h-5">
                {isCheckedIn ? `Since ${checkInTime}` : 'Check in to start counting your hours.'}
            </p>
            
            <button 
                onClick={handleCheckInOut}
                disabled={loading}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-[6px] transition-all cursor-pointer shadow-lg active:scale-95
                    ${isCheckedIn 
                        ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20Z" />
                    {isCheckedIn ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                    )}
                </svg>
                <span className="text-xl font-bold tracking-wide uppercase">
                    {loading ? '...' : (isCheckedIn ? "Check Out" : "Check In")}
                </span>
            </button>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col justify-center shadow-sm md:col-span-1 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Metrics Summary</h2>
            <div className="grid grid-cols-2 gap-8 mt-4">
                <div>
                    <h3 className="text-4xl font-bold text-[#1565c0] leading-none mb-2">{averageHours} <span className="text-xl text-gray-400 font-medium">hrs</span></h3>
                    <p className="text-sm text-gray-600">Average Working Hours / Day</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-green-600 leading-none mb-2">{attendanceData?.filter(d => d.checkIn && d.checkOut).length || 0}</h3>
                    <p className="text-sm text-gray-600">Total Working Days (Current Month)</p>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg max-w-fit font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Weekends are automatically excluded from working hour averages.
                </div>
            </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#f8f9fb]">
            <h2 className="text-lg font-semibold text-[#0d1f3c]">Attendance History</h2>
        </div>
        
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase text-xs tracking-wider">Date</th>
                        <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase text-xs tracking-wider">In Time</th>
                        <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase text-xs tracking-wider">Out Time</th>
                        <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase text-xs tracking-wider">Total Hours</th>
                        <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                        </tr>
                    ) : attendanceData?.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No attendance records found</td>
                        </tr>
                    ) : attendanceData?.map((record) => {
                        const formatDate = (dateStr) => {
                            const date = new Date(dateStr)
                            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        }
                        const formatTime = (timeStr) => {
                            if (!timeStr) return '-'
                            const [hours, minutes, seconds] = timeStr.split(':')
                            const date = new Date()
                            date.setHours(hours, minutes, seconds || 0)
                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                        const calculateHours = (checkIn, checkOut) => {
                            if (!checkIn || !checkOut) return 0
                            const inDate = new Date(`2000-01-01T${checkIn}`)
                            const outDate = new Date(`2000-01-01T${checkOut}`)
                            return ((outDate - inDate) / (1000 * 60 * 60)).toFixed(1)
                        }
                        const hours = calculateHours(record.checkIn, record.checkOut)
                        return (
                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-[#0d1f3c] font-medium">{formatDate(record.date)}</td>
                            <td className="px-6 py-4 text-gray-600">{formatTime(record.checkIn)}</td>
                            <td className="px-6 py-4 text-gray-600">{formatTime(record.checkOut)}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{hours > 0 ? `${hours}h` : '-'}</td>
                            <td className="px-6 py-4">
                                {record.checkIn && record.checkOut ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        Present
                                    </span>
                                ) : record.checkIn ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Checked In
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        -
                                    </span>
                                )}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>

        {/* Custom Pagination Footer */}
        {pagination && (
            <div className="flex items-center justify-between text-[15px] font-medium text-gray-700 bg-white border-t border-gray-200 px-6 py-3.5">
                <div className="flex items-center gap-3 relative">
                    <span className="text-[#1565c0]">Records per page:</span>
                    <select 
                        value={recordsPerPage}
                        onChange={(e) => {
                            setRecordsPerPage(Number(e.target.value))
                            setCurrentPage(0)
                        }}
                        className="border border-gray-300 rounded text-gray-700 px-2.5 py-1.5 outline-none hover:border-gray-400 focus:border-[#1565c0] cursor-pointer appearance-none pr-8 bg-transparent z-10 text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <div className="flex items-center gap-4 text-xl">
                        <button 
                            onClick={() => setCurrentPage(0)}
                            disabled={currentPage === 0}
                            className="text-gray-300 hover:text-gray-900 disabled:opacity-50 disabled:hover:text-gray-300 transition-colors"
                            aria-label="First page"
                        >
                            |&lt;
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="text-gray-300 hover:text-gray-900 disabled:opacity-50 disabled:hover:text-gray-300 transition-colors"
                            aria-label="Previous page"
                        >
                            &lt;
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="text-gray-500 hover:text-gray-900 disabled:text-gray-300 transition-colors"
                            aria-label="Next page"
                        >
                            &gt;
                        </button>
                        <button 
                            onClick={() => setCurrentPage(totalPages - 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="text-gray-500 hover:text-gray-900 disabled:text-gray-300 transition-colors"
                            aria-label="Last page"
                        >
                            &gt;|
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}
