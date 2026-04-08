import axios from 'axios'

const backendUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080'
const isExternalBackend = !!import.meta.env.VITE_SERVER_URL;
const baseURL = import.meta.env.PROD && !isExternalBackend ? '/api' : `${backendUrl.replace(/\/$/, '')}/api`

const instance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

// Attach token automatically to every request
instance.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth'))
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Handle backend response envelope and 401 errors
instance.interceptors.response.use(
  (response) => response.data.data, // Extract data from backend envelope { success, message, timestamp, data }
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance