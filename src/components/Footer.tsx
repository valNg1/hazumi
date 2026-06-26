export default function Footer({ dark = false }: { dark?: boolean }) {
  const text = dark ? 'text-[#444444]' : 'text-[#AAAAAA]'
  return (
    <footer className={`flex flex-col items-center ${text} text-xs leading-relaxed py-6`}>
      <img src="/logo.png" alt="Hazumi" className="h-6 w-6 object-contain opacity-50 mb-3" />
      <p>Hazumi - l'Ecole du Ippon · Projeté par DAKOTAlab · <a href="mailto:contact@hazumi.org" className="hover:underline">contact@hazumi.org</a></p>
      <div className="flex flex-wrap gap-3 gap-y-1 mt-3 justify-center text-xs">
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
