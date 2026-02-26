import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { shortCode } = params;
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      select: {
        id: true, type: true, staticData: true, destinationUrl: true,
        isActive: true, isPaused: true, expiresAt: true, safePreview: true,
        utmSource: true, utmMedium: true, utmCampaign: true, utmContent: true, utmTerm: true,
      },
    });

    if (!qrCode) return NextResponse.redirect(new URL('/not-found', request.url));

    if (!qrCode.isActive || qrCode.isPaused) {
      return new NextResponse(statusPage('QR Code Deactivated', 'This QR code has been paused or deactivated by its owner.'), { status: 200, headers: { 'Content-Type': 'text/html' } });
    }

    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return new NextResponse(statusPage('QR Code Expired', 'This QR code has expired.'), { status: 200, headers: { 'Content-Type': 'text/html' } });
    }

    let destination = qrCode.type === 'DYNAMIC' ? qrCode.destinationUrl : qrCode.staticData;
    if (!destination) {
      return new NextResponse(statusPage('No Destination', 'This QR code has no destination configured.'), { status: 200, headers: { 'Content-Type': 'text/html' } });
    }

    if (qrCode.utmSource || qrCode.utmMedium || qrCode.utmCampaign) {
      try {
        const url = new URL(destination);
        if (qrCode.utmSource) url.searchParams.set('utm_source', qrCode.utmSource);
        if (qrCode.utmMedium) url.searchParams.set('utm_medium', qrCode.utmMedium);
        if (qrCode.utmCampaign) url.searchParams.set('utm_campaign', qrCode.utmCampaign);
        if (qrCode.utmContent) url.searchParams.set('utm_content', qrCode.utmContent);
        if (qrCode.utmTerm) url.searchParams.set('utm_term', qrCode.utmTerm);
        destination = url.toString();
      } catch (e) {}
    }

    const headers = request.headers;
    const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
    const ua = headers.get('user-agent') || '';
    const referrer = headers.get('referer') || '';
    const di = parseUA(ua);

    prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
        ip: ip.substring(0, 45),
        userAgent: ua.substring(0, 500),
        deviceType: di.device, os: di.os, browser: di.browser,
        referrer: referrer.substring(0, 500),
      },
    }).catch(err => console.error('Scan log error:', err));

    if (qrCode.safePreview) {
      return new NextResponse(previewPage(destination, shortCode), { status: 200, headers: { 'Content-Type': 'text/html' } });
    }

    return NextResponse.redirect(destination, { status: 302 });
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

function parseUA(ua) {
  let device = 'desktop';
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) device = 'mobile';
  if (/ipad|tablet/i.test(ua)) device = 'tablet';
  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  let browser = 'Unknown';
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  return { device, os, browser };
}

function statusPage(title, message) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#F6F5F1;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}.box{background:#fff;border:1px solid #E9E8E4;border-radius:20px;padding:48px 40px;text-align:center;max-width:420px}h1{font-size:22px;font-weight:800;margin-bottom:8px}p{font-size:14px;color:#777;line-height:1.6;margin-bottom:20px}a{padding:12px 24px;border-radius:10px;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700}</style></head>
<body><div class="box"><div style="font-size:48px;margin-bottom:16px">⚠️</div><h1>${title}</h1><p>${message}</p><a href="https://redsproutdigital.com">← Back</a></div></body></html>`;
}

function previewPage(destination, shortCode) {
  const d = destination.length > 60 ? destination.substring(0, 60) + '...' : destination;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Safe Preview</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#F6F5F1;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}.box{background:#fff;border:1px solid #E9E8E4;border-radius:20px;padding:40px;text-align:center;max-width:480px;width:100%}h1{font-size:20px;font-weight:800;margin-bottom:6px}.url{background:#F6F5F1;border:1px solid #E9E8E4;border-radius:12px;padding:14px;margin:16px 0;font-family:monospace;font-size:13px;word-break:break-all}.btn{display:inline-block;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;margin:4px}.go{background:linear-gradient(135deg,#6ECBB5,#3AAE8C);color:#fff}.back{background:#F6F5F1;color:#555;border:1px solid #E9E8E4}</style></head>
<body><div class="box"><div style="font-size:40px;margin-bottom:12px">🛡️</div><h1>Safe Scan Preview</h1><p style="font-size:13px;color:#999;margin-bottom:16px">You scanned a QR code. Here's where it leads:</p><div class="url">${d}</div><a href="${destination}" class="btn go">Continue →</a><a href="https://redsproutdigital.com" class="btn back">Go Back</a></div></body></html>`;
}
