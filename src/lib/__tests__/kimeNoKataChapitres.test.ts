import { describe, it, expect } from 'vitest'
import {
  KIME_NO_KATA_TECHNIQUES,
  KIME_MACRO_CHAPITRES,
  GROUPE_TIMESTAMP,
  KIME_NO_KATA_QUIZ,
  KIME_NO_KATA_META,
  KIME_NO_KATA_SOURCE,
} from '../kimeNoKata'

// UV1 Kime-no-kata — sequence officielle Kodokan (20 techniques : 8 Idori + 12 Tachiai).
describe('Kime-no-kata — contenu officiel', () => {
  it('source Kodokan Hsvx-zNDEUo, 757 s', () => {
    expect(KIME_NO_KATA_SOURCE.url).toContain('Hsvx-zNDEUo')
    expect(KIME_NO_KATA_SOURCE.dureeSeconds).toBe(757)
  })

  it('20 techniques officielles : 8 Idori + 12 Tachiai', () => {
    expect(KIME_NO_KATA_TECHNIQUES).toHaveLength(20)
    expect(KIME_NO_KATA_TECHNIQUES.filter((t) => t.serie === 'Idori')).toHaveLength(8)
    expect(KIME_NO_KATA_TECHNIQUES.filter((t) => t.serie === 'Tachiai')).toHaveLength(12)
  })

  it('ordre officiel : Ryote-dori ouvre, Kiri-oroshi clot', () => {
    expect(KIME_NO_KATA_TECHNIQUES[0].nom).toBe('Ryote-dori')
    expect(KIME_NO_KATA_TECHNIQUES[19].nom).toBe('Kiri-oroshi')
    const ordres = KIME_NO_KATA_TECHNIQUES.map((t) => t.ordre)
    expect(ordres).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })

  it('chaque technique a une explication complete', () => {
    KIME_NO_KATA_TECHNIQUES.forEach((t) => {
      expect(t.titreFr.length).toBeGreaterThan(0)
      expect(t.objectif.length).toBeGreaterThan(20)
      expect(t.situation.length).toBeGreaterThan(20)
      expect(t.attaque.length).toBeGreaterThan(20)
      expect(t.defense.length).toBeGreaterThan(30)
      expect(t.pointsCles.length).toBeGreaterThanOrEqual(2)
      expect(t.erreurs.length).toBeGreaterThanOrEqual(2)
      expect(t.securite.length).toBeGreaterThanOrEqual(1)
      expect(t.resume.length).toBeGreaterThan(20)
    })
  })

  it('7 chapitres macro valides, bornes du Directeur Technique', () => {
    expect(KIME_MACRO_CHAPITRES.map((c) => c.timestamp)).toEqual([0, 64, 200, 363, 507, 590, 673])
  })

  it('chaque technique est rattachee a une borne macro validee', () => {
    const bornes = new Set(Object.values(GROUPE_TIMESTAMP))
    KIME_NO_KATA_TECHNIQUES.forEach((t) => {
      expect(bornes.has(GROUPE_TIMESTAMP[t.groupe])).toBe(true)
    })
  })

  it('repartition par groupe (arme) : 5 / 3 / 8 / 2 / 2', () => {
    const parGroupe = (g: string) => KIME_NO_KATA_TECHNIQUES.filter((t) => t.groupe === g).length
    expect(parGroupe('idori-mains-nues')).toBe(5)
    expect(parGroupe('idori-poignard')).toBe(3)
    expect(parGroupe('tachiai-mains-nues')).toBe(8)
    expect(parGroupe('tachiai-poignard')).toBe(2)
    expect(parGroupe('tachiai-sabre')).toBe(2)
  })

  it('quiz Hazumi : comprehension, technique, securite, erreurs', () => {
    expect(KIME_NO_KATA_QUIZ.length).toBeGreaterThanOrEqual(12)
    const cats = new Set(KIME_NO_KATA_QUIZ.map((q) => q.categorie))
    expect(cats.has('comprehension')).toBe(true)
    expect(cats.has('technique')).toBe(true)
    expect(cats.has('securite')).toBe(true)
    expect(cats.has('erreurs')).toBe(true)
    KIME_NO_KATA_QUIZ.forEach((q) => {
      expect(q.reponses.length).toBeGreaterThanOrEqual(2)
      expect(q.bonneReponse.length).toBeGreaterThanOrEqual(1)
      q.bonneReponse.forEach((i) => expect(i).toBeLessThan(q.reponses.length))
      expect(q.explication.length).toBeGreaterThan(10)
    })
  })

  it('metadonnees : prerequis, objectifs, tags, duree', () => {
    expect(KIME_NO_KATA_META.prerequis.length).toBeGreaterThan(0)
    expect(KIME_NO_KATA_META.objectifsApprentissage.length).toBeGreaterThan(0)
    expect(KIME_NO_KATA_META.tags).toContain('kime-no-kata')
    expect(KIME_NO_KATA_META.tempsLecture).toBeTruthy()
  })

  it('pas de doublon de nom+serie (integrite)', () => {
    const cles = KIME_NO_KATA_TECHNIQUES.map((t) => `${t.serie}:${t.ordre}`)
    expect(new Set(cles).size).toBe(cles.length)
  })
})
