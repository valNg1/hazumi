import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const e = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
e.split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
const sb = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

// Contenu fourni par Valery (editorial Hazumi). Aucune reprise de site tiers :
// pour les series, uniquement la composition officielle (noms des techniques =
// fait public), pas de commentaire copie depuis un site externe.
const FICHE = `## Objectif

Le 1er Dan marque l'entrée dans la maîtrise des fondamentaux du judo. Ce parcours vous accompagne pas à pas dans la préparation des différentes UV de l'examen officiel du 1er Dan, en vous permettant de progresser à votre rythme.

## Pourquoi ce kata ?

Le premier Nage no kata fut établi entre 1882 et 1885 en 10 techniques dont le contenu fut perdu.
C'est le Kata des formes de projection créé en 1906 par Jigorô Kanô, fondateur du Judo.

Le Nage no kata de 1895 :
- Sukemi Nage fut remplacé par Kata Guruma
- Tsuri Otoshi fut remplacé par Sumi Gaeshi
- Tani Otoshi fut remplacé par Yoko Gake

Appliquant les principes essentiels du judo — adaptation, meilleur emploi de l'énergie, entraide et prospérité mutuelle — le Nage no kata met en évidence les bases techniques du judo debout, permettant à Tori et à Uke de s'exprimer et de se perfectionner dans plusieurs domaines, et notamment dans :
- l'attitude et les positions fondamentales (posture, saisie),
- les déplacements (axiaux, latéraux, circulaires),
- la dynamique d'exécution (continuité de l'action, rythme),
- la construction d'attaque (Kuzushi, Tsukuri, Kake),
- l'efficacité technique (variété technique à droite et à gauche),
- l'interaction entre les partenaires (rôle de Tori et rôle de Uke),
- le contrôle de la chute (maîtrise de son corps, non-appréhension de la chute).

Les techniques sont présentées par niveau de difficulté et par catégorie (Te waza, Koshi waza, Ashi waza, Ma sutemi waza et Yoko sutemi waza), de la plus aérienne (Te waza) à la plus proche du sol (Sutemi waza).

Le Nage no kata doit être présenté au passage du 2e dan. Il est composé de 5 séries de 3 techniques chacune. Chaque technique s'effectue à droite puis à gauche, soit en tout 30 séquences techniques. Si les katas s'effectuent à deux, ils doivent s'enseigner au moins à trois pour avoir une vue extérieure.

Ne jamais tourner le dos à Joséki (l'examinateur) est une règle d'or à ne jamais transgresser — sauf pour le relevé après une chute, où Uke doit toujours se relever dans le sens de la chute (à gauche pour les chutes latérales à droite, à droite pour les chutes avant à gauche), notamment dans le Nage no kata.

## Ce que le jury attend

- **Connaissance des techniques** — Nommer et exécuter le répertoire attendu, debout comme au sol.
- **Respect des principes** — Construire le déséquilibre, le placement puis la finition (Kuzushi, Tsukuri, Kake).
- **Contrôle du partenaire** — Garder la maîtrise des saisies et des liaisons du début à la fin du mouvement.
- **Sécurité** — Protéger son partenaire et soi-même ; chutes et projections maîtrisées.
- **Fluidité** — Enchaîner avec rythme et continuité, sans temps morts ni gestes parasites.
- **Attitude** — Respecter l'étiquette, faire preuve d'engagement et de sérénité.

## Les points clés

### Le cérémonial d'ouverture et de clôture

Tori est à droite de Joséki. Uke et Tori sont face à face, séparés de 6 m de bout de talon à bout de talon et de 5,50 m de bout d'orteil à bout d'orteil (à l'intérieur de 3 tapis sur la longueur).
Uke et Tori se tournent vers Joséki et le saluent en ritsurei.
Ensuite ils se refont face et effectuent un zarei.
Ils se relèvent et ouvrent le kata en se mettant en position kamae (position de garde), en écartant les jambes, en avançant d'abord la jambe gauche puis la jambe droite.

**Anciennement :** ils se rejoignaient en ayumi ashi en effectuant généralement deux pas chacun l'un vers l'autre si la place était suffisante. Dans le cas contraire, c'est Tori qui se rapprochait de Uke en effectuant quatre pas.

**Aujourd'hui :** Tori et Uke s'avancent l'un vers l'autre, Tori de 2/3, Uke de 1/3. Après l'ouverture, les deux combattants se retrouvent à l'intérieur des 4 mètres. Uke doit donc avancer d'un mètre, c'est-à-dire d'un tatami sur la largeur.

L'ensemble du kata s'effectue à l'intérieur des 6 mètres.

### Les séries (composition officielle)

**1re série — Te waza (techniques de bras)** : Uki-otoshi · Ippon-seoi-nage · Kata-guruma
**2e série — Koshi waza (techniques de hanche)** : Uki-goshi · Harai-goshi · Tsurikomi-goshi
**3e série — Ashi waza (techniques de jambe)** : Okuri-ashi-harai · Sasae-tsurikomi-ashi · Uchi-mata
**4e série — Ma sutemi waza (sacrifices arrière)** : Tomoe-nage · Ura-nage · Sumi-gaeshi
**5e série — Yoko sutemi waza (sacrifices de côté)** : Yoko-gake · Yoko-guruma · Uki-waza

## Les erreurs fréquentes

## Conseils Hazumi
`

async function main() {
  const { data: res } = await sb.from('catalogue_hazumi').select('id').eq('titre', 'Nage-no-kata').single()
  const { error } = await sb.from('lesson').update({ fiche_hazumi: FICHE }).eq('ressource_id', res!.id)
  if (error) throw error
  const sections = (FICHE.match(/^## /gm) || []).length
  console.log('Fiche mise a jour. Sections H2:', sections)
  console.log('FICHE NAGE-NO-KATA OK')
}
main().catch((e) => { console.error(e); process.exit(1) })
