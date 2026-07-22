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
  { nom: 'Uki-otoshi', debut: '1:56', fin: '2:21' },
  { nom: 'Seoi-nage', debut: '2:21', fin: '2:43' },
  { nom: 'Kata-guruma', debut: '2:43', fin: '3:16' },
  { nom: 'Uki-goshi', debut: '3:16', fin: '3:34' },
  { nom: 'Harai-goshi', debut: '3:34', fin: '3:56' },
  { nom: 'Tsurikomi-goshi', debut: '3:56', fin: '4:27' },
  { nom: 'Okuri-ashi-harai', debut: '4:27', fin: '4:48' },
  { nom: 'Sasae-tsurikomi-ashi', debut: '4:48', fin: '5:11' },
  { nom: 'Uchi-mata', debut: '5:11', fin: '6:56' },
]
