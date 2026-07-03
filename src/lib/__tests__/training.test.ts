import { describe, it, expect } from 'vitest'
import {
  toStr,
  addDays,
  getDayOfWeek,
  isFerie,
  generateRecurrenceDates,
} from '../training'

describe('toStr', () => {
  it('formate une date en YYYY-MM-DD', () => {
    expect(toStr(new Date('2026-07-03T12:00:00Z'))).toBe('2026-07-03')
  })
})

describe('addDays', () => {
  it('ajoute des jours sans muter la date source', () => {
    const source = new Date('2026-07-03T00:00:00Z')
    const result = addDays(source, 5)
    expect(toStr(result)).toBe('2026-07-08')
    expect(toStr(source)).toBe('2026-07-03')
  })

  it('gère les nombres négatifs', () => {
    expect(toStr(addDays(new Date('2026-07-03T00:00:00Z'), -3))).toBe('2026-06-30')
  })
})

describe('getDayOfWeek', () => {
  it('renvoie 5 pour un vendredi', () => {
    expect(getDayOfWeek('2026-07-03')).toBe(5)
  })

  it('renvoie 0 pour un dimanche', () => {
    expect(getDayOfWeek('2026-07-05')).toBe(0)
  })

  it('renvoie 6 pour un samedi', () => {
    expect(getDayOfWeek('2026-07-04')).toBe(6)
  })
})

describe('isFerie', () => {
  it('reconnaît le 14 juillet en métropole', () => {
    expect(isFerie('2026-07-14', 'metropole')).toBe(true)
  })

  it('renvoie false pour un jour ordinaire', () => {
    expect(isFerie('2026-07-03', 'metropole')).toBe(false)
  })

  it('renvoie toujours false pour la zone "autre"', () => {
    expect(isFerie('2026-07-14', 'autre')).toBe(false)
  })
})

describe('generateRecurrenceDates', () => {
  it('génère tous les vendredis d\'une plage donnée', () => {
    const dates = generateRecurrenceDates(
      '2026-07-01',
      '2026-07-31',
      ['ven'],
      false,
      false,
      'metropole'
    )
    expect(dates).toEqual([
      '2026-07-03',
      '2026-07-10',
      '2026-07-17',
      '2026-07-24',
      '2026-07-31',
    ])
  })

  it('exclut les jours fériés quand excludeHolidays est actif', () => {
    const dates = generateRecurrenceDates(
      '2026-07-01',
      '2026-07-31',
      ['mar'],
      false,
      true,
      'metropole'
    )
    // 14 juillet 2026 est un mardi férié → exclu
    expect(dates).not.toContain('2026-07-14')
    expect(dates).toContain('2026-07-07')
    expect(dates).toContain('2026-07-21')
  })

  it('exclut samedi et dimanche quand excludeWeekends est actif', () => {
    const dates = generateRecurrenceDates(
      '2026-07-01',
      '2026-07-31',
      ['sam', 'dim'],
      true,
      false,
      'metropole'
    )
    expect(dates).toEqual([])
  })

  it('renvoie un tableau vide si aucun jour n\'est sélectionné', () => {
    const dates = generateRecurrenceDates(
      '2026-07-01',
      '2026-07-31',
      [],
      false,
      false,
      'metropole'
    )
    expect(dates).toEqual([])
  })

  it('gère plusieurs jours sélectionnés', () => {
    const dates = generateRecurrenceDates(
      '2026-07-01',
      '2026-07-08',
      ['lun', 'mer'],
      false,
      false,
      'metropole'
    )
    // mercredi 1, lundi 6, mercredi 8
    expect(dates).toEqual(['2026-07-01', '2026-07-06', '2026-07-08'])
  })

  it('utilise une fenêtre par défaut d\'un an si dateFin est null', () => {
    const dates = generateRecurrenceDates(
      '2026-07-01',
      null,
      ['mer'],
      false,
      false,
      'metropole'
    )
    expect(dates.length).toBeGreaterThan(50)
    expect(dates[0]).toBe('2026-07-01')
  })
})
