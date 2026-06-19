export type Space = 'eleve' | 'club'

export function getSpace(): Space | null {
  return (localStorage.getItem('hazumi_space') as Space) ?? null
}

export function setSpace(space: Space) {
  localStorage.setItem('hazumi_space', space)
}

export function clearSpace() {
  localStorage.removeItem('hazumi_space')
}
