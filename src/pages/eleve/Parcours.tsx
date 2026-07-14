import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { computeProgress, nextRessourceId, toggleCompleted, type ParcoursRessourceLink } from '../../lib/parcoursProgress'
import PremierDanSections from '../../components/PremierDanSections'
import { PREMIER_DAN_TITRE } from '../../lib/premierDanContent'

type ContentType = 'video' | 'article' | 'pdf'

interface ParcoursRow {
  id: string
  titre: string
  description: string | null
  niveau: string | null
  image: string | null
  duree_estimee: string | null
  ordre: number
  publie: boolean
}

interface LinkRow {
  id: string
  parcours_id: string
  ressource_id: string
  ordre: number
  obligatoire: boolean
  commentaire: string | null
}

interface CatalogueRow {
  id: string
  titre: string
  type: ContentType
  url: string | null
  contenu: string | null
  tags: string[] | null
  grade: string | null
  famille: string | null
}

interface Ressource extends CatalogueRow {
  ordre: number
  obligatoire: boolean
  commentaire: string | null
}

const TYPE_LABEL: Record<ContentType, string> = { video: 'Vidéo', article: 'Article', pdf: 'PDF' }

interface ParcoursProps {
  univers?: 'shiai' | 'kyu' | 'judo-ka'
  titre?: string
  intro?: string
  icone?: string
}

export default function Parcours({
  univers,
  titre = 'Parcours',
  intro = 'Des chemins pédagogiques guidés à travers le catalogue Hazumi',
  icone = '🧭',
}: ParcoursProps = {}) {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<ParcoursRow[]>([])
  const [progressByParcours, setProgressByParcours] = useState<Record<string, number>>({})
  const [lessonCount, setLessonCount] = useState<Record<string, number>>({})
  const [lessonIds, setLessonIds] = useState<Set<string>>(new Set())

  const [selected, setSelected] = useState<ParcoursRow | null>(null)
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [reading, setReading] = useState<Ressource | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (!judoka) { setLoading(false); return }
      setJudokaId(judoka.id)
      await loadList(judoka.id)
      setLoading(false)
    }
    load()
  }, [univers])

  async function loadList(jId: string) {
    // Filtre par univers (vue SHIAI/KYU/JUDO-KA) le cas echeant.
    let universIds: string[] | null = null
    if (univers) {
      const { data: pu } = await supabase.from('parcours_univers').select('parcours_id').eq('univers', univers)
      universIds = ((pu as { parcours_id: string }[]) ?? []).map((x) => x.parcours_id)
    }

    let query = supabase.from('parcours').select('*').eq('publie', true)
    if (universIds) query = query.in('id', universIds)
    const { data: parcours } = await query.order('ordre', { ascending: true })
    const rows = (parcours as ParcoursRow[]) ?? []
    setList(rows)

    // Nombre de lecons par parcours.
    const rowIds = rows.map((r) => r.id)
    if (rowIds.length > 0) {
      const { data: liens } = await supabase.from('parcours_ressources').select('parcours_id').in('parcours_id', rowIds)
      const counts: Record<string, number> = {}
      for (const l of (liens as { parcours_id: string }[]) ?? []) counts[l.parcours_id] = (counts[l.parcours_id] ?? 0) + 1
      setLessonCount(counts)
    } else {
      setLessonCount({})
    }

    const { data: ups } = await supabase
      .from('user_parcours')
      .select('parcours_id, progression')
      .eq('judoka_id', jId)
    const map: Record<string, number> = {}
    for (const u of (ups ?? []) as { parcours_id: string; progression: number }[]) {
      map[u.parcours_id] = u.progression
    }
    setProgressByParcours(map)

    // Lecons publiees -> bouton "Etudier" sur les ressources concernees.
    const { data: les } = await supabase.from('lesson').select('ressource_id').eq('published', true)
    setLessonIds(new Set(((les as { ressource_id: string }[]) ?? []).map((l) => l.ressource_id)))
  }

  async function openParcours(p: ParcoursRow) {
    const { data: links } = await supabase
      .from('parcours_ressources')
      .select('*')
      .eq('parcours_id', p.id)
      .order('ordre', { ascending: true })
    const linkRows = (links as LinkRow[]) ?? []
    const ids = linkRows.map((l) => l.ressource_id)

    let catalogue: CatalogueRow[] = []
    if (ids.length > 0) {
      const { data: cat } = await supabase.from('catalogue_hazumi').select('*').in('id', ids)
      catalogue = (cat as CatalogueRow[]) ?? []
    }
    const byId = new Map(catalogue.map((c) => [c.id, c]))
    const merged: Ressource[] = linkRows
      .map((l) => {
        const c = byId.get(l.ressource_id)
        if (!c) return null
        return { ...c, ordre: l.ordre, obligatoire: l.obligatoire, commentaire: l.commentaire }
      })
      .filter((r): r is Ressource => r !== null)

    setRessources(merged)
    setSelected(p)

    const completed = await ensureUserParcours(p.id)
    setCompletedIds(completed)
  }

  async function ensureUserParcours(parcoursId: string): Promise<string[]> {
    if (!judokaId) return []
    const { data: existing } = await supabase
      .from('user_parcours')
      .select('ressources_terminees')
      .eq('judoka_id', judokaId)
      .eq('parcours_id', parcoursId)
      .maybeSingle()
    if (existing) return (existing.ressources_terminees as string[]) ?? []

    await supabase.from('user_parcours').insert({
      judoka_id: judokaId,
      parcours_id: parcoursId,
      progression: 0,
      termine: false,
      ressources_terminees: [],
      date_debut: new Date().toISOString(),
    })
    return []
  }

  async function toggleRessource(ressourceId: string) {
    if (!selected || !judokaId) return
    const next = toggleCompleted(completedIds, ressourceId)
    setCompletedIds(next)

    const links: ParcoursRessourceLink[] = ressources.map((r) => ({
      ressource_id: r.id,
      obligatoire: r.obligatoire,
    }))
    const prog = computeProgress(links, next)
    setProgressByParcours((m) => ({ ...m, [selected.id]: prog.percent }))

    await supabase
      .from('user_parcours')
      .update({
        ressources_terminees: next,
        progression: prog.percent,
        termine: prog.termine,
        date_fin: prog.termine ? new Date().toISOString() : null,
      })
      .eq('judoka_id', judokaId)
      .eq('parcours_id', selected.id)
  }

  function reprendre() {
    const orderedIds = ressources.map((r) => r.id)
    const nextId = nextRessourceId(orderedIds, completedIds)
    const target = ressources.find((r) => r.id === nextId) ?? ressources[0]
    if (target) setReading(target)
  }

  function openRessource(r: Ressource) {
    if (r.type === 'article') {
      setReading(r)
    } else if (r.url) {
      window.open(r.url, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  // ── Vue détail ────────────────────────────────────────────────────────────
  if (selected) {
    const links: ParcoursRessourceLink[] = ressources.map((r) => ({ ressource_id: r.id, obligatoire: r.obligatoire }))
    const prog = computeProgress(links, completedIds)
    const allDone = prog.termine
    const isPremierDan = selected.titre === PREMIER_DAN_TITRE

    const renderRessourceRow = (r: Ressource, i: number) => {
      const done = completedIds.includes(r.id)
      return (
        <div key={r.id} className="bg-white rounded-lg border border-[#E5E5E5] p-3 flex gap-3 items-center hover:shadow-sm transition-shadow">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-xs font-semibold text-[#666666]">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[#0A0A0A] text-sm leading-snug line-clamp-1">{r.titre}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">
                {TYPE_LABEL[r.type]}
              </span>
              {r.famille && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">
                  {r.famille}
                </span>
              )}
            </div>
          </div>
          {lessonIds.has(r.id) ? (
            <Link
              to={`/eleve/lecon/${r.id}`}
              className="flex-shrink-0 text-[#C41230] hover:text-[#9B0E25] transition-colors p-1 text-xs font-semibold"
            >
              Étudier
            </Link>
          ) : (
            <button
              onClick={() => openRessource(r)}
              className="flex-shrink-0 text-[#999999] hover:text-[#0A0A0A] transition-colors p-1 text-xs font-semibold"
            >
              {r.type === 'article' ? 'Lire' : 'Voir'}
            </button>
          )}
          <button
            onClick={() => toggleRessource(r.id)}
            title={done ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
            className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
              done ? 'bg-green-500 border-green-500' : 'border-[#E5E5E5] hover:border-green-400'
            }`}
          >
            <svg className={`w-3.5 h-3.5 ${done ? 'text-white' : 'text-[#DDDDDD]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      )
    }

    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => { setSelected(null); setReading(null) }}
          className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tous les parcours
        </button>

        {isPremierDan ? (
          <>
            <PremierDanSections progress={prog} onCommencer={reprendre} />

            <section id="ressources" className="mt-8">
              <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">Ressources du parcours</h2>
              <div className="space-y-2">{ressources.map(renderRessourceRow)}</div>
            </section>

            <section id="commencer" className="mt-8 bg-white rounded-xl border border-[#E5E5E5] p-6 text-center">
              <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Prêt à démarrer ?</h2>
              <p className="text-sm text-[#666666] mb-4">Lancez votre progression et avancez fiche après fiche, à votre rythme.</p>
              <button
                onClick={reprendre}
                disabled={allDone}
                className="bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                {allDone ? 'Parcours terminé' : prog.done > 0 ? '🥋 Reprendre le parcours' : '🥋 Commencer le parcours'}
              </button>
            </section>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 mb-5">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  {selected.niveau && (
                    <span className="text-[10px] uppercase tracking-widest text-[#999999]">{selected.niveau}</span>
                  )}
                  <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{selected.titre}</h1>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-[#0A0A0A]">{prog.percent}%</p>
                  <p className="text-xs text-[#999999]">{prog.done}/{prog.total} terminé{prog.done > 1 ? 's' : ''}</p>
                </div>
              </div>
              {selected.description && <p className="text-sm text-[#666666] mb-3">{selected.description}</p>}
              <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#C41230] rounded-full transition-all duration-500" style={{ width: `${prog.percent}%` }} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={reprendre}
                  disabled={allDone}
                  className="bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
                >
                  {allDone ? 'Parcours terminé' : prog.done > 0 ? 'Reprendre' : 'Commencer'}
                </button>
                {selected.duree_estimee && <span className="text-xs text-[#999999]">{selected.duree_estimee}</span>}
              </div>
            </div>

            <div className="space-y-2">{ressources.map(renderRessourceRow)}</div>
          </>
        )}

        {reading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setReading(null)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">{reading.titre}</h2>
              {(reading.famille || reading.grade) && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {reading.famille && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">{reading.famille}</span>
                  )}
                  {reading.grade && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">{reading.grade}</span>
                  )}
                </div>
              )}
              <p className="text-sm text-[#333333] whitespace-pre-wrap">{reading.contenu}</p>
              {(reading.tags ?? []).length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
                  <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-2">Mots-clés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(reading.tags ?? []).map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#666666] rounded border border-[#E5E5E5]">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => { toggleRessourceIfNeeded(reading.id); setReading(null) }}
                  className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                >
                  {completedIds.includes(reading.id) ? 'Fermer' : 'Marquer terminé'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Vue liste ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: '#C41230' }}>{icone}</span>
          <div>
            <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight">{titre}</h1>
            <p className="text-[#666666] text-sm">{intro}</p>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-[#999999] text-center py-16">Aucun parcours disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => {
            const percent = progressByParcours[p.id] ?? 0
            return (
              <button
                key={p.id}
                onClick={() => openParcours(p)}
                className="text-left bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#CCCCCC] hover:shadow-sm transition-all flex flex-col"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-[#0A0A0A] to-[#3A0A12] flex items-center justify-center">
                  {p.image ? (
                    <img src={p.image} alt={p.titre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🥋</span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  {p.niveau && <span className="text-[10px] uppercase tracking-widest text-[#999999] mb-1">{p.niveau}</span>}
                  <h3 className="font-bold text-[#0A0A0A] text-sm leading-snug mb-1">{p.titre}</h3>
                  {p.description && <p className="text-xs text-[#666666] line-clamp-2 mb-3 flex-1">{p.description}</p>}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1 text-[10px] text-[#999999]">
                      <span>{lessonCount[p.id] ?? 0} leçon{(lessonCount[p.id] ?? 0) > 1 ? 's' : ''}</span>
                      {p.duree_estimee && <span>{p.duree_estimee}</span>}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#999999]">{percent > 0 ? `${percent}% terminé` : 'Non commencé'}</span>
                    </div>
                    <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-[#C41230] rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#C41230] group-hover:bg-[#9B0E25] rounded-lg px-3 py-1.5">
                      ▶ {percent > 0 ? 'Continuer' : 'Commencer'}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  function toggleRessourceIfNeeded(ressourceId: string) {
    if (!completedIds.includes(ressourceId)) toggleRessource(ressourceId)
  }
}
