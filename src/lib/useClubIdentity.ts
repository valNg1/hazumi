import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useClubIdentity() {
  const [clubLogo, setClubLogo] = useState<string | null>(null)
  const [clubNom, setClubNom] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('clubs').select('nom, logo_url').limit(1).single()
      .then(({ data }) => {
        if (data) { setClubLogo(data.logo_url ?? null); setClubNom(data.nom ?? null) }
      })
  }, [])

  return { clubLogo, clubNom, logo: clubLogo ?? '/logo.png' }
}
