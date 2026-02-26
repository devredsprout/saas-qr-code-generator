import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const PLANS = {
  PRO: {
    name: 'Pro',
    amount: 49900,
    currency: 'INR',
    period: 'monthly',
    razorpayPlanId: process.env.RAZORPAY_PLAN_PRO,
    features: ['Dynamic QR', 'Analytics', 'UTM Tracking', 'Logo on QR', '10K scans/mo'],
  },
  BUSINESS: {
    name: 'Business',
    amount: 149900,
    currency: 'INR',
    period: 'monthly',
    razorpayPlanId: process.env.RAZORPAY_PLAN_BIZ,
    features: ['Everything in Pro', 'Unlimited Dynamic', 'Smart Routing', 'A/B Testing', 'Restaurant Mode', '100K scans/mo'],
  },
  AGENCY: {
    name: 'Agency',
    amount: 499900,
    currency: 'INR',
    period: 'monthly',
    razorpayPlanId: process.env.RAZORPAY_PLAN_AGY,
    features: ['Everything in Business', 'White-Label Portal', 'Custom Domain', '10 Client Accounts', 'API Access', 'Unlimited scans'],
  },
};

// POST: Create Razorpay checkout order
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, action } = body;

    // Cancel subscription
    if (action === 'cancel') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { plan: 'FREE' },
      });
      return NextResponse.json({ success: true, message: 'Subscription cancelled. Downgraded to Free.' });
    }

    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planData = PLANS[plan];
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    });

    // Try to create Razorpay order if keys are configured
    let orderId = null;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = require('razorpay');
        const rzp = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const order = await rzp.orders.create({
          amount: planData.amount,
          currency: planData.currency,
          receipt: `order_${session.user.id}_${Date.now()}`,
          notes: { plan, userId: session.user.id },
        });
        orderId = order.id;

        // Log payment attempt
        await prisma.payment.create({
          data: {
            userId: session.user.id,
            razorpayOrderId: orderId,
            amount: planData.amount,
            currency: planData.currency,
            status: 'created',
            plan,
          },
        });
      } catch (rzpError) {
        console.error('Razorpay order error:', rzpError);
      }
    }

    return NextResponse.json({
      plan,
      orderId,
      amount: planData.amount,
      currency: planData.currency,
      name: planData.name,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      description: `RedSprout QR ${planData.name} Plan — Monthly`,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      notes: { plan, userId: session.user.id },
    });
  } catch (error) {
    console.error('Billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Plan info + current subscription
export async function GET(request) {
  try {
    const session = await getSession();

    // If not logged in, just return plan list
    const planList = Object.entries(PLANS).map(([key, val]) => ({
      id: key,
      name: val.name,
      amount: val.amount / 100,
      currency: val.currency,
      features: val.features,
    }));

    if (!session?.user?.id) {
      return NextResponse.json({ plans: planList, currentPlan: 'FREE' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, trialEndsAt: true, createdAt: true },
    });

    // Get recent payments
    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        currency: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      plans: planList,
      currentPlan: user?.plan || 'FREE',
      trialEndsAt: user?.trialEndsAt,
      memberSince: user?.createdAt,
      payments: payments.map(p => ({
        ...p,
        amount: p.amount / 100,
      })),
    });
  } catch (error) {
    console.error('GET /api/billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
