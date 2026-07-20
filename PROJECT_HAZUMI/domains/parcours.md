# Parcours

> **Livré (WP 1.2)** — la page présente deux familles : **Parcours Hazumi** (badge « Officiel »,
> bordure pleine) et **Mes Playlists** (badge « Perso », bordure pointillée). Une playlist créée
> depuis la Bibliothèque y apparaît automatiquement.

## Un seul objet fonctionnel visible : le parcours

Hazumi n'expose **qu'un seul objet structurant** à l'utilisateur : le parcours. Il n'existe pas de
niveau intermédiaire (module, collection, playlist, dossier) ayant sa propre identité
fonctionnelle.

Ce choix découle du principe « le nombre de concepts visibles doit rester limité » : un judoka
n'a qu'un mot à apprendre pour comprendre comment Hazumi organise l'apprentissage.

## Deux origines, un même objet

L'entrée **Parcours** regroupe deux familles, présentées distinctement mais de même nature :

### Parcours Hazumi

Parcours conçus et publiés par Hazumi. Ils portent l'intention pédagogique de la plateforme :
progression construite, contenus validés, objectif explicite (préparation d'un grade, découverte
d'une famille technique, etc.).

Le judoka les suit ; il ne les modifie pas.

### Mes parcours

Parcours composés par le judoka lui-même. Ils reflètent son besoin propre : révisions ciblées,
sélection personnelle, préparation d'une échéance.

- ils sont **créés depuis la Bibliothèque**, par sélection de ressources ;
- ils **apparaissent dans le menu Parcours**, aux côtés des parcours Hazumi ;
- ils appartiennent au judoka qui les a créés.

## Couvertures des playlists

La couverture d'une playlist est **générée automatiquement** à partir de son contenu réel :
une ressource affiche sa vignette, deux les affichent côte à côte, trois ou plus produisent une
mosaïque de quatre cases. Rendu noir et blanc avec voile sombre.

**L'utilisateur ne choisit jamais de couverture.** Une playlist sans ressource affiche un état
« Playlist vide » explicite, jamais une icône générique.

## Règles

- Un parcours a un objectif pédagogique explicite.
- Un parcours donne un ordre aux ressources qu'il contient : cet ordre porte du sens.
- Une même ressource peut appartenir à plusieurs parcours, Hazumi comme personnels.
- La progression du judoka est suivie par parcours.
- Un parcours personnel se crée depuis la Bibliothèque, jamais depuis un formulaire vide : la
  sélection de contenus précède la création de l'objet.

## Documents liés

- [bibliotheque.md](bibliotheque.md) — création des parcours personnels
- [navigation.md](navigation.md)
