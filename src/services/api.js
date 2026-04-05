import axios from 'axios'

const API_BASE = 'https://api.redclass.redberryinternship.ge/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth-error'))
    }
    return Promise.reject(error)
  }
)

// Auth
export const register = (formData) => api.post('/register', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const login = (data) => api.post('/login', data)
export const logout = () => api.post('/logout')
export const getMe = () => api.get('/me')

// Profile
export const updateProfile = (data) => api.post('/profile', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

// Courses
export const getCourses = (params) => api.get('/courses', { params })
export const getFeaturedCourses = () => api.get('/courses/featured')
export const getInProgressCourses = () => api.get('/courses/in-progress')
export const getCourse = (id) => api.get(`/courses/${id}`)

// Filters
export const getCategories = () => api.get('/categories')
export const getTopics = (params) => api.get('/topics', { params })
export const getInstructors = () => api.get('/instructors')

// Schedule
export const getWeeklySchedules = (courseId) => api.get(`/courses/${courseId}/weekly-schedules`)
export const getTimeSlots = (courseId, params) => api.get(`/courses/${courseId}/time-slots`, { params })
export const getSessionTypes = (courseId, params) => api.get(`/courses/${courseId}/session-types`, { params })

// Enrollments
export const getEnrollments = () => api.get('/enrollments')
export const createEnrollment = (data) => api.post('/enrollments', data)
export const completeEnrollment = (id) => api.patch(`/enrollments/${id}/complete`)
export const deleteEnrollment = (id) => api.delete(`/enrollments/${id}`)

// Reviews
export const submitReview = (courseId, data) => api.post(`/courses/${courseId}/reviews`, data)

export default api
