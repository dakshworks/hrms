import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getDashboardData, getTeamAvailability, transformTeamAvailability } from '../api/dashboard.api'
import { toast } from 'react-toastify'

export default function Dashboard() {
  const { auth } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState([])
  const [teamAvailability, setTeamAvailability] = useState([])
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoDesc, setNewTodoDesc] = useState('')
  const [newTodoAsap, setNewTodoAsap] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editAsap, setEditAsap] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const data = await getDashboardData()
      setTodos(data.todos || [])
      
      // Transform team availability from backend format to frontend format
      if (data.teamAvailability && data.teamAvailability.length > 0) {
        const today = new Date().toISOString().split('T')[0]
        const transformed = transformTeamAvailability(data.teamAvailability, today)
        setTeamAvailability([transformed])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
      // Use fallback data if endpoint doesn't exist yet
      setTeamAvailability([
        { id: 1, date: '2026-04-08', leave: '-', wfh: '-' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return
    try {
      const newTodo = await fetch('/api/dashboard/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodoTitle, description: newTodoDesc, isAsap: newTodoAsap })
      })
      if (newTodo.ok) {
        const todoData = await newTodo.json()
        setTodos([...todos, todoData.data])
      } else {
        // Fallback to local state if endpoint doesn't exist
        setTodos([...todos, {
          id: Date.now(),
          title: newTodoTitle,
          description: newTodoDesc,
          isAsap: newTodoAsap,
          completed: false
        }])
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
      // Fallback to local state
      setTodos([...todos, {
        id: Date.now(),
        title: newTodoTitle,
        description: newTodoDesc,
        isAsap: newTodoAsap,
        completed: false
      }])
    }
    setNewTodoTitle('')
    setNewTodoDesc('')
    setNewTodoAsap(false)
  }

  const handleDeleteTodo = async (id) => {
    try {
      await fetch(`/api/dashboard/todos/${id}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
    setTodos(todos.filter(t => t.id !== id))
  }

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDesc(todo.description)
    setEditAsap(todo.isAsap)
  }

  const saveEdit = () => {
    if (!editTitle.trim()) return
    setTodos(todos.map(t => 
      t.id === editingId ? { ...t, title: editTitle, description: editDesc, isAsap: editAsap } : t
    ))
    setEditingId(null)
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0d1f3c]">
          Hello, {auth?.username || 'User'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's going on today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Things to do Component */}
        <div>
          <h2 className="text-lg font-semibold text-[#0d1f3c] mb-4">Things to do</h2>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#0d1f3c] mb-3">Add new task</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Task title"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <input 
                type="text" 
                placeholder="Description (optional)"
                value={newTodoDesc}
                onChange={(e) => setNewTodoDesc(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={newTodoAsap}
                    onChange={(e) => setNewTodoAsap(e.target.checked)}
                    className="cursor-pointer w-4 h-4 text-[#1565c0] rounded border-gray-300 focus:ring-[#1565c0]"
                  />
                  Mark as ASAP
                </label>
                <button 
                  onClick={handleAddTodo}
                  className="bg-[#1565c0] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  disabled={!newTodoTitle.trim()}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <p className="text-sm font-medium text-gray-600">No tasks for today</p>
                <p className="text-xs text-gray-400 mt-1">Take a break or add a new task above.</p>
              </div>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  {editingId === todo.id ? (
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0] transition-colors"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <input 
                        type="text" 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0] transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={editAsap}
                            onChange={(e) => setEditAsap(e.target.checked)}
                            className="cursor-pointer w-4 h-4 text-[#1565c0] rounded border-gray-300 focus:ring-[#1565c0]"
                          />
                          Mark as ASAP
                        </label>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                          <button onClick={saveEdit} className="text-sm bg-green-50 text-green-700 px-4 py-1.5 rounded-lg hover:bg-green-100 font-medium cursor-pointer transition-colors" disabled={!editTitle.trim()}>Save</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-[#e8f0fe] flex items-center justify-center mt-0.5">
                          <span className="text-[#1565c0] text-lg">📋</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0d1f3c] leading-tight">{todo.title}</p>
                          {todo.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{todo.description}</p>}
                          <p className="text-[0.65rem] text-gray-400 mt-2 font-medium">Created at {formatTime(todo.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="flex gap-2 h-5 items-center">
                          {todo.isAsap && (
                            <span className="text-[0.65rem] bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">ASAP</span>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => startEdit(todo)} className="text-xs font-semibold text-[#1565c0] hover:text-blue-800 transition-colors cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteTodo(todo.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer">Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Availability Component */}
        <div>
          <h2 className="text-lg font-semibold text-[#0d1f3c] mb-4">Team Availability</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fb] border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 w-1/3">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 w-1/3">Leave</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 w-1/3">WFH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamAvailability.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-[#0d1f3c] font-medium">{record.date}</td>
                    <td className="px-5 py-3.5">
                      {record.leave !== '-' ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span className="text-gray-700">{record.leave}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {record.wfh !== '-' ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span className="text-gray-700">{record.wfh}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
