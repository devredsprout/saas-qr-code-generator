import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      createdAt: true,
    },
  });
}

// Plan limits
export const PLAN_LIMITS = {
  FREE: { maxQR: 10, maxDynamic: 0, maxScans: 100, features: [] },
  PRO: { maxQR: -1, maxDynamic: 50, maxScans: 10000, features: ['analytics', 'utm', 'svg', 'no-brand'] },
  BUSINESS: { maxQR: -1, maxDynamic: -1, maxScans: 100000, features: ['analytics', 'utm', 'svg', 'no-brand', 'routing', 'ab-test', 'restaurant', 'bulk', 'security'] },
  AGENCY: { maxQR: -1, maxDynamic: -1, maxScans: 500000, features: ['analytics', 'utm', 'svg', 'no-brand', 'routing', 'ab-test', 'restaurant', 'bulk', 'security', 'white-label', 'api', 'clients'] },
  ENTERPRISE: { maxQR: -1, maxDynamic: -1, maxScans: -1, features: ['all'] },
};

export function canCreate(plan, currentCount, type = 'STATIC') {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
  if (type === 'DYNAMIC' && limits.maxDynamic === 0) return false;
  if (limits.maxQR === -1) return true;
  return currentCount < limits.maxQR;
}

export function hasFeature(plan, feature) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
  return limits.features.includes('all') || limits.features.includes(feature);
}
