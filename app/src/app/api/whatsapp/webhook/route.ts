import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runAIAgent } from '@/lib/ai-agent'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Meta webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// Incoming WhatsApp messages
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Respond to Meta immediately, process in background
  processMessage(body).catch(err => console.error('Webhook processing error:', err))

  return NextResponse.json({ ok: true })
}

async function processMessage(body: Record<string, unknown>) {
  const entry = (body?.entry as any[])?.[0]
  const value = entry?.changes?.[0]?.value

  if (value?.statuses) return // Skip delivery receipts

  const messages = value?.messages as any[]
  if (!messages?.length) return

  const message = messages[0]
  if (message.type !== 'text') return

  const from: string = message.from // e.g. "263771234567"
  const text: string = message.text?.body
  if (!text?.trim()) return

  const supabase = serviceClient()

  // Find tenant by WhatsApp ID or phone
  const { data: tenant } = await supabase
    .from('tenants')
    .select(`
      id, full_name, landlord_id, unit_id, whatsapp_id,
      units(unit_number, rent_amount, currency, rent_due_day, properties(name, city)),
      landlords(full_name)
    `)
    .or(`whatsapp_id.eq.${from},phone.eq.+${from}`)
    .maybeSingle()

  if (!tenant) {
    await sendWhatsAppMessage(from, "Hi! I don't have your number on file. Please ask your landlord to add you to Rentora.")
    return
  }

  // Mark tenant's whatsapp_id if not set
  if (!tenant.whatsapp_id) {
    await supabase.from('tenants').update({ whatsapp_id: from }).eq('id', tenant.id)
  }

  // Get current month payment status
  const now = new Date()
  const { data: currentPayment } = await supabase
    .from('payments')
    .select('status, amount, currency, due_date')
    .eq('tenant_id', tenant.id)
    .eq('period_month', now.getMonth() + 1)
    .eq('period_year', now.getFullYear())
    .maybeSingle()

  // Get or create active conversation
  let { data: conversation } = await supabase
    .from('ai_conversations')
    .select('id, is_escalated')
    .eq('tenant_id', tenant.id)
    .eq('channel', 'whatsapp')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!conversation) {
    const { data: newConv } = await supabase
      .from('ai_conversations')
      .insert({ tenant_id: tenant.id, landlord_id: tenant.landlord_id, channel: 'whatsapp' })
      .select('id, is_escalated')
      .single()
    conversation = newConv
  }

  if (!conversation) return

  // Fetch recent message history
  const { data: history } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })
    .limit(12)

  // Save incoming message
  await supabase.from('ai_messages').insert({
    conversation_id: conversation.id,
    role: 'user',
    content: text,
  })

  const units = tenant.units as any
  const landlords = tenant.landlords as any

  const { reply, escalate } = await runAIAgent({
    tenant: {
      id: tenant.id,
      name: tenant.full_name,
      unit: units?.unit_number ?? '—',
      property: units?.properties?.name ?? '—',
      city: units?.properties?.city ?? '—',
      rentAmount: units?.rent_amount ?? 0,
      currency: units?.currency ?? 'USD',
      rentDueDay: units?.rent_due_day ?? 1,
    },
    landlordName: landlords?.full_name ?? 'Your landlord',
    currentPayment: currentPayment as any,
    history: (history ?? []) as { role: 'user' | 'assistant'; content: string }[],
    userMessage: text,
    supabase,
    landlordId: tenant.landlord_id,
    conversationId: conversation.id,
  })

  // Save AI reply
  await supabase.from('ai_messages').insert({
    conversation_id: conversation.id,
    role: 'assistant',
    content: reply,
  })

  // Escalate if needed
  if (escalate && !conversation.is_escalated) {
    await supabase.from('ai_conversations').update({
      is_escalated: true,
      escalated_at: new Date().toISOString(),
    }).eq('id', conversation.id)
  }

  await sendWhatsAppMessage(from, reply)
}
