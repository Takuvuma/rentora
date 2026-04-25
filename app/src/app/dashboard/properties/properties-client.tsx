'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Unit = {
  id: string
  unit_number: string
  rent_amount: number
  currency: string
  rent_due_day: number
  is_occupied: boolean
}

type Property = {
  id: string
  name: string
  address: string
  city: string
  country: string
  units: Unit[]
}

export function PropertiesClient({
  landlordId,
  landlordCountry,
  initialProperties,
}: {
  landlordId: string
  landlordCountry: string
  initialProperties: Property[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [addingUnitFor, setAddingUnitFor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [propForm, setPropForm] = useState({ name: '', address: '', city: '', country: landlordCountry })
  const [unitForm, setUnitForm] = useState({ unit_number: '', rent_amount: '', currency: 'USD', rent_due_day: '1' })

  async function addProperty() {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .insert({ landlord_id: landlordId, name: propForm.name, address: propForm.address, city: propForm.city, country: propForm.country, total_units: 0 })
      .select('*, units(*)')
      .single()
    if (error) { toast.error(error.message); setLoading(false); return }
    setProperties(prev => [{ ...data, units: [] }, ...prev])
    setShowAddProperty(false)
    setPropForm({ name: '', address: '', city: '', country: landlordCountry })
    toast.success('Property added')
    setLoading(false)
    router.refresh()
  }

  async function addUnit(propertyId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('units')
      .insert({
        property_id: propertyId,
        unit_number: unitForm.unit_number,
        rent_amount: parseFloat(unitForm.rent_amount),
        currency: unitForm.currency,
        rent_due_day: parseInt(unitForm.rent_due_day),
        is_occupied: false,
      })
      .select()
      .single()
    if (error) { toast.error(error.message); setLoading(false); return }
    setProperties(prev => prev.map(p =>
      p.id === propertyId ? { ...p, units: [...(p.units ?? []), data as Unit] } : p
    ))
    setAddingUnitFor(null)
    setUnitForm({ unit_number: '', rent_amount: '', currency: 'USD', rent_due_day: '1' })
    toast.success('Unit added')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A1628]">Properties</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} in your portfolio
          </p>
        </div>
        <Button onClick={() => setShowAddProperty(true)} className="bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full">
          <Plus size={16} className="mr-1" /> Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 size={40} className="text-[#6B7280] mb-4 opacity-30" />
          <p className="font-medium text-[#0A1628]">No properties yet</p>
          <p className="text-sm text-[#6B7280] mt-1">Add your first property to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map(property => {
            const units = property.units ?? []
            const occupied = units.filter(u => u.is_occupied).length
            const totalRent = units.reduce((s, u) => s + Number(u.rent_amount), 0)
            return (
              <Card key={property.id} className="border-black/8 shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-[#0A1628]">{property.name}</CardTitle>
                      <p className="text-sm text-[#6B7280] mt-0.5">{property.address}, {property.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-black/10 text-[#6B7280]">
                        {occupied}/{units.length} occupied
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setAddingUnitFor(property.id); setUnitForm({ unit_number: '', rent_amount: '', currency: 'USD', rent_due_day: '1' }) }}
                        className="rounded-full text-xs border-black/10 hover:bg-[#0A1628] hover:text-white hover:border-[#0A1628]"
                      >
                        <Plus size={13} className="mr-1" /> Add Unit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {units.length > 0 && (
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-t border-black/8">
                          <th className="text-left px-6 py-2.5 text-[#6B7280] font-medium text-xs">Unit</th>
                          <th className="text-right px-6 py-2.5 text-[#6B7280] font-medium text-xs">Rent / mo</th>
                          <th className="text-right px-6 py-2.5 text-[#6B7280] font-medium text-xs">Due day</th>
                          <th className="text-right px-6 py-2.5 text-[#6B7280] font-medium text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {units.map(unit => (
                          <tr key={unit.id} className="border-t border-black/4 last:border-0 hover:bg-[#FAF8F3] transition-colors">
                            <td className="px-6 py-3 font-medium text-[#0A1628]">Unit {unit.unit_number}</td>
                            <td className="px-6 py-3 text-right font-mono text-[#0A1628]">
                              {unit.currency === 'ZAR' ? 'R' : '$'}{Number(unit.rent_amount).toFixed(0)}
                            </td>
                            <td className="px-6 py-3 text-right text-[#6B7280]">{unit.rent_due_day}th</td>
                            <td className="px-6 py-3 text-right">
                              <Badge variant="outline" className={cn('text-xs border', unit.is_occupied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200')}>
                                {unit.is_occupied ? 'Occupied' : 'Vacant'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {units.length > 0 && (
                          <tr className="border-t border-black/8 bg-[#FAF8F3]">
                            <td className="px-6 py-2.5 text-xs text-[#6B7280] font-medium" colSpan={2}>Total monthly rent</td>
                            <td className="px-6 py-2.5 text-right font-mono font-semibold text-[#0A1628] text-sm" colSpan={2}>
                              ${totalRent.toFixed(0)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Property Dialog */}
      <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A1628]">Add Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Property name</Label>
              <Input placeholder="Avondale Flats" value={propForm.name} onChange={e => setPropForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Street address</Label>
              <Input placeholder="123 Samora Machel Ave" value={propForm.address} onChange={e => setPropForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input placeholder="Harare" value={propForm.city} onChange={e => setPropForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <select
                  value={propForm.country}
                  onChange={e => setPropForm(p => ({ ...p, country: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ZW">🇿🇼 Zimbabwe</option>
                  <option value="ZA">🇿🇦 South Africa</option>
                </select>
              </div>
            </div>
            <Button
              onClick={addProperty}
              disabled={loading || !propForm.name || !propForm.address || !propForm.city}
              className="w-full bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
            >
              {loading ? 'Adding…' : 'Add Property'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Unit Dialog */}
      <Dialog open={!!addingUnitFor} onOpenChange={open => !open && setAddingUnitFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A1628]">Add Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Unit number / name</Label>
              <Input placeholder="1A, 2B, Ground Floor…" value={unitForm.unit_number} onChange={e => setUnitForm(u => ({ ...u, unit_number: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Monthly rent</Label>
                <Input type="number" placeholder="500" value={unitForm.rent_amount} onChange={e => setUnitForm(u => ({ ...u, rent_amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <select
                  value={unitForm.currency}
                  onChange={e => setUnitForm(u => ({ ...u, currency: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="USD">USD ($)</option>
                  <option value="ZAR">ZAR (R)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Rent due day (1–28)</Label>
              <Input type="number" min="1" max="28" placeholder="1" value={unitForm.rent_due_day} onChange={e => setUnitForm(u => ({ ...u, rent_due_day: e.target.value }))} />
            </div>
            <Button
              onClick={() => addingUnitFor && addUnit(addingUnitFor)}
              disabled={loading || !unitForm.unit_number || !unitForm.rent_amount}
              className="w-full bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
            >
              {loading ? 'Adding…' : 'Add Unit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
