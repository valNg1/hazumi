import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { detectVideoType, getVideoLabel, getThumbnailUrl } from '../../lib/video'
import { renderMarkdown } from '../../lib/markdown'
import {
  searchResources,
  filterBySource,
  playlistResources,
  UNIVERS_OPTIONS,
  universLabel,
  type Ressource,
  type Source,
  type Univers,
} from '../../lib/bibliotheque'

const TYPE_ICONE: Record<string, string> = { video: '▶', article: '📄', pdf: '📕' }

interface PlaylistRow { id: string; nom: string; tags: string[] | null; parcours: Univers }

function splitTags(t: string | null): string[] {
  return (t ?? '').split(',').map((x) => x.trim()).filter(Boolean)
}

export default function Bibliotheque() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const playlistId = searchParams.get('playlist')

  const [ressources, setRessources] = useState<Ressource[]>([])
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([])
  const [lessonIds, setLessonIds] = useState<Set<string>>(new Set())
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [sourceFiltre, setSourceFiltre] = useState<Source | 'tous'>('tous')
  const [article, setArticle] = useState<Ressource | null>(null)

  // Ajout d'une ressource personnelle
  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  const [form, setForm] = useState({ titre: '', url: '', motsCles: '' })

  // Creation de playlist : seul moment ou l'univers intervient
  const [modeSelection, setModeSelection] = useState(false)
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [nomPlaylist, setNomPlaylist] = useState('')
  const [universChoisi, setUniversChoisi] = useState<Univers>('kyu')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState<string | null>(null)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)
    const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
    if (judoka) setJudokaId(judoka.id)

    const [{ data: cat }, { data: vids }, { data: lessons }, { data: pls }] = await Promise.all([
      supabase.from('catalogue_hazumi').select('id, titre, type, parcours, tags, grade, famille, url, contenu'),
      supabase.from('videos').select('id, title, video_url, tags, parcours').eq('uploaded_by', user.id),
      supabase.from('lesson').select('ressource_id').eq('published', true),
      judoka
        ? supabase.from('playlists_collections').select('id, nom, tags, parcours').eq('judoka_id', judoka.id)
        : Promise.resolve({ data: [] as PlaylistRow[] }),
    ])

    const hazumi: Ressource[] = ((cat as (Ressource & { contenu: string | null })[]) ?? []).map((c) => ({
      ...c, tags: c.tags ?? [], source: 'hazumi' as const,
    }))
    const perso: Ressource[] = (((vids as { id: string; title: string; video_url: string; tags: string | null; parcours: Univers }[]) ?? [])).map((v) => ({
      id: v.id, titre: v.title, type: 'video' as const, parcours: v.parcours, tags: splitTags(v.tags),
      grade: null, famille: null, url: v.video_url, source: 'perso' as const,
    }))

    setRessources([...hazumi, ...perso])
    setLessonIds(new Set(((lessons as { ressource_id: string }[]) ?? []).map((l) => l.ressource_id)))
    setPlaylists((pls as PlaylistRow[]) ?? [])
    setLoading(false)
  }

  const playlistCourante = playlists.find((p) => p.id === playlistId) ?? null

  const affichees = useMemo(() => {
    const base = playlistCourante
      ? playlistResources(ressources, playlistCourante.tags ?? [])
      : ressources
    return searchResources(filterBySource(base, sourceFiltre), recherche)
  }, [ressources, playlistCourante, sourceFiltre, recherche])

  function ouvrir(r: Ressource) {
    if (modeSelection) { basculerSelection(r); return }
    if (lessonIds.has(r.id)) { navigate(`/eleve/lecon/${r.id}`); return }
    if (r.type === 'video' && r.url) { window.open(r.url, '_blank'); return }
    setArticle(r)
  }

  function basculerSelection(r: Ressource) {
    setSelection((prev) => {
      const s = new Set(prev)
      if (s.has(r.id)) s.delete(r.id); else s.add(r.id)
      return s
    })
  }

  const tagsSelection = useMemo(() => {
    const tags = new Set<string>()
    ressources.filter((r) => selection.has(r.id)).forEach((r) => r.tags.forEach((t) => tags.add(t)))
    return Array.from(tags)
  }, [ressources, selection])

  async function ajouterRessource() {
    if (!userId || !form.titre.trim() || !form.url.trim()) { setErreur('Titre et URL sont obligatoires.'); return }
    setEnregistrement(true); setErreur(null)
    const { error } = await supabase.from('videos').insert({
      title: form.titre.trim(), video_url: form.url.trim(),
      tags: form.motsCles.trim() || null, uploaded_by: userId, parcours: universChoisi,
    })
    setEnregistrement(false)
    if (error) { setErreur(`Impossible d’ajouter : ${error.message}`); return }
    setAjoutOuvert(false); setForm({ titre: '', url: '', motsCles: '' })
    setSucces('Ressource ajoutée à ta bibliothèque.')
    await charger()
  }

  async function creerPlaylist() {
    if (!judokaId || !nomPlaylist.trim()) { setErreur('Donne un nom à ta playlist.'); return }
    if (tagsSelection.length === 0) { setErreur('Les ressources choisies ne portent aucun mot-clé exploitable.'); return }
    setEnregistrement(true); setErreur(null)
    const { error } = await supabase.from('playlists_collections').insert({
      judoka_id: judokaId, nom: nomPlaylist.trim(), tags: tagsSelection, parcours: universChoisi,
    })
    setEnregistrement(false)
    if (error) { setErreur(`Impossible de créer la playlist : ${error.message}`); return }
    setModaleOuverte(false); setModeSelection(false); setSelection(new Set()); setNomPlaylist('')
    setSucces('Playlist créée. Retrouve-la dans Parcours.')
    await charger()
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          {playlistCourante ? (
            <>
              <button onClick={() => setSearchParams({})} className="text-xs text-[#C41230] hover:underline mb-1">
                ← Toute la bibliothèque
              </button>
              <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{playlistCourante.nom}</h1>
              <p data-testid="section-intro" className="text-[#999999] text-sm mt-0.5">
                Playlist · {universLabel(playlistCourante.parcours)} — {affichees.length} ressource{affichees.length !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Bibliothèque</h1>
              <p data-testid="section-intro" className="text-[#999999] text-sm mt-0.5">
                Toutes les ressources Hazumi et les tiennes. Parcours-les librement, ou regroupe-les dans une playlist.
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setAjoutOuvert(true); setErreur(null); setSucces(null) }}
            className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            + Ajouter une ressource
          </button>
          <button
            onClick={() => { setModeSelection((v) => !v); setSelection(new Set()); setSucces(null) }}
            className={`text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg border transition-colors whitespace-nowrap ${
              modeSelection ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#C41230] hover:text-[#C41230]'
            }`}
          >
            {modeSelection ? 'Annuler' : 'Créer une playlist'}
          </button>
        </div>
      </div>

      {succes && (
        <div className="mb-4 rounded-lg border border-[#22B14C]/30 bg-[#F0FFF4] px-4 py-3 text-sm text-[#0A0A0A]">
          {succes}{' '}
          <button onClick={() => navigate('/parcours')} className="text-[#C41230] font-semibold hover:underline">
            Voir mes parcours
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une technique, un mot-clé…"
          aria-label="Rechercher dans la bibliothèque"
          className="flex-1 min-w-48 px-4 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:border-[#C41230] focus:outline-none"
        />
        {/* Seule distinction demandee : contenu Hazumi ou contenu du judoka. */}
        <div className="flex gap-1 border border-[#E5E5E5] rounded-lg p-0.5">
          {([['tous', 'Tout'], ['hazumi', 'Hazumi'], ['perso', 'Mes contenus']] as [Source | 'tous', string][]).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setSourceFiltre(v)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                sourceFiltre === v ? 'bg-[#0A0A0A] text-white font-medium' : 'text-[#999999] hover:text-[#666666]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

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

      {/* Liste en lignes : vignette, titre, mots-cles, origine. Aucun regroupement. */}
      {affichees.length === 0 ? (
        <p className="text-center py-16 text-[#999999] text-sm">
          {playlistCourante
            ? 'Cette playlist ne contient aucune ressource pour le moment.'
            : recherche
              ? 'Aucune ressource ne correspond à ta recherche.'
              : 'Aucune ressource disponible pour le moment.'}
        </p>
      ) : (
        <div className="space-y-2" data-testid="liste-ressources">
          {affichees.map((item) => {
            const vignette = item.type === 'video' && item.url ? getThumbnailUrl(item.url) : null
            const choisi = selection.has(item.id)
            return (
              <div
                key={item.id}
                onClick={() => ouvrir(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') ouvrir(item) }}
                className={`bg-white rounded-lg border p-3 flex gap-3 items-center cursor-pointer hover:shadow-sm transition-all ${
                  choisi ? 'border-[#C41230] ring-2 ring-[#C41230]/20' : 'border-[#E5E5E5]'
                }`}
              >
                {modeSelection && (
                  <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                    choisi ? 'bg-[#C41230] border-[#C41230] text-white' : 'border-[#CCCCCC]'
                  }`}>
                    {choisi ? '✓' : ''}
                  </span>
                )}

                <div className="flex-shrink-0 w-20 h-14 rounded bg-[#FAFAFA] border border-[#E5E5E5] overflow-hidden flex items-center justify-center">
                  {vignette ? (
                    <img src={vignette} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <span className="text-lg" aria-hidden="true">{TYPE_ICONE[item.type] ?? '📄'}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#0A0A0A] text-sm leading-snug line-clamp-1">{item.titre}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide ${
                      item.source === 'hazumi'
                        ? 'bg-[#C41230] text-white border-[#C41230]'
                        : 'bg-white text-[#666666] border-[#CCCCCC]'
                    }`}>
                      {item.source === 'hazumi' ? 'Hazumi' : 'Perso'}
                    </span>
                    {item.type === 'video' && item.url && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#666666] rounded border border-[#E5E5E5]">
                        {getVideoLabel(detectVideoType(item.url))}
                      </span>
                    )}
                    {item.grade && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#666666] rounded border border-[#E5E5E5]">{item.grade}</span>
                    )}
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#666666] rounded border border-[#E5E5E5]">{tag}</span>
                    ))}
                  </div>
                </div>

                {lessonIds.has(item.id) && (
                  <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-[#C41230] font-semibold">Leçon</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Ajouter une ressource personnelle */}
      {ajoutOuvert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setAjoutOuvert(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">Ajouter une ressource</h2>
            <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">Titre</label>
            <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} aria-label="Titre de la ressource"
              className="w-full mb-3 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:border-[#C41230] focus:outline-none" />
            <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">Lien</label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" aria-label="Lien de la ressource"
              className="w-full mb-3 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:border-[#C41230] focus:outline-none" />
            <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">Mots-clés</label>
            <input value={form.motsCles} onChange={(e) => setForm({ ...form, motsCles: e.target.value })} placeholder="hanche, projection" aria-label="Mots-clés"
              className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:border-[#C41230] focus:outline-none" />
            {erreur && <p className="text-xs text-[#C41230] mb-3">{erreur}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAjoutOuvert(false)} className="text-xs uppercase tracking-widest px-4 py-2 rounded-lg border border-[#E5E5E5] text-[#666666]">Annuler</button>
              <button onClick={ajouterRessource} disabled={enregistrement}
                className="bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg">
                {enregistrement ? 'Ajout…' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation de playlist : choix de l'univers */}
      {modaleOuverte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setModaleOuverte(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Nouvelle playlist</h2>
            <p className="text-xs text-[#999999] mb-4">{selection.size} ressource{selection.size !== 1 ? 's' : ''} sélectionnée{selection.size !== 1 ? 's' : ''}</p>
            <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">Nom</label>
            <input value={nomPlaylist} onChange={(e) => setNomPlaylist(e.target.value)} placeholder="Ex. Mes projections de hanche" aria-label="Nom de la playlist"
              className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:border-[#C41230] focus:outline-none" />
            <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-2">Univers</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {UNIVERS_OPTIONS.map((u) => (
                <button key={u.value} onClick={() => setUniversChoisi(u.value)}
                  className={`rounded-lg border p-3 text-center transition-colors ${
                    universChoisi === u.value ? 'border-[#C41230] bg-[#C41230]/5' : 'border-[#E5E5E5] hover:border-[#CCCCCC]'
                  }`}>
                  <span className="text-lg leading-none block" aria-hidden="true">{u.icone}</span>
                  <span className="text-xs font-semibold text-[#0A0A0A] mt-1 block">{u.label}</span>
                </button>
              ))}
            </div>
            {erreur && <p className="text-xs text-[#C41230] mb-3">{erreur}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModaleOuverte(false)} className="text-xs uppercase tracking-widest px-4 py-2 rounded-lg border border-[#E5E5E5] text-[#666666]">Annuler</button>
              <button onClick={creerPlaylist} disabled={enregistrement}
                className="bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg">
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
            <div className="text-sm text-[#333333] leading-relaxed">{renderMarkdown(article.contenu ?? '')}</div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setArticle(null)} className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
