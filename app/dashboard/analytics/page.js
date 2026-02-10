'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const C = { mint: '#6ECBB5', mintD: '#3AAE8C', blue: '#6366F1', orange: '#F59E0B', pink: '#EC4899', red: '#E45B5B' };

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetch(`/api/analytics?days=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const ov = data?.overview || { totalScans: 0, uniqueVisitors: 0, totalQR: 0, activeQR: 0, scanChange: '+0%' };
  const scansByDay = data?.scansByDay?.length > 0 ? data.scansByDay : [];
  const devices = data?.devices?.length > 0 ? data.devices : [];
  const topCountries = data?.topCountries?.length > 0 ? data.topCountries : [];
  const browsers = data?.browsers?.length > 0 ? data.browsers : [];
  const topQR = data?.topQRCodes || [];
  const hourly = data?.hourlyDistribution || [];

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
          <p className="text-sm text-brand-text-dim mt-1">Track scans, devices, locations, and performance</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold cursor-pointer">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {loading ? <div className="text-center py-20 text-brand-text-dim">Loading analytics...</div> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Scans', value: ov.totalScans.toLocaleString(), change: ov.scanChange, color: C.mint },
              { label: 'Unique Visitors', value: ov.uniqueVisitors.toLocaleString(), color: C.blue },
              { label: 'Active QR Codes', value: ov.activeQR, color: C.orange },
              { label: 'Total QR Codes', value: ov.totalQR, color: C.pink },
            ].map((s, i) => (
              <div key={i} className="card p-5">
                <span className="label !mb-2">{s.label}</span>
                <div className="text-[26px] font-extrabold tracking-tight">{s.value}</div>
                {s.change && <div className={`text-[11px] font-bold mt-1 ${s.change.startsWith('+') ? 'text-green-500' : 'text-brand-red'}`}>{s.change} vs prev period</div>}
              </div>
            ))}
          </div>

          {/* Scan Trends */}
          <div className="card p-5 mb-4">
            <h3 className="text-sm font-bold mb-4">Scan Trends</h3>
            {scansByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scansByDay}>
                  <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.mint} stopOpacity={.3}/><stop offset="100%" stopColor={C.mint} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9E8E4" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:'#9A9A90'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:'#9A9A90'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{borderRadius:12,border:'1px solid #E9E8E4',fontSize:12}}/>
                  <Area type="monotone" dataKey="scans" stroke={C.mint} fill="url(#gA)" strokeWidth={2.5}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-center py-12 text-brand-text-dim text-sm">No scan data yet. Share your QR codes to start tracking.</p>}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Devices */}
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4">Devices</h3>
              {devices.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={devices.map(d=>({name:d.device,value:d.count}))} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                        {devices.map((_,i)=><Cell key={i} fill={[C.mint,C.blue,C.orange][i%3]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:10,fontSize:12}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {devices.map((d,i)=>(
                      <span key={i} className="text-[11px] font-bold text-brand-text-mid flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm" style={{background:[C.mint,C.blue,C.orange][i%3]}}/>
                        {d.device} ({d.count})
                      </span>
                    ))}
                  </div>
                </>
              ) : <p className="text-center py-10 text-brand-text-dim text-sm">No data</p>}
            </div>

            {/* Top Countries */}
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4">Top Countries</h3>
              {topCountries.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topCountries.slice(0,6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E8E4" horizontal={false}/>
                    <XAxis type="number" tick={{fontSize:10,fill:'#9A9A90'}} axisLine={false} tickLine={false}/>
                    <YAxis type="category" dataKey="country" tick={{fontSize:11,fill:'#555',fontWeight:600}} axisLine={false} tickLine={false} width={55}/>
                    <Tooltip contentStyle={{borderRadius:10,fontSize:12}}/>
                    <Bar dataKey="scans" fill={C.mint} radius={[0,6,6,0]} barSize={16}/>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-10 text-brand-text-dim text-sm">No geo data</p>}
            </div>

            {/* Browsers */}
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4">Browsers</h3>
              {browsers.length > 0 ? (
                <div className="space-y-3">
                  {browsers.map((b,i) => {
                    const total = browsers.reduce((s,x)=>s+x.count,0);
                    const pct = Math.round((b.count/total)*100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="font-bold">{b.browser}</span>
                          <span className="text-brand-text-dim">{pct}% ({b.count})</span>
                        </div>
                        <div className="h-2 bg-brand-card-alt rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${pct}%`,background:[C.mint,C.blue,C.orange,C.pink,C.red][i%5]}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-center py-10 text-brand-text-dim text-sm">No data</p>}
            </div>
          </div>

          {/* Hourly + Top QR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hourly */}
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4">Scans by Hour</h3>
              {hourly.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={hourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E8E4" vertical={false}/>
                    <XAxis dataKey="hour" tick={{fontSize:9,fill:'#9A9A90'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:9,fill:'#9A9A90'}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{borderRadius:10,fontSize:12}}/>
                    <Bar dataKey="scans" fill={C.blue} radius={[4,4,0,0]} barSize={12}/>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-10 text-brand-text-dim text-sm">No data</p>}
            </div>

            {/* Top QR */}
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4">Top Performing QR Codes</h3>
              {topQR.length > 0 ? topQR.slice(0,6).map((q,i) => (
                <div key={q.id} className="flex items-center gap-3 py-2 border-b border-brand-border last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-mint-ghost flex items-center justify-center text-brand-mint-dark text-[11px] font-extrabold flex-shrink-0">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold truncate">{q.name}</div>
                    <div className="text-[10px] text-brand-text-dim">{q.type} · {q.contentType}</div>
                  </div>
                  <span className="text-[12px] font-bold">{q.scans}</span>
                </div>
              )) : <p className="text-center py-10 text-brand-text-dim text-sm">No QR codes yet</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
