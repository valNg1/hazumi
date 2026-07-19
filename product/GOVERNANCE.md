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
| Documentation | Lead Full Stack — Claude Code | Met à jour /product conformément au développement réellement livré |
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

- créer ou compléter le dossier correspondant dans `product/sprints/` ;
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
| Navigation | `product/product/navigation.md` |
| Parcours | `product/product/parcours.md` |
| Bibliothèque | `product/product/bibliotheque.md` |
| Mon espace | `product/product/mon-espace.md` |
| Décision structurante | `product/decisions/ADR-XXX-titre.md` (nouveau fichier) |

## 4. Definition of Done

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
