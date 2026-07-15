import { useState } from 'react'
import Parcours from '../pages/eleve/Parcours'
import PersonalLibrary from './PersonalLibrary'

type Univers = 'shiai' | 'kyu' | 'judo-ka'
type Tab = 'parcours' | 'dojo'

interface Props {
  univers: Univers
  titre: string
  icone: string
  intro: string
}

// Un univers = Parcours Hazumi (contenu officiel) + Mon Dojo (contenu personnel).
// Les deux cohabitent mais ne sont JAMAIS melanges.
export default function UniversTabs({ univers, titre, icone, intro }: Props) {
  const [tab, setTab] = useState<Tab>('parcours')

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-[#E5E5E5]">
        <button
          onClick={() => setTab('parcours')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === 'parcours' ? 'text-[#0A0A0A] border-[#C41230]' : 'text-[#666666] border-transparent hover:text-[#0A0A0A]'
          }`}
        >
          Parcours Hazumi
        </button>
        <button
          onClick={() => setTab('dojo')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === 'dojo' ? 'text-[#0A0A0A] border-[#C41230]' : 'text-[#666666] border-transparent hover:text-[#0A0A0A]'
          }`}
        >
          🥋 Mon Dojo
        </button>
      </div>

      {tab === 'parcours' ? (
        <Parcours univers={univers} titre={titre} icone={icone} intro={intro} />
      ) : (
        <PersonalLibrary
          parcours={univers}
          personalOnly
          titre="Mon Dojo"
          icone="🥋"
          description="Ta bibliothèque personnelle : tes vidéos, tes tags, tes playlists."
        />
      )}
    </div>
  )
}
