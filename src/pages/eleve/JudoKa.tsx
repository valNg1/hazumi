import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import CatalogueSection from '../../components/CatalogueSection'

export default function JudoKa() {
  const [hasContent, setHasContent] = useState<boolean | null>(null)

  useEffect(() => {
    supabase
      .from('catalogue_hazumi')
      .select('id', { count: 'exact', head: true })
      .eq('parcours', 'judo-ka')
      .then(({ count }) => setHasContent((count ?? 0) > 0))
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-2">🎌 Judo-Ka</h1>
        <p className="text-[#666666] text-sm">Culture, histoire et philosophie du judo</p>
      </div>

      <CatalogueSection parcours="judo-ka" />

      {hasContent === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <p className="text-2xl font-semibold text-amber-900 mb-4">Contenu en cours de préparation</p>
          <p className="text-amber-800 mb-6">Bientôt : l'histoire du judo, ses valeurs, sa philosophie et ses grandes figures</p>
          <div className="inline-block bg-white rounded-lg px-6 py-4 text-sm text-amber-700">
            ✨ À venir très prochainement
          </div>
        </div>
      )}
    </div>
  )
}
