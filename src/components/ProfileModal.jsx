import { useState, useEffect, useRef } from 'react'
import Modal from './Modal'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import { updateProfile } from '../services/api'

export default function ProfileModal() {
  const { user, refreshUser } = useAuth()
  const { closeModal } = useModal()
  const [form, setForm] = useState({
    full_name: '',
    mobile_number: '',
    age: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.fullName || '',
        mobile_number: user.mobileNumber || '',
        age: user.age || '',
      })
      if (user.avatar) setAvatarPreview(user.avatar)
    }
  }, [user])

  const validate = () => {
    const errs = {}

    if (!form.full_name.trim()) {
      errs.full_name = 'Name is required'
    } else if (form.full_name.trim().length < 3) {
      errs.full_name = 'Name must be at least 3 characters'
    } else if (form.full_name.trim().length > 50) {
      errs.full_name = 'Name must not exceed 50 characters'
    }

    const digits = form.mobile_number.replace(/\s/g, '')
    if (!digits) {
      errs.mobile_number = 'Mobile number is required'
    } else if (!/^\d+$/.test(digits)) {
      errs.mobile_number = 'Please enter a valid Georgian mobile number (9 digits starting with 5)'
    } else if (!digits.startsWith('5')) {
      errs.mobile_number = 'Georgian mobile numbers must start with 5'
    } else if (digits.length !== 9) {
      errs.mobile_number = 'Mobile number must be exactly 9 digits'
    }

    if (!form.age && form.age !== 0) {
      errs.age = 'Age is required'
    } else if (isNaN(Number(form.age))) {
      errs.age = 'Age must be a number'
    } else if (Number(form.age) < 16) {
      errs.age = 'You must be at least 16 years old to enroll'
    } else if (Number(form.age) > 120) {
      errs.age = 'Please enter a valid age'
    }

    return errs
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
    setSuccess(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const valid = ['image/jpeg', 'image/png', 'image/webp']
    if (!valid.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: 'Only JPG, PNG, and WebP images are allowed' }))
      return
    }
    setErrors((prev) => ({ ...prev, avatar: '' }))
    setAvatar(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      formData.append('full_name', form.full_name.trim())
      formData.append('mobile_number', form.mobile_number.replace(/\s/g, ''))
      formData.append('age', Number(form.age))
      if (avatar) {
        formData.append('avatar', avatar)
      }
      await updateProfile(formData)
      await refreshUser()
      setSuccess(true)
      setTimeout(() => closeModal(), 1000)
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(data.errors)
      } else {
        setErrors({ general: data?.message || 'Failed to update profile' })
      }
    } finally {
      setLoading(false)
    }
  }

  const isComplete = user?.profileComplete

  return (
    <Modal onClose={closeModal}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{user?.username}</p>
          <p className={`text-xs ${isComplete ? 'text-green-600' : 'text-orange-500'}`}>
            {isComplete ? 'Profile Complete ✓' : 'Incomplete Profile'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {typeof errors.general === 'string' ? errors.general : errors.general[0]}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            Profile updated successfully
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Username"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
              errors.full_name ? 'border-red-400' : form.full_name ? 'border-green-400' : 'border-gray-300 focus:border-primary'
            }`}
          />
          {errors.full_name && <p className="mt-1 text-xs text-red-500">{Array.isArray(errors.full_name) ? errors.full_name[0] : errors.full_name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="text"
              value={form.mobile_number}
              onChange={(e) => handleChange('mobile_number', e.target.value)}
              placeholder="+995..."
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
                errors.mobile_number ? 'border-red-400' : form.mobile_number ? 'border-green-400' : 'border-gray-300 focus:border-primary'
              }`}
            />
            {errors.mobile_number && <p className="mt-1 text-xs text-red-500">{Array.isArray(errors.mobile_number) ? errors.mobile_number[0] : errors.mobile_number}</p>}
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="29"
              min="16"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
                errors.age ? 'border-red-400' : form.age ? 'border-green-400' : 'border-gray-300 focus:border-primary'
              }`}
            />
            {errors.age && <p className="mt-1 text-xs text-red-500">{Array.isArray(errors.age) ? errors.age[0] : errors.age}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Avatar</label>
          {avatarPreview && !user?.avatar ? (
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <img src={avatarPreview} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{avatar?.name}</p>
                <button
                  type="button"
                  onClick={() => { setAvatar(null); setAvatarPreview(null) }}
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-sm text-gray-500">
                Drag and drop or <span className="text-primary font-medium">Upload file</span>
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
          {errors.avatar && <p className="mt-1 text-xs text-red-500">{errors.avatar}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </Modal>
  )
}
