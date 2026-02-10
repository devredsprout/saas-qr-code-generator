'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const COLORS = { mint: '#6ECBB5', mintD: '#3AAE8C', blue: '#6366F1', orange: '#F59E0B', pink: '#EC4899' };

function StatCard({ label, value, change, children }) {
  const positive = change?.startsWith('+');
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-2">
        <span className="label !mb-0">{label}</span>
        {children}
      </div>
      <div className="text-[26px] font-extrabold tracking-tight">{value}</div>
      {change && <div className={`text-[11px] font-bold mt-1 ${positive ? 'text-green-500' : 'text-brand-red'}`}>{change} vs prev period</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetch(`/api/analytics?days=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  // Generate mock data if no real data yet
  const scansByDay = data?.scansByDay?.length > 0 ? data.scansByDay : Array.from({ length: 30 }, (_, i) => ({ date: `Day ${i + 1}`, scans: 0 }));
  const devices = data?.devices?.length > 0 ? data.devices : [{ device: 'No data', count: 1 }];
  const topCountries = data?.topCountries?.length > 0 ? data.topCountries : [];
  const topQRCodes = data?.topQRCodes || [];
  const overview = data?.overview || { totalScans: 0, uniqueVisitors: 0, totalQR: 0, activeQR: 0, scanChange: '+0%' };

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-brand-text-dim mt-1">Overview of your QR code performance</p>
        </div>
        <div className="flex gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-text-mid cursor-pointer">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Link href="/dashboard/qr-codes/new" className="btn-primary btn-mint no-underline !text-[13px]">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
            New QR
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Scans" value={overview.totalScans.toLocaleString()} change={overview.scanChange}>
          <div className="w-8 h-8 rounded-lg bg-brand-mint-ghost flex items-center justify-center text-brand-mint-dark">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </StatCard>
        <StatCard label="Unique Visitors" value={overview.uniqueVisitors.toLocaleString()}>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-brand-blue">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" /></svg>
          </div>
        </StatCard>
        <StatCard label="Total QR Codes" value={overview.totalQR}>
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-brand-orange">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /></svg>
          </div>
        </StatCard>
        <StatCard label="Active QR Codes" value={overview.activeQR}>
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </StatCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        {/* Scan Trend */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold mb-4">Scan Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={scansByDay}>
              <defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.mint} stopOpacity={.3} /><stop offset="100%" stopColor={COLORS.mint} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E8E4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9A9A90' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9A9A90' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E9E8E4', fontSize: 12 }} />
              <Area type="monotone" dataKey="scans" stroke={COLORS.mint} fill="url(#gm)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Devices */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4">Devices</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={devices.map((d, i) => ({ name: d.device, value: d.count }))} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {devices.map((_, i) => <Cell key={i} fill={[COLORS.mint, COLORS.blue, COLORS.orange][i % 3]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {devices.map((d, i) => (
              <span key={i} className="text-[11px] font-bold text-brand-text-mid flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm" style={{ background: [COLORS.mint, COLORS.blue, COLORS.orange][i % 3] }} />
                {d.device} ({d.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top Countries */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4">Top Countries</h3>
          {topCountries.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E8E4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9A9A90' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: '#555550', fontWeight: 600 }} axisLine={false} tickLine={false} width={60} />
                <Bar dataKey="scans" fill={COLORS.mint} radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-brand-text-dim text-sm">No scan data yet. Share your QR codes to start tracking!</div>
          )}
        </div>

        {/* Top QR Codes */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold">Top QR Codes</h3>
            <Link href="/dashboard/qr-codes" className="text-[11px] font-bold text-brand-mint-dark no-underline">View All →</Link>
          </div>
          {topQRCodes.length > 0 ? topQRCodes.slice(0, 5).map((q, i) => (
            <div key={q.id} className="flex items-center gap-3 py-2.5 border-b border-brand-border last:border-0">
              <div className="w-8 h-8 rounded-lg bg-brand-mint-ghost flex items-center justify-center text-brand-mint-dark text-xs font-extrabold flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate">{q.name}</div>
                <div className="text-[10px] text-brand-text-dim">{q.type} · {q.contentType}</div>
              </div>
              <div className="text-[12px] font-bold text-brand-text-mid">{q.scans} scans</div>
            </div>
          )) : (
            <div className="text-center py-10">
              <p className="text-brand-text-dim text-sm mb-3">No QR codes yet</p>
              <Link href="/dashboard/qr-codes/new" className="btn-primary btn-mint !text-[12px] !py-2 no-underline">Create Your First QR →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
