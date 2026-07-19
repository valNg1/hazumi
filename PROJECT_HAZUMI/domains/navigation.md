# Navigation

## Navigation (livrée — WP 1.1)

La navigation principale de Hazumi comporte **quatre entrées**, et uniquement quatre :

| Entrée | Rôle |
|---|---|
| **Accueil** | Point d'entrée. Reprendre là où le judoka s'est arrêté, voir l'essentiel en un écran |
| **Parcours** | Les parcours Hazumi et les parcours personnels du judoka |
| **Bibliothèque** | L'accès aux ressources : recherche, filtres, tags, composition de parcours personnels |
| **Mon espace** | Tout ce qui appartient en propre au judoka : entraînements, agenda, échanges, statistiques, réglages |

Cette navigation est organisée **par usage**, et non par catégorie de contenu. Chaque entrée
répond à une intention de l'utilisateur : *reprendre*, *progresser*, *chercher*, *gérer*.

### Routes

| Entrée | Route | État |
|---|---|---|
| Accueil | `/` | Redirige vers `/eleve/accueil` via `SmartRedirect` (routage par rôle préservé) |
| Parcours | `/parcours` | Page Parcours, sans filtre d'univers |
| Bibliothèque | `/bibliotheque` | **Page transitoire** — recherche et filtres à venir |
| Mon espace | `/mon-espace` | **Page transitoire** — accès aux fonctions personnelles existantes |

Convention retenue (décision D1, option b) : `/` reste réservé à `SmartRedirect` afin de ne pas
modifier le comportement d'arrivée des administrateurs. Les URL `/eleve/*` historiques restent
actives ; `/eleve/parcours`, `/eleve/bibliotheque` et `/eleve/mon-espace` redirigent vers les
nouvelles routes.

### État actif

Une entrée est active sur sa route, ses sous-routes et ses routes héritées. Accueil reste donc
allumé après la redirection de `/` vers `/eleve/accueil` ; Mon espace l'est sur les pages
entraînements, agenda, messages, profil et progression.

## Sort des univers KYU, SHIAI et JUDO-KÂ

**KYU, SHIAI et JUDO-KÂ disparaissent de la navigation visible mais restent des métadonnées
internes.**

Ils continuent d'exister comme dimensions pédagogiques : ils servent à classer les contenus, à
filtrer dans la Bibliothèque et à orienter la conception des parcours. Ils ne constituent plus
des rubriques que l'utilisateur doit comprendre et choisir pour naviguer.

Les routes `/eleve/kyu`, `/eleve/shiai` et `/eleve/judoka-culture` **restent fonctionnelles** :
seules les entrées de menu ont disparu. Les contenus correspondants sont atteignables depuis
Parcours (tous les parcours, sans filtre) et depuis la Bibliothèque.

Justification et conséquences : [ADR-001](../decisions/ADR-001-navigation.md).
Livré par le [WP 1.1](../sprints/sprint-01-navigation/wp-01.1-navigation/).

## Règles

- La navigation principale ne dépasse pas quatre entrées. Ajouter une cinquième entrée est une
  décision structurante qui exige un ADR.
- Un contenu doit être atteignable depuis au moins une des quatre entrées. Aucune page ne doit
  être orpheline.
- Les URL existantes doivent continuer à fonctionner après une modification de navigation ; les
  redirections nécessaires sont prévues au sprint qui modifie la navigation.
- L'utilisateur doit savoir en permanence dans quelle entrée il se trouve.

## Documents liés

- [parcours.md](parcours.md)
- [bibliotheque.md](bibliotheque.md)
- [mon-espace.md](mon-espace.md)
