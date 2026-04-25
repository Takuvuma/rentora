import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PaymentsClient } from './payments-client'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!landlord) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [{ data: payments }, { data: tenants }] = await Promise.all([
    supabase
      .from('payments')
      .select('*')
      .eq('landlord_id', landlord.id)
      .eq('period_month', month)
      .eq('period_year', year)
      .order('due_date', { ascending: true }),
    supabase
      .from('tenants')
      .select('id, full_name, phone, unit_id, units(unit_number, rent_amount, currency, properties(name))')
      .eq('landlord_id', landlord.id),
  ])

  return (
    <PaymentsClient
      landlordId={landlord.id as string}
      initialPayments={(payments ?? []) as any[]}
      tenants={(tenants ?? []) as any[]}
      month={month}
      year={year}
    />
  )
}
