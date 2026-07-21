import { describe, it, expect } from 'vitest'
import { clipForTechnique, type ClipRef } from '../techniqueClips'

const clips: ClipRef[] = [
  { id: 'c-uki', titre: 'Uki-otoshi' },
  { id: 'c-seoi', titre: 'Seoi-nage' },
  { id: 'c-tsuri', titre: 'Tsurikomi-goshi' },
]

describe('clipForTechnique — le bouton ouvre le bon clip', () => {
  it('associe une technique a son clip par nom canonique', () => {
    expect(clipForTechnique('Uki-otoshi', clips)).toBe('c-uki')
  })

  it('associe malgre une variante orthographique cote premium', () => {
    // lessonPremium nomme 'Ippon-seoi-nage', le clip 'Seoi-nage'
    expect(clipForTechnique('Ippon-seoi-nage', clips)).toBe('c-seoi')
    expect(clipForTechnique('Tsuri-komi-goshi', clips)).toBe('c-tsuri')
  })

  it('renvoie null tant que le clip n’existe pas (avant seed)', () => {
    expect(clipForTechnique('Uchi-mata', clips)).toBeNull()
  })

  it('renvoie null sur une liste vide', () => {
    expect(clipForTechnique('Uki-otoshi', [])).toBeNull()
  })
})
