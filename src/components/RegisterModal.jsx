import { useState, useRef } from 'react'
import Modal from './Modal'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'

const STEPS = [
  { label: 'Email' },
  { label: 'Password' },
  { label: 'Profile' },
]

export default function RegisterModal() {
  const { register } = useAuth()
  const { closeModal, openLogin } = useModal()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    username: '',
    avatar: null,
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiErrors, setApiErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
    if (apiErrors[field]) setApiErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateStep = (stepIndex) => {
    const errs = {}
    if (stepIndex === 0) {
      if (!form.email.trim()) {
        errs.email = 'Email is required'
      } else if (form.email.trim().length < 3) {
        errs.email = 'Email must be at least 3 characters'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Please enter a valid email'
      }
    }
    if (stepIndex === 1) {
      if (!form.password) {
        errs.password = 'Password is required'
      } else if (form.password.length < 3) {
        errs.password = 'Password must be at least 3 characters'
      }
      if (!form.password_confirmation) {
        errs.password_confirmation = 'Please confirm your password'
      } else if (form.password !== form.password_confirmation) {
        errs.password_confirmation = 'Passwords do not match'
      }
    }
    if (stepIndex === 2) {
      if (!form.username.trim()) {
        errs.username = 'Username is required'
      } else if (form.username.trim().length < 3) {
        errs.username = 'Username must be at least 3 characters'
      }
    }
    return errs
  }

  const handleNext = () => {
    const errs = validateStep(step)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: 'Only JPG, PNG, and WebP images are allowed' }))
      return
    }

    setErrors((prev) => ({ ...prev, avatar: '' }))
    handleChange('avatar', file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, avatar: 'Only JPG, PNG, and WebP images are allowed' }))
        return
      }
      setErrors((prev) => ({ ...prev, avatar: '' }))
      handleChange('avatar', file)
      const reader = new FileReader()
      reader.onload = (ev) => setAvatarPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    const errs = validateStep(2)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setApiErrors({})
    try {
      const formData = new FormData()
      formData.append('email', form.email)
      formData.append('password', form.password)
      formData.append('password_confirmation', form.password_confirmation)
      formData.append('username', form.username)
      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }
      await register(formData)
      closeModal()
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setApiErrors(data.errors)
        // Go back to relevant step if error is on a previous step's field
        if (data.errors.email) setStep(0)
        else if (data.errors.password) setStep(1)
        else if (data.errors.username) setStep(2)
      } else {
        setApiErrors({ general: data?.message || 'Registration failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const switchToLogin = () => {
    closeModal()
    openLogin()
  }

  const getFieldError = (field) => {
    if (errors[field]) return errors[field]
    if (apiErrors[field]) {
      return Array.isArray(apiErrors[field]) ? apiErrors[field][0] : apiErrors[field]
    }
    return ''
  }

  return (
    <Modal onClose={closeModal}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-sm text-gray-500 mt-1">Join and start learning today</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {apiErrors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {apiErrors.general}
        </div>
      )}

      {/* Step 1: Email */}
      {step === 0 && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
                getFieldError('email')
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-300 focus:border-primary'
              }`}
            />
            {getFieldError('email') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Password */}
      {step === 1 && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password<span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={form.password}
              onChange={(v) => handleChange('password', v)}
              error={getFieldError('password')}
              placeholder="Password"
            />
            {getFieldError('password') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('password')}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password<span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={form.password_confirmation}
              onChange={(v) => handleChange('password_confirmation', v)}
              error={getFieldError('password_confirmation')}
              placeholder="Confirm Password"
            />
            {getFieldError('password_confirmation') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('password_confirmation')}</p>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 3: Username + Avatar */}
      {step === 2 && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Username"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
                  getFieldError('username')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-300 focus:border-primary'
                }`}
              />
              {form.username && !getFieldError('username') && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            {getFieldError('username') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('username')}</p>
            )}
          </div>

          {/* Avatar upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Avatar
            </label>
            {avatarPreview ? (
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{form.avatar?.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('avatar', null)
                      setAvatarPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm text-gray-500">
                  Drag and drop or{' '}
                  <span className="text-primary font-medium">Upload file</span>
                </p>
                <p className="text-xs text-gray-400">JPG, PNG or WebP</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {getFieldError('avatar') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('avatar')}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 text-center">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="text-sm text-gray-500 hover:text-gray-700 mb-3 block mx-auto"
          >
            ← Back
          </button>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={switchToLogin}
            className="text-primary font-medium hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </Modal>
  )
}

function PasswordInput({ value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-colors ${
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-300 focus:border-primary'
        }`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
