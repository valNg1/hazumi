# Tests E2E - Parcours d'Onboarding Hazumi

## 📋 Description

Suite de tests E2E complète pour valider le parcours d'onboarding d'un dirigeant de club de judo dans Hazumi.

### Scénarios couverts

1. **Création de compte** ✅
   - Navigation vers /login
   - Remplissage du formulaire d'inscription
   - Acceptation des CGU et politique de confidentialité
   - Création du compte et redirection

2. **Onboarding club** ✅
   - Navigation vers /onboarding
   - Vérification que le DPA n'est pas coché initialement
   - Remplissage des infos du club (nom, adresse, email, représentant)
   - Vérification que le lien DPA s'ouvre dans un nouvel onglet
   - Acceptation du DPA
   - Soumission du formulaire

3. **Vérification en base de données** ✅
   - Vérification que l'utilisateur est créé
   - Vérification que le club est créé
   - Vérification que `dpa_accepted_at` et `dpa_accepted_by` sont enregistrés

4. **Accès au dashboard** ✅
   - Vérification que le dirigeant accède au dashboard après onboarding
   - Vérification que les pages se chargent correctement

5. **Protection de route** ✅
   - Vérification qu'un utilisateur sans onboarding complété est redirigé vers /onboarding
   - Vérification qu'un utilisateur non connecté est redirigé vers /login

6. **Nettoyage** ✅
   - Suppression automatique du compte et du club de test après exécution

## 🚀 Installation

```bash
# Installer les dépendances (si non fait)
npm install

# Installer Playwright (si non fait)
npm install -D @playwright/test
```

## 🧪 Exécution des tests

### Mode standard
```bash
npm run test:e2e
```

### Mode UI (interface Playwright)
```bash
npm run test:e2e:ui
```

### Mode debug (avec inspection pas à pas)
```bash
npm run test:e2e:debug
```

### Avec le script helper
```bash
chmod +x e2e/run-tests.sh
./e2e/run-tests.sh
```

## 📊 Résultats des tests

Après exécution, un rapport HTML est généré :

```
playwright-report/index.html
```

Ouvrez ce fichier dans un navigateur pour voir :
- ✅ Tests réussis
- ❌ Tests échoués
- 📸 Screenshots des erreurs
- 🎬 Enregistrements vidéo des actions
- ⏱️ Durée d'exécution

## 📋 Checklist avant de lancer

- [ ] Le serveur de développement est arrêté (Playwright le démarre automatiquement)
- [ ] Les variables d'environnement sont définies dans `.env.local` :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase Admin SDK est accessible (pour le nettoyage)
- [ ] La base de données Supabase est accessible en écriture

## 🔍 Dépannage

### Les tests ne trouvent pas les éléments
- Augmentez les timeouts dans `playwright.config.ts`
- Utilisez `--debug` pour inspecter les éléments

### Les tests échouent sur l'authentification
- Vérifiez que les variables Supabase sont correctes
- Vérifiez que l'authentification par email est activée dans Supabase

### Le nettoyage échoue
- Assurez-vous que vous disposez des permissions Admin sur Supabase
- Vérifiez que la clé Supabase utilisée a les permissions d'admin

## 📝 Format du rapport

À la fin de l'exécution, le test affiche un rapport console :

```
============================================================
📋 RAPPORT DE TEST E2E - ONBOARDING DIRIGEANT
============================================================

Détails des étapes:
  ✅ Navigation vers /login
  ✅ Formulaire d'inscription visible
  ...
  ❌ Lien DPA ne s'ouvre pas correctement

------------------------------------------------------------
Total tests : 25
✅ Réussis : 24
❌ Échoués : 1
------------------------------------------------------------
📊 Taux de réussite : 96.0%

⚠️  1 test(s) échoué(s) - Vérifier les détails ci-dessus
============================================================
```

## 🛠️ Personnalisation

Pour modifier les données de test, éditez le début du fichier `onboarding.spec.ts` :

```typescript
const testEmail = `test-dirigeant-${Date.now()}@test.fr`
const testPassword = 'TestPassword123!'
const testDOB = '1985-05-15'
const testClubName = `Club Test ${Date.now()}`
// ...
```

## 📚 Documentation Playwright

- [Docs officielles](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 🤝 Support

Pour des questions ou des problèmes, consultez :
- Les logs de Playwright (`playwright-report/`)
- Les screenshots des erreurs
- Les enregistrements vidéo des étapes
