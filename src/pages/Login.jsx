import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import axios from '../config/axiosConfig'
import { AuthContext } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import OAuthButtons from '../components/auth/OAuthButtons'
import InputField from '../components/ui/InputField'
import Spinner from '../components/ui/Spinner'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useContext(AuthContext)

  const [serverError, setServerError] = useState('')
  const [isLoggingIn, setLoggingIn] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoggingIn(true)
    setServerError('')
    try {
      // Backend returns: { success, message, timestamp, data: { token, type, employeeId, email, role } }
      const response = await axios.post('/auth/login', { ...data, rememberMe })
      toast.success('Login successful!', { position: 'top-center', autoClose: 2000, pauseOnHover: false })
      
      // Strip ROLE_ prefix from role
      const role = response.role.replace('ROLE_', '')
      
      setAuth((prev) => ({ 
        ...prev, 
        employeeId: response.employeeId,
        username: response.email, // Use email as username
        email: response.email,
        role: role,
        token: response.token 
      }))
      navigate('/')
    } catch (error) {
      console.error(error.response?.data)
      const message = error?.response?.data?.message
      setServerError(typeof message === 'string' ? message : 'Login failed. Please try again.')
      toast.error('Login failed', { position: 'top-center', autoClose: 2000, pauseOnHover: false })
    } finally {
      setLoggingIn(false)
    }
  }

  /* oauth */
  const handleGoogle = () => { }
  const handleMicrosoft = () => { }

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="text-center w-full">
        <h1 className="text-[2rem] font-semibold text-[#0d1f3c] tracking-tight">
          Welcome back!
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            id="link-go-to-register"
            className="font-semibold text-[#1565c0] hover:underline"
          >
            Sign up now
          </Link>
        </p>
      </div>

      {/* Form */}
      <form
        id="form-login"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 w-full"
      >
        {/* Email */}
        <InputField
          id="input-email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          registration={register('email', {
            required: 'Email is required',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email address' },
          })}
        />

        {/* Password */}
        <InputField
          id="input-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          showToggle
          error={!!errors.password}
          helperText={errors.password?.message}
          registration={register('password', { required: 'Password is required' })}
        />

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between -mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="checkbox-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#1565c0] focus:ring-[#1565c0] cursor-pointer"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            id="link-forgot-password"
            className="text-sm font-medium text-[#1565c0] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-red-500 text-center">{serverError}</p>
        )}

        {/* Submit */}
        <button
          id="btn-login-submit"
          type="submit"
          disabled={isLoggingIn}
          className="w-full rounded-lg py-3.5 text-[0.95rem] font-semibold text-white
                     bg-linear-to-r from-[#1565c0] to-[#1a9dff]
                     shadow-[0_4px_14px_rgba(21,101,192,0.4)]
                     hover:from-[#1253a4] hover:to-[#1589e0]
                     hover:shadow-[0_6px_18px_rgba(21,101,192,0.5)]
                     disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none
                     transition-all cursor-pointer disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {isLoggingIn ? <Spinner size={22} className="text-white" /> : 'Log in'}
        </button>

        {/* OAuth */}
        <OAuthButtons onGoogle={handleGoogle} onMicrosoft={handleMicrosoft} />
      </form>
    </AuthLayout>
  )
}