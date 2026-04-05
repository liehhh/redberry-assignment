import { useState, useEffect, useCallback, useRef } from 'react'
import * as api from '../services/api'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title_asc', label: 'Title: A-Z' },
]

export default function useCatalog() {
  const [categories, setCategories] = useState([])
  const [allTopics, setAllTopics] = useState([])
  const [instructors, setInstructors] = useState([])

  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedInstructors, setSelectedInstructors] = useState([])
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  const [courses, setCourses] = useState([])
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [loading, setLoading] = useState(true)

  const abortRef = useRef(null)

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getTopics(),
      api.getInstructors(),
    ]).then(([catRes, topRes, insRes]) => {
      setCategories(catRes.data.data || [])
      setAllTopics(topRes.data.data || [])
      setInstructors(insRes.data.data || [])
    })
  }, [])

  const visibleTopics = selectedCategories.length > 0
    ? allTopics.filter((t) => selectedCategories.includes(t.categoryId))
    : allTopics

  const fetchCourses = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const params = { page, per_page: 10, sort }

      if (selectedCategories.length > 0) {
        params['categories[]'] = selectedCategories
      }
      if (selectedTopics.length > 0) {
        params['topics[]'] = selectedTopics
      }
      if (selectedInstructors.length > 0) {
        params['instructors[]'] = selectedInstructors
      }

      const res = await api.getCourses(params)
      if (!controller.signal.aborted) {
        setCourses(res.data.data || [])
        setMeta(res.data.meta || { currentPage: 1, lastPage: 1, total: 0 })
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setCourses([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [page, sort, selectedCategories, selectedTopics, selectedInstructors])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
    setSelectedTopics((prev) => {
      const removedCatTopicIds = allTopics
        .filter((t) => t.categoryId === id)
        .map((t) => t.id)
      const isRemoving = selectedCategories.includes(id)
      if (isRemoving) {
        return prev.filter((tId) => !removedCatTopicIds.includes(tId))
      }
      return prev
    })
    setPage(1)
  }

  const toggleTopic = (id) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
    setPage(1)
  }

  const toggleInstructor = (id) => {
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
    setPage(1)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTopics([])
    setSelectedInstructors([])
    setPage(1)
  }

  const activeFilterCount =
    selectedCategories.length + selectedTopics.length + selectedInstructors.length

  return {
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
    sort,
    setSort: (val) => { setSort(val); setPage(1) },
    page,
    setPage,
    courses,
    meta,
    loading,
    SORT_OPTIONS,
  }
}
