# Référentiel produit Hazumi

`/product` est le **référentiel produit officiel de Hazumi**. Il rassemble la vision, les
spécifications fonctionnelles, les décisions structurantes, les sprints et les cahiers de recette.

## Principes fondateurs

**Git est la source de vérité du projet.** Ce qui n'est pas dans le dépôt n'existe pas :
une décision prise à l'oral, dans une conversation ou dans un outil tiers doit être reportée ici
pour faire foi.

**Les décisions, spécifications, développements et recettes doivent rester alignés.** Un document
produit décrit ce que le produit *doit* faire ; le code décrit ce qu'il *fait*. Les deux doivent
converger en permanence.

**Aucun développement n'est terminé tant que la documentation et la recette ne sont pas à jour.**
Un code livré sans documentation ni recette est un développement inachevé, quelle que soit la
qualité technique de l'implémentation.

**Chaque sprint doit enrichir le référentiel.** Un sprint qui ne laisse aucune trace documentaire
n'est pas conforme.

**En cas de divergence entre le code et la spécification produit validée, la divergence doit être
signalée avant de poursuivre.** Elle ne doit être résolue ni silencieusement dans le code, ni
silencieusement dans la documentation : l'écart est remonté au Product Owner, qui arbitre.

## Structure

| Dossier | Contenu |
|---|---|
| `vision/` | Vision, principes directeurs, roadmap |
| `product/` | Spécifications produit permanentes, par domaine fonctionnel |
| `decisions/` | ADR — décisions structurantes et leur justification |
| `sprints/` | Un dossier par sprint : spécification, prompt, recette, changelog |
| `templates/` | Modèles réutilisables pour chaque type de document |

## Documents de référence

- [GOVERNANCE.md](GOVERNANCE.md) — rôles, autorité, règles d'enrichissement, Definition of Done
- [WORKFLOW.md](WORKFLOW.md) — cycle de production obligatoire, de l'idée à la mise en production

## Documents produit permanents

| Domaine | Document |
|---|---|
| Navigation | [product/navigation.md](product/navigation.md) |
| Parcours | [product/parcours.md](product/parcours.md) |
| Bibliothèque | [product/bibliotheque.md](product/bibliotheque.md) |
| Mon espace | [product/mon-espace.md](product/mon-espace.md) |
