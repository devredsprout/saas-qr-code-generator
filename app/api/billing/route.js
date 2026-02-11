import { NextResponse } from 'next/server';

// Razorpay Plans (configured in Razorpay Dashboard)
const PLANS = {
  PRO: { name: 'Pro', amount: 49900, currency: 'INR', period: 'monthly', razorpayPlanId: process.env.RAZORPAY_PLAN_PRO },
  BUSINESS: { name: 'Business', amount: 149900, currency: 'INR', period: 'monthly', razorpayPlanId: process.env.RAZORPAY_PLAN_BIZ },
  AGENCY: { name: 'Agency', amount: 499900, currency: 'INR', period: 'monthly', razorpayPlanId: process.env.RAZORPAY_PLAN_AGY },
};

// POST: Create Razorpay checkout order
export async function POST(request) {
  try {
    const body = await request.json();
    const { plan } = body;

    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planData = PLANS[plan];

    // In production, use Razorpay SDK:
    // const Razorpay = require('razorpay');
    // const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await rzp.orders.create({ amount: planData.amount, currency: planData.currency, receipt: `order_${Date.now()}` });

    // For now, return plan info for client-side Razorpay checkout
    return NextResponse.json({
      plan: plan,
      amount: planData.amount,
      currency: planData.currency,
      name: planData.name,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      description: `RedSprout QR ${planData.name} Plan - Monthly`,
      prefill: { name: '', email: '', contact: '' },
      notes: { plan },
    });
  } catch (error) {
    console.error('Billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Current plan info
export async function GET() {
  return NextResponse.json({
    plans: Object.entries(PLANS).map(([key, val]) => ({
      id: key,
      name: val.name,
      amount: val.amount / 100,
      currency: val.currency,
    })),
  });
}
