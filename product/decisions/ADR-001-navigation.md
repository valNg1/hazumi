# ADR-001 — Navigation par usage plutôt que par univers

- **Numéro :** 001
- **Titre :** Navigation par usage plutôt que par univers
- **Statut :** Accepted

## Contexte

La navigation principale de Hazumi est organisée autour de trois univers pédagogiques : **KYU**,
**SHIAI** et **JUDO-KÂ**.

Cette organisation reflète la structure de conception des contenus, mais elle pose plusieurs
difficultés du point de vue de l'utilisateur :

- elle exige de comprendre trois notions propres à Hazumi **avant** de pouvoir naviguer ;
- elle demande au judoka de savoir à quel univers rattacher son besoin, alors que son intention
  est généralement plus simple : reprendre où il en était, chercher une technique, gérer ses
  séances ;
- un même besoin peut relever de plusieurs univers, ce qui rend le choix ambigu ;
- les fonctions personnelles (entraînements, agenda, messagerie) ne se rattachent naturellement à
  aucun des trois univers ;
- la structure classe les **contenus**, alors que la navigation devrait servir les **intentions**.

Le principe directeur « le nombre de concepts visibles doit rester limité » et l'exigence
« l'utilisateur doit toujours comprendre où il se trouve » sont directement en tension avec cette
organisation.

## Décision

Remplacer la navigation **KYU / SHIAI / JUDO-KÂ** par :

**Accueil / Parcours / Bibliothèque / Mon espace**

Les trois anciens univers **restent des dimensions pédagogiques internes** : ils continuent de
qualifier les contenus et servent de critères de classement et de filtrage, notamment dans la
Bibliothèque. Ils cessent d'être des rubriques de navigation.

## Raisons

- **La navigation suit l'intention, pas la taxonomie.** Chacune des quatre entrées correspond à
  une chose que le judoka veut faire : reprendre, progresser, chercher, gérer.
- **Le coût d'entrée baisse.** Aucun vocabulaire propre à Hazumi n'est nécessaire pour commencer à
  utiliser le produit.
- **Le parcours retrouve sa place centrale.** Conformément à la vision, il devient une entrée de
  premier niveau et non un contenu à l'intérieur d'un univers.
- **Les fonctions personnelles trouvent un point d'ancrage.** Mon espace accueille ce qui
  n'appartenait à aucun univers.
- **Aucune information n'est perdue.** Les univers subsistent comme métadonnées et restent
  exploitables là où ils sont réellement utiles : le filtrage.

## Alternatives envisagées

| Alternative | Raison du rejet |
|---|---|
| Conserver les trois univers et ajouter une entrée personnelle | Porte la navigation à quatre entrées sans supprimer le coût d'apprentissage des univers |
| Conserver les univers en sous-navigation d'une entrée unique | Déplace le problème sans le résoudre ; le judoka doit toujours choisir un univers |
| Navigation par grade (ceintures) | Exclut les contenus transverses et enferme le judoka dans son niveau courant |

## Conséquences

**Positives**

- Navigation compréhensible sans explication préalable.
- Les parcours deviennent visibles au premier niveau.
- Les fonctions personnelles sont regroupées de façon cohérente.

**Coûts et engagements**

- Les URL existantes fondées sur les univers doivent continuer à fonctionner : des redirections
  sont à prévoir dans le sprint d'implémentation.
- Les contenus doivent rester correctement qualifiés par leurs métadonnées d'univers, faute de
  quoi le filtrage de la Bibliothèque se dégrade.
- Aucune ressource ne doit devenir orpheline : chaque contenu doit rester atteignable depuis au
  moins une des quatre entrées. Un audit d'accessibilité des contenus est requis au moment de la
  bascule.
- Les judokas habitués à l'ancienne navigation devront se réorienter.

**Documents impactés**

- [product/navigation.md](../product/navigation.md)
- [product/parcours.md](../product/parcours.md)
- [product/bibliotheque.md](../product/bibliotheque.md)
- [product/mon-espace.md](../product/mon-espace.md)
