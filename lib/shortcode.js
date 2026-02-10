import { customAlphabet } from 'nanoid';

// Alphanumeric, no ambiguous chars (0/O, 1/l/I)
const alphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
const generate = customAlphabet(alphabet, 7);

export function generateShortCode() {
  return generate();
}

export function getRedirectUrl(shortCode) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://qr.redsproutdigital.com';
  return `${base}/r/${shortCode}`;
}

export function getQRImageUrl(data, options = {}) {
  const { size = 400, fgColor = '000000', bgColor = 'FFFFFF', format = 'png', ecc = 'M' } = options;
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}x${size}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&format=${format}&ecc=${ecc}`;
}
