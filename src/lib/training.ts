const JOURS_FERIES: Record<string, string[]> = {
  metropole: [
    '2024-01-01', '2024-04-01', '2024-05-01', '2024-05-08', '2024-05-09', '2024-05-19', '2024-07-14', '2024-08-15', '2024-11-01', '2024-11-11', '2024-12-25',
    '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09', '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
    '2026-01-01', '2026-04-05', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25', '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25',
  ],
  domtom: [
    '2024-01-01', '2024-04-01', '2024-05-01', '2024-05-08', '2024-05-09', '2024-05-19', '2024-07-14', '2024-08-15', '2024-11-01', '2024-11-11', '2024-12-25',
    '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09', '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
    '2026-01-01', '2026-04-05', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25', '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25',
  ],
}

const JOURS_MAP = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 }

// Jour LOCAL. toISOString() convertirait en UTC : en Europe/Paris, minuit du
// 20 juillet devient 22h le 19 et la seance s'affichait un jour a cote.
export function toStr(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mois}-${jour}`
}

// Jour UTC. Reserve aux calculs menes sur une base UTC (generateRecurrenceDates).
export function toUTCDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.getUTCDay()
}

export function isFerie(dateStr: string, zone: 'metropole' | 'domtom' | 'autre'): boolean {
  if (zone === 'autre') return false
  return JOURS_FERIES[zone]?.includes(dateStr) ?? false
}

export function generateRecurrenceDates(
  dateDebut: string,
  dateFin: string | null,
  joursSelectionnes: string[],
  excludeWeekends: boolean,
  excludeHolidays: boolean,
  zone: 'metropole' | 'domtom' | 'autre'
): string[] {
  const dates: string[] = []
  const actualEndDate = dateFin ? new Date(dateFin) : addDays(new Date(dateDebut), 365)

  let current = new Date(dateDebut + 'T00:00:00Z')
  while (current <= actualEndDate) {
    const dateStr = toUTCDateStr(current)
    const dayOfWeek = getDayOfWeek(dateStr)
    const dayKey = Object.entries(JOURS_MAP).find(([_, v]) => v === dayOfWeek)?.[0]

    let include = joursSelectionnes.includes(dayKey ?? '')
    if (include && excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) include = false
    if (include && excludeHolidays && isFerie(dateStr, zone)) include = false

    if (include) dates.push(dateStr)
    // Increment en UTC : setDate() raisonne en heure locale et deriverait au
    // changement d'heure.
    current = new Date(current.getTime())
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}

export interface TrainingForm {
  type: 'judo' | 'ppg' | 'cardio' | 'récupération' | 'autre'
  heureDebut: string
  heureFin: string
  isRecurrent: boolean
  dateSingle?: string
  dateDebut?: string
  dateFin?: string
  joursRecurrence: string[]
  excludeWeekends: boolean
  excludeHolidays: boolean
  zone: 'metropole' | 'domtom' | 'autre' | string
  notes: string
}
