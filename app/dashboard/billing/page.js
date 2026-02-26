'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const PLAN_DATA = {
  FREE: {
    name: 'Free', price: '₹0', per: 'forever', color: '#9A9A90',
    limits: '10 QR codes · 0 dynamic · 100 scans/mo',
    features: ['8 static QR types', 'Custom colors & sizes', 'PNG + SVG export', 'Up to 2000px', 'No watermark', 'No signup required'],
  },
  PRO: {
    name: 'Pro', price: '₹499', per: '/month', color: '#3AAE8C',
    limits: 'Unlimited static · 50 dynamic · 10K scans/mo',
    features: ['Everything in Free', 'Dynamic QR (edit after print)', 'Logo on QR code', 'Analytics dashboard', 'UTM campaign tracking', '5 landing pages', 'Restaurant menu (basic)', 'Product catalogue', '10,000 scans/month'],
  },
  BUSINESS: {
    name: 'Business', price: '₹1,499', per: '/month', color: '#F59E0B',
    limits: 'Unlimited all · 100K scans/mo',
    features: ['Everything in Pro', 'Unlimited dynamic QR', 'Smart routing + A/B testing', 'Restaurant mode (full)', 'Bulk CSV import', 'Security pack', '3 team members', '100K scans/month'],
  },
  AGENCY: {
    name: 'Agency', price: '₹4,999', per: '/month', color: '#7C3AED',
    limits: 'Unlimited + white-label + API',
    features: ['Everything in Business', 'White-label portal', 'Custom domain', '10 client accounts', 'Per-client reports', 'API access', 'Unlimited scans', 'Priority support'],
  },
};

export default function BillingPage() {
  const { data: session } = useSession();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetch('/api/billing')
      .then(r => r.json())
      .then(d => { setBillingData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const currentPlan = billingData?.currentPlan || session?.user?.plan || 'FREE';

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    setProcessing(planId);

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();

      if (!data.key) {
        // No Razorpay key configured — show instructions
        alert(`Razorpay is not configured yet.\n\nTo enable payments:\n1. Create account at razorpay.com\n2. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env.local\n3. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to environment variables\n\nFor testing, the plan will be activated directly.`);

        // DEV MODE: Direct upgrade for testing
        const upgradeRes = await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'upgrade', plan: planId }),
        });
        if (upgradeRes.ok) {
          window.location.reload();
        }
        setProcessing(null);
        return;
      }

      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'RedSprout QR',
        description: data.description,
        order_id: data.orderId,
        prefill: data.prefill,
        theme: { color: '#3AAE8C' },
        handler: async function (response) {
          // Payment successful — verify on server
          try {
            const verifyRes = await fetch('/api/billing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'verify',
                plan: planId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              window.location.reload();
            }
          } catch (e) {
            console.error('Payment verification error:', e);
          }
        },
        modal: {
          ondismiss: () => setProcessing(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
    setProcessing(null);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel? You will be downgraded to the Free plan immediately.')) return;
    setProcessing('cancel');
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) window.location.reload();
    } catch (e) {
      console.error('Cancel error:', e);
    }
    setProcessing(null);
  };

  if (loading) return <div className="text-center py-20 text-brand-text-dim">Loading billing...</div>;

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-brand-text-dim mt-1">Manage your subscription and payment history</p>
      </div>

      {/* Current Plan Banner */}
      <div className="card p-5 mb-6" style={{ borderColor: PLAN_DATA[currentPlan]?.color + '40' }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-brand-text-dim uppercase tracking-wider mb-1">Current Plan</div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold" style={{ color: PLAN_DATA[currentPlan]?.color }}>
                {PLAN_DATA[currentPlan]?.name}
              </span>
              <span className="text-sm text-brand-text-dim">{PLAN_DATA[currentPlan]?.limits}</span>
            </div>
          </div>
          {currentPlan !== 'FREE' && (
            <button onClick={handleCancel} disabled={processing === 'cancel'} className="btn-ghost !text-brand-red !border-red-200 !text-[11px]">
              {processing === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(PLAN_DATA).map(([planId, plan]) => {
          const isCurrent = planId === currentPlan;
          const planOrder = ['FREE', 'PRO', 'BUSINESS', 'AGENCY'];
          const isDowngrade = planOrder.indexOf(planId) < planOrder.indexOf(currentPlan);
          const isUpgrade = planOrder.indexOf(planId) > planOrder.indexOf(currentPlan);

          return (
            <div
              key={planId}
              className={`card p-5 ${isCurrent ? '!border-2' : ''}`}
              style={isCurrent ? { borderColor: plan.color } : {}}
            >
              {isCurrent && (
                <div className="text-[9px] font-extrabold px-2 py-1 rounded-full mb-3 w-fit" style={{ background: plan.color + '15', color: plan.color }}>
                  CURRENT PLAN
                </div>
              )}
              <div className="text-sm font-extrabold mb-1" style={{ color: plan.color }}>{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="text-xs text-brand-text-dim">{plan.per}</span>
              </div>
              <p className="text-[11px] text-brand-text-dim mb-4">{plan.limits}</p>

              {/* Features */}
              <ul className="text-[11px] text-brand-text-mid leading-[2.2] mb-4" style={{ listStyle: 'none', padding: 0 }}>
                {plan.features.map((f, i) => (
                  <li key={i} className="relative pl-4">
                    <span className="absolute left-0" style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Action button */}
              {isCurrent ? (
                <div className="text-center text-[11px] font-bold text-brand-text-dim py-2.5 rounded-lg bg-brand-card-alt">
                  Current Plan
                </div>
              ) : planId === 'FREE' ? (
                <div className="text-center text-[11px] font-bold text-brand-text-dim py-2.5">
                  {isDowngrade ? 'Cancel to downgrade' : ''}
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(planId)}
                  disabled={processing === planId || isDowngrade}
                  className={`w-full py-2.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer border-none ${
                    isDowngrade
                      ? 'bg-brand-card-alt text-brand-text-dim cursor-not-allowed'
                      : 'text-white'
                  }`}
                  style={!isDowngrade ? { background: plan.color } : {}}
                >
                  {processing === planId ? 'Processing...' : isDowngrade ? 'Contact to downgrade' : isUpgrade ? `Upgrade to ${plan.name}` : 'Select'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment History */}
      <div className="card p-5">
        <h3 className="text-sm font-bold mb-3">💳 Payment History</h3>
        {billingData?.payments?.length > 0 ? (
          <div className="space-y-2">
            {billingData.payments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-brand-card-alt text-[12px]">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{p.plan} Plan</span>
                  <span className="text-brand-text-dim">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">₹{p.amount}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-text-dim text-center py-6">No payment history yet</p>
        )}
      </div>

      <div className="text-center mt-6">
        <p className="text-[11px] text-brand-text-ghost">
          💳 Payments powered by <b>Razorpay</b> · UPI · Cards · Wallets · Net Banking · EMI available
        </p>
      </div>
    </div>
  );
}
