export type Belt =
  | 'blanche'
  | 'jaune'
  | 'orange'
  | 'verte'
  | 'bleue'
  | 'marron'
  | 'noire'

export interface Judoka {
  id: string
  user_id: string
  name: string
  belt: Belt
  club?: string
  birth_date?: string
  created_at: string
}

export interface Technique {
  id: string
  name: string
  category: TechniqueCategory
  description?: string
}

export type TechniqueCategory =
  | 'tachi-waza'
  | 'ne-waza'
  | 'sutemi-waza'
  | 'atemi-waza'

export interface TechniqueProgress {
  id: string
  judoka_id: string
  technique_id: string
  level: 1 | 2 | 3 | 4 | 5
  notes?: string
  updated_at: string
}

export interface Session {
  id: string
  judoka_id: string
  date: string
  duration_minutes: number
  notes?: string
  created_at: string
}
