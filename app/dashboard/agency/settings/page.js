'use client';
import Link from 'next/link';
export default function Page() {
  return (
    <div style={{ animation: 'fadeUp .5s ease both' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', color: '#111' }}>🎨 White-Label Settings</h1>
          <p style={{ fontSize: 13, color: '#9A9A90', marginTop: 4 }}>Custom domain, branding, portal config</p>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E9E8E4', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 6 }}>White-Label Settings</h3>
        <p style={{ fontSize: 13, color: '#9A9A90', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.6 }}>Custom domain, branding, portal config. Upgrade to access this feature.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Link href="/dashboard/billing" style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Upgrade Plan</Link>
          <Link href="/dashboard" style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #E9E8E4', color: '#555', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Back</Link>
        </div>
      </div>
    </div>
  );
}
