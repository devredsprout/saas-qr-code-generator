'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { href: '/dashboard/qr-codes', label: 'QR Codes', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>, pro: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className={`${collapsed ? 'w-[64px]' : 'w-[240px]'} bg-white border-r border-brand-border flex flex-col sticky top-0 h-screen transition-all duration-200 flex-shrink-0 overflow-hidden`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)', boxShadow: '0 2px 8px rgba(110,203,181,.22)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white"/></svg>
        </div>
        {!collapsed && <div><div className="text-[15px] font-extrabold leading-none tracking-tight">RedSprout<span className="text-brand-mint-dark"> QR</span></div><div className="text-[9.5px] text-brand-text-dim font-semibold tracking-wide">SaaS Platform</div></div>}
      </div>

      {/* Create Button */}
      <div className="px-3 mb-3">
        <Link href="/dashboard/qr-codes/new" className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-none text-white text-[13px] font-bold cursor-pointer no-underline transition-all ${collapsed ? 'px-0' : 'px-4'}`} style={{ background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)', boxShadow: '0 2px 12px rgba(110,203,181,.2)' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          {!collapsed && 'Create QR Code'}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2">
        {NAV.map(n => {
          const active = pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium no-underline transition-all ${active ? 'bg-brand-mint-ghost text-brand-mint-dark font-bold' : 'text-brand-text-mid hover:text-brand-text hover:bg-brand-card-alt'} ${collapsed ? 'justify-center' : ''}`}>
              <span className="flex-shrink-0">{n.icon}</span>
              {!collapsed && <span className="flex-1">{n.label}</span>}
              {!collapsed && n.pro && <span className="text-[9px] font-bold text-brand-mint-dark bg-brand-mint-ghost px-2 py-0.5 rounded-full">PRO</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && session?.user && (
        <div className="px-3 pb-4">
          <div className="p-3 rounded-xl bg-brand-card-alt border border-brand-border">
            <div className="text-[12px] font-bold text-brand-text truncate">{session.user.name || session.user.email}</div>
            <div className="text-[10px] text-brand-text-dim truncate">{session.user.email}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="badge !text-[9px] !px-2">{session.user.plan || 'FREE'}</span>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-[10px] text-brand-red font-bold bg-transparent border-none cursor-pointer">Log out</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
