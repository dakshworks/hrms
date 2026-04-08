import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { auth } = useContext(AuthContext)

  // If there's no token, redirect to login
  if (!auth?.token) {
    return <Navigate to="/login" replace />
  }

  // Otherwise, render the child routes inside an Outlet
  return <Outlet />
}
