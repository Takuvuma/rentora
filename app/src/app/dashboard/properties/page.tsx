import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PropertiesClient } from './properties-client'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, country')
    .eq('user_id', user.id)
    .single()
  if (!landlord) redirect('/login')

  const { data: properties } = await supabase
    .from('properties')
    .select('*, units(*)')
    .eq('landlord_id', landlord.id)
    .order('created_at', { ascending: false })

  return (
    <PropertiesClient
      landlordId={landlord.id as string}
      landlordCountry={landlord.country as string}
      initialProperties={(properties ?? []) as any[]}
    />
  )
}
