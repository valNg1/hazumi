# ADR-002 — Workflow de développement séquentiel avec Impact Report

- **Numéro :** 002
- **Titre :** Workflow de développement séquentiel avec Impact Report
- **Statut :** Accepted
- **Date :** 2026-07-19
- **Décideur :** Product Owner — Sensei Hazumi

## Contexte

Le workflow initial ([WORKFLOW.md](../WORKFLOW.md)) enchaînait la validation de la Product
Specification et le développement sans étape d'analyse technique formalisée.

Cette absence pose deux difficultés :

- le Product Owner valide un périmètre fonctionnel sans visibilité sur son coût technique, ses
  risques, ni les fichiers réellement touchés ;
- les divergences entre la spécification et l'état réel du dépôt — conventions d'URL, composants
  existants, tests codant en dur une décision produit caduque — ne sont découvertes qu'en cours de
  développement, quand il est coûteux d'en tenir compte.

Le WP 1.1 a illustré concrètement ce besoin : l'analyse préalable a révélé une divergence de
convention de routage et un test existant contredisant frontalement un critère d'acceptation.
Trancher ces points en cours de développement aurait conduit le Lead Full Stack à prendre seul des
décisions relevant du produit.

## Décision

Hazumi adopte un **workflow séquentiel en treize étapes** :

1. expression du besoin par le Product Owner ;
2. Product Specification créée par ChatGPT ;
3. validation explicite du Product Owner ;
4. prompt d'exécution ;
5. **Impact Report de Claude Code** ;
6. GO explicite du Product Owner ;
7. développement ;
8. tests ;
9. documentation ;
10. recette du Product Owner ;
11. corrections éventuelles ;
12. merge et mise en production par Claude Code ;
13. mise à jour du changelog et de la release.

### Statut de l'Impact Report

L'Impact Report est **obligatoire et documenté** pour tout WP. Il est conservé dans le dossier du
WP concerné.

Il **ne constitue plus un point d'arrêt** après validation de la Product Specification : lorsque
le Product Owner l'autorise explicitement, Claude Code peut analyser, développer, tester,
documenter, merger et déployer **dans une même séquence**.

Sans autorisation explicite, l'étape 6 reste un point d'arrêt.

### Contenu minimal de l'Impact Report

Compréhension du besoin · état actuel · fichiers impactés · stratégie de migration · stratégie de
tests · impact documentaire · risques · plan d'exécution · points de décision · recommandation
GO / GO sous condition / NO GO.

### Ce que l'Impact Report ne fait pas

Il ne tranche aucune décision fonctionnelle, UX ou pédagogique. Lorsqu'une décision de cette
nature conditionne le développement, elle est remontée en **point de décision** et arbitrée par le
Product Owner ou le Directeur Produit & Technique.

## Alternatives

| Alternative | Raison du rejet |
|---|---|
| Conserver le workflow sans Impact Report | Le Product Owner valide un périmètre sans visibilité sur le coût technique ni les risques ; les divergences sont découvertes trop tard |
| Impact Report systématiquement bloquant | Impose un aller-retour même lorsque le Product Owner a déjà tranché les points ouverts ; ralentit sans bénéfice quand aucune ambiguïté ne subsiste |
| Analyse technique informelle, non écrite | Aucune trace ; les arbitrages ne sont pas rattachables à un document, contrairement au principe « Git est la source de vérité » |

## Conséquences

**Positives**

- Le Product Owner décide avec une vision du coût, des risques et des fichiers touchés.
- Les divergences documentation / code sont détectées **avant** le développement.
- Les points relevant du produit sont explicitement séparés des choix techniques.
- L'analyse préalable laisse une trace durable dans le référentiel.

**Coûts et engagements**

- Chaque WP produit un document supplémentaire à rédiger et à maintenir.
- Le dossier de chaque WP comporte désormais un fichier de plus.
- La souplesse de l'étape 6 repose sur une autorisation explicite : en son absence, l'arrêt reste
  la règle par défaut, et cette distinction doit être respectée sans interprétation extensive.

**Documents impactés**

- [WORKFLOW.md](../WORKFLOW.md) — cycle porté à 13 étapes
- [GOVERNANCE.md](../GOVERNANCE.md) — règle F et matrice des rôles
- [templates/](../templates/) — un modèle d'Impact Report est à prévoir
