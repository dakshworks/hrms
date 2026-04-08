import axios from '../config/axiosConfig'

export const getDashboardData = async () => {
  return await axios.get('/dashboard')
}

export const getTeamAvailability = async (managerId, date) => {
  const params = date ? { date } : {}
  if (managerId) {
    params.managerId = managerId
  }
  return await axios.get('/employees/team/availability', { params })
}

export const addTodo = async (data) => {
  return await axios.post('/dashboard/todos', data)
}

export const updateTodo = async (id, data) => {
  return await axios.put(`/dashboard/todos/${id}`, data)
}

export const deleteTodo = async (id) => {
  return await axios.delete(`/dashboard/todos/${id}`)
}

// Transform backend team availability to frontend format
export const transformTeamAvailability = (backendData, date) => {
  const leave = backendData.filter(e => e.status === 'ON_LEAVE').map(e => e.name)
  const wfh = backendData.filter(e => e.status === 'REMOTE').map(e => e.name)
  
  return {
    id: 1,
    date: date,
    leave: leave.length > 0 ? leave.join(', ') : '-',
    wfh: wfh.length > 0 ? wfh.join(', ') : '-'
  }
}
