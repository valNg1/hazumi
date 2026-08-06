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

-- Entrée : « Continuité en ne-waza » (contenu = lesson.md fourni, upsert data-only).
insert into public.masterclass (titre, slug, youtube_url, contenu, published)
values (
  'Continuité en ne-waza — Projet Excellence Judo',
  'continuite-ne-waza',
  'https://www.youtube.com/watch?v=nPjfLtNaCVM',
  $mc$## 00:00 — Introduction — garder l'initiative au sol

### Conserver le contact dès la transition

La continuité debout-sol commence dès que le partenaire perd son équilibre.

Il est essentiel de sentir immédiatement sa direction de déplacement afin de conserver l'initiative.

Attendre que le partenaire se stabilise lui laisse le temps de reconstruire sa défense.

### Passer rapidement en contrôle

Dès que le partenaire bascule, la jambe vient se placer rapidement au-dessus de lui afin d'accompagner sa rotation.

Le coude se positionne immédiatement dans son dos pour limiter sa mobilité.

Le contrôle est assuré par la poitrine qui maintient une pression constante et empêche le partenaire de s'échapper.

### Construire une pression permanente

Le contrôle ne repose pas uniquement sur les bras.

Le ventre pousse continuellement vers le sol tandis que les orteils restent actifs afin de conserver une base solide.

La main vient ensuite se placer loin derrière la nuque pour accentuer la flexion du partenaire et limiter davantage ses possibilités de mouvement.

> **À retenir**
>
> En liaison debout-sol, la priorité n'est pas la technique finale mais la conservation immédiate du contrôle.

---

## 01:01 — Contrôle et changement de contrôle

### Utiliser la direction de la défense

Le partenaire cherche naturellement à s'échapper dans la direction où il exerce sa force.

Cette énergie devient un repère permettant d'adapter le contrôle.

Plutôt que de lutter contre cette poussée, le judoka l'utilise pour améliorer son positionnement.

### Changer de contrôle sans perdre la pression

Pendant la transition, la poitrine conserve en permanence le contrôle du partenaire.

Le genou descend progressivement afin de remplacer l'action des bras sans créer d'espace.

Une fois cette stabilité obtenue, la main libérée peut changer de fonction et préparer la suite de la technique.

### Garder le coude dans le dos

Le coude reste constamment placé dans le dos du partenaire.

Ce point de contrôle limite fortement sa capacité à se retourner ou à reconstruire une position défensive.

À ce stade, l'objectif n'est pas encore de rechercher une immobilisation ou une clé, mais simplement de conserver une domination permanente.

> **À retenir**
>
> Chaque changement de prise doit s'effectuer sans jamais interrompre la pression exercée sur le partenaire.

---

## 02:00 — Descendre en maintenant le poids

### Descendre sans perdre le contrôle

Lorsque le corps descend vers une nouvelle position, la pression exercée sur le partenaire ne doit jamais disparaître.

Relâcher momentanément cette pression suffit souvent à lui permettre de reprendre l'initiative.

La descente s'effectue donc tout en maintenant le poids vers l'arrière.

### Utiliser la poitrine comme point d'appui

La poitrine devient le principal point de contrôle.

Elle remplace progressivement certaines actions des bras et stabilise durablement la position.

Cette répartition du poids laisse ensuite les mains disponibles pour préparer la technique suivante.

### La tête dirige le contrôle

Une fois le partenaire stabilisé, l'action sur la tête devient déterminante.

En ramenant la tête dans une position de flexion, l'ensemble du corps du partenaire suit naturellement ce mouvement.

Le contrôle devient alors beaucoup plus efficace avec un effort limité.

### Une opposition permanente

Le principe général reste identique à celui du travail debout : conserver une opposition constante.

Une pression continue empêche le partenaire de se redresser et crée les réactions nécessaires pour préparer les enchaînements.

> **À retenir**
>
> Le contrôle vient principalement du poids du corps et de la direction de la pression, beaucoup plus que de la force des bras.

---

## 04:19 — Utiliser l'opposition

### Exploiter la réaction du partenaire

Lorsque le judoka commence à attaquer le bras, le partenaire cherche naturellement à défendre.

Cette réaction constitue précisément l'information recherchée.

Au lieu de lutter contre cette défense, il est préférable de l'accompagner afin de préparer une nouvelle opportunité.

### Accompagner la saisie

Lorsque le partenaire vient protéger sa ceinture, la main ne reste pas immobile.

Elle accompagne ce mouvement tout en conservant la pression grâce à l'épaule, à la poitrine et à l'ensemble du corps.

Le contrôle reste continu malgré l'évolution de la défense.

### Anticiper la suite

Chaque défense ouvre une nouvelle possibilité.

La préparation consiste donc à rester attentif aux réactions du partenaire plutôt qu'à poursuivre obstinément la première technique envisagée.

> **À retenir**
>
> En Ne-Waza, une défense efficace du partenaire n'est pas un échec : elle constitue souvent le point de départ de l'enchaînement suivant.

## 05:21 — De l'autre côté

### Exploiter les limites de la défense

Lorsque le partenaire garde son bras bloqué contre son corps, ses possibilités de déplacement restent limitées.

Cette contrainte facilite le maintien du contrôle et permet de préparer l'attaque suivante sans précipitation.

À l'inverse, si le partenaire libère son bras vers l'avant, d'autres opportunités techniques apparaissent immédiatement.

### Contrôler le judogi

Le contrôle s'effectue en recherchant une prise stable sur le judogi.

La prise n'a pas pour objectif de tirer fortement mais de maintenir une connexion permanente avec le partenaire.

Elle permet d'accompagner chacun de ses déplacements tout en conservant une position dominante.

### Créer de l'espace autour de la tête

Le placement des jambes joue un rôle essentiel.

En rapprochant légèrement le genou, la tête du partenaire est progressivement écartée.

Cette ouverture prépare naturellement l'installation de l'étranglement.

Le mouvement rappelle certaines préparations de triangle, sans pour autant chercher à verrouiller cette technique.

### Préparer l'étranglement

Une fois l'espace créé, le pouce vient se placer profondément dans le col.

Le poids du corps est transféré progressivement sur ce contrôle.

La tête reste orientée vers les jambes du partenaire afin d'améliorer l'alignement et la qualité de la pression.

> **À retenir**
>
> Avant de chercher l'étranglement, il faut d'abord créer l'espace nécessaire autour de la tête du partenaire.

---

## 06:16 — Contrôle de la tête / relâcher

### Descendre le coude

Après la mise en place du col, le mouvement se poursuit par une descente progressive du coude vers le sol.

Cette action renforce le contrôle sans nécessiter de force supplémentaire.

Le poids du corps remplace progressivement l'action musculaire.

### Utiliser le poids du corps

Lorsque le placement est correct, les genoux peuvent même se décoller légèrement du tapis.

Le contrôle repose alors principalement sur le transfert du poids dans le col plutôt que sur une contraction des bras.

Cette utilisation de la gravité augmente considérablement l'efficacité de l'étranglement.

### Construire l'enchaînement

Toute la séquence suit une logique continue :

- créer une opposition ;
- accompagner la réaction du partenaire ;
- installer le coude dans le dos ;
- contrôler le judogi ;
- préparer l'attaque du bras ;
- exploiter la défense pour installer l'étranglement.

Chaque étape prépare naturellement la suivante.

### Transformer la défense en ouverture

Lorsque le partenaire refuse de laisser son bras disponible, il ouvre involontairement l'accès au col.

L'étranglement ne constitue donc pas une technique indépendante, mais la conséquence logique de sa défense.

> **À retenir**
>
> Plus la défense du partenaire est prévisible, plus les enchaînements deviennent faciles à construire.

---

## 07:53 — Le passage

### Installer immédiatement le contrôle

Après le renversement, le contrôle doit être mis en place sans délai.

Le partenaire ne doit jamais disposer d'un instant pour reconstruire sa posture.

Chaque seconde gagnée facilite la suite des enchaînements.

### Adapter la technique à la réaction adverse

Lorsque le judoka cherche à installer un triangle, le partenaire tente naturellement de dégager son bras et de rapprocher ses jambes.

Cette réaction est attendue.

Plutôt que d'insister sur le triangle, le judoka adapte immédiatement son contrôle afin de conserver sa domination.

### Préserver la continuité

L'objectif n'est pas d'imposer une technique unique.

Chaque tentative sert à provoquer une réaction qui ouvrira la technique suivante.

La continuité du Ne-Waza repose précisément sur cette capacité d'adaptation permanente.

> **À retenir**
>
> En Ne-Waza, il ne s'agit pas d'enchaîner des techniques par hasard, mais d'utiliser chaque défense pour construire l'attaque suivante.

## 08:55 — Puissance et position

### Maintenir la pression avant de changer de technique

Lorsque le partenaire défend efficacement, il est inutile de forcer la technique initiale.

La priorité reste de conserver le contrôle tout en observant l'évolution de sa défense.

Le partenaire finit souvent par créer lui-même une nouvelle ouverture.

### Adapter la réponse à la qualité de la défense

Si le bras est ramené très près du corps, certaines techniques deviennent peu rentables.

Il est alors préférable de poursuivre le contrôle et d'orienter l'enchaînement vers une autre solution plutôt que de dépenser inutilement de l'énergie.

Le choix de la technique dépend toujours de la position réelle du partenaire, jamais d'un schéma préétabli.

### Exploiter les erreurs

Lorsque le partenaire place sa main sur le côté plutôt que devant lui, il affaiblit son propre contrôle.

Cette légère erreur suffit parfois à ouvrir une nouvelle possibilité d'attaque.

Le judoka doit apprendre à reconnaître immédiatement ces situations afin d'en profiter sans délai.

### Construire progressivement la soumission

L'objectif n'est pas de chercher immédiatement la finition.

Chaque contrôle améliore la position jusqu'à rendre la technique finale presque inévitable.

Cette progression permet de limiter les efforts tout en augmentant les chances de réussite.

> **À retenir**
>
> En Ne-Waza, la meilleure technique est souvent celle que la défense du partenaire vous invite à utiliser.

---

## 10:54 — Passer en dessous

### Changer de contrôle

Lorsque l'ouverture apparaît, le contrôle évolue naturellement.

Le bras passe au-dessus afin de libérer l'accès à l'autre côté du partenaire.

Le changement de prise s'effectue sans relâcher la pression exercée jusque-là.

### Refermer la chaîne de contrôle

La main qui assurait le premier contrôle vient rejoindre l'autre afin de reformer une structure solide.

Les deux mains travaillent alors ensemble.

Cette connexion permet de transmettre efficacement la pression jusqu'à la technique finale.

### Préserver la continuité

Le changement de contrôle n'interrompt jamais l'action.

Il constitue simplement une nouvelle étape dans la continuité du travail au sol.

L'ensemble de la séquence reste guidé par la même logique : conserver l'initiative, accompagner les réactions du partenaire et adapter le contrôle jusqu'à obtenir une position décisive.

---

# Synthèse de la masterclass

## Les principes fondamentaux

Cette masterclass illustre plusieurs principes essentiels de la continuité en Ne-Waza :

- conserver l'initiative dès la transition debout-sol ;
- maintenir une pression permanente avec le poids du corps ;
- utiliser la poitrine, les hanches et les jambes autant que les bras ;
- guider le partenaire par la direction de sa tête ;
- exploiter chaque réaction défensive pour construire l'enchaînement suivant ;
- privilégier le placement avant la force.

---

## Les erreurs les plus fréquentes

Les difficultés rencontrées proviennent souvent de quelques erreurs récurrentes :

- relâcher la pression pendant un changement de contrôle ;
- chercher immédiatement la soumission sans stabiliser la position ;
- utiliser principalement la force des bras ;
- laisser le partenaire reconstruire sa posture entre deux actions ;
- insister sur une technique alors que la défense ouvre une meilleure opportunité.

---

## Les points d'attention

Pour conserver la continuité au sol, il est essentiel de :

- garder un contact permanent avec le partenaire ;
- transférer progressivement le poids du corps au lieu de tirer avec les bras ;
- contrôler la tête avant de rechercher la finition ;
- accompagner les réactions plutôt que les combattre ;
- conserver une logique d'enchaînement jusqu'à la soumission ou l'immobilisation.

---

## Les idées clés à retenir

Avant chaque enchaînement, posez-vous les questions suivantes :

- Ai-je conservé la pression depuis la transition debout-sol ?
- Mon partenaire peut-il encore reconstruire sa posture ?
- Est-ce que j'utilise sa défense pour préparer la suite ?
- Mon poids du corps travaille-t-il davantage que mes bras ?
- Suis-je en train de forcer une technique ou de suivre la réaction qu'il me propose ?

---

## Message du professeur

La continuité en Ne-Waza ne consiste pas à mémoriser une succession de techniques.

Elle consiste à conserver l'initiative en permanence.

Chaque réaction du partenaire devient une information qui permet d'adapter le contrôle et de construire naturellement l'action suivante.

Plus la transition est fluide et la pression continue, moins le partenaire dispose d'occasions de reprendre l'avantage.
$mc$,
  true
)
on conflict (slug) do update set
  titre = excluded.titre,
  youtube_url = excluded.youtube_url,
  contenu = excluded.contenu,
  published = excluded.published;
