# Prompt Claude Code — <Titre>

- **Product Specification de référence :** `PROJECT_HAZUMI/sprints/<sprint>/product-specification.md`
- **Version de la spécification :** X.Y
- **Statut de la spécification :** doit être *Validated* avant exécution

## Objectif d'exécution

Ce que Claude Code doit réaliser, strictement dans le périmètre validé.

## Contraintes

- Ne pas modifier le périmètre sans validation explicite du Product Owner.
- Ne prendre aucune décision fonctionnelle, UX ou pédagogique.
- Signaler toute divergence entre le code existant et la spécification avant de poursuivre.
- Ne pas merger ni déployer avant validation explicite de la recette par le Product Owner, sauf
  instruction contraire explicite dans ce prompt.
- Autres contraintes propres au sprint : —

## Fichiers documentaires à mettre à jour

- `PROJECT_HAZUMI/domains/navigation.md` — si la navigation change
- `PROJECT_HAZUMI/domains/parcours.md` — si les parcours changent
- `PROJECT_HAZUMI/domains/bibliotheque.md` — si la Bibliothèque change
- `PROJECT_HAZUMI/domains/mon-espace.md` — si Mon espace change
- `PROJECT_HAZUMI/decisions/ADR-XXX-*.md` — si une décision structurante est prise
- `PROJECT_HAZUMI/sprints/<sprint>/changelog.md` — systématiquement

## Stratégie de tests

- Tests écrits **avant** le code (TDD).
- Cas nominaux, cas limites, cas d'erreur.
- Non-régression sur l'existant.
- Commande de vérification : `npm run test` puis `npm run build`.

## Definition of Done

Voir `PROJECT_HAZUMI/GOVERNANCE.md`, section *Definition of Done*.

## Livrables attendus

- Version testable et son URL.
- Résultat des tests et du build.
- Cahier de recette à jour.
- Changelog renseigné avec ce qui a réellement été livré.
- Liste explicite des écarts, reports et dettes connues.
