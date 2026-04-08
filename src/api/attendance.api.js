import axios from '../config/axiosConfig'

export const checkIn = async (date) => {
  return await axios.post('/attendance/check-in', { date })
}

export const checkOut = async () => {
  return await axios.post('/attendance/check-out')
}

export const getMyAttendance = async (page = 0, size = 10, sort = 'date') => {
  return await axios.get('/attendance/my', {
    params: { page, size, sort }
  })
}

export const getCheckInStatus = async () => {
  return await axios.get('/attendance/status')
}

// Transform Spring Page to frontend pagination format
export const transformPagination = (page) => ({
  currentPage: page.number + 1, // Convert 0-indexed to 1-indexed
  totalPages: page.totalPages,
  totalRecords: page.totalElements,
  recordsPerPage: page.size
})
