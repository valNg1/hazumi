import { supabase } from './supabase'

// Les playlists du judoka sont stockées dans `playlists_collections` (créées depuis
// la Bibliothèque / Mon Dojo, affichées dans Parcours « Mes Playlists » et la
// progression). La table `playlists` est un système parallèle distinct : ne PAS
// l'utiliser pour le compteur d'accueil (cause de l'issue #2).
export async function countPlaylists(judokaId: string): Promise<number> {
  const { count } = await supabase
    .from('playlists_collections')
    .select('*', { count: 'exact', head: true })
    .eq('judoka_id', judokaId)
  return count ?? 0
}

export interface PlaylistRef {
  id: string
  nom: string
}

// Liste des playlists du judoka (pour l'affichage + les liens d'ouverture).
export async function fetchPlaylists(judokaId: string): Promise<PlaylistRef[]> {
  const { data, error } = await supabase
    .from('playlists_collections')
    .select('id, nom')
    .eq('judoka_id', judokaId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data as PlaylistRef[]) ?? []
}

// Route canonique pour ouvrir une playlist (comme Parcours « Mes Playlists » et la
// progression). NB : PAS « /eleve/progression » — cf. issue #2 (2e volet).
export function playlistPath(id: string): string {
  return `/bibliotheque?playlist=${id}`
}
