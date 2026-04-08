import { useState } from 'react'
export default function InputField({
  id,
  label,
  type = 'text',
  autoComplete,
  error,
  helperText,
  registration,
  showToggle = false,
}) {
  const [visible, setVisible] = useState(false)
  const resolvedType = showToggle ? (visible ? 'text' : 'password') : type

  return (
    <div className="w-full">
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          autoComplete={autoComplete}
          placeholder=" "
          {...registration}
          className={`
            peer w-full rounded-[10px] border px-4 pt-5 pb-2 text-[0.9rem] text-gray-900
            outline-none transition-colors
            placeholder-transparent
            ${error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:border-[#1565c0]'
            }
          `}
        />
        <label
          htmlFor={id}
          className={`
            pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
            text-[0.9rem] transition-all
            peer-focus:top-3 peer-focus:text-xs
            peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-xs
            ${error
              ? 'text-red-400 peer-focus:text-red-500'
              : 'text-gray-500 peer-focus:text-[#1565c0]'
            }
          `}
        >
          {label}
        </label>

        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {visible ? (
              <img src="/eye-off.png" alt="Hide password" className="h-5 w-5" />
            ) : (
              <img src="/eye.png" alt="Show password" className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>{helperText}</p>
      )}
    </div>
  )
}
