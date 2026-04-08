import { useState, useEffect } from 'react'
import { getBalances, applyLeave, applyWFH, getMyLeaves, getMyWFH, cancelLeave, transformPagination } from '../api/leave.api'
import { toast } from 'react-toastify'

export default function TimeOff() {
  const [activeTab, setActiveTab] = useState('leave')
  
  // Balances
  const [leaveBalance, setLeaveBalance] = useState(0)
  const [wfhBalance, setWfhBalance] = useState(0)
  const [loadingBalances, setLoadingBalances] = useState(true)

  // History state
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Form State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [pagination, setPagination] = useState(null)

  // Load balances on mount
  useEffect(() => {
    loadBalances()
  }, [])

  // Load history when tab or pagination changes
  useEffect(() => {
    loadHistory()
  }, [activeTab, currentPage, recordsPerPage])

  const loadBalances = async () => {
    setLoadingBalances(true)
    try {
      const balances = await getBalances()
      setLeaveBalance(balances.leaveBalance)
      setWfhBalance(balances.wfhBalance)
    } catch (error) {
      console.error('Failed to load balances:', error)
      // Endpoint might not exist yet, use fallback values
      setLeaveBalance(12)
      setWfhBalance(8)
    } finally {
      setLoadingBalances(false)
    }
  }

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      let response
      if (activeTab === 'leave') {
        response = await getMyLeaves(currentPage, recordsPerPage)
      } else {
        response = await getMyWFH(currentPage, recordsPerPage)
      }
      setHistory(response.content)
      setPagination(transformPagination(response))
    } catch (error) {
      console.error('Failed to load history:', error)
      toast.error('Failed to load history')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason) return

    // Calculate duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)

    // Check Balance
    if (activeTab === 'leave') {
      if (duration > leaveBalance) {
        toast.error('Not enough leave balance')
        return
      }
    } else {
      if (duration > wfhBalance) {
        toast.error('Not enough WFH balance')
        return
      }
    }

    setSubmitting(true)
    try {
      if (activeTab === 'leave') {
        await applyLeave({ startDate, endDate, reason })
        toast.success('Leave request submitted successfully')
      } else {
        await applyWFH({ startDate, endDate, reason })
        toast.success('WFH request submitted successfully')
      }
      
      // Reload balances and history
      await loadBalances()
      await loadHistory()
      
      // Reset form
      setStartDate('')
      setEndDate('')
      setReason('')
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await cancelLeave(id)
      toast.success('Request cancelled successfully')
      await loadBalances()
      await loadHistory()
    } catch (error) {
      console.error('Failed to cancel request:', error)
      toast.error('Failed to cancel request')
    }
  }

  const activeHistory = history

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0d1f3c]">Time Off</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your leaves and work from home requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - App / Balance */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Balances */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex gap-4">
            <div className={`flex-1 p-4 rounded-lg border cursor-pointer transition-colors ${activeTab === 'leave' ? 'bg-blue-50 border-blue-200' : 'border-gray-100 hover:bg-gray-50'}`} onClick={() => setActiveTab('leave')}>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Leave Balance</p>
              <p className="text-3xl font-bold text-[#1565c0]">{loadingBalances ? '...' : leaveBalance}</p>
            </div>
            <div className={`flex-1 p-4 rounded-lg border cursor-pointer transition-colors ${activeTab === 'wfh' ? 'bg-amber-50 border-amber-200' : 'border-gray-100 hover:bg-gray-50'}`} onClick={() => setActiveTab('wfh')}>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">WFH Balance</p>
              <p className="text-3xl font-bold text-amber-600">{loadingBalances ? '...' : wfhBalance}</p>
            </div>
          </div>

          {/* Apply Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0d1f3c] mb-4">
              Apply for {activeTab === 'leave' ? 'Leave' : 'Work From Home'}
            </h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea 
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0] resize-none"
                  required
                  placeholder="Enter your reason here..."
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1565c0] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col - History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-[#f8f9fb]">
              <h2 className="text-lg font-semibold text-[#0d1f3c]">
                {activeTab === 'leave' ? 'Leave' : 'WFH'} History
              </h2>
            </div>
            
            {loadingHistory ? (
              <div className="p-10 text-center text-gray-500">Loading...</div>
            ) : activeHistory.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p>No history found for {activeTab === 'leave' ? 'leaves' : 'work from home'}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-500">Dates</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Duration</th>
                      <th className="px-6 py-3 font-medium text-gray-500 w-1/3">Reason</th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-right">Status</th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeHistory.map(item => {
                      const formatDate = (dateStr) => {
                        const date = new Date(dateStr)
                        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      }
                      const calculateDuration = (start, end) => {
                        const startDate = new Date(start)
                        const endDate = new Date(end)
                        return Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1)
                      }
                      const duration = calculateDuration(item.startDate, item.endDate)
                      return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-[#0d1f3c] font-medium">{formatDate(item.startDate)}</div>
                          {item.startDate !== item.endDate && (
                            <div className="text-xs text-gray-400">to {formatDate(item.endDate)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{duration} day{duration > 1 ? 's' : ''}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs" title={item.reason}>{item.reason}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                            ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                              item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                              'bg-red-100 text-red-700'}
                          `}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === 'PENDING' && (
                            <button 
                              onClick={() => handleCancel(item.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
