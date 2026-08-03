import { useEffect, useState } from 'react'
import { fetchAllParcours, setParcoursPublie, type AdminParcours } from '../../lib/adminParcours'

export default function AdminParcoursPage() {
  const [parcours, setParcours] = useState<AdminParcours[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => { charger() }, [])

  async function charger() {
    setLoading(true)
    try {
      setParcours(await fetchAllParcours())
      setErreur(null)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur de chargement.')
    }
    setLoading(false)
  }

  async function basculer(p: AdminParcours) {
    setBusy(p.id); setErreur(null)
    try {
      await setParcoursPublie(p.id, !p.publie)
      setParcours((list) => list.map((x) => (x.id === p.id ? { ...x, publie: !x.publie } : x)))
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Impossible de modifier la publication.')
    }
    setBusy(null)
  }

  const publies = parcours.filter((p) => p.publie).length

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Parcours</h1>
        <p className="text-[#666666] text-sm">
          Tous les parcours, publiés ou non. {parcours.length} au total · {publies} publié{publies !== 1 ? 's' : ''}.
        </p>
      </div>

      {erreur && <p className="text-sm text-[#C41230] mb-3">{erreur}</p>}

      {parcours.length === 0 ? (
        <p className="text-sm text-[#999999] text-center py-10">Aucun parcours.</p>
      ) : (
        <div className="space-y-2">
          {parcours.map((p) => (
            <div key={p.id} className="bg-white rounded-lg border border-[#E5E5E5] p-3 flex items-center gap-3">
              <span className="flex-shrink-0 text-[10px] font-semibold text-[#999999] tabular-nums w-8 text-center">{p.ordre}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#0A0A0A] text-sm leading-snug truncate">{p.titre}</h3>
                {p.niveau && <p className="text-xs text-[#999999]">{p.niveau}</p>}
              </div>
              <span
                className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 border ${
                  p.publie
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-[#999999] bg-[#F5F5F5] border-[#E5E5E5]'
                }`}
              >
                {p.publie ? 'Publié' : 'Non publié'}
              </span>
              <button
                onClick={() => basculer(p)}
                disabled={busy === p.id}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                  p.publie
                    ? 'border-[#E5E5E5] text-[#666666] hover:border-[#C41230] hover:text-[#C41230]'
                    : 'border-[#C41230] bg-[#C41230] text-white hover:bg-[#9B0E25]'
                }`}
              >
                {busy === p.id ? '…' : p.publie ? 'Dépublier' : 'Publier'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
