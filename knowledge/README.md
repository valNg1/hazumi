# Bibliothèque documentaire HAZUMI (`knowledge/`)

Source documentaire de référence du projet **HAZUMI**, PWA de judo organisée autour de trois univers :

- **KYU** — progression technique et préparation aux grades (ceintures) ;
- **SHIAI** — vidéos et techniques de compétition ;
- **JUDO-KÂ** — culture, histoire et philosophie du judo.

Cette bibliothèque est **indépendante du catalogue Supabase** de l'application. Elle constitue le socle de connaissances qui servira à :

- alimenter les contenus HAZUMI ;
- générer les **quiz** ;
- construire les **parcours pédagogiques** ;
- alimenter un futur **moteur RAG** (Retrieval-Augmented Generation).

---

## Philosophie

Une **bibliothèque propre, versionnée et exploitable par des IA**. Chaque document est :

1. **rangé** dans un dossier thématique clair (univers → sous-thème) ;
2. **décrit** par des métadonnées structurées et normalisées (voir [`schema.json`](schema.json)) ;
3. **traçable** quant à sa provenance et à ses droits (champ `origin`, champ `copyright` jamais vide).

L'objectif est qu'un humain **comme** un pipeline automatisé puissent parcourir l'arborescence, comprendre la nature de chaque contenu, et l'exploiter sans ambiguïté.

---

## RÉFÉRENCES vs PRODUCTIONS HAZUMI — la distinction fondamentale

La règle la plus importante de cette bibliothèque :

| | `references/` | `kyu/`, `grades-dan/`, `judo-ka/`, `shiai/` |
|---|---|---|
| **Nature** | Sources **originales** tierces | **Productions** originales HAZUMI |
| **Exemples** | Progression FFJ, gokyo du Kodokan, SOR de l'IJF, articles scientifiques | Fiches, quiz, parcours, synthèses, examens blancs |
| **`origin`** | `official` ou `external` | `hazumi` |
| **Droits** | Potentiellement **protégés** → citer la source, renseigner `license`/`copyright` | Propriété HAZUMI |

- `references/` contient **uniquement** des œuvres tierces (potentiellement protégées). On n'y produit rien : on y dépose et on y cite des sources.
- Les univers `kyu/`, `grades-dan/`, `judo-ka/`, `shiai/` contiennent **uniquement** des productions HAZUMI dérivées de ces sources.
- **Ne jamais mélanger les deux.** Une synthèse HAZUMI d'un texte du Kodokan ne va **pas** dans `references/`, mais dans l'univers HAZUMI concerné.

### ⚠️ Attention aux dossiers homonymes `kodokan/`

Deux dossiers portent le nom `kodokan/` et ne doivent **jamais** être confondus :

- [`references/kodokan/`](references/kodokan/) — **sources et textes originaux du Kodokan** (œuvres tierces : gokyo, nage-no-kata, publications historiques). `origin: external`.
- [`judo-ka/kodokan/`](judo-ka/kodokan/) — **synthèses et productions HAZUMI *sur* le Kodokan** (l'institution, son histoire, son rôle), rédigées par HAZUMI à partir des sources. `origin: hazumi`.

Règle mnémotechnique : **`references/kodokan/` = ce que le Kodokan a produit ; `judo-ka/kodokan/` = ce que HAZUMI écrit à propos du Kodokan.**

---

## Organisation des dossiers

```
knowledge/
├── references/            # SOURCES ORIGINALES tierces (ne rien produire ici)
│   ├── ffj/               # Fédération Française de Judo (progression, grades, règlements)
│   ├── kodokan/           # Kodokan — textes/classifications originaux
│   ├── ijf/               # International Judo Federation (règlement, SOR)
│   └── scientifiques/     # Articles & publications scientifiques
├── kyu/                   # PRODUCTIONS HAZUMI — progression ceintures
│   ├── ceintures/         # Fiches par ceinture (blanche → marron)
│   ├── progression-francaise/  # Synthèses de la progression officielle
│   ├── techniques/        # Fiches techniques pédagogiques
│   ├── quiz/              # Banques de questions / quiz
│   └── katas/            # Katas niveau kyu
├── grades-dan/            # PRODUCTIONS HAZUMI — préparation Dan
│   ├── 1er-dan/ … 5eme-dan/
│   └── uv/               # Unités de Valeur
├── judo-ka/               # PRODUCTIONS HAZUMI — culture / histoire / philosophie
│   ├── histoire/
│   ├── kodokan/          # Synthèses HAZUMI *sur* le Kodokan (≠ references/kodokan)
│   ├── jigoro-kano/
│   ├── etiquette/
│   ├── vocabulaire/
│   └── culture/
├── shiai/                 # PRODUCTIONS HAZUMI — compétition
│   ├── techniques/
│   ├── tactique/
│   ├── kumikata/
│   ├── preparation/
│   └── champions/
├── media/                 # Actifs binaires (images, vidéos, PDF) référencés par les docs
├── metadata/              # Métadonnées transverses / exports d'indexation
├── schema.json            # JSON Schema du modèle de métadonnées par document
├── index.json             # Index global des documents (tableau, vide au départ)
└── README.md              # Ce fichier
```

Chaque dossier possède son propre `README.md` précisant son contenu attendu, son univers et l'`origin` attendu de ses métadonnées.

---

## Métadonnées

Le modèle de métadonnées **par document** est défini formellement dans [`schema.json`](schema.json). Modèle de référence :

```json
{
  "id": "",
  "title": "",
  "category": "",
  "subcategory": "",
  "grade": "",
  "kata": "",
  "difficulty": "",
  "audience": "",
  "source": "",
  "origin": "official|hazumi|external",
  "author": "",
  "language": "",
  "license": "",
  "copyright": "à vérifier",
  "status": "draft",
  "version": "1.0",
  "tags": [],
  "created": "",
  "updated": "",
  "url": "",
  "files": []
}
```

Règles clés :

- **Dates** au format **ISO 8601** (`AAAA-MM-JJ`) pour `created` et `updated`.
- **`copyright` n'est jamais vide** : par défaut `"à vérifier"` tant que le statut des droits n'est pas confirmé.
- **`origin`** : `official` (institution), `external` (œuvre tierce), `hazumi` (production HAZUMI).
- **`status`** démarre à `draft`, **`version`** à `1.0`.
- Un document est en général un fichier de contenu (`.md`, `.pdf`, média) **plus** un fichier `.json` de métadonnées portant le même nom.

---

## Futur moteur RAG — comment il exploitera cette bibliothèque

Le pipeline d'indexation RAG parcourra `knowledge/` de façon déterministe :

1. **Découverte** — parcours récursif de l'arborescence ; chaque document est identifié par son fichier de contenu et son `.json` de métadonnées associé (ou une entrée de [`index.json`](index.json)).
2. **Validation** — chaque bloc de métadonnées est validé contre [`schema.json`](schema.json). Un document invalide (ex. `copyright` vide, `origin` absent, date non ISO) est écarté ou signalé.
3. **Filtrage des droits** — le champ `origin` sépare les **sources tierces** (`references/`, `origin: official|external`) des **productions HAZUMI** (`origin: hazumi`). Le pipeline peut ainsi restreindre l'usage génératif aux contenus dont les droits le permettent, et traiter les sources tierces en **citation/référence** plutôt qu'en reproduction.
4. **Segmentation & enrichissement** — le contenu est découpé en passages ; les métadonnées (`category`, `subcategory`, `grade`, `kata`, `tags`, `audience`, `difficulty`) enrichissent chaque passage pour un filtrage fin à la recherche.
5. **Indexation vectorielle** — les passages sont embeddés et stockés ; les métadonnées servent de filtres (par univers, grade, difficulté…) et de source de **citations vérifiables**.
6. **Mise à jour incrémentale** — `updated` et `version` permettent de ré-indexer seulement ce qui a changé ; [`index.json`](index.json) et le dossier [`metadata/`](metadata/) hébergent les états d'indexation transverses.

Cette structure garantit qu'à tout moment le moteur RAG sait **d'où vient** une information, **quels droits** y sont attachés, et **à quel univers pédagogique** elle appartient.

---

## Conventions

- Noms de fichiers en `kebab-case`, sans accents (ex. `o-soto-gari.md`, `nage-no-kata.json`).
- Le français est la langue par défaut des productions HAZUMI ; les sources gardent leur langue d'origine (`language`).
- Les actifs binaires vont dans [`media/`](media/) et sont référencés par le champ `files`/`url` des métadonnées.
- `status: draft` par défaut ; passer à `review` puis `published` une fois validé.
