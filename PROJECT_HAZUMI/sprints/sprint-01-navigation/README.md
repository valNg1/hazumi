# Sprint 1 — Nouvelle navigation

- **Nom :** Sprint 1 — Nouvelle navigation
- **Statut :** `In Development` — WP 1.1 livré, en attente de recette

## Objectif

Remplacer la navigation par univers (KYU / SHIAI / JUDO-KÂ) par une navigation par usage :
**Accueil / Parcours / Bibliothèque / Mon espace**. Les trois univers deviennent des métadonnées
internes et disparaissent de la navigation visible.

Décision de référence : [ADR-001](../../decisions/ADR-001-navigation.md).

## Statut

Le sprint est en `Draft` : **la Product Specification n'a pas été rédigée ni validée par le
Product Owner.** Aucun développement ne peut démarrer tant que le statut n'est pas `Validated`.

Valeurs autorisées : `Draft` · `Validated` · `In Development` · `Ready for Review` · `Accepted` ·
`Released` · `Cancelled`.

## Éléments du backlog couverts

| ID | Intitulé |
|---|---|
| HZ-010 | Entrée « Accueil » |
| HZ-011 | Entrée « Parcours » |
| HZ-012 | Entrée « Bibliothèque » |
| HZ-013 | Entrée « Mon espace » |
| HZ-014 | Retrait des univers de la navigation |

## Documents du sprint

| Document | Statut | Responsable |
|---|---|---|
| [product-specification.md](product-specification.md) | À rédiger | Directeur Produit & Technique — ChatGPT |
| [prompt-cc.md](prompt-cc.md) | En attente | Directeur Produit & Technique — ChatGPT |
| [recette.md](recette.md) | À rédiger (plan de recette) | Directeur Produit & Technique — ChatGPT |
| [changelog.md](changelog.md) | Non démarré | Lead Full Stack — Claude Code |

## Traçabilité

| Élément | Valeur |
|---|---|
| Product Specification | — |
| Commit de développement | — |
| Résultats des tests | — |
| Décision de recette | — |
| Commit de merge | — |
| Date de mise en production | — |
| URL de production | — |

## Décision finale du Product Owner

- **Statut :** En attente
- **Date :** —
- **Décision :** ⬜ Acceptée · ⬜ Acceptée avec réserves · ⬜ Refusée
- **Commentaire :** —

## Point de vigilance identifié

L'ADR-001 relève une conséquence à traiter dans ce sprint : au retrait des univers de la
navigation, vérifier qu'**aucune ressource ne devient inatteignable** et prévoir les redirections
des URL existantes. À intégrer aux critères d'acceptation de la Product Specification.
