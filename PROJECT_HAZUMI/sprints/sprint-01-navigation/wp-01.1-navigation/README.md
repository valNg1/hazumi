# WP 1.1 — Architecture de navigation

- **Sprint :** Sprint 1 — Nouvelle navigation
- **Statut :** `Impact Report` — en attente de GO du Product Owner
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
| `product-specification.md` | **Non transmise** | Directeur Produit & Technique — ChatGPT |
| [prompt-cc.md](prompt-cc.md) | Conservé | Directeur Produit & Technique — ChatGPT |
| [impact-report.md](impact-report.md) | Produit | Lead Full Stack — Claude Code |
| `recette.md` | À rédiger | ChatGPT (plan), PO (résultats) |
| `changelog.md` | Non démarré | Lead Full Stack — Claude Code |

## Recommandation de l'Impact Report

**GO SOUS CONDITION** — l'arbitrage du point de décision D1 (convention d'URL des quatre
destinations) est requis avant développement.

## Points de décision ouverts

| # | Sujet | Décideur |
|---|---|---|
| D1 | Convention d'URL : `/eleve/*` ou URL courtes ; sort de `/` et de `SmartRedirect` | Product Owner |
| D2 | « Mon espace » : page transitoire ou regroupement réel des fonctions | Product Owner |
| D3 | Création d'ADR-002 et inscription de l'Impact Report dans la gouvernance | Product Owner |

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
