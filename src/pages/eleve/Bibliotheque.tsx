import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { buildRails, searchResources, UNIVERS_OPTIONS, type Ressource, type Univers } from '../../lib/bibliotheque'
import { renderMarkdown } from '../../lib/markdown'
import ResourceRail from '../../components/bibliotheque/ResourceRail'

export default function Bibliotheque() {
  const navigate = useNavigate()
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [lessonIds, setLessonIds] = useState<Set<string>>(new Set())
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [article, setArticle] = useState<Ressource | null>(null)

  // Creation de playlist : c'est le seul moment ou l'univers intervient.
  const [modeSelection, setModeSelection] = useState(false)
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [nomPlaylist, setNomPlaylist] = useState('')
  const [universChoisi, setUniversChoisi] = useState<Univers>('kyu')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (judoka && actif) setJudokaId(judoka.id)

      // Toutes les ressources Hazumi, tous univers confondus : plus de choix prealable.
      const [{ data: cat }, { data: lessons }] = await Promise.all([
        supabase.from('catalogue_hazumi').select('id, titre, type, parcours, tags, grade, famille, url, contenu'),
        supabase.from('lesson').select('ressource_id').eq('published', true),
      ])
      if (!actif) return
      setRessources(((cat as (Ressource & { contenu: string | null })[]) ?? []))
      setLessonIds(new Set(((lessons as { ressource_id: string }[]) ?? []).map((l) => l.ressource_id)))
      setLoading(false)
    }
    charger()
    return () => { actif = false }
  }, [])

  const resultats = useMemo(() => searchResources(ressources, recherche), [ressources, recherche])
  const rails = useMemo(() => buildRails(resultats), [resultats])

  function ouvrir(r: Ressource) {
    if (lessonIds.has(r.id)) { navigate(`/eleve/lecon/${r.id}`); return }
    if (r.type === 'video' && r.url) { window.open(r.url, '_blank'); return }
    setArticle(r)
  }

  function basculerSelection(r: Ressource) {
    setSelection((prev) => {
      const suivant = new Set(prev)
      if (suivant.has(r.id)) suivant.delete(r.id)
      else suivant.add(r.id)
      return suivant
    })
  }

  // Une playlist est un filtre par tags : on agrege les tags des ressources choisies.
  const tagsSelection = useMemo(() => {
    const tags = new Set<string>()
    ressources.filter((r) => selection.has(r.id)).forEach((r) => r.tags?.forEach((t) => tags.add(t)))
    return Array.from(tags)
  }, [ressources, selection])

  async function creerPlaylist() {
    if (!judokaId || !nomPlaylist.trim()) { setErreur('Donne un nom à ta playlist.'); return }
    if (tagsSelection.length === 0) { setErreur('Les ressources choisies ne portent aucun tag exploitable.'); return }
    setEnregistrement(true)
    setErreur(null)
    const { error } = await supabase.from('playlists_collections').insert({
      judoka_id: judokaId,
      nom: nomPlaylist.trim(),
      tags: tagsSelection,
      parcours: universChoisi,
    })
    setEnregistrement(false)
    if (error) { setErreur(`Impossible de créer la playlist : ${error.message}`); return }
    setModaleOuverte(false)
    setModeSelection(false)
    setSelection(new Set())
    setNomPlaylist('')
    setSucces('Playlist créée. Retrouve-la dans Parcours.')
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Bibliothèque</h1>
          <p data-testid="section-intro" className="text-[#999999] text-sm mt-0.5">
            Toutes les ressources Hazumi. Parcours-les librement, ou regroupe-les dans une playlist.
          </p>
        </div>
        <button
          onClick={() => { setModeSelection((v) => !v); setSelection(new Set()); setSucces(null) }}
          className={`text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
            modeSelection ? 'bg-[#0A0A0A] text-white' : 'bg-[#C41230] hover:bg-[#9B0E25] text-white'
          }`}
        >
          {modeSelection ? 'Annuler la sélection' : 'Créer une playlist'}
        </button>
      </div>

      {succes && (
        <div className="mb-4 rounded-lg border border-[#22B14C]/30 bg-[#F0FFF4] px-4 py-3 text-sm text-[#0A0A0A]">
          {succes}{' '}
          <button onClick={() => navigate('/parcours')} className="text-[#C41230] font-semibold hover:underline">
            Voir mes parcours
          </button>
        </div>
      )}

      <input
        type="search"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher une technique, une famille, un tag…"
        aria-label="Rechercher dans la bibliothèque"
        className="w-full mb-6 px-4 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:border-[#C41230] focus:outline-none"
      />

      {modeSelection && (
        <div className="sticky top-14 z-20 mb-4 rounded-lg border border-[#C41230]/30 bg-white px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#333333]">
            <strong>{selection.size}</strong> ressource{selection.size !== 1 ? 's' : ''} sélectionnée{selection.size !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setModaleOuverte(true)}
            disabled={selection.size === 0}
            className="bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            Continuer
          </button>
        </div>
      )}

      {rails.length === 0 ? (
        <p className="text-center py-16 text-[#999999] text-sm">
          {recherche ? 'Aucune ressource ne correspond à ta recherche.' : 'Aucune ressource disponible pour le moment.'}
        </p>
      ) : (
        rails.map((rail) => (
          <ResourceRail
            key={rail.cle}
            rail={rail}
            selection={selection}
            modeSelection={modeSelection}
            onOuvrir={ouvrir}
            onBasculerSelection={basculerSelection}
          />
        ))
      )}

      {/* Choix de l'univers : uniquement a la creation d'une playlist. */}
      {modaleOuverte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setModaleOuverte(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Nouvelle playlist</h2>
            <p className="text-xs text-[#999999] mb-4">{selection.size} ressource{selection.size !== 1 ? 's' : ''} sélectionnée{selection.size !== 1 ? 's' : ''}</p>

            <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">Nom</label>
            <input
              value={nomPlaylist}
              onChange={(e) => setNomPlaylist(e.target.value)}
              placeholder="Ex. Mes projections de hanche"
              aria-label="Nom de la playlist"
              className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:border-[#C41230] focus:outline-none"
            />

            <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-2">Univers</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {UNIVERS_OPTIONS.map((u) => (
                <button
                  key={u.value}
                  onClick={() => setUniversChoisi(u.value)}
                  className={`rounded-lg border p-3 text-center transition-colors ${
                    universChoisi === u.value ? 'border-[#C41230] bg-[#C41230]/5' : 'border-[#E5E5E5] hover:border-[#CCCCCC]'
                  }`}
                >
                  <span className="text-lg leading-none block" aria-hidden="true">{u.icone}</span>
                  <span className="text-xs font-semibold text-[#0A0A0A] mt-1 block">{u.label}</span>
                </button>
              ))}
            </div>

            {erreur && <p className="text-xs text-[#C41230] mb-3">{erreur}</p>}

            <div className="flex gap-2 justify-end">
              <button onClick={() => setModaleOuverte(false)} className="text-xs uppercase tracking-widest px-4 py-2 rounded-lg border border-[#E5E5E5] text-[#666666]">
                Annuler
              </button>
              <button
                onClick={creerPlaylist}
                disabled={enregistrement}
                className="bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
              >
                {enregistrement ? 'Création…' : 'Créer la playlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {article && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setArticle(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">{article.titre}</h2>
            <div className="text-sm text-[#333333] leading-relaxed">
              {renderMarkdown((article as Ressource & { contenu?: string | null }).contenu ?? '')}
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setArticle(null)} className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
