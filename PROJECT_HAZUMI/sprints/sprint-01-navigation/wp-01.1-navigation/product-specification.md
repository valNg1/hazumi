# Product Specification — WP 1.1 · Architecture de navigation

- **Statut :** Validated
- **Version :** 1.0
- **Sprint :** Sprint 1 — Nouvelle navigation
- **Décision de référence :** [ADR-001](../../../decisions/ADR-001-navigation.md)
- **Date de validation :** 2026-07-19

> Ce document reprend fidèlement le périmètre validé dans le prompt d'exécution et les trois
> décisions du Product Owner levant les points bloquants de l'Impact Report. Il n'introduit
> aucune décision produit nouvelle.

## Objectif

Mettre en place la nouvelle architecture de navigation de Hazumi.

Passer d'une navigation organisée selon les univers internes (KYU, SHIAI, JUDO-KÂ) à une
navigation organisée selon les usages du judoka : **Accueil, Parcours, Bibliothèque, Mon espace**.

## Contexte

La navigation actuelle expose les univers internes de Hazumi comme entrées principales. Elle
décrit l'organisation du produit plutôt que les intentions de l'utilisateur, et impose
d'apprendre trois notions propres à Hazumi avant de pouvoir naviguer.

## Utilisateurs concernés

Les judokas, sur l'ensemble des formats déjà pris en charge — desktop et mobile.

Le comportement de l'espace administrateur n'est pas concerné.

## Principe produit

La navigation doit décrire ce que l'utilisateur veut faire, et non la manière dont Hazumi est
organisé en interne.

KYU, SHIAI et JUDO-KÂ restent disponibles comme dimensions pédagogiques, catégories ou
métadonnées internes, mais ne doivent plus apparaître comme entrées principales de navigation.

## Périmètre

**1. Navigation principale** — afficher uniquement Accueil, Parcours, Bibliothèque, Mon espace.

**2. Routes cibles** — conformément à la décision D1 (option b) :

| Destination | Route |
|---|---|
| Accueil | `/` |
| Parcours | `/parcours` |
| Bibliothèque | `/bibliotheque` |
| Mon espace | `/mon-espace` |

**3. Accès aux fonctionnalités existantes** — toutes les fonctionnalités actuellement disponibles
doivent rester accessibles. Aucun contenu existant ne doit devenir inaccessible. La suppression de
KYU, SHIAI et JUDO-KÂ concerne uniquement leur présence dans la navigation principale.

**4. Pages non encore développées** — réutiliser en priorité une page existante pertinente ; sinon
créer une page transitoire minimale affichant le nom de la section, une courte phrase explicative,
et permettant une navigation normale. Ces pages ne doivent pas anticiper le design ni les
fonctionnalités des futurs WP.

## Décisions du Product Owner

### D1 — Convention d'URL : option b

- `/` reste réservé à `SmartRedirect` afin de préserver le routage par rôle.
- Accueil pointe vers `/` et redirige le judoka vers son accueil actuel.
- Les nouvelles routes sont `/parcours`, `/bibliotheque`, `/mon-espace`.
- Les anciennes routes `/eleve/*` restent accessibles afin de préserver les deep links et
  l'existant.
- Aucun comportement administrateur ne doit être modifié.

### D2 — Mon espace

Créer uniquement une **page transitoire minimale** dans ce WP. Elle peut donner accès aux
fonctions existantes, mais ne doit pas anticiper la future refonte de Mon espace.

### D3 — Gouvernance

Créer dans ce WP `decisions/ADR-002-development-workflow.md` et mettre à jour `GOVERNANCE.md` et
`WORKFLOW.md`.

L'Impact Report reste obligatoire et documenté, mais ne constitue plus un point d'arrêt après
validation de la Product Specification : Claude Code peut analyser, développer, tester,
documenter, merger et déployer dans une même séquence lorsqu'il y est explicitement autorisé.

## Hors périmètre

Ne pas refondre : la page Accueil, la page Parcours, la Bibliothèque, Mon espace, les contenus,
les leçons, les quiz, les vidéos, le lecteur, les parcours pédagogiques, les parcours personnels,
la progression, les favoris, les statistiques, Sensei Hazumi, la messagerie, Supabase, les
migrations, le modèle de données, l'authentification, l'intelligence artificielle, les règles
métier existantes, la charte graphique générale.

Ne pas profiter de ce WP pour réaliser une refactorisation générale non nécessaire.

**Anomalie `/espace`** — `switchSpace()` navigue vers une route non déclarée. **Ne pas corriger
dans ce WP** ; documenter en dette connue avec le statut « À traiter ».

## UX attendue

- La navigation principale comporte quatre entrées, sur desktop comme sur mobile.
- L'entrée correspondant à la page active est visuellement identifiable, selon les conventions
  graphiques existantes.
- Les pages transitoires affichent le nom de la section et une courte phrase explicative.

## Règles métier

- Aucune route existante n'est supprimée.
- Les URL des univers restent fonctionnelles.
- Le comportement d'arrivée sur `/` reste inchangé pour l'administrateur.

## Critères d'acceptation

| # | Critère |
|---|---|
| ACC-01 | La navigation principale affiche uniquement Accueil, Parcours, Bibliothèque, Mon espace |
| ACC-02 | KYU, SHIAI et JUDO-KÂ ne sont plus visibles dans la navigation principale |
| ACC-03 | Les routes `/`, `/parcours`, `/bibliotheque`, `/mon-espace` sont accessibles sans erreur |
| ACC-04 | L'entrée correspondant à la page active est visuellement identifiable |
| ACC-05 | La navigation fonctionne sur desktop et mobile |
| ACC-06 | Un accès direct à chacune des nouvelles routes fonctionne, y compris après actualisation |
| ACC-07 | Les fonctionnalités et contenus existants restent accessibles |
| ACC-08 | Aucune erreur liée à la navigation ou au routage dans la console |
| ACC-09 | Les tests automatisés sont verts |
| ACC-10 | Le build de production est vert |
| ACC-11 | Aucune régression fonctionnelle connue n'est introduite |

## Contraintes

- TDD : tests écrits avant le code.
- `npm run test` et `npm run build` verts avant livraison.
- Ne pas casser les tests existants sans justification tracée.

## Dépendances

Aucune. Les composants nécessaires existent déjà dans le dépôt.

## Risques

Détaillés dans l'[Impact Report](impact-report.md), §7.

## Décision du Product Owner

- **Statut :** Validée
- **Date :** 2026-07-19
- **Commentaire :** Périmètre validé, D1 option b, D2 page transitoire, D3 création dans ce WP.
  Autorisation d'exécution complète jusqu'à la mise en production, sans nouveau point d'arrêt.
  La recette fonctionnelle reste à la charge du Product Owner.
