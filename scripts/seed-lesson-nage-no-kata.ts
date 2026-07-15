import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const e = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
e.split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
const sb = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

// Gabarit de fiche : sections en titres, contenu VIDE (aucun pedagogique invente).
const FICHE_TEMPLATE = `## Objectif

## Pourquoi ce kata ?

## Ce que le jury attend

## Les points clés

## Les erreurs fréquentes

## Conseils Hazumi
`

// Video officielle Kodokan. ID extrait proprement (sans ?si= de tracking).
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=bkhBZzE2HpM'

async function main() {
  // 1. Ressource d'ancrage (support administratif de la lecon, pas de contenu invente).
  let { data: res } = await sb.from('catalogue_hazumi').select('id').eq('titre', 'Nage-no-kata').maybeSingle()
  if (!res) {
    const { data, error } = await sb.from('catalogue_hazumi').insert({
      titre: 'Nage-no-kata',
      type: 'video',
      parcours: 'kyu',
      grade: '1er dan',
      famille: 'Kata',
      url: null,
      contenu: null,
      tags: [],
    }).select('id').single()
    if (error) throw error
    res = data
    console.log('Ressource d’ancrage creee:', res!.id)
  } else {
    console.log('Ressource d’ancrage existante:', res.id)
  }
  const ressourceId = res!.id

  // 2. Lecon (structure vide, non publiee). FK unique -> catalogue_hazumi.
  const { data: existing } = await sb.from('lesson').select('id').eq('ressource_id', ressourceId).maybeSingle()
  let lessonId = existing?.id as string | undefined
  if (!lessonId) {
    const { data, error } = await sb.from('lesson').insert({
      ressource_id: ressourceId,
      youtube_url: YOUTUBE_URL,
      duree_estimee: null,
      objectif: null,
      fiche_hazumi: FICHE_TEMPLATE,
      published: false,
    }).select('id').single()
    if (error) throw error
    lessonId = data!.id
    console.log('Lecon creee:', lessonId)
  } else {
    await sb.from('lesson').update({ youtube_url: YOUTUBE_URL, fiche_hazumi: FICHE_TEMPLATE, published: false }).eq('id', lessonId)
    console.log('Lecon existante mise a jour:', lessonId)
  }

  // 3. Aucun chapitre, aucune question inseres (structure prete a recevoir).
  const { count: chap } = await sb.from('lesson_chapters').select('id', { count: 'exact', head: true }).eq('lesson_id', lessonId)
  const { count: quiz } = await sb.from('lesson_quiz').select('id', { count: 'exact', head: true }).eq('lesson_id', lessonId)

  // Verification
  const { data: check } = await sb.from('lesson').select('published, objectif, duree_estimee, youtube_url, fiche_hazumi').eq('id', lessonId).single()
  console.log('\n--- Verification ---')
  console.log('published:', check!.published, '| objectif:', check!.objectif, '| duree_estimee:', check!.duree_estimee)
  console.log('youtube_url:', check!.youtube_url)
  console.log('chapitres:', chap, '| questions quiz:', quiz)
  console.log('sections fiche:', (check!.fiche_hazumi.match(/^## /gm) || []).length)
  console.log('\nSEED NAGE-NO-KATA OK — ressource', ressourceId, 'lesson', lessonId)
}
main().catch((e) => { console.error(e); process.exit(1) })
