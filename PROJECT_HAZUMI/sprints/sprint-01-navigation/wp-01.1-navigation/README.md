# WP 1.1 — Architecture de navigation

- **Sprint :** Sprint 1 — Nouvelle navigation
- **Statut :** `Ready for Review` — livré, en attente de recette du Product Owner
- **Décision de référence :** [ADR-001](../../../decisions/ADR-001-navigation.md)

## Objectif

Remplacer la navigation par univers internes (KYU, SHIAI, JUDO-KÂ) par une navigation par usage :
**Accueil / Parcours / Bibliothèque / Mon espace**.

Le WP porte sur l'architecture de navigation, le routage et l'accessibilité des fonctionnalités
existantes — pas sur le contenu des pages de destination.

## Éléments du backlog couverts

| ID | Intitulé |
|---|---|
| HZ-010 | Entrée « Accueil » |
| HZ-011 | Entrée « Parcours » |
| HZ-012 | Entrée « Bibliothèque » |
| HZ-013 | Entrée « Mon espace » |
| HZ-014 | Retrait des univers de la navigation |

## Documents du WP

| Document | Statut | Responsable |
|---|---|---|
| [product-specification.md](product-specification.md) | Validée | Directeur Produit & Technique — ChatGPT |
| [prompt-cc.md](prompt-cc.md) | Conservé | Directeur Produit & Technique — ChatGPT |
| [impact-report.md](impact-report.md) | Produit | Lead Full Stack — Claude Code |
| [recette.md](recette.md) | Plan prêt | ChatGPT (plan), PO (résultats) |
| [changelog.md](changelog.md) | Renseigné | Lead Full Stack — Claude Code |

## Décisions du Product Owner

| # | Sujet | Décision |
|---|---|---|
| D1 | Convention d'URL | **Option b** — `/` réservé à `SmartRedirect` ; routes `/parcours`, `/bibliotheque`, `/mon-espace` ; `/eleve/*` conservées |
| D2 | « Mon espace » | **Page transitoire minimale** uniquement |
| D3 | Gouvernance | **Créer** ADR-002 et mettre à jour GOVERNANCE.md et WORKFLOW.md dans ce WP |

Anomalie `/espace` : **non corrigée**, inscrite en dette connue (HZ-900, « À traiter »).

## Traçabilité

| Élément | Valeur |
|---|---|
| Branche | `feature/wp-01-1-navigation` |
| Commit Impact Report | voir `git log` |
| Commit de développement | — |
| Résultats des tests | — |
| Décision de recette | — |
| Commit de merge | — |
| Date de mise en production | — |
| URL de production | — |
