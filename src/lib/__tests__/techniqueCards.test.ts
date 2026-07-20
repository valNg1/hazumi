import { describe, it, expect } from 'vitest'
import {
  techniqueCard,
  canonicalTechniqueName,
  techniqueAliases,
  decodeCard,
} from '../techniqueCards'

const UKI = { nom: 'Uki-otoshi', famille: 'Te-waza', ordre: 1, total: 3 }

describe('techniqueCard — carte typographique', () => {
  it('produit une image utilisable directement', () => {
    expect(techniqueCard(UKI)).toMatch(/^data:image\/svg\+xml,/)
  })

  it('porte le nom de la technique', () => {
    expect(decodeCard(techniqueCard(UKI))).toContain('Uki-otoshi')
  })

  it('porte la famille', () => {
    expect(decodeCard(techniqueCard(UKI))).toContain('Te-waza')
  })

  it('porte l’ordre dans la série', () => {
    expect(decodeCard(techniqueCard(UKI))).toContain('1/3')
  })

  it('identifie le parcours parent', () => {
    expect(decodeCard(techniqueCard(UKI))).toContain('Nage-no-kata')
  })

  it('est déterministe : deux appels donnent la même carte', () => {
    expect(techniqueCard(UKI)).toBe(techniqueCard(UKI))
  })

  it('deux techniques donnent deux cartes différentes', () => {
    expect(techniqueCard(UKI)).not.toBe(techniqueCard({ ...UKI, nom: 'Seoi-nage', ordre: 2 }))
  })

  it('échappe les caractères XML pour ne pas casser le SVG', () => {
    const svg = decodeCard(techniqueCard({ ...UKI, nom: 'A & B <test>' }))
    expect(svg).toContain('&amp;')
    expect(svg).not.toContain('<test>')
  })

  it('reste lisible sans ordre connu', () => {
    const svg = decodeCard(techniqueCard({ nom: 'Uchi-mata', famille: 'Ashi-waza' }))
    expect(svg).toContain('Uchi-mata')
    expect(svg).not.toContain('undefined')
  })

  it('accepte un parcours parent différent', () => {
    const svg = decodeCard(techniqueCard({ ...UKI, parent: 'Katame-no-kata' }))
    expect(svg).toContain('Katame-no-kata')
  })
})

// D2 — le nom affiche reste unique et canonique ; les variantes servent la
// recherche sans creer de doublon.
describe('canonicalTechniqueName', () => {
  it('ramène Ippon-seoi-nage au nom canonique', () => {
    expect(canonicalTechniqueName('Ippon-seoi-nage')).toBe('Seoi-nage')
  })

  it('ramène les variantes de Tsurikomi-goshi au nom canonique', () => {
    expect(canonicalTechniqueName('Tsuri-komi-goshi')).toBe('Tsurikomi-goshi')
    expect(canonicalTechniqueName('Tsurikomi-goshi')).toBe('Tsurikomi-goshi')
  })

  it('ignore la casse et les accents', () => {
    expect(canonicalTechniqueName('ippon seoi nage')).toBe('Seoi-nage')
  })

  it('laisse inchangé un nom déjà canonique', () => {
    expect(canonicalTechniqueName('Uchi-mata')).toBe('Uchi-mata')
  })

  it('laisse inchangé un nom inconnu', () => {
    expect(canonicalTechniqueName('Sumi-gaeshi')).toBe('Sumi-gaeshi')
  })
})

describe('techniqueAliases', () => {
  it('donne les variantes de Seoi-nage', () => {
    expect(techniqueAliases('Seoi-nage')).toContain('Ippon-seoi-nage')
  })

  it('donne les variantes de Tsurikomi-goshi', () => {
    expect(techniqueAliases('Tsurikomi-goshi')).toContain('Tsuri-komi-goshi')
  })

  it('n’inclut jamais le nom canonique lui-même', () => {
    expect(techniqueAliases('Seoi-nage')).not.toContain('Seoi-nage')
  })

  it('renvoie une liste vide pour une technique sans variante', () => {
    expect(techniqueAliases('Uchi-mata')).toEqual([])
  })
})
