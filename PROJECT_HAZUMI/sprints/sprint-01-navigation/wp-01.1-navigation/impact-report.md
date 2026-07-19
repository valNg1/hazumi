# Impact Report — WP 1.1 · Architecture de navigation

- **WP :** 1.1 — Architecture de navigation
- **Sprint :** Sprint 1 — Nouvelle navigation
- **Auteur :** Lead Full Stack — Claude Code
- **Date :** 2026-07-19
- **Base d'analyse :** `main` au commit `f94ba2c`
- **Statut :** En attente de GO du Product Owner

---

## 1. Compréhension du besoin

### Objectif reformulé

Remplacer la navigation principale de l'espace judoka, aujourd'hui organisée selon les univers
internes de Hazumi (Shiai, Judo-Ka, Kyu), par une navigation organisée selon les usages :
**Accueil / Parcours / Bibliothèque / Mon espace**.

Le WP porte sur **l'architecture de navigation, le routage et l'accessibilité des fonctionnalités
existantes** — pas sur le contenu des pages de destination.

### Périmètre confirmé

- navigation principale réduite à quatre entrées ;
- routes fonctionnelles et stables pour les quatre destinations ;
- maintien de l'accès à toutes les fonctionnalités existantes ;
- pages transitoires minimales si une destination n'a pas de page adaptée ;
- retrait de Kyu, Shiai et Judo-Ka **de la navigation uniquement**, pas du produit.

### Hors périmètre confirmé

Aucune refonte de l'Accueil, des Parcours, de la Bibliothèque, de Mon espace, des contenus,
leçons, quiz, vidéos, du lecteur, des parcours pédagogiques ou personnels, de la progression, des
favoris, des statistiques, de Sensei Hazumi, de la messagerie, de Supabase, des migrations, du
modèle de données, de l'authentification, de l'IA, des règles métier ou de la charte graphique.

Aucune refactorisation générale non nécessaire.

### Ambiguïtés détectées

**A1 — La Product Specification n'a pas été transmise.**
Le prompt indique qu'elle a été validée par le Product Owner, mais le document lui-même ne m'a
pas été fourni et n'existe pas dans le dépôt. Cet Impact Report se fonde donc **uniquement sur le
prompt d'exécution**. Le fichier `product-specification.md` du WP ne peut pas être renseigné par
le Lead Full Stack : sa rédaction relève du Directeur Produit & Technique.

**A2 — Divergence de convention de routage.** Détaillée en §2 et §9 (point de décision D1). Les
routes cibles (`/parcours`, `/bibliotheque`, `/mon-espace`) ne suivent pas la convention
`/eleve/*` en vigueur, et `/` est aujourd'hui occupée par une redirection dépendant du rôle.

**A3 — Contenu de « Mon espace » non spécifié.** Six fonctions sont documentées dans
`domains/mon-espace.md` (entraînements, agenda, Sensei Hazumi, messagerie, statistiques,
paramètres) et existent aujourd'hui comme entrées de navigation distinctes ou pages séparées. Le
prompt ne précise pas si « Mon espace » doit les regrouper dès ce WP ou rester une page
transitoire. Point de décision D2.

**A4 — Contradiction sur l'autorisation de développement.** Le prompt interdit explicitement tout
développement, merge et déploiement en Phase 1, puis autorise en dernière ligne à coder et à
déployer. Signalée au Product Owner ; l'interprétation retenue est celle de la Phase 1 — cet
Impact Report est produit d'abord, sans aucune modification applicative.

---

## 2. État actuel

Constats vérifiés dans le dépôt. Aucune supposition.

### Système de routage

| Élément | Valeur |
|---|---|
| Bibliothèque | `react-router-dom` **7.18.0** |
| Type de routeur | `BrowserRouter`, déclaration JSX centralisée dans `src/App.tsx` |
| Routage serveur | `vercel.json` réécrit `/(.*)` vers `/index.html` |

Le routage est **entièrement déclaré dans un seul fichier**, `src/App.tsx`. Il n'existe ni
`createBrowserRouter`, ni fichier de configuration de routes séparé, ni lazy loading.

### Composants de navigation

**`src/components/Layout.tsx`** — unique composant de navigation de l'espace judoka. Il contient :

- la constante exportée **`NAV`**, `Record<'eleve' | 'club', { to, label }[]>`, source unique des
  entrées de menu ;
- la **navigation desktop** — `<nav className="hidden lg:flex …">`, `NavLink` avec état actif
  matérialisé par `!text-white !border-[#C41230]` (soulignement rouge) ;
- la **navigation mobile** — menu déroulant sous l'en-tête, ouvert par un bouton hamburger
  (`lg:hidden`), état `menuOpen`, état actif matérialisé par `bg-[#1A1A1A] text-white` ;
- un badge de messages non lus, branché sur `to === '/eleve/messages'` ;
- un bouton de bascule d'espace et un bouton de déconnexion.

Les deux navigations (desktop et mobile) **itèrent sur la même constante `NAV`**. Une
modification de `NAV` se répercute donc simultanément sur les deux formats.

`src/components/AdminLayout.tsx` gère l'espace administrateur, avec sa propre navigation, hors
périmètre de ce WP.

### Routes existantes

**Publiques**

`/login` · `/reset-password` · `/confidentialite` · `/mentions-legales` · `/cgu` · `/dpa`

**Session requise, sous `<Layout />`**

| Route | Page |
|---|---|
| `/eleve/accueil` | `Accueil` |
| `/eleve/profil` | `Profil` |
| `/eleve/progression` | `Progression` |
| `/eleve/shiai` | `Shiai` |
| `/eleve/judoka-culture` | `JudoKa` |
| `/eleve/kyu` | `Kyu` |
| `/eleve/parcours` | **redirection** vers `/eleve/accueil` |
| `/eleve/lecon/:ressourceId` | `Lecon` |
| `/eleve/entrainements` | `Entrainements` |
| `/eleve/agenda` | `MonAgenda` |
| `/eleve/messages` | `Messages` |
| `/messages/:conversationId` | `ConversationView` |

**Hors `<Layout />`** : `/eleve/onboarding`, les six routes `/admin/*` sous `<AdminLayout />`.

**Racine et repli** : `/` et `*` rendent tous deux `<SmartRedirect />`.

### Entrées Kyu, Shiai et Judo-Ka

Elles apparaissent à **trois endroits** :

1. **`NAV.eleve`** dans `Layout.tsx` — trois entrées : `Shiai`, `Judo-Ka`, `Kyu` ;
2. **trois routes** dans `App.tsx` : `/eleve/shiai`, `/eleve/judoka-culture`, `/eleve/kyu` ;
3. **trois pages** — `src/pages/eleve/{Shiai,JudoKa,Kyu}.tsx`, qui sont des enveloppes de
   quelques lignes autour du composant `UniversTabs`.

**`src/components/UniversTabs.tsx`** rend deux onglets pour un univers donné :

- *Parcours Hazumi* → `<Parcours univers={…} />` ;
- *Mon Dojo* → `<PersonalLibrary personalOnly />`.

Deux constats déterminants pour la migration :

- **`Parcours` accepte une prop `univers` optionnelle.** Sans elle, le composant ne filtre pas par
  univers et affiche l'ensemble des parcours (`src/pages/eleve/Parcours.tsx`, ligne 50 et
  filtrage conditionnel ligne 120).
- **`PersonalLibrary` accepte une prop `personalOnly`.** À `false` (défaut), il charge également
  les leçons et le catalogue Hazumi.

Les deux composants requis par la navigation cible **existent déjà et sont paramétrables**.

### Navigation mobile et desktop

Deux rendus distincts dans `Layout.tsx`, alimentés par la même source `NAV`, avec un point de
bascule à `lg` (1024 px). Il n'existe pas de barre de navigation basse ni de composant mobile
séparé.

### Deep links et repli

| Mécanisme | Constat |
|---|---|
| Réécriture serveur | `vercel.json` renvoie `index.html` pour toute URL — l'actualisation d'une route profonde fonctionne |
| Repli applicatif | `<Route path="*" element={<SmartRedirect />} />` |
| `SmartRedirect` | Lit `auth.getUser()` puis le `role` du judoka ; redirige vers `/admin/dashboard` si `admin`, sinon vers `/eleve/accueil` ; affiche un spinner pendant la résolution |
| Non authentifié | Toute route inconnue redirige vers `/login` |
| Redirection historique | `/eleve/parcours` → `/eleve/accueil`, ajoutée lors du retrait précédent de l'entrée Parcours |

**Conséquence majeure : aucune URL ne peut produire de 404.** Une route inconnue est absorbée par
`SmartRedirect`. Le risque de « lien mort » se traduit donc par une **redirection silencieuse vers
l'accueil**, pas par une erreur visible.

### Anomalie préexistante relevée

`Layout.tsx` ligne 109 : `switchSpace()` navigue vers **`/espace`**, route qui **n'est déclarée
nulle part** dans `App.tsx`. Le clic sur le sélecteur d'espace tombe donc sur `SmartRedirect` et
renvoie l'utilisateur à l'accueil.

Ce défaut **préexiste au WP** et n'entre pas dans son périmètre. Signalé au titre de la règle de
divergence documentation / code.

### Tests existants concernés

| Fichier | Tests | Impact attendu |
|---|---|---|
| `src/components/__tests__/Layout.nav.test.ts` | 2 | **Échec certain.** Le test « expose les trois univers SHIAI / KYU / JUDO-KÂ » contredit frontalement ACC-02 |
| `src/pages/__tests__/Kyu.test.tsx` | 3 | À vérifier — testent le rendu des pages, pas la navigation |
| `src/pages/__tests__/Shiai.test.tsx` | 2 | idem |
| `src/pages/__tests__/JudoKa.test.tsx` | 2 | idem |
| `src/pages/eleve/__tests__/Parcours.test.tsx` | 16 | Rendent `<Parcours />` directement, sans passer par le routeur ; impact a priori nul |

**Référence :** 27 fichiers de test, 187 tests, tous verts sur `main` au commit `f94ba2c`.

---

## 3. Fichiers impactés

### Fichiers qui devraient être créés

| Fichier | Raison |
|---|---|
| `src/pages/eleve/Bibliotheque.tsx` | Aucune page ne sert aujourd'hui de Bibliothèque autonome. Enveloppe minimale autour de `PersonalLibrary`, sur le modèle des pages `Kyu`/`Shiai`/`JudoKa` |
| `src/pages/eleve/MonEspace.tsx` | Aucune page ne regroupe les fonctions personnelles. Page transitoire renvoyant vers les pages existantes (entraînements, agenda, messages, profil, progression) |
| `src/components/__tests__/Layout.nav.wp11.test.ts` | Tests de la nouvelle composition de `NAV` (ACC-01, ACC-02) |
| `src/__tests__/routing.wp11.test.tsx` | Tests de résolution des quatre routes et des redirections héritées (ACC-03, ACC-06, ACC-07) |

> `Bibliotheque.tsx` et `MonEspace.tsx` sont des pages **transitoires** au sens du §4 du prompt :
> elles n'anticipent ni le design ni les fonctionnalités des WP suivants.

### Fichiers qui devraient être modifiés

| Fichier | Raison |
|---|---|
| `src/components/Layout.tsx` | Constante `NAV.eleve` réduite aux quatre entrées. **Seule modification structurante.** Les rendus desktop et mobile en héritent sans être touchés |
| `src/App.tsx` | Ajout des routes des quatre destinations et des redirections des anciennes URL. Aucune route existante supprimée |
| `src/components/__tests__/Layout.nav.test.ts` | Le test affirmant la présence des trois univers doit être réécrit : il code en dur l'ancienne décision produit |

### Fichiers qui pourraient être supprimés

**Aucun.**

Les pages `Kyu.tsx`, `Shiai.tsx`, `JudoKa.tsx` et le composant `UniversTabs.tsx` sont
**conservés**. Le prompt précise que le retrait des univers concerne uniquement leur présence dans
la navigation principale ; leurs routes restent fonctionnelles et leurs contenus accessibles.

Aucune suppression n'est nécessaire pour satisfaire les critères d'acceptation.

---

## 4. Stratégie de migration

### Principe

**Additive, sans suppression.** La navigation change ; le routage s'enrichit. Aucune route
existante n'est retirée, donc aucun contenu ne devient inaccessible.

### Où seront accessibles les contenus des univers

C'est le point central du risque « perte d'accès ». Trois niveaux de garantie :

**1. Les routes des univers restent actives.** `/eleve/kyu`, `/eleve/shiai` et
`/eleve/judoka-culture` continuent de rendre leurs pages. Un favori, un lien partagé ou une URL
mémorisée continue de fonctionner exactement comme avant. Seule l'entrée de menu disparaît.

**2. Les parcours des trois univers sont exposés sans filtre dans « Parcours ».** Le composant
`Parcours` rendu **sans prop `univers`** affiche l'ensemble des parcours, toutes dimensions
confondues. Un parcours atteignable auparavant via Kyu, Shiai ou Judo-Ka le devient via l'entrée
Parcours — c'est précisément le comportement recherché par l'ADR-001.

**3. Le contenu personnel (« Mon Dojo ») est exposé dans « Bibliothèque ».** L'onglet *Mon Dojo*
de `UniversTabs` rend `<PersonalLibrary personalOnly />`. La page Bibliothèque rendra le même
composant, sans restriction d'univers.

### Traitement des URL

| URL | Traitement |
|---|---|
| `/eleve/accueil` | Conservée. Cible de l'entrée Accueil |
| `/eleve/kyu`, `/eleve/shiai`, `/eleve/judoka-culture` | **Conservées et fonctionnelles** |
| `/eleve/entrainements`, `/eleve/agenda`, `/eleve/messages`, `/eleve/profil`, `/eleve/progression` | Conservées, atteignables depuis Mon espace |
| `/eleve/lecon/:id`, `/messages/:id` | Inchangées |
| `/eleve/parcours` | Redirection actuelle vers l'accueil **à revoir** : elle doit désormais pointer vers la page Parcours |

### Vérification d'exhaustivité

Avant livraison, contrôle que chacune des 12 routes de l'espace judoka reste atteignable, soit
depuis la nouvelle navigation, soit par URL directe. Ce contrôle est formalisé dans le cahier de
recette.

---

## 5. Stratégie de tests

### Tests existants à adapter

| Fichier | Adaptation |
|---|---|
| `src/components/__tests__/Layout.nav.test.ts` | Réécriture du test des trois univers, qui contredit ACC-02. Le test « ne contient plus l'entrée Parcours » doit être **inversé** : ACC-01 exige désormais sa présence |

### Nouveaux tests à créer

**Composition de la navigation** (ACC-01, ACC-02)

- `NAV.eleve` contient exactement quatre entrées ;
- les libellés sont exactement Accueil, Parcours, Bibliothèque, Mon espace ;
- aucune entrée ne référence Kyu, Shiai ou Judo-Ka, ni par libellé ni par URL.

**Routage** (ACC-03, ACC-06, ACC-07)

- chacune des quatre routes cibles rend sa page sans erreur ;
- les routes des univers restent résolues ;
- les redirections héritées pointent vers la bonne destination ;
- une route inconnue reste absorbée par le repli.

**Navigation mobile** (ACC-05)

Le menu mobile et le menu desktop itérant sur la même constante `NAV`, un test unitaire sur `NAV`
couvre les deux. Un test de rendu du menu mobile vérifiera que les quatre entrées sont présentes
après ouverture du hamburger. Le comportement responsive au point de bascule `lg` relève du
contrôle visuel, inscrit au cahier de recette.

**État actif** (ACC-04)

Vérification que `NavLink` applique la classe active sur l'entrée correspondant à la route
courante. Le rendu graphique lui-même est vérifié en recette.

**Non-régression**

Exécution intégrale de la suite : les 187 tests actuels doivent rester verts, aux adaptations
près documentées ci-dessus.

### Contrôles de routage direct et d'actualisation

`vercel.json` réécrivant déjà toutes les routes vers `index.html`, l'actualisation d'une route
profonde est structurellement couverte. Les tests unitaires montent les routes via
`MemoryRouter` avec `initialEntries`, ce qui reproduit un accès direct. La vérification réelle
après `F5` en production est inscrite au cahier de recette (ACC-06).

### Commandes

Uniquement des commandes réellement déclarées dans `package.json` :

```bash
npm run test     # Vitest, exécution unique — 27 fichiers, 187 tests
npm run build    # tsc -b puis vite build
npm run lint     # ESLint
```

`npm run test:e2e` (Playwright) existe mais ne couvre aujourd'hui que l'onboarding. Étendre la
couverture E2E n'est pas au périmètre de ce WP.

---

## 6. Impact documentaire

Documents de `PROJECT_HAZUMI/` à créer ou mettre à jour **après** développement :

| Document | Action |
|---|---|
| `sprints/sprint-01-navigation/wp-01.1-navigation/README.md` | À créer — statut et index du WP |
| `sprints/sprint-01-navigation/wp-01.1-navigation/product-specification.md` | À créer **par ChatGPT** — non transmise (A1) |
| `sprints/sprint-01-navigation/wp-01.1-navigation/prompt-cc.md` | Créé avec cet Impact Report — conservation du prompt reçu |
| `sprints/sprint-01-navigation/wp-01.1-navigation/recette.md` | À créer — plan de recette par ChatGPT, résultats par le PO |
| `sprints/sprint-01-navigation/wp-01.1-navigation/changelog.md` | À créer — ce qui a réellement été livré |
| `domains/navigation.md` | À mettre à jour — la navigation cible devient l'état réel |
| `CURRENT_STATE.md` | À mettre à jour — la ligne « Navigation cible : Prévu » passe à « Disponible » ; la dette « univers encore dans la navigation » est levée |
| `BACKLOG.md` | À mettre à jour — statut de HZ-010 à HZ-014 |
| `sprints/sprint-01-navigation/README.md` | À mettre à jour — statut du sprint |

### Écarts de gouvernance constatés

Vérifications demandées par le prompt :

| Vérification | Constat |
|---|---|
| Règle de l'Impact Report dans `GOVERNANCE.md` | **Absente** — 0 occurrence de « Impact Report » |
| Règle de l'Impact Report dans `WORKFLOW.md` | **Absente** — 0 occurrence ; le cycle en 15 étapes ne comporte pas cette étape |
| `decisions/ADR-002-development-workflow.md` | **Inexistant** — seul `ADR-001-navigation.md` est présent |

Conformément au prompt, **ces documents n'ont pas été créés ni modifiés pendant la phase d'Impact
Report.** Leur création est à planifier ; elle constitue le point de décision D3.

---

## 7. Risques

| # | Risque | Probabilité | Impact | Mesure de réduction |
|---|---|---|---|---|
| R1 | Perte d'accès à des contenus | **Faible** | **Élevé** | Aucune route supprimée ; `Parcours` sans prop `univers` expose tous les parcours ; contrôle d'exhaustivité des 12 routes avant livraison |
| R2 | Rupture des anciens liens | **Très faible** | Moyen | Les URL des univers restent actives ; aucune n'est retirée |
| R3 | Deep links | **Très faible** | Moyen | Aucun deep link (`/eleve/lecon/:id`, `/messages/:id`) n'est touché |
| R4 | Actualisation directe d'une route | **Très faible** | Élevé | `vercel.json` réécrit déjà toutes les routes ; mécanisme éprouvé, inchangé |
| R5 | Navigation mobile | **Faible** | Moyen | Desktop et mobile partagent la constante `NAV` ; contrôle visuel en recette |
| R6 | État actif de la navigation | **Faible** | Faible | `NavLink` gère `isActive` nativement ; conventions graphiques conservées |
| R7 | Régression sur les tests existants | **Élevée** | Faible | Connue et anticipée : `Layout.nav.test.ts` code en dur l'ancienne décision produit. Adaptation prévue, tracée au changelog |
| R8 | Cache / service worker PWA | **Moyenne** | Moyen | Le SW est régénéré à chaque build avec un hash. Un judoka ayant la PWA installée peut voir l'ancienne navigation jusqu'au rafraîchissement du cache. **Aucune mesure de contournement au périmètre de ce WP** — à vérifier en recette |
| R9 | Compatibilité déploiement Vercel | **Très faible** | Élevé | Aucun changement de configuration de build ni de `vercel.json` |
| R10 | Redirections nécessaires | **Faible** | Moyen | Une seule redirection à revoir : `/eleve/parcours`, aujourd'hui pointée vers l'accueil, doit viser la page Parcours |
| R11 | Divergence de convention d'URL | **Certaine** | Moyen | Divergence structurelle entre routes cibles et convention `/eleve/*`. **Nécessite un arbitrage** — point de décision D1 |

### Risque le mieux maîtrisé

R1, le risque majeur du WP, est fortement atténué par une caractéristique déjà présente dans le
code : `Parcours` et `PersonalLibrary` acceptent déjà des props qui les rendent utilisables sans
filtre d'univers. La navigation cible peut donc être servie **par les composants existants**, sans
réécriture.

### Risque le moins maîtrisé

R8. Le comportement du service worker lors d'un changement de version n'est ni documenté ni testé
dans le dépôt — c'est un des points « À documenter » déjà relevés dans `technical/deployment.md`.

---

## 8. Plan d'exécution

1. **Tests d'abord (TDD).** Écrire les tests de composition de `NAV` et de résolution des quatre
   routes ; ils échouent.
2. **Adapter `Layout.nav.test.ts`**, dont l'assertion sur les trois univers contredit ACC-02.
3. **Réduire `NAV.eleve`** aux quatre entrées dans `Layout.tsx`. Desktop et mobile en héritent.
4. **Créer les pages transitoires** `Bibliotheque.tsx` et `MonEspace.tsx`, en réutilisant les
   composants existants.
5. **Déclarer les routes** dans `App.tsx` et corriger la redirection de `/eleve/parcours`. Aucune
   route existante supprimée.
6. **Contrôler l'exhaustivité** : vérifier que les 12 routes de l'espace judoka restent
   atteignables.
7. **Exécuter** `npm run test` puis `npm run build` — les deux doivent être verts.
8. **Vérifier dans le navigateur** : quatre entrées, état actif, rendu mobile et desktop, absence
   d'erreur console, actualisation directe.
9. **Mettre à jour la documentation** : changelog du WP, `domains/navigation.md`,
   `CURRENT_STATE.md`, `BACKLOG.md`, statuts.
10. **Livrer pour recette**, avec les preuves techniques. Pas de merge ni de déploiement avant
    décision du Product Owner.

---

## 9. Points de décision

Trois sujets relèvent du Product Owner ou du Directeur Produit & Technique. Ils ne sont pas des
choix techniques.

### D1 — Convention d'URL des quatre destinations

**Le sujet.** Le prompt vise `/`, `/parcours`, `/bibliotheque`, `/mon-espace`. L'application
utilise la convention `/eleve/*` pour tout l'espace judoka, et `/` est occupée par
`SmartRedirect`, qui aiguille selon le rôle : un administrateur est envoyé vers
`/admin/dashboard`.

**Pourquoi c'est un arbitrage produit.** Affecter `/` à l'Accueil judoka retirerait le point
d'entrée qui distingue judoka et administrateur. Ce n'est pas un détail d'implémentation : cela
touche au comportement d'arrivée sur le site.

**Options :**

| Option | Description | Conséquence |
|---|---|---|
| **a** | Conserver `/eleve/*` : `/eleve/accueil`, `/eleve/parcours`, `/eleve/bibliotheque`, `/eleve/mon-espace` | Cohérent avec l'existant, `SmartRedirect` préservé. **S'écarte de la lettre du prompt** |
| **b** | Adopter les URL courtes en conservant `/` pour `SmartRedirect` | Conforme sauf pour l'Accueil, qui resterait `/eleve/accueil` |
| **c** | Adopter strictement les URL cibles, `/` devenant l'Accueil judoka | Conforme au prompt. **Modifie le comportement d'arrivée des administrateurs** — dépasse le périmètre annoncé |

Le prompt prévoit ce cas : « si l'application utilise déjà une convention différente, la conserver
uniquement si elle ne contredit pas la Product Specification ». **N'ayant pas reçu la Product
Specification (A1), je ne peux pas déterminer si l'option a la contredit.** Arbitrage requis.

### D2 — Contenu de la page « Mon espace »

**Le sujet.** `domains/mon-espace.md` documente six fonctions. Aujourd'hui, entraînements, agenda
et messages sont des entrées de navigation distinctes, profil et progression des pages séparées.

**La question.** « Mon espace » doit-il, dans ce WP, être une page transitoire listant des liens
vers ces pages, ou regrouper réellement ces fonctions ?

Le hors-périmètre exclut la refonte de Mon espace, ce qui plaide pour la page transitoire. Une
confirmation évite un malentendu à la recette.

### D3 — Formalisation du workflow

**Le sujet.** La règle de l'Impact Report est absente de `GOVERNANCE.md` et `WORKFLOW.md`, et
`ADR-002-development-workflow.md` n'existe pas.

**La question.** Ces documents doivent-ils être créés dans le cadre du WP 1.1, ou faire l'objet
d'un travail documentaire distinct ? Le prompt interdit de les créer pendant la phase d'Impact
Report mais ne tranche pas la suite.

---

## 10. Recommandation

# GO SOUS CONDITION

### Pourquoi GO

Le WP est techniquement bien posé et le risque principal est faible :

- la navigation a **une source unique** (`NAV` dans `Layout.tsx`) partagée par desktop et mobile —
  le changement est concentré, pas diffus ;
- les deux composants nécessaires (`Parcours`, `PersonalLibrary`) **existent déjà et acceptent
  les props** permettant un usage sans filtre d'univers ; aucune réécriture n'est requise ;
- la migration est **purement additive** — aucune route supprimée, donc aucun contenu rendu
  inaccessible ;
- le repli et la réécriture Vercel sont **déjà en place et éprouvés** : ACC-06 est structurellement
  satisfait ;
- la base de tests est solide (187 tests verts) et la seule régression attendue est **connue,
  localisée et légitime** : un test qui code en dur la décision produit désormais remplacée.

### Condition

**La condition est l'arbitrage du point D1 — la convention d'URL.**

C'est la seule question dont la réponse change ce qui est écrit dans le code, et elle ne relève
pas du Lead Full Stack : selon l'option retenue, le comportement d'arrivée des administrateurs sur
le site est modifié ou préservé. Développer sans cet arbitrage reviendrait à trancher moi-même une
décision produit.

D2 est souhaitable pour éviter un désaccord en recette. D3 peut être traité après le WP.

### Recommandation du Lead Full Stack sur D1

À titre d'avis technique — la décision restant au Product Owner : **l'option b** paraît le
meilleur compromis. Elle adopte les URL courtes voulues par la Product Specification pour les
trois nouvelles destinations, tout en préservant `SmartRedirect` sur `/`, dont la suppression
constituerait un changement de comportement non demandé et non couvert par les critères
d'acceptation.
