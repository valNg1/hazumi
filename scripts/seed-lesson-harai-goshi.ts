import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=')
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
})
const supabase = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const FICHE = `# Harai-goshi — le grand balayage de hanche

Harai-goshi appartient aux **koshi-waza** (techniques de hanche). La projection combine l'engagement profond de la hanche et un balayage de la jambe tendue.

## Les trois temps
- **Kuzushi** : déséquilibre vers l'avant ou l'avant-latéral.
- **Tsukuri** : place ta hanche contre le flanc de Uke, jambe de balayage tendue.
- **Kake** : balaie la cuisse en prolongeant la traction des bras.

## Erreur fréquente
Faucher la jambe sans engager le buste : la projection perd toute sa puissance.

> Cherche la propreté du geste avant la vitesse.`

async function main() {
  const { data: res, error: rErr } = await supabase
    .from('catalogue_hazumi').select('id, titre').eq('titre', 'Harai-goshi').maybeSingle()
  if (rErr) throw rErr
  if (!res) throw new Error('Ressource Harai-goshi introuvable')

  // Lecon (idempotent par ressource_id)
  const { data: existing } = await supabase.from('lesson').select('id').eq('ressource_id', res.id).maybeSingle()
  let lessonId = existing?.id as string | undefined
  if (!lessonId) {
    const { data: created, error } = await supabase.from('lesson').insert({
      ressource_id: res.id,
      youtube_url: 'https://www.youtube.com/watch?v=6wZnMYWCeJE',
      duree_estimee: '12 min',
      objectif: 'Comprendre les trois temps de Harai-goshi et éviter l’erreur classique du balayage sans buste.',
      fiche_hazumi: FICHE,
      published: true,
    }).select('id').single()
    if (error) throw error
    lessonId = created!.id
    console.log('Lecon creee:', lessonId)
  } else {
    await supabase.from('lesson').update({ published: true, fiche_hazumi: FICHE, youtube_url: 'https://www.youtube.com/watch?v=6wZnMYWCeJE', duree_estimee: '12 min' }).eq('id', lessonId)
    console.log('Lecon existante mise a jour:', lessonId)
  }

  // Chapitres (inseres seulement si aucun, pour rester idempotent sans suppression)
  const { count: chapCount } = await supabase
    .from('lesson_chapters').select('id', { count: 'exact', head: true }).eq('lesson_id', lessonId)
  if (!chapCount) {
    await supabase.from('lesson_chapters').insert([
      { lesson_id: lessonId, ordre: 1, titre: 'Présentation', timestamp_seconds: 0, description: null },
      { lesson_id: lessonId, ordre: 2, titre: 'Le kuzushi (déséquilibre)', timestamp_seconds: 30, description: 'Orienter Uke vers l’avant' },
      { lesson_id: lessonId, ordre: 3, titre: 'Placement de la hanche', timestamp_seconds: 75, description: null },
      { lesson_id: lessonId, ordre: 4, titre: 'Le balayage', timestamp_seconds: 120, description: 'Jambe tendue, buste engagé' },
    ])
    console.log('4 chapitres inseres')
  } else {
    console.log('Chapitres deja presents:', chapCount)
  }

  // Quiz (idem)
  const { count: quizCount } = await supabase
    .from('lesson_quiz').select('id', { count: 'exact', head: true }).eq('lesson_id', lessonId)
  if (!quizCount) {
    await supabase.from('lesson_quiz').insert([
      { lesson_id: lessonId, ordre: 1, question: 'Vers quelle direction se fait le kuzushi de Harai-goshi ?', type: 'choix_unique', reponses: ['Vers l’avant', 'Vers l’arrière', 'Vers le bas'], bonne_reponse: [0], explication: 'Le déséquilibre est dirigé vers l’avant / l’avant-latéral.' },
      { lesson_id: lessonId, ordre: 2, question: 'Harai-goshi est une technique de hanche (koshi-waza).', type: 'vrai_faux', reponses: ['Vrai', 'Faux'], bonne_reponse: [0], explication: 'Oui, Harai-goshi fait partie des koshi-waza.' },
      { lesson_id: lessonId, ordre: 3, question: 'Quels éléments composent la projection ?', type: 'choix_multiple', reponses: ['Kuzushi', 'Tsukuri', 'Kake', 'Osaekomi'], bonne_reponse: [0, 1, 2], explication: 'Osaekomi est une immobilisation au sol, pas une phase de projection.' },
    ])
    console.log('3 questions de quiz inserees')
  } else {
    console.log('Quiz deja present:', quizCount)
  }

  console.log('\nSEED LECON OK — ressource', res.id, 'lesson', lessonId)
}

main().catch((e) => { console.error(e); process.exit(1) })
