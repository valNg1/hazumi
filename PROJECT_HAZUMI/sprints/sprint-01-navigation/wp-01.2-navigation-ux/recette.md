# Cahier de recette — WP 1.2 · Navigation & Expérience utilisateur

- **Recetteur :** Product Owner — Sensei Hazumi
- **Date :** —

> Le Lead Full Stack n'a prérempli que l'environnement et les preuves de tests automatisés
> (règle B de `GOVERNANCE.md`). **La recette fonctionnelle n'est pas déclarée acceptée.**

## Environnement (prérempli)

| Élément | Valeur |
|---|---|
| URL | https://hazumi.org |
| Branche | `main` |
| Compte | Judoka |
| Formats | Desktop et mobile |

## Prérequis

- **Rafraîchissement forcé** (`Ctrl + Shift + R`) — la PWA peut servir l'ancienne version.
- Disposer d'au moins un parcours commencé pour SC-04.

## Preuves de tests automatisés (prérempli)

| Contrôle | Résultat |
|---|---|
| `npm run test` | **238 tests verts / 32 fichiers** |
| `npm run build` | **Vert** |
| Erreurs de lint ajoutées | **0** |

## SC-01 — Bibliothèque : découverte sans univers

| # | Étape | Résultat attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir Bibliothèque | Les ressources sont **immédiatement visibles** ; aucun choix d'univers demandé | | ⬜ |
| 2 | Observer la mise en page | Rayons horizontaux par famille technique, cartes défilantes | | ⬜ |
| 3 | Vérifier la présence des trois univers | Des contenus Kyu, Shiai et Judo-Kâ coexistent sans filtre | | ⬜ |
| 4 | Faire défiler un rayon | Défilement horizontal fluide | | ⬜ |
| 5 | Rechercher « harai » | Seules les ressources correspondantes restent | | ⬜ |
| 6 | Rechercher sans accent (« strategie ») | Trouve « Stratégie » | | ⬜ |
| 7 | Cliquer sur une ressource avec leçon | La leçon s'ouvre | | ⬜ |
| 8 | Cliquer sur une fiche sans leçon | La fiche s'ouvre en modale | | ⬜ |

## SC-02 — Création d'une playlist

| # | Étape | Résultat attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Cliquer « Créer une playlist » | Mode sélection activé ; compteur affiché | | ⬜ |
| 2 | Sélectionner plusieurs ressources dans différents rayons | Cases cochées, compteur à jour | | ⬜ |
| 3 | Cliquer « Continuer » | Modale de création | | ⬜ |
| 4 | Observer les choix d'univers | **Kyu / Shiai / Judo-Kâ** proposés — seul moment où l'univers intervient | | ⬜ |
| 5 | Nommer, choisir un univers, créer | Confirmation + lien vers Parcours | | ⬜ |
| 6 | Créer sans nom | Message d'erreur explicite | | ⬜ |

## SC-03 — Parcours : deux familles

| # | Étape | Résultat attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir Parcours | Deux sections : **Parcours Hazumi** et **Mes Playlists** | | ⬜ |
| 2 | Comparer visuellement | Officiel : badge rouge plein, bordure pleine. Perso : badge contour, bordure pointillée | | ⬜ |
| 3 | Vérifier la playlist créée en SC-02 | Elle **apparaît automatiquement** dans Mes Playlists | | ⬜ |
| 4 | Vérifier l'univers affiché | Celui choisi à la création | | ⬜ |
| 5 | Sans playlist | Invitation à en créer depuis la Bibliothèque | | ⬜ |

## SC-04 — Ma progression : tableau de bord

| # | Étape | Résultat attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir Ma progression | Section **« Reprendre où tu en étais »** en tête | | ⬜ |
| 2 | Vérifier le contenu | Parcours Hazumi **et** playlists commencés | | ⬜ |
| 3 | Vérifier l'ordre | Activité la plus récente en premier | | ⬜ |
| 4 | Vérifier les indicateurs | Pourcentage, barre, `done / total` | | ⬜ |
| 5 | Cliquer « Reprendre » | Ouvre directement le parcours ou la playlist | | ⬜ |
| 6 | Vérifier les terminés | Section distincte | | ⬜ |
| 7 | Vérifier le curriculum par ceinture | **Toujours présent** sous le tableau de bord | | ⬜ |

## SC-05 — Mon espace : navigation interne

| # | Étape | Résultat attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir Mes entraînements | Barre des cinq rubriques en haut | | ⬜ |
| 2 | Cliquer « Mon agenda » depuis cette page | Bascule **sans retour arrière** | | ⬜ |
| 3 | Enchaîner messages → profil → progression | Navigation directe à chaque fois | | ⬜ |
| 4 | Vérifier la rubrique active | Mise en évidence | | ⬜ |
| 5 | Sur mobile | Barre défilante horizontalement, lisible | | ⬜ |

## SC-06 — Non-régression

| # | Étape | Résultat attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Navigation principale | Toujours 4 entrées (WP 1.1) | | ⬜ |
| 2 | `/eleve/kyu`, `/eleve/shiai`, `/eleve/judoka-culture` | Toujours accessibles | | ⬜ |
| 3 | Ouvrir une leçon, un quiz, prendre des notes | Fonctionnels | | ⬜ |
| 4 | Compte administrateur | Comportement inchangé | | ⬜ |
| 5 | Console navigateur | Aucune erreur de navigation | | ⬜ |

## SC-07 — Points à confirmer

| # | Sujet | Question | Décision |
|---|---|---|---|
| 1 | Progression des playlists | Calculée par **tags** : une ressource ajoutée au catalogue avec un tag correspondant entre automatiquement dans la playlist. Acceptable ? | ⬜ |
| 2 | Curriculum par ceinture | Conservé sous le tableau de bord plutôt que supprimé. Acceptable ? | ⬜ |

**Légende :** ⬜ non exécuté · ✅ conforme · ❌ non conforme · ⚠️ réserve

## Décision finale du Product Owner

- **Statut :** En attente
- **Décision :** ⬜ Acceptée · ⬜ Acceptée avec réserves · ⬜ Refusée
- **Commentaire :** —
