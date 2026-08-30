import { describe, it, expect, vi } from 'vitest'
import { registerServiceWorker } from '../pwa'

// Issue #3 : sur iOS (PWA installée, Add to Home Screen), l'app reste suspendue en
// mémoire et ne recharge jamais le bundle → l'utilisateur reste bloqué sur une
// version obsolète (playlists inaccessibles depuis l'accueil). Android, relancé plus
// souvent, récupère la mise à jour. Le fix garantit que les nouveaux SW atteignent
// les clients : update() au retour au premier plan + reload quand un nouveau SW prend
// le contrôle.
function makeEnv({ hasSW = true, hadController = false } = {}) {
  const swListeners: Record<string, Array<() => void>> = {}
  const reg = { update: vi.fn(() => Promise.resolve()) }
  const sw = {
    controller: hadController ? {} : null,
    addEventListener: vi.fn((ev: string, cb: () => void) => {
      ;(swListeners[ev] ||= []).push(cb)
    }),
    register: vi.fn(() => Promise.resolve(reg)),
  }
  const docListeners: Record<string, Array<() => void>> = {}
  const doc = {
    visibilityState: 'visible' as DocumentVisibilityState,
    addEventListener: vi.fn((ev: string, cb: () => void) => {
      ;(docListeners[ev] ||= []).push(cb)
    }),
  }
  const win = { location: { reload: vi.fn() } }
  const nav = hasSW ? { serviceWorker: sw } : {}
  const fire = (map: Record<string, Array<() => void>>, ev: string) =>
    (map[ev] ?? []).forEach((cb) => cb())
  return { nav, doc, win, reg, sw, fireSW: (ev: string) => fire(swListeners, ev), fireDoc: (ev: string) => fire(docListeners, ev) }
}

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('registerServiceWorker — mise à jour PWA (issue #3, iOS)', () => {
  it('ne fait rien (et ne jette pas) si serviceWorker est indisponible', () => {
    const { nav, doc, win } = makeEnv({ hasSW: false })
    expect(() => registerServiceWorker(nav as unknown as Navigator, doc as unknown as Document, win as unknown as Window)).not.toThrow()
  })

  it('enregistre /sw.js', () => {
    const { nav, doc, win, sw } = makeEnv()
    registerServiceWorker(nav as unknown as Navigator, doc as unknown as Document, win as unknown as Window)
    expect(sw.register).toHaveBeenCalledWith('/sw.js')
  })

  it('vérifie les updates au démarrage puis à chaque retour au premier plan (iOS resume)', async () => {
    const { nav, doc, win, reg, fireDoc } = makeEnv()
    registerServiceWorker(nav as unknown as Navigator, doc as unknown as Document, win as unknown as Window)
    await flush()
    expect(reg.update).toHaveBeenCalledTimes(1) // au démarrage
    doc.visibilityState = 'visible'
    fireDoc('visibilitychange')
    expect(reg.update).toHaveBeenCalledTimes(2) // app revenue au premier plan
    doc.visibilityState = 'hidden'
    fireDoc('visibilitychange')
    expect(reg.update).toHaveBeenCalledTimes(2) // cachée → pas d'update
  })

  it('recharge la page quand un NOUVEAU SW prend le contrôle (mise à jour)', () => {
    const { nav, doc, win, fireSW } = makeEnv({ hadController: true })
    registerServiceWorker(nav as unknown as Navigator, doc as unknown as Document, win as unknown as Window)
    fireSW('controllerchange')
    expect(win.location.reload).toHaveBeenCalledTimes(1)
  })

  it('ne recharge pas à la première installation (aucun contrôleur au départ)', () => {
    const { nav, doc, win, fireSW } = makeEnv({ hadController: false })
    registerServiceWorker(nav as unknown as Navigator, doc as unknown as Document, win as unknown as Window)
    fireSW('controllerchange')
    expect(win.location.reload).not.toHaveBeenCalled()
  })

  it('ne recharge qu’une seule fois (garde anti-boucle)', () => {
    const { nav, doc, win, fireSW } = makeEnv({ hadController: true })
    registerServiceWorker(nav as unknown as Navigator, doc as unknown as Document, win as unknown as Window)
    fireSW('controllerchange')
    fireSW('controllerchange')
    expect(win.location.reload).toHaveBeenCalledTimes(1)
  })
})
