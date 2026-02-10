'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function QRDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editUrl, setEditUrl] = useState('');
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState('');

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    fetch(`/api/qr/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setQr(d);
        setEditUrl(d.destinationUrl || '');
        setEditName(d.name || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const saveChanges = async () => {
    setSaving(true);
    setMsg('');
    const body = { name: editName };
    if (qr.type === 'DYNAMIC') body.destinationUrl = editUrl;

    const res = await fetch(`/api/qr/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setQr(prev => ({ ...prev, ...updated }));
      setMsg('Saved!');
      setTimeout(() => setMsg(''), 2000);
    } else {
      setMsg('Error saving');
    }
    setSaving(false);
  };

  const togglePause = async () => {
    const res = await fetch(`/api/qr/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !qr.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setQr(prev => ({ ...prev, ...updated }));
    }
  };

  const copyLink = () => {
    const link = `${appUrl}/r/${qr.shortCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-center py-20 text-brand-text-dim">Loading...</div>;
  if (!qr) return <div className="text-center py-20 text-brand-text-dim">QR code not found</div>;

  const shortUrl = `${appUrl}/r/${qr.shortCode}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr.type === 'DYNAMIC' ? shortUrl : qr.staticData)}&size=${qr.size}x${qr.size}&color=${qr.fgColor.replace('#', '')}&bgcolor=${qr.bgColor.replace('#', '')}&ecc=${qr.errorCorrection}`;

  return (
    <div className="animate-fade-up max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard/qr-codes')} className="btn-ghost !py-1.5 !px-3 !text-xs">← Back</button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{qr.name}</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qr.type === 'DYNAMIC' ? 'bg-blue-50 text-brand-blue' : 'bg-brand-card-alt text-brand-text-dim'}`}>{qr.type}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qr.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-brand-red'}`}>{qr.isActive ? 'ACTIVE' : 'PAUSED'}</span>
          </div>
          <p className="text-xs text-brand-text-dim mt-0.5 font-mono">{shortUrl}</p>
        </div>
        <button onClick={togglePause} className={`btn-ghost !text-[12px] ${qr.isActive ? '!text-brand-red !border-red-200' : '!text-green-600 !border-green-200'}`}>
          {qr.isActive ? '⏸ Pause' : '▶ Activate'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Edit Destination (Dynamic only) */}
          {qr.type === 'DYNAMIC' && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="label !mb-0">Destination URL</label>
                <span className="text-[10px] text-brand-mint-dark font-bold">✏️ Editable anytime</span>
              </div>
              <div className="flex gap-2">
                <input className="input-field flex-1" value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="https://..." />
                <button onClick={saveChanges} disabled={saving} className="btn-primary btn-mint !text-[12px] !px-5">
                  {saving ? '...' : 'Save'}
                </button>
              </div>
              {msg && <p className={`text-[11px] mt-2 font-bold ${msg === 'Saved!' ? 'text-green-500' : 'text-brand-red'}`}>{msg}</p>}
              <p className="text-[10px] text-brand-text-ghost mt-2">Change this URL without reprinting your QR code. All existing scans will redirect to the new destination.</p>
            </div>
          )}

          {/* Rename */}
          <div className="card p-5">
            <label className="label">QR Code Name</label>
            <div className="flex gap-2">
              <input className="input-field flex-1" value={editName} onChange={e => setEditName(e.target.value)} />
              <button onClick={saveChanges} disabled={saving} className="btn-ghost !text-[12px]">Rename</button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="card p-4 text-center">
              <div className="text-2xl font-extrabold">{qr._count?.scans || 0}</div>
              <div className="text-[10px] text-brand-text-dim font-bold">Total Scans</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-extrabold">{qr.contentType}</div>
              <div className="text-[10px] text-brand-text-dim font-bold">Content Type</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-extrabold">{qr.errorCorrection}</div>
              <div className="text-[10px] text-brand-text-dim font-bold">Error Level</div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-3">Recent Scans</h3>
            {qr.scans?.length > 0 ? (
              <div className="space-y-1.5">
                {qr.scans.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-brand-card-alt text-[12px]">
                    <span className="font-bold text-brand-text-mid w-20">{s.deviceType || '—'}</span>
                    <span className="text-brand-text-dim">{s.browser || '—'} · {s.os || '—'}</span>
                    <span className="flex-1" />
                    <span className="text-brand-text-dim">{s.country || '—'} {s.city ? `· ${s.city}` : ''}</span>
                    <span className="text-brand-text-ghost text-[10px]">{new Date(s.scannedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-text-dim text-center py-6">No scans yet. Share this QR code to start tracking!</p>
            )}
          </div>

          {/* UTM Info */}
          {(qr.utmSource || qr.utmMedium || qr.utmCampaign) && (
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-3">UTM Tracking</h3>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {qr.utmSource && <div><span className="text-brand-text-dim">Source:</span> <span className="font-bold">{qr.utmSource}</span></div>}
                {qr.utmMedium && <div><span className="text-brand-text-dim">Medium:</span> <span className="font-bold">{qr.utmMedium}</span></div>}
                {qr.utmCampaign && <div><span className="text-brand-text-dim">Campaign:</span> <span className="font-bold">{qr.utmCampaign}</span></div>}
                {qr.utmContent && <div><span className="text-brand-text-dim">Content:</span> <span className="font-bold">{qr.utmContent}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: QR Image + Download */}
        <div>
          <div className="card p-6 text-center sticky top-6">
            <div className="p-4 rounded-2xl bg-white border border-brand-border inline-block mb-4" style={{ backgroundColor: qr.bgColor }}>
              <img src={qrImageUrl} alt={qr.name} className="w-48 h-48 block" />
            </div>

            {/* Short URL */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 p-2.5 rounded-lg bg-brand-card-alt border border-brand-border text-[11px] font-mono text-brand-text-mid truncate">{shortUrl}</div>
              <button onClick={copyLink} className={`btn-ghost !py-2 !px-3 !text-[11px] ${copied ? '!border-green-300 !text-green-600' : ''}`}>{copied ? '✓' : '📋'}</button>
            </div>

            {/* Download */}
            <a href={qrImageUrl} download={`qr-${qr.shortCode}.png`} target="_blank" rel="noopener noreferrer" className="btn-primary btn-mint w-full !py-3 no-underline mb-2 !text-[13px]">
              ⬇ Download PNG
            </a>
            <a href={qrImageUrl.replace('format=png', 'format=svg').replace(/&$/, '') + '&format=svg'} download={`qr-${qr.shortCode}.svg`} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full !text-[12px] no-underline">
              ⬇ Download SVG
            </a>

            {/* Meta */}
            <div className="mt-4 text-[10px] text-brand-text-ghost">
              Created {new Date(qr.createdAt).toLocaleDateString()}<br />
              {qr.size}×{qr.size}px · EC: {qr.errorCorrection}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
