import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Parcours from '../Parcours'

function LocationSearch() {
  const loc = useLocation()
  return <div data-testid="loc-search">{loc.search}</div>
}

function LocationPath() {
  const loc = useLocation()
  return <div data-testid="loc-path">{loc.pathname}</div>
}

const h = vi.hoisted(() => ({
  store: {
    userId: 'u1',
    judokas: [{ id: 'j1', user_id: 'u1' }] as any[],
    parcours: [] as any[],
    parcours_ressources: [] as any[],
    parcours_univers: [] as any[],
    catalogue_hazumi: [] as any[],
    lesson: [] as any[],
    user_parcours: [] as any[],
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
      return ((store as any)[table] ?? []).filter(
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

function seed(titre: string) {
  h.store.parcours = [
    { id: 'p1', titre, description: 'Desc', niveau: '1er dan', image: null, duree_estimee: '≈ 8 semaines', ordre: 1, publie: true },
  ]
  h.store.parcours_ressources = [
    { id: 'l1', parcours_id: 'p1', ressource_id: 'r1', ordre: 1, obligatoire: true, commentaire: null },
    { id: 'l2', parcours_id: 'p1', ressource_id: 'r2', ordre: 2, obligatoire: true, commentaire: null },
  ]
  h.store.catalogue_hazumi = [
    { id: 'r1', titre: 'Harai-goshi', type: 'article', url: null, contenu: 'Texte 1', tags: ['hanche'], grade: '1er dan', famille: 'Koshi-waza' },
    { id: 'r2', titre: 'O-soto-gari', type: 'article', url: null, contenu: 'Texte 2', tags: ['jambe'], grade: '1er dan', famille: 'Ashi-waza' },
  ]
  h.store.user_parcours = []
  h.store.parcours_univers = []
  h.store.lesson = []
}

function renderPage() {
  return render(<MemoryRouter><Parcours /></MemoryRouter>)
}

function renderUnivers(univers: string) {
  return render(<MemoryRouter><Parcours univers={univers as any} /></MemoryRouter>)
}

describe('Parcours (moteur de parcours pedagogiques)', () => {
  const TITRE = 'Test Parcours'
  beforeEach(() => seed(TITRE))

  it('affiche la liste des parcours publies', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(TITRE)).toBeInTheDocument()
      expect(screen.getByText('Non commencé')).toBeInTheDocument()
    })
  })

  it("ouvre un parcours et affiche ses ressources dans l'ordre avec 0%", async () => {
    renderPage()
    await waitFor(() => screen.getByText(TITRE))
    await userEvent.click(screen.getByText(TITRE))

    await waitFor(() => {
      expect(screen.getByText('Harai-goshi')).toBeInTheDocument()
      expect(screen.getByText('O-soto-gari')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('Commencer')).toBeInTheDocument()
    })
  })

  it('marque une ressource terminee et met a jour la progression automatiquement', async () => {
    renderPage()
    await waitFor(() => screen.getByText(TITRE))
    await userEvent.click(screen.getByText(TITRE))
    await waitFor(() => screen.getByText('Harai-goshi'))

    const checkButtons = screen.getAllByTitle('Marquer comme terminé')
    await userEvent.click(checkButtons[0])

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('Reprendre')).toBeInTheDocument()
    })
    const up = h.store.user_parcours.find((u) => u.parcours_id === 'p1')
    expect(up?.progression).toBe(50)
    expect(up?.ressources_terminees).toEqual(['r1'])
  })

  it("ouvre le lecteur d'article avec grade, famille et mots-cles", async () => {
    renderPage()
    await waitFor(() => screen.getByText(TITRE))
    await userEvent.click(screen.getByText(TITRE))
    await waitFor(() => screen.getByText('Harai-goshi'))

    await userEvent.click(screen.getAllByText('Lire')[0])
    const contenu = await screen.findByText('Texte 1')
    const modal = contenu.closest('div') as HTMLElement
    expect(within(modal).getByText('Koshi-waza')).toBeInTheDocument()
    expect(within(modal).getByText('1er dan')).toBeInTheDocument()
    expect(within(modal).getByText('hanche')).toBeInTheDocument()
  })
})

describe('Parcours "Préparer le 1er Dan" — page d\'accueil enrichie', () => {
  const PREMIER = 'Préparer le 1er Dan'
  beforeEach(() => seed(PREMIER))

  async function openPremierDan() {
    const result = renderPage()
    await waitFor(() => screen.getByText(PREMIER))
    await userEvent.click(screen.getByText(PREMIER))
    await waitFor(() => screen.getByText(/marque l'entrée dans la maîtrise des fondamentaux/i))
    return result
  }

  it('affiche le hero avec intro et CTA Commencer le parcours', async () => {
    await openPremierDan()
    expect(screen.getByText(/marque l'entrée dans la maîtrise des fondamentaux/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /commencer le parcours/i }).length).toBeGreaterThan(0)
  })

  it('affiche les 4 UV avec UV3 marquee voie competition uniquement', async () => {
    await openPremierDan()
    const uv = document.getElementById('uv') as HTMLElement
    expect(uv).not.toBeNull()
    expect(within(uv).getByText('UV1')).toBeInTheDocument()
    expect(within(uv).getByText('UV2')).toBeInTheDocument()
    expect(within(uv).getByText('UV3')).toBeInTheDocument()
    expect(within(uv).getByText('UV4')).toBeInTheDocument()
    expect(within(uv).getAllByText(/voie compétition uniquement/i).length).toBeGreaterThan(0)
    expect(within(uv).getAllByRole('button', { name: /découvrir l'uv/i })).toHaveLength(4)
  })

  it('landing épuré : ni timeline "Le parcours Hazumi", ni bloc jury (déplacés)', async () => {
    await openPremierDan()
    // la timeline est supprimée (redondante avec le bouton principal)
    expect(screen.queryByText('Le parcours Hazumi')).toBeNull()
    expect(screen.queryByText('Quiz final')).toBeNull()
    // le jury a été déplacé dans la leçon
    expect(screen.queryByText('Ce que le jury attend')).toBeNull()
    // le bouton principal reste l'accès au parcours
    expect(screen.getAllByRole('button', { name: /commencer le parcours|reprendre le parcours/i }).length).toBeGreaterThan(0)
  })

  it('masque les ressources sur le landing ; "Parcourir les ressources" ouvre la page dédiée', async () => {
    await openPremierDan()
    // masquées par défaut (clarté du landing)
    expect(screen.queryByText('Harai-goshi')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /parcourir les ressources/i }))
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    expect(screen.getByText('O-soto-gari')).toBeInTheDocument()
    expect(screen.getByText('Ressources du parcours')).toBeInTheDocument()
  })

  it('"Commencer le parcours" ouvre la leçon publiée, pas la modale "Marquer terminé"', async () => {
    h.store.lesson = [{ ressource_id: 'r1', published: true }]
    render(<MemoryRouter><Parcours /><LocationPath /></MemoryRouter>)
    await waitFor(() => screen.getByText(PREMIER))
    await userEvent.click(screen.getByText(PREMIER))
    await waitFor(() => screen.getByText(/marque l'entrée dans la maîtrise des fondamentaux/i))
    await userEvent.click(screen.getAllByRole('button', { name: /commencer le parcours/i })[0])
    await waitFor(() => expect(screen.getByTestId('loc-path').textContent).toBe('/eleve/lecon/r1'))
    expect(screen.queryByRole('button', { name: /marquer terminé/i })).toBeNull()
  })

  it('ne mentionne pas "FFJ" dans le rendu affiche', async () => {
    const { container } = await openPremierDan()
    expect(container.textContent).not.toMatch(/ffj/i)
  })
})

describe('Parcours — filtre par univers + bouton Étudier', () => {
  beforeEach(() => seed('Parcours KYU'))

  it('ne montre que les parcours de l’univers demandé', async () => {
    h.store.parcours_univers = [{ parcours_id: 'p1', univers: 'kyu' }]
    renderUnivers('kyu')
    await waitFor(() => expect(screen.getByText('Parcours KYU')).toBeInTheDocument())
  })

  it('une vue sans parcours affiche l’état vide', async () => {
    h.store.parcours_univers = [] // aucun parcours rattaché à SHIAI
    renderUnivers('shiai')
    await waitFor(() => expect(screen.getByText(/Aucun parcours disponible/i)).toBeInTheDocument())
  })

  it('affiche le nombre de leçons + le bouton Continuer sur la carte', async () => {
    h.store.parcours_univers = [{ parcours_id: 'p1', univers: 'kyu' }]
    renderUnivers('kyu')
    await waitFor(() => screen.getByText('Parcours KYU'))
    expect(screen.getByText(/2 leçons/)).toBeInTheDocument()
    expect(screen.getByText(/▶/)).toBeInTheDocument()
  })

  it('propose "Étudier" (lien vers la leçon) quand une leçon publiée existe, sinon "Lire"', async () => {
    h.store.parcours_univers = [{ parcours_id: 'p1', univers: 'kyu' }]
    h.store.lesson = [{ ressource_id: 'r1', published: true }]
    renderUnivers('kyu')
    await waitFor(() => screen.getByText('Parcours KYU'))
    await userEvent.click(screen.getByText('Parcours KYU'))
    await waitFor(() => screen.getByText('Harai-goshi'))
    const etudier = screen.getByText('Étudier')
    expect(etudier.closest('a')?.getAttribute('href')).toBe('/eleve/lecon/r1')
    expect(screen.getByText('Lire')).toBeInTheDocument() // r2 n'a pas de leçon
  })
})

describe('Parcours — URL adressable (?p=)', () => {
  beforeEach(() => seed('Test Parcours'))

  it('ouvrir un parcours reflète son id dans l’URL (?p=)', async () => {
    render(<MemoryRouter><Parcours /><LocationSearch /></MemoryRouter>)
    await waitFor(() => screen.getByText('Test Parcours'))
    await userEvent.click(screen.getByText('Test Parcours'))
    await waitFor(() => expect(screen.getByTestId('loc-search').textContent).toContain('p=p1'))
  })

  it('une URL ?p=<id> ouvre directement le parcours', async () => {
    render(<MemoryRouter initialEntries={['/eleve/kyu?p=p1']}><Parcours /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
  })
})
