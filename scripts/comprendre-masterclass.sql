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

-- Entrée : « Liaison debout-sol : l’opportunité de face » (contenu = lesson.md fourni, upsert data-only).
insert into public.masterclass (titre, slug, youtube_url, contenu, published)
values (
  'Liaison debout-sol : l’opportunité de face — Projet Excellence Judo',
  'liaison-debout-sol-face',
  'https://www.youtube.com/watch?v=dWh1LB-mSMI',
  $mc$## 00:00 — Introduction — l'opportunité offerte de face

### Objectif de la séquence

Cette situation apparaît lorsque l'adversaire s'engage fortement vers l'avant. L'objectif n'est pas de provoquer artificiellement la chute, mais d'utiliser son engagement pour créer une opportunité de liaison debout-sol.

La réussite dépend avant tout de la qualité de la distance et du timing.

### Utiliser l'engagement de l'adversaire

Le partenaire doit être amené à poursuivre naturellement son attaque.

L'objectif n'est pas de le tirer vers le sol avec la force des bras, mais de le laisser avancer suffisamment pour que son propre engagement crée une perte d'équilibre exploitable.

Lorsque l'adversaire cherche réellement à faire tomber, son centre de gravité avance. C'est précisément ce moment qui crée l'opportunité.

À l'inverse, si son attaque est réalisée sans véritable intention ou sans engagement du corps, cette situation ne se présente généralement pas.

> **À retenir**
>
> Ce n'est pas l'action de tirer qui crée l'ouverture, mais l'engagement réel de l'adversaire.

---

## 01:06 — Se déplacer et s'accrocher

### Rester en mouvement

Après l'esquive, il est essentiel de conserver le déplacement.

Tant que le partenaire cherche à retrouver son équilibre, il reste vulnérable. C'est pourquoi il ne faut pas se précipiter immédiatement au sol.

L'objectif est de prolonger son déséquilibre en restant accroché à lui tout en continuant à se déplacer.

### Ne pas se jeter sur le partenaire

Une erreur fréquente consiste à vouloir sauter immédiatement sur le partenaire.

Cette réaction compacte le mouvement et facilite son rééquilibrage.

Au contraire, il faut utiliser le déplacement pour maintenir l'instabilité.

Le partenaire est alors obligé de rechercher de nouveaux appuis, ce qui ouvre progressivement les possibilités de contrôle.

### Première option de contrôle

Lorsque la distance est correcte, plusieurs contrôles deviennent possibles.

Le premier consiste à :

- contrôler bras et ceinture ;
- engager immédiatement le pied intérieur ;
- faire basculer le partenaire par-dessus sa tête.

Une autre possibilité consiste à engager directement les deux jambes sous le partenaire afin de provoquer son renversement.

### Replacer son centre de gravité

Pendant toute la séquence, il est essentiel de rester dans l'axe du partenaire.

Une fois celui-ci monté, il ne faut pas continuer à avancer avec le buste.

Au contraire, il faut :

- replacer son propre corps ;
- abaisser son centre de gravité ;
- ramener progressivement le partenaire au tapis tout en conservant le contrôle.

### Finaliser le contrôle

Deux solutions principales sont proposées :

- passer la main lorsque l'on reste à genoux ;
- ou s'allonger pour renforcer le contrôle.

La jambe peut venir se fléchir vers les hanches afin d'empêcher le partenaire de revenir.

Le contrôle est assuré par deux éléments essentiels :

- le bras qui contrôle la ceinture ;
- le coude qui ramène constamment la tête du partenaire vers soi pendant que la poitrine avance.

> **À retenir**
>
> Tant que le partenaire cherche à retrouver ses appuis, il reste en situation de déséquilibre. Il faut exploiter cette phase plutôt que chercher immédiatement l'immobilisation.

---

## 03:42 — Mise en application

### Conserver la traction

Durant toute la mise en place du contrôle, la traction ne doit jamais disparaître.

Même si la main n'est pas encore positionnée à la ceinture, le déplacement continue et entretient le déséquilibre du partenaire.

Cette traction permanente facilite ensuite l'engagement du bras à l'intérieur.

### Adapter la technique à la réaction adverse

Le partenaire ne réagira jamais exactement de la même manière.

Selon sa réaction, plusieurs options deviennent possibles :

- passer directement dessous ;
- tourner immédiatement ;
- relâcher momentanément le contrôle ;
- guider la tête ;
- utiliser les nouveaux appuis qui apparaissent.

La technique ne doit donc pas être exécutée comme une succession de gestes figés.

Elle s'adapte en permanence aux réactions de l'adversaire.

---

## 04:32 — Selon la réaction du partenaire

### Choisir la bonne direction

La direction donnée au partenaire conditionne directement la technique qui pourra suivre.

Chaque déplacement prépare une attaque différente.

Avant d'agir, il faut toujours savoir ce que l'on cherche à obtenir :

- contrôler un bras ;
- contrôler la tête ;
- préparer une clé ;
- ou provoquer un renversement.

### Créer des réactions

Le but n'est jamais de pousser le partenaire sans intention.

Chaque déplacement doit l'obliger à rechercher un nouvel appui.

C'est cette réaction qui crée l'ouverture recherchée.

Lorsque le partenaire place un appui pour éviter la chute, il révèle naturellement le contrôle qui devient disponible.

### Préparer l'attaque suivante

La réflexion ne porte pas uniquement sur le mouvement immédiat.

Chaque déplacement prépare déjà l'action suivante.

La technique consiste donc moins à appliquer une forme qu'à comprendre quelles réactions sont provoquées chez le partenaire et comment les exploiter immédiatement.

> **À retenir**
>
> Ce n'est pas la technique qui crée l'ouverture.
>
> C'est la réaction du partenaire qui indique quelle technique devient possible.

## 06:10 — Attaquer le bras (clé)

### Exploiter l'ouverture

Lorsque le passage devant le bras n'est plus possible, une seconde solution consiste à passer sous le bras du partenaire.

L'objectif reste identique : conserver le contrôle tout en créant un angle favorable pour isoler son bras.

Le déplacement ne s'arrête jamais pendant cette transition.

### Construire progressivement le contrôle

Le passage sous le bras permet de remonter progressivement jusqu'au coude.

Cette remontée doit rester fluide.

Une fois le contrôle obtenu, le déplacement du corps accompagne naturellement le renversement du partenaire.

Le contrôle ne provient pas uniquement des bras. Il résulte de l'ensemble du positionnement du corps.

### Contrôler l'axe du partenaire

Même lorsque le bras est isolé, il ne faut pas avancer excessivement.

Le contrôle reste centré sur l'axe du partenaire.

Une avancée trop importante ferait perdre la stabilité et réduirait l'efficacité de la clé.

> **À retenir**
>
> Le contrôle du bras n'est efficace que s'il est accompagné d'un contrôle permanent de l'axe du corps.

---

## 06:59 — Contrôle

### Adapter la prise à la morphologie

Le contrôle présenté précédemment avec la main à la ceinture n'est pas une obligation.

Selon son propre gabarit ou celui du partenaire, il peut être préférable de raccourcir la prise.

L'objectif reste toujours le même : permettre au coude d'appuyer efficacement sur la tête afin de maintenir son orientation.

### Les deux possibilités principales

Deux contrôles sont proposés :

- contrôler la ceinture lorsque la position le permet ;
- contrôler directement l'omoplate lorsque l'accès à la tête devient difficile.

Dans les deux cas, il n'est pas nécessaire de chercher une prise très profonde.

Un simple point d'appui stable suffit à construire le contrôle.

### Donner une direction à la tête

Le rôle du bras n'est pas de tirer fortement.

Il sert avant tout à orienter la tête du partenaire.

Cette orientation prépare naturellement la suite du mouvement et facilite le renversement.

> **À retenir**
>
> La qualité du contrôle dépend davantage de l'orientation de la tête que de la force exercée avec les bras.

---

## 07:41 — Se servir de la main

### Comprimer plutôt que tirer

La main complète le travail du coude.

Son rôle consiste à accompagner le mouvement de la tête vers l'intérieur et non à projeter le partenaire vers l'avant.

La sensation recherchée est celle d'une compression progressive.

### Aspirer le partenaire

Le mouvement suivant consiste à attirer le partenaire vers soi.

Le contrôle s'effectue en guidant son épaule jusqu'à proximité de la hanche.

Ce déplacement crée naturellement l'espace nécessaire pour récupérer la main et poursuivre le contrôle.

### Exploiter le relâchement

L'action alterne constamment deux phases :

- une mise en pression ;
- un léger relâchement permettant d'utiliser la réaction du partenaire.

Cette alternance rend le mouvement beaucoup plus efficace qu'une pression continue.

### Contrôler juste ce qui est nécessaire

Il n'est pas indispensable de saisir loin.

Selon les situations, le poignet, le coude ou la manche suffisent.

L'objectif est uniquement de sécuriser le contrôle avant d'enchaîner.

> **À retenir**
>
> Chercher une prise plus éloignée n'apporte pas forcément un meilleur contrôle. La qualité du placement reste prioritaire.

---

## 09:34 — Passage à quatre pattes

### Conserver le même contrôle

Lorsque le partenaire tombe à quatre pattes, le principe reste identique.

La position de la tête change très peu.

Le contrôle est renforcé par l'engagement de la hanche qui accompagne le serrage du bras.

Le poids du corps participe alors directement au contrôle.

### Aller chercher le partenaire

Une erreur fréquente consiste à attendre le partenaire.

Au contraire, il faut aller le chercher dès qu'il touche le tapis.

Le déplacement est comparable à celui d'un **Uki-otoshi** : le partenaire est aspiré vers soi avant d'être contrôlé.

Cette dynamique permet d'éviter qu'il reconstruise sa base.

### Utiliser la percussion de l'épaule

Lorsque l'épaule vient au contact de la cuisse, elle sert de point d'appui pour renforcer immédiatement le contrôle.

Cette continuité entre le déplacement et le contrôle évite toute rupture dans l'action.

> **À retenir**
>
> Ce n'est jamais le partenaire qui vient vers le contrôle. C'est le judoka qui continue son déplacement pour aller le chercher.

## 10:22 — Finition

### Refermer immédiatement le contrôle

Une fois le partenaire amené au sol, la priorité est de supprimer tout espace qui pourrait lui permettre de se dégager.

Pour cela, le pied ne reste plus en appui sur le talon.

La plante du pied vient se rapprocher du genou afin de refermer la position et de limiter les possibilités de mouvement du partenaire.

### Accompagner la rotation

Le contrôle ne s'arrête pas lorsque le partenaire touche le tapis.

Le mouvement continue jusqu'à la stabilisation complète.

Le bras contrôlant la ceinture et le contrôle du bras travaillent simultanément pour accélérer la rotation.

Cette continuité empêche le partenaire de reconstruire une position défensive.

### Conserver un point d'accrochage

Pendant toute la séquence, il est essentiel de conserver un point d'accrochage sur le partenaire.

Même lorsque le contrôle semble acquis, cette liaison permet d'accélérer le mouvement et d'éviter toute rupture dans l'enchaînement.

Le partenaire est continuellement accompagné jusqu'à la position finale.

### S'asseoir dans la technique

La rotation ne s'effectue pas en basculant sur le côté.

Le corps vient progressivement s'asseoir sur la fesse afin de conserver toute la puissance de rotation.

Cette action facilite la fermeture du contrôle tout en maintenant une pression constante.

> **À retenir**
>
> La finition ne correspond pas à un arrêt du mouvement. Elle prolonge au contraire toute la dynamique créée depuis le déséquilibre initial.

---

## 11:45 — Positionnement et flexion

### Orienter correctement le bassin

Le placement final conditionne la qualité du contrôle.

La cuisse ne doit pas rester directement sous les épaules du partenaire.

Si cette sensation apparaît, il convient d'orienter légèrement le bassin vers le tapis afin de retrouver un meilleur alignement.

Cette correction améliore immédiatement la stabilité de la position.

### Utiliser le pied en flexion

Le pied reste actif pendant tout le contrôle.

Il travaille en flexion dorsale afin de conserver un véritable point d'accrochage.

Un pied laissé en extension réduit la stabilité et facilite les possibilités de sortie du partenaire.

### Privilégier le dynamisme

Même lorsque le contrôle semble installé, la position ne doit jamais devenir passive.

Chaque ajustement conserve une intention de progression.

Le contrôle reste vivant, dynamique et orienté vers la maîtrise complète du partenaire.

---

# Synthèse de la masterclass

## Les principes fondamentaux

Cette séquence repose sur quelques idées directrices qui reviennent tout au long de la démonstration :

- utiliser l'engagement réel du partenaire plutôt que chercher à le faire tomber par la force ;
- conserver le mouvement jusqu'au contrôle final ;
- rester constamment dans l'axe du partenaire ;
- orienter la tête pour guider le reste du corps ;
- adapter le contrôle à la réaction et au gabarit du partenaire ;
- supprimer progressivement tous les espaces permettant une sortie.

## Idée directrice

L'objectif n'est jamais d'appliquer une succession de techniques apprises par cœur.

Chaque contrôle naît de la réaction du partenaire.

Le judoka crée une première ouverture, observe la réponse adverse, puis adapte immédiatement son déplacement et son contrôle.

Cette capacité d'adaptation constitue le véritable fil conducteur de toute la masterclass.

> **Message clé de Frédéric Demontfaucon**
>
> La liaison debout-sol n'est pas une technique isolée. C'est la continuité logique d'un déséquilibre entretenu jusqu'au contrôle final.
$mc$,
  true
)
on conflict (slug) do update set
  titre = excluded.titre,
  youtube_url = excluded.youtube_url,
  contenu = excluded.contenu,
  published = excluded.published;

-- Entrée : « Placement dans le déplacement » (contenu = lesson.md fourni, upsert data-only).
insert into public.masterclass (titre, slug, youtube_url, contenu, published)
values (
  'Placement dans le déplacement — Projet Excellence Judo',
  'placement-deplacement',
  'https://www.youtube.com/watch?v=2SYniO6bF5w',
  $mc$## 00:00 — Introduction — ouvrir et se placer

### Objectif de la séquence

Le placement est un élément déterminant de l'efficacité d'une technique.

L'objectif de cette séquence est d'apprendre à créer un déplacement qui permette de se placer naturellement avant l'attaque, sans rupture de rythme.

Le déplacement ne sert pas uniquement à se rapprocher du partenaire : il prépare la position dans laquelle la technique pourra s'exprimer efficacement.

### Ouvrir le bassin

Le premier principe consiste à accepter d'ouvrir légèrement le bassin pendant le déplacement.

Cette ouverture permet au corps de rester relâché et de générer davantage de vitesse au moment de l'engagement.

Il ne faut pas chercher à conserver une posture rigide.

Le mouvement doit rester fluide, comme lorsque l'on lance une balle : le corps accompagne naturellement le geste avant de retrouver son équilibre.

### Accompagner le mouvement

Une erreur fréquente consiste à pousser tout en restant vertical.

Au contraire, il faut accepter de s'éloigner légèrement de son axe afin de créer une accélération qui permettra ensuite de se replacer rapidement.

> **À retenir**
>
> Le placement efficace naît d'un corps relâché qui accompagne le déplacement avant de retrouver son équilibre.

---

## 00:34 — Attraper et s'éloigner

### Créer l'espace nécessaire

Le partenaire est laissé libre de se rapprocher.

Au moment opportun, le judoka s'éloigne légèrement tout en attirant le partenaire vers lui.

Ce déplacement crée l'espace indispensable pour engager correctement la jambe.

### Le rôle du petit pas

Le petit pas de côté est un élément essentiel.

Il ne sert pas à parcourir une grande distance mais à replacer le corps dans une position stable avant l'attaque.

Plus le partenaire reste proche, plus le contrôle est facile.

À l'inverse, chercher à créer une trop grande distance augmente le risque que le partenaire prenne appui sur vous.

### Rester en équilibre

L'appui doit toujours rester sous le centre de gravité.

Si le pied se place d'un côté tandis que le corps reste de l'autre, le judoka perd lui-même son équilibre et tombe sur son partenaire.

Le déplacement doit permettre de rester capable de tenir seul son équilibre à chaque instant.

> **À retenir**
>
> Le placement n'a pas pour objectif d'aller loin, mais d'amener le corps dans une position stable avant l'engagement.

---

## 01:33 — Ouvrir les bras

### Donner une direction au partenaire

L'action des bras ne consiste pas uniquement à tirer.

La traction est principalement horizontale.

Elle sert à faire tourner les épaules du partenaire afin d'orienter son corps dans la direction souhaitée.

### Choisir le type de chute

Selon la direction donnée au partenaire, le résultat sera différent.

Une chute orientée vers l'avant ne prépare pas les mêmes attaques qu'une chute orientée vers l'arrière.

Le placement du bassin et de la jambe doit donc être cohérent avec la direction recherchée.

Le déplacement prépare déjà la technique suivante.

### Coordonner tout le corps

Les bras, le bassin et la jambe travaillent dans la même direction.

L'ensemble du corps accompagne le déplacement afin de produire un mouvement cohérent plutôt qu'une succession d'actions indépendantes.

> **À retenir**
>
> Les bras donnent la direction, mais c'est l'ensemble du corps qui construit le déplacement.

---

## 02:16 — Le moment de la chute

### Utiliser le rapprochement et l'éloignement

Le déplacement alterne constamment deux phases :

- un rapprochement ;
- un éloignement.

Cette alternance permet d'emmagasiner de l'énergie puis d'aspirer le partenaire au moment opportun.

### Adapter le déplacement

Les déplacements avant-arrière permettent de contrôler facilement la distance.

Les déplacements latéraux demandent davantage de précision.

Dans ce cas, le but n'est plus seulement de déplacer le partenaire mais de le faire tourner autour de soi.

### Accompagner la rotation

Le déplacement continue jusqu'à la fin de la rotation.

Il n'est pas nécessaire de rechercher une rotation complète du corps.

Selon la situation, un simple petit pas supplémentaire peut suffire à créer l'ouverture nécessaire.

### Une technique personnelle

Plusieurs façons de procéder peuvent être efficaces.

L'essentiel n'est pas de reproduire exactement un modèle unique mais de trouver un déplacement qui reste efficace et cohérent avec son propre judo.

> **À retenir**
>
> Il existe plusieurs solutions techniques. Le critère de choix reste toujours leur efficacité dans le déplacement.

---

## 05:11 — Mise en application

### Rechercher la désynchronisation

L'objectif de l'exercice est de créer une légère désynchronisation chez le partenaire.

Cette perte momentanée de coordination suffit souvent à ouvrir la possibilité de l'attaque.

### Utiliser différentes formes d'accrochage

Selon la réaction du partenaire, plusieurs formes d'accrochage peuvent être utilisées :

- un accrochage direct ;
- une poussée ;
- une combinaison des deux.

Toutes ces solutions sont valables dès lors qu'elles entretiennent le déséquilibre.

### Adapter la pression des bras

Lorsque l'accrochage est plus marqué, l'action des bras doit également devenir plus importante.

Le travail des jambes et celui des bras restent constamment synchronisés.

> **À retenir**
>
> Le déplacement précède toujours l'accrochage. Celui-ci ne fait qu'exploiter le déséquilibre déjà créé.
## 06:04 — Sur l'autre côté

### Concentrer l'action sur les bras

Lorsque l'attaque est réalisée de l'autre côté, le rôle des bras devient encore plus important.

L'objectif est de créer une forte tension tout en accompagnant le mouvement de l'épaule.

Cette action rapproche progressivement les deux coudes et oriente le partenaire vers l'arrière.

### Stabiliser le bassin

Une erreur fréquente consiste à laisser le bassin accompagner exagérément le mouvement.

Au contraire, le bassin doit rester stable afin que toute l'action soit transmise par la jambe d'attaque.

Le déplacement vient du pied, pas du haut du corps.

### Construire un appui solide

Le placement du pied constitue la base de toute la technique.

Lorsque cet appui est stable, le reste du mouvement peut s'exprimer naturellement.

> **À retenir**
>
> Le bassin reste stable. C'est le pied qui construit le déplacement, tandis que les bras orientent le partenaire.

---

## 07:08 — Le contact et le timing

### Trouver le bon moment

Le succès de l'attaque dépend avant tout du timing.

Il ne suffit pas de pousser le partenaire : encore faut-il intervenir exactement au moment où le pied entre en contact avec son appui.

### Synchroniser jambe et bras

L'ordre des actions est fondamental.

Le pied se place d'abord.

La pression des bras intervient uniquement lorsque le contact est établi.

Si les bras agissent trop tôt, la jambe arrive en retard et l'attaque perd son efficacité.

À l'inverse, lorsque les deux actions sont synchronisées, le partenaire ne peut plus reconstruire son équilibre.

### Donner une direction

La pression ne cherche pas uniquement à faire tourner le partenaire.

Elle doit l'orienter vers la zone où ses appuis deviennent les plus faibles.

La tension créée dans les bras accompagne alors naturellement le déplacement.

### Ajouter progressivement des informations

Une fois la synchronisation maîtrisée, il devient possible d'ajouter de nouvelles variations de déplacement.

Ces variations ne modifient pas le principe de base : elles enrichissent simplement les possibilités offertes au judoka.

> **À retenir**
>
> Le timing consiste à faire agir les bras exactement lorsque le pied commence son action.

---

## 08:51 — Le croisé

### Ouvrir avant de refermer

Le déplacement croisé repose sur une alternance précise.

Le partenaire est d'abord amené à avancer.

Le judoka ouvre ensuite l'espace nécessaire avant de refermer le déplacement dans la direction opposée.

### Laisser le partenaire agir naturellement

Le partenaire ne doit pas anticiper la technique.

Son rôle consiste uniquement à marcher normalement.

Il ne cherche ni à lever exagérément son pied, ni à accélérer sa pose d'appui.

Cette attitude permet de travailler sur une réaction réaliste.

### Préparer l'appui

Le judoka connaît la technique qu'il souhaite réaliser.

Il prépare donc son propre appui avant d'agir sur celui du partenaire.

Toute l'attention reste portée sur la qualité du placement plutôt que sur la vitesse d'exécution.

> **À retenir**
>
> Le partenaire ne crée pas la technique. Il fournit simplement une situation réaliste permettant de travailler le placement.

---

## 09:56 — Enchaînement

### Attendre le bon moment

Une fermeture trop précoce bloque naturellement le partenaire et rend le mouvement plus difficile.

Il est préférable de laisser son pied commencer à se déplacer avant d'ajouter progressivement le poids du corps.

### Ajouter une impulsion

Une légère impulsion de la main peut accompagner l'action principale.

Cette impulsion ne remplace jamais le déplacement.

Elle vient uniquement renforcer une dynamique déjà engagée.

### Utiliser les appuis

Le démarrage s'effectue grâce à un appui solide.

Le déplacement permet ensuite d'amener progressivement le partenaire contre la hanche.

Le contrôle reste proche du corps afin de conserver un maximum d'efficacité.

### Contrôler la jambe

La saisie ne cherche pas le genou.

Elle vient le plus près possible de la cheville afin de limiter les possibilités de réaction du partenaire.

Le corps reste droit tout au long du mouvement.

Le partenaire est accueilli contre soi plutôt que repoussé.

> **À retenir**
>
> L'efficacité ne vient pas de la vitesse d'exécution, mais de la qualité du placement et du moment choisi pour engager le mouvement.
## 11:27 — Continuer / synthèse

### Donner de la continuité au déplacement

L'attaque ne s'arrête pas lorsque le premier mouvement est terminé.

Le même principe de déplacement peut servir à enchaîner immédiatement sur une autre technique.

Au lieu de revenir à une position neutre, le judoka poursuit naturellement sa trajectoire et transforme le déplacement initial en nouvelle opportunité d'attaque.

Cette continuité constitue l'un des objectifs majeurs du travail présenté dans cette masterclass.

### Éloigner ses appuis

Pour créer de l'efficacité, il est nécessaire d'accepter d'éloigner ses propres appuis.

Plus le judoka reste proche de son axe, plus il limite sa capacité à entraîner le partenaire dans la rotation.

À l'inverse, en augmentant progressivement cette distance, il crée davantage d'inertie et facilite la mise en mouvement.

### Trouver son propre déplacement

Plusieurs formes de déplacement peuvent conduire au même résultat.

Certains préféreront un simple pas chassé.

D'autres utiliseront un déplacement croisé ou une rotation plus marquée.

L'objectif n'est pas de reproduire exactement un modèle unique, mais de développer un déplacement cohérent avec son propre judo.

Le critère reste toujours le même : conserver son équilibre tout en déséquilibrant efficacement le partenaire.

### Faire du déplacement un outil tactique

Le déplacement n'est pas uniquement une préparation à la technique.

Il devient lui-même un moyen de créer l'ouverture.

Chaque appui, chaque orientation du bassin et chaque changement de direction influencent directement les réactions du partenaire.

Plus le déplacement est maîtrisé, plus les attaques deviennent naturelles et difficiles à anticiper.

---

# Synthèse de la masterclass

## Les principes fondamentaux

Cette masterclass met en évidence plusieurs principes essentiels du déplacement en judo :

- créer le placement avant de chercher la projection ;
- alterner rapprochement et éloignement pour produire de l'inertie ;
- rester constamment en équilibre pendant le déplacement ;
- utiliser les bras pour orienter le partenaire plutôt que pour le tirer ;
- synchroniser précisément le travail des jambes et celui des bras ;
- engager l'action au moment exact où le partenaire perd la qualité de ses appuis ;
- conserver la continuité du déplacement jusqu'à l'enchaînement suivant.

## Les erreurs les plus fréquentes

Les difficultés observées proviennent souvent de quelques erreurs récurrentes :

- rester trop vertical pendant l'attaque ;
- vouloir aller trop vite sans construire le placement ;
- pousser avant que le pied ne soit en action ;
- éloigner excessivement le partenaire ;
- rechercher la force plutôt que le timing ;
- interrompre le déplacement une fois la technique engagée.

## Idée directrice

Le déplacement n'est pas un simple moyen de rejoindre le partenaire.

Il constitue la première étape de la technique.

Un bon placement permet de réduire les efforts, d'améliorer le timing et de créer naturellement les déséquilibres nécessaires aux projections.

> **Message clé de Frédéric Demontfaucon**

> La qualité d'une attaque dépend d'abord de la qualité du déplacement qui la précède. Plus le placement est juste, plus la technique devient simple, fluide et efficace.
$mc$,
  true
)
on conflict (slug) do update set
  titre = excluded.titre,
  youtube_url = excluded.youtube_url,
  contenu = excluded.contenu,
  published = excluded.published;

-- Entrée : « Préparation de l’attaque » (contenu = lesson.md fourni, upsert data-only).
insert into public.masterclass (titre, slug, youtube_url, contenu, published)
values (
  'Préparation de l’attaque — Projet Excellence Judo',
  'preparation-attaque',
  'https://www.youtube.com/watch?v=Ur4Eeh8QCqY',
  $mc$## 00:00 — Introduction — relâcher et se placer

### Objectif de la préparation d'attaque

Une attaque efficace ne commence pas au moment où la jambe s'engage.

Elle débute dès la préparation, lorsque le judoka met progressivement son partenaire dans une position où il sera plus difficile pour lui de se défendre.

La préparation d'attaque consiste avant tout à créer les conditions favorables à la projection.

### Mobiliser tout le corps

Le mouvement ne provient jamais uniquement des bras.

Lorsque les mains agissent sur la garde du partenaire, le bassin et les épaules participent également au déplacement.

Le relâchement du haut du corps permet au bassin de rester disponible et de transmettre l'énergie jusqu'à l'attaque.

Cette coordination donne davantage de fluidité et de puissance au mouvement.

### Créer une réaction

L'ouverture exercée sur le partenaire crée une tension qu'il cherche naturellement à corriger.

Dès qu'il revient vers sa position d'équilibre, une nouvelle opportunité apparaît.

La préparation consiste précisément à exploiter cette réaction.

> **À retenir**
>
> Une bonne préparation d'attaque ne force pas l'ouverture. Elle provoque une réaction que le judoka utilisera immédiatement.

---

## 01:15 — Doser sa poussée

### Pousser avec tout le corps

La poussée ne doit pas s'arrêter au niveau du pied.

Elle prend naissance dans les jambes, traverse le bassin puis s'exprime jusqu'aux mains.

Le partenaire ressent ainsi une pression globale qui désorganise son équilibre.

### Préparer plusieurs directions

La préparation n'impose pas une seule attaque.

Selon la réaction du partenaire, plusieurs possibilités restent ouvertes :

- poursuivre vers l'avant ;
- enchaîner vers l'arrière ;
- changer complètement de direction.

Le déplacement prépare donc plusieurs attaques potentielles.

### Rester disponible

Le corps doit rester relâché jusqu'au dernier instant.

Cette disponibilité permet d'adapter immédiatement la technique à la réaction observée.

> **À retenir**
>
> Une bonne préparation laisse toujours plusieurs possibilités d'attaque ouvertes.

---

## 02:04 — Créer la première ouverture

### Déstabiliser avant d'attaquer

L'objectif n'est pas d'enchaîner rapidement plusieurs attaques.

La priorité consiste d'abord à déséquilibrer le partenaire.

Un partenaire parfaitement stable oppose naturellement davantage de résistance.

La préparation vise donc à modifier sa posture avant toute tentative de projection.

### Mettre le partenaire en mouvement

Une ou plusieurs attaques préparatoires peuvent être nécessaires.

L'essentiel est de provoquer un déplacement et une adaptation permanente de ses appuis.

Chaque réaction fournit une nouvelle information exploitable.

### Se rapprocher sans se découvrir

Le judoka cherche également à rapprocher son corps.

Cette progression s'effectue sans abandonner le contrôle des mains.

Le déplacement permet ainsi de réduire progressivement la distance tout en conservant une position favorable.

### Exploiter les réactions

Lorsque le partenaire tente de retrouver son équilibre ou de remettre de la pression dans la garde, une nouvelle ouverture apparaît.

La préparation consiste à reconnaître ces instants et à les utiliser immédiatement.

> **À retenir**
>
> Avant de chercher la projection, il faut créer une situation où le partenaire ne peut plus conserver un équilibre stable.

---

## 03:17 — La première attaque

### Donner une fausse information

La première attaque n'a pas toujours pour objectif de faire tomber.

Elle sert souvent à provoquer une réaction.

Le partenaire modifie alors naturellement sa posture pour défendre.

Cette réaction prépare l'attaque suivante.

### Utiliser les oppositions

Pour faire réagir dans une direction, il est souvent nécessaire d'agir d'abord dans la direction opposée.

Une poussée peut préparer un déplacement inverse.

Une traction peut provoquer un retour qui ouvrira une nouvelle attaque.

Cette alternance constitue l'un des principes fondamentaux de la préparation d'attaque.

### Laisser vivre les mains

Les mains ne doivent jamais figer la garde.

Leur rôle est d'accompagner les réactions du partenaire.

Au lieu de bloquer ses mouvements, elles les utilisent pour créer une nouvelle opportunité.

> **À retenir**
>
> Une attaque préparatoire ne cherche pas forcément à marquer. Elle cherche avant tout à provoquer la bonne réaction.

---

## 04:29 — Mise en application

### Déstabiliser les appuis

La préparation d'attaque repose largement sur le travail des Ashi-waza.

L'objectif est de perturber simultanément les appuis des pieds et ceux des mains.

Lorsque cette instabilité est créée, les attaques deviennent beaucoup plus efficaces.

### Créer une position intermédiaire

Avant de choisir une direction définitive, le judoka recherche une position dans laquelle le partenaire ne peut pas anticiper.

À cet instant, il ne sait pas encore si l'attaque partira vers l'avant ou vers l'arrière.

Cette incertitude constitue un avantage tactique important.

### Préparer l'engagement

Au moment où le pied quitte le sol, le bassin commence déjà à s'ouvrir.

La préparation précède donc toujours l'attaque proprement dite.

Le mouvement apparaît ainsi fluide et difficile à lire pour le partenaire.

> **À retenir**
>
> La préparation d'attaque consiste à rendre la lecture de l'intention la plus difficile possible tout en conservant un déplacement fluide.
## 05:52 — Lancer l'attaque depuis le bassin

### Donner l'impulsion avec le bassin

L'attaque débute par une mise en mouvement du bassin.

Le geste doit rester souple et naturel, comme lorsque l'on lance une balle ou un projectile.

Cette image permet de comprendre que la puissance ne provient pas des bras mais de l'ensemble du corps.

Le bassin initie le mouvement, les épaules l'accompagnent et les bras transmettent l'action jusqu'au partenaire.

### Éviter de libérer l'appui adverse

Une erreur fréquente consiste à pousser directement le partenaire vers l'avant.

En agissant ainsi, on allège naturellement sa jambe d'appui, ce qui facilite son retrait et rend le fauchage beaucoup plus difficile.

Au contraire, la pression doit être orientée légèrement en travers et vers le bas afin de conserver son poids sur la jambe que l'on souhaite attaquer.

### Utiliser la main comme prolongement du mouvement

Le bras ne reste jamais passif.

Après l'ouverture, il accompagne le mouvement en recherchant naturellement la main du partenaire.

Cette continuité permet de conserver la tension tout au long de l'attaque.

### Rechercher le relâchement

Le mouvement doit rester fluide.

La rigidité ralentit la technique et diminue la capacité à transmettre l'énergie.

Imaginer un lancer de balle, un lancer de pierre ou encore un coup de katana aide à retrouver cette sensation de relâchement avant l'accélération finale.

> **À retenir**
>
> La puissance naît du relâchement. Plus le mouvement est fluide, plus l'énergie est transmise efficacement jusqu'au partenaire.

---

## 07:10 — Travail des mains et des appuis

### Créer le déséquilibre

Le rôle des mains consiste à créer un déséquilibre permanent.

Chaque action cherche à faire tourner le partenaire tout en l'obligeant à modifier ses appuis.

Les mains ne travaillent jamais indépendamment des jambes.

### Construire la tension

La préparation alterne constamment :

- une ouverture ;
- une poussée ;
- un retour.

Cette alternance entretient l'instabilité du partenaire et prépare naturellement l'attaque suivante.

### Utiliser un pas de recul

Lorsque le placement est difficile, un léger pas de recul peut faciliter la préparation.

Ce recul permet de retrouver de la disponibilité et de reconstruire un meilleur angle d'attaque.

Il ne s'agit pas d'abandonner l'initiative, mais de créer les conditions favorables à une nouvelle attaque.

> **À retenir**
>
> Le déplacement reste un outil au service du déséquilibre. Chaque pas doit améliorer la qualité du placement avant l'engagement.

---

## 07:54 — Trois formes / synthèse

### Faire avancer le partenaire

Lorsque l'on attire le partenaire, il ne s'agit pas simplement de tirer vers soi.

La traction doit l'inciter à avancer.

C'est cette avancée qui crée les nouvelles possibilités d'attaque.

### Trois formes de préparation

La préparation peut prendre plusieurs formes selon la réaction du partenaire.

Le principe reste identique : modifier son axe avant d'engager la technique.

Le choix de la préparation dépend de la situation rencontrée et des réactions observées.

### Changer d'axe

Lorsque les bras du partenaire restent tendus, il devient difficile d'attaquer directement.

La solution consiste alors à modifier son propre axe de déplacement.

Cette ouverture permet ensuite de revenir au centre avec un meilleur angle d'attaque.

### Préparer avant d'engager

L'objectif n'est pas d'attaquer immédiatement.

Le judoka cherche d'abord à modifier la position du partenaire afin de rendre sa défense moins efficace.

Chaque changement d'axe prépare ainsi la technique suivante.

> **À retenir**
>
> Une bonne préparation consiste souvent à changer d'axe avant d'attaquer, plutôt qu'à chercher une attaque directe contre un partenaire parfaitement équilibré.
# Synthèse de la masterclass

## Les principes fondamentaux

La préparation d'attaque ne consiste pas à enchaîner des techniques de manière automatique.

Elle vise avant tout à créer les conditions qui rendront l'attaque réellement efficace.

Tout au long de cette masterclass, plusieurs principes reviennent de façon constante :

- mettre le partenaire en mouvement avant d'attaquer ;
- utiliser le relâchement pour produire de la vitesse ;
- engager le bassin avant les bras ;
- créer des réactions plutôt que rechercher la force ;
- conserver plusieurs possibilités d'attaque jusqu'au dernier instant ;
- modifier les appuis et les axes avant d'engager la projection.

---

## Les erreurs les plus fréquentes

Plusieurs difficultés apparaissent régulièrement lors de la préparation d'attaque :

- vouloir attaquer un partenaire encore parfaitement équilibré ;
- utiliser uniquement les bras sans engager le bassin ;
- pousser trop tôt et libérer la jambe que l'on souhaite attaquer ;
- figer la garde au lieu d'utiliser les réactions du partenaire ;
- annoncer trop tôt la direction de l'attaque ;
- rester rigide pendant le déplacement.

Ces erreurs rendent la préparation prévisible et diminuent fortement les possibilités de projection.

---

## Les points d'attention

Une préparation efficace repose sur quelques repères simples :

- conserver un corps relâché ;
- maintenir un équilibre personnel à chaque déplacement ;
- créer des réactions successives chez le partenaire ;
- rester disponible pour changer immédiatement de direction ;
- synchroniser le travail des jambes, du bassin et des mains.

L'objectif n'est jamais de produire un geste spectaculaire, mais de créer progressivement une situation favorable.

---

## Les idées clés à retenir

Avant chaque attaque, posez-vous les questions suivantes :

- Mon partenaire est-il réellement en mouvement ?
- Ai-je modifié son équilibre avant d'attaquer ?
- Mon bassin accompagne-t-il mon mouvement ?
- Mes mains utilisent-elles sa réaction ou cherchent-elles simplement à le bloquer ?
- Puis-je encore changer de direction si sa défense évolue ?

Si la réponse est positive, la préparation est en place.

---

## Message du professeur

Une attaque réussie ne commence pas au moment où la jambe s'engage.

Elle commence plusieurs instants auparavant, lorsque le judoka crée progressivement les conditions qui empêcheront son partenaire de rester stable.

La préparation d'attaque est donc un travail permanent de déséquilibre, de déplacement et d'adaptation.

Plus cette préparation est juste, plus l'attaque devient naturelle, fluide et difficile à défendre.
$mc$,
  true
)
on conflict (slug) do update set
  titre = excluded.titre,
  youtube_url = excluded.youtube_url,
  contenu = excluded.contenu,
  published = excluded.published;
