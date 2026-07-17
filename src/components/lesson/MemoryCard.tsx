export default function MemoryCard({ index, contenu }: { index: number; contenu: string }) {
  const empty = !contenu.trim()
  return (
    <div className={`rounded-xl p-4 border ${empty ? 'border-dashed border-[#E5E5E5] bg-[#FAFAFA]' : 'border-[#E5E5E5] bg-white'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A0A0A] text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#999999]">À retenir</span>
      </div>
      {empty ? (
        <p className="text-xs text-[#BBBBBB] italic">Point clé à venir.</p>
      ) : (
        <p className="text-sm text-[#0A0A0A] leading-relaxed">{contenu}</p>
      )}
    </div>
  )
}
