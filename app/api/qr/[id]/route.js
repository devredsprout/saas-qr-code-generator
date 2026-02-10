import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET single QR code with scan count
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCode = await prisma.qRCode.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        _count: { select: { scans: true } },
        scans: {
          orderBy: { scannedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            country: true,
            city: true,
            deviceType: true,
            browser: true,
            os: true,
            scannedAt: true,
          },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error('GET /api/qr/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update QR code (edit destination, pause, rename)
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.qRCode.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    const body = await request.json();

    // Allowed updates
    const updates = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.isPaused !== undefined) updates.isPaused = body.isPaused;
    if (body.safePreview !== undefined) updates.safePreview = body.safePreview;

    // Dynamic QR can update destination
    if (existing.type === 'DYNAMIC' && body.destinationUrl) {
      updates.destinationUrl = body.destinationUrl;
    }

    // Static QR cannot change data after creation
    if (existing.type === 'STATIC' && body.staticData) {
      return NextResponse.json(
        { error: 'Static QR codes cannot be modified. Create a Dynamic QR instead.' },
        { status: 400 }
      );
    }

    // UTM updates
    if (body.utmSource !== undefined) updates.utmSource = body.utmSource;
    if (body.utmMedium !== undefined) updates.utmMedium = body.utmMedium;
    if (body.utmCampaign !== undefined) updates.utmCampaign = body.utmCampaign;
    if (body.utmContent !== undefined) updates.utmContent = body.utmContent;

    // Appearance
    if (body.fgColor) updates.fgColor = body.fgColor;
    if (body.bgColor) updates.bgColor = body.bgColor;

    // Expiry
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const qrCode = await prisma.qRCode.update({
      where: { id: params.id },
      data: updates,
    });

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error('PUT /api/qr/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.qRCode.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    await prisma.qRCode.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/qr/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
