import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://qr.redsproutdigital.com'),
  title: { default: 'RedSprout QR — Dynamic QR Code Platform', template: '%s | RedSprout QR' },
  description: 'Create, manage, and track dynamic QR codes. Analytics, smart routing, A/B testing, restaurant mode, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-brand-bg font-sans text-brand-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
