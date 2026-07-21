/**
 * Horodatages des neuf techniques du Nage-no-kata.
 *
 * À RENSEIGNER par le Product Owner, au format `mm:ss`, `hh:mm:ss` ou secondes.
 * Tant qu'une borne vaut `null`, le seed refuse de s'exécuter : aucune donnée
 * de production approximative ne peut être créée.
 *
 * L'ordre et les noms proviennent de src/lib/nageNoKata.ts (source unique).
 * Ne renseigner ici que les bornes.
 */
export interface BorneTechnique {
  nom: string
  debut: string | number | null
  fin: string | number | null
}

export const HORODATAGES: BorneTechnique[] = [
  { nom: 'Uki-otoshi', debut: null, fin: null },
  { nom: 'Seoi-nage', debut: null, fin: null },
  { nom: 'Kata-guruma', debut: null, fin: null },
  { nom: 'Uki-goshi', debut: null, fin: null },
  { nom: 'Harai-goshi', debut: null, fin: null },
  { nom: 'Tsurikomi-goshi', debut: null, fin: null },
  { nom: 'Okuri-ashi-harai', debut: null, fin: null },
  { nom: 'Sasae-tsurikomi-ashi', debut: null, fin: null },
  { nom: 'Uchi-mata', debut: null, fin: null },
]
