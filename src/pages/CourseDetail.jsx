import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import Modal from '../components/Modal'
import * as api from '../services/api'

export default function CourseDetail() {
  const { id } = useParams()
  const { isAuthenticated, isProfileComplete, user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCourse = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getCourse(id)
      setCourse(res.data.data)
    } catch {
      setCourse(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse, isAuthenticated])

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-8 lg:px-16 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded-xl mb-6" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-[1920px] mx-auto px-8 lg:px-16 py-20 text-center">
        <p className="text-gray-500 text-lg">Course not found</p>
      </div>
    )
  }

  const enrollment = course.enrollment

  return (
    <div className="max-w-[1920px] mx-auto px-8 lg:px-16 py-8">
      <div className="flex gap-10">
        <div className="flex-1 min-w-0">
          <CourseInfo course={course} />
        </div>
        <div className="w-[420px] flex-shrink-0">
          {enrollment ? (
            <EnrolledState enrollment={enrollment} course={course} onUpdate={fetchCourse} />
          ) : (
            <ScheduleAndEnroll
              course={course}
              isAuthenticated={isAuthenticated}
              isProfileComplete={isProfileComplete}
              onEnrolled={fetchCourse}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function CourseInfo({ course }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-light text-primary">
          {course.category?.name}
        </span>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          {course.topic?.name}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

      <div className="flex items-center gap-4 mb-6">
        {course.instructor?.avatar && (
          <img
            src={course.instructor.avatar}
            alt={course.instructor.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">{course.instructor?.name}</p>
          <p className="text-xs text-gray-500">Instructor</p>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {course.durationWeeks} weeks
          </span>
          {course.reviews?.length > 0 && (
            <span className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {(course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)}
              <span className="text-gray-400">({course.reviews.length})</span>
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden mb-8">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-80 object-cover"
        />
      </div>

      <div className="prose prose-gray max-w-none">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">About this course</h2>
        <p className="text-gray-600 leading-relaxed">{course.description}</p>
      </div>
    </div>
  )
}

function ScheduleAndEnroll({ course, isAuthenticated, isProfileComplete, onEnrolled }) {
  const { openLogin, openProfile } = useModal()

  const [schedules, setSchedules] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [sessionTypes, setSessionTypes] = useState([])

  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)

  const [enrolling, setEnrolling] = useState(false)
  const [conflictData, setConflictData] = useState(null)
  const [profilePrompt, setProfilePrompt] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    api.getWeeklySchedules(course.id).then((res) => setSchedules(res.data.data || []))
  }, [course.id])

  useEffect(() => {
    if (!selectedSchedule) { setTimeSlots([]); return }
    api.getTimeSlots(course.id, { weekly_schedule_id: selectedSchedule.id })
      .then((res) => setTimeSlots(res.data.data || []))
  }, [course.id, selectedSchedule])

  useEffect(() => {
    if (!selectedSchedule || !selectedTimeSlot) { setSessionTypes([]); return }
    api.getSessionTypes(course.id, {
      weekly_schedule_id: selectedSchedule.id,
      time_slot_id: selectedTimeSlot.id,
    }).then((res) => setSessionTypes(res.data.data || []))
  }, [course.id, selectedSchedule, selectedTimeSlot])

  const handleScheduleChange = (schedule) => {
    setSelectedSchedule(schedule)
    setSelectedTimeSlot(null)
    setSelectedSession(null)
    setErrorMsg('')
  }

  const handleTimeSlotChange = (slot) => {
    setSelectedTimeSlot(slot)
    setSelectedSession(null)
    setErrorMsg('')
  }

  const handleSessionChange = (session) => {
    if (session.availableSeats === 0) return
    setSelectedSession(session)
    setErrorMsg('')
  }

  const basePrice = parseFloat(course.basePrice) || 0
  const sessionModifier = selectedSession ? parseFloat(selectedSession.priceModifier) || 0 : 0
  const totalPrice = basePrice + sessionModifier

  const canEnroll = selectedSchedule && selectedTimeSlot && selectedSession && selectedSession.availableSeats > 0

  const handleEnroll = async (force = false) => {
    setErrorMsg('')

    if (!isAuthenticated) {
      openLogin()
      return
    }

    if (!isProfileComplete) {
      setProfilePrompt(true)
      return
    }

    if (!canEnroll) {
      setErrorMsg('Please complete all schedule selections')
      return
    }

    setEnrolling(true)
    try {
      await api.createEnrollment({
        courseId: course.id,
        courseScheduleId: selectedSession.courseScheduleId,
      })
      setSuccessData({ title: course.title })
    } catch (err) {
      const data = err.response?.data
      if (data?.conflict) {
        setConflictData(data.conflict)
      } else {
        setErrorMsg(data?.message || 'Failed to enroll. Please try again.')
      }
    } finally {
      setEnrolling(false)
    }
  }

  const handleConflictContinue = async () => {
    setConflictData(null)
    setEnrolling(true)
    try {
      await api.createEnrollment({
        courseId: course.id,
        courseScheduleId: selectedSession.courseScheduleId,
        force: true,
      })
      setSuccessData({ title: course.title })
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to enroll.')
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20">
      <ScheduleSection
        title="Weekly Schedule"
        stepNumber={1}
        isOpen={true}
      >
        <div className="flex flex-wrap gap-2">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => handleScheduleChange(s)}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
                selectedSchedule?.id === s.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </ScheduleSection>

      <ScheduleSection
        title="Time Slot"
        stepNumber={2}
        isOpen={!!selectedSchedule}
      >
        {timeSlots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleTimeSlotChange(slot)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  selectedTimeSlot?.id === slot.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {slot.label}
              </button>
            ))}
          </div>
        ) : selectedSchedule ? (
          <p className="text-xs text-gray-400">No time slots available</p>
        ) : null}
      </ScheduleSection>

      <ScheduleSection
        title="Session Type"
        stepNumber={3}
        isOpen={!!selectedTimeSlot}
      >
        {sessionTypes.length > 0 ? (
          <div className="space-y-2">
            {sessionTypes.map((session) => {
              const isSelected = selectedSession?.id === session.id
              const isFull = session.availableSeats === 0
              const lowSeats = session.availableSeats > 0 && session.availableSeats < 5
              const modifier = parseFloat(session.priceModifier) || 0

              return (
                <button
                  key={session.id}
                  onClick={() => handleSessionChange(session)}
                  disabled={isFull}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isFull
                      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      : isSelected
                        ? 'bg-primary-light border-primary'
                        : 'bg-white border-gray-200 hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <SessionIcon type={session.name} />
                      <span className="text-sm font-medium text-gray-900 capitalize">{session.name}</span>
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {modifier > 0 ? `+$${modifier.toFixed(0)}` : 'Included'}
                    </span>
                  </div>
                  {session.location && (
                    <p className="text-xs text-gray-500 ml-6">{session.location}</p>
                  )}
                  <div className="flex items-center justify-between mt-1 ml-6">
                    {isFull ? (
                      <span className="text-xs font-medium text-red-500">Fully Booked</span>
                    ) : (
                      <span className={`text-xs ${lowSeats ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                        {lowSeats ? `Only ${session.availableSeats} seats left!` : `${session.availableSeats} seats available`}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : selectedTimeSlot ? (
          <p className="text-xs text-gray-400">No session types available</p>
        ) : null}
      </ScheduleSection>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Base Price</span>
            <span className="text-gray-700">${basePrice.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Session Type</span>
            <span className="text-gray-700">+ ${sessionModifier.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
            <span className="text-gray-700">Total Price</span>
            <span className="text-gray-900">${totalPrice.toFixed(0)}</span>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-500 mb-3">{errorMsg}</p>
        )}

        <button
          onClick={() => handleEnroll()}
          disabled={enrolling || (!isAuthenticated ? false : !canEnroll)}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>

      {conflictData && (
        <ConflictModal
          conflict={conflictData}
          onContinue={handleConflictContinue}
          onCancel={() => setConflictData(null)}
        />
      )}

      {profilePrompt && (
        <ProfilePromptModal
          onComplete={() => { setProfilePrompt(false); openProfile() }}
          onCancel={() => setProfilePrompt(false)}
        />
      )}

      {successData && (
        <SuccessModal
          title={successData.title}
          onDone={() => { setSuccessData(null); onEnrolled() }}
        />
      )}
    </div>
  )
}

function ScheduleSection({ title, stepNumber, isOpen, children }) {
  return (
    <div className={`mb-4 ${!isOpen ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
          {stepNumber}
        </span>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function SessionIcon({ type }) {
  const iconMap = {
    online: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    'in-person': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    hybrid: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  }
  return <span className="text-gray-500">{iconMap[type] || iconMap.online}</span>
}

function EnrolledState({ enrollment, course, onUpdate }) {
  const [completing, setCompleting] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)

  const progress = enrollment.progress ?? 0
  const isCompleted = progress >= 100
  const isRated = course.isRated

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await api.completeEnrollment(enrollment.id)
      setShowCongrats(true)
    } catch {
      // handle error silently
    } finally {
      setCompleting(false)
    }
  }

  const handleRatingSubmit = async () => {
    if (rating === 0) return
    setSubmittingRating(true)
    try {
      await api.submitReview(course.id, { rating })
      setRatingSubmitted(true)
    } catch {
      // handle error silently
    } finally {
      setSubmittingRating(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          {isCompleted ? 'Completed' : 'Enrolled'}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <InfoRow
          icon={<CalendarIcon />}
          label={enrollment.schedule?.weeklySchedule?.label}
        />
        <InfoRow
          icon={<ClockIcon />}
          label={enrollment.schedule?.timeSlot?.label}
        />
        <InfoRow
          icon={<SessionIconSmall />}
          label={enrollment.schedule?.sessionType?.name}
          capitalize
        />
        {enrollment.schedule?.location && (
          <InfoRow icon={<LocationIcon />} label={enrollment.schedule.location} />
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Course Progress</span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!isCompleted && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {completing ? 'Completing...' : (
            <>
              Complete Course
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </>
          )}
        </button>
      )}

      {isCompleted && !isRated && !ratingSubmitted && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm font-medium text-primary mb-3 text-center">Rate your experience</p>
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-0.5"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <button
              onClick={handleRatingSubmit}
              disabled={submittingRating}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </button>
          )}
        </div>
      )}

      {(isRated || ratingSubmitted) && (
        <div className="border-t border-gray-200 pt-4 mt-4 text-center">
          <p className="text-sm text-gray-500">You've already rated this course</p>
        </div>
      )}

      {isCompleted && (
        <div className="mt-3 text-center">
          <span className="text-sm font-medium text-green-600 flex items-center justify-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Course Completed
          </span>
        </div>
      )}

      {showCongrats && (
        <CongratsModal
          title={course.title}
          onDone={() => { setShowCongrats(false); onUpdate() }}
          rating={rating}
          setRating={setRating}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          onSubmitRating={handleRatingSubmit}
          submittingRating={submittingRating}
        />
      )}
    </div>
  )
}

function InfoRow({ icon, label, capitalize = false }) {
  if (!label) return null
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-gray-400">{icon}</span>
      <span className={`text-sm text-gray-600 ${capitalize ? 'capitalize' : ''}`}>{label}</span>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function SessionIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ConflictModal({ conflict, onContinue, onCancel }) {
  return (
    <Modal onClose={onCancel} className="max-w-sm text-center">
      <div className="mb-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Enrollment Conflict</h3>
      <p className="text-sm text-gray-600 mb-6">
        You are already enrolled in "{conflict.courseName}" with the same schedule:
        {' '}{conflict.schedule}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="flex-1 py-2.5 border border-primary text-primary rounded-lg font-medium text-sm hover:bg-primary-light transition-colors"
        >
          Continue Anyway
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}

function ProfilePromptModal({ onComplete, onCancel }) {
  return (
    <Modal onClose={onCancel} className="max-w-sm text-center">
      <div className="mb-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Complete your profile to continue</h3>
      <p className="text-sm text-gray-600 mb-6">
        You need to complete your profile before enrolling in this course.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="flex-1 py-2.5 border border-primary text-primary rounded-lg font-medium text-sm hover:bg-primary-light transition-colors"
        >
          Complete Profile
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}

function SuccessModal({ title, onDone }) {
  return (
    <Modal onClose={onDone} className="max-w-sm text-center">
      <div className="mb-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Enrollment Confirmed!</h3>
      <p className="text-sm text-gray-600 mb-6">
        You've successfully enrolled to the "{title}" Course!
      </p>
      <button
        onClick={onDone}
        className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
      >
        Done
      </button>
    </Modal>
  )
}

function CongratsModal({ title, onDone, rating, setRating, hoverRating, setHoverRating, onSubmitRating, submittingRating }) {
  return (
    <Modal onClose={onDone} className="max-w-sm text-center">
      <div className="mb-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Congratulations!</h3>
      <p className="text-sm text-gray-600 mb-4">
        You've completed "{title}" Course!
      </p>

      <p className="text-sm font-medium text-primary mb-3">Rate your experience</p>
      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-0.5"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
              stroke="#F59E0B"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>

      <button
        onClick={() => { if (rating > 0) onSubmitRating(); onDone() }}
        disabled={submittingRating}
        className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
      >
        Done
      </button>
    </Modal>
  )
}
