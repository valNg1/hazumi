#!/bin/bash

# Script to run E2E tests for Hazumi onboarding flow
# This script ensures environment variables are properly set

echo "🧪 Démarrage des tests E2E Playwright..."
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Erreur: fichier .env.local non trouvé"
    echo "Créez d'abord un fichier .env.local avec:"
    echo "  VITE_SUPABASE_URL=..."
    echo "  VITE_SUPABASE_ANON_KEY=..."
    exit 1
fi

# Load environment variables from .env.local
export $(cat .env.local | grep -v '^#' | xargs)

echo "✅ Variables d'environnement chargées"
echo ""

# Run tests
npm run test:e2e

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Tous les tests sont passés!"
    echo "📊 Rapport HTML: playwright-report/index.html"
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "❌ Certains tests ont échoué"
    echo "📊 Rapport HTML: playwright-report/index.html"
    echo "=========================================="
    exit 1
fi
