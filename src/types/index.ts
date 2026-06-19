export type Belt =
  | 'blanche'
  | 'jaune'
  | 'orange'
  | 'verte'
  | 'bleue'
  | 'marron'
  | 'noire'

export type UserRole = 'eleve' | 'club'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  avatar_url?: string
  created_at: string
}

export interface Judoka {
  id: string
  user_id?: string
  full_name: string
  belt: Belt
  club?: string
  birth_date?: string
  license_number?: string
  license_expiry?: string
  email?: string
  phone?: string
  emergency_contact?: string
  cotisation_paid?: boolean
  cert_medical_expiry?: string
  created_at: string
}

export interface Technique {
  id: string
  name: string
  category: TechniqueCategory
  description?: string
  belt_required: Belt
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
