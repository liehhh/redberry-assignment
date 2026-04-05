import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import * as api from '../services/api'

export default function Dashboard() {
  return (
    <div className="max-w-[1920px] mx-auto">
      <HeroBanner />
      <div className="px-8 lg:px-16">
        <ContinueLearning />
        <FeaturedCourses />
      </div>
    </div>
  )
}

/* ─── Hero Banner ─── */
function HeroBanner() {
  const [current, setCurrent] = useState(0)

  const slides = [
    {
      title: 'Start learning something new today',
      subtitle: 'Explore a wide range of expert-led courses in tech, design, and business. Find the skills you need to grow your career and learn at your own pace.',
      gradient: 'from-purple-600 via-pink-500 to-orange-400',
    },
    {
      title: 'Pick up where you left off',
      subtitle: 'Continue your learning journey and complete courses you\'ve already started. Synapse with AI, grow with us.',
      gradient: 'from-orange-500 via-red-500 to-yellow-500',
    },
    {
      title: 'Learn together, grow faster',
      subtitle: 'Join thousands of learners worldwide. Collaborate, share, and accelerate your growth with our community.',
      gradient: 'from-teal-400 via-emerald-500 to-blue-400',
    },
  ]

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1))

  return (
    <div className="relative mx-8 lg:mx-16 mt-6 rounded-2xl overflow-hidden">
      <div
        className={`relative bg-gradient-to-r ${slides[current].gradient} px-10 py-14 md:py-20 transition-all duration-500`}
      >
        <div className="max-w-xl relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
            {slides[current].title}
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
            {slides[current].subtitle}
          </p>
          <Link
            to="/courses"
            className="inline-block px-6 py-2.5 bg-white text-primary font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse Courses
          </Link>
        </div>

        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors z-10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors z-10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Continue Learning (Courses in Progress) ─── */
function ContinueLearning() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { openLogin, openSidebar } = useModal()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    api.getInProgressCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  return (
    <section className="mt-10 mb-10">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
          <p className="text-sm text-gray-500">Pick up where you left off</p>
        </div>
        {isAuthenticated && courses.length > 0 && (
          <button onClick={openSidebar} className="text-sm font-medium text-primary hover:underline">
            See All
          </button>
        )}
      </div>

      {/* Locked state for unauthenticated users */}
      {!isAuthenticated && !authLoading && (
        <div className="relative mt-4">
          {/* Blurred mock cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 blur-sm select-none pointer-events-none">
            {[1, 2, 3].map((i) => (
              <MockCourseCard key={i} />
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-xl">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <p className="text-gray-600 font-medium mb-3">Sign in to track your learning progress</p>
            <button
              onClick={openLogin}
              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isAuthenticated && loading && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-64" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {isAuthenticated && !loading && courses.length === 0 && (
        <div className="mt-4 text-center py-12 bg-gray-50 rounded-xl">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <p className="text-gray-600 font-medium mb-1">You haven't enrolled in any courses yet.</p>
          <p className="text-sm text-gray-500 mb-4">Start your learning journey today!</p>
          <Link
            to="/courses"
            className="inline-block px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Real course cards */}
      {isAuthenticated && !loading && courses.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.slice(0, 4).map((enrollment) => (
            <InProgressCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ─── In-Progress Course Card ─── */
function InProgressCard({ enrollment }) {
  const course = enrollment.course || enrollment
  const progress = enrollment.progress ?? 0

  return (
    <Link
      to={`/courses/${course.id}`}
      className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded-full text-gray-700">
          ★ {course.avgRating || '—'}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">
          {course.instructor?.name || enrollment.instructor?.name}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2">{course.title}</h3>

        {/* Progress bar */}
        <div className="mb-1.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">{progress}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button className="mt-3 w-full py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors">
          View
        </button>
      </div>
    </Link>
  )
}

/* ─── Mock Card (for blurred locked state) ─── */
function MockCourseCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="h-40 bg-gray-300" />
      <div className="p-4">
        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-1" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-1.5 bg-gray-200 rounded-full w-full mb-3" />
        <div className="h-9 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  )
}

/* ─── Featured Courses ("Start Learning Today") ─── */
function FeaturedCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFeaturedCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mb-16">
      <div className="mb-1">
        <h2 className="text-2xl font-bold text-gray-900">Start Learning Today</h2>
        <p className="text-sm text-gray-500">Choose from our most popular courses and begin your journey</p>
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-80" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <FeaturedCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ─── Featured Course Card ─── */
function FeaturedCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {course.instructor?.avatar && (
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
          <span className="text-xs text-gray-500">{course.instructor?.name}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            Starting from ${course.basePrice}
          </span>
          <span className="text-sm font-medium text-primary group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}
