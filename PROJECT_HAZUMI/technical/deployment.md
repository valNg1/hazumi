# Build, tests et déploiement

Procédures vérifiées dans le dépôt au 2026-07-19.

## Commandes disponibles

Extraites de `package.json` — aucune commande inventée.

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | `tsc -b` puis `vite build` — le typage bloque le build |
| `npm run preview` | Prévisualisation du build de production |
| `npm run lint` | ESLint |
| `npm run test` | Vitest, exécution unique |
| `npm run test:watch` | Vitest en mode surveillance |
| `npm run test:e2e` | Playwright |
| `npm run test:e2e:ui` | Playwright, interface graphique |
| `npm run test:e2e:debug` | Playwright, mode debug |
| `npm run test:rls` | Vérification de l'isolation RLS |

## Processus de build

```
npm run build
```

`tsc -b` s'exécute avant `vite build` : **une erreur de typage empêche la production d'un
bundle**. Le build génère également le service worker PWA.

Un avertissement connu apparaît : certains chunks dépassent 500 ko après minification. Il ne
bloque pas le build.

## Tests

Ordre attendu avant toute livraison :

```
npm run test     # unitaires et composants — doivent être verts
npm run build    # doit passer sans erreur
```

**Référence au 2026-07-19 :** 27 fichiers de test, 187 tests, tous verts.

### Règles de test du projet

Reprises de `CLAUDE.md` :

- tests écrits **avant** le code (TDD) ;
- cas nominaux, cas limites, cas d'erreur ;
- non-régression avant tout ajout sur l'existant ;
- aucun code cassé ne part en production.

### Intégration continue

Aucun workflow GitHub Actions n'est présent. **Les tests ne sont pas exécutés automatiquement à
la création d'une Pull Request ni avant un déploiement** : la vérification est manuelle.

## Migrations de base de données

```
npx supabase db push
```

Applique les migrations non encore appliquées au projet lié.

Règles observées dans le dépôt :

- migrations **additives** de préférence (`add column if not exists`, `create index if not
  exists`) ;
- un fichier horodaté par migration dans `supabase/migrations/` ;
- une migration appliquée n'est pas modifiée après coup.

> Une migration destructive (suppression de colonne ou de table) relève d'une décision produit et
> exige une validation explicite du Product Owner.

## Déploiement

```
npx vercel --prod
```

Déploiement direct en production sur le projet `hazumi1/hazumi`, domaine `hazumi.org`.
`vercel.json` réécrit toutes les routes vers `index.html` (routage SPA).

> ⚠️ Le [workflow](../WORKFLOW.md) impose une validation explicite de la recette par le Product
> Owner **avant** tout déploiement en production. La disponibilité technique de la commande ne
> vaut pas autorisation.

## Confirmation de la mise en production

Après déploiement, vérifier et consigner :

```
npx vercel ls --prod
```

Éléments à reporter dans le changelog du sprint :

| Élément | Source |
|---|---|
| Hash du commit déployé | `git rev-parse HEAD` |
| URL du déploiement | sortie de `vercel ls --prod` |
| Statut | doit être `Ready` |
| Date et heure | sortie de `vercel ls --prod` |
| URL publique | `https://hazumi.org` |

## Rollback

Vercel conserve l'historique des déploiements de production, ce qui rend techniquement possible
la promotion d'un déploiement antérieur.

**La procédure de rollback n'est ni documentée ni testée dans le dépôt : À documenter.**

Points à préciser :

- commande ou manipulation exacte pour restaurer un déploiement précédent ;
- traitement du cas où une migration de base de données accompagne la version fautive — un
  rollback applicatif **ne défait pas** une migration déjà appliquée ;
- délai de propagation et effet du cache du service worker PWA sur les clients déjà installés.

## À documenter

- Procédure de rollback applicatif.
- Procédure de retour arrière sur une migration de base de données.
- Mise en place d'une intégration continue exécutant les tests avant merge.
- Comportement attendu du service worker lors d'un changement de version.
