import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PARCOURS_LIST, isParcourActive, toggleParcour } from '../lib/parcours'

export default function ParcoursList() {
  const [parcours, setParcours] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadParcours()
  }, [])

  async function loadParcours() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('judokas')
      .select('parcours')
      .eq('user_id', user.id)
      .single()

    if (data?.parcours) {
      setParcours(data.parcours)
    }
    setLoading(false)
  }

  async function handleToggleParcour(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newParcours = toggleParcour(parcours, id)
    setParcours(newParcours)

    await supabase
      .from('judokas')
      .update({ parcours: newParcours })
      .eq('user_id', user.id)
  }

  if (loading) {
    return <div className="h-32 flex items-center justify-center text-[#999999]">Chargement...</div>
  }

  return (
    <div className="mb-12">
      <h2 className="text-lg font-semibold text-[#0A0A0A] mb-6">Tes parcours de progression</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PARCOURS_LIST.map(p => {
          const isActive = isParcourActive(parcours, p.id)
          return (
            <button
              key={p.id}
              onClick={() => handleToggleParcour(p.id)}
              className={`p-5 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? 'border-[#C41230] bg-white text-[#0A0A0A]'
                  : 'border-[#E5E5E5] bg-[#F5F5F5] text-[#999999]'
              } hover:scale-105 active:scale-95`}
            >
              <div className="text-3xl mb-2">{p.icon}</div>
              <h3 className={`font-semibold text-sm mb-1 ${isActive ? 'text-[#0A0A0A]' : 'text-[#999999]'}`}>
                {p.label}
              </h3>
              <p className="text-xs leading-relaxed">{p.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
