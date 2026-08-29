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
