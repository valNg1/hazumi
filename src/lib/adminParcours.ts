import { supabase } from './supabase'

export interface AdminParcours {
  id: string
  titre: string
  niveau: string | null
  publie: boolean
  ordre: number
}

// Admin : liste TOUS les parcours, publiés ou non.
// Contrairement à la vue judoka (Parcours.tsx), AUCUN filtre `publie` :
// l'admin doit voir les brouillons pour les gérer.
export async function fetchAllParcours(): Promise<AdminParcours[]> {
  const { data, error } = await supabase
    .from('parcours')
    .select('id, titre, niveau, publie, ordre')
    .order('ordre', { ascending: true })
  if (error) throw error
  return (data as AdminParcours[]) ?? []
}

export async function setParcoursPublie(id: string, publie: boolean): Promise<void> {
  const { error } = await supabase.from('parcours').update({ publie }).eq('id', id)
  if (error) throw error
}
