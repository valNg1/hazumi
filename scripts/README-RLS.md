# 🔒 Test d'Isolation RLS Multi-Club

Script de validation de l'isolation Row Level Security (RLS) entre clubs dans Supabase.

## 📋 Objectif

Valider que les données d'un club ne sont pas accessibles par les utilisateurs d'un autre club, en testant les policies RLS sur toutes les tables sensibles.

## 🚀 Utilisation

### Configuration

Assurez-vous que votre `.env.local` contient :

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Important** : La clé `SUPABASE_SERVICE_ROLE_KEY` doit être obtenue depuis le dashboard Supabase (Settings → API → Service role secret).

### Exécution

```bash
npm run test:rls
```

## 🔍 Ce que le test valide

Le script :

1. **Crée deux clubs de test** :
   - Club Test A
   - Club Test B

2. **Crée un judoka dans chaque club** avec des comptes Supabase distincts

3. **Se connecte en tant que Judoka A** (Club A)

4. **Teste l'isolation RLS** en tentant de :
   - **Lire** les données du Club B sur les tables sensibles
   - **Écrire/Modifier** les données du Club B

5. **Valide que chaque tentative** retourne zéro résultat ou une erreur RLS

6. **Affiche un rapport clair** avec le statut de chaque table :
   ```
   ✅ TABLE judokas — isolation OK
   ✅ TABLE clubs — isolation OK
   ❌ TABLE videos — FAILLE : un judoka Club A peut lire les vidéos du Club B
   ```

7. **Nettoie automatiquement** les deux clubs et judokas de test

## 📊 Rapport de résultat

Exemple d'output :

```
======================================================================
🔒 TEST D'ISOLATION RLS MULTI-CLUB - SUPABASE
======================================================================

📊 ÉTAPE 1 : Création des données de test

✅ Club A créé : Club Test A 1234567890
✅ Club B créé : Club Test B 1234567890
✅ Judoka A créé : judoka-a-1234567890@test.fr
✅ Judoka B créé : judoka-b-1234567890@test.fr

🔐 ÉTAPE 2 : Test d'isolation RLS

✅ Connecté en tant que Judoka A (Club A)
✅ judokas             - READ: BLOQUÉ
✅ clubs              - READ: BLOQUÉ
✅ videos             - READ: BLOQUÉ
✅ courses            - READ: BLOQUÉ
✅ seances            - READ: BLOQUÉ

📋 ÉTAPE 3 : Rapport des tests

------------ Résultats détaillés -----------------------------------
✅ RÉUSSIS : 20/20
❌ ÉCHOUÉS : 0/20
📈 TAUX : 100.0%

✅ ISOLATION RLS VALIDÉE - AUCUNE FAILLE DÉTECTÉE
======================================================================
```

## 🐛 Si une faille est détectée

Si le test détecte une faille, le rapport affichera :

```
⚠️  FAILLES DE SÉCURITÉ DÉTECTÉES!
Les policies RLS suivantes doivent être révisées:
  - videos
  - courses
```

### Procédure de correction

1. **Identifier la table fautive** d'après le rapport
2. **Aller dans Supabase Dashboard** → RLS Policies
3. **Corriger la policy** pour ajouter la vérification `WHERE club_id = auth.user_id` (ou une vérification similaire)
4. **Relancer le test** pour confirmer la correction :
   ```bash
   npm run test:rls
   ```

## 📝 Tables testées

Par défaut, le script teste :

- `judokas` - Données des judokas
- `clubs` - Informations des clubs
- `videos` - Vidéos pédagogiques
- `courses` - Cours du club
- `seances` - Séances d'entraînement
- `technique_mastery` - Progression technique
- `competitions` - Compétitions
- `professeurs` - Professeurs du club
- `playlists` - Playlists vidéo
- `presences` - Présences aux séances

Pour ajouter d'autres tables, éditez le tableau `tablesToTest` dans le script.

## ⚙️ Architecture du test

```
┌─────────────────────────────────────────┐
│  1. CREATE TEST DATA                    │
│  ├─ Club A                              │
│  ├─ Club B                              │
│  ├─ Judoka A (Club A)                   │
│  └─ Judoka B (Club B)                   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  2. LOGIN AS JUDOKA A                   │
│  └─ Authenticate with Supabase          │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  3. TEST RLS ISOLATION                  │
│  ├─ Attempt READ from Club B            │
│  ├─ Attempt UPDATE on Club B            │
│  └─ Check if blocked ✓                  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  4. DISPLAY RESULTS                     │
│  └─ Summary report with status          │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  5. CLEANUP                             │
│  ├─ Delete judokas                      │
│  ├─ Delete clubs                        │
│  └─ Delete auth users                   │
└─────────────────────────────────────────┘
```

## 🔐 Sécurité

Ce script :

- ✅ Ne modifie pas les données de production
- ✅ Crée des données de test avec timestamps uniques
- ✅ Nettoie automatiquement après exécution
- ✅ Utilise des comptes Supabase distincts pour chaque club
- ✅ Teste les véritables permissions RLS (pas de mocks)

## 🔄 À relancer après

Relancez ce test après :

- ✏️ Modification du schéma RLS
- ➕ Ajout de nouvelles tables
- 🔄 Changements dans la logique multi-club
- 🚀 Déploiement en production

## 📚 Documentation

- [Supabase RLS Docs](https://supabase.com/docs/learn/auth-deep-dive/row-level-security)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
