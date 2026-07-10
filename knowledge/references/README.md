# Références — sources originales

Racine des **sources documentaires originales** exploitées par HAZUMI. Ce dossier ne contient **que** des œuvres tierces (fédérations, institutions, chercheurs). Aucune production HAZUMI ici.

- **Type de contenu** : REFERENCES — sources originales tierces (potentiellement protégées, à citer)
- **Univers** : `references`
- **`origin` attendu (métadonnées)** : `external`

## Métadonnées
Chaque document est accompagné d'un fichier de métadonnées `.json` conforme au [modèle racine](../../schema.json). Le champ `copyright` ne doit **jamais** être vide (valeur par défaut : `"à vérifier"`) ; les dates sont au format ISO 8601 (`AAAA-MM-JJ`).

## Conventions
- Noms de fichiers en `kebab-case`, sans accents (ex. `o-soto-gari.md`).
- Un fichier de contenu (`.md`, `.pdf`, média…) peut être associé à un `.json` de métadonnées du même nom.
- Ne jamais mélanger **sources originales** (`references/`) et **productions HAZUMI** (`kyu/`, `grades-dan/`, `judo-ka/`, `shiai/`).
