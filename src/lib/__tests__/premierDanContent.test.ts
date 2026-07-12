import { describe, it, expect } from 'vitest'
import {
  PREMIER_DAN_TITRE,
  PREMIER_DAN_HERO,
  PREMIER_DAN_UVS,
  PREMIER_DAN_VOIES,
  PREMIER_DAN_EXAMEN,
  PREMIER_DAN_JURY,
  PREMIER_DAN_TIMELINE,
} from '../premierDanContent'

function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') acc.push(value)
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, acc))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, acc))
  return acc
}

describe('premierDanContent — structure', () => {
  it('cible le bon parcours', () => {
    expect(PREMIER_DAN_TITRE).toBe('Préparer le 1er Dan')
  })

  it('contient exactement 4 UV (UV1..UV4)', () => {
    expect(PREMIER_DAN_UVS.map((u) => u.code)).toEqual(['UV1', 'UV2', 'UV3', 'UV4'])
  })

  it('UV3 est reservee a la voie competition, les autres sont communes', () => {
    const byCode = Object.fromEntries(PREMIER_DAN_UVS.map((u) => [u.code, u]))
    expect(byCode.UV3.voieCompetitionUniquement).toBe(true)
    expect(byCode.UV1.voieCompetitionUniquement).toBe(false)
    expect(byCode.UV2.voieCompetitionUniquement).toBe(false)
    expect(byCode.UV4.voieCompetitionUniquement).toBe(false)
  })

  it('la voie technique exclut UV3, la voie competition l’inclut', () => {
    const technique = PREMIER_DAN_VOIES.find((v) => v.code === 'technique')!
    const competition = PREMIER_DAN_VOIES.find((v) => v.code === 'competition')!
    expect(technique.uvs).not.toContain('UV3')
    expect(competition.uvs).toContain('UV3')
  })

  it('propose 4 cartes d’examen, 6 criteres jury et une timeline avec un jalon Quiz final non cliquable', () => {
    expect(PREMIER_DAN_EXAMEN).toHaveLength(4)
    expect(PREMIER_DAN_JURY).toHaveLength(6)
    const quiz = PREMIER_DAN_TIMELINE.find((s) => /quiz/i.test(s.label))
    expect(quiz).toBeDefined()
    expect(quiz!.clickable).toBe(false)
  })
})

describe('premierDanContent — conformite (aucune mention de source)', () => {
  it('ne mentionne jamais "FFJ" ni "référentiel officiel" dans les textes affiches', () => {
    const strings = collectStrings([
      PREMIER_DAN_HERO,
      PREMIER_DAN_UVS,
      PREMIER_DAN_VOIES,
      PREMIER_DAN_EXAMEN,
      PREMIER_DAN_JURY,
      PREMIER_DAN_TIMELINE,
    ])
    for (const s of strings) {
      expect(s).not.toMatch(/ffj/i)
      expect(s).not.toMatch(/r[ée]f[ée]rentiel\s+officiel/i)
    }
  })
})
