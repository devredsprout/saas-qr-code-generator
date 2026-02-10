'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return; }

      // Auto login
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) { setError('Account created. Please log in.'); setLoading(false); }
      else router.push('/dashboard');
    } catch (err) {
      setError('Network error'); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white"/></svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
          <p className="text-sm text-brand-text-dim mt-1">Free plan · 10 QR codes · No credit card</p>
        </div>

        <div className="card p-6">
          <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-brand-border bg-white text-sm font-bold text-brand-text cursor-pointer transition-all hover:border-brand-border-focus mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-brand-border" /><span className="text-xs text-brand-text-ghost font-semibold">OR</span><div className="flex-1 h-px bg-brand-border" /></div>
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">{error}</div>}
            <div className="mb-3"><label className="label">Full Name</label><input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Rajesh Singh" required /></div>
            <div className="mb-3"><label className="label">Email</label><input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required /></div>
            <div className="mb-4"><label className="label">Password</label><input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} /></div>
            <button type="submit" className="btn-primary btn-mint w-full !py-3.5" disabled={loading}>{loading ? 'Creating...' : 'Create Free Account'}</button>
          </form>
        </div>
        <p className="text-center text-sm text-brand-text-dim mt-4">Already have an account? <Link href="/auth/login" className="text-brand-mint-dark font-bold no-underline">Log in →</Link></p>
      </div>
    </div>
  );
}
