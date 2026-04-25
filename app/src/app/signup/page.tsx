'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RentoraLogo } from '@/components/rentora-logo'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', country: 'ZW' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone, country: form.country },
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
        phone: form.phone,
        country: form.country as 'ZW' | 'ZA',
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

        <div className="bg-white border border-black/8 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#0A1628] mb-1">Create your account</h1>
          <p className="text-sm text-[#6B7280] mb-6">Free forever for up to 3 units</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="Tafadzwa Moyo" value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (WhatsApp)</Label>
              <Input id="phone" type="tel" placeholder="+263 77 123 4567" value={form.phone} onChange={e => update('phone', e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                value={form.country}
                onChange={e => update('country', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ZW">🇿🇼 Zimbabwe</option>
                <option value="ZA">🇿🇦 South Africa</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full bg-[#0A1628] hover:bg-[#0D9E75] text-white rounded-full h-11" disabled={loading}>
              {loading ? 'Creating account…' : 'Get started free →'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0D9E75] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
