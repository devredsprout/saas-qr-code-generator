'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchQR = () => {
    const params = new URLSearchParams({ search, ...(typeFilter && { type: typeFilter }) });
    fetch(`/api/qr?${params}`)
      .then(r => r.json())
      .then(d => { setQrCodes(d.qrCodes || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchQR(); }, [search, typeFilter]);

  const toggleActive = async (id, isActive) => {
    await fetch(`/api/qr/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) });
    fetchQR();
  };

  const deleteQR = async (id) => {
    if (!confirm('Delete this QR code? This cannot be undone.')) return;
    await fetch(`/api/qr/${id}`, { method: 'DELETE' });
    fetchQR();
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">QR Codes</h1>
          <p className="text-sm text-brand-text-dim mt-1">{qrCodes.length} total QR code{qrCodes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/qr-codes/new" className="btn-primary btn-mint no-underline !text-[13px]">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          Create QR Code
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <input className="input-field !w-64" placeholder="Search QR codes..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field !w-40">
          <option value="">All Types</option>
          <option value="STATIC">Static</option>
          <option value="DYNAMIC">Dynamic</option>
        </select>
      </div>

      {/* QR Code List */}
      {loading ? (
        <div className="text-center py-20 text-brand-text-dim">Loading...</div>
      ) : qrCodes.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-mint-ghost mx-auto mb-4 flex items-center justify-center">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-brand-mint-dark"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /></svg>
          </div>
          <h3 className="text-lg font-bold mb-2">No QR codes yet</h3>
          <p className="text-sm text-brand-text-dim mb-4">Create your first QR code to get started</p>
          <Link href="/dashboard/qr-codes/new" className="btn-primary btn-mint no-underline">Create QR Code →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {qrCodes.map(qr => (
            <div key={qr.id} className="card p-4 flex items-center gap-4 hover:border-brand-mint">
              {/* QR Preview */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr.type === 'DYNAMIC' ? `${appUrl}/r/${qr.shortCode}` : (qr.staticData || ''))}&size=80x80&color=${qr.fgColor.replace('#', '')}&bgcolor=${qr.bgColor.replace('#', '')}`}
                alt={qr.name}
                className="w-14 h-14 rounded-lg border border-brand-border flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14px] font-bold truncate">{qr.name}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${qr.type === 'DYNAMIC' ? 'bg-blue-50 text-brand-blue' : 'bg-brand-card-alt text-brand-text-dim'}`}>{qr.type}</span>
                  {!qr.isActive && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-brand-red">PAUSED</span>}
                </div>
                <div className="text-[11px] text-brand-text-dim font-mono truncate">
                  {qr.type === 'DYNAMIC' ? `${appUrl}/r/${qr.shortCode}` : (qr.staticData || '').substring(0, 50)}
                </div>
                {qr.type === 'DYNAMIC' && qr.destinationUrl && (
                  <div className="text-[10px] text-brand-text-ghost mt-0.5 truncate">→ {qr.destinationUrl}</div>
                )}
              </div>

              {/* Scans */}
              <div className="text-center px-4 flex-shrink-0">
                <div className="text-lg font-extrabold">{qr._count?.scans || 0}</div>
                <div className="text-[10px] text-brand-text-dim">scans</div>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0">
                <Link href={`/dashboard/qr-codes/${qr.id}`} className="btn-ghost !py-1.5 !px-3 !text-[11px] no-underline">Edit</Link>
                <button onClick={() => toggleActive(qr.id, qr.isActive)} className={`btn-ghost !py-1.5 !px-3 !text-[11px] ${qr.isActive ? '' : '!border-green-300 !text-green-600'}`}>
                  {qr.isActive ? 'Pause' : 'Activate'}
                </button>
                <button onClick={() => deleteQR(qr.id)} className="btn-ghost !py-1.5 !px-3 !text-[11px] !text-brand-red !border-red-200 hover:!bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
