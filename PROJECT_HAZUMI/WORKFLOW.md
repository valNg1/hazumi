# Workflow permanent Hazumi

Ce cycle est obligatoire pour toute évolution du produit. Il s'applique à chaque sprint, sans
exception.

## Cycle de production

1. Le Product Owner exprime une idée ou un besoin.
2. ChatGPT challenge et formalise la Product Specification.
3. Le Product Owner valide explicitement la Product Specification.
4. ChatGPT produit le prompt d'exécution et le plan de recette.
5. **Claude Code produit l'Impact Report** (analyse technique, risques, points de décision).
6. Le Product Owner donne son GO explicite.
7. Claude Code développe selon la spécification validée.
8. Claude Code écrit et exécute les tests, vérifie le build et la non-régression.
9. Claude Code met à jour le référentiel `PROJECT_HAZUMI`.
10. Le Product Owner réalise la recette.
11. En cas d'écart, Claude Code corrige.
12. Claude Code merge et met en production.
13. Claude Code met à jour le changelog et la release, et confirme le commit, le merge, le
    déploiement et l'URL de production.

Voir [ADR-002](decisions/ADR-002-development-workflow.md).

### L'Impact Report (étape 5)

Obligatoire et documenté pour tout WP, conservé dans le dossier du WP concerné. Il contient au
minimum : compréhension du besoin, état actuel, fichiers impactés, stratégie de migration,
stratégie de tests, impact documentaire, risques, plan d'exécution, points de décision et
recommandation GO / GO sous condition / NO GO.

Il ne tranche aucune décision fonctionnelle, UX ou pédagogique : ces sujets sont remontés en
points de décision.

## Règle de blocage

> **Claude Code ne doit jamais merger ni mettre en production avant validation explicite de la
> recette par le Product Owner, sauf instruction contraire explicite du Product Owner dans le
> prompt du sprint.**

En cas de doute sur l'existence d'une autorisation, l'absence de merge est le comportement par
défaut.

### Enchaînement des étapes 5 à 12

L'Impact Report **ne constitue pas un point d'arrêt systématique**. Lorsque le Product Owner
l'autorise explicitement, Claude Code peut analyser, développer, tester, documenter, merger et
déployer dans une même séquence.

Sans autorisation explicite, l'étape 6 reste un point d'arrêt.

Dans tous les cas, **Claude Code ne déclare jamais la recette fonctionnelle acceptée à la place du
Product Owner.**

## Points de contrôle

Le cycle comporte trois points d'arrêt où le Product Owner est seul décideur :

| Étape | Point de contrôle | Sans cette validation |
|---|---|---|
| 3 | Validation de la Product Specification | Le développement ne démarre pas |
| 6 | GO après Impact Report | Le développement ne démarre pas, sauf autorisation explicite d'enchaîner |
| 10 | Recette fonctionnelle | La livraison n'est pas acceptée |
| 12 | Autorisation de merge et de mise en production | Rien ne part en production |

## Boucle de correction

Si la recette échoue (étape 10), le cycle repart à l'étape 11 puis revient en 10. Les corrections
portent **uniquement sur les écarts constatés par rapport à la spécification validée**. Toute
demande nouvelle apparue pendant la recette constitue un besoin distinct et repart à l'étape 1.
