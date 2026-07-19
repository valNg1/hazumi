# Workflow permanent Hazumi

Ce cycle est obligatoire pour toute évolution du produit. Il s'applique à chaque sprint, sans
exception.

## Cycle de production

1. Le Product Owner exprime une idée ou un besoin.
2. ChatGPT challenge et formalise la Product Specification.
3. Le Product Owner valide explicitement la Product Specification.
4. ChatGPT produit le prompt Claude Code et le cahier de recette.
5. Claude Code analyse les impacts techniques.
6. Claude Code développe selon la spécification validée.
7. Claude Code écrit et exécute les tests.
8. Claude Code vérifie le build et la non-régression.
9. Claude Code met à jour le référentiel `PROJECT_HAZUMI`.
10. Claude Code livre la version testable avec les preuves attendues.
11. Le Product Owner réalise la recette.
12. En cas d'échec, Claude Code corrige les écarts.
13. Après validation explicite du Product Owner, Claude Code merge et met en production.
14. Claude Code confirme le commit, le merge, le déploiement et l'URL de production.
15. Le sprint est clôturé uniquement lorsque le changelog et la recette sont à jour.

## Règle de blocage

> **Claude Code ne doit jamais merger ni mettre en production avant validation explicite de la
> recette par le Product Owner, sauf instruction contraire explicite du Product Owner dans le
> prompt du sprint.**

Cette règle est la garantie que la recette n'est pas court-circuitée par la vitesse d'exécution.
En cas de doute sur l'existence d'une autorisation, l'absence de merge est le comportement par
défaut.

## Points de contrôle

Le cycle comporte trois points d'arrêt où le Product Owner est seul décideur :

| Étape | Point de contrôle | Sans cette validation |
|---|---|---|
| 3 | Validation de la Product Specification | Le développement ne démarre pas |
| 11 | Recette fonctionnelle | La livraison n'est pas acceptée |
| 13 | Autorisation de merge et de mise en production | Rien ne part en production |

## Boucle de correction

Si la recette échoue (étape 11), le cycle repart à l'étape 12 puis revient en 11. Les corrections
portent **uniquement sur les écarts constatés par rapport à la spécification validée**. Toute
demande nouvelle apparue pendant la recette constitue un besoin distinct et repart à l'étape 1.
