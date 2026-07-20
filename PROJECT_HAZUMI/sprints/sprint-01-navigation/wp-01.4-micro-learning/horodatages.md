# Horodatages des neuf séquences — Nage-no-kata

- **Vidéo source :** https://www.youtube.com/watch?v=bkhBZzE2HpM
- **Identifiant :** `bkhBZzE2HpM` — Kodokan
- **Durée totale :** 1765 s (29:25)
- **Relevé par :** Product Owner — Sensei Hazumi
- **Statut :** ⬜ à renseigner

> **Aucune borne n'est préremplie.** Un horodatage approximatif produirait un clip démarrant au
> milieu d'une technique ou s'arrêtant avant la chute — un défaut qu'aucun test automatisé ne
> détecte, mais que chaque judoka verra.

## Format accepté

`mm:ss` (par exemple `01:23`) ou un nombre de secondes (`83`). Les deux notations peuvent être
mélangées.

## Tableau à remplir

| # | Technique | Série | Début | Fin |
|---|---|---|---:|---:|
| 1 | Uki-otoshi | Te-waza | à renseigner | à renseigner |
| 2 | Seoi-nage | Te-waza | à renseigner | à renseigner |
| 3 | Kata-guruma | Te-waza | à renseigner | à renseigner |
| 4 | Uki-goshi | Koshi-waza | à renseigner | à renseigner |
| 5 | Harai-goshi | Koshi-waza | à renseigner | à renseigner |
| 6 | Tsuri-komi-goshi | Koshi-waza | à renseigner | à renseigner |
| 7 | Okuri-ashi-harai | Ashi-waza | à renseigner | à renseigner |
| 8 | Sasae-tsurikomi-ashi | Ashi-waza | à renseigner | à renseigner |
| 9 | Uchi-mata | Ashi-waza | à renseigner | à renseigner |

## Repères existants — les chapitres déjà en base

Ces bornes de **série** sont fiables : elles proviennent du chapitrage que vous aviez fourni.
Elles encadrent le relevé et le rendent plus rapide.

| Chapitre | Début | Ce qu'il contient |
|---|---:|---|
| Techniques de bras (Te-waza) | 01:20 | Techniques 1 à 3 |
| Techniques de hanche (Koshi-waza) | 03:13 | Techniques 4 à 6 |
| Techniques de jambe (Ashi-waza) | 04:21 | Techniques 7 à 9 |
| Sacrifices arrière (Ma-sutemi-waza) | 05:40 | *Hors périmètre 1er dan* |

La première série occupe donc `01:20 → 03:13`, soit **113 secondes pour trois techniques**. Il
suffit d'y placer deux coupures. Idem pour les deux séries suivantes.

> **À vérifier pendant le relevé :** la vidéo comporte aussi une partie « Analyse » à partir de
> 10:13, qui reprend chaque série au ralenti. Si ces passages analytiques sont pédagogiquement
> plus intéressants que la démonstration initiale, indiquez-le — les clips peuvent y être pris à
> la place, ou en complément.

## Contrôles appliqués au moment du seed

Le script refusera toute donnée incohérente :

- `fin > début` pour chaque technique ;
- bornes comprises entre 0 et 1765 s ;
- aucun chevauchement entre deux techniques ;
- les neuf lignes renseignées, sinon aucune n'est écrite.

## Une fois rempli

Prévenez-moi : le seed des neuf clips, leur rattachement aux leçons et la génération des cartes
typographiques suivent immédiatement.
