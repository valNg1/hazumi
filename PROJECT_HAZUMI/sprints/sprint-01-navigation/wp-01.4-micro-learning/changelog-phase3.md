# Changelog — WP 1.4 · Finalisation fonctionnelle

- **Date :** 2026-07-20
- **Statut :** Livré — le flux parcours → clip est câblé, prêt à s'activer au seed.

## Intégration fonctionnelle (§1)

Le bouton « Comprendre cette technique » (Partie 4 — Les trois séries) mène
désormais à la séquence vidéo :

```
Les trois séries → technique → « Comprendre cette technique »
  → si un clip publié existe : ouverture de sa page (lecture immédiate du
    segment + fiche + points d'attention + erreurs + « ← Retour aux techniques »)
  → sinon (avant seed) : modale de décomposition, comme aujourd'hui
```

Le basculement est **automatique** : dès que le seed crée les clips, le bouton
les ouvre sans autre intervention. Aucune régression avant seed.

### Code

| Fichier | Rôle |
|---|---|
| `src/lib/techniqueClips.ts` | `clipForTechnique` — associe une technique à son clip par nom canonique, tolère les variantes |
| `src/pages/eleve/Lecon.tsx` | charge les clips publiés des techniques ; le bouton navigue vers le clip s'il existe ; rend les `asset_sections` (fiche / points d'attention / erreurs) d'un clip + retour simple |

## Vérification (§2) — mapping des neuf boutons

Confirmé : chaque bouton résout sa cible par **nom canonique** via
`clipForTechnique`. Les variantes premium (`Ippon-seoi-nage`) tombent sur le bon
clip (`Seoi-nage`). Tableau complet dans le rapport de livraison.

## Vérifications

| Contrôle | Résultat |
|---|---|
| Tests unitaires | **377 verts / 42 fichiers** (+6 : résolveur de clip + intégration parcours→clip) |
| Build | **Vert** |
| Lint | **0 erreur ajoutée** |
| Données de production | **0** clip — le seed reste à exécuter |

## Reste à faire (§4, après horodatages)

Renseigner les 9 bornes → `npx tsx scripts/seed-clips-nage-no-kata.ts` → recette
desktop + mobile. Le flux fonctionnel est déjà en place et testé.
