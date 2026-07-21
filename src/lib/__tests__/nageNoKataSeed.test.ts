import { describe, it, expect } from 'vitest'
import { buildSeedPlan, type BorneSaisie } from '../nageNoKataSeed'

const DUREE = 1765

// Fixture de TEST uniquement — bornes fictives, disjointes, dans l'ordre.
// Elle ne represente aucune donnee de production.
const NOMS = [
  'Uki-otoshi', 'Seoi-nage', 'Kata-guruma',
  'Uki-goshi', 'Harai-goshi', 'Tsurikomi-goshi',
  'Okuri-ashi-harai', 'Sasae-tsurikomi-ashi', 'Uchi-mata',
]
function fixtureValide(): BorneSaisie[] {
  return NOMS.map((nom, i) => ({ nom, debut: i * 40, fin: i * 40 + 30 }))
}

describe('buildSeedPlan — validation', () => {
  it('refuse tant qu’une borne manque', () => {
    const bornes = fixtureValide()
    bornes[3].debut = null
    const plan = buildSeedPlan(bornes, DUREE)
    expect(plan.ok).toBe(false)
    if (!plan.ok) expect(plan.erreurs.join(' ')).toMatch(/Uki-goshi/)
  })

  it('refuse une borne illisible', () => {
    const bornes = fixtureValide()
    bornes[0].fin = 'à renseigner'
    const plan = buildSeedPlan(bornes, DUREE)
    expect(plan.ok).toBe(false)
  })

  it('refuse une fin avant le début', () => {
    const bornes = fixtureValide()
    bornes[0] = { nom: 'Uki-otoshi', debut: 100, fin: 50 }
    expect(buildSeedPlan(bornes, DUREE).ok).toBe(false)
  })

  it('refuse un chevauchement entre deux techniques', () => {
    const bornes = fixtureValide()
    bornes[1] = { nom: 'Seoi-nage', debut: 10, fin: 50 } // recouvre Uki-otoshi (0→30)
    const plan = buildSeedPlan(bornes, DUREE)
    expect(plan.ok).toBe(false)
    if (!plan.ok) expect(plan.erreurs.join(' ')).toMatch(/chevauche/)
  })

  it('refuse un segment hors durée vidéo', () => {
    const bornes = fixtureValide()
    bornes[8] = { nom: 'Uchi-mata', debut: 1750, fin: 1800 }
    expect(buildSeedPlan(bornes, DUREE).ok).toBe(false)
  })

  it('accepte les variantes orthographiques en entrée', () => {
    const bornes = fixtureValide()
    bornes[1].nom = 'Ippon-seoi-nage' // variante de Seoi-nage
    bornes[5].nom = 'Tsuri-komi-goshi' // variante de Tsurikomi-goshi
    expect(buildSeedPlan(bornes, DUREE).ok).toBe(true)
  })
})

describe('buildSeedPlan — plan produit', () => {
  const plan = buildSeedPlan(fixtureValide(), DUREE)

  it('produit les neuf techniques', () => {
    expect(plan.ok).toBe(true)
    if (plan.ok) expect(plan.techniques).toHaveLength(9)
  })

  it('chaque technique a une carte, un média principal et ses bornes', () => {
    if (!plan.ok) throw new Error('plan invalide')
    plan.techniques.forEach((t) => {
      expect(t.thumbnail).toMatch(/^data:image\/svg\+xml,/)
      expect(t.role).toBe('demonstration')
      expect(t.estPrincipal).toBe(true)
      expect(t.end).toBeGreaterThan(t.start)
    })
  })

  it('chaque technique porte ses trois sections pédagogiques', () => {
    if (!plan.ok) throw new Error('plan invalide')
    plan.techniques.forEach((t) => {
      const types = t.sections.map((s) => s.type)
      expect(types).toContain('fiche')
      expect(types).toContain('points_attention')
      expect(types).toContain('erreurs')
      t.sections.forEach((s) => expect(s.contenu.length).toBeGreaterThan(20))
    })
  })

  it('utilise les noms canoniques et attache les alias', () => {
    if (!plan.ok) throw new Error('plan invalide')
    const seoi = plan.techniques.find((t) => t.nom === 'Seoi-nage')!
    expect(seoi.aliases).toContain('Ippon-seoi-nage')
    const tsuri = plan.techniques.find((t) => t.nom === 'Tsurikomi-goshi')!
    expect(tsuri.aliases).toContain('Tsuri-komi-goshi')
  })
})
