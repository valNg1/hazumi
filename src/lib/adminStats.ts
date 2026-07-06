export interface GrowthPoint {
  label: string
  total: number
}

/**
 * Cumul mensuel des comptes judoka créés, basé sur created_at.
 * Chaque point = nombre total de comptes existants à la fin du mois donné.
 * Fenêtre : du mois du plus ancien compte jusqu'au mois courant.
 */
export function buildUserGrowthData(
  judokas: { created_at: string }[],
  now: Date = new Date()
): GrowthPoint[] {
  if (judokas.length === 0) return []

  const dates = judokas.map((j) => new Date(j.created_at))
  const earliest = dates.reduce((a, b) => (a < b ? a : b))

  const startYear = earliest.getUTCFullYear()
  const startMonth = earliest.getUTCMonth()
  const endYear = now.getUTCFullYear()
  const endMonth = now.getUTCMonth()

  const points: GrowthPoint[] = []
  let y = startYear
  let m = startMonth
  while (y < endYear || (y === endYear && m <= endMonth)) {
    // fin du mois (exclusif = 1er du mois suivant)
    const monthEndExclusive = Date.UTC(y, m + 1, 1)
    const total = dates.filter((d) => d.getTime() < monthEndExclusive).length
    const label = new Date(Date.UTC(y, m, 1))
      .toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' })
      .replace('.', '')
    points.push({ label, total })
    m++
    if (m > 11) {
      m = 0
      y++
    }
  }
  return points
}
