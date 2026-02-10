import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Build providers list
const providers = [];

// Google OAuth (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleProvider = require('next-auth/providers/google').default;
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Credentials provider
providers.push(
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password required');
      }

      try {
        const prisma = (await import('@/lib/prisma')).default;
        const bcrypt = (await import('bcryptjs')).default;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      } catch (error) {
        console.error('Auth error:', error.message);
        throw new Error('Authentication failed');
      }
    },
  })
);

export const authOptions = {
  providers,
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-dev-secret-change-in-production-please',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      try {
        const prisma = (await import('@/lib/prisma')).default;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { plan: true },
        });
        if (dbUser) session.user.plan = dbUser.plan;
      } catch (e) {
        console.error('Session callback DB error:', e.message);
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
