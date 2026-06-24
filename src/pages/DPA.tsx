import { Link } from 'react-router-dom'

export default function DPA() {
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/login" className="text-xs text-[#999999] hover:text-[#666666] transition-colors">← Retour</Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Contrat de sous-traitance de données</h1>
            <p className="text-sm text-[#999999]">Article 28 du RGPD — Mise à jour le {date}</p>
          </div>

          <Section title="Contrat de sous-traitance de données personnelles">
            <p className="font-semibold text-[#0A0A0A] text-sm">Conformément à l'article 28 du Règlement Général sur la Protection des Données (RGPD)</p>
          </Section>

          <Section title="1. Parties au contrat">
            <div className="space-y-2 text-sm">
              <p><strong>Responsable de traitement :</strong> Le club de judo, représenté par son administrateur légal, ci-après « le Club ».</p>
              <p><strong>Sous-traitant :</strong> Hazumi, éditeur de la plateforme de suivi technique pour clubs de judo, immatriculée SIREN 951 717 925, ci-après « Hazumi ».</p>
            </div>
          </Section>

          <Section title="2. Objet du contrat">
            <p>Hazumi traite des données personnelles pour le compte du Club, dans le cadre exclusif de l'exploitation et de l'administration de la plateforme Hazumi.</p>
            <p className="mt-2">Le Club demeure responsable du traitement au sens du RGPD et détermine les finalités et moyens de ce traitement.</p>
          </Section>

          <Section title="3. Nature et catégories des données">
            <p>Les données personnelles traitées comprennent :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Identité : nom, prénom, date de naissance</li>
              <li>Contact : adresse email, numéro de téléphone</li>
              <li>Données sportives : niveau (ceinture), techniques maîtrisées, progression, objectifs</li>
              <li>Documents administratifs : numéro de licence FFJDA, certificat médical</li>
              <li>Données de connexion et d'utilisation : logs d'accès, adresses IP</li>
            </ul>
          </Section>

          <Section title="4. Nature des traitements">
            <p>Hazumi traite les données pour les finalités suivantes :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Gestion des profils et comptes judokas</li>
              <li>Suivi de la progression technique</li>
              <li>Gestion de la bibliothèque vidéo pédagogique</li>
              <li>Planification des séances d'entraînement</li>
              <li>Communication interne au club</li>
              <li>Génération de rapports et statistiques</li>
              <li>Sécurité et prévention de la fraude</li>
            </ul>
          </Section>

          <Section title="5. Durée du traitement">
            <p>Les données sont traitées pendant toute la durée du contrat et 3 ans après sa résiliation, conformément aux obligations légales de conservation et gestion des litiges.</p>
          </Section>

          <Section title="6. Obligations de Hazumi (sous-traitant)">
            <p>Hazumi s'engage à :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Traiter les données uniquement sur instruction documentée du Club</li>
              <li>Assurer la confidentialité du personnel ayant accès aux données</li>
              <li>Respecter les droits des personnes concernées (accès, rectification, suppression)</li>
              <li>Mettre en œuvre les mesures de sécurité appropriées :
                <ul className="mt-1 ml-6 space-y-1 list-disc list-inside">
                  <li>Chiffrement des données en transit (TLS) et au repos</li>
                  <li>Authentification sécurisée et gestion des accès par rôle</li>
                  <li>Sauvegardes automatiques et redondance</li>
                  <li>Surveillance des accès et des modifications</li>
                  <li>Plan de continuité et de récupération après sinistre</li>
                </ul>
              </li>
              <li>Notifier le Club sans délai en cas de violation ou incident de sécurité</li>
              <li>Supprimer ou restituer les données à l'issue du contrat</li>
              <li>Permettre les audits et vérifications de conformité du Club</li>
            </ul>
          </Section>

          <Section title="7. Obligations du Club (responsable de traitement)">
            <p>Le Club s'engage à :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Disposer d'une base légale pour chaque traitement de données</li>
              <li>Informer les personnes concernées de leurs droits et du traitement</li>
              <li>Répondre aux demandes d'exercice des droits (accès, rectification, suppression)</li>
              <li>Notifier Hazumi en cas de demande de droit d'une personne concernée</li>
              <li>Instruire Hazumi de manière claire sur les traitements autorisés</li>
            </ul>
          </Section>

          <Section title="8. Sous-traitants secondaires">
            <p>Hazumi s'appuie sur les sous-traitants suivants pour l'hébergement et l'infrastructure :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li><strong>Supabase</strong> (hébergeur de base de données) — serveurs situés dans l'UE</li>
              <li><strong>Vercel</strong> (hébergeur d'application) — serveurs situés dans l'UE</li>
            </ul>
            <p className="mt-3">Le Club autorise Hazumi à recourir à ces sous-traitants secondaires. Hazumi notifie le Club de tout changement de sous-traitant.</p>
          </Section>

          <Section title="9. Transferts de données hors UE">
            <p>Toutes les données sont stockées et traitées au sein de l'Union Européenne. Aucun transfert vers des pays tiers n'est effectué sans accord explicite du Club.</p>
          </Section>

          <Section title="10. Sécurité des données">
            <p>Hazumi applique les mesures de sécurité conformes à l'état de l'art, notamment :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Isolation logique des données par club</li>
              <li>Contrôle d'accès basé sur les rôles</li>
              <li>Audit et monitoring continu</li>
              <li>Plan de gestion des incidents de sécurité</li>
            </ul>
          </Section>

          <Section title="11. Audits et contrôles">
            <p>Le Club conserve le droit de :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Demander à Hazumi des certifications de sécurité (SOC 2, ISO 27001, etc.)</li>
              <li>Réaliser des audits de conformité, avec préavis raisonnable</li>
              <li>Consulter les registres de traitement de Hazumi</li>
            </ul>
          </Section>

          <Section title="12. Durée et résiliation">
            <p>Ce contrat a une durée indéterminée et peut être résilié par l'une ou l'autre partie avec un préavis de 30 jours.</p>
            <p className="mt-2">À la résiliation, Hazumi restitue ou supprime les données selon les instructions du Club.</p>
          </Section>

          <Section title="13. Modification du contrat">
            <p>Hazumi peut modifier ce contrat avec un préavis de 30 jours. Le Club a le droit de résilier sans pénalité si les modifications affectent la sécurité ou la conformité des données.</p>
          </Section>

          <Section title="14. Responsabilité">
            <p>Hazumi est responsable du respect de ses obligations de sous-traitant. En cas de violation, Hazumi indemnisera le Club des dommages directs résultant du non-respect du RGPD.</p>
          </Section>

          <Section title="15. Contact et réclamations">
            <p>Pour toute question relative à ce contrat ou au traitement des données :</p>
            <p className="mt-2"><a href="mailto:contact@hazumi.fr" className="text-[#C41230] hover:underline">contact@hazumi.fr</a></p>
            <p className="mt-2 text-sm text-[#999999]">En cas de réclamation, le Club peut adresser une plainte à la CNIL (www.cnil.fr).</p>
          </Section>

          <div className="mt-8 pt-8 border-t border-[#E5E5E5]">
            <p className="text-xs text-[#999999]">Dernière mise à jour : {date}</p>
            <p className="text-xs text-[#999999] mt-2">Ce contrat s'ajoute aux conditions générales d'utilisation et à la politique de confidentialité de Hazumi.</p>
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
