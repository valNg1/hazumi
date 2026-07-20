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
| HZ-901 | Bibliothèque | **Livrée au WP 1.2** : rayons, recherche, sélection multiple, création de playlist | P1 | Ready for Review |
| HZ-902 | Mon espace | Navigation interne livrée au WP 1.2. La refonte complète du hub reste à faire | P2 | À traiter |
| HZ-904 | Catalogue réduit à 3 ressources | Sur décision du PO, 45 des 48 ressources ont été **supprimées** le 2026-07-19 (dont le référentiel 1er Dan et la leçon Harai-goshi). Conséquence : **22 parcours sur 23 sont vides**. Seul « Préparer le 1er Dan » conserve du contenu (Nage-no-kata) | P1 | **À traiter** |
| HZ-907 | Pagination serveur de la Bibliothèque | `Bibliotheque.tsx` charge l'intégralité du catalogue et des vidéos côté client, puis filtre en mémoire. Indolore aujourd'hui (48 ressources). **Seuil de déclenchement recommandé : 300 ressources visibles**, ou dès que le chargement initial dépasse ~500 Ko / 1 s en 3G. Correctif : `range()` côté serveur, recherche via `websearch_to_tsquery`, index GIN sur `tags`. Écarté du WP 1.4 sur décision du PO | P2 | **À traiter** |
| HZ-908 | Contenu premium encore dans le code | Après le WP 1.4, ~70 % de `src/lib/lessonPremium.ts` reste en dur : `pourquoi`, `jury`, `reperes`, `regardExaminateur`, `aRetenir`, `meta`, `objectifs`. Seuls les `detail` des 9 techniques passent en `asset_sections` | P2 | **À traiter** |
| HZ-906 | Vidéo Facebook sans vignette | `facebook.com/share/r/…` : Facebook n'expose pas de vignette sans API authentifiée. Vignette générée affichée. Correction possible en renseignant `thumbnail_url` | P3 | **À traiter** |
| HZ-905 | Parcours vides à masquer ou supprimer | 22 parcours n'ont plus aucune ressource et s'affichent vides côté judoka | P1 | **À traiter** |
| HZ-903 | Progression des playlists | Calculée par intersection tags ↔ ressources terminées, faute de liste figée dans le modèle. À confirmer en recette | P2 | À confirmer |

## Hors backlog

Les pistes non validées figurent en fin de [roadmap](vision/roadmap.md), section *Backlog futur*.
Elles ne constituent pas un engagement et n'entrent dans ce backlog qu'après décision du Product
Owner.
