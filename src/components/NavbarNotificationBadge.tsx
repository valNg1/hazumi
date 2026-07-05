import { useUnreadConversations } from '../hooks/useUnreadConversations'

export default function NavbarNotificationBadge() {
  const { conversations } = useUnreadConversations()

  if (conversations.length === 0) return null

  return (
    <span
      data-testid="navbar-notification-badge"
      className="inline-block w-2 h-2 rounded-full bg-[#C41230]"
    />
  )
}
