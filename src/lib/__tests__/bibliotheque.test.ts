import { describe, it, expect } from 'vitest'
import {
  searchResources,
  filterBySource,
  playlistResources,
  collectTags,
  UNIVERS_OPTIONS,
  universLabel,
  type Ressource,
} from '../bibliotheque'

const r = (over: Partial<Ressource> & { id: string; titre: string }): Ressource => ({
  type: 'article',
  parcours: 'kyu',
  tags: [],
  grade: null,
  famille: null,
  url: null,
  source: 'hazumi',
  ...over,
})

const CATALOGUE: Ressource[] = [
  r({ id: '1', titre: 'Harai-goshi', famille: 'Koshi-waza', grade: '1er dan', tags: ['hanche'] }),
  r({ id: '2', titre: 'O-goshi', famille: 'Koshi-waza', grade: 'orange', tags: ['Hanche'] }),
  r({ id: '3', titre: 'O-soto-gari', famille: 'Ashi-waza', grade: 'jaune', tags: ['jambe'] }),
  r({ id: '4', titre: 'Stratégie de combat', parcours: 'shiai' }),
  r({ id: '5', titre: 'Ma vidéo de randori', source: 'perso', type: 'video', tags: ['randori'] }),
]

describe('searchResources', () => {
  it('trouve par titre, sans tenir compte de la casse', () => {
    expect(searchResources(CATALOGUE, 'harai').map((i) => i.id)).toEqual(['1'])
    expect(searchResources(CATALOGUE, 'HARAI').map((i) => i.id)).toEqual(['1'])
  })

  it('tolere les accents manquants', () => {
    expect(searchResources(CATALOGUE, 'strategie').map((i) => i.id)).toEqual(['4'])
    expect(searchResources(CATALOGUE, 'stratégie').map((i) => i.id)).toEqual(['4'])
  })

  it('cherche aussi dans la famille, le grade et les tags', () => {
    expect(searchResources(CATALOGUE, 'koshi').map((i) => i.id)).toEqual(['1', '2'])
    expect(searchResources(CATALOGUE, 'jambe').map((i) => i.id)).toEqual(['3'])
    expect(searchResources(CATALOGUE, 'orange').map((i) => i.id)).toEqual(['2'])
  })

  it('renvoie tout quand la recherche est vide', () => {
    expect(searchResources(CATALOGUE, '')).toHaveLength(5)
    expect(searchResources(CATALOGUE, '   ')).toHaveLength(5)
  })

  it('renvoie une liste vide si rien ne correspond', () => {
    expect(searchResources(CATALOGUE, 'zzzz')).toEqual([])
  })
})

// Retour de recette : on ne regroupe rien. La seule distinction attendue est
// l'origine du contenu — Hazumi (administration) ou judoka.
describe('filterBySource — Hazumi ou contenu du judoka', () => {
  it('ne garde que les contenus Hazumi', () => {
    expect(filterBySource(CATALOGUE, 'hazumi').map((i) => i.id)).toEqual(['1', '2', '3', '4'])
  })

  it('ne garde que les contenus du judoka', () => {
    expect(filterBySource(CATALOGUE, 'perso').map((i) => i.id)).toEqual(['5'])
  })

  it('renvoie tout par defaut', () => {
    expect(filterBySource(CATALOGUE, 'tous')).toHaveLength(5)
  })

  it('ne perd aucune ressource : hazumi + perso = tout', () => {
    const total = filterBySource(CATALOGUE, 'hazumi').length + filterBySource(CATALOGUE, 'perso').length
    expect(total).toBe(CATALOGUE.length)
  })
})

describe('playlistResources — ouvrir une playlist montre son contenu', () => {
  it('renvoie les ressources portant l’un des tags de la playlist', () => {
    expect(playlistResources(CATALOGUE, ['hanche']).map((i) => i.id)).toEqual(['1', '2'])
  })

  it('ignore la casse et les accents des tags', () => {
    expect(playlistResources(CATALOGUE, ['HANCHE']).map((i) => i.id)).toEqual(['1', '2'])
  })

  it('accepte plusieurs tags', () => {
    expect(playlistResources(CATALOGUE, ['hanche', 'jambe']).map((i) => i.id)).toEqual(['1', '2', '3'])
  })

  it('renvoie une liste vide sans tag', () => {
    expect(playlistResources(CATALOGUE, [])).toEqual([])
  })

  it('renvoie une liste vide si aucun tag ne correspond', () => {
    expect(playlistResources(CATALOGUE, ['inconnu'])).toEqual([])
  })
})

describe('collectTags', () => {
  it('remonte les tags, dedoublonnes sans tenir compte de la casse', () => {
    expect(collectTags(CATALOGUE)).toEqual(['hanche', 'jambe', 'randori'])
  })

  it('renvoie une liste vide sans ressource', () => {
    expect(collectTags([])).toEqual([])
  })
})

describe('univers', () => {
  it('propose les trois univers a la creation d’une playlist', () => {
    expect(UNIVERS_OPTIONS.map((u) => u.value)).toEqual(['kyu', 'shiai', 'judo-ka'])
  })

  it('chaque univers a un libelle lisible', () => {
    expect(universLabel('kyu')).toBe('Kyu')
    expect(universLabel('shiai')).toBe('Shiai')
    expect(universLabel('judo-ka')).toBe('Judo-Kâ')
  })
})
