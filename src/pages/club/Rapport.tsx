import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Belt } from '../../types'

const BELT_COLORS: Record<Belt, string> = {
  blanche: '#FFFFFF', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E', noire: '#0A0A0A',
}

interface Judoka {
  id: string
  full_name: string
  belt: Belt
  email?: string
  photo_url?: string
  cotisation_paid?: boolean
  cert_medical_ok?: boolean
  cert_medical_url?: string
  virement_url?: string
  license_number?: string
  license_expiry?: string
}

function statutDossier(j: Judoka) {
  const items = [
    { label: 'Cotisation', ok: !!j.cotisation_paid },
    { label: 'Certif. médical', ok: !!j.cert_medical_ok },
    { label: 'Preuve virement', ok: !!j.virement_url },
  ]
  const done = items.filter(i => i.ok).length
  return { items, done, total: items.length, complet: done === items.length }
}

type Filtre = 'tous' | 'incomplets' | 'complets'

export default function Rapport() {
  const navigate = useNavigate()
  const [judokas, setJudokas] = useState<Judoka[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('judokas').select('*').order('full_name')
      setJudokas(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const complets = judokas.filter(j => statutDossier(j).complet)
  const incomplets = judokas.filter(j => !statutDossier(j).complet)

  const filtered = judokas
    .filter(j => filtre === 'tous' ? true : filtre === 'complets' ? statutDossier(j).complet : !statutDossier(j).complet)
    .filter(j => j.full_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Rapport d'inscription</h1>
        <p className="text-[#666666] text-sm mt-1">Saison en cours</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Inscrits" value={judokas.length} total={judokas.length} color="gray" />
        <StatCard label="Dossiers complets" value={complets.length} total={judokas.length} color="green" />
        <StatCard label="À relancer" value={incomplets.length} total={judokas.length} color="amber" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="bg-white border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C41230] transition-colors flex-1"
        />
        <div className="flex gap-2">
          {(['tous', 'incomplets', 'complets'] as Filtre[]).map(f => (
            <button key={f} onClick={() => setFiltre(f)}
              className={`px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors ${filtre === f ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(j => {
            const { items, done, total, complet } = statutDossier(j)
            return (
              <div key={j.id}
                className="bg-white rounded-xl border border-[#E5E5E5] px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-[#CCCCCC] transition-colors"
                onClick={() => navigate(`/club/effectifs/${j.id}`)}>
                <div className="w-9 h-9 rounded-full bg-[#F0F0F0] flex-shrink-0 overflow-hidden">
                  {j.photo_url
                    ? <img src={j.photo_url} alt="" className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-[#666666]">
                        {j.full_name.charAt(0).toUpperCase()}
                      </span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{j.full_name}</p>
                    <span className="inline-block w-2.5 h-2.5 rounded-full border border-[#DDDDDD] flex-shrink-0"
                      style={{ backgroundColor: BELT_COLORS[j.belt] }} />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {items.map(item => (
                      <span key={item.label} className={`text-xs flex items-center gap-1 ${item.ok ? 'text-green-600' : 'text-amber-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-green-500' : 'bg-amber-400'}`} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1">
                    {[...Array(total)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < done ? 'bg-green-500' : 'bg-[#F0F0F0]'}`} />
                    ))}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${complet ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {done}/{total}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, total, color }: { label: string; value: number; total: number; color: 'gray' | 'green' | 'amber' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const colors = {
    gray: 'text-[#0A0A0A]',
    green: 'text-green-600',
    amber: 'text-amber-600',
  }
  const bar = { gray: 'bg-[#0A0A0A]', green: 'bg-green-500', amber: 'bg-amber-400' }
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-5">
      <p className="text-xs uppercase tracking-widest text-[#999999] mb-2">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold ${colors[color]}`}>{value}</p>
      <div className="mt-3 h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bar[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
