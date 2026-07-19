import { NavLink } from 'react-router-dom'
import { MON_ESPACE_SECTIONS } from '../lib/monEspaceSections'


/**
 * Navigation interne de Mon espace. Elle evite le retour arriere systematique :
 * depuis n'importe quelle rubrique, les autres sont a un clic.
 */
export default function MonEspaceNav() {
  return (
    <nav aria-label="Mon espace" className="mb-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto">
      <ul className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap">
        {MON_ESPACE_SECTIONS.map((s) => (
          <li key={s.to}>
            <NavLink
              to={s.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap border transition-colors ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] font-semibold'
                    : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#C41230] hover:text-[#C41230]'
                }`
              }
            >
              <span aria-hidden="true">{s.icone}</span>
              {s.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
