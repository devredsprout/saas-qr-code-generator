import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

// GET current user profile
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        company: true,
        website: true,
        plan: true,
        trialEndsAt: true,
        createdAt: true,
        _count: { select: { qrCodes: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get scan count
    const scanCount = await prisma.scan.count({
      where: { qrCode: { userId: session.user.id } },
    });

    return NextResponse.json({ ...user, totalScans: scanCount });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update profile
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Password change
    if (action === 'change-password') {
      const data = changePasswordSchema.parse(body);

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: 'Cannot change password for OAuth accounts. You signed in with Google.' },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const hashed = await bcrypt.hash(data.newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // Profile update
    const data = updateProfileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.company !== undefined && { company: data.company || null }),
        ...(data.website !== undefined && { website: data.website || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        website: true,
        plan: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('PUT /api/user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE account
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user and all related data (cascading)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    console.error('DELETE /api/user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
