import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not set. Database features will not work.');
    console.warn('   Set DATABASE_URL in Vercel → Settings → Environment Variables');
    // Return a proxy that throws helpful errors
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'then') return undefined; // prevent Promise detection
        return () => {
          throw new Error('DATABASE_URL is not configured. Add it in Vercel Environment Variables.');
        };
      }
    });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
