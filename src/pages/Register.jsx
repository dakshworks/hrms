import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import axios from '../config/axiosConfig'
import AuthLayout from '../components/auth/AuthLayout'
import OAuthButtons from '../components/auth/OAuthButtons'
import InputField from '../components/ui/InputField'
import Spinner from '../components/ui/Spinner'

/* ─────────────────────────────────────────────────────────────────────── */

export default function Register() {
    const navigate = useNavigate()

    const [serverError, setServerError] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const password = watch('password')

    /* ── form submit ── */
    const onSubmit = async (data) => {
        setIsRegistering(true)
        setServerError('')
        const { confirmPassword, ...payload } = data
        // Backend requires: name, email, password, department, role
        // Optional: phoneNumber, designation, employmentType, dateOfJoining
        try {
            await axios.post('/auth/register', {
                name: payload.username,
                email: payload.email,
                password: payload.password,
                department: 'Engineering', // Default for now, can be added as field
                role: 'EMPLOYEE', // Default for now, can be added as field
                phoneNumber: payload.phoneNumber || undefined,
                designation: payload.designation || undefined,
                employmentType: 'FULL_TIME', // Default
                dateOfJoining: new Date().toISOString().split('T')[0] // Today
            })
            toast.success('Registration successful!', { position: 'top-center', autoClose: 2000, pauseOnHover: false })
            navigate('/login')
        } catch (error) {
            console.error(error.response?.data)
            const message = error.response?.data?.message
            setServerError(typeof message === 'string' ? message : 'Registration failed. Please try again.')
            toast.error('Registration failed', { position: 'top-center', autoClose: 2000, pauseOnHover: false })
        } finally {
            setIsRegistering(false)
        }
    }

    /* ── oauth stubs ── */
    const handleGoogle = () => { }
    const handleMicrosoft = () => { }

    /* ─────────────────────────────────────────────────────────────────── */
    return (
        <AuthLayout>
            {/* Heading */}
            <div className="text-center w-full">
                <h1 className="text-[2rem] font-semibold text-[#0d1f3c] tracking-tight">
                    Create your account
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        id="link-go-to-login"
                        className="font-semibold text-[#1565c0] hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            </div>

            {/* Form */}
            <form
                id="form-register"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4 w-full"
            >
                {/* Full name */}
                <InputField
                    id="input-fullname"
                    label="Full name"
                    type="text"
                    autoComplete="name"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    registration={register('username', { required: 'Full name is required' })}
                />

                {/* Email */}
                <InputField
                    id="input-email"
                    label="Work email address"
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
                    autoComplete="new-password"
                    showToggle
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    registration={register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                />

                {/* Confirm password */}
                <InputField
                    id="input-confirm-password"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    showToggle
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    registration={register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                    })}
                />

                {/* Server error */}
                {serverError && (
                    <p className="text-sm text-red-500 text-center">{serverError}</p>
                )}

                {/* Submit */}
                <button
                    id="btn-register-submit"
                    type="submit"
                    disabled={isRegistering}
                    className="w-full rounded-lg py-3.5 text-[0.95rem] font-semibold text-white
                     bg-linear-to-r from-[#1565c0] to-[#1a9dff]
                     shadow-[0_4px_14px_rgba(21,101,192,0.4)]
                     hover:from-[#1253a4] hover:to-[#1589e0]
                     hover:shadow-[0_6px_18px_rgba(21,101,192,0.5)]
                     disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none
                     transition-all cursor-pointer disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
                >
                    {isRegistering ? <Spinner size={22} className="text-white" /> : 'Create account'}
                </button>

                {/* OAuth */}
                <OAuthButtons onGoogle={handleGoogle} onMicrosoft={handleMicrosoft} />
            </form>
        </AuthLayout>
    )
}