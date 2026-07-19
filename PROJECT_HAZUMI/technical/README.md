# Documentation technique

Documentation de l'existant technique, établie par analyse du dépôt.

## Principe

Cette documentation décrit **ce qui est vérifiable dans le dépôt**. Toute information non
vérifiable est marquée **« À documenter »** plutôt que supposée.

Elle n'est pas un guide de conception : les choix produit relèvent de [vision/](../vision/) et
[domains/](../domains/), les décisions structurantes de [decisions/](../decisions/).

## Contenu

| Document | Objet |
|---|---|
| [architecture.md](architecture.md) | Architecture générale, frontend, backend, base de données, flux |
| [environments.md](environments.md) | Environnements et variables attendues |
| [deployment.md](deployment.md) | Build, tests, déploiement, rollback |

## Règle sur les secrets

Aucun secret, token, mot de passe, clé API ou donnée personnelle ne doit figurer dans ces
documents. Les variables sont citées **par leur nom uniquement**, jamais par leur valeur.
