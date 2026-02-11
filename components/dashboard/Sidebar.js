'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const NAV = [
  { section: "Core", items: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/qr-codes', label: 'QR Codes', icon: '📱' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈', badge: 'PRO' },
  ]},
  { section: "Industry", items: [
    { href: '/dashboard/restaurant', label: 'Restaurant', icon: '🍽️', badge: 'BIZ' },
    { href: '/dashboard/packaging', label: 'Packaging', icon: '📦', badge: 'BIZ' },
  ]},
  { section: "Agency", items: [
    { href: '/dashboard/agency/clients', label: 'Clients', icon: '🏢', badge: 'AGY' },
    { href: '/dashboard/agency/settings', label: 'White-Label', icon: '🎨', badge: 'AGY' },
  ]},
  { section: "Account", items: [
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
    { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
  ]},
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside style={{ width: collapsed ? 64 : 240, background: '#fff', borderRight: '1px solid #E9E8E4', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', transition: 'width .2s', flexShrink: 0, overflow: 'hidden' }}>
      <div onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', cursor: 'pointer' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(110,203,181,.22)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white"/></svg>
        </div>
        {!collapsed && <div><div style={{ fontSize: 14, fontWeight: 800, color: '#111', letterSpacing: '-.02em' }}>RedSprout<span style={{ color: '#3AAE8C' }}> QR</span></div><div style={{ fontSize: 9, color: '#9A9A90', fontWeight: 600 }}>SaaS Platform</div></div>}
      </div>
      <div style={{ padding: '0 10px', marginBottom: 10 }}>
        <Link href="/dashboard/qr-codes/new" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: collapsed ? '10px 0' : '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)', color: '#fff', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 12px rgba(110,203,181,.2)' }}>
          <span style={{ fontSize: 15 }}>+</span>{!collapsed && 'Create QR Code'}
        </Link>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {NAV.map(section => (
          <div key={section.section} style={{ marginBottom: 8 }}>
            {!collapsed && <div style={{ fontSize: 9.5, fontWeight: 800, color: '#C4C4BB', textTransform: 'uppercase', letterSpacing: '.06em', padding: '8px 10px 4px' }}>{section.section}</div>}
            {section.items.map(n => {
              const active = pathname === n.href || (n.href !== '/dashboard' && pathname?.startsWith(n.href));
              return (
                <Link key={n.href} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, fontSize: 12.5, fontWeight: active ? 700 : 500, textDecoration: 'none', background: active ? 'rgba(110,203,181,.08)' : 'transparent', color: active ? '#3AAE8C' : '#555550', transition: 'all .15s', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
                  {!collapsed && <span style={{ flex: 1 }}>{n.label}</span>}
                  {!collapsed && n.badge && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: n.badge === 'PRO' ? 'rgba(110,203,181,.1)' : n.badge === 'AGY' ? 'rgba(124,58,237,.1)' : 'rgba(245,158,11,.1)', color: n.badge === 'PRO' ? '#3AAE8C' : n.badge === 'AGY' ? '#7C3AED' : '#F59E0B' }}>{n.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      {!collapsed && session?.user && (
        <div style={{ padding: '0 10px 12px' }}>
          <div style={{ padding: 10, borderRadius: 10, background: '#FAFAF8', border: '1px solid #E9E8E4' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1C1C1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user.name || session.user.email}</div>
            <div style={{ fontSize: 9.5, color: '#9A9A90', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user.email}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 8.5, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(110,203,181,.08)', color: '#3AAE8C' }}>{session.user.plan || 'FREE'}</span>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{ fontSize: 9.5, color: '#E45B5B', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
