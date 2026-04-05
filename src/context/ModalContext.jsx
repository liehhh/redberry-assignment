import { createContext, useContext, useState } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null)

  const openLogin = () => setActiveModal('login')
  const openRegister = () => setActiveModal('register')
  const openProfile = () => setActiveModal('profile')
  const closeModal = () => setActiveModal(null)

  return (
    <ModalContext.Provider value={{
      activeModal,
      openLogin,
      openRegister,
      openProfile,
      closeModal,
    }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
