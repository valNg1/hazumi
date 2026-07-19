import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import MonEspaceNav from '../../components/MonEspaceNav'
import ProgressionDashboard from '../../components/ProgressionDashboard'

/**
 * Ma progression = progression dans les parcours, et rien d'autre.
 * Le suivi du curriculum par ceinture a ete retire de cette page sur decision
 * du Product Owner (retour de recette WP 1.2, point 11). Le curriculum reste
 * disponible dans lib/curriculum.ts pour un usage ulterieur.
 */
export default function Progression() {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let actif = true
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: judoka } = await supabase
        .from('judokas')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!actif) return
      if (judoka) setJudokaId(judoka.id)
      setLoading(false)
    }
    charger()
    return () => { actif = false }
  }, [])

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div>
      <MonEspaceNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Ma progression</h1>
        <p className="text-[#999999] text-sm mt-0.5">Ce que tu étais en train d’apprendre, et où tu en es.</p>
      </div>

      <ProgressionDashboard judokaId={judokaId} />
    </div>
  )
}
