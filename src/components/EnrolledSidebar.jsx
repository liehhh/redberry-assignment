import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useModal } from '../context/ModalContext'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'

export default function EnrolledSidebar() {
  const { sidebarOpen, closeSidebar } = useModal()
  const { isAuthenticated } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!sidebarOpen || !isAuthenticated) return
    setLoading(true)
    api.getEnrollments()
      .then((res) => setEnrollments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sidebarOpen, isAuthenticated])

  useEffect(() => {
    if (!sidebarOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSidebar()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, closeSidebar])

  if (!sidebarOpen) return null

  const totalCourses = enrollments.length
  const totalPrice = enrollments.reduce(
    (sum, e) => sum + (parseFloat(e.totalPrice) || 0),
    0
  )

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeSidebar}
      />

      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Enrolled Courses</h2>
          <button
            onClick={closeSidebar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {!loading && enrollments.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              <p className="text-gray-600 font-medium mb-1">Your learning journey starts here!</p>
              <p className="text-sm text-gray-400 mb-4">Browse courses to get started.</p>
              <Link
                to="/courses"
                onClick={closeSidebar}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          )}

          {!loading && enrollments.length > 0 && (
            <div className="p-4 space-y-3">
              {enrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onClose={closeSidebar}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && enrollments.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">
                {totalCourses} course{totalCourses !== 1 ? 's' : ''} enrolled
              </span>
              <span className="font-bold text-gray-900">
                Total: ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EnrollmentCard({ enrollment, onClose }) {
  const course = enrollment.course
  const schedule = enrollment.schedule
  const progress = enrollment.progress ?? 0
  const isCompleted = progress >= 100

  return (
    <Link
      to={`/courses/${course.id}`}
      onClick={onClose}
      className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3 p-3">
        <img
          src={course.image}
          alt={course.title}
          className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
              isCompleted
                ? 'bg-green-100 text-green-700'
                : 'bg-primary-light text-primary'
            }`}>
              {isCompleted ? 'Completed' : 'Enrolled'}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 truncate">{course.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">${parseFloat(enrollment.totalPrice).toFixed(2)}</p>
        </div>
      </div>

      <div className="px-3 pb-3 space-y-1.5">
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {schedule?.weeklySchedule?.label}
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {schedule?.timeSlot?.label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1 capitalize">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            {schedule?.sessionType?.name}
          </span>
          {schedule?.location && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {schedule.location}
            </span>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-gray-500">{progress}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
