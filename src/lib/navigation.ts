export interface NavItem {
  to: string
  label: string
  /** Routes supplementaires sur lesquelles l'entree doit apparaitre active. */
  match?: string[]
}

/** Une entree est active sur sa route, ses sous-routes et ses routes heritees. */
export function isNavActive(item: NavItem, pathname: string): boolean {
  const correspond = (base: string) =>
    base === '/' ? pathname === '/' : pathname === base || pathname.startsWith(`${base}/`)
  return correspond(item.to) || (item.match ?? []).some(correspond)
}
