export default function Footer({ dark = false }: { dark?: boolean }) {
  const text = dark ? 'text-[#444444]' : 'text-[#AAAAAA]'
  const sub = dark ? 'text-[#666666]' : 'text-[#888888]'
  return (
    <footer className={`flex flex-col items-center ${text} text-xs leading-relaxed py-6`}>
      <div className="flex items-center gap-2 mb-1">
        <img src="/logo.png" alt="Hazumi" className="h-4 w-4 object-contain opacity-40" />
        <p>Projeté par <span className={sub}>Hazumi</span> — L'école du Ippon</p>
      </div>
      <p>Groupe DAKOTAlab · 59, rue de Ponthieu · 75008 Paris · SIREN 951 717 925</p>
      <div className="flex flex-wrap gap-3 gap-y-1 mt-2 justify-center text-xs">
        <a href="/mentions-legales" className="hover:underline opacity-70">Mentions légales</a>
        <span className="opacity-30">·</span>
        <a href="/confidentialite" className="hover:underline opacity-70">Politique de confidentialité</a>
        <span className="opacity-30">·</span>
        <a href="/cgu" className="hover:underline opacity-70">CGU</a>
        <span className="opacity-30">·</span>
        <a href="/dpa" className="hover:underline opacity-70">DPA</a>
      </div>
    </footer>
  )
}
