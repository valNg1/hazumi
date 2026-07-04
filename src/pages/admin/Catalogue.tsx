import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type ContenuType = 'video' | 'article' | 'pdf'
type Parcours = 'shiai' | 'judo-ka' | 'kyu'

interface CatalogueItem {
  id: string
  titre: string
  type: ContenuType
  parcours: Parcours
  url: string | null
  contenu: string | null
  tags: string[] | null
  created_at: string
}

const TYPE_LABEL: Record<ContenuType, string> = { video: 'Vidéo', article: 'Article', pdf: 'PDF' }
const PARCOURS_LABEL: Record<Parcours, string> = { shiai: 'Shiai', 'judo-ka': 'Judo-Ka', kyu: 'Kyu' }

function emptyForm() {
  return { titre: '', type: 'video' as ContenuType, parcours: 'shiai' as Parcours, url: '', contenu: '', tags: '' }
}

export default function AdminCatalogue() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CatalogueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [filterParcours, setFilterParcours] = useState<Parcours | 'tous'>('tous')
  const [filterType, setFilterType] = useState<ContenuType | 'tous'>('tous')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }
    const { data: me } = await supabase.from('judokas').select('role').eq('user_id', user.id).single()
    if (!me || me.role !== 'admin') {
      setLoading(false)
      return
    }
    setHasAccess(true)

    const { data } = await supabase
      .from('catalogue_hazumi')
      .select('*')
      .order('created_at', { ascending: false })
    setItems((data as CatalogueItem[]) ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(item: CatalogueItem) {
    setEditingId(item.id)
    setForm({
      titre: item.titre,
      type: item.type,
      parcours: item.parcours,
      url: item.url ?? '',
      contenu: item.contenu ?? '',
      tags: (item.tags ?? []).join(', '),
    })
    setModalOpen(true)
  }

  async function save() {
    const titre = form.titre.trim()
    if (!titre || saving) return
    setSaving(true)
    const payload = {
      titre,
      type: form.type,
      parcours: form.parcours,
      url: form.type === 'video' || form.type === 'pdf' ? form.url.trim() || null : null,
      contenu: form.type === 'article' ? form.contenu.trim() || null : null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('catalogue_hazumi')
        .update(payload)
        .eq('id', editingId)
        .select()
        .single()
      if (!error && data) {
        setItems((prev) => prev.map((it) => (it.id === editingId ? (data as CatalogueItem) : it)))
        setModalOpen(false)
      }
    } else {
      const { data, error } = await supabase.from('catalogue_hazumi').insert(payload).select().single()
      if (!error && data) {
        setItems((prev) => [data as CatalogueItem, ...prev])
        setModalOpen(false)
      }
    }
    setSaving(false)
  }

  async function remove(id: string) {
    await supabase.from('catalogue_hazumi').delete().eq('id', id)
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const filtered = items.filter(
    (it) =>
      (filterParcours === 'tous' || it.parcours === filterParcours) &&
      (filterType === 'tous' || it.type === filterType)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">Accès refusé</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
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
            <h1 className="text-3xl font-bold text-[#0A0A0A]">Catalogue Hazumi</h1>
            <p className="text-[#666666]">Contenus mis à disposition de tous les judokas</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-[#C41230] hover:bg-[#A50F28] text-white rounded-lg text-sm font-semibold transition-colors"
        >
          + Ajouter du contenu
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <select
          aria-label="Filtrer par parcours"
          value={filterParcours}
          onChange={(e) => setFilterParcours(e.target.value as Parcours | 'tous')}
          className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm"
        >
          <option value="tous">Tous les parcours</option>
          <option value="shiai">Shiai</option>
          <option value="judo-ka">Judo-Ka</option>
          <option value="kyu">Kyu</option>
        </select>
        <select
          aria-label="Filtrer par type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ContenuType | 'tous')}
          className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm"
        >
          <option value="tous">Tous les types</option>
          <option value="video">Vidéo</option>
          <option value="article">Article</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden divide-y divide-[#E5E5E5]">
        {filtered.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-[#0A0A0A]">{item.titre}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#666666]">{TYPE_LABEL[item.type]}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#666666]">{PARCOURS_LABEL[item.parcours]}</span>
              </div>
              {item.tags && item.tags.length > 0 && (
                <p className="text-xs text-[#999999] mt-1">{item.tags.join(', ')}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => openEdit(item)}
                className="px-3 py-1.5 text-xs font-semibold text-[#666666] hover:text-[#0A0A0A] transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => remove(item.id)}
                className="px-3 py-1.5 text-xs font-semibold text-[#C41230] hover:text-[#9B0E25] transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[#999999]">Aucun contenu pour l'instant</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">
              {editingId ? 'Modifier le contenu' : 'Ajouter du contenu'}
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="cat-titre" className="block text-xs uppercase tracking-widest text-[#999999] mb-1">
                  Titre
                </label>
                <input
                  id="cat-titre"
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                  className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>

              <div>
                <label htmlFor="cat-type" className="block text-xs uppercase tracking-widest text-[#999999] mb-1">
                  Type
                </label>
                <select
                  id="cat-type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ContenuType }))}
                  className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm"
                >
                  <option value="video">Vidéo</option>
                  <option value="article">Article</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <div>
                <label htmlFor="cat-parcours" className="block text-xs uppercase tracking-widest text-[#999999] mb-1">
                  Parcours
                </label>
                <select
                  id="cat-parcours"
                  value={form.parcours}
                  onChange={(e) => setForm((f) => ({ ...f, parcours: e.target.value as Parcours }))}
                  className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm"
                >
                  <option value="shiai">Shiai</option>
                  <option value="judo-ka">Judo-Ka</option>
                  <option value="kyu">Kyu</option>
                </select>
              </div>

              {(form.type === 'video' || form.type === 'pdf') && (
                <div>
                  <label htmlFor="cat-url" className="block text-xs uppercase tracking-widest text-[#999999] mb-1">
                    URL
                  </label>
                  <input
                    id="cat-url"
                    type="text"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:border-[#C41230]"
                  />
                </div>
              )}

              {form.type === 'article' && (
                <div>
                  <label htmlFor="cat-contenu" className="block text-xs uppercase tracking-widest text-[#999999] mb-1">
                    Contenu
                  </label>
                  <textarea
                    id="cat-contenu"
                    value={form.contenu}
                    onChange={(e) => setForm((f) => ({ ...f, contenu: e.target.value }))}
                    rows={5}
                    className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:border-[#C41230]"
                  />
                </div>
              )}

              <div>
                <label htmlFor="cat-tags" className="block text-xs uppercase tracking-widest text-[#999999] mb-1">
                  Tags (séparés par virgule)
                </label>
                <input
                  id="cat-tags"
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="débutant, ceinture jaune…"
                  className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-[#666666] hover:text-[#0A0A0A] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={save}
                disabled={!form.titre.trim() || saving}
                className="px-4 py-2 bg-[#C41230] hover:bg-[#A50F28] text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
