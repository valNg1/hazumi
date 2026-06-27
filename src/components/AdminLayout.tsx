import { Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { signOut } from '../lib/auth'
import Footer from './Footer'

export default function AdminLayout() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <header className="bg-[#0A0A0A] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Hazumi" className="h-6 w-6 sm:h-7 sm:w-7 object-contain rounded" />
          <h1 className="text-white font-semibold text-sm sm:text-base hidden sm:block">Dashboard Admin</h1>
        </div>

        <button onClick={handleSignOut} className="text-[#666666] hover:text-white transition-colors" title="Se déconnecter">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
