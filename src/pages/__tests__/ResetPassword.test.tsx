import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ResetPassword from '../ResetPassword'

const h = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  updateUser: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: { auth: {
    verifyOtp: h.verifyOtp,
    onAuthStateChange: h.onAuthStateChange,
    resetPasswordForEmail: h.resetPasswordForEmail,
    updateUser: h.updateUser,
  } },
}))

function renderAt(route: string) {
  return render(<MemoryRouter initialEntries={[route]}><ResetPassword /></MemoryRouter>)
}

beforeEach(() => { vi.clearAllMocks(); h.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }) })

describe('ResetPassword — lien de réinitialisation', () => {
  it('affiche un message clair (et le formulaire de renvoi) si le lien a expiré', () => {
    renderAt('/reset-password?error_code=otp_expired&error_description=Email+link+is+invalid')
    expect(screen.getByText(/a expiré ou a déjà été utilisé/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Envoyer le lien/i })).toBeInTheDocument()
    expect(h.verifyOtp).not.toHaveBeenCalled()
  })

  it('vérifie un lien token_hash en JS (résistant aux scanners) et ouvre le formulaire', async () => {
    h.verifyOtp.mockResolvedValue({ error: null })
    renderAt('/reset-password?token_hash=abc123&type=recovery')
    await waitFor(() => expect(h.verifyOtp).toHaveBeenCalledWith({ type: 'recovery', token_hash: 'abc123' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Nouveau mot de passe/i })).toBeInTheDocument())
  })

  it('affiche l’erreur si verifyOtp échoue (jeton déjà consommé)', async () => {
    h.verifyOtp.mockResolvedValue({ error: { message: 'otp_expired' } })
    renderAt('/reset-password?token_hash=used&type=recovery')
    await waitFor(() => expect(screen.getByText(/a expiré ou a déjà été utilisé/i)).toBeInTheDocument())
  })

  it('sans paramètre, propose le formulaire de demande', () => {
    renderAt('/reset-password')
    expect(screen.getByRole('heading', { name: /Mot de passe oublié/i })).toBeInTheDocument()
    expect(h.onAuthStateChange).toHaveBeenCalled()
  })
})
