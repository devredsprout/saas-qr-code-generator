'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CONTENT_TYPES = [
  { id: 'URL', label: 'URL', icon: '🔗' },{ id: 'TEXT', label: 'Text', icon: '📝' },{ id: 'EMAIL', label: 'Email', icon: '✉️' },
  { id: 'PHONE', label: 'Phone', icon: '📞' },{ id: 'WIFI', label: 'WiFi', icon: '📶' },{ id: 'VCARD', label: 'vCard', icon: '👤' },
];
const FG_COLORS = ['#000000','#1a1a2e','#16213e','#374151','#166534','#7c3aed','#be123c','#0f766e'];
const BG_COLORS = ['#ffffff','#f8f8f8','#f0f0ec','#e8f5e9','#e0f5ef','#fef9e7','#fce4ec','#e3f2fd'];

function buildStaticData(ct, f) {
  switch(ct) {
    case 'URL': return f.url||''; case 'TEXT': return f.text||'';
    case 'EMAIL': return `mailto:${f.email||''}?subject=${encodeURIComponent(f.subject||'')}&body=${encodeURIComponent(f.body||'')}`;
    case 'PHONE': return `tel:${f.phone||''}`;
    case 'WIFI': return `WIFI:T:${f.enc||'WPA'};S:${f.ssid||''};P:${f.pass||''};;`;
    case 'VCARD': return `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name||''}\nTEL:${f.vph||''}\nEMAIL:${f.vem||''}\nORG:${f.org||''}\nURL:${f.vurl||''}\nEND:VCARD`;
    default: return '';
  }
}

export default function NewQRPage() {
  const router = useRouter();
  const [qrType, setQrType] = useState('DYNAMIC');
  const [contentType, setContentType] = useState('URL');
  const [qrName, setQrName] = useState('');
  const [fields, setFields] = useState({});
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [ec, setEc] = useState('M');
  const [safePreview, setSafePreview] = useState(false);
  const [showUTM, setShowUTM] = useState(false);
  const [utm, setUtm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sf = (k,v) => setFields(p=>({...p,[k]:v}));
  const su = (k,v) => setUtm(p=>({...p,[k]:v}));
  const data = contentType === 'URL' ? (fields.url||'') : buildStaticData(contentType, fields);
  const isValid = qrName.trim() && data.length >= 3;
  const previewData = qrType === 'DYNAMIC' ? 'https://qr.redsproutdigital.com/r/preview' : data;
  const previewUrl = data.length >= 3 ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(previewData)}&size=300x300&color=${fgColor.replace('#','')}&bgcolor=${bgColor.replace('#','')}&ecc=${ec}` : '';

  const handleSubmit = async () => {
    if (!isValid) return; setLoading(true); setError('');
    const payload = { name: qrName, type: qrType, contentType, fgColor, bgColor, size: 400, errorCorrection: ec, safePreview,
      ...(qrType === 'DYNAMIC' && contentType === 'URL' && { destinationUrl: fields.url }),
      ...(qrType === 'STATIC' && { staticData: data }),
      ...(qrType === 'DYNAMIC' && contentType !== 'URL' && { destinationUrl: data }),
      ...(showUTM && { utmSource: utm.source, utmMedium: utm.medium, utmCampaign: utm.campaign, utmContent: utm.content }),
    };
    try {
      const res = await fetch('/api/qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) { setError(result.error || 'Failed'); setLoading(false); return; }
      router.push(`/dashboard/qr-codes/${result.id}`);
    } catch { setError('Network error'); setLoading(false); }
  };

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn-ghost !py-1.5 !px-3 !text-xs">← Back</button>
        <div><h1 className="text-2xl font-extrabold tracking-tight">Create QR Code</h1></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="card p-5"><label className="label">QR Code Name</label><input className="input-field" value={qrName} onChange={e => setQrName(e.target.value)} placeholder="e.g., Website Link, WiFi Guest" /></div>
          <div className="card p-5"><label className="label mb-3">QR Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[{id:'STATIC',label:'Static',desc:'Fixed content',badge:'Free'},{id:'DYNAMIC',label:'Dynamic',desc:'Editable + trackable',badge:'Pro'}].map(t => (
                <button key={t.id} onClick={() => setQrType(t.id)} className={`p-4 rounded-xl border-[1.5px] text-left transition-all cursor-pointer ${qrType===t.id?'border-brand-mint bg-brand-mint-ghost':'border-brand-border bg-white'}`}>
                  <div className="flex justify-between items-start mb-1"><span className="text-sm font-bold">{t.label}</span><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${t.id==='DYNAMIC'?'bg-blue-50 text-brand-blue':'bg-brand-card-alt text-brand-text-dim'}`}>{t.badge}</span></div>
                  <p className="text-[11px] text-brand-text-dim">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="card p-5"><label className="label mb-3">Content Type</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {CONTENT_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setContentType(ct.id)} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all ${contentType===ct.id?'border-brand-mint bg-brand-mint-ghost text-brand-mint-dark':'border-brand-border text-brand-text-dim'}`}>
                  <span className="text-lg">{ct.icon}</span><span className="text-[11px] font-bold">{ct.label}</span>
                </button>
              ))}
            </div>
            {contentType === 'URL' && <div><label className="label">Destination URL</label><input className="input-field" value={fields.url||''} onChange={e => sf('url',e.target.value)} placeholder="https://redsproutdigital.com" /></div>}
            {contentType === 'TEXT' && <div><label className="label">Text</label><textarea className="input-field resize-y" rows={4} value={fields.text||''} onChange={e => sf('text',e.target.value)} placeholder="Enter text..." /></div>}
            {contentType === 'EMAIL' && <><div className="mb-2"><label className="label">Email</label><input className="input-field" value={fields.email||''} onChange={e => sf('email',e.target.value)} placeholder="hello@company.com" /></div><div className="mb-2"><label className="label">Subject</label><input className="input-field" value={fields.subject||''} onChange={e => sf('subject',e.target.value)} /></div><div><label className="label">Body</label><textarea className="input-field resize-y" rows={3} value={fields.body||''} onChange={e => sf('body',e.target.value)} /></div></>}
            {contentType === 'PHONE' && <div><label className="label">Phone</label><input className="input-field" value={fields.phone||''} onChange={e => sf('phone',e.target.value)} placeholder="+91 98765 43210" /></div>}
            {contentType === 'WIFI' && <><div className="mb-2"><label className="label">SSID</label><input className="input-field" value={fields.ssid||''} onChange={e => sf('ssid',e.target.value)} /></div><div className="mb-2"><label className="label">Password</label><input className="input-field" value={fields.pass||''} onChange={e => sf('pass',e.target.value)} /></div><div><label className="label">Security</label><div className="flex gap-1.5">{['WPA','WEP','nopass'].map(enc => <button key={enc} onClick={() => sf('enc',enc)} className={`btn-ghost !py-1.5 !text-[11px] ${(fields.enc||'WPA')===enc?'!border-brand-mint !text-brand-mint-dark !bg-brand-mint-ghost':''}`}>{enc==='nopass'?'None':enc}</button>)}</div></div></>}
            {contentType === 'VCARD' && <div className="grid grid-cols-2 gap-2"><div><label className="label">Full Name</label><input className="input-field" value={fields.name||''} onChange={e=>sf('name',e.target.value)} /></div><div><label className="label">Phone</label><input className="input-field" value={fields.vph||''} onChange={e=>sf('vph',e.target.value)} /></div><div><label className="label">Email</label><input className="input-field" value={fields.vem||''} onChange={e=>sf('vem',e.target.value)} /></div><div><label className="label">Organization</label><input className="input-field" value={fields.org||''} onChange={e=>sf('org',e.target.value)} /></div><div className="col-span-2"><label className="label">Website</label><input className="input-field" value={fields.vurl||''} onChange={e=>sf('vurl',e.target.value)} /></div></div>}
          </div>
          <div className="card p-5"><div className="flex items-center justify-between cursor-pointer" onClick={() => setShowUTM(!showUTM)}><label className="label !mb-0">UTM Campaign Tracking</label><span className="text-xs text-brand-text-dim">{showUTM?'▼':'▶'}</span></div>
            {showUTM && <div className="grid grid-cols-2 gap-2 mt-3"><div><label className="label">Source</label><input className="input-field" value={utm.source||''} onChange={e=>su('source',e.target.value)} placeholder="google, qr" /></div><div><label className="label">Medium</label><input className="input-field" value={utm.medium||''} onChange={e=>su('medium',e.target.value)} placeholder="print, social" /></div><div><label className="label">Campaign</label><input className="input-field" value={utm.campaign||''} onChange={e=>su('campaign',e.target.value)} /></div><div><label className="label">Content</label><input className="input-field" value={utm.content||''} onChange={e=>su('content',e.target.value)} /></div></div>}
          </div>
          <div className="card p-5"><label className="label mb-3">Appearance</label>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div><label className="label">QR Color</label><div className="flex gap-1.5 flex-wrap">{FG_COLORS.map(c=><button key={c} onClick={()=>setFgColor(c)} className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${fgColor===c?'border-brand-mint scale-110':'border-brand-border'}`} style={{background:c}}/>)}</div></div>
              <div><label className="label">Background</label><div className="flex gap-1.5 flex-wrap">{BG_COLORS.map(c=><button key={c} onClick={()=>setBgColor(c)} className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${bgColor===c?'border-brand-mint scale-110':'border-brand-border'}`} style={{background:c}}/>)}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Error Correction</label><div className="flex gap-1.5">{['L','M','Q','H'].map(e=><button key={e} onClick={()=>setEc(e)} className={`btn-ghost !py-1.5 !px-3 !text-[11px] flex-1 text-center ${ec===e?'!border-brand-mint !text-brand-mint-dark !bg-brand-mint-ghost':''}`}>{e}</button>)}</div></div>
              <div><label className="label">Safe Preview</label><button onClick={()=>setSafePreview(!safePreview)} className={`btn-ghost !text-[11px] w-full ${safePreview?'!border-brand-mint !text-brand-mint-dark !bg-brand-mint-ghost':''}`}>🛡️ {safePreview?'Enabled':'Disabled'}</button></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2"><div className="card p-6 text-center sticky top-6">
          <label className="label mb-3">Preview</label>
          <div className="p-5 rounded-2xl bg-white border border-brand-border inline-block mb-4" style={{backgroundColor:bgColor}}>
            {previewUrl ? <img src={previewUrl} alt="QR" className="w-48 h-48 block" /> : <div className="w-48 h-48 flex items-center justify-center"><div className="text-center"><div className="text-3xl mb-2">📸</div><p className="text-[12px] text-brand-text-dim">Enter content to preview</p></div></div>}
          </div>
          <div className="text-[11px] text-brand-text-dim font-mono mb-4">{qrType} · {contentType} · {ec}</div>
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold mb-2">{error}</div>}
          <button onClick={handleSubmit} disabled={!isValid||loading} className="btn-primary btn-mint w-full !py-3.5 !text-[14px]">{loading?'Creating...':'⚡ Create QR Code'}</button>
          {qrType === 'DYNAMIC' && <p className="text-[10px] text-brand-text-ghost mt-3">A unique short URL will be generated. You can change the destination anytime.</p>}
        </div></div>
      </div>
    </div>
  );
}
