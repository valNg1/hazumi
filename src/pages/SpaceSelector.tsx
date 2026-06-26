import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSpace } from '../lib/space'
import { supabase } from '../lib/supabase'
import { isBenDemoAccount } from '../lib/demo'
import Footer from '../components/Footer'

export default function SpaceSelector() {
  const navigate = useNavigate()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isBen, setIsBen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const ben = await isBenDemoAccount(user.email)
      setIsBen(ben)

      const { data, error } = await supabase
        .from('judokas')
        .select('full_name, photo_url, role, club_id')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.warn('[SpaceSelector] Erreur chargement judoka:', error.message)
        setRole(null)
      } else if (data) {
        console.log('[SpaceSelector] Judoka chargé:', data.role)
        setPhotoUrl(data.photo_url ?? null)
        setUserName(data.full_name ?? null)
        setRole(data.role ?? null)
      }
    })
  }, [])

  function choose(space: 'eleve' | 'club') {
    setSpace(space)
    navigate(space === 'eleve' ? '/eleve/accueil' : '/club/effectifs')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-0 mb-6">
              {photoUrl ? (
                <img src={photoUrl} alt={userName ?? ''} className="h-16 w-16 rounded-full object-cover border-2 border-[#2A2A2A]" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#1A1A1A] border-2 border-[#2A2A2A] flex items-center justify-center text-[#444444] text-xl font-bold">
                  {userName ? userName[0].toUpperCase() : '?'}
                </div>
              )}
            </div>
            {userName && <p className="text-[#C41230] text-xl font-bold mb-2">Konnichiwa! 👋</p>}
            <p className="text-[#444444] tracking-wider text-sm">Choisissez votre espace</p>
          </div>

          <div className={`grid gap-6 ${role === 'judoka' && !isBen ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-2'}`}>
            <SpaceCard
              title="Espace Élève"
              description="Ma progression, mes cours, mes entraînements"
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              onClick={() => choose('eleve')}
            />
            {(role !== 'judoka' || isBen) && (
              <SpaceCard
                title="Espace Club"
                description="Effectifs, planning, direction technique"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                onClick={() => choose('club')}
              />
            )}
          </div>
        </div>
      </div>

      <Footer dark />
    </div>
  )
}

function SpaceCard({ title, description, icon, onClick }: {
  title: string; description: string; icon: React.ReactNode; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] hover:border-[#C41230] rounded-2xl p-10 text-left transition-all group"
    >
      <div className="text-[#444444] group-hover:text-[#C41230] mb-6 transition-colors">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#666666] text-sm leading-relaxed">{description}</p>
    </button>
  )
}
