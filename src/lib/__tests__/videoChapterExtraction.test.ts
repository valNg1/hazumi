import { describe, it, expect } from 'vitest'
import {
  parseSrt,
  normalizeKeyword,
  normalizeText,
  inferChaptersFromTranscript,
  extractChaptersFromDescription,
  formatSrtTimestamp,
} from '../videoChapterExtraction'

describe('videoChapterExtraction', () => {
  it('parses SRT timestamps correctly', () => {
    expect(formatSrtTimestamp('00:01:23,456')).toBe(83)
    expect(formatSrtTimestamp('01:02:03,000')).toBe(3723)
  })

  it('normalizes keywords and transcript text', () => {
    expect(normalizeKeyword('Seoi-nage')).toBe('seoi nage')
    expect(normalizeText('Uki-otoshi / Uchi-mata')).toBe('uki otoshi uchi mata')
  })

  it('infers chapters from transcript cues', () => {
    const cues = [
      { index: 1, start: 10, end: 12, text: 'This is Uki-otoshi.' },
      { index: 2, start: 30, end: 33, text: 'Now Seoi-nage.' },
      { index: 3, start: 60, end: 63, text: 'Finally Uchi-mata.' },
    ]
    const chapters = inferChaptersFromTranscript(cues, ['Uki-otoshi', 'Seoi-nage', 'Uchi-mata'])
    expect(chapters.map((c) => c.timestamp_seconds)).toEqual([10, 30, 60])
    expect(chapters.map((c) => c.titre)).toEqual(['Uki-otoshi', 'Seoi-nage', 'Uchi-mata'])
  })

  it('matches noisy transcript variants for kata names', () => {
    const cues = [
      { index: 1, start: 30, end: 33, text: 'Seoag UK attempts to strike.' },
      { index: 2, start: 50, end: 53, text: 'Harayoshi Tori presses his hip.' },
      { index: 3, start: 70, end: 73, text: 'Turikoshi Tori grasps the back.' },
      { index: 4, start: 90, end: 93, text: 'Sasae tsurikomi ashi is executed.' },
      { index: 5, start: 110, end: 113, text: 'Uchimata Tori moves forward.' },
    ]
    const chapters = inferChaptersFromTranscript(cues, ['Seoi-nage', 'Harai-goshi', 'Tsurikomi-goshi', 'Sasae-tsurikomi-ashi', 'Uchi-mata'])
    expect(chapters.map((c) => c.titre)).toEqual([
      'Seoi-nage',
      'Harai-goshi',
      'Tsurikomi-goshi',
      'Sasae-tsurikomi-ashi',
      'Uchi-mata',
    ])
    expect(chapters.map((c) => c.timestamp_seconds)).toEqual([30, 50, 70, 90, 110])
  })

  it('extracts chapters from a description with timestamps', () => {
    const metadata = { description: '0:00 Intro\n1:15 Uki-otoshi\n2:30 Seoi-nage' }
    const chapters = extractChaptersFromDescription(metadata)
    expect(chapters).toEqual([
      { ordre: 1, titre: 'Intro', timestamp_seconds: 0, source: 'description' },
      { ordre: 2, titre: 'Uki-otoshi', timestamp_seconds: 75, source: 'description' },
      { ordre: 3, titre: 'Seoi-nage', timestamp_seconds: 150, source: 'description' },
    ])
  })

  it('parses SRT content into cues', () => {
    const srt = `1\n00:00:07,839 --> 00:00:12,400\nHello world\n\n2\n00:00:12,400 --> 00:00:18,160\nSecond cue` 
    const cues = parseSrt(srt)
    expect(cues.length).toBe(2)
    expect(cues[0]).toEqual({ index: 1, start: 7, end: 12, text: 'Hello world' })
    expect(cues[1].text).toContain('Second cue')
  })
})
