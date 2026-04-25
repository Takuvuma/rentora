import Link from 'next/link'
import { WaitlistForm } from '@/components/waitlist-form'

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="512" height="512" rx="112" fill="#0A1628"/>
    <path d="M144 220L256 108L368 220Z" fill="#0D9E75"/>
    <path d="M168 220L168 404Q168 416 180 416L220 416Q232 416 232 404L232 320L268 320L320 416Q326 416 332 416L372 416Q384 416 380 404L328 312Q368 296 368 252Q368 216 328 210L180 210Q168 210 168 220Z" fill="#0D9E75"/>
    <path d="M232 250L232 296L300 296Q328 296 328 274Q328 250 300 250Z" fill="#0A1628"/>
    <circle cx="400" cy="124" r="14" fill="#1BC99A"/>
  </svg>
)

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', color: '#0A1628', background: '#FAF8F3', overflowX: 'hidden' }}>

      <style>{`
        /* ── Responsive overrides ── */
        .nav-links { display: flex; }
        .nav-mobile-cta { display: none !important; }
        .hero-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; align-items: center; }
        .hero-cards { display: block; }
        .hero-stats { display: flex; gap: 2rem; }
        .problem-grid { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid rgba(255,255,255,0.08); }
        .problem-stat:nth-child(n+2) { padding-left: 1.5rem; }
        .problem-stat:nth-child(-n+3) { border-right: 1px solid rgba(255,255,255,0.08); }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .market-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .section-inner { padding: 0 2rem; }
        .hero-section { padding: 10rem 0 6rem; }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }

        @media (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .market-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .problem-grid { grid-template-columns: repeat(2, 1fr) !important; border-top: none !important; }
          .problem-stat { border-top: 1px solid rgba(255,255,255,0.08) !important; }
          .problem-stat:nth-child(2n) { border-right: none !important; }
          .problem-stat:nth-child(2n+1) { border-right: 1px solid rgba(255,255,255,0.08) !important; padding-left: 0 !important; }
          .problem-stat:nth-child(n+2) { padding-left: 1.5rem; }
          .problem-stat:nth-child(odd) { padding-left: 0 !important; }
        }

        @media (max-width: 767px) {
          .nav-links { display: none !important; }
          .nav-mobile-cta { display: flex !important; }
          .section-inner { padding: 0 1.25rem !important; }
          .hero-section { padding: 7rem 0 3.5rem !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .hero-cards { display: none !important; }
          .hero-stats { flex-wrap: wrap; gap: 1rem 1.5rem !important; }
          .problem-grid { grid-template-columns: repeat(2, 1fr) !important; border-top: none !important; }
          .problem-stat { border-top: 1px solid rgba(255,255,255,0.08) !important; }
          .problem-stat:nth-child(odd) { padding-left: 0 !important; border-right: 1px solid rgba(255,255,255,0.08) !important; }
          .problem-stat:nth-child(even) { border-right: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .market-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column; align-items: flex-start !important; gap: 1.25rem !important; }
          .step-grid { grid-template-columns: 40px 1fr !important; gap: 1rem !important; }
        }

        /* Animations */
        @keyframes float-a { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float-b { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
        @keyframes float-c { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate-float-a { animation: float-a 5s ease-in-out infinite; }
        .animate-float-b { animation: float-b 6s ease-in-out infinite; }
        .animate-float-c { animation: float-c 7s ease-in-out infinite; }
        .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .animate-fade-up   { animation: fade-up .7s ease both; }
        .animate-fade-up-1 { animation: fade-up .7s .1s ease both; }
        .animate-fade-up-2 { animation: fade-up .7s .2s ease both; }
        .animate-fade-up-3 { animation: fade-up .7s .3s ease both; }
        .animate-fade-up-4 { animation: fade-up .7s .4s ease both; }
        .animate-fade-up-5 { animation: fade-up .7s .5s ease both; }
        .reveal { opacity:0; transform:translateY(24px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.visible { opacity:1; transform:none; }
        .feature-card:hover { border-color: rgba(13,158,117,0.3) !important; transform: translateY(-2px); transition: all 0.2s; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(250,248,243,0.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(10,22,40,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.5rem', color: '#0A1628', textDecoration: 'none' }}>
            <Logo />
            Rentora
          </a>
          {/* Desktop nav links */}
          <div className="nav-links" style={{ gap: '2rem', alignItems: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
            <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }} className="hover:text-[#0A1628]">Features</a>
            <a href="#how" style={{ textDecoration: 'none', color: 'inherit' }} className="hover:text-[#0A1628]">How it works</a>
            <a href="#market" style={{ textDecoration: 'none', color: 'inherit' }} className="hover:text-[#0A1628]">Who it&apos;s for</a>
            <Link href="/login" style={{ textDecoration: 'none', color: '#6B7280', fontSize: '0.8125rem', fontWeight: 500 }}>Sign in</Link>
            <Link href="#waitlist" style={{ background: '#0A1628', color: '#FAF8F3', padding: '0.6rem 1.25rem', borderRadius: '100px', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>Join waitlist</Link>
          </div>
          {/* Mobile nav: just two buttons */}
          <div className="nav-mobile-cta" style={{ gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6B7280', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/signup" style={{ background: '#0A1628', color: '#FAF8F3', padding: '0.55rem 1rem', borderRadius: '100px', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>Get started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="section-inner">
          <div className="hero-grid">
            {/* Left */}
            <div>
              <span className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.85rem', borderRadius: '100px', background: 'rgba(13,158,117,0.08)', border: '1px solid rgba(13,158,117,0.25)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0D9E75', fontWeight: 500, marginBottom: '2rem' }}>
                <span className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1BC99A', display: 'inline-block' }} />
                Now in beta · Zimbabwe &amp; South Africa
              </span>

              <h1 className="animate-fade-up-1" style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 400, fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)', lineHeight: 0.98, letterSpacing: '-0.02em', color: '#0A1628', marginBottom: '1.5rem' }}>
                Your AI property<br />manager. <em style={{ fontStyle: 'italic', color: '#0D9E75' }}>Automated.</em>
              </h1>

              <p className="animate-fade-up-2" style={{ fontSize: 'clamp(1rem, 1.35vw, 1.2rem)', color: '#6B7280', maxWidth: '540px', lineHeight: 1.65, marginBottom: '2.5rem' }}>
                Rentora handles tenant communication, rent collection, and maintenance — so you collect the rent without the stress. Built for landlords in Africa, ready for the world.
              </p>

              <div className="animate-fade-up-3" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/signup" style={{ background: '#0A1628', color: '#FAF8F3', padding: '0.95rem 1.75rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Get started free →
                </Link>
                <a href="#how" style={{ padding: '0.95rem 1.75rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 500, color: '#0A1628', border: '1px solid rgba(10,22,40,0.12)', background: 'transparent', textDecoration: 'none' }}>
                  See how it works
                </a>
              </div>

              <div className="animate-fade-up-4 hero-stats" style={{ marginTop: '3rem', fontSize: '0.8125rem', color: '#6B7280' }}>
                <span><strong style={{ color: '#0A1628', fontWeight: 500 }}>10×</strong> faster rent collection</span>
                <span><strong style={{ color: '#0A1628', fontWeight: 500 }}>24/7</strong> AI tenant support</span>
                <span><strong style={{ color: '#0A1628', fontWeight: 500 }}>0</strong> app downloads required</span>
              </div>
            </div>

            {/* Right — floating cards (hidden on mobile) */}
            <div className="animate-fade-up-5 hero-cards" style={{ position: 'relative', height: '520px' }}>
              <div style={{ position: 'absolute', top: '20%', left: '20%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(13,158,117,0.18), transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />

              <div className="animate-float-a" style={{ position: 'absolute', top: '1rem', left: '5%', width: '280px', background: 'white', border: '1px solid rgba(10,22,40,0.08)', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: '0 20px 60px rgba(10,22,40,0.08)', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(13,158,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9E75', fontSize: '1rem', fontWeight: 600, flexShrink: 0 }}>$</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0A1628' }}>Rudo Madondo paid rent</div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 1 }}>Unit 1B · via EcoCash · 2 min ago</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.95rem', fontWeight: 500, color: '#0D9E75', fontFamily: 'var(--font-geist-mono), monospace' }}>+$280</div>
                </div>
              </div>

              <div className="animate-float-b" style={{ position: 'absolute', top: '8rem', right: '5%', width: '300px', background: 'white', border: '1px solid rgba(10,22,40,0.08)', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: '0 20px 60px rgba(10,22,40,0.08)', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(10,22,40,0.08)' }}>
                  <span className="animate-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#1BC99A', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#0D9E75', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rentora AI</span>
                </div>
                <div style={{ padding: '0.55rem 0.8rem', borderRadius: '14px 14px 4px 14px', fontSize: '0.8rem', lineHeight: 1.45, marginBottom: '0.4rem', background: '#0D9E75', color: 'white', marginLeft: 'auto', maxWidth: '85%' }}>
                  When is rent due this month?
                </div>
                <div style={{ padding: '0.55rem 0.8rem', borderRadius: '4px 14px 14px 14px', fontSize: '0.8rem', lineHeight: 1.45, background: '#F5F2EA', color: '#0A1628', maxWidth: '92%' }}>
                  Your May rent of $280 is due on the 1st. I&apos;ve set a WhatsApp reminder for 3 days before. Need a payment plan?
                </div>
              </div>

              <div className="animate-float-c" style={{ position: 'absolute', bottom: '1rem', left: '10%', width: '240px', background: 'white', border: '1px solid rgba(10,22,40,0.08)', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: '0 20px 60px rgba(10,22,40,0.08)', zIndex: 1 }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280', marginBottom: '0.4rem', fontWeight: 500 }}>Occupancy</div>
                <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '2rem', color: '#0A1628', lineHeight: 1 }}>87%</div>
                <div style={{ fontSize: '0.75rem', color: '#0D9E75', marginTop: '0.35rem', fontWeight: 500 }}>↑ 12 of 14 units filled</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM BAND ── */}
      <section style={{ background: '#0A1628', color: 'white', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-10%', top: '-30%', width: '50%', height: '140%', background: 'radial-gradient(circle, rgba(13,158,117,0.08), transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }} className="section-inner">
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0D9E75', fontWeight: 500, marginBottom: '1rem' }}>The problem</div>
          <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'white', maxWidth: '680px', marginBottom: '1.25rem' }}>
            Managing a rental in Africa is broken.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', marginBottom: '4rem', lineHeight: 1.6 }}>
            From the landlord with one flat to the agency with 200 units, most still run their business on WhatsApp, paper, and memory.
          </p>

          <div className="problem-grid">
            {[
              { num: '6h', lbl: 'per month chasing rent', sub: 'Calls, WhatsApps, follow-ups — every month.' },
              { num: '38%', lbl: 'of rent collected late', sub: 'No automation. Reminders forgotten.' },
              { num: '1:4', lbl: 'issues reach the landlord', sub: 'Maintenance lost in scattered texts.' },
              { num: '0', lbl: 'portfolio visibility', sub: 'Spreadsheets that never match.' },
            ].map((stat, i) => (
              <div key={i} className="problem-stat" style={{ padding: '2.5rem 1.5rem 2rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1, color: '#1BC99A', marginBottom: '0.75rem' }}>{stat.num}</div>
                <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500, marginBottom: '0.35rem' }}>{stat.lbl}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '6rem 0 5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="section-inner">
          <div className="reveal">
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', fontWeight: 500, marginBottom: '1rem' }}>The solution</div>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '680px', marginBottom: '1.25rem' }}>
              Everything a property manager does. Automated.
            </h2>
          </div>

          <div className="features-grid reveal" style={{ marginTop: '3.5rem' }}>
            {[
              { title: 'AI tenant chat', body: 'Tenants get instant answers to maintenance requests, lease questions, and payment queries — 24/7, no calls to you.', icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/> },
              { title: 'Automated rent collection', body: 'EcoCash, PayFast, card — with smart WhatsApp reminders 7, 3, and 1 day before rent is due.', icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
              { title: 'Maintenance workflows', body: 'Tenants log issues with photos. AI triages priority. Contractors get assigned. Status tracked end-to-end.', icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/> },
              { title: 'Portfolio dashboard', body: 'All your properties, occupancy rates, and revenue in one clean view. Scale to 100 units without adding headcount.', icon: <><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></> },
              { title: 'Lease management', body: 'Digital lease signing, renewal reminders, and document storage — fully compliant and always accessible.', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
              { title: 'Built for Africa', body: 'Mobile-first design, EcoCash + PayFast integration, WhatsApp-native. Architecture that scales globally from day one.', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ background: 'white', border: '1px solid rgba(10,22,40,0.08)', borderRadius: '16px', padding: '2rem 1.75rem', cursor: 'default' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F2EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9E75', marginBottom: '1.25rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">{f.icon}</svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.35rem', fontWeight: 400, lineHeight: 1.2, color: '#0A1628', marginBottom: '0.55rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.925rem', color: '#6B7280', lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '5rem 0 6rem', background: '#F5F2EA' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="section-inner">
          <div className="reveal">
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', fontWeight: 500, marginBottom: '1rem' }}>How it works</div>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '680px' }}>
              Three steps to running your property on autopilot.
            </h2>
          </div>

          <div style={{ marginTop: '4rem' }}>
            {[
              { num: '01', title: 'Add your properties and tenants', body: 'Onboard in under 10 minutes. Import leases, configure units, invite tenants by phone. Rentora sends them a WhatsApp link — no app download required.' },
              { num: '02', title: 'Rentora takes over the day-to-day', body: 'AI handles tenant messages. Rent reminders go out on WhatsApp. Maintenance requests get triaged and assigned. Documents stay organised — without you lifting a finger.' },
              { num: '03', title: 'Check your dashboard. Collect the rent.', body: 'Log in when it matters. Review portfolio health, approve big decisions, and watch your rental income arrive — predictably and on time, every month.' },
            ].map((step, i) => (
              <div key={i} className="reveal step-grid" style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '2rem', alignItems: 'flex-start', padding: '2.25rem 0', borderBottom: i < 2 ? '1px solid rgba(10,22,40,0.08)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '2.5rem', lineHeight: 1, color: '#0D9E75', fontStyle: 'italic' }}>{step.num}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(1.35rem, 2vw, 1.75rem)', fontWeight: 400, lineHeight: 1.15, color: '#0A1628', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '1rem', color: '#6B7280', maxWidth: '560px', lineHeight: 1.6 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKET ── */}
      <section id="market" style={{ padding: '6rem 0 5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="section-inner">
          <div className="reveal">
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', fontWeight: 500, marginBottom: '1rem' }}>Who it&apos;s for</div>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '680px' }}>
              Whether you have 1 unit or 1,000 — Rentora scales with you.
            </h2>
          </div>

          <div className="market-grid reveal" style={{ marginTop: '3.5rem' }}>
            {[
              { tag: 'Individual landlords', tagStyle: { background: 'rgba(13,158,117,0.12)', color: '#0D9E75' }, title: 'The one-flat owner.', body: "Rent out your spare unit without losing weekends to WhatsApp threads and payment reminders. Free for up to 3 units.", units: '1–5 units', price: 'Free forever' },
              { tag: 'Growing portfolios', tagStyle: { background: 'rgba(10,22,40,0.08)', color: '#0A1628' }, title: 'The small property business.', body: "You've outgrown spreadsheets but can't afford a full-time property manager. Rentora is your AI operations team.", units: '6–50 units', price: '$5 / unit / month' },
              { tag: 'Agencies & managers', tagStyle: { background: 'rgba(239,159,39,0.15)', color: '#B77A0C' }, title: 'The property company.', body: 'Manage hundreds of units across multiple properties with dedicated support, custom integrations, and API access.', units: '50+ units', price: 'Custom pricing' },
            ].map((seg, i) => (
              <div key={i} className="reveal" style={{ background: 'white', border: '1px solid rgba(10,22,40,0.08)', borderRadius: '16px', padding: '2rem 1.75rem' }}>
                <span style={{ display: 'inline-block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, padding: '0.3rem 0.65rem', borderRadius: '100px', marginBottom: '1.25rem', ...seg.tagStyle }}>{seg.tag}</span>
                <h3 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.5rem', lineHeight: 1.2, color: '#0A1628', marginBottom: '0.75rem' }}>{seg.title}</h3>
                <p style={{ fontSize: '0.925rem', color: '#6B7280', marginBottom: '1.25rem', lineHeight: 1.55 }}>{seg.body}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(10,22,40,0.08)', fontSize: '0.8rem' }}>
                  <span style={{ color: '#6B7280' }}>{seg.units}</span>
                  <span style={{ color: '#0A1628', fontWeight: 500, fontFamily: 'var(--font-geist-mono), monospace' }}>{seg.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section id="waitlist" style={{ padding: '7rem 0', background: '#0A1628', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(13,158,117,0.12), transparent 65%)', filter: 'blur(60px)', zIndex: 0 }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }} className="section-inner">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'white', marginBottom: '1.25rem' }}>
              Be the first landlord<br />who never worries <em style={{ color: '#1BC99A', fontStyle: 'italic' }}>again</em>.
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Join the early-access waitlist. We&apos;re onboarding landlords in Harare and Johannesburg now.
            </p>

            <WaitlistForm />

            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', flexWrap: 'wrap' }}>
              <span>🇿🇼 Zimbabwe</span>
              <span>🇿🇦 South Africa</span>
              <span>+ Africa 2026</span>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1rem' }}>Already have an account?</p>
              <Link href="/login" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
                Sign in →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '3rem 0 2rem', background: '#FAF8F3', borderTop: '1px solid rgba(10,22,40,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="section-inner">
          <div className="footer-inner">
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.15rem', color: '#0A1628', textDecoration: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <rect width="512" height="512" rx="112" fill="#0A1628"/>
                <path d="M144 220L256 108L368 220Z" fill="#0D9E75"/>
                <path d="M168 220L168 404Q168 416 180 416L220 416Q232 416 232 404L232 320L268 320L320 416Q326 416 332 416L372 416Q384 416 380 404L328 312Q368 296 368 252Q368 216 328 210L180 210Q168 210 168 220Z" fill="#0D9E75"/>
                <path d="M232 250L232 296L300 296Q328 296 328 274Q328 250 300 250Z" fill="#0A1628"/>
                <circle cx="400" cy="124" r="14" fill="#1BC99A"/>
              </svg>
              Rentora
            </a>
            <p style={{ fontSize: '0.8125rem', color: '#6B7280' }}>© 2025 Rentora · Property management, automated.</p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem', color: '#6B7280' }}>
              <a href="mailto:founders@rentora.co" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</a>
              <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</a>
              <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: `
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      ` }} />

    </div>
  )
}
