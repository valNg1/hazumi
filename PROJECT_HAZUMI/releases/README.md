# Releases

Historique des mises en production de Hazumi.

## Règle d'inscription

> **Une release est ajoutée uniquement après recette acceptée par le Product Owner et mise en
> production confirmée.**

Ni une livraison en attente de recette, ni une recette acceptée sans déploiement, ni un
déploiement de prévisualisation ne constituent une release.

**Aucune release historique n'est reconstituée a posteriori.** Les mises en production
antérieures à la création de ce référentiel ne sont pas inscrites ici : elles ne peuvent pas être
rattachées à une recette formelle, et une release fabriquée après coup donnerait une fausse
traçabilité.

L'historique factuel du code reste disponible dans `git log` et dans l'historique des
déploiements Vercel.

## Contenu attendu d'une release

Chaque release est un fichier `releases/<version-ou-date>.md` contenant :

| Champ | Contenu |
|---|---|
| Version ou date | Identifiant de la release |
| Périmètre | Ce que couvre la mise en production |
| Sprint associé | Lien vers le dossier de sprint |
| Commit | Hash du commit déployé |
| Date de production | Date et heure de la mise en production |
| URL | URL du déploiement et URL publique |
| Changements livrés | Ce qui a réellement changé pour l'utilisateur |
| Limites connues | Dette assumée, écarts, points de vigilance |

Modèle : [templates/release.md](../templates/release.md).

## Index

| Version | Date | Sprint | Statut |
|---|---|---|---|
| _Aucune release enregistrée à ce jour._ | | | |
