import { useNavigate } from 'react-router-dom'

interface ProGateProps {
  isPro: boolean
  type: 'judoka' | 'club'
  children: React.ReactNode
  feature?: string
}

export default function ProGate({ isPro, type, children, feature }: ProGateProps) {
  const navigate = useNavigate()

  if (isPro) return <>{children}</>

  const price = type === 'judoka' ? '1€/mois' : '10€/mois'
  const dest = type === 'judoka' ? '/eleve/profil' : '/club/bureau'

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-40 overflow-hidden max-h-64">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 rounded-xl">
        <div className="text-center px-6">
          <span className="text-2xl">🔒</span>
          <p className="mt-2 text-sm font-semibold text-[#0A0A0A]">
            {feature ?? 'Fonctionnalité Pro'}
          </p>
          <p className="mt-1 text-xs text-[#999999]">Passez à la version Pro pour accéder à cette fonctionnalité.</p>
        </div>
        <button
          onClick={() => navigate(dest)}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Passer Pro — {price}
        </button>
      </div>
    </div>
  )
}
