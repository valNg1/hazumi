import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '../lib/auth'
import { clearSpace, getSpace } from '../lib/space'
import { supabase } from '../lib/supabase'
import Footer from './Footer'
import NavbarNotificationBadge from './NavbarNotificationBadge'

const NAV: Record<'eleve' | 'club', { to: string; label: string }[]> = {
  eleve: [
    { to: '/eleve/accueil', label: 'Accueil' },
    { to: '/eleve/profil', label: 'Mon profil' },
    { to: '/eleve/shiai', label: 'Shiai' },
    { to: '/eleve/judoka-culture', label: 'Judo-Ka' },
    { to: '/eleve/kyu', label: 'Kyu' },
    { to: '/eleve/parcours', label: 'Parcours' },
    { to: '/eleve/entrainements', label: 'Mes entraînements' },
    { to: '/eleve/agenda', label: 'Mon agenda' },
    { to: '/eleve/messages', label: 'Messages' },
  ],
  club: [
    { to: '/club/effectifs', label: 'Effectifs' },
    { to: '/club/rapport', label: 'Inscriptions' },
    { to: '/club/professeurs', label: 'Professeurs' },
    { to: '/club/planning', label: 'Planning' },
    { to: '/club/agenda', label: 'Agenda' },
    { to: '/club/bureau', label: 'Le bureau' },
    { to: '/club/bibliotheque', label: 'Bibliothèque' },
  ],
}

const SPACE_LABEL = { eleve: 'Espace Élève', club: 'Espace Club' }

export default function Layout() {
  const navigate = useNavigate()
  const space = getSpace() ?? 'eleve'
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const readRef = useRef(false)
  const navItems = NAV[space as keyof typeof NAV]

  useEffect(() => {
    if (space !== 'eleve') return
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('judokas').update({ last_active_at: new Date().toISOString() }).eq('user_id', user.id)
    })()
  }, [space])

  useEffect(() => {
    const handler = () => {
      readRef.current = true
      setUnread(0)
    }
    window.addEventListener('hazumi:messages-read', handler)
    return () => window.removeEventListener('hazumi:messages-read', handler)
  }, [])

  useEffect(() => {
    if (space !== 'eleve') return
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: j } = await supabase
        .from('judokas')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!j) return
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('judoka_id', j.id)
        .eq('sender', 'admin')
        .is('read_at', null)
      if (active && !readRef.current) setUnread(count ?? 0)

      channel = supabase
        .channel('badge-judoka')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `judoka_id=eq.${j.id}` },
          (payload) => {
            const m = payload.new as { sender: string; read_at: string | null }
            if (m.sender === 'admin' && m.read_at === null) {
              readRef.current = false
              setUnread((u) => u + 1)
            }
          }
        )
        .subscribe()
    })()
    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [space])

  async function handleSignOut() {
    clearSpace()
    await signOut()
    navigate('/login')
  }

  function switchSpace() {
    clearSpace()
    navigate('/espace')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <header className="bg-[#0A0A0A] px-4 sm:px-6 flex items-stretch sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 py-3 mr-4 sm:mr-8 flex-shrink-0 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Hazumi" className="h-6 w-6 sm:h-7 sm:w-7 object-contain rounded" />
        </Link>

        <nav className="hidden lg:flex items-stretch gap-0.5 flex-1 overflow-x-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 xl:px-4 text-xs uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                  isActive ? '!text-white !border-[#C41230]' : 'text-[#666666] border-transparent hover:text-[#CCCCCC]'
                }`
              }
            >
              {item.label}
              {item.to === '/eleve/messages' && unread > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#C41230] text-white text-[10px] font-bold leading-none">
                  {unread}
                </span>
              )}
              {item.to === '/eleve/messages' && <NavbarNotificationBadge />}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 py-3 ml-auto flex-shrink-0">
          <button
            onClick={switchSpace}
            className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-white transition-colors border border-[#2A2A2A] hover:border-[#444444] rounded-full px-3 py-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${space === 'eleve' ? 'bg-[#C41230]' : 'bg-blue-400'}`} />
            {space !== null ? SPACE_LABEL[space as keyof typeof SPACE_LABEL] : ''}
          </button>
          <button onClick={handleSignOut} className="text-[#666666] hover:text-white transition-colors" title="Se déconnecter">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <button className="lg:hidden text-white ml-auto py-3 pl-3" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </header>

      {menuOpen && (
        <div className="lg:hidden bg-[#111111] border-t border-[#1A1A1A] z-30">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-[#1A1A1A] text-white' : 'text-[#999999] hover:text-white'
                  }`
                }
              >
                {item.label}
                {item.to === '/eleve/messages' && unread > 0 && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#C41230] text-white text-[10px] font-bold leading-none">
                    {unread}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-[#1A1A1A] space-y-2">
            <div className="flex items-center justify-between">
              <button onClick={switchSpace} className="flex items-center gap-2 text-xs text-[#666666]">
                <span className={`w-2 h-2 rounded-full ${space === 'eleve' ? 'bg-[#C41230]' : 'bg-blue-400'}`} />
                {space !== null ? SPACE_LABEL[space as keyof typeof SPACE_LABEL] : ''}
              </button>
              <button onClick={handleSignOut} className="text-xs text-[#666666] uppercase tracking-widest">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
