import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MaintenanceClient } from './maintenance-client'

export default async function MaintenancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!landlord) redirect('/login')

  const [{ data: requests }, { data: tenants }] = await Promise.all([
    supabase
      .from('maintenance_requests')
      .select('*, tenants(full_name), units(unit_number, properties(name))')
      .eq('landlord_id', landlord.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tenants')
      .select('id, full_name, unit_id, units(unit_number, properties(name))')
      .eq('landlord_id', landlord.id),
  ])

  return (
    <MaintenanceClient
      landlordId={landlord.id as string}
      initialRequests={(requests ?? []) as any[]}
      tenants={(tenants ?? []) as any[]}
    />
  )
}
