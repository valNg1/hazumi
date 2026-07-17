import type { ReactNode } from 'react'

// Rendu Markdown leger et sur : produit des noeuds React (jamais de HTML brut
// injecte), donc immunise contre l'injection. Sous-ensemble pratique pour les
// fiches Hazumi : titres, gras/italique, code, liens, listes, citations, code-blocks.

interface InlineRule {
  re: RegExp
  render: (m: RegExpMatchArray, key: string) => ReactNode
}

const INLINE_RULES: InlineRule[] = [
  { re: /`([^`]+)`/, render: (m, k) => <code key={k} className="bg-[#F5F5F5] border border-[#E5E5E5] rounded px-1 py-0.5 text-[13px] text-[#C41230]">{m[1]}</code> },
  { re: /\[([^\]]+)\]\(([^)\s]+)\)/, render: (m, k) => <a key={k} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-[#C41230] underline hover:text-[#9B0E25]">{m[1]}</a> },
  { re: /\*\*([^*]+)\*\*/, render: (m, k) => <strong key={k} className="font-semibold text-[#0A0A0A]">{m[1]}</strong> },
  { re: /\*([^*]+)\*/, render: (m, k) => <em key={k}>{m[1]}</em> },
]

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let rest = text
  let i = 0
  while (rest.length > 0) {
    let best: { rule: InlineRule; m: RegExpMatchArray; index: number } | null = null
    for (const rule of INLINE_RULES) {
      const m = rest.match(rule.re)
      if (m && m.index !== undefined && (best === null || m.index < best.index)) {
        best = { rule, m, index: m.index }
      }
    }
    if (!best) {
      nodes.push(rest)
      break
    }
    if (best.index > 0) nodes.push(rest.slice(0, best.index))
    nodes.push(best.rule.render(best.m, `${keyPrefix}-${i}`))
    rest = rest.slice(best.index + best.m[0].length)
    i++
  }
  return nodes
}

export function renderMarkdown(markdown: string): ReactNode {
  const lines = (markdown ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') { i++; continue }

    // Code block ```
    if (line.trim().startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++ }
      i++ // closing fence
      blocks.push(
        <pre key={key++} className="bg-[#0A0A0A] text-[#F5F5F5] rounded-lg p-3 overflow-x-auto text-[13px] my-3">
          <code>{buf.join('\n')}</code>
        </pre>
      )
      continue
    }

    // Titres
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      const level = heading[1].length
      const content = parseInline(heading[2], `h${key}`)
      const cls = level === 1 ? 'text-xl font-bold text-[#0A0A0A] mt-4 mb-2'
        : level === 2 ? 'text-base font-bold text-[#0A0A0A] mt-5 mb-2 pl-3 border-l-[3px] border-[#C41230]'
        : 'text-base font-semibold text-[#0A0A0A] mt-3 mb-1'
      if (level === 1) blocks.push(<h1 key={key++} className={cls}>{content}</h1>)
      else if (level === 2) blocks.push(<h2 key={key++} className={cls}>{content}</h2>)
      else blocks.push(<h3 key={key++} className={cls}>{content}</h3>)
      i++
      continue
    }

    // Liste a puces
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 my-2 space-y-1 text-sm text-[#333333]">
          {items.map((it, idx) => <li key={idx}>{parseInline(it, `ul${key}-${idx}`)}</li>)}
        </ul>
      )
      continue
    }

    // Liste ordonnee
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-5 my-2 space-y-1 text-sm text-[#333333]">
          {items.map((it, idx) => <li key={idx}>{parseInline(it, `ol${key}-${idx}`)}</li>)}
        </ol>
      )
      continue
    }

    // Citation
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      blocks.push(
        <blockquote key={key++} className="border-l-4 border-[#C41230] pl-3 my-3 text-sm text-[#666666] italic">
          {parseInline(buf.join(' '), `bq${key}`)}
        </blockquote>
      )
      continue
    }

    // Paragraphe (lignes consecutives non vides)
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i])
      i++
    }
    blocks.push(
      <p key={key++} className="text-sm text-[#333333] leading-relaxed my-2">
        {para.map((l, idx) => (
          <span key={idx}>
            {parseInline(l, `p${key}-${idx}`)}
            {idx < para.length - 1 && <br />}
          </span>
        ))}
      </p>
    )
  }

  return <div className="lesson-markdown">{blocks}</div>
}
