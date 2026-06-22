import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { getSpace } from './lib/space'
import type { Session } from '@supabase/supabase-js'
import Layout from './components/Layout'
import Login from './pages/Login'
import SpaceSelector from './pages/SpaceSelector'
import Accueil from './pages/eleve/Accueil'
import Profil from './pages/eleve/Profil'
import Progression from './pages/eleve/Progression'
import Entrainements from './pages/eleve/Entrainements'
import Effectifs from './pages/club/Effectifs'
import EleveDetail from './pages/club/EleveDetail'
import Rapport from './pages/club/Rapport'
import Professeurs from './pages/club/Professeurs'
import Planning from './pages/club/Planning'
import Competitions from './pages/club/Competitions'
import Bureau from './pages/club/Bureau'
import Bibliotheque from './pages/club/Bibliotheque'
import Onboarding from './pages/club/Onboarding'
import Confidentialite from './pages/Confidentialite'
import ResetPassword from './pages/ResetPassword'
import Agenda from './pages/club/Agenda'
import MonAgenda from './pages/eleve/MonAgenda'
import OnboardingJudoka from './pages/eleve/OnboardingJudoka'

function DefaultRedirect({ session: _session }: { session: Session }) {
  const space = getSpace()
  if (!space) return <Navigate to="/espace" />
  if (space === 'eleve') return <Navigate to="/eleve/accueil" />
  return <Navigate to="/club/effectifs" />
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confidentialite" element={<Confidentialite />} />

        {session ? (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/eleve/onboarding" element={<OnboardingJudoka />} />
            <Route path="/espace" element={<SpaceSelector />} />
            <Route element={<Layout />}>
              <Route path="/eleve/accueil" element={<Accueil />} />
              <Route path="/eleve/profil" element={<Profil />} />
              <Route path="/eleve/progression" element={<Progression />} />
              <Route path="/eleve/entrainements" element={<Entrainements />} />
              <Route path="/club/effectifs" element={<Effectifs />} />
              <Route path="/club/effectifs/:id" element={<EleveDetail />} />
              <Route path="/club/rapport" element={<Rapport />} />
              <Route path="/club/professeurs" element={<Professeurs />} />
              <Route path="/club/planning" element={<Planning />} />
              <Route path="/club/competitions" element={<Competitions />} />
              <Route path="/club/bureau" element={<Bureau />} />
              <Route path="/club/bibliotheque" element={<Bibliotheque />} />
              <Route path="/club/agenda" element={<Agenda />} />
              <Route path="/eleve/agenda" element={<MonAgenda />} />
            </Route>
            <Route path="*" element={<DefaultRedirect session={session} />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
