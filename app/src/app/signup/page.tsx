'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RentoraLogo } from '@/components/rentora-logo'
import { Building2, Users, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'

type Role = 'landlord' | 'tenant' | null
type Step = 'role' | 'form'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<Role>(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    dialCode: '+263',
    phoneNumber: '',
    password: '',
    country: 'ZW',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function selectCountry(code: string) {
    const c = COUNTRIES.find(c => c.code === code)
    if (c) setForm(prev => ({ ...prev, country: code, dialCode: c.dial }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fullPhone = `${form.dialCode}${form.phoneNumber.replace(/^0/, '')}`

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: fullPhone, country: form.country },
        emailRedirectTo: 'https://rentora.agency/auth/callback',
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('landlords').insert({
        user_id: data.user.id,
        full_name: form.fullName,
        email: form.email,
        phone: fullPhone,
        country: form.country as string,
        subscription_tier: 'starter',
      })
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <RentoraLogo />
        </div>

        {/* ── Step 1: Role selection ── */}
        {step === 'role' && (
          <div className="bg-white border border-black/8 rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-[#0A1628] mb-1">Who are you?</h1>
            <p className="text-sm text-[#6B7280] mb-6">Choose the account type that fits you</p>

            <div className="space-y-3">
              <button
                onClick={() => { setRole('landlord'); setStep('form') }}
                className={cn(
                  'w-full text-left rounded-xl border-2 p-4 transition-all',
                  role === 'landlord'
                    ? 'border-[#0A1628] bg-[#0A1628]/5'
                    : 'border-black/10 hover:border-[#0A1628]/40 bg-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A1628]/8 flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-[#0A1628]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628] text-sm">I&apos;m a Landlord</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Manage properties, tenants, and rent collection</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('tenant')}
                className={cn(
                  'w-full text-left rounded-xl border-2 p-4 transition-all',
                  role === 'tenant'
                    ? 'border-[#0D9E75] bg-[#0D9E75]/5'
                    : 'border-black/10 hover:border-[#0D9E75]/40 bg-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0D9E75]/8 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-[#0D9E75]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628] text-sm">I&apos;m a Tenant</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Pay rent, report issues, chat with your AI assistant</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Tenant info panel */}
            {role === 'tenant' && (
              <div className="mt-4 bg-[#FAF8F3] rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-[#0A1628]">Tenants join via invite</p>
                <p className="text-xs text-[#6B7280]">
                  Ask your landlord to add you to Rentora. You&apos;ll get a WhatsApp message from the AI assistant automatically once they set you up — no app download needed.
                </p>
              </div>
            )}

            <p className="text-center text-sm text-[#6B7280] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0D9E75] font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* ── Step 2: Landlord signup form ── */}
        {step === 'form' && (
          <div className="bg-white border border-black/8 rounded-2xl p-8 shadow-sm">
            <button
              onClick={() => setStep('role')}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0A1628] mb-5 -ml-1"
            >
              <ArrowLeft size={15} /> Back
            </button>

            <h1 className="text-2xl font-semibold text-[#0A1628] mb-1">Create your account</h1>
            <p className="text-sm text-[#6B7280] mb-6">Free forever for up to 3 units</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  placeholder="Tafadzwa Moyo"
                  value={form.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Country</Label>
                <select
                  value={form.country}
                  onChange={e => selectCountry(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">WhatsApp number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-[#FAF8F3] text-sm font-medium text-[#0A1628] shrink-0 min-w-18">
                    {COUNTRIES.find(c => c.code === form.country)?.flag} {form.dialCode}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="77 123 4567"
                    value={form.phoneNumber}
                    onChange={e => update('phoneNumber', e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-[11px] text-[#6B7280]">Leading 0 is removed automatically · stored as {form.dialCode}{form.phoneNumber.replace(/^0/, '') || 'XXXXXXXXX'}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full h-11"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Get started free →'}
              </Button>
            </form>

            <p className="text-center text-sm text-[#6B7280] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0D9E75] font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
