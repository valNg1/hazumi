import { Link } from 'react-router-dom'
import { playlistPath, type PlaylistRef } from '../lib/playlists'

// Bloc « Mes playlists » de l'accueil : chaque playlist ouvre SA playlist
// (route /bibliotheque?playlist=<id>), pas « Ma progression » (cf. issue #2).
export default function AccueilPlaylists({ playlists }: { playlists: PlaylistRef[] }) {
  const n = playlists.length
  const shown = playlists.slice(0, 3)
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-[#999999]">Mes playlists</span>
        <Link to="/parcours" aria-label="Voir toutes les playlists" className="text-[#CCCCCC] hover:text-[#C41230] transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <p className="text-3xl font-bold text-[#0A0A0A]">{n}</p>
      <p className="text-xs text-[#999999] mt-1 mb-2">playlist{n !== 1 ? 's' : ''}</p>
      {n === 0 ? (
        <p className="text-xs text-[#999999]">Aucune playlist</p>
      ) : (
        <div className="space-y-1">
          {shown.map((p) => (
            <Link
              key={p.id}
              to={playlistPath(p.id)}
              className="block text-xs text-[#0A0A0A] hover:text-[#C41230] transition-colors truncate"
            >
              {p.nom}
            </Link>
          ))}
          {n > shown.length && (
            <Link to="/parcours" className="block text-xs font-semibold text-[#C41230] hover:text-[#9B0E25]">
              +{n - shown.length} autre{n - shown.length > 1 ? 's' : ''}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
