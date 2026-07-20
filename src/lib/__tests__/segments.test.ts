import { describe, it, expect } from 'vitest'
import {
  parseTimecode,
  formatTimecode,
  validateSegment,
  segmentDuration,
  hasSegment,
  segmentLabel,
  detectOverlaps,
  type Segment,
} from '../segments'

const VIDEO = 1765 // duree de la video Kodokan

describe('parseTimecode', () => {
  it('lit le format mm:ss', () => {
    expect(parseTimecode('01:20')).toBe(80)
    expect(parseTimecode('3:13')).toBe(193)
  })

  it('lit le format hh:mm:ss', () => {
    expect(parseTimecode('1:00:30')).toBe(3630)
  })

  it('lit un nombre de secondes', () => {
    expect(parseTimecode('83')).toBe(83)
    expect(parseTimecode(83)).toBe(83)
  })

  it('tolere les espaces', () => {
    expect(parseTimecode('  01:20  ')).toBe(80)
  })

  it('renvoie null sur une saisie invalide', () => {
    expect(parseTimecode('a renseigner')).toBeNull()
    expect(parseTimecode('')).toBeNull()
    expect(parseTimecode('01:60')).toBeNull() // 60 secondes n'existe pas
    expect(parseTimecode('-5')).toBeNull()
  })
})

describe('formatTimecode', () => {
  it('formate en mm:ss', () => {
    expect(formatTimecode(80)).toBe('01:20')
    expect(formatTimecode(193)).toBe('03:13')
  })

  it('formate en h:mm:ss au-dela d’une heure', () => {
    expect(formatTimecode(3630)).toBe('1:00:30')
  })

  it('gere zero', () => {
    expect(formatTimecode(0)).toBe('00:00')
  })
})

describe('validateSegment', () => {
  it('accepte un segment coherent', () => {
    expect(validateSegment(80, 113, VIDEO).valide).toBe(true)
  })

  it('refuse une fin anterieure ou egale au debut', () => {
    expect(validateSegment(100, 100, VIDEO).valide).toBe(false)
    expect(validateSegment(100, 50, VIDEO).valide).toBe(false)
  })

  it('refuse un debut negatif', () => {
    expect(validateSegment(-1, 50, VIDEO).valide).toBe(false)
  })

  it('refuse un segment depassant la duree de la video', () => {
    const r = validateSegment(1700, 1800, VIDEO)
    expect(r.valide).toBe(false)
    expect(r.raison).toMatch(/durée/i)
  })

  it('accepte sans duree connue', () => {
    expect(validateSegment(80, 113, null).valide).toBe(true)
  })

  it('donne une raison lisible en cas de refus', () => {
    expect(validateSegment(100, 50, VIDEO).raison).toBeTruthy()
  })
})

describe('segmentDuration', () => {
  it('calcule la duree d’un segment', () => {
    expect(segmentDuration({ start: 80, end: 113 })).toBe(33)
  })

  it('renvoie null si une borne manque', () => {
    expect(segmentDuration({ start: 80, end: null })).toBeNull()
    expect(segmentDuration({ start: null, end: 113 })).toBeNull()
  })
})

describe('hasSegment', () => {
  it('reconnait une ressource segmentee', () => {
    expect(hasSegment({ start: 80, end: 113 })).toBe(true)
  })

  it('une ressource sans bornes n’est pas segmentee', () => {
    expect(hasSegment({ start: null, end: null })).toBe(false)
  })

  it('une borne seule ne suffit pas', () => {
    expect(hasSegment({ start: 80, end: null })).toBe(false)
  })
})

describe('segmentLabel', () => {
  it('affiche la plage et la duree', () => {
    expect(segmentLabel({ start: 80, end: 113 })).toBe('01:20 → 01:53 · 33 s')
  })

  it('renvoie une chaine vide sans segment', () => {
    expect(segmentLabel({ start: null, end: null })).toBe('')
  })
})

// Les neuf techniques ne doivent pas se chevaucher : c'est un controle du seed.
describe('detectOverlaps', () => {
  const seg = (nom: string, start: number, end: number): Segment & { nom: string } => ({ nom, start, end })

  it('ne signale rien sur des segments disjoints', () => {
    expect(detectOverlaps([seg('a', 0, 10), seg('b', 10, 20), seg('c', 20, 30)])).toEqual([])
  })

  it('signale un chevauchement', () => {
    const r = detectOverlaps([seg('a', 0, 15), seg('b', 10, 20)])
    expect(r).toHaveLength(1)
    expect(r[0]).toMatch(/a.*b/)
  })

  it('detecte un chevauchement meme si les segments sont desordonnes', () => {
    expect(detectOverlaps([seg('b', 10, 20), seg('a', 0, 15)])).toHaveLength(1)
  })

  it('ignore les segments incomplets', () => {
    expect(detectOverlaps([{ nom: 'a', start: null, end: null }, seg('b', 10, 20)])).toEqual([])
  })

  it('renvoie une liste vide sans segment', () => {
    expect(detectOverlaps([])).toEqual([])
  })
})
