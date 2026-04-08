import axios from '../config/axiosConfig'

export const getBalances = async () => {
  return await axios.get('/leaves/balances')
}

export const applyLeave = async (data) => {
  return await axios.post('/leaves', data)
}

export const getMyLeaves = async (page = 0, size = 10, sort = 'startDate') => {
  return await axios.get('/leaves/my', {
    params: { page, size, sort }
  })
}

export const cancelLeave = async (id) => {
  return await axios.delete(`/leaves/${id}`)
}

export const applyWFH = async (data) => {
  return await axios.post('/remote-work', data)
}

export const getMyWFH = async (page = 0, size = 10) => {
  return await axios.get('/remote-work/me', {
    params: { page, size }
  })
}

// Transform Spring Page to frontend pagination format
export const transformPagination = (page) => ({
  currentPage: page.number + 1, // Convert 0-indexed to 1-indexed
  totalPages: page.totalPages,
  totalRecords: page.totalElements,
  recordsPerPage: page.size
})
