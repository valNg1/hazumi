# Sprints

Un dossier par sprint. Il conserve la trace complète de ce qui a été décidé, demandé, livré et
recetté.

## Convention de nommage

```
sprint-NN-nom-court/
```

## Contenu obligatoire

| Fichier | Rôle | Auteur |
|---|---|---|
| `product-specification.md` | Périmètre validé par le Product Owner | ChatGPT |
| `prompt-cc.md` | Prompt d'exécution reçu, conservé tel quel | ChatGPT |
| `recette.md` | Cahier de recette et résultats | ChatGPT, complété par le PO |
| `changelog.md` | Ce qui a réellement été livré | Claude Code |

Ces quatre fichiers sont requis pour qu'un sprint soit conforme. Un sprint sans changelog à jour
n'est pas clôturé — voir la Definition of Done dans [GOVERNANCE.md](../GOVERNANCE.md).

## Règle de fidélité

Le changelog décrit **ce qui a été livré**, pas ce qui était prévu. Un écart entre la
spécification et la livraison doit apparaître explicitement : reporté, abandonné, ou dette connue.

Le prompt est conservé **tel qu'il a été reçu**, sans réécriture a posteriori.

## Index

| Sprint | Objet | Statut |
|---|---|---|
| Sprint 0 | Référentiel produit | En cours |
| [sprint-01-navigation](sprint-01-navigation/) | Nouvelle navigation | À venir |

## Modèles

Voir [templates/](../templates/).
