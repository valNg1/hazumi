import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  SubtitleCue,
  parseSrt,
  extractChaptersFromMetadata,
  extractChaptersFromDescription,
  inferChaptersFromTranscript,
  VideoChapterExtractionResult,
  writeExtractionArtifacts,
  fetchYoutubeMetadata,
  normalizeKeyword,
} from '../src/lib/videoChapterExtraction'

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2)
  const out: Record<string, string> = {}
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (!next || next.startsWith('--')) {
        out[key] = 'true'
        i -= 0
      } else {
        out[key] = next
        i += 1
      }
    }
  }
  return out
}

function getVideoIdFromUrl(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function downloadAutoSub(videoUrl: string, lang = 'en'): string {
  const id = getVideoIdFromUrl(videoUrl)
  if (!id) throw new Error('Impossible de déterminer l ID de la vidéo à partir de l URL.')
  const outputTemplate = `videos/${id}.%(ext)s`
  console.log(`Téléchargement de la transcription automatique ${lang} pour ${id}...`)
  execFileSync('yt-dlp', [
    '--skip-download',
    '--write-auto-sub',
    '--sub-lang', lang,
    '--sub-format', 'srt',
    '--output', outputTemplate,
    videoUrl,
  ], { stdio: 'inherit' })
  return `videos/${id}.${lang}.srt`
}

function loadTranscript(path: string): SubtitleCue[] {
  const content = readFileSync(path, 'utf-8')
  return parseSrt(content)
}

function buildResult(
  videoUrl: string,
  metadata: any,
  transcriptCues: SubtitleCue[] | null,
  keywords: string[]
): VideoChapterExtractionResult {
  const videoId = metadata?.id || getVideoIdFromUrl(videoUrl) || 'unknown'
  const title = metadata?.title
  const durationSeconds = metadata?.duration ? Number(metadata.duration) : undefined
  const metadataCandidates = extractChaptersFromMetadata(metadata)
  const descriptionCandidates = extractChaptersFromDescription(metadata)
  const transcriptCandidates = transcriptCues && keywords.length > 0
    ? inferChaptersFromTranscript(transcriptCues, keywords)
    : []

  let chapters = metadataCandidates
  let source: VideoChapterExtractionResult['source'] = 'manual'
  let needsValidation = true

  if (metadataCandidates.length > 0) {
    chapters = metadataCandidates
    source = 'youtube-metadata'
    needsValidation = false
  } else if (descriptionCandidates.length > 0) {
    chapters = descriptionCandidates
    source = 'description'
    needsValidation = true
  } else if (transcriptCandidates.length > 0) {
    chapters = transcriptCandidates
    source = 'transcript'
    needsValidation = true
  }

  return {
    videoId,
    sourceUrl: videoUrl,
    title,
    durationSeconds,
    source,
    chapters,
    needsValidation,
  }
}

function main(): void {
  const args = parseArgs()
  const url = args.url || args.u
  const outputDir = args.output || args.o || 'knowledge/metadata/video-chapters'
  const keywordsArg = args.keywords || args.k || ''
  const keywordFile = args['keywords-file']
  const lang = args.lang || 'en'
  const localSrt = args.subtitle || args.s

  if (!url) {
    console.error('Usage: npx tsx scripts/extract-video-chapters.ts --url <youtube-url> [--output <dir>] [--keywords "A,B,C"] [--keywords-file <path>] [--lang en] [--subtitle <path>]')
    process.exit(1)
  }

  let keywords: string[] = []
  if (keywordFile) {
    const content = readFileSync(resolve(keywordFile), 'utf-8')
    keywords = content
      .split(/[,\n]/)
      .map((line) => line.trim())
      .filter(Boolean)
  } else if (keywordsArg) {
    keywords = keywordsArg
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  const metadata = fetchYoutubeMetadata(url)

  let transcriptCues: SubtitleCue[] | null = null
  if (localSrt && existsSync(localSrt)) {
    transcriptCues = loadTranscript(localSrt)
  } else {
    const videoId = metadata?.id || getVideoIdFromUrl(url)
    const candidate = videoId ? `videos/${videoId}.${lang}.srt` : null
    if (candidate && existsSync(candidate)) {
      transcriptCues = loadTranscript(candidate)
    }
  }

  if (!transcriptCues && keywords.length > 0) {
    const videoId = metadata?.id || getVideoIdFromUrl(url)
    const srtPath = videoId ? `videos/${videoId}.${lang}.srt` : null
    if (srtPath && !existsSync(srtPath)) {
      downloadAutoSub(url, lang)
    }
    if (srtPath && existsSync(srtPath)) {
      transcriptCues = loadTranscript(srtPath)
    }
  }

  const result = buildResult(url, metadata, transcriptCues, keywords)
  const fileBaseName = `${result.videoId}-chapters`
  writeExtractionArtifacts(result, outputDir, fileBaseName)

  console.log('Extraction terminée.')
  console.log(`Source principale : ${result.source}`)
  console.log(`Chapitres détectés : ${result.chapters.length}`)
  console.log(`Validation requise : ${result.needsValidation ? 'oui' : 'non'}`)
  console.log(`Fichiers écrits : ${outputDir}/${fileBaseName}.json et .md`)
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith('/scripts/extract-video-chapters.ts')) {
  main()
}
