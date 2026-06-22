export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <a href="/login" className="text-xs text-[#999999] hover:text-[#666666] mb-8 inline-block">← Retour</a>

        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Mentions légales</h1>
        <p className="text-xs text-[#999999] mb-10">Dernière mise à jour : juin 2026</p>

        <div className="space-y-8 text-sm text-[#444444] leading-relaxed">

          <Section title="Éditeur du site">
            <p>Le service Hazumi est édité par :</p>
            <p className="mt-2">
              <strong>Valéry Nguyen-Ba</strong><br />
              Micro-entrepreneur<br />
              Email : contact@hazumi.app
            </p>
          </Section>

          <Section title="Hébergement">
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.<br />
              La base de données est hébergée par <strong>Supabase Inc.</strong> sur des serveurs situés dans l'Union Européenne (région eu-west-1).
            </p>
          </Section>

          <Section title="Données personnelles">
            <p>
              Dans le cadre de l'utilisation de Hazumi, les données suivantes sont collectées et traitées :
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Nom, prénom, date de naissance</li>
              <li>Adresse email et numéro de téléphone</li>
              <li>Numéro de licence FFJDA</li>
              <li>Données de progression technique (techniques maîtrisées, ceinture)</li>
              <li>Photos de profil et documents d'inscription (certificat médical)</li>
            </ul>
            <p className="mt-3">
              Ces données sont collectées avec votre consentement, dans le seul but de fournir le service Hazumi. Elles ne sont ni vendues ni transmises à des tiers, à l'exception des prestataires techniques nécessaires au fonctionnement du service (Supabase, Vercel, Stripe).
            </p>
          </Section>

          <Section title="Paiement">
            <p>
              Les paiements sont traités par <strong>Stripe Inc.</strong> Les données bancaires ne transitent jamais par les serveurs Hazumi et sont gérées exclusivement par Stripe conformément à la norme PCI-DSS.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Hazumi utilise uniquement des cookies techniques nécessaires au fonctionnement de l'authentification (session utilisateur). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </Section>

          <Section title="Vos droits (RGPD)">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de votre compte et de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@hazumi.app" className="text-[#C41230] hover:underline">contact@hazumi.app</a>
            </p>
            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-[#C41230] hover:underline">www.cnil.fr</a>
            </p>
          </Section>

          <Section title="Durée de conservation">
            <p>
              Vos données sont conservées pendant toute la durée de votre abonnement actif, puis supprimées dans un délai de 3 ans après la résiliation, sauf obligation légale contraire.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative à la présente politique ou à vos données personnelles :<br />
              <a href="mailto:contact@hazumi.app" className="text-[#C41230] hover:underline">contact@hazumi.app</a>
            </p>
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#0A0A0A] mb-3 pb-2 border-b border-[#E5E5E5]">{title}</h2>
      {children}
    </div>
  )
}
