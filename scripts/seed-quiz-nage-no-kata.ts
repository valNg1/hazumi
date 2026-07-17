import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const e = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
e.split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
const sb = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

// 15 questions — UNIQUEMENT des faits presents dans la fiche Nage-no-kata.
// choix_unique, 4 propositions, 1 bonne reponse, explication. 3 niveaux x 5.
type Q = { question: string; reponses: string[]; bonne: number; explication: string }
const QUESTIONS: Q[] = [
  // Niveau 1 — Comprendre
  { question: 'En quelle année la version actuelle du Nage-no-kata a-t-elle été créée ?', reponses: ['1882', '1895', '1906', '2006'], bonne: 2, explication: 'La version actuelle a été créée en 1906.' },
  { question: 'Qui a créé le Nage-no-kata ?', reponses: ['Kyūzō Mifune', 'Jigorō Kanō', 'Kazuzō Kudō', 'Risei Kanō'], bonne: 1, explication: 'Jigorō Kanō, fondateur du judo.' },
  { question: 'De combien de séries le Nage-no-kata est-il composé ?', reponses: ['3', '4', '5', '6'], bonne: 2, explication: 'Le kata compte 5 séries.' },
  { question: 'Combien de techniques comporte chaque série ?', reponses: ['2', '3', '4', '5'], bonne: 1, explication: 'Chaque série comporte 3 techniques.' },
  { question: 'Combien de séquences techniques au total (droite puis gauche) ?', reponses: ['15', '20', '30', '45'], bonne: 2, explication: '5 séries × 3 techniques × (droite + gauche) = 30.' },
  // Niveau 2 — Observer
  { question: 'Que signifie « Seiryoku Zen’yō » ?', reponses: ['Entraide et prospérité mutuelle', "Le meilleur emploi de l'énergie", 'La souplesse', "Le respect de l'étiquette"], bonne: 1, explication: "Seiryoku Zen'yō : le meilleur emploi de l'énergie." },
  { question: 'Que signifie « Jita Kyōei » ?', reponses: ['Entraide et prospérité mutuelle', "Le meilleur emploi de l'énergie", 'La maîtrise de la chute', 'La posture'], bonne: 0, explication: 'Jita Kyōei : entraide et prospérité mutuelle.' },
  { question: 'À quelle série appartient Uchi-mata dans le Nage-no-kata ?', reponses: ['Te waza', 'Koshi waza', 'Ashi waza', 'Ma sutemi waza'], bonne: 2, explication: 'Uchi-mata fait partie de la série Ashi waza.' },
  { question: 'Quelle série regroupe Uki-otoshi, Ippon-seoi-nage et Kata-guruma ?', reponses: ['Te waza', 'Koshi waza', 'Ashi waza', 'Yoko sutemi waza'], bonne: 0, explication: 'Ce sont les trois techniques de la série Te waza.' },
  { question: 'Où se place Tori par rapport à Joséki ?', reponses: ['À gauche de Joséki', 'À droite de Joséki', 'Face à Joséki', 'Derrière Uke'], bonne: 1, explication: 'Tori est à droite de Joséki.' },
  // Niveau 3 — Analyser
  { question: 'Quelle est la distance talon à talon entre Uke et Tori au départ ?', reponses: ['4 mètres', '5,50 mètres', '6 mètres', '8 mètres'], bonne: 2, explication: '6 m de talon à talon (5,50 m d’orteil à orteil).' },
  { question: "À l'intérieur de quelle distance s'effectue l'ensemble du kata ?", reponses: ['4 mètres', '5 mètres', '6 mètres', '10 mètres'], bonne: 2, explication: "L'ensemble du kata s'effectue à l'intérieur des 6 mètres." },
  { question: 'Aujourd’hui, comment se répartit le rapprochement Tori / Uke ?', reponses: ['Tori 1/3, Uke 2/3', 'Tori 2/3, Uke 1/3', 'Chacun la moitié', 'Uke ne bouge pas'], bonne: 1, explication: "Tori s'avance de 2/3, Uke de 1/3." },
  { question: 'Les techniques sont présentées de la plus … à la plus proche du sol :', reponses: ['de la plus aérienne (Te waza)', 'de la plus rapide', 'de la plus ancienne', 'de la plus difficile'], bonne: 0, explication: 'De la plus aérienne (Te waza) à la plus proche du sol (Sutemi waza).' },
  { question: 'Quelle est la règle d’or vis-à-vis de Joséki ?', reponses: ['Ne jamais lui tourner le dos', 'Toujours le saluer en dernier', 'Rester à genoux', 'Ne jamais le regarder'], bonne: 0, explication: "Ne jamais tourner le dos à Joséki (sauf relevé après une chute)." },
]

async function main() {
  const { data: res } = await sb.from('catalogue_hazumi').select('id').eq('titre', 'Nage-no-kata').single()
  const { data: lesson } = await sb.from('lesson').select('id').eq('ressource_id', res!.id).single()
  const lessonId = lesson!.id

  await sb.from('lesson_quiz').delete().eq('lesson_id', lessonId)
  const rows = QUESTIONS.map((q, i) => ({
    lesson_id: lessonId, ordre: i + 1, question: q.question, type: 'choix_unique',
    reponses: q.reponses, bonne_reponse: [q.bonne], explication: q.explication,
  }))
  const { error } = await sb.from('lesson_quiz').insert(rows)
  if (error) throw error
  console.log(`${rows.length} questions inserees pour Nage-no-kata (lesson ${lessonId}).`)
}
main().catch((e) => { console.error(e); process.exit(1) })
