export interface Parcours {
  id: string
  label: string
  description: string
  icon: string
}

export const PARCOURS_LIST: Parcours[] = [
  {
    id: 'shiai',
    label: 'Shiai',
    description: 'Construis ton système d\'attaque',
    icon: '🥊',
  },
  {
    id: 'judo-ka',
    label: 'Judo-Ka',
    description: 'Culture, histoire et philosophie du judo',
    icon: '🎌',
  },
  {
    id: 'kyu',
    label: 'Kyu',
    description: 'Progression par grade vers ta ceinture',
    icon: '🥋',
  },
]

export function isParcourActive(parcours: string[], id: string): boolean {
  return parcours.includes(id)
}

export function toggleParcour(parcours: string[], id: string): string[] {
  if (parcours.includes(id)) {
    return parcours.filter(p => p !== id)
  } else {
    return [...parcours, id]
  }
}
