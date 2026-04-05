import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ModalProvider } from './context/ModalContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import CourseDetail from './pages/CourseDetail'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<Catalog />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
            </Route>
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
