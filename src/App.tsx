import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Accueil from './pages/eleve/Accueil'
import Profil from './pages/eleve/Profil'
import Progression from './pages/eleve/Progression'
import Shiai from './pages/eleve/Shiai'
import JudoKa from './pages/eleve/JudoKa'
import Kyu from './pages/eleve/Kyu'
import Lecon from './pages/eleve/Lecon'
import Entrainements from './pages/eleve/Entrainements'
import MonAgenda from './pages/eleve/MonAgenda'
import Messages from './pages/eleve/Messages'
import ConversationView from './pages/eleve/ConversationView'
import OnboardingJudoka from './pages/eleve/OnboardingJudoka'
import Confidentialite from './pages/Confidentialite'
import MentionsLegales from './pages/MentionsLegales'
import CGU from './pages/CGU'
import DPA from './pages/DPA'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/Dashboard'
import AdminMessages from './pages/admin/Messages'
import AdminMessagesList from './pages/admin/MessagesList'
import AdminCatalogue from './pages/admin/Catalogue'
import Messagerie from './pages/admin/Messagerie'
import MessagerieThread from './pages/admin/MessagerieThread'

function SmartRedirect() {
  const [redirect, setRedirect] = useState<string | null>(null)

  useEffect(() => {
    async function getRedirect() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRedirect('/login')
        return
      }

      const { data: judoka } = await supabase
        .from('judokas')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (judoka?.role === 'admin') {
        setRedirect('/admin/dashboard')
      } else {
        setRedirect('/eleve/accueil')
      }
    }

    getRedirect()
  }, [])

  if (!redirect) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <Navigate to={redirect} replace />
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
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/dpa" element={<DPA />} />

        {session ? (
          <>
            <Route path="/eleve/onboarding" element={<OnboardingJudoka />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/messages" element={<AdminMessagesList />} />
              <Route path="/admin/catalogue" element={<AdminCatalogue />} />
              <Route path="/admin/messages/:judokaId" element={<AdminMessages />} />
              <Route path="/admin/messagerie" element={<Messagerie />} />
              <Route path="/admin/messagerie/:conversationId" element={<MessagerieThread />} />
            </Route>
            <Route element={<Layout />}>
              <Route path="/eleve/accueil" element={<Accueil />} />
              <Route path="/eleve/profil" element={<Profil />} />
              <Route path="/eleve/progression" element={<Progression />} />
              <Route path="/eleve/shiai" element={<Shiai />} />
              <Route path="/eleve/judoka-culture" element={<JudoKa />} />
              <Route path="/eleve/kyu" element={<Kyu />} />
              {/* Les parcours ne sont plus un menu principal : ils vivent dans
                  chaque univers. On conserve l'URL historique via une redirection
                  pour ne pas casser les favoris / liens directs. */}
              <Route path="/eleve/parcours" element={<Navigate to="/eleve/accueil" replace />} />
              <Route path="/eleve/lecon/:ressourceId" element={<Lecon />} />
              <Route path="/eleve/entrainements" element={<Entrainements />} />
              <Route path="/eleve/agenda" element={<MonAgenda />} />
              <Route path="/eleve/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<ConversationView />} />
            </Route>
            <Route path="/" element={<SmartRedirect />} />
            <Route path="*" element={<SmartRedirect />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
