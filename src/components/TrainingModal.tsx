import { useState } from 'react'
import { toStr } from '../lib/training'
import type { TrainingForm } from '../lib/training'

interface TrainingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (form: TrainingForm) => Promise<void>
  onSuccess?: () => void | Promise<void>
  isLoading?: boolean
}

const TYPES = ['judo', 'ppg', 'cardio', 'récupération', 'autre'] as const
const JOURS = [
  { key: 'lun', label: 'L' },
  { key: 'mar', label: 'M' },
  { key: 'mer', label: 'Me' },
  { key: 'jeu', label: 'J' },
  { key: 'ven', label: 'V' },
  { key: 'sam', label: 'S' },
  { key: 'dim', label: 'D' },
]

export default function TrainingModal({ isOpen, onClose, onSave, onSuccess, isLoading }: TrainingModalProps) {
  const [form, setForm] = useState<TrainingForm>({
    type: 'judo',
    heureDebut: '',
    heureFin: '',
    isRecurrent: false,
    dateSingle: toStr(new Date()),
    dateDebut: toStr(new Date()),
    dateFin: '',
    joursRecurrence: [],
    excludeWeekends: false,
    excludeHolidays: false,
    zone: 'metropole',
    notes: '',
  })

  if (!isOpen) return null

  const handleSave = async () => {
    if (!form.heureDebut || !form.heureFin) {
      alert('Veuillez renseigner les heures de début et fin')
      return
    }
    if (form.isRecurrent && form.joursRecurrence.length === 0) {
      alert('Veuillez sélectionner au moins un jour pour la récurrence')
      return
    }
    await onSave(form)
    await onSuccess?.()
    onClose()
  }

  const toggleJour = (key: string) => {
    setForm(prev => ({
      ...prev,
      joursRecurrence: prev.joursRecurrence.includes(key)
        ? prev.joursRecurrence.filter(j => j !== key)
        : [...prev.joursRecurrence, key],
    }))
  }

  const toggleExcludeWeekends = () => {
    setForm(prev => ({
      ...prev,
      excludeWeekends: !prev.excludeWeekends,
      joursRecurrence: !prev.excludeWeekends
        ? prev.joursRecurrence.filter(j => j !== 'sam' && j !== 'dim')
        : prev.joursRecurrence,
    }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Planifier un entraînement</h2>
          <button onClick={onClose} className="text-[#999999] hover:text-[#0A0A0A] text-xl">✕</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Type de séance */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#999999] mb-3">Type de séance</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setForm(prev => ({ ...prev, type: t }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.type === t
                      ? 'bg-[#C41230] text-white'
                      : 'bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Horaire */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#999999] mb-3">Horaire</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Heure début</label>
                <input
                  type="time"
                  value={form.heureDebut}
                  onChange={e => setForm(prev => ({ ...prev, heureDebut: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Heure fin</label>
                <input
                  type="time"
                  value={form.heureFin}
                  onChange={e => setForm(prev => ({ ...prev, heureFin: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>
            </div>
          </div>

          {/* Planification */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#999999] mb-3">Planification</label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setForm(prev => ({ ...prev, isRecurrent: false }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !form.isRecurrent
                    ? 'bg-[#C41230] text-white'
                    : 'bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]'
                }`}
              >
                Séance unique
              </button>
              <button
                onClick={() => setForm(prev => ({ ...prev, isRecurrent: true }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.isRecurrent
                    ? 'bg-[#C41230] text-white'
                    : 'bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]'
                }`}
              >
                Récurrence
              </button>
            </div>

            {!form.isRecurrent ? (
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.dateSingle || ''}
                  onChange={e => setForm(prev => ({ ...prev, dateSingle: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#666666] mb-2">Jours</label>
                  <div className="flex gap-1">
                    {JOURS.map(j => (
                      <button
                        key={j.key}
                        onClick={() => toggleJour(j.key)}
                        className={`flex-1 py-2 rounded text-xs font-semibold transition-colors ${
                          form.joursRecurrence.includes(j.key)
                            ? 'bg-[#C41230] text-white'
                            : 'bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]'
                        }`}
                      >
                        {j.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#666666] mb-1.5">Date début</label>
                    <input
                      type="date"
                      value={form.dateDebut || ''}
                      onChange={e => setForm(prev => ({ ...prev, dateDebut: e.target.value }))}
                      className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#666666] mb-1.5">Date fin (optionnel)</label>
                    <input
                      type="date"
                      value={form.dateFin || ''}
                      onChange={e => setForm(prev => ({ ...prev, dateFin: e.target.value }))}
                      className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.excludeWeekends}
                      onChange={toggleExcludeWeekends}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[#0A0A0A]">Exclure les week-ends</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.excludeHolidays}
                      onChange={e => setForm(prev => ({ ...prev, excludeHolidays: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[#0A0A0A]">Exclure les jours fériés</span>
                  </label>

                  {form.excludeHolidays && (
                    <div className="ml-6">
                      <label className="block text-xs text-[#666666] mb-1.5">Zone</label>
                      <select
                        value={form.zone}
                        onChange={e => setForm(prev => ({ ...prev, zone: e.target.value as any }))}
                        className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                      >
                        <option value="metropole">Métropole</option>
                        <option value="domtom">DOM-TOM</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#999999] mb-2">Notes (optionnel)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes personnelles…"
              rows={3}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5]"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#C41230] text-white text-sm font-medium hover:bg-[#9B0E25] disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
