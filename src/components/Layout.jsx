import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import { useModal } from '../context/ModalContext'

export default function Layout() {
  const { activeModal } = useModal()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {activeModal === 'login' && <LoginModal />}
      {activeModal === 'register' && <RegisterModal />}
    </div>
  )
}
