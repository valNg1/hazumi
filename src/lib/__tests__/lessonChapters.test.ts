import { describe, it, expect } from 'vitest'
import { parseTimestampChapters } from '../lessonChapters'

describe('parseTimestampChapters', () => {
  it('parse une liste "M:SS Titre" en chapitres ordonnés', () => {
    const txt = `0:00 Introduction
0:45 Kuzushi
1:30 Tsukuri et Kake`
    expect(parseTimestampChapters(txt)).toEqual([
      { ordre: 1, titre: 'Introduction', timestamp_seconds: 0 },
      { ordre: 2, titre: 'Kuzushi', timestamp_seconds: 45 },
      { ordre: 3, titre: 'Tsukuri et Kake', timestamp_seconds: 90 },
    ])
  })

  it('gère le format H:MM:SS', () => {
    expect(parseTimestampChapters('1:02:03 Bilan')).toEqual([
      { ordre: 1, titre: 'Bilan', timestamp_seconds: 3723 },
    ])
  })

  it('accepte un séparateur tiret ou point après le temps', () => {
    const txt = `00:00 - Présentation
0:30 — Le mouvement
1:00 . Conclusion`
    expect(parseTimestampChapters(txt).map((c) => c.titre)).toEqual(['Présentation', 'Le mouvement', 'Conclusion'])
  })

  it('ignore les lignes sans repère de temps valide', () => {
    const txt = `Description de la vidéo
0:10 Départ
Voir aussi à la fin
0:99 mauvais temps
1:20 Suite`
    expect(parseTimestampChapters(txt).map((c) => c.timestamp_seconds)).toEqual([10, 80])
  })

  it('renvoie un tableau vide pour un texte sans repères', () => {
    expect(parseTimestampChapters('aucun timecode ici')).toEqual([])
    expect(parseTimestampChapters('')).toEqual([])
  })
})
