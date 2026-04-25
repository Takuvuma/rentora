'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Phone, Mail, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'

type VacantUnit = {
  id: string
  unit_number: string
  rent_amount: number
  currency: string
  property_id: string
  properties: { name: string }
}

type Tenant = {
  id: string
  full_name: string
  phone: string
  email: string | null
  invite_accepted_at: string | null
  created_at: string
  unit_id: string
  units: {
    unit_number: string
    currency: string
    rent_amount: number
    properties: { name: string; city: string }
  } | null
}

export function TenantsClient({
  landlordId,
  initialTenants,
  vacantUnits,
}: {
  landlordId: string
  initialTenants: Tenant[]
  vacantUnits: VacantUnit[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', unit_id: '' })

  async function addTenant() {
    setLoading(true)
    const unit = vacantUnits.find(u => u.id === form.unit_id)
    if (!unit) { toast.error('Select a unit'); setLoading(false); return }

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        landlord_id: landlordId,
        unit_id: form.unit_id,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
      })
      .select('id, full_name, phone, email, invite_accepted_at, created_at, unit_id')
      .single()

    if (error) { toast.error(error.message); setLoading(false); return }

    await supabase.from('units').update({ is_occupied: true }).eq('id', form.unit_id)

    setTenants(prev => [{
      ...data,
      units: {
        unit_number: unit.unit_number,
        currency: unit.currency,
        rent_amount: unit.rent_amount,
        properties: unit.properties,
      },
    } as Tenant, ...prev])

    setShowAdd(false)
    setForm({ full_name: '', phone: '', email: '', unit_id: '' })
    toast.success(`${form.full_name} added`)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A1628]">Tenants</h1>
          <p className="text-sm text-[#6B7280] mt-1">{tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'} across your portfolio</p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          disabled={vacantUnits.length === 0}
          className="bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
          title={vacantUnits.length === 0 ? 'Add a vacant unit first' : undefined}
        >
          <Plus size={16} className="mr-1" /> Add Tenant
        </Button>
      </div>

      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users size={40} className="text-[#6B7280] mb-4 opacity-30" />
          <p className="font-medium text-[#0A1628]">No tenants yet</p>
          <p className="text-sm text-[#6B7280] mt-1">
            {vacantUnits.length === 0
              ? 'Add a property and units first, then add tenants'
              : 'Add your first tenant to a vacant unit'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map(tenant => (
            <Card key={tenant.id} className="border-black/8 shadow-none hover:border-black/20 transition-colors">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#0A1628]">{tenant.full_name}</p>
                    {tenant.units && (
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {tenant.units.properties?.name} · Unit {tenant.units.unit_number}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={tenant.invite_accepted_at
                      ? 'text-xs bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'text-xs bg-amber-50 text-amber-700 border-amber-200'}
                  >
                    {tenant.invite_accepted_at
                      ? <><CheckCircle2 size={10} className="mr-1 inline" />Active</>
                      : <><Clock size={10} className="mr-1 inline" />Pending</>}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Phone size={13} />
                    <span>{tenant.phone}</span>
                  </div>
                  {tenant.email && (
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Mail size={13} />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                  )}
                </div>

                {tenant.units && (
                  <div className="pt-2 border-t border-black/8 flex justify-between items-center">
                    <span className="text-xs text-[#6B7280]">Monthly rent</span>
                    <span className="text-sm font-mono font-semibold text-[#0A1628]">
                      {tenant.units.currency === 'ZAR' ? 'R' : '$'}{Number(tenant.units.rent_amount).toFixed(0)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A1628]">Add Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input placeholder="Tafadzwa Moyo" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp number</Label>
              <Input type="tel" placeholder="+263 77 123 4567" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-[#6B7280] font-normal">(optional)</span></Label>
              <Input type="email" placeholder="tenant@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Assign to unit</Label>
              <select
                value={form.unit_id}
                onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a vacant unit…</option>
                {vacantUnits.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.properties?.name} · Unit {u.unit_number} ({u.currency === 'ZAR' ? 'R' : '$'}{u.rent_amount}/mo)
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={addTenant}
              disabled={loading || !form.full_name || !form.phone || !form.unit_id}
              className="w-full bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
            >
              {loading ? 'Adding…' : 'Add Tenant'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
