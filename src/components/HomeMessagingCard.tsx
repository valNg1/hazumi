import { useNavigate } from 'react-router-dom'
import { useUnreadConversations } from '../hooks/useUnreadConversations'

export default function HomeMessagingCard() {
  const { conversations, markAsRead } = useUnreadConversations()
  const navigate = useNavigate()

  if (conversations.length === 0) return null

  function openConversation(conversationId: string) {
    navigate(`/messages/${conversationId}`)
    markAsRead(conversationId)
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 mb-4">
      <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-3">Nouveaux messages</h2>
      <div className="space-y-2">
        {conversations.map((c) => (
          <button
            key={c.conversationId}
            onClick={() => openConversation(c.conversationId)}
            className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#C41230] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0A0A0A] truncate">{c.title}</p>
              <p className="text-xs text-[#666666] truncate">{c.lastMessage.content}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
