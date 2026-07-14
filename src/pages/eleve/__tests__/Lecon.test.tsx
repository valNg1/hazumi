import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Lecon from '../Lecon'

const h = vi.hoisted(() => ({
  store: {
    userId: 'u1',
    judokas: [{ id: 'j1', user_id: 'u1' }] as any[],
    catalogue_hazumi: [] as any[],
    lesson: [] as any[],
    lesson_chapters: [] as any[],
    lesson_quiz: [] as any[],
    lesson_notes: [] as any[],
    lesson_progress: [] as any[],
    lesson_quiz_results: [] as any[],
  },
}))

vi.mock('../../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    const filters: Record<string, unknown> = {}
    let inFilter: { col: string; vals: unknown[] } | null = null
    let mode: 'select' | 'insert' | 'update' = 'select'
    let payload: any = null
    function rows() {
      return (store as any)[table].filter(
        (r: any) =>
          Object.entries(filters).every(([k, v]) => r[k] === v) &&
          (inFilter ? inFilter.vals.includes(r[inFilter.col]) : true)
      )
    }
    function resolve() {
      if (mode === 'insert') {
        const arr = Array.isArray(payload) ? payload : [payload]
        ;(store as any)[table].push(...arr)
        return { data: payload, error: null }
      }
      if (mode === 'update') {
        rows().forEach((r: any) => Object.assign(r, payload))
        return { data: null, error: null }
      }
      return { data: rows(), error: null }
    }
    const builder: any = {
      select: () => builder,
      eq: (c: string, v: unknown) => { filters[c] = v; return builder },
      in: (c: string, v: unknown[]) => { inFilter = { col: c, vals: v }; return builder },
      order: () => Promise.resolve(resolve()),
      single: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      maybeSingle: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      insert: (p: any) => { mode = 'insert'; payload = p; return builder },
      update: (p: any) => { mode = 'update'; payload = p; return builder },
      upsert: (p: any, opts?: any) => {
        const cols = String(opts?.onConflict ?? '').split(',').map((s) => s.trim()).filter(Boolean)
        const arr = Array.isArray(p) ? p : [p]
        arr.forEach((row) => {
          const existing = (store as any)[table].find((r: any) => cols.every((c) => r[c] === row[c]))
          if (existing) Object.assign(existing, row)
          else (store as any)[table].push(row)
        })
        return Promise.resolve({ data: p, error: null })
      },
      then: (res: any) => res(resolve()),
    }
    return builder
  }
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: h.store.userId } } }) },
      from,
    },
  }
})

function seed() {
  h.store.catalogue_hazumi = [{ id: 'r1', titre: 'Harai-goshi', famille: 'Koshi-waza', grade: '1er dan', type: 'article' }]
  h.store.lesson = [{
    id: 'L1', ressource_id: 'r1', youtube_url: 'https://youtu.be/dQw4w9WgXcQ',
    duree_estimee: '15 min', objectif: 'Comprendre le mouvement',
    fiche_hazumi: '# Fiche technique\nUn point **gras** important.', published: true,
  }]
  h.store.lesson_chapters = [
    { id: 'c1', lesson_id: 'L1', ordre: 1, titre: 'Introduction', timestamp_seconds: 0, description: null },
    { id: 'c2', lesson_id: 'L1', ordre: 2, titre: 'Kuzushi', timestamp_seconds: 90, description: 'Le déséquilibre' },
  ]
  h.store.lesson_quiz = [
    { id: 'q1', lesson_id: 'L1', ordre: 1, question: 'Direction du kuzushi ?', type: 'choix_unique', reponses: ['Avant', 'Arriere'], bonne_reponse: [0], explication: "Vers l'avant." },
  ]
  h.store.lesson_notes = []
  h.store.lesson_progress = []
  h.store.lesson_quiz_results = []
}

beforeEach(() => seed())

function renderLecon() {
  return render(
    <MemoryRouter initialEntries={['/eleve/lecon/r1']}>
      <Routes><Route path="/eleve/lecon/:ressourceId" element={<Lecon />} /></Routes>
    </MemoryRouter>
  )
}

describe('Lecon (page générique)', () => {
  it('affiche le header, chapitres, fiche markdown et quiz depuis la base', async () => {
    renderLecon()
    await waitFor(() => screen.getByText('Harai-goshi'))
    expect(screen.getByText('Koshi-waza')).toBeInTheDocument()
    expect(screen.getByText('1er dan')).toBeInTheDocument()
    expect(screen.getByText(/15 min/)).toBeInTheDocument()
    // chapitres (jamais codes en dur)
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Kuzushi')).toBeInTheDocument()
    expect(screen.getByText('1:30')).toBeInTheDocument()
    // fiche markdown
    expect(screen.getByText('Fiche technique').tagName).toBe('H1')
    expect(screen.getByText('gras').tagName).toBe('STRONG')
    // quiz
    expect(screen.getByText(/Direction du kuzushi/)).toBeInTheDocument()
  })

  it('saute la vidéo au timestamp du chapitre cliqué', async () => {
    renderLecon()
    await waitFor(() => screen.getByText('Kuzushi'))
    const before = screen.getByTitle('Lecteur vidéo').getAttribute('src') ?? ''
    expect(before).toContain('/embed/dQw4w9WgXcQ')
    expect(before).not.toContain('start=')

    await userEvent.click(screen.getByText('Kuzushi'))
    const after = screen.getByTitle('Lecteur vidéo').getAttribute('src') ?? ''
    expect(after).toContain('start=90')
    expect(after).toContain('autoplay=1')
  })

  it('corrige le quiz et affiche le score', async () => {
    renderLecon()
    await waitFor(() => screen.getByText(/Direction du kuzushi/))
    await userEvent.click(screen.getByText('Avant'))
    await userEvent.click(screen.getByText('Valider le quiz'))
    await waitFor(() => expect(screen.getByText(/Score\s*:\s*1\s*\/\s*1/)).toBeInTheDocument())
    expect(screen.getByText("Vers l'avant.")).toBeInTheDocument()
    const res = h.store.lesson_quiz_results.find((r) => r.lesson_id === 'L1')
    expect(res?.score).toBe(1)
  })

  it('marque la leçon comme étudiée et persiste le statut', async () => {
    renderLecon()
    await waitFor(() => screen.getByText('Harai-goshi'))
    await userEvent.click(screen.getByText('Marquer comme étudiée'))
    await waitFor(() => expect(screen.getByText('✓ Leçon étudiée')).toBeInTheDocument())
    const prog = h.store.lesson_progress.find((p) => p.lesson_id === 'L1')
    expect(prog?.statut).toBe('etudiee')
  })

  it('reprise : recharge notes et statut existants', async () => {
    h.store.lesson_notes = [{ judoka_id: 'j1', lesson_id: 'L1', contenu: 'Ma note perso' }]
    h.store.lesson_progress = [{ judoka_id: 'j1', lesson_id: 'L1', statut: 'etudiee', progression: 100 }]
    renderLecon()
    await waitFor(() => screen.getByText('Harai-goshi'))
    expect((screen.getByLabelText('Notes personnelles') as HTMLTextAreaElement).value).toBe('Ma note perso')
    expect(screen.getByText('✓ Leçon étudiée')).toBeInTheDocument()
  })

  it('sauvegarde automatiquement les notes (debounce)', async () => {
    renderLecon()
    await waitFor(() => screen.getByText('Harai-goshi'))
    fireEvent.change(screen.getByLabelText('Notes personnelles'), { target: { value: 'Nouvelle note' } })
    await waitFor(
      () => expect(h.store.lesson_notes.find((n) => n.lesson_id === 'L1')?.contenu).toBe('Nouvelle note'),
      { timeout: 2000 }
    )
  })

  it('un quiz déjà passé ne pré-révèle pas les réponses (affiche le dernier score, quiz vierge)', async () => {
    h.store.lesson_quiz_results = [{ judoka_id: 'j1', lesson_id: 'L1', score: 1, total: 1, reponses: { q1: [0] } }]
    renderLecon()
    await waitFor(() => screen.getByText(/Direction du kuzushi/))
    // pas en etat corrige : le bouton Valider est present, aucun "Score :" affiche
    expect(screen.getByText('Valider le quiz')).toBeInTheDocument()
    expect(screen.queryByText(/^Score\s*:/)).toBeNull()
    // le dernier score est rappele
    expect(screen.getByText(/Dernier score\s*:\s*1\s*\/\s*1/)).toBeInTheDocument()
    // aucune reponse n'est pre-cochee
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios.every((r) => !r.checked)).toBe(true)
  })

  it('affiche un repli si aucune leçon publiée', async () => {
    h.store.lesson = []
    renderLecon()
    await waitFor(() => expect(screen.getByText(/pas encore disponible/i)).toBeInTheDocument())
  })
})
