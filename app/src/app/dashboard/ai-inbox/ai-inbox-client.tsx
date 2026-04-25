'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquareMore, AlertCircle, Bot, User, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type Conversation = {
  id: string
  channel: string
  is_escalated: boolean
  escalated_at: string | null
  updated_at: string
  tenants: {
    id: string
    full_name: string
    phone: string
    units: { unit_number: string; properties: { name: string } } | null
  } | null
  ai_messages: Message[]
}

export function AIInboxClient({
  initialConversations,
  landlordId,
}: {
  initialConversations: Conversation[]
  landlordId: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selected, setSelected] = useState<Conversation | null>(initialConversations[0] ?? null)
  const [filter, setFilter] = useState<'all' | 'escalated'>('all')

  const displayed = filter === 'escalated'
    ? conversations.filter(c => c.is_escalated)
    : conversations

  const escalatedCount = conversations.filter(c => c.is_escalated).length

  async function dismissEscalation(convId: string) {
    const { error } = await supabase
      .from('ai_conversations')
      .update({ is_escalated: false, escalated_at: null })
      .eq('id', convId)

    if (error) { toast.error(error.message); return }

    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, is_escalated: false, escalated_at: null } : c)
    )
    if (selected?.id === convId) {
      setSelected(prev => prev ? { ...prev, is_escalated: false } : prev)
    }
    toast.success('Escalation dismissed')
    router.refresh()
  }

  const messages = selected
    ? [...(selected.ai_messages ?? [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A1628]">AI Inbox</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {conversations.length} conversations · {escalatedCount} need your attention
          </p>
        </div>
        <div className="flex rounded-full border border-black/10 p-0.5 text-xs">
          {(['all', 'escalated'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full font-medium capitalize transition-colors flex items-center gap-1.5',
                filter === f ? 'bg-[#0A1628] text-white' : 'text-[#6B7280] hover:text-[#0A1628]'
              )}
            >
              {f === 'escalated' && escalatedCount > 0 && (
                <span className={cn('w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold',
                  filter === f ? 'bg-white text-[#0A1628]' : 'bg-red-500 text-white'
                )}>
                  {escalatedCount}
                </span>
              )}
              {f}
            </button>
          ))}
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageSquareMore size={40} className="text-[#6B7280] mb-4 opacity-30" />
          <p className="font-medium text-[#0A1628]">No conversations yet</p>
          <p className="text-sm text-[#6B7280] mt-1">Conversations will appear here once tenants message via WhatsApp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
          {/* Conversation list */}
          <div className="lg:col-span-1 overflow-y-auto space-y-2 pr-1">
            {displayed.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-8">No escalated conversations</p>
            ) : displayed.map(conv => {
              const lastMsg = [...(conv.ai_messages ?? [])].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0]
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={cn(
                    'w-full text-left rounded-xl border p-3.5 transition-colors',
                    selected?.id === conv.id
                      ? 'border-[#0A1628] bg-[#0A1628]/5'
                      : conv.is_escalated
                      ? 'border-red-200 bg-red-50 hover:border-red-300'
                      : 'border-black/8 bg-white hover:border-black/20'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-[#0A1628] truncate">{conv.tenants?.full_name ?? 'Unknown'}</p>
                        {conv.is_escalated && <AlertCircle size={13} className="text-red-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {conv.tenants?.units?.properties?.name} · Unit {conv.tenants?.units?.unit_number}
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-1">
                          {lastMsg.role === 'assistant' ? '🤖 ' : ''}{lastMsg.content}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-[#6B7280]">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-black/10 text-[#6B7280] flex items-center gap-1">
                        <Wifi size={8} /> {conv.channel}
                      </Badge>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Conversation thread */}
          <div className="lg:col-span-2 flex flex-col border border-black/8 rounded-2xl overflow-hidden bg-white">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-sm text-[#6B7280]">
                Select a conversation
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-black/8 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#0A1628]">{selected.tenants?.full_name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {selected.tenants?.units?.properties?.name} · Unit {selected.tenants?.units?.unit_number} · {selected.tenants?.phone}
                    </p>
                  </div>
                  {selected.is_escalated && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                        <AlertCircle size={11} className="mr-1" /> Needs attention
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissEscalation(selected.id)}
                        className="text-xs rounded-full border-black/10"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-[#6B7280] text-center py-8">No messages yet</p>
                  ) : messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn('flex gap-2 max-w-[85%]', msg.role === 'assistant' ? 'ml-0' : 'ml-auto flex-row-reverse')}
                    >
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        msg.role === 'assistant' ? 'bg-[#0D9E75]/10' : 'bg-[#0A1628]/10'
                      )}>
                        {msg.role === 'assistant'
                          ? <Bot size={13} className="text-[#0D9E75]" />
                          : <User size={13} className="text-[#0A1628]" />}
                      </div>
                      <div className={cn('rounded-2xl px-3.5 py-2.5 text-sm',
                        msg.role === 'assistant'
                          ? 'bg-[#F5F2EA] text-[#0A1628] rounded-tl-sm'
                          : 'bg-[#0A1628] text-white rounded-tr-sm'
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', msg.role === 'assistant' ? 'text-[#6B7280]' : 'text-white/60')}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-black/8 text-xs text-[#6B7280] text-center">
                  AI is handling this conversation · You'll be notified when escalated
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
