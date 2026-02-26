'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', company: '', website: '' });
  const [stats, setStats] = useState({ plan: 'FREE', totalQR: 0, totalScans: 0, createdAt: '' });

  // Password fields
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(d => {
        if (d.error) return;
        setProfile({ name: d.name || '', email: d.email || '', phone: d.phone || '', company: d.company || '', website: d.website || '' });
        setStats({ plan: d.plan, totalQR: d._count?.qrCodes || 0, totalScans: d.totalScans || 0, createdAt: d.createdAt });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          company: profile.company,
          website: profile.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showMsg('error', data.error || 'Failed to save'); setSaving(false); return; }
      showMsg('success', 'Profile updated successfully!');
      // Update session name
      if (data.name && updateSession) {
        await updateSession({ name: data.name });
      }
    } catch {
      showMsg('error', 'Network error');
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (pw.newPassword !== pw.confirmPassword) {
      showMsg('error', 'New passwords do not match');
      return;
    }
    if (pw.newPassword.length < 8) {
      showMsg('error', 'Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { showMsg('error', data.error || 'Failed to change password'); setSaving(false); return; }
      showMsg('success', 'Password changed successfully!');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      showMsg('error', 'Network error');
    }
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE MY ACCOUNT') {
      showMsg('error', 'Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (res.ok) {
        signOut({ callbackUrl: '/' });
      } else {
        showMsg('error', 'Failed to delete account');
      }
    } catch {
      showMsg('error', 'Network error');
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ];

  if (loading) return <div className="text-center py-20 text-brand-text-dim">Loading settings...</div>;

  return (
    <div className="animate-fade-up max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-brand-text-dim mt-1">Manage your profile, security, and account</p>
      </div>

      {/* Message banner */}
      {msg.text && (
        <div className={`mb-4 p-3.5 rounded-xl text-sm font-semibold border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-brand-card-alt rounded-xl border border-brand-border w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-brand-mint-dark shadow-sm border border-brand-border'
                : 'text-brand-text-dim hover:text-brand-text-mid'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4">
          {/* Account overview card */}
          <div className="card p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6ECBB5, #3AAE8C)' }}>
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-lg font-extrabold">{profile.name || 'User'}</div>
                <div className="text-xs text-brand-text-dim">{profile.email}</div>
              </div>
              <div className="text-right">
                <span className="badge">{stats.plan}</span>
                <div className="text-[10px] text-brand-text-ghost mt-1">
                  Member since {stats.createdAt ? new Date(stats.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-brand-card-alt text-center">
                <div className="text-lg font-extrabold">{stats.totalQR}</div>
                <div className="text-[10px] text-brand-text-dim font-bold">QR Codes</div>
              </div>
              <div className="p-3 rounded-xl bg-brand-card-alt text-center">
                <div className="text-lg font-extrabold">{stats.totalScans.toLocaleString()}</div>
                <div className="text-[10px] text-brand-text-dim font-bold">Total Scans</div>
              </div>
              <div className="p-3 rounded-xl bg-brand-card-alt text-center">
                <div className="text-lg font-extrabold">{stats.plan}</div>
                <div className="text-[10px] text-brand-text-dim font-bold">Plan</div>
              </div>
            </div>
          </div>

          {/* Edit profile */}
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field !bg-brand-card-alt !text-brand-text-dim cursor-not-allowed" value={profile.email} disabled />
                <span className="text-[10px] text-brand-text-ghost">Email cannot be changed</span>
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input-field" value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} placeholder="Company name" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Website</label>
                <input className="input-field" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={saveProfile} disabled={saving} className="btn-primary btn-mint !text-[13px] !px-6">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-4">🔒 Change Password</h3>
            <p className="text-xs text-brand-text-dim mb-4">
              If you signed in with Google, you cannot change your password here. Use Google's account settings instead.
            </p>
            <div className="flex flex-col gap-3 max-w-md">
              <div>
                <label className="label">Current Password</label>
                <input className="input-field" type="password" value={pw.currentPassword} onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input className="input-field" type="password" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input className="input-field" type="password" value={pw.confirmPassword} onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" />
              </div>
              <button onClick={changePassword} disabled={saving || !pw.currentPassword || !pw.newPassword} className="btn-primary !text-[13px] !px-6 w-fit">
                {saving ? 'Changing...' : '🔑 Change Password'}
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold mb-3">🔐 Sessions</h3>
            <p className="text-xs text-brand-text-dim mb-3">You are currently signed in as <span className="font-bold text-brand-text">{session?.user?.email}</span></p>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost !text-brand-red !border-red-200 !text-[12px]">
              🚪 Sign Out of All Devices
            </button>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-3">📋 Plan & Usage</h3>
            <div className="p-4 rounded-xl bg-brand-mint-ghost border border-brand-border-focus mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-brand-mint-dark">{stats.plan} Plan</div>
                  <div className="text-[11px] text-brand-text-dim">
                    {stats.plan === 'FREE' ? '10 QR codes · 0 dynamic · 100 scans/mo' :
                     stats.plan === 'PRO' ? 'Unlimited static · 50 dynamic · 10K scans/mo' :
                     stats.plan === 'BUSINESS' ? 'Unlimited all · 100K scans/mo' :
                     'Unlimited + white-label + API'}
                  </div>
                </div>
                <a href="/dashboard/billing" className="btn-primary btn-mint !text-[11px] !py-2 !px-4 no-underline">
                  {stats.plan === 'FREE' ? 'Upgrade' : 'Manage'}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="p-3 rounded-lg bg-brand-card-alt">
                <span className="text-brand-text-dim">QR Codes Used:</span>{' '}
                <span className="font-bold">{stats.totalQR}</span>
              </div>
              <div className="p-3 rounded-lg bg-brand-card-alt">
                <span className="text-brand-text-dim">Total Scans:</span>{' '}
                <span className="font-bold">{stats.totalScans.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold mb-2">📤 Export Data</h3>
            <p className="text-xs text-brand-text-dim mb-3">Download all your QR codes and analytics data.</p>
            <button
              onClick={async () => {
                const res = await fetch('/api/qr?limit=1000');
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'qr-data-export.json'; a.click();
              }}
              className="btn-ghost !text-[12px]"
            >
              ⬇ Export QR Codes (JSON)
            </button>
          </div>

          {/* Danger Zone */}
          <div className="card p-5 !border-red-200">
            <h3 className="text-sm font-bold text-brand-red mb-2">⚠️ Danger Zone</h3>
            <p className="text-xs text-brand-text-dim mb-3">
              Permanently delete your account and all data. This action cannot be undone. All your QR codes, analytics, and settings will be lost forever.
            </p>
            <div className="flex flex-col gap-2 max-w-sm">
              <label className="text-[10px] font-bold text-brand-text-dim">
                Type <span className="text-brand-red">DELETE MY ACCOUNT</span> to confirm:
              </label>
              <input
                className="input-field !border-red-200 focus:!border-red-400"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
              />
              <button
                onClick={deleteAccount}
                disabled={deleteConfirm !== 'DELETE MY ACCOUNT' || saving}
                className="btn-ghost !text-brand-red !border-red-300 !text-[12px] hover:!bg-red-50 disabled:opacity-40"
              >
                {saving ? 'Deleting...' : '🗑️ Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
