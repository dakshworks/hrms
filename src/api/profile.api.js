import axios from '../config/axiosConfig'

export const getMyProfile = async () => {
  return await axios.get('/employees/me')
}

export const updateMyProfile = async (data) => {
  return await axios.put('/employees/me', data)
}

export const getFinancialDetails = async () => {
  return await axios.get('/employees/me/financial')
}

export const updateFinancialDetails = async (data) => {
  return await axios.post('/employees/me/financial', data)
}
