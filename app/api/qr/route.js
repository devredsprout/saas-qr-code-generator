import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, canCreate } from '@/lib/auth';
import { generateShortCode } from '@/lib/shortcode';
import { z } from 'zod';

// Validation
const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['STATIC', 'DYNAMIC']),
  contentType: z.enum(['URL', 'TEXT', 'EMAIL', 'PHONE', 'WIFI', 'VCARD']),
  staticData: z.string().optional(),
  destinationUrl: z.string().url().optional(),
  fgColor: z.string().default('#000000'),
  bgColor: z.string().default('#FFFFFF'),
  size: z.number().min(100).max(2000).default(400),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  safePreview: z.boolean().default(false),
});

// GET: List user's QR codes
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const where = {
      userId: session.user.id,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(type && { type }),
    };

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        include: {
          _count: { select: { scans: true } },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.qRCode.count({ where }),
    ]);

    return NextResponse.json({
      qrCodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/qr error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new QR code
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    // Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, _count: { select: { qrCodes: true } } },
    });

    if (!canCreate(user.plan, user._count.qrCodes, data.type)) {
      return NextResponse.json(
        { error: 'Plan limit reached. Please upgrade.' },
        { status: 403 }
      );
    }

    // Dynamic QR requires Pro+
    if (data.type === 'DYNAMIC' && user.plan === 'FREE') {
      return NextResponse.json(
        { error: 'Dynamic QR codes require Pro plan or above.' },
        { status: 403 }
      );
    }

    // Generate unique short code
    let shortCode;
    let attempts = 0;
    do {
      shortCode = generateShortCode();
      const existing = await prisma.qRCode.findUnique({ where: { shortCode } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json({ error: 'Could not generate unique code' }, { status: 500 });
    }

    // Create QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        shortCode,
        name: data.name,
        type: data.type,
        contentType: data.contentType,
        staticData: data.type === 'STATIC' ? data.staticData : null,
        destinationUrl: data.type === 'DYNAMIC' ? data.destinationUrl : null,
        fgColor: data.fgColor,
        bgColor: data.bgColor,
        size: data.size,
        errorCorrection: data.errorCorrection,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmContent: data.utmContent,
        utmTerm: data.utmTerm,
        safePreview: data.safePreview,
        userId: session.user.id,
      },
    });

    return NextResponse.json(qrCode, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('POST /api/qr error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
