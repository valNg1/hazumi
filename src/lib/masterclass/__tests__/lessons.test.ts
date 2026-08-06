import { describe, it, expect } from 'vitest'
import { parseMasterclassSections } from '../lessons'

// Section « Approfondir les techniques » — le contenu masterclass (table Supabase) est
// découpé par chapitre côté client. Source unique, aucune duplication en code.
describe('parseMasterclassSections', () => {
  const md = [
    '# Metadata', '', '- URL : x', '',
    '# Video chapters', '',
    '## 00:00 — Introduction', '', '### Sous-titre', '', 'Texte intro.', '',
    '## 02:03 — Suite', '', 'Texte suite.', '',
    '# Synthèse de la masterclass', '',
    '## Les principes', '', 'Ne doit pas apparaître comme chapitre.',
  ].join('\n')

  it('découpe le markdown en chapitres { titre, timestampSeconds, transcript }', () => {
    const secs = parseMasterclassSections(md)
    expect(secs).toHaveLength(2)
    expect(secs[0]).toMatchObject({ titre: 'Introduction', timestampSeconds: 0 })
    expect(secs[0].transcript).toContain('Texte intro.')
    expect(secs[0].transcript).toContain('### Sous-titre')
    expect(secs[1]).toMatchObject({ titre: 'Suite', timestampSeconds: 123 })
  })

  it('exclut la synthèse (titre de niveau 1) du corps du dernier chapitre', () => {
    const secs = parseMasterclassSections(md)
    expect(secs[1].transcript).toBe('Texte suite.')
    expect(secs.some((s) => /principes/i.test(s.transcript))).toBe(false)
  })

  it('gère le format HH:MM:SS et tolère un contenu vide', () => {
    expect(parseMasterclassSections('## 1:02:03 — Long\n\ncorps')[0].timestampSeconds).toBe(3723)
    expect(parseMasterclassSections(undefined)).toEqual([])
    expect(parseMasterclassSections('## 00:00 — Vide\n\n')).toEqual([])
  })
})
