import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, full_name, email, phone, country, whatsapp_phone_number_id, whatsapp_access_token, ecocash_merchant_number, ecocash_merchant_name, accepted_payment_methods, reminders_enabled, reminder_days_before')
    .eq('user_id', user.id)
    .single()

  if (!landlord) redirect('/login')

  return <SettingsClient landlord={landlord as Row} />
}
