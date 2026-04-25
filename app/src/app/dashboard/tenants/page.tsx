import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TenantsClient } from './tenants-client'

export default async function TenantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!landlord) redirect('/login')

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, city')
    .eq('landlord_id', landlord.id)

  const propertyIds = (properties ?? []).map(p => p.id)

  const [{ data: tenants }, { data: vacantUnits }] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, full_name, phone, email, invite_accepted_at, created_at, unit_id, units(unit_number, currency, rent_amount, properties(name, city))')
      .eq('landlord_id', landlord.id)
      .order('created_at', { ascending: false }),
    propertyIds.length > 0
      ? supabase
          .from('units')
          .select('id, unit_number, rent_amount, currency, property_id, properties(name)')
          .in('property_id', propertyIds)
          .eq('is_occupied', false)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <TenantsClient
      landlordId={landlord.id as string}
      initialTenants={(tenants ?? []) as any[]}
      vacantUnits={(vacantUnits ?? []) as any[]}
    />
  )
}
