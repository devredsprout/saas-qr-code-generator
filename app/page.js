import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white"/></svg>
            </div>
            <div>
              <div className="text-[17px] font-extrabold tracking-tight leading-none">RedSprout<span className="text-brand-mint-dark"> QR</span></div>
              <div className="text-[10px] text-brand-text-dim font-medium tracking-wider">DYNAMIC QR PLATFORM</div>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/auth/login" className="btn-ghost no-underline">Log In</Link>
            <Link href="/auth/register" className="btn-primary btn-mint no-underline !text-[13px]">Get Started Free →</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center pt-20 pb-10 px-6">
        <span className="badge mb-4 inline-flex">✦ Now with Dynamic QR + Analytics</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-[1.08] max-w-[680px] mx-auto">
          QR codes you can<br /><span className="text-brand-mint-dark">edit after printing</span>.
        </h1>
        <p className="text-brand-text-mid text-lg mt-4 max-w-[520px] mx-auto leading-relaxed">
          Create dynamic QR codes, track every scan, A/B test destinations, and manage everything from one dashboard.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/auth/register" className="btn-primary btn-mint !text-base !px-8 !py-4 no-underline">Start Free — No Credit Card →</Link>
        </div>
        <p className="text-brand-text-ghost text-xs mt-3">Free plan includes 10 QR codes · No credit card required</p>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: '🔄', title: 'Dynamic QR Codes', desc: 'Change the destination URL anytime — even after printing thousands of flyers.' },
          { icon: '📊', title: 'Real-Time Analytics', desc: 'Track scans by device, location, time, browser. UTM support for campaign ROI.' },
          { icon: '🛡️', title: 'Anti-Phishing Security', desc: 'Safe scan preview, Google Safe Browsing checks, domain allowlists.' },
          { icon: '🍽️', title: 'Restaurant Mode', desc: 'Table-specific QR menus with allergy filters, call waiter, and feedback.' },
          { icon: '🔀', title: 'Smart Routing', desc: 'Route scans by country, device, language, or time. A/B test destinations.' },
          { icon: '🏷️', title: 'GS1 Digital Link', desc: 'Product packaging compliance for GS1 Sunrise 2027 + India FSSAI templates.' },
        ].map((f, i) => (
          <div key={i} className="card p-6">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="text-base font-bold text-brand-dark mb-1.5">{f.title}</h3>
            <p className="text-sm text-brand-text-dim leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-brand-dark rounded-3xl max-w-4xl mx-auto px-8 py-16 text-center mb-16 mx-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[80px]" style={{ background: 'rgba(110,203,181,.2)' }} />
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3 relative">Ready to upgrade your QR game?</h2>
        <p className="text-white/50 text-base mb-8 relative">Free plan available. Upgrade anytime.</p>
        <Link href="/auth/register" className="btn-primary btn-mint !text-base !px-8 !py-4 no-underline relative">Create Free Account →</Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border py-6 text-center text-xs text-brand-text-dim">
        Built by <a href="https://redsproutdigital.com" target="_blank" rel="noopener noreferrer" className="text-brand-mint-dark font-bold no-underline">RedSprout Digital</a> · © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
