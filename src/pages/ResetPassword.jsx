import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Spinner from '../components/ui/Spinner'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: '', confirmPassword: '' }
  })

  // Watch password to dynamically update validation rules
  const password = watch('password', '')
  const confirmPassword = watch('confirmPassword', '')

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasMinLength = password.length >= 14

  const isPasswordValid = hasLower && hasUpper && hasNumber && hasMinLength
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }

    setIsSubmitting(true)
    try {
      // Mocked endpoint for resetting password
      // await axios.post('/auth/reset-password', { token, newPassword: data.password })
      
      // Simulating API call for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      setSuccess(true)
    } catch (error) {
      console.error(error)
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper for rendering checklist items
  const RuleItem = ({ satisfied, label }) => (
    <div className="flex items-center gap-2">
      {satisfied ? (
        <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 ml-1.5 mr-0.5"></span>
      )}
      <span className={`text-[13px] ${satisfied ? 'text-[#1a1a1a]' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6]">
        <div className="flex flex-col items-center max-w-md w-full px-6 text-center">
          {/* Logo */}
          <div className="w-10 h-10 rounded-full bg-[#dbe4f0] flex items-center justify-center mb-8">
            <span className="text-[#1565c0] font-bold text-lg">R</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#e6f4ea] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#1e8e3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-4">
            Success!
          </h1>
          <p className="text-[#4a4a4a] text-[15px] leading-relaxed mb-8">
            Your password has been updated and is secure. You can now log in again.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-full transition-colors w-1/2"
          >
            Return to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6] px-4 font-sans">
      <div className="w-full max-w-lg bg-transparent flex flex-col items-center">
        {/* Logo */}
        <div className="w-10 h-10 rounded-full bg-[#dbe4f0] flex items-center justify-center mb-8">
          <span className="text-[#1565c0] font-bold text-lg">R</span>
        </div>

        <h1 className="text-3xl font-semibold text-[#1a1a1a] tracking-tight mb-2">
          Reset your password
        </h1>
        <p className="text-gray-600 mb-8 text-[15px]">
          Almost done. Enter your new password and you're good to go.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="border-2 border-[#2563eb]/20 bg-[#dbe4f0]/30 rounded-xl p-5 mb-6 shadow-sm">
            
            {/* New Password Input */}
            <div className="relative mb-5">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                className="w-full bg-transparent border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#2563eb] transition-colors pr-10 text-[15px]"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[14px] text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showPassword ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"} />
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  ) : null}
                </svg>
              </button>
            </div>

            {/* Validation Rules */}
            <div className="grid grid-cols-2 gap-y-2 mb-6 px-1">
              <RuleItem satisfied={hasLower} label="Lowercase characters." />
              <RuleItem satisfied={hasUpper} label="Uppercase characters." />
              <RuleItem satisfied={hasNumber} label="Numbers." />
              <RuleItem satisfied={hasMinLength} label="14 characters minimum." />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                className={`w-full bg-transparent border rounded-lg px-4 py-3 outline-none focus:border-[#2563eb] transition-colors pr-10 text-[15px]
                  ${confirmPassword.length > 0 && !doPasswordsMatch ? 'border-red-400' : 'border-gray-300'}`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[14px] text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showConfirm ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"} />
                  {showConfirm && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Show error if passwords do not match */}
            {confirmPassword.length > 0 && !doPasswordsMatch && (
              <p className="text-red-500 text-xs mt-2 px-1">Passwords do not match.</p>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={!isPasswordValid || !doPasswordsMatch || isSubmitting}
              className={`px-8 py-3.5 rounded-full font-medium transition-all ${
                isPasswordValid && doPasswordsMatch && !isSubmitting
                  ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-md'
                  : 'bg-[#93c5fd] text-white cursor-not-allowed opacity-80'
              }`}
            >
              {isSubmitting ? <Spinner size={20} className="text-white mx-10" /> : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
