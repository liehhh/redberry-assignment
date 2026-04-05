import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import ProfileModal from './ProfileModal'
import EnrolledSidebar from './EnrolledSidebar'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'

export default function Layout() {
  const { loading } = useAuth()
  const { activeModal } = useModal()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {activeModal === 'login' && <LoginModal />}
      {activeModal === 'register' && <RegisterModal />}
      {activeModal === 'profile' && <ProfileModal />}
      <EnrolledSidebar />
    </div>
  )
}
