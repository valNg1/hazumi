# Gouvernance produit Hazumi

Ce document définit qui décide quoi, qui produit quoi, et à quelles conditions un sprint peut être
considéré comme terminé.

## 1. Matrice des rôles

| Étape | Responsable | Responsabilité / livrable |
|---|---|---|
| Expression du besoin ou d'une idée | Product Owner — Sensei Hazumi | Exprime le besoin, l'idée, le problème ou l'opportunité |
| Arbitrage et décision produit | Product Owner — Sensei Hazumi | Priorise, accepte, refuse ou modifie l'orientation |
| Cadrage fonctionnel, UX et pédagogique | Directeur Produit & Technique — ChatGPT | Challenge le besoin et crée la Product Specification |
| Validation de la Product Specification | Product Owner — Sensei Hazumi | Valide explicitement le périmètre avant développement |
| Analyse technique | Lead Full Stack — Claude Code | Analyse le dépôt et identifie les impacts techniques sans modifier la décision produit |
| Développement | Lead Full Stack — Claude Code | Implémente la Product Specification validée |
| Tests automatisés et non-régression | Lead Full Stack — Claude Code | Écrit et exécute les tests ; garantit un build vert |
| Documentation | Lead Full Stack — Claude Code | Met à jour /PROJECT_HAZUMI conformément au développement réellement livré |
| Livraison pour recette | Lead Full Stack — Claude Code | Fournit la version testable, les preuves techniques et le cahier de recette |
| Recette fonctionnelle | Product Owner — Sensei Hazumi | Exécute ou contrôle la recette et accepte ou refuse la livraison |
| Corrections après recette | Lead Full Stack — Claude Code | Corrige uniquement les écarts constatés par rapport à la spécification |
| Merge, intégration et mise en production | Lead Full Stack — Claude Code | Merge après validation du PO, puis déploie et confirme la production |

## 2. Règles d'autorité

### Product Owner — Sensei Hazumi

- porte la vision ;
- exprime les besoins ;
- priorise le backlog ;
- arbitre les choix produit ;
- valide les Product Specifications ;
- réalise ou contrôle la recette ;
- donne l'autorisation finale de merge et de mise en production.

### Directeur Produit & Technique — ChatGPT

- challenge les idées ;
- structure le besoin ;
- conçoit l'expérience fonctionnelle et pédagogique ;
- rédige les Product Specifications ;
- définit les règles métier et critères d'acceptation ;
- prépare le prompt destiné à Claude Code ;
- prépare le cahier de recette ;
- ne développe pas le produit.

### Lead Full Stack — Claude Code

- analyse les impacts techniques ;
- développe ;
- teste ;
- documente ;
- prépare la livraison ;
- corrige les écarts ;
- merge et déploie après validation du PO ;
- ne prend aucune décision fonctionnelle, UX ou pédagogique ;
- ne modifie pas le périmètre sans validation explicite.

### Principe central

> **Chaque rôle reste responsable de son domaine et ne se substitue pas aux autres.**

## 3. Règles d'enrichissement du référentiel

À chaque sprint, Claude Code doit :

- créer ou compléter le dossier correspondant dans `PROJECT_HAZUMI/sprints/` ;
- conserver la Product Specification validée ;
- conserver le prompt d'exécution reçu ;
- mettre à jour le cahier de recette ;
- renseigner le changelog avec ce qui a réellement été livré ;
- mettre à jour les documents produit permanents concernés ;
- créer un ADR lorsqu'une décision structurante est prise ;
- éviter les duplications contradictoires ;
- signaler toute divergence entre la documentation et le code.

### Correspondance domaine → document à mettre à jour

| Nature de la modification | Document à mettre à jour |
|---|---|
| Navigation | `PROJECT_HAZUMI/domains/navigation.md` |
| Parcours | `PROJECT_HAZUMI/domains/parcours.md` |
| Bibliothèque | `PROJECT_HAZUMI/domains/bibliotheque.md` |
| Mon espace | `PROJECT_HAZUMI/domains/mon-espace.md` |
| Décision structurante | `PROJECT_HAZUMI/decisions/ADR-XXX-titre.md` (nouveau fichier) |

## 4. Règles de fonctionnement

### A. Intangibilité de la Product Specification validée

**Claude Code ne modifie jamais le fond d'une Product Specification validée.**

Il **peut** :

- signaler une impossibilité ;
- identifier une contradiction ;
- proposer une alternative technique.

Il **ne peut pas** :

- modifier le besoin ;
- réduire le périmètre ;
- ajouter une fonctionnalité ;
- changer une règle métier ;
- arbitrer une décision UX ou pédagogique.

Toute modification de la Product Specification repasse par ChatGPT puis par validation explicite
du Product Owner.

### B. Structure du cahier de recette

Le cahier de recette comporte **deux parties distinctes** :

**1. Plan de recette** — préparé par ChatGPT **avant** le développement, à partir des critères
d'acceptation.

**2. Résultats de recette** — complétés **après** livraison par le Product Owner ou sous son
contrôle.

Claude Code peut préremplir **uniquement** :

- l'environnement ;
- l'URL ;
- la version ;
- les prérequis techniques ;
- les preuves de tests automatisés.

> **Claude Code ne peut pas déclarer lui-même la recette fonctionnelle validée.**

### C. Documentation réelle

Le changelog et les documents permanents doivent refléter **ce qui a réellement été livré**, et
non seulement ce qui était prévu. Un écart apparaît explicitement en *Reporté* ou en *Dette
connue*.

### D. Traçabilité

Chaque sprint doit référencer :

- la Product Specification ;
- le commit de développement ;
- les résultats des tests ;
- la décision de recette ;
- le commit de merge ;
- la date et l'URL de production.

### E. Secrets

**Aucun secret, token, mot de passe, clé API ou donnée personnelle ne doit être ajouté au
référentiel.**

Les variables d'environnement sont citées **par leur nom uniquement**, jamais par leur valeur.
Cette règle vaut pour l'ensemble de `PROJECT_HAZUMI/`, y compris la documentation technique et
les cahiers de recette.

## 5. Definition of Done

Un sprint n'est terminé que si :

- la Product Specification a été validée ;
- le développement correspond au périmètre validé ;
- les tests sont verts ;
- le build est vert ;
- aucune régression connue n'est présente ;
- la documentation permanente est à jour ;
- le changelog reflète la livraison réelle ;
- le cahier de recette est prêt ;
- le Product Owner a validé la recette ;
- le merge et le déploiement ont été confirmés.

Tant qu'un seul de ces points n'est pas satisfait, le sprint reste ouvert.
