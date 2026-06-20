import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface ClubInfo {
  nom: string
  adresse: string | null
  email_contact: string | null
  nom_representant: string | null
}

export default function Confidentialite() {
  const [searchParams] = useSearchParams()
  const [club, setClub] = useState<ClubInfo | null>(null)

  useEffect(() => {
    async function load() {
      const clubId = searchParams.get('club')
      let query = supabase.from('clubs').select('nom, adresse, email_contact, nom_representant')
      if (clubId) {
        const { data } = await query.eq('id', clubId).single()
        if (data) { setClub(data); return }
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: judoka } = await supabase.from('judokas').select('club_id').eq('user_id', user.id).single()
        if (judoka?.club_id) {
          const { data } = await query.eq('id', judoka.club_id).single()
          if (data) { setClub(data); return }
        }
      }
      const { data } = await query.limit(1).single()
      if (data) setClub(data)
    }
    load()
  }, [searchParams])

  const nom = club?.nom ?? '[Nom du club]'
  const adresse = club?.adresse ?? '[Adresse du club]'
  const email = club?.email_contact ?? '[Email de contact]'
  const representant = club?.nom_representant ?? '[Représentant légal]'
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/login" className="text-xs text-[#999999] hover:text-[#666666] transition-colors">← Retour</Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Politique de confidentialité</h1>
            <p className="text-sm text-[#999999]">Mise à jour le {date} — {nom}</p>
          </div>

          <Section title="1. Responsable de traitement">
            <p>Le responsable du traitement de vos données personnelles est :</p>
            <div className="mt-3 bg-[#FAFAFA] rounded-lg p-4 text-sm space-y-1">
              <p><strong>{nom}</strong></p>
              {adresse && <p>{adresse}</p>}
              <p>Représenté par : {representant}</p>
              <p>Contact : <a href={`mailto:${email}`} className="text-[#C41230] hover:underline">{email}</a></p>
            </div>
            <p className="mt-3">La plateforme Hazumi est mise à disposition par Hazumi, sous-traitant au sens de l'article 28 du RGPD, agissant sur instruction du club.</p>
          </Section>

          <Section title="2. Données collectées">
            <p>Dans le cadre de votre inscription et de l'utilisation de la plateforme, nous collectons :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li><strong>Identité :</strong> nom, prénom, date de naissance</li>
              <li><strong>Contact :</strong> adresse email, numéro de téléphone</li>
              <li><strong>Données sportives :</strong> niveau (ceinture), techniques maîtrisées, séances d'entraînement, objectifs</li>
              <li><strong>Documents administratifs :</strong> numéro de licence FFJDA, certificat médical, justificatif de paiement</li>
              <li><strong>Données de connexion :</strong> adresse email utilisée pour l'authentification</li>
              <li><strong>Contenus personnels :</strong> playlists vidéo créées sur la plateforme</li>
            </ul>
          </Section>

          <Section title="3. Finalités et bases légales">
            <div className="space-y-3 text-sm">
              <Row label="Gestion de l'adhésion au club" base="Exécution du contrat d'adhésion (art. 6.1.b RGPD)" />
              <Row label="Suivi de la progression technique" base="Intérêt légitime du club et du judoka (art. 6.1.f RGPD)" />
              <Row label="Gestion des documents d'inscription" base="Obligation légale / contrat (art. 6.1.b et c RGPD)" />
              <Row label="Accès aux contenus pédagogiques" base="Consentement (art. 6.1.a RGPD)" />
              <Row label="Communication avec les judokas" base="Intérêt légitime (art. 6.1.f RGPD)" />
            </div>
          </Section>

          <Section title="4. Durée de conservation">
            <p>Vos données sont conservées pendant toute la durée de votre adhésion au club, puis archivées 3 ans après la fin de celle-ci conformément aux obligations légales (gestion des litiges, obligations comptables). Les données de mineurs sont supprimées à leur majorité si l'adhésion a pris fin.</p>
          </Section>

          <Section title="5. Destinataires des données">
            <p>Vos données sont accessibles :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Aux professeurs et dirigeants de {nom} dans le cadre de leurs fonctions</li>
              <li>À Hazumi, sous-traitant technique, dans le strict cadre du contrat de sous-traitance</li>
              <li>À Supabase (hébergeur de la base de données), sur des serveurs situés dans l'Union Européenne</li>
            </ul>
            <p className="mt-3">Vos données ne sont jamais vendues ni cédées à des tiers à des fins commerciales.</p>
          </Section>

          <Section title="6. Mineurs">
            <p>Si vous créez un compte pour un enfant de moins de 15 ans, le parent ou tuteur légal doit valider la création du compte. {nom} s'engage à traiter les données des mineurs avec une attention particulière et à ne pas les exposer publiquement.</p>
          </Section>

          <Section title="7. Vos droits">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li><strong>Droit d'accès</strong> — obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> — corriger des données inexactes</li>
              <li><strong>Droit à l'effacement</strong> — demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> — récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> — vous opposer à certains traitements</li>
              <li><strong>Droit à la limitation</strong> — restreindre temporairement un traitement</li>
            </ul>
            <p className="mt-3">Pour exercer ces droits, contactez : <a href={`mailto:${email}`} className="text-[#C41230] hover:underline">{email}</a></p>
            <p className="mt-2 text-sm text-[#999999]">En cas de réponse insatisfaisante, vous pouvez adresser une réclamation à la CNIL (cnil.fr).</p>
          </Section>

          <Section title="8. Sécurité">
            <p>Hazumi met en œuvre les mesures de sécurité suivantes : chiffrement des données en transit (TLS) et au repos, authentification sécurisée, contrôle d'accès par rôle, sauvegardes automatiques, surveillance des accès.</p>
          </Section>

          <Section title="9. Contact">
            <p>Pour toute question relative à cette politique ou à vos données personnelles :</p>
            <p className="mt-2"><a href={`mailto:${email}`} className="text-[#C41230] hover:underline font-medium">{email}</a></p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-[#0A0A0A] mb-3">{title}</h2>
      <div className="text-sm text-[#444444] leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, base }: { label: string; base: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-[#F5F5F5] last:border-0">
      <span className="font-medium text-[#0A0A0A] sm:w-64 flex-shrink-0">{label}</span>
      <span className="text-[#666666]">{base}</span>
    </div>
  )
}
