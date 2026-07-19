export type Statut = 'planifie' | 'fait' | 'annule'

export interface Annulable {
  statut?: Statut
}

export interface SeanceStats {
  total: number
  faites: number
  annulees: number
  tauxRealisation: number
}

function estAnnule(item: Annulable): boolean {
  return item.statut === 'annule'
}

/** Une seance annulee sort de l'agenda ; elle reste en base et reste restaurable. */
export function visibleItems<T extends Annulable>(items: T[], afficherAnnulees: boolean): T[] {
  return afficherAnnulees ? [...items] : items.filter((i) => !estAnnule(i))
}

/** Les annulees sortent du denominateur : le taux reflete les seances reellement prevues. */
export function computeSeanceStats(items: Annulable[]): SeanceStats {
  const annulees = items.filter(estAnnule).length
  const retenues = items.filter((i) => !estAnnule(i))
  const faites = retenues.filter((i) => i.statut === 'fait').length
  return {
    total: retenues.length,
    faites,
    annulees,
    tauxRealisation: retenues.length === 0 ? 0 : Math.round((faites / retenues.length) * 100),
  }
}
