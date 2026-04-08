import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import axios from '../config/axiosConfig'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/ui/InputField'
import Spinner from '../components/ui/Spinner'

/* ─────────────────────────────────────────────────────────────────────── */

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  /* ── form submit ── */
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setServerError('')
    try {
      await axios.post('/auth/forgot-password', data)
      setEmailSent(true)
      // toast.success('Reset link sent!', { position: 'top-center', autoClose: 3000, pauseOnHover: false })
    } catch (error) {
      console.error(error.response?.data)
      const message = error?.response?.data?.message
      setServerError(typeof message === 'string' ? message : 'Something went wrong. Please try again.')
      toast.error('Failed to send reset link', { position: 'top-center', autoClose: 2000, pauseOnHover: false })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ─────────────────────────────────────────────────────────────────── */
  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e8e8e8]/50">
        <div className="flex flex-col items-center max-w-md w-full px-6 text-center">
          {/* Envelope Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#dbe4f0] flex items-center justify-center mb-8">
            <svg className="w-8 h-8 text-[#1565c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-4">
            Email on the way!
          </h1>

          <p className="text-[#4a4a4a] text-[15px] leading-relaxed mb-10">
            We sent you password reset instructions. If it doesn't show up soon, check your spam folder. We sent it from the email address <span className="font-semibold text-black">no-reply@remote.com</span>.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-full transition-colors cursor-pointer"
          >
            Return to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="text-center w-full">
        <h1 className="text-[2rem] font-semibold text-[#0d1f3c] tracking-tight">
          Forgot password?
        </h1>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Enter your account's email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form
        id="form-forgot-password"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 w-full mt-4"
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

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-red-500 text-center">{serverError}</p>
        )}

        {/* Submit */}
        <button
          id="btn-forgot-password-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg py-3.5 text-[0.95rem] font-semibold text-white
                      bg-linear-to-r from-[#1565c0] to-[#1a9dff]
                      shadow-[0_4px_14px_rgba(21,101,192,0.4)]
                      hover:from-[#1253a4] hover:to-[#1589e0]
                      hover:shadow-[0_6px_18px_rgba(21,101,192,0.5)]
                      disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none
                      transition-all cursor-pointer disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Spinner size={22} className="text-white" /> : 'Send reset link'}
        </button>

        {/* Back to login */}
        <div className="text-center mt-1">
          <Link
            to="/login"
            id="link-return-to-login"
            className="text-sm font-semibold text-[#1565c0] hover:underline cursor-pointer"
          >
            ← Return to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}