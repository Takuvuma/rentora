import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DollarSign, Building2, Wrench, TrendingUp, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

async function getDashboardData(landlordId: string) {
  const supabase = await createClient()

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [paymentsRes, tenantsRes, maintenanceRes, propertiesRes, aiRes] = await Promise.all([
    supabase.from('payments').select('id, tenant_id, unit_id, amount, currency, status, due_date').eq('landlord_id', landlordId).eq('period_month', month).eq('period_year', year),
    supabase.from('tenants').select('id, full_name, unit_id').eq('landlord_id', landlordId),
    supabase.from('maintenance_requests').select('id, title, priority, status').eq('landlord_id', landlordId).neq('status', 'resolved').neq('status', 'closed'),
    supabase.from('properties').select('id, units(id, is_occupied)').eq('landlord_id', landlordId),
    supabase.from('ai_conversations').select('id, is_escalated').eq('landlord_id', landlordId),
  ])

  const payments = (paymentsRes.data ?? []) as Row[]
  const tenants = (tenantsRes.data ?? []) as Row[]
  const openIssues = (maintenanceRes.data ?? []) as Row[]
  const properties = (propertiesRes.data ?? []) as Row[]
  const conversations = (aiRes.data ?? []) as Row[]

  const allUnits = properties.flatMap((p: Row) => (p.units as Row[]) ?? [])

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s: number, p: Row) => s + (p.amount as number), 0)
  const paidCount = payments.filter(p => p.status === 'paid').length
  const totalExpected = payments.length
  const collectedPct = totalExpected > 0 ? Math.round((paidCount / totalExpected) * 100) : 0
  const occupiedUnits = allUnits.filter((u: Row) => u.is_occupied).length
  const occupancyPct = allUnits.length > 0 ? Math.round((occupiedUnits / allUnits.length) * 100) : 0
  const escalations = conversations.filter((c: Row) => c.is_escalated).length

  return { payments, tenants, openIssues, totalRevenue, collectedPct, occupancyPct, escalations, paidCount, totalExpected }
}

const statusConfig = {
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  due: { label: 'Due today', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-50 text-red-700 border-red-200' },
  partial: { label: 'Partial', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  waived: { label: 'Waived', className: 'bg-gray-50 text-gray-500 border-gray-200' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // user is guaranteed non-null past this point (redirect() throws)
  const { data: landlordRow } = await supabase.from('landlords').select('*').eq('user_id', user!.id).single()
  if (!landlordRow) redirect('/onboarding')

  const landlord = landlordRow as Row
  const { payments, tenants, openIssues, totalRevenue, collectedPct, occupancyPct, escalations, paidCount, totalExpected } = await getDashboardData(landlord.id as string)

  const now = new Date()
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstName = (landlord.full_name as string).split(' ')[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0A1628]">Good morning, {firstName}</h1>
        <p className="text-sm text-[#6B7280] mt-1">{monthLabel} · {tenants.length} tenants across your portfolio</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Revenue this month"
          value={`$${totalRevenue.toLocaleString()}`}
          sub={`${paidCount} of ${totalExpected} payments collected`}
          color="emerald"
        />
        <MetricCard
          icon={TrendingUp}
          label="Rent collected"
          value={`${collectedPct}%`}
          sub={collectedPct >= 80 ? 'On track' : 'Needs attention'}
          color={collectedPct >= 80 ? 'emerald' : 'amber'}
        />
        <MetricCard
          icon={Building2}
          label="Occupancy"
          value={`${occupancyPct}%`}
          sub={`${tenants.length} active tenants`}
          color="navy"
        />
        <MetricCard
          icon={Wrench}
          label="Open issues"
          value={String(openIssues.length)}
          sub={openIssues.filter(i => i.priority === 'urgent' || i.priority === 'emergency').length + ' urgent'}
          color={openIssues.length > 0 ? 'amber' : 'emerald'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rent status table */}
        <div className="lg:col-span-2">
          <Card className="border-black/8 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0A1628]">
                Rent Status · {monthLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-[#6B7280]">
                  No payments recorded for this month yet.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/8">
                      <th className="text-left px-6 py-3 text-[#6B7280] font-medium">Tenant</th>
                      <th className="text-left px-3 py-3 text-[#6B7280] font-medium">Unit</th>
                      <th className="text-right px-3 py-3 text-[#6B7280] font-medium">Amount</th>
                      <th className="text-right px-6 py-3 text-[#6B7280] font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => {
                      const tenant = tenants.find(t => t.id === payment.tenant_id)
                      const cfg = statusConfig[payment.status as keyof typeof statusConfig] ?? statusConfig.due
                      return (
                        <tr key={payment.id} className="border-b border-black/4 last:border-0 hover:bg-[#FAF8F3] transition-colors">
                          <td className="px-6 py-3.5 font-medium text-[#0A1628]">{tenant?.full_name ?? '—'}</td>
                          <td className="px-3 py-3.5 text-[#6B7280]">Unit {payment.unit_id.slice(-4)}</td>
                          <td className="px-3 py-3.5 text-right font-mono text-[#0A1628]">
                            {payment.currency === 'ZAR' ? 'R' : '$'}{payment.amount.toFixed(0)}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <Badge variant="outline" className={cn('text-xs font-medium border', cfg.className)}>
                              {cfg.label}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI Activity */}
          <Card className="border-black/8 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0A1628] flex items-center gap-2">
                <Bot size={16} className="text-[#0D9E75]" />
                AI Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6B7280]">Conversations handled</span>
                <span className="font-semibold text-[#0A1628]">—</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6B7280]">Escalations to you</span>
                <span className={cn('font-semibold', escalations > 0 ? 'text-amber-600' : 'text-[#0A1628]')}>{escalations}</span>
              </div>
              <div className="pt-2 border-t border-black/8 text-xs text-[#6B7280]">
                Tenants are chatting with your AI 24/7 — you only see what needs you.
              </div>
            </CardContent>
          </Card>

          {/* Open maintenance */}
          <Card className="border-black/8 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0A1628] flex items-center gap-2">
                <Wrench size={16} className="text-[#0D9E75]" />
                Maintenance Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {openIssues.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No open issues. All clear.</p>
              ) : (
                openIssues.slice(0, 4).map(issue => (
                  <div key={issue.id} className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[#0A1628] truncate">{issue.title}</p>
                    <Badge
                      variant="outline"
                      className={cn('text-xs shrink-0 border', {
                        'bg-red-50 text-red-700 border-red-200': issue.priority === 'emergency' || issue.priority === 'urgent',
                        'bg-amber-50 text-amber-700 border-amber-200': issue.priority === 'medium',
                        'bg-gray-50 text-gray-500 border-gray-200': issue.priority === 'low',
                      })}
                    >
                      {issue.priority}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  color: 'emerald' | 'amber' | 'navy'
}) {
  const iconBg = { emerald: 'bg-emerald-50 text-[#0D9E75]', amber: 'bg-amber-50 text-amber-600', navy: 'bg-[#EEF0F5] text-[#0A1628]' }
  return (
    <Card className="border-black/8 shadow-none">
      <CardContent className="pt-5">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', iconBg[color])}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div className="text-2xl font-semibold text-[#0A1628] leading-tight">{value}</div>
        <div className="text-xs text-[#6B7280] mt-1">{label}</div>
        <div className="text-xs text-[#6B7280] mt-0.5 font-medium">{sub}</div>
      </CardContent>
    </Card>
  )
}
