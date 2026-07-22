import { execFileSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { parseTimestampChapters } from './lessonChapters'
import type { ParsedChapter } from './lessonChapters'

export interface VideoChapterCandidate extends ParsedChapter {
  source: 'youtube-chapters' | 'description' | 'transcript-keyword'
  note?: string
}

export interface VideoChapterExtractionResult {
  videoId: string
  sourceUrl: string
  title?: string
  durationSeconds?: number
  source: 'youtube-metadata' | 'description' | 'transcript' | 'manual'
  chapters: VideoChapterCandidate[]
  needsValidation: boolean
}

export interface SubtitleCue {
  index: number
  start: number
  end: number
  text: string
}

export function formatSrtTimestamp(timestamp: string): number {
  const m = timestamp.match(/^(\d{2}):(\d{2}):(\d{2}),\d{3}$/)
  if (!m) return NaN
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

export function parseSrt(content: string): SubtitleCue[] {
  return content
    .trim()
    .split(/\r?\n\r?\n/)
    .map((block) => {
      const lines = block.split(/\r?\n/).filter(Boolean)
      if (lines.length < 3) return null
      const index = Number(lines[0].trim())
      const times = lines[1].split('-->').map((s) => s.trim())
      const start = formatSrtTimestamp(times[0])
      const end = formatSrtTimestamp(times[1])
      const text = lines.slice(2).join(' ')
      return Number.isFinite(index) && !Number.isNaN(start) && !Number.isNaN(end)
        ? { index, start, end, text }
        : null
    })
    .filter((cue): cue is SubtitleCue => cue !== null)
}

export function normalizeKeyword(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s\-_]+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s\-_]+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractChaptersFromMetadata(metadata: any): VideoChapterCandidate[] {
  if (!metadata?.chapters || !Array.isArray(metadata.chapters)) return []
  return metadata.chapters
    .map((chapter: any, index: number) => {
      const title = chapter.title || chapter.title_text || `Chapitre ${index + 1}`
      const seconds = Number(chapter.start_time ?? chapter.start_time_s ?? chapter.start)
      if (Number.isNaN(seconds)) return null
      return {
        ordre: index + 1,
        titre: title,
        timestamp_seconds: Math.floor(seconds),
        source: 'youtube-chapters' as const,
      }
    })
    .filter((item: VideoChapterCandidate | null): item is VideoChapterCandidate => item !== null)
}

export function extractChaptersFromDescription(metadata: any): VideoChapterCandidate[] {
  const description = metadata?.description
  if (typeof description !== 'string') return []
  const parsed = parseTimestampChapters(description)
  return parsed.map((chapter) => ({ ...chapter, source: 'description' as const }))
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

function buildSearchTerms(keyword: string): string[] {
  const normalized = normalizeSearchValue(keyword)
  const variants = new Set<string>([normalized])

  switch (normalized) {
    case 'seoinage':
      variants.add('seoi')
      variants.add('seo')
      variants.add('seoag')
      break
    case 'kataguruma':
      variants.add('kataguruma')
      break
    case 'ukigoshi':
      variants.add('ukigoshi')
      break
    case 'haraigoshi':
      variants.add('harayoshi')
      variants.add('harai')
      break
    case 'tsurikomigoshi':
      variants.add('turikoshi')
      break
    case 'okuriashiharai':
      variants.add('okuri')
      variants.add('okuriashi')
      break
    case 'sasaetsurikomiashi':
      variants.add('sasae')
      variants.add('sasaetsurikomi')
      variants.add('sasaetsurikomiashi')
      variants.add('haraysasaiuri')
      variants.add('sasaiuri')
      break
    case 'uchimata':
      variants.add('uchimata')
      break
    case 'ukiotoshi':
      variants.add('ukiotoshi')
      break
  }

  return [...variants].map(normalizeSearchValue).filter((v, index, array) => v && array.indexOf(v) === index)
}

export function inferChaptersFromTranscript(cues: SubtitleCue[], keywords: string[]): VideoChapterCandidate[] {
  const normalizedKeywords = keywords
    .filter(Boolean)
    .map((keyword) => ({
      original: keyword.trim(),
      terms: buildSearchTerms(keyword),
    }))

  const results: VideoChapterCandidate[] = []
  const usedKeywords = new Set<string>()

  for (const cue of cues) {
    const normalizedText = normalizeSearchValue(cue.text)
    for (const keyword of normalizedKeywords) {
      if (usedKeywords.has(keyword.original)) continue
      if (keyword.terms.some((term) => normalizedText.includes(term))) {
        usedKeywords.add(keyword.original)
        results.push({
          ordre: results.length + 1,
          titre: keyword.original,
          timestamp_seconds: Math.floor(cue.start),
          source: 'transcript-keyword',
          note: `Première occurrence détectée dans la transcription automatique`,
        })
      }
    }
  }

  return results.sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)
}

export function buildChapterMarkdown(result: VideoChapterExtractionResult): string {
  const lines: string[] = []
  lines.push(`# Chapitres extraits pour ${result.videoId}`)
  lines.push('')
  lines.push(`- Source vidéo : ${result.sourceUrl}`)
  if (result.title) lines.push(`- Titre : ${result.title}`)
  if (result.durationSeconds !== undefined) lines.push(`- Durée : ${result.durationSeconds} s`)
  lines.push(`- Mode d'extraction : ${result.source}`)
  lines.push(`- Validation requise : ${result.needsValidation ? 'oui' : 'non'}`)
  lines.push('')
  lines.push('| # | Heure | Titre | Source | Note |')
  lines.push('|---|---:|---|---|---|')
  for (const chapter of result.chapters) {
    const time = `${Math.floor(chapter.timestamp_seconds / 60)}:${String(chapter.timestamp_seconds % 60).padStart(2, '0')}`
    lines.push(`| ${chapter.ordre} | ${time} | ${chapter.titre} | ${chapter.source} | ${chapter.note ?? ''} |`)
  }
  return lines.join('\n')
}

export function writeExtractionArtifacts(
  result: VideoChapterExtractionResult,
  outputDir: string,
  fileBaseName: string
): void {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  const jsonPath = `${outputDir}/${fileBaseName}.json`
  const mdPath = `${outputDir}/${fileBaseName}.md`
  writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8')
  writeFileSync(mdPath, buildChapterMarkdown(result), 'utf-8')
}

export function loadMetadataFile(path: string): any {
  const content = readFileSync(path, 'utf-8')
  return JSON.parse(content)
}

export function fetchYoutubeMetadata(url: string): any {
  const output = execFileSync('yt-dlp', ['--skip-download', '--dump-single-json', url], { encoding: 'utf-8' })
  return JSON.parse(output)
}
