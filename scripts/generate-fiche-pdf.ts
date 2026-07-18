import { chromium, type Browser } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=')
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
})

const supabase = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const OUT_DIR = resolve(process.cwd(), 'fiches-pdf')

export interface Fiche {
  id: string
  titre: string
  grade: string | null
  famille: string | null
  contenu: string | null
  tags: string[] | null
}

const LOGO_DATA_URI = (() => {
  const buf = readFileSync(resolve(process.cwd(), 'public/logo.png'))
  return `data:image/png;base64,${buf.toString('base64')}`
})()

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function renderFicheHtml(f: Fiche): string {
  const tags = f.tags ?? []
  const tagPills = tags
    .map(
      (t) =>
        `<span class="tag">${esc(t)}</span>`
    )
    .join('')

  const metaChips = [
    f.grade ? { label: 'Grade', value: f.grade } : null,
    f.famille ? { label: 'Famille', value: f.famille } : null,
  ]
    .filter(Boolean)
    .map(
      (m) => `
      <div class="chip">
        <span class="chip-label">${esc(m!.label)}</span>
        <span class="chip-value">${esc(m!.value)}</span>
      </div>`
    )
    .join('')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Apto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: 'Apto', system-ui, -apple-system, sans-serif;
    color: #0A0A0A;
    -webkit-font-smoothing: antialiased;
    background: #FFFFFF;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 20mm 18mm 20mm;
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { height: 40px; width: 40px; object-fit: contain; }
  .brand .name {
    font-weight: 800;
    font-size: 20px;
    letter-spacing: -0.01em;
    color: #0A0A0A;
  }
  .eyebrow {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #999999;
    text-align: right;
    line-height: 1.5;
  }
  .rule {
    height: 3px;
    background: #C41230;
    border-radius: 2px;
    margin: 14px 0 30px 0;
  }

  .title {
    font-size: 40px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0A0A0A;
    line-height: 1.05;
  }

  .meta {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .chip {
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: #FAFAFA;
    border: 1px solid #E5E5E5;
    border-radius: 12px;
    padding: 10px 16px;
    min-width: 120px;
  }
  .chip-label {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #999999;
  }
  .chip-value {
    font-size: 15px;
    font-weight: 600;
    color: #0A0A0A;
  }

  .section-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #999999;
    margin-bottom: 10px;
  }
  .body {
    margin-top: 34px;
  }
  .description {
    font-size: 13.5px;
    line-height: 1.85;
    color: #333333;
    text-align: justify;
  }

  .keywords {
    margin-top: 34px;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .tag {
    font-size: 10.5px;
    padding: 5px 11px;
    background: #F5F5F5;
    color: #666666;
    border: 1px solid #E5E5E5;
    border-radius: 999px;
    font-weight: 500;
  }

  .spacer { flex: 1; }
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #E5E5E5;
    padding-top: 12px;
    margin-top: 30px;
  }
  footer .site {
    font-size: 10px;
    font-weight: 700;
    color: #C41230;
    letter-spacing: 0.02em;
  }
  footer .tagline {
    font-size: 10px;
    color: #999999;
    font-style: italic;
  }
</style>
</head>
<body>
  <div class="page">
    <header>
      <div class="brand">
        <img src="${LOGO_DATA_URI}" alt="Hazumi" />
        <span class="name">Hazumi</span>
      </div>
      <div class="eyebrow">Référentiel technique<br/>1<sup>er</sup> dan</div>
    </header>
    <div class="rule"></div>

    <h1 class="title">${esc(f.titre)}</h1>

    <div class="meta">${metaChips}</div>

    <div class="body">
      <div class="section-label">Description</div>
      <p class="description">${esc(f.contenu ?? '')}</p>
    </div>

    <div class="keywords">
      <div class="section-label">Mots-clés</div>
      <div class="tags">${tagPills}</div>
    </div>

    <div class="spacer"></div>
    <footer>
      <span class="site">hazumi.org</span>
      <span class="tagline">Le judo continue après l'entraînement</span>
    </footer>
  </div>
</body>
</html>`
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export async function generatePdf(browser: Browser, f: Fiche): Promise<string> {
  const page = await browser.newPage()
  await page.setContent(renderFicheHtml(f), { waitUntil: 'networkidle' })
  await page.evaluate(() => (document as any).fonts.ready)
  mkdirSync(OUT_DIR, { recursive: true })
  const path = resolve(OUT_DIR, `${slugify(f.titre)}.pdf`)
  await page.pdf({ path, format: 'A4', printBackground: true })
  await page.close()
  return path
}

async function main() {
  const args = process.argv.slice(2)
  const all = args.includes('--all')
  const titreArg = (() => {
    const i = args.indexOf('--titre')
    return i >= 0 ? args[i + 1] : null
  })()

  let query = supabase
    .from('catalogue_hazumi')
    .select('id, titre, grade, famille, contenu, tags')
    .eq('type', 'article')
    .eq('parcours', 'kyu')
    .eq('grade', '1er dan')

  if (titreArg && !all) query = query.eq('titre', titreArg)

  const { data, error } = await query
  if (error) throw error
  const fiches = (data ?? []) as Fiche[]

  if (fiches.length === 0) {
    console.error('Aucune fiche trouvee.')
    process.exit(1)
  }

  const browser = await chromium.launch()
  const results: string[] = []
  for (const f of fiches) {
    const p = await generatePdf(browser, f)
    results.push(p)
    console.log(`OK  ${f.titre} -> ${p}`)
  }
  await browser.close()
  console.log(`\n${results.length} PDF genere(s) dans ${OUT_DIR}`)
}

import { pathToFileURL } from 'node:url'

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
