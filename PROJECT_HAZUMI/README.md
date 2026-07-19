# Référentiel projet Hazumi

`PROJECT_HAZUMI/` est le **référentiel projet officiel de Hazumi**. Il rassemble la vision, les
spécifications fonctionnelles, l'état de l'existant, le backlog, les décisions structurantes, les
sprints, les recettes, les releases et la documentation technique.

## Principes fondateurs

**Git est la source de vérité du projet.** Ce qui n'est pas dans le dépôt n'existe pas : une
décision prise à l'oral, dans une conversation ou dans un outil tiers doit être reportée ici pour
faire foi.

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

**Aucun secret dans le référentiel.** Ni token, ni mot de passe, ni clé API, ni donnée
personnelle. Les variables d'environnement sont citées par leur nom, jamais par leur valeur.

## Par où commencer

| Question | Document |
|---|---|
| Que fait Hazumi aujourd'hui ? | [CURRENT_STATE.md](CURRENT_STATE.md) |
| Qu'est-ce qui est prévu ? | [BACKLOG.md](BACKLOG.md) |
| Qui décide quoi ? | [GOVERNANCE.md](GOVERNANCE.md) |
| Comment se déroule un sprint ? | [WORKFLOW.md](WORKFLOW.md) |
| Pourquoi ce choix a-t-il été fait ? | [decisions/](decisions/) |

## Structure

| Dossier | Contenu |
|---|---|
| `vision/` | Vision, principes directeurs, roadmap |
| `domains/` | Spécifications produit permanentes, par domaine fonctionnel |
| `decisions/` | ADR — décisions structurantes et leur justification |
| `sprints/` | Un dossier par sprint : spécification, prompt, recette, changelog |
| `releases/` | Mises en production effectives, après recette acceptée |
| `technical/` | Architecture, environnements, déploiement |
| `templates/` | Modèles réutilisables pour chaque type de document |

## Documents à la racine

| Document | Rôle |
|---|---|
| [GOVERNANCE.md](GOVERNANCE.md) | Rôles, autorité, règles de fonctionnement, Definition of Done |
| [WORKFLOW.md](WORKFLOW.md) | Cycle de production obligatoire, de l'idée à la mise en production |
| [CURRENT_STATE.md](CURRENT_STATE.md) | Photographie factuelle de l'existant |
| [BACKLOG.md](BACKLOG.md) | Backlog produit validé |

## Documents produit permanents

| Domaine | Document |
|---|---|
| Navigation | [domains/navigation.md](domains/navigation.md) |
| Parcours | [domains/parcours.md](domains/parcours.md) |
| Bibliothèque | [domains/bibliotheque.md](domains/bibliotheque.md) |
| Mon espace | [domains/mon-espace.md](domains/mon-espace.md) |

## Documentation technique

| Document | Objet |
|---|---|
| [technical/architecture.md](technical/architecture.md) | Architecture générale et flux |
| [technical/environments.md](technical/environments.md) | Environnements et variables attendues |
| [technical/deployment.md](technical/deployment.md) | Build, tests, déploiement, rollback |
