# Cahier de recette — WP 1.4 · Phase 1 (socle, hors horodatages)

- **Recetteur :** Product Owner — Sensei Hazumi
- **Phase :** 1 — socle technique. **Les neuf clips ne sont pas créés.**
- **URL :** https://hazumi.org

> Prérempli par le Lead Full Stack : environnement et preuves de tests uniquement (règle B de
> `GOVERNANCE.md`). **La recette fonctionnelle n'est pas déclarée acceptée.**

## Périmètre recettable aujourd'hui

Cette phase livre le **socle**. Aucune donnée de production n'a été créée : ni `media_sources`, ni
clip, ni `asset_sections`. Les scénarios SC-04 et SC-05 ne pourront donc être exécutés qu'après
réception des horodatages.

## Preuves de tests automatisés (prérempli)

| Contrôle | Résultat |
|---|---|
| `npm run test` | **338 tests verts / 38 fichiers** (283 avant, **+55**) |
| `npm run build` | **Vert** |
| Erreurs de lint ajoutées | **0** |
| Migration | Appliquée en production, additive |

## SC-01 — Non-régression du lecteur de leçon

Aucune ressource n'étant segmentée à ce stade, la leçon Nage-no-kata doit se comporter
**exactement comme avant**.

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir la leçon Nage-no-kata | La vidéo complète se charge | | ⬜ |
| 2 | Vérifier l'absence de bandeau « Séquence » | Aucun bandeau — la ressource n'est pas segmentée | | ⬜ |
| 3 | Cliquer un chapitre | La vidéo saute au bon horodatage | | ⬜ |
| 4 | Quiz, notes, progression | Inchangés | | ⬜ |
| 5 | Console navigateur | Aucune erreur | | ⬜ |

## SC-02 — Non-régression de la Bibliothèque

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir la Bibliothèque | Les 3 ressources, avec leurs vignettes | | ⬜ |
| 2 | Rechercher | Fonctionne | | ⬜ |
| 3 | Filtre Hazumi / Mes contenus | Fonctionne | | ⬜ |
| 4 | Playlists et couvertures | Inchangées (WP 1.3) | | ⬜ |

## SC-03 — Non-régression générale

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Navigation principale | 4 entrées | | ⬜ |
| 2 | Parcours, Mon espace, Ma progression | Inchangés | | ⬜ |
| 3 | Compte administrateur | Comportement inchangé | | ⬜ |

---

# Scénarios différés — après réception des horodatages

## SC-04 — Lecture d'une séquence *(bloqué)*

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir la leçon d'une technique | Le clip démarre **directement** à la technique | | ⬜ |
| 2 | Bandeau « Séquence » | Affiche la plage et la durée | | ⬜ |
| 3 | Laisser le clip aller au bout | La lecture **s'arrête** à la fin du segment | | ⬜ |
| 4 | Bouton « ↻ Revoir la séquence » | Le clip **repart au début du segment** | | ⬜ |
| 5 | Accès à la démonstration complète | Reste accessible séparément | | ⬜ |

## SC-05 — Comportement YouTube en fin de segment *(bloqué — point de recette obligatoire)*

> **À documenter précisément, sans présenter le segment comme un arrêt strict s'il ne l'est pas.**

**Comportement attendu d'après l'implémentation :** le paramètre `end` de l'iframe YouTube
**arrête la lecture** à la borne de fin. Il **ne verrouille pas** la barre de progression : une
relance manuelle depuis les contrôles YouTube poursuit la lecture **au-delà** du segment.

Le bouton « ↻ Revoir la séquence » recharge l'iframe et **ramène au début du segment** — c'est le
chemin de relance maîtrisé.

| # | Contexte | Question | Résultat observé | Statut |
|---|---|---|---|---|
| 1 | **Ordinateur** | La lecture s'arrête-t-elle à la fin du segment ? | | ⬜ |
| 2 | **Ordinateur** | Une relance via les contrôles YouTube dépasse-t-elle la borne ? | | ⬜ |
| 3 | **Mobile** | La lecture s'arrête-t-elle à la fin du segment ? | | ⬜ |
| 4 | **Mobile** | Une relance dépasse-t-elle la borne ? | | ⬜ |
| 5 | **Les deux** | « ↻ Revoir la séquence » ramène-t-il bien au début ? | | ⬜ |
| 6 | **Les deux** | Passer d'une technique à l'autre recharge-t-il le bon segment ? | | ⬜ |

**Si le comportement observé diffère de l'attente**, le consigner ici mot pour mot : la
documentation produit devra décrire le comportement réel, pas le comportement souhaité.

**Légende :** ⬜ non exécuté · ✅ conforme · ❌ non conforme · ⚠️ réserve


## SC-06 — Modèle multi-médias (phase 2, recettable dès maintenant)

Sans clip en production, ces contrôles portent sur le **socle** : la
non-régression du lecteur sur la ressource Nage-no-kata (vidéo complète, un seul
média implicite) et la solidité de la structure.

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir la leçon Nage-no-kata | Vidéo complète, **aucun sélecteur de média** (un seul média) | | ⬜ |
| 2 | Chapitres, quiz, notes | Inchangés | | ⬜ |
| 3 | Console navigateur | Aucune erreur | | ⬜ |

> Les scénarios de sélection de média (démonstration / ralenti / vue arrière)
> deviennent recettables **après le seed**, en même temps que SC-04 et SC-05.

## Prérequis

`Ctrl + Shift + R` — le service worker peut servir l'ancienne version.

## Décision finale du Product Owner

- **Statut :** En attente
- **Décision :** ⬜ Acceptée · ⬜ Acceptée avec réserves · ⬜ Refusée
- **Commentaire :** —
