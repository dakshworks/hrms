import { Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import axios from './config/axiosConfig'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import TimeOff from './pages/TimeOff'
import ResetPassword from './pages/ResetPassword'
import Calendar from './pages/Calendar'
import Attendance from './pages/Attendance'

import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080'
axios.defaults.withCredentials = true

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── Protected Dashboard Routes ── */}
        {/* <Route element={<ProtectedRoute />}> */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="time-off" element={<TimeOff />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="calendar" element={<Calendar />} />
          {/* <Route path="team" element={<Team />} /> */}
          {/* <Route path="events" element={<Events />} /> */}
        </Route>
        {/* </Route> */}
      </Routes>
    </>
  )
}

export default App
