import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const qrId = searchParams.get('qrId'); // optional: filter by specific QR

    const since = new Date();
    since.setDate(since.getDate() - days);

    const prevSince = new Date();
    prevSince.setDate(prevSince.getDate() - days * 2);

    // Build where clause
    const whereBase = {
      qrCode: { userId: session.user.id },
      ...(qrId && { qrCodeId: qrId }),
    };

    const [
      totalScans,
      prevScans,
      uniqueIPs,
      scansByDay,
      topCountries,
      deviceBreakdown,
      browserBreakdown,
      topQRCodes,
      hourlyDistribution,
      totalQR,
      activeQR,
    ] = await Promise.all([
      // Total scans (current period)
      prisma.scan.count({
        where: { ...whereBase, scannedAt: { gte: since } },
      }),

      // Previous period scans (for comparison)
      prisma.scan.count({
        where: { ...whereBase, scannedAt: { gte: prevSince, lt: since } },
      }),

      // Unique IPs
      prisma.scan.groupBy({
        by: ['ip'],
        where: { ...whereBase, scannedAt: { gte: since } },
      }).then(r => r.length),

      // Scans by day
      prisma.$queryRaw`
        SELECT DATE(s."scannedAt") as date, COUNT(*)::int as scans
        FROM "Scan" s
        JOIN "QRCode" q ON s."qrCodeId" = q.id
        WHERE q."userId" = ${session.user.id}
        AND s."scannedAt" >= ${since}
        ${qrId ? prisma.$queryRaw`AND s."qrCodeId" = ${qrId}` : prisma.$queryRaw``}
        GROUP BY DATE(s."scannedAt")
        ORDER BY date ASC
      `.catch(() => []),

      // Top countries
      prisma.scan.groupBy({
        by: ['country'],
        where: { ...whereBase, scannedAt: { gte: since }, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),

      // Device breakdown
      prisma.scan.groupBy({
        by: ['deviceType'],
        where: { ...whereBase, scannedAt: { gte: since }, deviceType: { not: null } },
        _count: true,
      }),

      // Browser breakdown
      prisma.scan.groupBy({
        by: ['browser'],
        where: { ...whereBase, scannedAt: { gte: since }, browser: { not: null } },
        _count: true,
        orderBy: { _count: { browser: 'desc' } },
        take: 5,
      }),

      // Top QR codes by scans
      prisma.qRCode.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          shortCode: true,
          type: true,
          contentType: true,
          isActive: true,
          _count: {
            select: {
              scans: { where: { scannedAt: { gte: since } } },
            },
          },
        },
        orderBy: { scans: { _count: 'desc' } },
        take: 10,
      }),

      // Hourly distribution
      prisma.$queryRaw`
        SELECT EXTRACT(HOUR FROM s."scannedAt")::int as hour, COUNT(*)::int as scans
        FROM "Scan" s
        JOIN "QRCode" q ON s."qrCodeId" = q.id
        WHERE q."userId" = ${session.user.id}
        AND s."scannedAt" >= ${since}
        GROUP BY hour ORDER BY hour ASC
      `.catch(() => []),

      // Total QR codes
      prisma.qRCode.count({ where: { userId: session.user.id } }),

      // Active QR codes
      prisma.qRCode.count({ where: { userId: session.user.id, isActive: true } }),
    ]);

    // Calculate change percentage
    const scanChange = prevScans > 0
      ? (((totalScans - prevScans) / prevScans) * 100).toFixed(1)
      : totalScans > 0 ? '+100' : '0';

    return NextResponse.json({
      overview: {
        totalScans,
        uniqueVisitors: uniqueIPs,
        totalQR,
        activeQR,
        scanChange: `${Number(scanChange) >= 0 ? '+' : ''}${scanChange}%`,
      },
      scansByDay,
      topCountries: topCountries.map(c => ({ country: c.country, scans: c._count })),
      devices: deviceBreakdown.map(d => ({ device: d.deviceType, count: d._count })),
      browsers: browserBreakdown.map(b => ({ browser: b.browser, count: b._count })),
      topQRCodes: topQRCodes.map(q => ({
        id: q.id,
        name: q.name,
        shortCode: q.shortCode,
        type: q.type,
        contentType: q.contentType,
        isActive: q.isActive,
        scans: q._count.scans,
      })),
      hourlyDistribution,
      period: { days, since: since.toISOString() },
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
