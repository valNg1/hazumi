import { useNavigate } from 'react-router-dom'
import { setSpace } from '../lib/space'

export default function SpaceSelector() {
  const navigate = useNavigate()

  function choose(space: 'eleve' | 'club') {
    setSpace(space)
    navigate(space === 'eleve' ? '/eleve/profil' : '/club/effectifs')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-16">
          <img src="/logo.png" alt="Hazumi" className="h-28 w-28 object-contain mb-6" />
          <h1 className="text-white text-3xl font-bold tracking-widest uppercase">Hazumi</h1>
          <p className="text-[#666666] tracking-wider mt-2">Choisissez votre espace</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
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
        </div>
      </div>
    </div>
  )
}

function SpaceCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
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
