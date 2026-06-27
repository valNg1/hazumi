import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Judoka {
  id: string
  first_name: string
  last_name: string
  email: string
}

export default function AdminMessages() {
  const { judokaId } = useParams<{ judokaId: string }>()
  const navigate = useNavigate()
  const [judoka, setJudoka] = useState<Judoka | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!judokaId) {
      navigate('/admin/dashboard')
      return
    }

    loadJudoka()
  }, [judokaId])

  async function loadJudoka() {
    const { data } = await supabase
      .from('judokas')
      .select('id, first_name, last_name, email')
      .eq('id', judokaId)
      .single()

    if (data) {
      setJudoka(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!judoka) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">Élève non trouvé</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-[#F5F5F5] rounded transition-colors"
          title="Retour"
        >
          <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">
            {judoka.first_name} {judoka.last_name}
          </h1>
          <p className="text-[#666666]">{judoka.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 text-center">
        <p className="text-[#999999] mb-4">Le fil de messagerie sera implémenté prochainement</p>
        <p className="text-sm text-[#666666]">Cette section vous permettra de communiquer directement avec cet élève.</p>
      </div>
    </div>
  )
}
