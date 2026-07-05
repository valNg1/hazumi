import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HomeMessagingCard from '../HomeMessagingCard'
import * as hookModule from '../../hooks/useUnreadConversations'

vi.mock('../../hooks/useUnreadConversations')

const navigateMock = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

function mockHook(conversations: any[], markAsRead = vi.fn()) {
  vi.mocked(hookModule.useUnreadConversations).mockReturnValue({ conversations, markAsRead })
  return markAsRead
}

function renderCard() {
  return render(
    <MemoryRouter>
      <HomeMessagingCard />
    </MemoryRouter>
  )
}

beforeEach(() => {
  navigateMock.mockClear()
})

describe('HomeMessagingCard', () => {
  it('ne rend rien si la liste est vide', () => {
    mockHook([])
    const { container } = renderCard()
    expect(container.firstChild).toBeNull()
  })

  it('affiche une entrée par conversation non lue avec titre + extrait', () => {
    mockHook([
      { conversationId: 'c1', title: 'Groupe Kata', lastMessage: { content: 'On travaille le kata ce soir', senderId: 'j1' }, createdAt: '2026-07-10T00:00:00Z' },
      { conversationId: 'c2', title: 'Groupe Ne-waza', lastMessage: { content: 'Nouvelle vidéo dispo', senderId: 'j2' }, createdAt: '2026-07-11T00:00:00Z' },
    ])
    renderCard()
    expect(screen.getByText('Groupe Kata')).toBeInTheDocument()
    expect(screen.getByText('On travaille le kata ce soir')).toBeInTheDocument()
    expect(screen.getByText('Groupe Ne-waza')).toBeInTheDocument()
    expect(screen.getByText('Nouvelle vidéo dispo')).toBeInTheDocument()
  })

  it('un clic sur une entrée déclenche la navigation avec le bon conversationId et markAsRead', async () => {
    const markAsRead = mockHook([
      { conversationId: 'c1', title: 'Groupe Kata', lastMessage: { content: 'On travaille le kata ce soir', senderId: 'j1' }, createdAt: '2026-07-10T00:00:00Z' },
    ])
    renderCard()
    await userEvent.click(screen.getByText('Groupe Kata'))

    expect(navigateMock).toHaveBeenCalledWith('/messages/c1')
    expect(markAsRead).toHaveBeenCalledWith('c1')
  })
})
