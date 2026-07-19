# Backlog produit

Backlog initial, limité aux évolutions validées par le Product Owner. Toute évolution
supplémentaire doit passer par le [workflow](WORKFLOW.md) avant d'être inscrite ici.

## Conventions

**Identifiant :** `HZ-NNN`, séquentiel, jamais réutilisé.

**Priorité :** P0 (bloquant) · P1 (haute) · P2 (normale) · P3 (basse)

**Statut :** `Backlog` · `Draft` · `Validated` · `In Development` · `Ready for Review` ·
`Accepted` · `Released` · `Cancelled`

## Sprint 0 — Référentiel projet

| ID | Intitulé | Objectif | Priorité | Statut | Sprint cible |
|---|---|---|---|---|---|
| HZ-001 | Référentiel projet Hazumi | Disposer d'un référentiel unique et versionné : gouvernance, workflow, vision, domaines, décisions, sprints, recettes | P0 | Accepted | Sprint 0 |

## Sprint 1 — Nouvelle navigation

Référence : [ADR-001](decisions/ADR-001-navigation.md)

| ID | Intitulé | Objectif | Priorité | Statut | Sprint cible |
|---|---|---|---|---|---|
| HZ-010 | Entrée « Accueil » | Offrir un point d'entrée qui permet de reprendre immédiatement là où le judoka s'est arrêté | P1 | Ready for Review | Sprint 1 |
| HZ-011 | Entrée « Parcours » | Rendre les parcours accessibles au premier niveau de navigation | P1 | Ready for Review | Sprint 1 |
| HZ-012 | Entrée « Bibliothèque » | Donner un accès direct aux ressources, indépendamment des parcours | P1 | Ready for Review | Sprint 1 |
| HZ-013 | Entrée « Mon espace » | Regrouper ce qui appartient en propre au judoka | P1 | Ready for Review | Sprint 1 |
| HZ-014 | Retrait des univers de la navigation | Faire de KYU, SHIAI et JUDO-KÂ des métadonnées internes, sans perte d'accès aux contenus | P1 | Ready for Review | Sprint 1 |

## Sprint 2 — Expérience de progression

| ID | Intitulé | Objectif | Priorité | Statut | Sprint cible |
|---|---|---|---|---|---|
| HZ-020 | Page parcours | Présenter un parcours de façon lisible : intention, contenu, avancement | P1 | Backlog | Sprint 2 |
| HZ-021 | Bouton « Continuer » | Permettre de reprendre un parcours en une action, sans avoir à chercher où l'on en était | P1 | Backlog | Sprint 2 |
| HZ-022 | Progression | Rendre l'avancement visible et compréhensible au sein d'un parcours | P1 | Backlog | Sprint 2 |
| HZ-023 | Prochaine étape | Indiquer explicitement ce qui vient ensuite | P1 | Backlog | Sprint 2 |

## Sprint 3 — Parcours personnels

| ID | Intitulé | Objectif | Priorité | Statut | Sprint cible |
|---|---|---|---|---|---|
| HZ-030 | Recherche et filtres | Permettre de retrouver une ressource dans la Bibliothèque | P1 | Backlog | Sprint 3 |
| HZ-031 | Sélection des ressources | Permettre de sélectionner plusieurs ressources au fil de la navigation | P1 | Backlog | Sprint 3 |
| HZ-032 | Création d'un parcours depuis la Bibliothèque | Transformer une sélection en parcours personnel | P1 | Backlog | Sprint 3 |
| HZ-033 | Apparition dans « Mes parcours » | Faire figurer les parcours personnels dans l'entrée Parcours | P1 | Backlog | Sprint 3 |

## Dette connue

| ID | Intitulé | Constat | Priorité | Statut |
|---|---|---|---|---|
| HZ-900 | Anomalie `/espace` | `switchSpace()` dans `src/components/Layout.tsx` navigue vers `/espace`, route déclarée nulle part dans `src/App.tsx`. Le sélecteur d'espace renvoie silencieusement l'utilisateur à l'accueil. Anomalie **préexistante**, relevée lors du WP 1.1, volontairement non corrigée (hors périmètre) | P2 | **À traiter** |
| HZ-901 | Bibliothèque transitoire | La page `/bibliotheque` livrée au WP 1.1 est transitoire : recherche, filtres, tags et sélection multiple restent à implémenter | P1 | À traiter (Sprint 3) |
| HZ-902 | Mon espace transitoire | La page `/mon-espace` livrée au WP 1.1 donne accès aux fonctions existantes sans les regrouper réellement | P2 | À traiter |

## Hors backlog

Les pistes non validées figurent en fin de [roadmap](vision/roadmap.md), section *Backlog futur*.
Elles ne constituent pas un engagement et n'entrent dans ce backlog qu'après décision du Product
Owner.
