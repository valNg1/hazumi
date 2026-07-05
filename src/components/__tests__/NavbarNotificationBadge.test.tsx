import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NavbarNotificationBadge from '../NavbarNotificationBadge'
import * as hookModule from '../../hooks/useUnreadConversations'

vi.mock('../../hooks/useUnreadConversations')

function mockHook(conversations: any[]) {
  vi.mocked(hookModule.useUnreadConversations).mockReturnValue({
    conversations,
    markAsRead: vi.fn(),
  })
}

describe('NavbarNotificationBadge', () => {
  it('est absent du DOM si la liste est vide', () => {
    mockHook([])
    const { container } = render(<NavbarNotificationBadge />)
    expect(container.firstChild).toBeNull()
    expect(screen.queryByTestId('navbar-notification-badge')).toBeNull()
  })

  it('est présent si la liste est non vide', () => {
    mockHook([
      { conversationId: 'c1', title: 'Groupe Kata', lastMessage: { content: 'x', senderId: 'j1' }, createdAt: '2026-07-10T00:00:00Z' },
    ])
    render(<NavbarNotificationBadge />)
    expect(screen.getByTestId('navbar-notification-badge')).toBeInTheDocument()
  })
})
