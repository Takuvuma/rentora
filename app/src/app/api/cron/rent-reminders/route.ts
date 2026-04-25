import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(request: NextRequest) {
  // Protect with Vercel cron secret
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = serviceClient()
  const today = new Date()
  const results = { sent: 0, skipped: 0, errors: 0 }

  for (const daysBefore of [7, 3, 1]) {
    const target = new Date(today)
    target.setDate(today.getDate() + daysBefore)
    const dateStr = target.toISOString().split('T')[0]

    const { data: payments } = await supabase
      .from('payments')
      .select('id, amount, currency, due_date, tenants(id, full_name, whatsapp_id, phone)')
      .eq('due_date', dateStr)
      .in('status', ['due', 'partial'])

    for (const payment of payments ?? []) {
      const tenant = payment.tenants as any
      if (!tenant) continue

      // Skip if reminder already sent for this payment + interval
      const { data: existing } = await supabase
        .from('rent_reminders')
        .select('id')
        .eq('payment_id', payment.id)
        .eq('days_before', daysBefore)
        .maybeSingle()

      if (existing) { results.skipped++; continue }

      const phone = tenant.whatsapp_id || tenant.phone?.replace('+', '')
      if (!phone) { results.skipped++; continue }

      const sym = payment.currency === 'ZAR' ? 'R' : '$'
      const when = daysBefore === 1 ? 'tomorrow' : `in ${daysBefore} days`
      const msg = `Hi ${tenant.full_name} 👋 Just a reminder — your rent of ${sym}${payment.amount} is due ${when} (${payment.due_date}). Reply if you have any questions!`

      try {
        await sendWhatsAppMessage(phone, msg)
        await supabase.from('rent_reminders').insert({
          payment_id: payment.id,
          tenant_id: tenant.id,
          days_before: daysBefore,
          channel: 'whatsapp',
        })
        results.sent++
      } catch {
        results.errors++
      }
    }
  }

  return NextResponse.json(results)
}
