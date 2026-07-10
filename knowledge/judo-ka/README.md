# JUDO-KÂ — culture, histoire, philosophie

Univers **JUDO-KÂ** : culture, histoire et philosophie du judo. Productions et synthèses HAZUMI (les sources originales sont dans `references/`).

- **Type de contenu** : PRODUCTION HAZUMI — contenu original produit par HAZUMI
- **Univers** : `judo-ka`
- **`origin` attendu (métadonnées)** : `hazumi`

## Métadonnées
Chaque document est accompagné d'un fichier de métadonnées `.json` conforme au [modèle racine](../../schema.json). Le champ `copyright` ne doit **jamais** être vide (valeur par défaut : `"à vérifier"`) ; les dates sont au format ISO 8601 (`AAAA-MM-JJ`).

## Conventions
- Noms de fichiers en `kebab-case`, sans accents (ex. `o-soto-gari.md`).
- Un fichier de contenu (`.md`, `.pdf`, média…) peut être associé à un `.json` de métadonnées du même nom.
- Ne jamais mélanger **sources originales** (`references/`) et **productions HAZUMI** (`kyu/`, `grades-dan/`, `judo-ka/`, `shiai/`).
