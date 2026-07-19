import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { universLabel, type Univers } from '../lib/bibliotheque'
import { buildDashboard, playlistProgress, type Dashboard, type ElementProgression } from '../lib/progressionDashboard'

function BarreProgression({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-[#C41230] rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
    </div>
  )
}

function Carte({ element, onReprendre }: { element: ElementProgression; onReprendre: (e: ElementProgression) => void }) {
  const officiel = element.origine === 'hazumi'
  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col ${officiel ? 'border-[#E5E5E5]' : 'border-dashed border-[#CCCCCC]'}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className={`text-[9px] uppercase tracking-widest rounded-full px-2 py-0.5 font-bold ${
          officiel ? 'bg-[#C41230] text-white' : 'border border-[#CCCCCC] text-[#666666]'
        }`}>
          {officiel ? 'Officiel' : `Playlist · ${element.univers ? universLabel(element.univers) : 'perso'}`}
        </span>
        <span className="text-xs font-bold text-[#0A0A0A]">{element.percent}%</span>
      </div>

      <h3 className="font-bold text-[#0A0A0A] text-sm leading-snug mb-2">{element.nom}</h3>

      <div className="mt-auto">
        <p className="text-[10px] text-[#999999] mb-1">
          {element.done} / {element.total} ressource{element.total !== 1 ? 's' : ''}
        </p>
        <BarreProgression percent={element.percent} />
        <button
          onClick={() => onReprendre(element)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#C41230] hover:bg-[#9B0E25] rounded-lg px-3 py-1.5 transition-colors"
        >
          ▶ Reprendre
        </button>
      </div>
    </div>
  )
}

/**
 * Tableau de bord : ce que le judoka etait en train d'apprendre, parcours Hazumi
 * et playlists confondus, l'activite la plus recente en premier.
 */
export default function ProgressionDashboard({ judokaId }: { judokaId: string | null }) {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let actif = true
    async function charger() {
      if (!judokaId) { setLoading(false); return }

      const [{ data: up }, { data: pls }, { data: cat }] = await Promise.all([
        supabase.from('user_parcours').select('parcours_id, ressources_terminees, updated_at').eq('judoka_id', judokaId),
        supabase.from('playlists_collections').select('id, nom, tags, parcours, created_at').eq('judoka_id', judokaId),
        supabase.from('catalogue_hazumi').select('id, tags'),
      ])
      if (!actif) return

      const avancement = (up as { parcours_id: string; ressources_terminees: string[] | null; updated_at: string | null }[]) ?? []
      const idsParcours = avancement.map((a) => a.parcours_id)

      const [{ data: parcoursRows }, { data: liens }] = await Promise.all([
        idsParcours.length
          ? supabase.from('parcours').select('id, titre').in('id', idsParcours)
          : Promise.resolve({ data: [] as { id: string; titre: string }[] }),
        idsParcours.length
          ? supabase.from('parcours_ressources').select('parcours_id, ressource_id').in('parcours_id', idsParcours)
          : Promise.resolve({ data: [] as { parcours_id: string; ressource_id: string }[] }),
      ])
      if (!actif) return

      const titres = new Map(((parcoursRows as { id: string; titre: string }[]) ?? []).map((p) => [p.id, p.titre]))
      const totalParParcours = new Map<string, number>()
      ;((liens as { parcours_id: string }[]) ?? []).forEach((l) => {
        totalParParcours.set(l.parcours_id, (totalParParcours.get(l.parcours_id) ?? 0) + 1)
      })

      const parcoursEnCours = avancement
        .filter((a) => titres.has(a.parcours_id))
        .map((a) => ({
          id: a.parcours_id,
          nom: titres.get(a.parcours_id)!,
          done: (a.ressources_terminees ?? []).length,
          total: totalParParcours.get(a.parcours_id) ?? 0,
          derniereActivite: a.updated_at ?? '',
        }))

      const toutesTerminees = avancement.flatMap((a) => a.ressources_terminees ?? [])
      const items = ((cat as { id: string; tags: string[] | null }[]) ?? []).map((c) => ({ id: c.id, tags: c.tags ?? [] }))

      const playlistsEnCours = (((pls as { id: string; nom: string; tags: string[] | null; parcours: Univers; created_at: string | null }[]) ?? [])).map((pl) => {
        const { done, total } = playlistProgress(items, pl.tags ?? [], toutesTerminees)
        return { id: pl.id, nom: pl.nom, univers: pl.parcours, done, total, derniereActivite: pl.created_at ?? '' }
      })

      setDashboard(buildDashboard(parcoursEnCours, playlistsEnCours))
      setLoading(false)
    }
    charger()
    return () => { actif = false }
  }, [judokaId])

  function reprendre(e: ElementProgression) {
    if (e.origine === 'hazumi') navigate(`/parcours?p=${e.id}`)
    else navigate(`/bibliotheque?playlist=${e.id}`)
  }

  if (loading) return <p className="text-sm text-[#999999] py-6">Chargement de ta progression…</p>

  if (!dashboard || dashboard.total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-white/60 p-8 text-center mb-8">
        <p className="text-sm text-[#666666] mb-2">Tu n’as pas encore commencé de parcours.</p>
        <button
          onClick={() => navigate('/parcours')}
          className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold"
        >
          Découvrir les parcours
        </button>
      </div>
    )
  }

  return (
    <div className="mb-10">
      {dashboard.enCours.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-[#0A0A0A] mb-3">Reprendre où tu en étais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {dashboard.enCours.map((e) => (
              <Carte key={`${e.origine}:${e.id}`} element={e} onReprendre={reprendre} />
            ))}
          </div>
        </>
      )}

      {dashboard.termines.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-[#0A0A0A] mb-3">
            Terminés <span className="text-[10px] font-normal text-[#999999]">{dashboard.nbTermines}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.termines.map((e) => (
              <Carte key={`${e.origine}:${e.id}`} element={e} onReprendre={reprendre} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
