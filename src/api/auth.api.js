import axios from '../config/axiosConfig'

export const loginUser = async (data) => {
  // Backend returns: { success, message, timestamp, data: { token, type, employeeId, email, role } }
  // Axios interceptor extracts data.data, so response is directly the data object
  const response = await axios.post('/auth/login', data)
  return response // Returns { token, type, employeeId, email, role }
}

export const registerUser = async (data) => {
  return await axios.post('/auth/register', data)
}

export const getCurrentUser = async () => {
  return await axios.get('/auth/me')
}

export const forgotPassword = async (email) => {
  return await axios.post('/auth/forgot-password', { email })
}

export const resetPassword = async (token, password) => {
  return await axios.post('/auth/reset-password', { token, password })
}
