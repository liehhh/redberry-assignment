import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useCatalog from '../hooks/useCatalog'

export default function Catalog() {
  const catalog = useCatalog()

  return (
    <div className="max-w-[1920px] mx-auto px-8 lg:px-16 py-8">
      <div className="flex gap-8">
        <FilterSidebar catalog={catalog} />
        <div className="flex-1 min-w-0">
          <CourseGridHeader catalog={catalog} />
          <CourseGrid catalog={catalog} />
          <Pagination catalog={catalog} />
        </div>
      </div>
    </div>
  )
}

function FilterSidebar({ catalog }) {
  const {
    categories,
    visibleTopics,
    instructors,
    selectedCategories,
    selectedTopics,
    selectedInstructors,
    toggleCategory,
    toggleTopic,
    toggleInstructor,
    clearFilters,
    activeFilterCount,
  } = catalog

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-20">
        <FilterSection title="Categories">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Topics">
          <div className="flex flex-wrap gap-2">
            {visibleTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  selectedTopics.includes(topic.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {topic.name}
              </button>
            ))}
            {visibleTopics.length === 0 && (
              <p className="text-xs text-gray-400">No topics available</p>
            )}
          </div>
        </FilterSection>

        <FilterSection title="Instructors">
          <div className="space-y-2">
            {instructors.map((inst) => (
              <button
                key={inst.id}
                onClick={() => toggleInstructor(inst.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  selectedInstructors.includes(inst.id)
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <img
                  src={inst.avatar}
                  alt={inst.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="truncate">{inst.name}</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {activeFilterCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && children}
    </div>
  )
}

function CourseGridHeader({ catalog }) {
  const { sort, setSort, meta, SORT_OPTIONS } = catalog
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label

  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-gray-500">
        {meta.total > 0
          ? `Showing ${meta.total} course${meta.total !== 1 ? 's' : ''}`
          : 'No courses found'}
      </p>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-sm text-gray-700 font-medium"
        >
          Sort By:{' '}
          <span className="text-primary">{currentLabel}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSort(option.value)
                  setDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  sort === option.value
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CourseGrid({ catalog }) {
  const { courses, loading } = catalog

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-40" />
            <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
            <div className="mt-2 h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <p className="text-gray-500 font-medium">No courses found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow bg-white"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded-full text-gray-700">
          {course.category?.name}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-sm font-bold text-gray-900">${course.basePrice}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {course.durationWeeks} weeks
          </div>
        </div>
        <button className="mt-3 w-full py-2 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors">
          View
        </button>
      </div>
    </Link>
  )
}

function Pagination({ catalog }) {
  const { page, setPage, meta, loading } = catalog

  if (meta.lastPage <= 1 || loading) return null

  const getPageNumbers = () => {
    const pages = []
    const last = meta.lastPage

    if (last <= 7) {
      for (let i = 1; i <= last; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    if (page > 3) pages.push('...')

    const start = Math.max(2, page - 1)
    const end = Math.min(last - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (page < last - 2) pages.push('...')

    pages.push(last)
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => setPage(page + 1)}
        disabled={page === meta.lastPage}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
