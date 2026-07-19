# Prompt Claude Code — WP 1.1 · Architecture de navigation

- **Reçu le :** 2026-07-19
- **Émetteur :** Directeur Produit & Technique — ChatGPT
- **Phase :** 1 — Impact Report
- **Product Specification de référence :** non transmise (voir A1 de l'Impact Report)

> Prompt conservé tel qu'il a été reçu, conformément à `PROJECT_HAZUMI/GOVERNANCE.md`.

---

## Rôles

- Product Owner : Sensei Hazumi
- Directeur Produit & Technique : ChatGPT
- Lead Full Stack : Claude Code

La Product Specification du WP 1.1 a été validée par le Product Owner.

Respecter strictement le périmètre défini. Ne prendre aucune décision fonctionnelle, UX ou
pédagogique. Ne pas modifier le besoin validé. En cas d'ambiguïté, de contradiction ou
d'impossibilité technique, la signaler.

## Objectif

Mettre en place la nouvelle architecture de navigation de Hazumi.

Passer d'une navigation organisée selon les univers internes (KYU, SHIAI, JUDO-KÂ) à une
navigation organisée selon les usages du judoka : Accueil, Parcours, Bibliothèque, Mon espace.

## Principe produit

La navigation doit décrire ce que l'utilisateur veut faire, et non la manière dont Hazumi est
organisé en interne.

KYU, SHIAI et JUDO-KÂ restent disponibles comme dimensions pédagogiques, catégories ou
métadonnées internes, mais ne doivent plus apparaître comme entrées principales de navigation.

## Périmètre fonctionnel

**1. Navigation principale** — afficher uniquement Accueil, Parcours, Bibliothèque, Mon espace.

**2. Routes cibles** — `/`, `/parcours`, `/bibliotheque`, `/mon-espace`. Vérifier le routage réel
existant avant toute modification. Si l'application utilise déjà une convention différente, la
conserver uniquement si elle ne contredit pas la Product Specification. Toute divergence
significative doit être signalée dans l'Impact Report.

**3. Accès aux fonctionnalités existantes** — toutes les fonctionnalités actuellement disponibles
doivent rester accessibles. Aucun contenu existant ne doit devenir inaccessible. La suppression de
KYU, SHIAI et JUDO-KÂ concerne uniquement leur présence dans la navigation principale.

**4. Pages non encore développées** — réutiliser en priorité une page existante pertinente ; sinon
créer une page transitoire minimale affichant le nom de la section et une courte phrase
explicative, permettant une navigation normale. Ces pages ne doivent pas anticiper le design ni
les fonctionnalités des futurs WP.

## Hors périmètre

Ne pas refondre : la page Accueil, la page Parcours, la Bibliothèque, Mon espace, les contenus,
les leçons, les quiz, les vidéos, le lecteur, les parcours pédagogiques, les parcours personnels,
la progression, les favoris, les statistiques, Sensei Hazumi, la messagerie, Supabase, les
migrations, le modèle de données, l'authentification, l'intelligence artificielle, les règles
métier existantes, la charte graphique générale.

Ne pas profiter de ce WP pour réaliser une refactorisation générale non nécessaire.

## Critères d'acceptation

| # | Critère |
|---|---|
| ACC-01 | La navigation principale affiche uniquement Accueil, Parcours, Bibliothèque, Mon espace |
| ACC-02 | KYU, SHIAI et JUDO-KÂ ne sont plus visibles dans la navigation principale |
| ACC-03 | Les routes `/`, `/parcours`, `/bibliotheque`, `/mon-espace` sont accessibles sans erreur |
| ACC-04 | L'entrée correspondant à la page active est visuellement identifiable, selon les conventions graphiques existantes |
| ACC-05 | La navigation fonctionne sur les formats déjà pris en charge, notamment desktop et mobile |
| ACC-06 | Un accès direct à chacune des nouvelles routes fonctionne, y compris après actualisation |
| ACC-07 | Les fonctionnalités et contenus existants restent accessibles |
| ACC-08 | Aucune erreur liée à la navigation ou au routage dans la console du navigateur |
| ACC-09 | Les tests automatisés sont verts |
| ACC-10 | Le build de production est vert |
| ACC-11 | Aucune régression fonctionnelle connue n'est introduite |

## Gouvernance documentaire

Référentiel officiel : `PROJECT_HAZUMI/`.

Dossier du WP : `PROJECT_HAZUMI/sprints/sprint-01-navigation/wp-01.1-navigation/`, devant contenir
à terme `README.md`, `product-specification.md`, `prompt-cc.md`, `impact-report.md`, `recette.md`,
`changelog.md`.

À mettre à jour lorsque le développement sera réalisé : `PROJECT_HAZUMI/domains/navigation.md`,
`PROJECT_HAZUMI/CURRENT_STATE.md`, `PROJECT_HAZUMI/BACKLOG.md`, le changelog du WP, le statut du
WP.

Le changelog et `CURRENT_STATE.md` devront décrire ce qui aura réellement été livré, et non
uniquement ce qui était prévu.

## ADR et workflow

Le workflow validé comprend désormais un Impact Report obligatoire avant développement. Vérifier
si cette règle est inscrite dans `GOVERNANCE.md` et `WORKFLOW.md`, et si
`decisions/ADR-002-development-workflow.md` existe.

S'il n'existe pas, prévoir sa création avec la décision suivante — workflow séquentiel :

1. expression du besoin par le Product Owner ;
2. Product Specification créée par ChatGPT ;
3. validation explicite du Product Owner ;
4. prompt d'exécution ;
5. Impact Report de Claude Code ;
6. GO explicite du Product Owner ;
7. développement ;
8. tests ;
9. documentation ;
10. recette du Product Owner ;
11. corrections éventuelles ;
12. merge et mise en production par Claude Code ;
13. mise à jour du changelog et de la release.

Ne pas créer ou modifier ces documents pendant la phase d'Impact Report, sauf si cela est
nécessaire pour enregistrer l'Impact Report lui-même.

## Phase 1 obligatoire — Impact Report

À ce stade, ne pas développer. Analyser le dépôt et produire un Impact Report.

Aucun fichier applicatif modifié. Aucune dépendance ajoutée. Aucun test modifié. Aucun commit de
développement. Aucun merge ni déploiement.

L'Impact Report doit contenir : compréhension du besoin, état actuel, fichiers impactés, stratégie
de migration, stratégie de tests, impact documentaire, risques, plan d'exécution, points de
décision, recommandation GO / NO GO.

## Format du livrable

Créer `PROJECT_HAZUMI/sprints/sprint-01-navigation/wp-01.1-navigation/impact-report.md`.

Commit documentaire dédié : `docs: add WP 1.1 navigation impact report`, poussé sur la branche
`feature/wp-01-1-navigation` créée depuis `main` à jour. Aucun fichier applicatif dans ce commit.

## Note du Lead Full Stack

Le prompt initial se terminait par une autorisation de développer et de déployer, en contradiction
avec la Phase 1 qui l'interdit explicitement. Contradiction signalée au Product Owner, qui a
confirmé : Impact Report d'abord, développement et mise en production autorisés ensuite.
