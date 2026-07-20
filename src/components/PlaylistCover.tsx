import { buildPlaylistCover } from '../lib/thumbnails'

interface Props {
  vignettes: string[]
  nom: string
  className?: string
}

/**
 * Couverture de playlist generee automatiquement a partir de son contenu.
 * Noir et blanc + voile sombre : cohérent avec l'identité premium Hazumi.
 * Aucune icone generique, aucun choix laisse a l'utilisateur.
 */
export default function PlaylistCover({ vignettes, nom, className = '' }: Props) {
  const cover = buildPlaylistCover(vignettes)

  if (cover.disposition === 'vide') {
    return (
      <div
        data-testid="playlist-cover"
        data-disposition="vide"
        className={`relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center ${className}`}
      >
        <span className="text-[10px] uppercase tracking-widest text-white/40">Playlist vide</span>
      </div>
    )
  }

  const grille =
    cover.disposition === 'unique' ? 'grid-cols-1'
    : cover.disposition === 'duo' ? 'grid-cols-2'
    : 'grid-cols-2 grid-rows-2'

  return (
    <div
      data-testid="playlist-cover"
      data-disposition={cover.disposition}
      className={`relative overflow-hidden bg-[#0A0A0A] ${className}`}
    >
      <div className={`grid ${grille} gap-px w-full h-full`}>
        {cover.vignettes.map((v, i) => (
          <img
            key={`${v}-${i}`}
            src={v}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-cover grayscale contrast-110"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
          />
        ))}
      </div>

      {/* Voile sombre : unifie des vignettes d'origines differentes. */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <span className="sr-only">Couverture de la playlist {nom}</span>
    </div>
  )
}
