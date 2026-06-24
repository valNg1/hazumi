import { Link } from 'react-router-dom'

export default function CGU() {
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/login" className="text-xs text-[#999999] hover:text-[#666666] transition-colors">← Retour</Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Conditions Générales d'Utilisation</h1>
            <p className="text-sm text-[#999999]">Mise à jour le {date} — Hazumi</p>
          </div>

          <Section title="1. Objet">
            <p>Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de la plateforme Hazumi (le « Service »), une application web de suivi technique pour clubs de judo.</p>
          </Section>

          <Section title="2. Accès au Service">
            <p>L'accès au Service est réservé aux :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li><strong>Clubs de judo</strong> : via un compte administrateur créé lors de l'onboarding</li>
              <li><strong>Judokas</strong> : via une invitation du club ou inscription indépendante</li>
              <li><strong>Professeurs et encadrants</strong> : via un compte créé par le club</li>
            </ul>
          </Section>

          <Section title="3. Création et sécurité du compte">
            <p>L'utilisateur s'engage à :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Fournir des informations exactes et à jour lors de l'inscription</li>
              <li>Garder son mot de passe confidentiel et sécurisé</li>
              <li>Notifier immédiatement Hazumi en cas d'accès non autorisé à son compte</li>
              <li>Ne pas partager son compte avec d'autres utilisateurs</li>
            </ul>
          </Section>

          <Section title="4. Responsabilité des contenus">
            <p>L'utilisateur s'engage à ne pas :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Télécharger de contenus illégaux, diffamatoires, harcelants ou offensants</li>
              <li>Utiliser le Service pour des activités frauduleuses ou contraires à la loi</li>
              <li>Accéder à des données auxquelles il n'a pas droit</li>
              <li>Réaliser des attaques informatiques ou essais de piratage</li>
              <li>Modifier ou reproduire le Service sans autorisation</li>
            </ul>
          </Section>

          <Section title="5. Propriété intellectuelle">
            <p>Tous les contenus du Service (logos, textes, images, codes, structures) sont la propriété de Hazumi ou de ses partenaires, protégés par les droits d'auteur et les marques déposées.</p>
            <p className="mt-3">Les utilisateurs disposent d'une licence limitée d'utilisation à titre personnel et non-commercial. Toute reproduction ou distribution est interdite sans autorisation écrite.</p>
          </Section>

          <Section title="6. Limitation de responsabilité">
            <p>Hazumi ne garantit pas :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Que le Service fonctionnera sans interruption ou erreur</li>
              <li>Que les contenus sont exempts de virus ou défaut technique</li>
              <li>L'exhaustivité ou l'exactitude des données (sauf responsabilité contractuelle avec le club)</li>
            </ul>
            <p className="mt-3">Hazumi ne sera pas responsable des dommages directs ou indirects résultant de l'utilisation ou l'impossibilité d'utiliser le Service.</p>
          </Section>

          <Section title="7. Modification du Service">
            <p>Hazumi se réserve le droit de modifier ou interrompre le Service à tout moment, avec préavis raisonnable. Les modifications importantes seront communiquées aux utilisateurs.</p>
          </Section>

          <Section title="8. Tarification et paiement">
            <p>Les tarifs et modalités de paiement sont disponibles sur le site hazumi.fr. Le paiement s'effectue de manière sécurisée via des prestataires agréés. En cas de défaut de paiement, l'accès au compte pourra être suspendu.</p>
          </Section>

          <Section title="9. Résiliation">
            <p>L'utilisateur peut résilier son compte à tout moment en contactant le support. Le club peut fermer le compte d'un judoka en cas de non-respect des CGU. Les données seront supprimées selon la politique de confidentialité.</p>
          </Section>

          <Section title="10. Données personnelles">
            <p>Le traitement des données personnelles est décrit dans la <Link to="/confidentialite" target="_blank" className="text-[#C41230] hover:underline">politique de confidentialité</Link>.</p>
          </Section>

          <Section title="11. Conformité légale">
            <p>Le Service est fourni dans le respect des lois applicables, en particulier :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>RGPD (protection des données)</li>
              <li>Droit des contrats français</li>
              <li>Loi sur la consommation</li>
              <li>Loi sur le commerce électronique</li>
            </ul>
          </Section>

          <Section title="12. Contact et support">
            <p>Pour toute question ou réclamation : <a href="mailto:contact@hazumi.fr" className="text-[#C41230] hover:underline">contact@hazumi.fr</a></p>
          </Section>

          <div className="mt-8 pt-8 border-t border-[#E5E5E5]">
            <p className="text-xs text-[#999999]">Dernière mise à jour : {date}</p>
          </div>
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
