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
    </footer>
  )
}
