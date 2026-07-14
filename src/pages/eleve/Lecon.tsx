import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { youtubeEmbedUrl, formatTimestamp } from '../../lib/youtube'
import { renderMarkdown } from '../../lib/markdown'
import { gradeQuiz, type QuizQuestion } from '../../lib/lessonQuiz'

const NOTES_DEBOUNCE_MS = 800

interface Lesson {
  id: string
  ressource_id: string
  youtube_url: string | null
  duree_estimee: string | null
  objectif: string | null
  fiche_hazumi: string | null
  published: boolean
}
interface Ressource { id: string; titre: string; famille: string | null; grade: string | null; type: string }
interface Chapter { id: string; ordre: number; titre: string; timestamp_seconds: number; description: string | null }
interface QuizRow extends QuizQuestion { ordre: number; question: string; explication: string | null }

export default function Lecon() {
  const { ressourceId } = useParams<{ ressourceId: string }>()
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [ressource, setRessource] = useState<Ressource | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [quiz, setQuiz] = useState<QuizRow[]>([])

  const [startSeconds, setStartSeconds] = useState<number | undefined>(undefined)
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [statut, setStatut] = useState<'en_cours' | 'etudiee'>('en_cours')
  const [previousScore, setPreviousScore] = useState<{ score: number; total: number } | null>(null)

  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notesLoaded = useRef(false)

  useEffect(() => {
    let active = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (!judoka || !ressourceId) { setLoading(false); return }
      if (!active) return
      setJudokaId(judoka.id)

      const { data: les } = await supabase
        .from('lesson')
        .select('*')
        .eq('ressource_id', ressourceId)
        .eq('published', true)
        .maybeSingle()
      if (!les) { setLoading(false); return }
      if (!active) return
      setLesson(les as Lesson)

      const [{ data: res }, { data: chaps }, { data: qz }] = await Promise.all([
        supabase.from('catalogue_hazumi').select('id, titre, famille, grade, type').eq('id', ressourceId).single(),
        supabase.from('lesson_chapters').select('*').eq('lesson_id', les.id).order('ordre', { ascending: true }),
        supabase.from('lesson_quiz').select('*').eq('lesson_id', les.id).order('ordre', { ascending: true }),
      ])
      if (!active) return
      setRessource(res as Ressource)
      setChapters((chaps as Chapter[]) ?? [])
      setQuiz((qz as QuizRow[]) ?? [])

      // Etat utilisateur (reprise).
      const { data: noteRow } = await supabase
        .from('lesson_notes').select('contenu').eq('judoka_id', judoka.id).eq('lesson_id', les.id).maybeSingle()
      if (noteRow?.contenu) setNotes(noteRow.contenu)
      notesLoaded.current = true

      // Reprise : on rappelle le dernier score mais on ne pre-revele PAS les
      // reponses. L'utilisateur repart sur un quiz vierge ; la correction (vert)
      // n'apparait qu'apres une nouvelle validation.
      const { data: qr } = await supabase
        .from('lesson_quiz_results').select('score, total').eq('judoka_id', judoka.id).eq('lesson_id', les.id).maybeSingle()
      if (qr) setPreviousScore({ score: qr.score as number, total: qr.total as number })

      const { data: prog } = await supabase
        .from('lesson_progress').select('statut').eq('judoka_id', judoka.id).eq('lesson_id', les.id).maybeSingle()
      if (prog) {
        setStatut(prog.statut as 'en_cours' | 'etudiee')
        await supabase.from('lesson_progress').update({ derniere_reprise: new Date().toISOString() })
          .eq('judoka_id', judoka.id).eq('lesson_id', les.id)
      } else {
        await supabase.from('lesson_progress').insert({
          judoka_id: judoka.id, lesson_id: les.id, statut: 'en_cours', progression: 0, derniere_reprise: new Date().toISOString(),
        })
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [ressourceId])

  const saveNotes = useCallback(async (value: string) => {
    if (!judokaId || !lesson) return
    await supabase.from('lesson_notes').upsert(
      { judoka_id: judokaId, lesson_id: lesson.id, contenu: value, updated_at: new Date().toISOString() },
      { onConflict: 'judoka_id,lesson_id' }
    )
  }, [judokaId, lesson])

  function onNotesChange(value: string) {
    setNotes(value)
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => saveNotes(value), NOTES_DEBOUNCE_MS)
  }

  function selectAnswer(q: QuizRow, index: number) {
    setAnswers((prev) => {
      const cur = prev[q.id] ?? []
      if (q.type === 'choix_multiple') {
        return { ...prev, [q.id]: cur.includes(index) ? cur.filter((i) => i !== index) : [...cur, index] }
      }
      return { ...prev, [q.id]: [index] }
    })
  }

  async function submitQuiz() {
    if (!judokaId || !lesson) return
    const graded = gradeQuiz(quiz, answers)
    setSubmitted(true)
    setPreviousScore({ score: graded.score, total: graded.total })
    await supabase.from('lesson_quiz_results').upsert(
      { judoka_id: judokaId, lesson_id: lesson.id, score: graded.score, total: graded.total, reponses: answers, updated_at: new Date().toISOString() },
      { onConflict: 'judoka_id,lesson_id' }
    )
  }

  async function toggleStudied() {
    if (!judokaId || !lesson) return
    const next = statut === 'etudiee' ? 'en_cours' : 'etudiee'
    setStatut(next)
    await supabase.from('lesson_progress').upsert(
      { judoka_id: judokaId, lesson_id: lesson.id, statut: next, progression: next === 'etudiee' ? 100 : 0, derniere_reprise: new Date().toISOString() },
      { onConflict: 'judoka_id,lesson_id' }
    )
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  if (!lesson || !ressource) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-sm text-[#666666] mb-4">Cette leçon n'est pas encore disponible.</p>
        <Link to="/eleve/kyu" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25]">Retour au catalogue</Link>
      </div>
    )
  }

  const graded = submitted ? gradeQuiz(quiz, answers) : null
  const embedUrl = lesson.youtube_url ? youtubeEmbedUrl(lesson.youtube_url, startSeconds) : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. HEADER */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#999999]">Leçon</span>
            <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{ressource.titre}</h1>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {ressource.famille && <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">{ressource.famille}</span>}
              {ressource.grade && <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">{ressource.grade}</span>}
              {lesson.duree_estimee && <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">⏱ {lesson.duree_estimee}</span>}
            </div>
            {lesson.objectif && <p className="text-sm text-[#666666] mt-3">{lesson.objectif}</p>}
          </div>
          <button
            onClick={toggleStudied}
            className={`flex-shrink-0 text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors font-semibold ${
              statut === 'etudiee' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-[#C41230] hover:bg-[#9B0E25] text-white'
            }`}
          >
            {statut === 'etudiee' ? '✓ Leçon étudiée' : 'Marquer comme étudiée'}
          </button>
        </div>
      </div>

      {/* 2. VIDEO + CHAPITRES */}
      {embedUrl && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
            <iframe
              key={startSeconds ?? 'start'}
              title="Lecteur vidéo"
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {chapters.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-2">Chapitres</p>
              <div className="space-y-1">
                {chapters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setStartSeconds(c.timestamp_seconds)}
                    className="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                  >
                    <span className="flex-shrink-0 text-xs font-semibold text-[#C41230] bg-[#C41230]/5 rounded px-2 py-0.5 tabular-nums">
                      {formatTimestamp(c.timestamp_seconds)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#0A0A0A]">{c.titre}</span>
                      {c.description && <span className="block text-xs text-[#999999]">{c.description}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. FICHE HAZUMI */}
      {lesson.fiche_hazumi && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">Fiche Hazumi</h2>
          {renderMarkdown(lesson.fiche_hazumi)}
        </div>
      )}

      {/* 4. NOTES PERSONNELLES */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
        <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Mes notes</h2>
        <p className="text-xs text-[#999999] mb-3">Privées — sauvegarde automatique.</p>
        <textarea
          aria-label="Notes personnelles"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Écrivez vos notes ici…"
          rows={5}
          className="w-full text-sm border border-[#E5E5E5] rounded-lg p-3 focus:outline-none focus:border-[#C41230] resize-y"
        />
      </div>

      {/* 5. QUIZ */}
      {quiz.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Quiz</h2>
          {previousScore && !submitted && (
            <p className="text-xs text-[#999999] mb-3">Dernier score : {previousScore.score} / {previousScore.total} — refaites le quiz quand vous voulez.</p>
          )}
          <div className="space-y-5">
            {quiz.map((q, qi) => {
              const sel = answers[q.id] ?? []
              const correctSet = new Set(q.bonne_reponse)
              const isMulti = q.type === 'choix_multiple'
              return (
                <div key={q.id}>
                  <p className="text-sm font-medium text-[#0A0A0A] mb-2">{qi + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.reponses.map((opt, idx) => {
                      const checked = sel.includes(idx)
                      const showGood = submitted && correctSet.has(idx)
                      const showBad = submitted && checked && !correctSet.has(idx)
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 text-sm p-2 rounded-lg border cursor-pointer transition-colors ${
                            showGood ? 'border-green-400 bg-green-50' : showBad ? 'border-red-300 bg-red-50' : 'border-[#E5E5E5] hover:bg-[#FAFAFA]'
                          }`}
                        >
                          <input
                            type={isMulti ? 'checkbox' : 'radio'}
                            name={`q-${q.id}`}
                            checked={checked}
                            disabled={submitted}
                            onChange={() => selectAnswer(q, idx)}
                            className="accent-[#C41230]"
                          />
                          <span className="text-[#333333]">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                  {submitted && q.explication && (
                    <p className="text-xs text-[#666666] mt-2 italic">{q.explication}</p>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex items-center gap-3">
            {!submitted ? (
              <button
                onClick={submitQuiz}
                className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors font-semibold"
              >
                Valider le quiz
              </button>
            ) : (
              <>
                <span className="text-sm font-bold text-[#0A0A0A]">Score : {graded?.score} / {graded?.total}</span>
                <button
                  onClick={() => { setSubmitted(false); setAnswers({}) }}
                  className="text-xs uppercase tracking-widest text-[#666666] hover:text-[#0A0A0A] transition-colors"
                >
                  Recommencer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
