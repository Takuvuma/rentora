'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Bot, Bell, Eye, EyeOff, Copy, Check, Wifi, WifiOff, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Landlord = Record<string, any>

const PAYMENT_METHODS = [
  { value: 'ecocash',       label: 'EcoCash' },
  { value: 'cash',          label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'payfast',       label: 'PayFast' },
  { value: 'card',          label: 'Card' },
]

const REMINDER_DAYS = [7, 3, 1]

const WEBHOOK_URL = 'https://rentora.agency/api/whatsapp/webhook'

export function SettingsClient({ landlord }: { landlord: Landlord }) {
  const router = useRouter()
  const supabase = createClient()

  // Card 1 — Profile
  const [profile, setProfile] = useState({
    full_name: landlord.full_name ?? '',
    email: landlord.email ?? '',
    phone: landlord.phone ?? '',
    country: landlord.country ?? 'ZW',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Card 2 — AI Agent & WhatsApp
  const [wa, setWa] = useState({
    whatsapp_phone_number_id: landlord.whatsapp_phone_number_id ?? '',
    whatsapp_access_token: landlord.whatsapp_access_token ?? '',
  })
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savingWa, setSavingWa] = useState(false)

  // Card 3 — Payment Channels
  const [ecocash, setEcocash] = useState({
    ecocash_merchant_number: landlord.ecocash_merchant_number ?? '',
    ecocash_merchant_name: landlord.ecocash_merchant_name ?? '',
  })
  const [payMethods, setPayMethods] = useState<string[]>(
    landlord.accepted_payment_methods ?? ['ecocash', 'cash']
  )
  const [savingPayments, setSavingPayments] = useState(false)

  // Card 4 — Rent Reminders
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(
    landlord.reminders_enabled ?? true
  )
  const [reminderDays, setReminderDays] = useState<number[]>(
    landlord.reminder_days_before ?? [7, 3, 1]
  )
  const [savingReminders, setSavingReminders] = useState(false)

  const isWhatsAppConnected = !!(landlord.whatsapp_phone_number_id)

  async function saveProfile() {
    setSavingProfile(true)
    const { error } = await supabase
      .from('landlords')
      .update({ full_name: profile.full_name, email: profile.email, phone: profile.phone, country: profile.country })
      .eq('id', landlord.id)
    if (error) { toast.error(error.message); setSavingProfile(false); return }
    toast.success('Profile updated')
    setSavingProfile(false)
    router.refresh()
  }

  async function saveWhatsApp() {
    setSavingWa(true)
    const { error } = await supabase
      .from('landlords')
      .update({
        whatsapp_phone_number_id: wa.whatsapp_phone_number_id.trim() || null,
        whatsapp_access_token: wa.whatsapp_access_token.trim() || null,
      })
      .eq('id', landlord.id)
    if (error) { toast.error(error.message); setSavingWa(false); return }
    toast.success('WhatsApp credentials saved')
    setSavingWa(false)
    router.refresh()
  }

  function copyWebhook() {
    if (!navigator.clipboard) { toast.error('Copy not supported in this browser'); return }
    navigator.clipboard.writeText(WEBHOOK_URL)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
      .catch(() => toast.error('Failed to copy'))
  }

  function togglePaymentMethod(method: string) {
    setPayMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    )
  }

  async function savePayments() {
    if (payMethods.length === 0) { toast.error('Select at least one accepted payment method'); return }
    setSavingPayments(true)
    const { error } = await supabase
      .from('landlords')
      .update({
        ecocash_merchant_number: ecocash.ecocash_merchant_number.trim() || null,
        ecocash_merchant_name: ecocash.ecocash_merchant_name.trim() || null,
        accepted_payment_methods: payMethods,
      })
      .eq('id', landlord.id)
    if (error) { toast.error(error.message); setSavingPayments(false); return }
    toast.success('Payment settings saved')
    setSavingPayments(false)
    router.refresh()
  }

  function toggleReminderDay(day: number) {
    setReminderDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function saveReminders() {
    if (remindersEnabled && reminderDays.length === 0) {
      toast.error('Select at least one reminder interval')
      return
    }
    setSavingReminders(true)
    const { error } = await supabase
      .from('landlords')
      .update({ reminders_enabled: remindersEnabled, reminder_days_before: reminderDays })
      .eq('id', landlord.id)
    if (error) { toast.error(error.message); setSavingReminders(false); return }
    toast.success('Reminder settings saved')
    setSavingReminders(false)
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0A1628]">Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Control your AI agent, payment channels, and notification preferences</p>
      </div>

      {/* ── Card 1: Profile ── */}
      <Card className="border-black/8 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-[#0A1628]">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                placeholder="Tafadzwa Moyo"
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                type="tel"
                placeholder="+263 77 123 4567"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <select
                value={profile.country}
                onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ZW">🇿🇼 Zimbabwe</option>
                <option value="ZA">🇿🇦 South Africa</option>
                <option value="NG">🇳🇬 Nigeria</option>
                <option value="KE">🇰🇪 Kenya</option>
                <option value="GH">🇬🇭 Ghana</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={saveProfile}
              disabled={savingProfile || !profile.full_name || !profile.email}
              className="bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
            >
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: AI Agent & WhatsApp ── */}
      <Card className="border-black/8 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-[#0A1628] flex items-center gap-2">
                <Bot size={16} className="text-[#0D9E75]" />
                AI Agent & WhatsApp
              </CardTitle>
              <p className="text-xs text-[#6B7280] mt-1">Your AI handles messages 24/7 so you don&apos;t have to</p>
            </div>
            <Badge
              variant="outline"
              className={cn('shrink-0 text-xs border flex items-center gap-1.5',
                isWhatsAppConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              )}
            >
              {isWhatsAppConnected
                ? <><Wifi size={11} /> Active</>
                : <><WifiOff size={11} /> Not connected</>
              }
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status banner */}
          <div className="flex items-center gap-3 bg-[#0D9E75]/8 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[#0D9E75]/15 flex items-center justify-center shrink-0">
              <Bot size={15} className="text-[#0D9E75]" />
            </div>
            <p className="text-sm text-[#0A1628]">
              {isWhatsAppConnected
                ? 'AI agent is live — automatically replying to tenant messages around the clock.'
                : 'Connect your WhatsApp Business account below to activate the AI agent.'}
            </p>
          </div>

          {/* Phone Number ID */}
          <div className="space-y-1.5">
            <Label>WhatsApp Phone Number ID</Label>
            <Input
              placeholder="123456789012345"
              value={wa.whatsapp_phone_number_id}
              onChange={e => setWa(w => ({ ...w, whatsapp_phone_number_id: e.target.value }))}
            />
          </div>

          {/* Access Token */}
          <div className="space-y-1.5">
            <Label>Access Token</Label>
            <div className="relative">
              <Input
                type={showToken ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="EAAxxxxx…"
                value={wa.whatsapp_access_token}
                onChange={e => setWa(w => ({ ...w, whatsapp_access_token: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A1628]"
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="space-y-1.5">
            <Label>Webhook URL <span className="text-[#6B7280] font-normal">(paste this into Meta)</span></Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={WEBHOOK_URL}
                className="font-mono text-xs text-[#6B7280] bg-[#FAF8F3] cursor-default"
              />
              <Button
                variant="outline"
                onClick={copyWebhook}
                className="shrink-0 border-black/10 rounded-full gap-1.5"
              >
                {copied ? <Check size={13} className="text-[#0D9E75]" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Setup guide */}
          <div className="bg-[#FAF8F3] rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[#0A1628] mb-2">How to connect in 5 steps</p>
            {[
              'Go to Meta Business Manager → WhatsApp → API Setup',
              'Copy your Phone Number ID and paste it above',
              'Generate a permanent access token and paste it above',
              'Click Save, then copy the Webhook URL above',
              'In Meta → Webhooks → paste the URL and subscribe to "messages"',
            ].map((step, i) => (
              <div key={i} className="flex gap-2 text-xs text-[#6B7280]">
                <span className="shrink-0 w-4 h-4 rounded-full bg-[#0A1628]/8 flex items-center justify-center text-[10px] font-semibold text-[#0A1628]">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>

          <Button
            onClick={saveWhatsApp}
            disabled={savingWa}
            className="w-full bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
          >
            {savingWa ? 'Saving…' : 'Save WhatsApp Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* ── Card 3: Payment Channels ── */}
      <Card className="border-black/8 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-[#0A1628]">Payment Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* EcoCash merchant details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>EcoCash Merchant Number</Label>
              <Input
                placeholder="0771234567"
                value={ecocash.ecocash_merchant_number}
                onChange={e => setEcocash(ec => ({ ...ec, ecocash_merchant_number: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>EcoCash Merchant Name <span className="text-[#6B7280] font-normal">(optional)</span></Label>
              <Input
                placeholder="Moyo Properties"
                value={ecocash.ecocash_merchant_name}
                onChange={e => setEcocash(ec => ({ ...ec, ecocash_merchant_name: e.target.value }))}
              />
            </div>
          </div>

          {/* Accepted payment methods */}
          <div>
            <p className="text-sm font-medium text-[#0A1628] mb-3">Accepted payment methods</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map(m => (
                <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payMethods.includes(m.value)}
                    onChange={() => togglePaymentMethod(m.value)}
                    className="w-4 h-4 accent-[#0D9E75] cursor-pointer"
                  />
                  <span className="text-sm text-[#0A1628]">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={savePayments}
              disabled={savingPayments}
              className="bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
            >
              {savingPayments ? 'Saving…' : 'Save Payment Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 4: Rent Reminders ── */}
      <Card className="border-black/8 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-[#0A1628] flex items-center gap-2">
            <Bell size={16} className="text-[#0D9E75]" />
            Rent Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0A1628]">Automatic reminders</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Send via WhatsApp before rent is due</p>
            </div>
            <button
              type="button"
              onClick={() => setRemindersEnabled(v => !v)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors shrink-0',
                remindersEnabled ? 'bg-[#0D9E75]' : 'bg-gray-200'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                remindersEnabled ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          {/* Day checkboxes */}
          {remindersEnabled && (
            <div>
              <p className="text-sm font-medium text-[#0A1628] mb-3">Send reminder how many days before due?</p>
              <div className="flex gap-6">
                {REMINDER_DAYS.map(day => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderDays.includes(day)}
                      onChange={() => toggleReminderDay(day)}
                      className="w-4 h-4 accent-[#0D9E75] cursor-pointer"
                    />
                    <span className="text-sm text-[#0A1628]">{day} day{day !== 1 ? 's' : ''} before</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Helper */}
          <p className="text-xs text-[#6B7280]">
            Reminders are sent via WhatsApp automatically when your AI agent is connected and active.
          </p>

          <div className="flex justify-end">
            <Button
              onClick={saveReminders}
              disabled={savingReminders}
              className="bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full"
            >
              {savingReminders ? 'Saving…' : 'Save Reminder Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Sign Out ── */}
      <div className="pt-2 pb-6">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
          }}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )
}
