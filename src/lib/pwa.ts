// Enregistrement du Service Worker + garantie que les nouveaux déploiements
// atteignent réellement les clients — en particulier les PWA iOS installées
// (Add to Home Screen), qui restent suspendues en mémoire et ne rechargent jamais
// le bundle d'elles-mêmes. Sans ce mécanisme, iOS reste bloqué sur une version
// obsolète (cf. issue #3 : playlists inaccessibles depuis l'accueil sur iOS alors
// qu'Android, relancé plus souvent, avait déjà la mise à jour).
export function registerServiceWorker(
  nav: Navigator = navigator,
  doc: Document = document,
  win: Window = window,
): void {
  if (!('serviceWorker' in nav)) return
  const sw = nav.serviceWorker

  // Un nouveau SW qui prend le contrôle (clientsClaim + skipWaiting) signifie qu'un
  // nouveau bundle est disponible : on recharge une seule fois pour l'adopter. On ne
  // recharge PAS à la première installation (aucun contrôleur au départ), pour ne pas
  // recharger inutilement une page qui exécute déjà la dernière version.
  const hadController = !!sw.controller
  let refreshing = false
  sw.addEventListener('controllerchange', () => {
    if (refreshing || !hadController) return
    refreshing = true
    win.location.reload()
  })

  sw
    .register('/sw.js')
    .then((reg) => {
      // Vérifie les mises à jour au démarrage, puis à chaque retour au premier plan.
      // Ce dernier point est déterminant sur iOS standalone, où l'app est suspendue
      // puis reprise sans rechargement : c'est le seul moment où l'on peut détecter
      // un nouveau SW et déclencher le rafraîchissement.
      reg.update()
      doc.addEventListener('visibilitychange', () => {
        if (doc.visibilityState === 'visible') reg.update()
      })
    })
    .catch((err) => {
      console.error('❌ Erreur Service Worker:', err)
    })
}
