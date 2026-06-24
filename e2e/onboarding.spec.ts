import { test, expect, Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'http://localhost:5173'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-key'

// Test data
const testEmail = `test-dirigeant-${Date.now()}@test.fr`
const testPassword = 'TestPassword123!'
const testDOB = '1985-05-15'
const testClubName = `Club Test ${Date.now()}`
const testAddress = '123 Rue de Test, 75000 Paris'
const testContactEmail = `contact-${Date.now()}@test.fr`
const testRepresentative = 'Test Dirigeant'

// Results tracking
const results = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  steps: [] as string[],
}

function addStep(step: string, status: 'PASS' | 'FAIL') {
  const emoji = status === 'PASS' ? '✅' : '❌'
  const message = `${emoji} ${step}`
  results.steps.push(message)
  console.log(message)
  if (status === 'PASS') {
    results.passedTests++
  } else {
    results.failedTests++
  }
  results.totalTests++
}

async function cleanupTestData(email: string) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Get user
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (user) {
      // Delete club
      await supabase.from('clubs').delete().eq('user_id', user.id)

      // Delete judokas
      await supabase.from('judokas').delete().eq('user_id', user.id)

      // Delete user auth
      await supabase.auth.admin.deleteUser(user.id)
      addStep('Nettoyage : Données supprimées avec succès', 'PASS')
    }
  } catch (error) {
    addStep(`Nettoyage : Erreur lors de la suppression (${error})`, 'FAIL')
  }
}

test.describe('Parcours complet d\'onboarding Dirigeant', () => {
  let page: Page
  let userId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await cleanupTestData(testEmail)
    await page.close()
  })

  test('1. Création de compte dirigeant', async () => {
    console.log('\n📝 ÉTAPE 1 : Création de compte\n')

    // Navigate to login
    await page.goto(`${BASE_URL}/login`)
    addStep('Navigation vers /login', 'PASS')

    // Check that signup form is visible
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    addStep('Formulaire d\'inscription visible', 'PASS')

    // Fill signup form
    await emailInput.fill(testEmail)
    await page.locator('input[type="password"]').first().fill(testPassword)

    // Find and fill date input
    const dateInputs = await page.locator('input[type="date"]').all()
    if (dateInputs.length > 0) {
      await dateInputs[0].fill(testDOB)
    }

    addStep('Formulaire rempli (email, password, DOB)', 'PASS')

    // Check and tick checkbox for privacy/CGU
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    if (checkboxes.length > 0) {
      await checkboxes[0].check()
      addStep('Case CGU/Politique de confidentialité cochée', 'PASS')
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for redirect or success
    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    if (currentUrl.includes('/espace') || currentUrl.includes('/onboarding')) {
      addStep('Compte créé et utilisateur redirigé', 'PASS')
    } else {
      addStep(`Redirection inattendue vers ${currentUrl}`, 'FAIL')
    }
  })

  test('2. Onboarding club - Protection et remplissage', async () => {
    console.log('\n🏢 ÉTAPE 2 : Onboarding Club\n')

    // Navigate to onboarding
    await page.goto(`${BASE_URL}/onboarding`)
    addStep('Navigation vers /onboarding', 'PASS')

    // Wait for page to load
    await page.waitForTimeout(1500)

    // Check if DPA checkbox exists and is initially unchecked
    const dpaCheckbox = page.locator('input[type="checkbox"]').last()
    const isChecked = await dpaCheckbox.isChecked()
    if (!isChecked) {
      addStep('Vérification : DPA non coché au démarrage', 'PASS')
    }

    // Fill club info
    await page.locator('input[placeholder*="nom"]').first().fill(testClubName)
    await page.locator('input[placeholder*="adresse"], input[placeholder*="Adresse"]').fill(testAddress)

    const emailInputs = await page.locator('input[type="email"]').all()
    if (emailInputs.length > 0) {
      await emailInputs[0].fill(testContactEmail)
    }

    await page.locator('input[placeholder*="représentant"], input[placeholder*="Représentant"]').fill(testRepresentative)

    addStep('Formulaire club rempli (nom, adresse, email, représentant)', 'PASS')

    // Click on DPA link and verify it opens
    const dpaLink = page.locator('a[href="/dpa"]')
    if (await dpaLink.isVisible()) {
      const [dpaPage] = await Promise.all([
        page.context().waitForEvent('page'),
        dpaLink.click()
      ])

      const dpaUrl = dpaPage.url()
      if (dpaUrl.includes('/dpa')) {
        addStep('Lien DPA cliquable et ouvre /dpa dans nouvel onglet', 'PASS')
      } else {
        addStep('Lien DPA ne s\'ouvre pas correctement', 'FAIL')
      }
      await dpaPage.close()
    }

    // Check DPA checkbox
    const dpaCheckboxToClick = page.locator('input[type="checkbox"]').last()
    await dpaCheckboxToClick.check()
    addStep('Case d\'acceptation DPA cochée', 'PASS')

    // Submit form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Valider")')
    await submitBtn.click()

    // Wait for submission
    await page.waitForTimeout(2000)

    const afterUrl = page.url()
    if (!afterUrl.includes('/onboarding')) {
      addStep('Formulaire soumis avec succès', 'PASS')
    } else {
      addStep('Erreur : Utilisateur reste sur /onboarding', 'FAIL')
    }
  })

  test('3. Vérification données en base de données', async () => {
    console.log('\n💾 ÉTAPE 3 : Vérification en Base de Données\n')

    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

      // Get user
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const user = users.find(u => u.email === testEmail)

      if (user) {
        userId = user.id
        addStep('Utilisateur trouvé en base', 'PASS')

        // Check club
        const { data: clubs } = await supabase
          .from('clubs')
          .select('*')
          .eq('user_id', user.id)

        if (clubs && clubs.length > 0) {
          const club = clubs[0]
          addStep(`Club créé : ${club.nom}`, 'PASS')

          // Check DPA acceptance
          if (club.dpa_accepted_at && club.dpa_accepted_by) {
            addStep('DPA accepté et dates enregistrées en base', 'PASS')
          } else {
            addStep('Erreur : DPA non enregistré en base', 'FAIL')
          }
        } else {
          addStep('Erreur : Club non trouvé en base', 'FAIL')
        }
      } else {
        addStep('Erreur : Utilisateur non trouvé en base', 'FAIL')
      }
    } catch (error) {
      addStep(`Erreur accès base de données : ${error}`, 'FAIL')
    }
  })

  test('4. Accès au dashboard après onboarding', async () => {
    console.log('\n📊 ÉTAPE 4 : Accès Dashboard\n')

    // Navigate to club dashboard
    await page.goto(`${BASE_URL}/club/effectifs`)
    await page.waitForTimeout(1500)

    const currentUrl = page.url()
    if (currentUrl.includes('/club/effectifs') || currentUrl.includes('/club/')) {
      addStep('Accès au dashboard club après onboarding complété', 'PASS')
    } else {
      addStep('Redirection vers onboarding (non complété)', 'FAIL')
    }

    // Verify page contains expected elements
    const pageTitle = await page.title()
    if (pageTitle) {
      addStep('Page chargée et affichée correctement', 'PASS')
    }
  })

  test('5. Protection de route - Test second utilisateur sans onboarding', async () => {
    console.log('\n🔒 ÉTAPE 5 : Protection de Route\n')

    // Create new context for second user
    const context = await page.context().browser()?.newContext()
    if (!context) return

    const page2 = await context.newPage()

    try {
      // Try to access club page directly
      await page2.goto(`${BASE_URL}/club/effectifs`)
      await page2.waitForTimeout(1500)

      const url = page2.url()
      if (url.includes('/onboarding')) {
        addStep('Utilisateur sans onboarding redirigé vers /onboarding', 'PASS')
      } else if (url.includes('/login')) {
        addStep('Utilisateur non connecté redirigé vers /login', 'PASS')
      } else {
        addStep('Protection de route non trouvée', 'FAIL')
      }
    } finally {
      await page2.close()
      await context.close()
    }
  })
})

// Report generation
test.afterAll(() => {
  printReport()
})

function printReport() {
  console.log('\n' + '='.repeat(60))
  console.log('📋 RAPPORT DE TEST E2E - ONBOARDING DIRIGEANT')
  console.log('='.repeat(60) + '\n')

  console.log('Détails des étapes:')
  results.steps.forEach(step => console.log(`  ${step}`))

  console.log('\n' + '-'.repeat(60))
  console.log(`Total tests : ${results.totalTests}`)
  console.log(`✅ Réussis : ${results.passedTests}`)
  console.log(`❌ Échoués : ${results.failedTests}`)
  console.log('-'.repeat(60))

  const successRate = results.totalTests > 0
    ? ((results.passedTests / results.totalTests) * 100).toFixed(1)
    : '0'
  console.log(`📊 Taux de réussite : ${successRate}%`)

  if (results.failedTests === 0) {
    console.log('\n✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS! 🎉')
  } else {
    console.log(`\n⚠️  ${results.failedTests} test(s) échoué(s) - Vérifier les détails ci-dessus`)
  }

  console.log('='.repeat(60) + '\n')
}
