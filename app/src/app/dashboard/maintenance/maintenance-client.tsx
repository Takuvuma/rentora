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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Wrench, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tenant = {
  id: string
  full_name: string
  unit_id: string
  units: { unit_number: string; properties: { name: string } } | null
}

type Request = {
  id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'urgent' | 'emergency'
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  tenant_id: string | null
  unit_id: string | null
  tenants: { full_name: string } | null
  units: { unit_number: string; properties: { name: string } } | null
}

const priorityConfig = {
  low:       { label: 'Low',       className: 'bg-gray-50 text-gray-500 border-gray-200' },
  medium:    { label: 'Medium',    className: 'bg-amber-50 text-amber-700 border-amber-200' },
  urgent:    { label: 'Urgent',    className: 'bg-orange-50 text-orange-700 border-orange-200' },
  emergency: { label: 'Emergency', className: 'bg-red-50 text-red-700 border-red-200' },
}

const statusFlow: Record<string, string> = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'closed',
}

const statusLabel: Record<string, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export function MaintenanceClient({
  landlordId,
  initialRequests,
  tenants,
}: {
  landlordId: string
  initialRequests: Request[]
  tenants: Tenant[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', tenant_id: '' })

  const displayed = filter === 'open'
    ? requests.filter(r => r.status !== 'resolved' && r.status !== 'closed')
    : requests

  async function addRequest() {
    setLoading(true)
    const tenant = tenants.find(t => t.id === form.tenant_id)
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert({
        landlord_id: landlordId,
        tenant_id: form.tenant_id || null,
        unit_id: tenant?.unit_id || null,
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        status: 'open',
      })
      .select('*, tenants(full_name), units(unit_number, properties(name))')
      .single()

    if (error) { toast.error(error.message); setLoading(false); return }
    setRequests(prev => [data as Request, ...prev])
    setShowAdd(false)
    setForm({ title: '', description: '', priority: 'medium', tenant_id: '' })
    toast.success('Request logged')
    setLoading(false)
    router.refresh()
  }

  async function advanceStatus(req: Request) {
    const next = statusFlow[req.status]
    if (!next) return
    setUpdatingId(req.id)
    const { error } = await supabase.from('maintenance_requests').update({ status: next }).eq('id', req.id)
    if (error) { toast.error(error.message); setUpdatingId(null); return }
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: next as Request['status'] } : r))
    toast.success(`Marked as ${statusLabel[next]}`)
    setUpdatingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A1628]">Maintenance</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {requests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length} open {requests.filter(r => r.priority === 'urgent' || r.priority === 'emergency').length > 0 && `· ${requests.filter(r => (r.priority === 'urgent' || r.priority === 'emergency') && r.status !== 'closed').length} urgent`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-black/10 p-0.5 text-xs">
            {(['open', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn('px-3 py-1.5 rounded-full font-medium capitalize transition-colors', filter === f ? 'bg-[#0A1628] text-white' : 'text-[#6B7280] hover:text-[#0A1628]')}
              >
                {f}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full">
            <Plus size={16} className="mr-1" /> Log Issue
          </Button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Wrench size={40} className="text-[#6B7280] mb-4 opacity-30" />
          <p className="font-medium text-[#0A1628]">{filter === 'open' ? 'No open issues' : 'No maintenance requests'}</p>
          <p className="text-sm text-[#6B7280] mt-1">All clear — log an issue when something needs attention</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(req => (
            <Card key={req.id} className="border-black/8 shadow-none hover:border-black/20 transition-colors">
              <CardContent className="py-4 px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#0A1628]">{req.title}</p>
                      <Badge variant="outline" className={cn('text-xs border', priorityConfig[req.priority]?.className)}>
                        {priorityConfig[req.priority]?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-black/10 text-[#6B7280]">
                        {statusLabel[req.status]}
                      </Badge>
                    </div>
                    {req.description && (
                      <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{req.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
                      {req.tenants && <span>{req.tenants.full_name}</span>}
                      {req.units && (
                        <span>{req.units.properties?.name} · Unit {req.units.unit_number}</span>
                      )}
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {statusFlow[req.status] && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => advanceStatus(req)}
                      disabled={updatingId === req.id}
                      className="shrink-0 rounded-full text-xs border-black/10 hover:bg-[#0A1628] hover:text-white hover:border-[#0A1628]"
                    >
                      {statusLabel[statusFlow[req.status]]}
                      <ChevronRight size={12} className="ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A1628]">Log Maintenance Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Issue title</Label>
              <Input placeholder="Leaking tap in bathroom" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-[#6B7280] font-normal">(optional)</span></Label>
              <Textarea placeholder="More details about the issue…" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Tenant <span className="text-[#6B7280] font-normal">(optional)</span></Label>
                <select
                  value={form.tenant_id}
                  onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">None</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} · Unit {t.units?.unit_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              onClick={addRequest}
              disabled={loading || !form.title}
              className="w-full bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
            >
              {loading ? 'Logging…' : 'Log Issue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
