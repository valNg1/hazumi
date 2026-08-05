-- Comprendre les techniques — table `masterclass` (section éditoriale, distincte du moteur Leçon).
-- À exécuter UNE FOIS dans l'éditeur SQL Supabase (DDL non réalisable via la clé service).

create table if not exists public.masterclass (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  slug text not null unique,
  youtube_url text not null,
  contenu text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.masterclass enable row level security;

-- Lecture des masterclasses publiées par tout judoka authentifié.
drop policy if exists masterclass_select_published on public.masterclass;
create policy masterclass_select_published on public.masterclass
  for select to authenticated using (published = true);

-- Accès complet pour les admins (même motif que le reste de l'app).
drop policy if exists masterclass_admin_all on public.masterclass;
create policy masterclass_admin_all on public.masterclass
  for all to authenticated
  using (exists (select 1 from public.judokas j where j.user_id = auth.uid() and j.role = 'admin'))
  with check (exists (select 1 from public.judokas j where j.user_id = auth.uid() and j.role = 'admin'));

-- Entrée : « Reprise initiative quadrupédique » (contenu = lesson.md, commit eec5400).
insert into public.masterclass (titre, slug, youtube_url, contenu, published)
values (
  'Reprise initiative quadrupédique',
  'reprise-initiative-quadrupedique',
  'https://youtu.be/zgQidLmOXG8',
  $mc$# Metadata

- **Video title** : Projet Excellence Judo — Reprise initiative quadrupédique
- **URL** : https://youtu.be/zgQidLmOXG8
- **Duration** : 07:44 (464 s)
- **Speaker** : Frédéric Demontfaucon *(à confirmer — le nom n'est pas énoncé dans l'audio)*
- **Statut éditorial** : réécriture pédagogique à partir de `transcript.md`. Horodatages et titres de chapitres inchangés (clés de correspondance avec Hazumi).

> ⚠️ **Avertissement qualité source.** Le transcript source signale lui-même que la transcription automatique de cette séance est très bruitée : de nombreux termes techniques, noms et fragments de phrases y sont incertains. Cette réécriture conserve toutes les idées identifiables et l'ordre logique du transcript, sans rien résumer ni inventer sur le fond technique. Là où le sens exact d'un passage n'a pas pu être établi avec confiance, il reste signalé `[à vérifier]` plutôt que d'être lissé en une formulation assurée. **Recommandation : ce chapitre nécessite une relecture avec le visionnage de la vidéo en parallèle avant toute intégration dans Hazumi**, plus encore que pour les autres masterclasses.

---

# Video chapters

## 00:00 — Introduction — la position à quatre pattes

### Éléments identifiables

Ce chapitre d'introduction est le plus difficile à restituer du transcript source : la formulation d'origine est très fragmentée et son enchaînement logique n'est pas certain `[à vérifier — chapitre dans son ensemble]`.

Les éléments suivants semblent s'en dégager, sans garantie sur leur articulation exacte :

- Ne pas laisser une jambe sortir sur le côté en position à quatre pattes `[à vérifier]`.
- Une consigne de protection ou de repositionnement de la jambe arrière `[à vérifier — « perdre ta jambe derrière »]`.
- Dès que l'on sent le partenaire arriver dans le dos, reprendre la position `[à vérifier]`.
- Retour sur le dos, puis reprise d'une position faisant face au partenaire `[à vérifier — passage « sur les boules on face » non résolu]`.
- Prendre le contrôle de la tête du partenaire `[à vérifier]`.

---

## 00:36 — Sortir et se retourner

### Établir le contact

L'intervenant précise qu'il va démontrer lui-même le mouvement. Dès l'entrée en jeu, il installe du contact avec le partenaire — une accroche, mais qui nécessite un contact réel pour fonctionner. Rester statique dans une certaine position rend en réalité la tâche plus compliquée pour le partenaire `[à vérifier — le sens exact de cette remarque reste incertain]`. La consigne est donc de maintenir du contact sans pour autant trop fermer la position, tout en laissant le partenaire se déplacer.

### Sortir de la position

Pour sortir de cette position, il s'agit de se servir un peu de sa tête et de son dos afin de s'éloigner. L'intervenant prend une prise sur le partenaire et sort de la position `[à vérifier — terme technique non identifié avec certitude, transcrit de façon incohérente dans la source]`.

Une fois sorti, il ne faut pas attendre que le partenaire revienne complètement, car on peut sentir qu'il revient dans le dos `[à vérifier — la suite immédiate de cette phrase reste peu claire]`.

### Créer le déséquilibre en s'éloignant

En s'éloignant, l'intervenant évite de se redresser : il avance plutôt vers l'avant, dans l'axe, et cherche immédiatement à créer un déséquilibre. Il ne s'agit pas de faire une simple rotation pour se retrouver face au partenaire ; comme celui-ci est en partie sur lui, il l'entraîne avec lui dans le déséquilibre. Le partenaire est alors obligé de prendre des appuis — et tant qu'il cherche ses appuis, il ne peut pas attaquer immédiatement.

### La séquence complète

La séquence se répète : le partenaire « aspire » l'intervenant à chaque fois `[à vérifier — usage exact du terme]`, se positionne, se redresse, reste dans cette position, passe par-dessus les jambes de l'intervenant et va chercher la ceinture. Avant ce moment, une consigne est donnée : tirer plutôt vers soi, légèrement, puis monter par-dessus le partenaire pour rouler.

L'intervenant note qu'on pourrait aussi démarrer directement depuis cette position, en enchaînant sur le côté : s'éloigner, puis, une fois que le partenaire aspire, se redresser, prendre une prise, et rouler.

La séquence se conclut par un retour à la position de départ, avec la question de savoir si l'on revient ou non sur les genoux.

---

## 02:03 — Depuis la position à genoux

### Rechercher la position supérieure

Depuis la position à genoux, une erreur fréquente — notamment observée chez les plus jeunes pratiquants — est de chercher à faire tourner le partenaire. L'idée mise en avant ici est différente : il s'agit de gagner la position supérieure. L'intervenant amène donc le partenaire en position inférieure, et c'est de là que démarre le travail, avec établissement du contact.

### Une approche plus dynamique

La consigne évolue ensuite vers davantage de dynamisme, sans se précipiter immédiatement `[à vérifier — fin de phrase incertaine]`. L'idée est de na pas se mettre en avant pour pousser directement, mais plutôt d'essayer de glisser, ce qui demande moins de force.

### Glisser plutôt que forcer

Quand le partenaire prend appui — parce qu'il vient de pousser — l'intervenant peut alors glisser légèrement en position à quatre pattes ; la position descend, il se repositionne, et peut ensuite travailler une attaque. `[à vérifier — la fin de ce passage est fragmentaire dans la source et sa conclusion exacte n'a pas pu être reconstituée avec certitude : il est question du corps du partenaire qui doit « glisser », sans que la suite soit assurée]`.

---

## 03:06 — Pousser et déséquilibrer

### Consignes pendant l'exercice

Ce passage correspond à des consignes données en direct pendant que les judokas s'exercent : pousser de manière répétée, en particulier avec les fesses/le bassin, pour faire glisser le partenaire.

Si le glissement est difficile à obtenir, les épaules peuvent également être sollicitées pour ce travail `[à vérifier — le terme employé dans la source, proche de « ramer », reste incertain]`.

### Repositionner sa garde

L'intervenant insiste sur la nécessité de repositionner rapidement au moins sa garde en dessous, en évitant de se retrouver sous les bras du partenaire — sinon celui-ci continuera à le retourner. La consigne est donc d'alterner les essais.

### Deux issues possibles

Deux cas de figure sont illustrés : une version où l'action fonctionne — sortir puis reprendre une prise `[à vérifier]` — et une version explicitement présentée comme un essai qui ne fonctionne pas, pour illustrer la différence.

---

## 04:13 — Mise en application

### Revenir à la position et basculer

`[à vérifier — l'ouverture de ce chapitre est particulièrement fragmentaire dans la source et n'a pas pu être reconstituée avec certitude]`. L'idée générale semble être qu'il est toujours possible de revenir à une position donnée sans que ce soit problématique. L'intervenant revient par-dessus, pousse, puis bascule le partenaire de l'autre côté. En poussant de façon répétée, le partenaire finit par être légèrement écrasé, ce qui permet de passer de l'autre côté.

### Lien avec l'exercice précédent

Ce mouvement est présenté comme identique à ce qui a été travaillé précédemment dans la séance. Une consigne pédagogique est ajoutée : ne pas mettre trop d'opposition au départ, afin que les partenaires puissent d'abord comprendre le mouvement.

---

## 05:04 — De l'autre sens

### Travailler la version miroir

Ce chapitre reprend le même travail mais dans l'autre sens. Dans cette version, le partenaire roule le long d'un axe donné : le bras situé du côté de l'intervenant pousse avec les fesses/le bassin et change de côté, ce qui lui permet de récupérer le bras de l'intervenant `[à vérifier — la formulation exacte de cette phrase reste incertaine dans la source]`.

### Enchaînement et prise de position

L'intervenant explique qu'on peut essayer directement la version inversée pour amener une action désignée par un sigle non identifié avec certitude `[à vérifier — « la DCE »]`. Il peut repartir immédiatement, comme précédemment, mais dans l'autre sens. Une fois la position engagée, il peut se retrouver rapidement sur le waki `[à vérifier — prise/contrôle latéral]`, ou doit rapidement travailler pour raccrocher le partenaire, faire un renversement, puis remonter.

### La question du 50/50

L'intervenant choisit de ne pas montrer systématiquement la suite du mouvement, laissant les judokas chercher eux-mêmes comment éviter de se retrouver à égalité de position. Il explique qu'à un moment donné, la situation se retrouve nécessairement à 50/50 : dans ce cas, c'est celui qui se redresse en premier qui pourra placer son bras. Sur cette répétition, il choisit de travailler plutôt sur le bras qui s'engage à l'avant, en venant soit par-dessous, soit par-dessus.

---

## 06:52 — Renverser le partenaire

### Le renversement

L'intervenant renverse son partenaire, lance ses jambes et passe de l'autre côté, en poussant au moment voulu.

### Contrôle final

Une fois monté sur le partenaire — que ce soit au niveau du bras ou de la jambe — l'intervenant peut aussi choisir de coincer la jambe du partenaire pour faciliter le passage de ses propres jambes de l'autre côté. Il s'installe alors avec le bassin `[à vérifier — terme source peu clair]`, avant de remonter, prêt à poursuivre `[à vérifier — fin de chapitre fragmentaire]`.

---

## 07:37 — Synthèse

### Clôture de la séquence

Ce chapitre de synthèse se limite, dans le transcript source, à une consigne de lancement de l'exercice final (« Allez go ! »), sans contenu technique supplémentaire explicite.
$mc$,
  true
)
on conflict (slug) do update set
  titre = excluded.titre,
  youtube_url = excluded.youtube_url,
  contenu = excluded.contenu,
  published = excluded.published;
