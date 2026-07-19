# Décisions d'architecture produit (ADR)

Un **ADR** (Architecture Decision Record) consigne une décision structurante : son contexte, le
choix retenu, les alternatives écartées et les conséquences acceptées.

## Quand créer un ADR

Un ADR est requis lorsqu'une décision :

- modifie la navigation principale ;
- introduit ou supprime un objet fonctionnel visible ;
- change le modèle de données de manière non réversible ;
- fixe une orientation pédagogique engageante pour la suite ;
- écarte une alternative qu'il serait coûteux de reconsidérer plus tard.

Une décision de mise en œuvre technique sans effet sur le produit ne relève pas d'un ADR.

## Convention de nommage

```
ADR-XXX-titre-court.md
```

`XXX` est un numéro séquentiel sur trois chiffres, jamais réutilisé.

## Statuts

| Statut | Signification |
|---|---|
| `Proposed` | Rédigé, en attente de décision du Product Owner |
| `Accepted` | Décision prise et applicable |
| `Superseded` | Remplacé par un ADR ultérieur, référencé explicitement |
| `Deprecated` | Plus applicable, sans remplaçant |

Un ADR accepté **n'est jamais modifié sur le fond ni supprimé** : il est remplacé par un nouvel
ADR qui le référence. L'historique des décisions fait partie du référentiel.

## Index

| Numéro | Titre | Statut |
|---|---|---|
| [ADR-001](ADR-001-navigation.md) | Navigation par usage plutôt que par univers | Accepted |

## Modèle

Utiliser [templates/adr.md](../templates/adr.md).
