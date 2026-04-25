import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AIInboxClient } from './ai-inbox-client'

export default async function AIInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!landlord) redirect('/login')

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select(`
      id, channel, is_escalated, escalated_at, updated_at,
      tenants(id, full_name, phone, units(unit_number, properties(name))),
      ai_messages(id, role, content, created_at)
    `)
    .eq('landlord_id', landlord.id)
    .order('updated_at', { ascending: false })

  return (
    <AIInboxClient
      initialConversations={(conversations ?? []) as any[]}
      landlordId={landlord.id as string}
    />
  )
}
