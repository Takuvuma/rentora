'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CreditCard, CheckCircle2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tenant = {
  id: string
  full_name: string
  phone: string
  unit_id: string
  units: { unit_number: string; rent_amount: number; currency: string; properties: { name: string } } | null
}

type Payment = {
  id: string
  tenant_id: string
  unit_id: string
  amount: number
  currency: string
  status: 'paid' | 'due' | 'late' | 'partial' | 'waived'
  payment_method: string | null
  due_date: string
  paid_date: string | null
}

const statusConfig = {
  paid:    { label: 'Paid',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  due:     { label: 'Due',     className: 'bg-amber-50 text-amber-700 border-amber-200' },
  late:    { label: 'Late',    className: 'bg-red-50 text-red-700 border-red-200' },
  partial: { label: 'Partial', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  waived:  { label: 'Waived',  className: 'bg-gray-50 text-gray-500 border-gray-200' },
}

export function PaymentsClient({
  landlordId,
  initialPayments,
  tenants,
  month,
  year,
}: {
  landlordId: string
  initialPayments: Payment[]
  tenants: Tenant[]
  month: number
  year: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [generating, setGenerating] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [recordPayment, setRecordPayment] = useState<Payment | null>(null)
  const [recordForm, setRecordForm] = useState({ amount: '', method: 'ecocash', reference: '' })

  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  const paid = payments.filter(p => p.status === 'paid')
  const totalCollected = paid.reduce((s, p) => s + Number(p.amount), 0)
  const totalExpected = payments.reduce((s, p) => s + Number(p.amount), 0)

  async function generateMonthPayments() {
    if (tenants.length === 0) { toast.error('Add tenants first'); return }
    setGenerating(true)

    const dueDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const inserts = tenants
      .filter(t => !payments.find(p => p.tenant_id === t.id))
      .map(t => ({
        landlord_id: landlordId,
        tenant_id: t.id,
        unit_id: t.unit_id,
        amount: t.units?.rent_amount ?? 0,
        currency: t.units?.currency ?? 'USD',
        status: 'due',
        due_date: dueDate,
        period_month: month,
        period_year: year,
      }))

    if (inserts.length === 0) { toast.info('All tenants already have payment records'); setGenerating(false); return }

    const { data, error } = await supabase.from('payments').insert(inserts).select()
    if (error) { toast.error(error.message); setGenerating(false); return }
    setPayments(prev => [...prev, ...(data as Payment[])])
    toast.success(`Generated ${inserts.length} payment records`)
    setGenerating(false)
    router.refresh()
  }

  async function markPaid() {
    if (!recordPayment) return
    setMarkingId(recordPayment.id)
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: recordForm.method,
        amount: parseFloat(recordForm.amount) || recordPayment.amount,
        ...(recordForm.reference ? { ecocash_reference: recordForm.reference } : {}),
      })
      .eq('id', recordPayment.id)

    if (error) { toast.error(error.message); setMarkingId(null); return }
    setPayments(prev => prev.map(p => p.id === recordPayment.id
      ? { ...p, status: 'paid', paid_date: new Date().toISOString().split('T')[0], payment_method: recordForm.method }
      : p
    ))
    toast.success('Payment recorded')
    setMarkingId(null)
    setRecordPayment(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A1628]">Payments</h1>
          <p className="text-sm text-[#6B7280] mt-1">{monthLabel}</p>
        </div>
        <Button
          onClick={generateMonthPayments}
          disabled={generating || tenants.length === 0}
          className="bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full w-full sm:w-auto"
        >
          <Zap size={15} className="mr-1" />
          {generating ? 'Generating…' : 'Generate Month\'s Rent'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Collected', value: `$${totalCollected.toFixed(0)}`, sub: `${paid.length} of ${payments.length} paid` },
          { label: 'Expected', value: `$${totalExpected.toFixed(0)}`, sub: `${payments.length} tenants` },
          { label: 'Outstanding', value: `$${(totalExpected - totalCollected).toFixed(0)}`, sub: `${payments.length - paid.length} remaining` },
        ].map(card => (
          <Card key={card.label} className="border-black/8 shadow-none">
            <CardContent className="pt-5">
              <div className="text-2xl font-semibold text-[#0A1628]">{card.value}</div>
              <div className="text-xs text-[#6B7280] mt-1">{card.label}</div>
              <div className="text-xs text-[#6B7280] mt-0.5">{card.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment table */}
      <Card className="border-black/8 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#0A1628]">Rent Status · {monthLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard size={36} className="text-[#6B7280] mb-3 opacity-30" />
              <p className="text-sm font-medium text-[#0A1628]">No payment records yet</p>
              <p className="text-xs text-[#6B7280] mt-1">Click "Generate Month's Rent" to create records for all tenants</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-130">
              <thead>
                <tr className="border-b border-black/8">
                  <th className="text-left px-4 py-3 text-[#6B7280] font-medium">Tenant</th>
                  <th className="text-left px-3 py-3 text-[#6B7280] font-medium hidden sm:table-cell">Unit</th>
                  <th className="text-right px-3 py-3 text-[#6B7280] font-medium">Amount</th>
                  <th className="text-right px-3 py-3 text-[#6B7280] font-medium hidden sm:table-cell">Method</th>
                  <th className="text-right px-4 py-3 text-[#6B7280] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => {
                  const tenant = tenants.find(t => t.id === payment.tenant_id)
                  const cfg = statusConfig[payment.status] ?? statusConfig.due
                  return (
                    <tr key={payment.id} className="border-b border-black/4 last:border-0 hover:bg-[#FAF8F3] transition-colors">
                      <td className="px-4 py-3.5 font-medium text-[#0A1628]">{tenant?.full_name ?? '—'}</td>
                      <td className="px-3 py-3.5 text-[#6B7280] hidden sm:table-cell">
                        {tenant?.units ? `${tenant.units.properties?.name} · Unit ${tenant.units.unit_number}` : '—'}
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-[#0A1628]">
                        {payment.currency === 'ZAR' ? 'R' : '$'}{Number(payment.amount).toFixed(0)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-[#6B7280] capitalize hidden sm:table-cell">
                        {payment.payment_method ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant="outline" className={cn('text-xs border', cfg.className)}>
                            {cfg.label}
                          </Badge>
                          {payment.status !== 'paid' && payment.status !== 'waived' && (
                            <button
                              onClick={() => { setRecordPayment(payment); setRecordForm({ amount: String(payment.amount), method: 'ecocash', reference: '' }) }}
                              className="text-xs text-[#0D9E75] hover:underline font-medium"
                            >
                              Record
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={!!recordPayment} onOpenChange={open => !open && setRecordPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A1628]">Record Payment</DialogTitle>
          </DialogHeader>
          {recordPayment && (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-[#6B7280]">
                Recording payment for {tenants.find(t => t.id === recordPayment.tenant_id)?.full_name}
              </p>
              <div className="space-y-1.5">
                <Label>Amount received</Label>
                <Input
                  type="number"
                  value={recordForm.amount}
                  onChange={e => setRecordForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <select
                  value={recordForm.method}
                  onChange={e => setRecordForm(f => ({ ...f, method: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ecocash">EcoCash</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="payfast">PayFast</option>
                  <option value="card">Card</option>
                </select>
              </div>
              {recordForm.method === 'ecocash' && (
                <div className="space-y-1.5">
                  <Label>EcoCash reference <span className="text-[#6B7280] font-normal">(optional)</span></Label>
                  <Input placeholder="EC12345678" value={recordForm.reference} onChange={e => setRecordForm(f => ({ ...f, reference: e.target.value }))} />
                </div>
              )}
              <Button
                onClick={markPaid}
                disabled={!!markingId || !recordForm.amount}
                className="w-full bg-[#0D9E75] hover:bg-[#0b8a65] text-white rounded-full"
              >
                <CheckCircle2 size={15} className="mr-1" />
                {markingId ? 'Recording…' : 'Mark as Paid'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
