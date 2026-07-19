# Navigation

## Navigation cible

La navigation principale de Hazumi comporte **quatre entrées**, et uniquement quatre :

| Entrée | Rôle |
|---|---|
| **Accueil** | Point d'entrée. Reprendre là où le judoka s'est arrêté, voir l'essentiel en un écran |
| **Parcours** | Les parcours Hazumi et les parcours personnels du judoka |
| **Bibliothèque** | L'accès aux ressources : recherche, filtres, tags, composition de parcours personnels |
| **Mon espace** | Tout ce qui appartient en propre au judoka : entraînements, agenda, échanges, statistiques, réglages |

Cette navigation est organisée **par usage**, et non par catégorie de contenu. Chaque entrée
répond à une intention de l'utilisateur : *reprendre*, *progresser*, *chercher*, *gérer*.

## Sort des univers KYU, SHIAI et JUDO-KÂ

**KYU, SHIAI et JUDO-KÂ disparaissent de la navigation visible mais restent des métadonnées
internes.**

Ils continuent d'exister comme dimensions pédagogiques : ils servent à classer les contenus, à
filtrer dans la Bibliothèque et à orienter la conception des parcours. Ils ne constituent plus
des rubriques que l'utilisateur doit comprendre et choisir pour naviguer.

Justification et conséquences : [ADR-001](../decisions/ADR-001-navigation.md).

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
