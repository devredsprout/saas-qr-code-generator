import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force edge runtime for fastest redirects globally
// export const runtime = 'edge'; // Uncomment when deploying to Vercel

export async function GET(request, { params }) {
  const { shortCode } = params;

  try {
    // 1. Find QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      select: {
        id: true,
        type: true,
        staticData: true,
        destinationUrl: true,
        isActive: true,
        isPaused: true,
        expiresAt: true,
        safePreview: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        utmTerm: true,
      },
    });

    // Not found
    if (!qrCode) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // Inactive or paused
    if (!qrCode.isActive || qrCode.isPaused) {
      return new NextResponse(
        renderStatusPage('QR Code Deactivated', 'This QR code has been paused or deactivated by its owner.'),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Expired
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return new NextResponse(
        renderStatusPage('QR Code Expired', 'This QR code has expired and is no longer active.'),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // 2. Determine destination
    let destination;
    if (qrCode.type === 'DYNAMIC') {
      destination = qrCode.destinationUrl;
    } else {
      destination = qrCode.staticData;
    }

    if (!destination) {
      return new NextResponse(
        renderStatusPage('No Destination', 'This QR code does not have a destination configured.'),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // 3. Append UTM parameters
    if (qrCode.utmSource || qrCode.utmMedium || qrCode.utmCampaign) {
      try {
        const url = new URL(destination);
        if (qrCode.utmSource) url.searchParams.set('utm_source', qrCode.utmSource);
        if (qrCode.utmMedium) url.searchParams.set('utm_medium', qrCode.utmMedium);
        if (qrCode.utmCampaign) url.searchParams.set('utm_campaign', qrCode.utmCampaign);
        if (qrCode.utmContent) url.searchParams.set('utm_content', qrCode.utmContent);
        if (qrCode.utmTerm) url.searchParams.set('utm_term', qrCode.utmTerm);
        destination = url.toString();
      } catch (e) {
        // If destination is not a valid URL (e.g., tel:, mailto:), skip UTM
      }
    }

    // 4. Log scan asynchronously (don't block redirect)
    const headers = request.headers;
    const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               headers.get('x-real-ip') || 'unknown';
    const ua = headers.get('user-agent') || '';
    const referrer = headers.get('referer') || '';

    // Parse device info
    const deviceInfo = parseUserAgent(ua);

    // Fire-and-forget scan logging
    prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
        ip: ip.substring(0, 45), // limit length
        userAgent: ua.substring(0, 500),
        deviceType: deviceInfo.device,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        referrer: referrer.substring(0, 500),
        // Geo will be enriched later via a cron/worker
        // For now we can use a simple IP-to-country lookup
      },
    }).catch(err => console.error('Scan log error:', err));

    // 5. Safe preview page (if enabled)
    if (qrCode.safePreview) {
      return new NextResponse(
        renderPreviewPage(destination, shortCode),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // 6. Redirect!
    return NextResponse.redirect(destination, { status: 302 });

  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Simple UA parser (lightweight, no dependency needed for edge)
function parseUserAgent(ua) {
  const lc = ua.toLowerCase();
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

// Status page HTML
function renderStatusPage(title, message) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — RedSprout QR</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:#F6F5F1;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.box{background:#fff;border:1px solid #E9E8E4;border-radius:20px;padding:48px 40px;text-align:center;max-width:420px}
h1{font-size:22px;font-weight:800;color:#111;margin-bottom:8px}
p{font-size:14px;color:#777;line-height:1.6;margin-bottom:20px}
a{display:inline-block;padding:12px 24px;border-radius:10px;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700}
.icon{width:64px;height:64px;border-radius:18px;background:rgba(228,91,91,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:28px}
</style></head><body><div class="box">
<div class="icon">⚠️</div>
<h1>${title}</h1>
<p>${message}</p>
<a href="https://redsproutdigital.com">← Back to RedSprout Digital</a>
</div></body></html>`;
}

// Safe preview page HTML
function renderPreviewPage(destination, shortCode) {
  const displayUrl = destination.length > 60 ? destination.substring(0, 60) + '...' : destination;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Safe Preview — RedSprout QR</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:#F6F5F1;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.box{background:#fff;border:1px solid #E9E8E4;border-radius:20px;padding:40px 36px;text-align:center;max-width:480px;width:100%}
.shield{width:56px;height:56px;border-radius:16px;background:rgba(110,203,181,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:26px}
h1{font-size:20px;font-weight:800;color:#111;margin-bottom:6px}
.sub{font-size:13px;color:#999;margin-bottom:20px}
.url-box{background:#F6F5F1;border:1px solid #E9E8E4;border-radius:12px;padding:14px 16px;margin-bottom:20px;word-break:break-all;font-family:monospace;font-size:13px;color:#333}
.btn{display:inline-block;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;border:none;cursor:pointer;transition:all .2s}
.btn-go{background:linear-gradient(135deg,#6ECBB5,#3AAE8C);color:#fff;margin-right:8px}
.btn-back{background:#F6F5F1;color:#555;border:1px solid #E9E8E4}
.footer{margin-top:20px;font-size:11px;color:#bbb}
.footer a{color:#3AAE8C;text-decoration:none;font-weight:600}
</style></head><body><div class="box">
<div class="shield">🛡️</div>
<h1>Safe Scan Preview</h1>
<p class="sub">You scanned a QR code. Here's where it leads:</p>
<div class="url-box">${displayUrl}</div>
<a href="${destination}" class="btn btn-go">Continue to Website →</a>
<a href="https://redsproutdigital.com" class="btn btn-back">Go Back</a>
<p class="footer">Protected by <a href="https://qr.redsproutdigital.com">RedSprout QR</a> · <a href="https://qr.redsproutdigital.com/report?code=${shortCode}">Report this QR</a></p>
</div></body></html>`;
}
