# Cahier de recette — WP 1.1 · Architecture de navigation

- **Sprint :** Sprint 1 — Nouvelle navigation
- **Product Specification :** [product-specification.md](product-specification.md)
- **Recetteur :** Product Owner — Sensei Hazumi
- **Date de recette :** —

> **Partie 1 — Plan de recette** : dérivé des critères d'acceptation.
> **Partie 2 — Résultats** : à compléter par le Product Owner. Le Lead Full Stack a prérempli
> uniquement l'environnement, l'URL, la version et les preuves de tests automatisés, conformément
> à la règle B de `GOVERNANCE.md`.

## Environnement (prérempli)

| Élément | Valeur |
|---|---|
| Environnement | Production |
| URL publique | https://hazumi.org |
| Branche | `main` |
| Compte de test | Compte judoka du Product Owner |
| Navigateurs | Desktop (≥ 1024 px) et mobile (< 1024 px) |

## Prérequis

- Être connecté avec un compte **judoka** (non administrateur).
- Pour le scénario SC-06, disposer également d'un compte **administrateur**.
- **Vider le cache ou forcer le rafraîchissement** si la PWA est installée (voir dette connue).

## Preuves de tests automatisés (prérempli)

| Contrôle | Résultat |
|---|---|
| `npm run test` | **205 tests verts / 29 fichiers** |
| `npm run build` | **Vert** |
| Erreurs de lint ajoutées | **0** |

## Scénarios

### SC-01 — Navigation principale (ACC-01, ACC-02)

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Se connecter en tant que judoka | La navigation affiche **exactement quatre entrées** | | ⬜ |
| 2 | Lire les libellés | Accueil · Parcours · Bibliothèque · Mon espace | | ⬜ |
| 3 | Chercher Kyu, Shiai, Judo-Ka dans le menu | **Absents** | | ⬜ |

### SC-02 — Routes et état actif (ACC-03, ACC-04)

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Cliquer sur Accueil | Arrivée sur l'accueil judoka ; **Accueil reste souligné en rouge** | | ⬜ |
| 2 | Cliquer sur Parcours | La page Parcours s'affiche ; Parcours est actif | | ⬜ |
| 3 | Vérifier le contenu de Parcours | Les parcours des **trois univers** sont visibles, sans filtre | | ⬜ |
| 4 | Cliquer sur Bibliothèque | Page transitoire : titre, phrase explicative, trois accès | | ⬜ |
| 5 | Cliquer sur Mon espace | Page transitoire : titre, phrase explicative, cinq accès | | ⬜ |
| 6 | Depuis Mon espace, ouvrir « Mes entraînements » | La page s'affiche ; **Mon espace reste actif** | | ⬜ |

### SC-03 — Accès direct et actualisation (ACC-06)

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Saisir `hazumi.org/parcours` dans la barre d'adresse | La page Parcours s'affiche | | ⬜ |
| 2 | Actualiser (F5) | La page se recharge sans erreur | | ⬜ |
| 3 | Idem pour `/bibliotheque` | Idem | | ⬜ |
| 4 | Idem pour `/mon-espace` | Idem | | ⬜ |

### SC-04 — Contenus existants (ACC-07)

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Saisir `hazumi.org/eleve/kyu` | La page Kyu s'affiche **normalement** | | ⬜ |
| 2 | Idem `/eleve/shiai` et `/eleve/judoka-culture` | Les pages s'affichent | | ⬜ |
| 3 | Saisir `hazumi.org/eleve/parcours` | **Redirige** vers `/parcours` | | ⬜ |
| 4 | Ouvrir une leçon depuis un parcours | La leçon s'ouvre normalement | | ⬜ |
| 5 | Vérifier entraînements, agenda, messages, profil, progression | Toutes accessibles depuis Mon espace | | ⬜ |

### SC-05 — Mobile (ACC-05)

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir sur mobile (ou réduire la fenêtre) | Le bouton hamburger apparaît | | ⬜ |
| 2 | Ouvrir le menu | Les **quatre entrées** sont listées | | ⬜ |
| 3 | Choisir une entrée | Navigation correcte, menu refermé | | ⬜ |
| 4 | Vérifier l'entrée active | Fond gris foncé sur l'entrée courante | | ⬜ |

### SC-06 — Administrateur (règle métier)

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Se connecter en administrateur | Arrivée sur `/admin/dashboard` — **comportement inchangé** | | ⬜ |
| 2 | Vérifier la navigation admin | Inchangée | | ⬜ |

### SC-07 — Console (ACC-08)

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir la console, naviguer entre les quatre entrées | **Aucune erreur** de navigation ou de routage | | ⬜ |

### SC-08 — Point à confirmer : badge de messages

| # | Étape | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| 1 | Avec un message non lu, observer le menu | Le badge apparaît sur **Mon espace** | | ⬜ |
| 2 | **Décision du PO** | Ce rattachement est-il acceptable ? | | ⬜ |

**Légende :** ⬜ non exécuté · ✅ conforme · ❌ non conforme · ⚠️ conforme avec réserve

## Synthèse

| Indicateur | Valeur |
|---|---|
| Scénarios exécutés | — |
| Conformes | — |
| Non conformes | — |
| Réserves | — |

## Décision finale du Product Owner

- **Statut :** En attente
- **Date :** —
- **Décision :** ⬜ Acceptée · ⬜ Acceptée avec réserves · ⬜ Refusée
- **Commentaire :** —
