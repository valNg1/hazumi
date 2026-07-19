import { describe, it, expect } from 'vitest'
import { buildRails, searchResources, UNIVERS_OPTIONS, universLabel, type Ressource } from '../bibliotheque'

const r = (over: Partial<Ressource> & { id: string; titre: string }): Ressource => ({
  type: 'article',
  parcours: 'kyu',
  tags: [],
  grade: null,
  famille: null,
  url: null,
  ...over,
})

const CATALOGUE: Ressource[] = [
  r({ id: '1', titre: 'Harai-goshi', famille: 'Koshi-waza', grade: '1er dan', parcours: 'kyu', tags: ['hanche'] }),
  r({ id: '2', titre: 'O-goshi', famille: 'Koshi-waza', grade: 'orange', parcours: 'kyu' }),
  r({ id: '3', titre: 'O-soto-gari', famille: 'Ashi-waza', grade: 'jaune', parcours: 'kyu' }),
  r({ id: '4', titre: 'Stratégie de combat', famille: null, grade: null, parcours: 'shiai' }),
  r({ id: '5', titre: 'Jigoro Kano', famille: null, grade: null, parcours: 'judo-ka' }),
]

describe('buildRails — presentation en rayons', () => {
  it('regroupe les ressources par famille technique', () => {
    const rails = buildRails(CATALOGUE)
    const koshi = rails.find((x) => x.titre === 'Koshi-waza')
    expect(koshi).toBeDefined()
    expect(koshi!.items.map((i) => i.id)).toEqual(['1', '2'])
  })

  it('ne perd aucune ressource : tout item apparait dans au moins un rayon', () => {
    const rails = buildRails(CATALOGUE)
    const vus = new Set(rails.flatMap((x) => x.items.map((i) => i.id)))
    expect(vus.size).toBe(CATALOGUE.length)
  })

  it('regroupe les ressources sans famille par univers', () => {
    const rails = buildRails(CATALOGUE)
    const titres = rails.map((x) => x.titre)
    expect(titres).toContain('Shiai')
    expect(titres).toContain('Judo-Kâ')
  })

  it('ne cree pas de rayon vide', () => {
    buildRails(CATALOGUE).forEach((x) => expect(x.items.length).toBeGreaterThan(0))
  })

  it('renvoie une liste vide sans ressource', () => {
    expect(buildRails([])).toEqual([])
  })

  it('chaque rayon porte une cle stable', () => {
    const rails = buildRails(CATALOGUE)
    const cles = rails.map((x) => x.cle)
    expect(new Set(cles).size).toBe(cles.length)
  })
})

describe('searchResources', () => {
  it('trouve par titre, sans tenir compte de la casse', () => {
    expect(searchResources(CATALOGUE, 'harai').map((i) => i.id)).toEqual(['1'])
    expect(searchResources(CATALOGUE, 'HARAI').map((i) => i.id)).toEqual(['1'])
  })

  it('tolere les accents manquants (vocabulaire japonais mal orthographie)', () => {
    expect(searchResources(CATALOGUE, 'strategie').map((i) => i.id)).toEqual(['4'])
    expect(searchResources(CATALOGUE, 'stratégie').map((i) => i.id)).toEqual(['4'])
  })

  it('cherche aussi dans la famille et les tags', () => {
    expect(searchResources(CATALOGUE, 'koshi').map((i) => i.id)).toEqual(['1', '2'])
    expect(searchResources(CATALOGUE, 'hanche').map((i) => i.id)).toEqual(['1'])
  })

  it('renvoie tout quand la recherche est vide', () => {
    expect(searchResources(CATALOGUE, '')).toHaveLength(5)
    expect(searchResources(CATALOGUE, '   ')).toHaveLength(5)
  })

  it('renvoie une liste vide si rien ne correspond', () => {
    expect(searchResources(CATALOGUE, 'zzzz')).toEqual([])
  })
})

describe('univers', () => {
  it('propose les trois univers au moment de creer une playlist', () => {
    expect(UNIVERS_OPTIONS.map((u) => u.value)).toEqual(['kyu', 'shiai', 'judo-ka'])
  })

  it('chaque univers a un libelle lisible', () => {
    expect(universLabel('kyu')).toBe('Kyu')
    expect(universLabel('shiai')).toBe('Shiai')
    expect(universLabel('judo-ka')).toBe('Judo-Kâ')
  })
})
