import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ClubAccessModalProps {
  clubId: string | null
  onVerified: () => void
}

export default function ClubAccessModal({ clubId, onVerified }: ClubAccessModalProps) {
  const [numero, setNumero] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!numero.trim()) {
      setError('Entrez le N° d\'enregistrement.')
      setLoading(false)
      return
    }

    const { data, error: queryError } = await supabase
      .from('clubs')
      .select('id')
      .eq('numero_enregistrement', numero.trim())
      .single()

    if (queryError || !data) {
      setError('N° d\'enregistrement invalide.')
      setLoading(false)
      return
    }

    localStorage.setItem('club_numero_verified', numero.trim())
    setLoading(false)
    onVerified()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
      <div className="bg-[#1A1A1A] rounded-lg p-8 max-w-sm w-full border border-[#2A2A2A]">
        <h2 className="text-white text-xl font-bold mb-2">Accès Espace Club</h2>
        <p className="text-[#999999] text-sm mb-6">Entrez le N° d'enregistrement du club (dans les statuts).</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">N° d'enregistrement</label>
            <input
              type="text"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              placeholder="Ex: SARL2024-001234"
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
            />
          </div>

          {error && <p className="text-[#C41230] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white font-semibold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? '…' : 'Vérifier'}
          </button>
        </form>
      </div>
    </div>
  )
}
