const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo12345', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@redsproutdigital.com' },
    update: {},
    create: {
      name: 'Rajesh (Demo)',
      email: 'demo@redsproutdigital.com',
      password: hashedPassword,
      plan: 'BUSINESS',
    },
  });
  console.log(`✅ User: ${user.email} (plan: ${user.plan})`);

  // Create sample QR codes
  const qrSamples = [
    { shortCode: 'rsd-web', name: 'Website Link', type: 'DYNAMIC', contentType: 'URL', destinationUrl: 'https://redsproutdigital.com', fgColor: '#000000' },
    { shortCode: 'rsd-wifi', name: 'Office WiFi', type: 'STATIC', contentType: 'WIFI', staticData: 'WIFI:T:WPA;S:RedSprout-Office;P:Welcome2025;;', fgColor: '#166534' },
    { shortCode: 'rsd-card', name: 'Business Card', type: 'DYNAMIC', contentType: 'VCARD', destinationUrl: 'https://redsproutdigital.com/team/rajesh', fgColor: '#7c3aed' },
    { shortCode: 'rsd-menu', name: 'Cafe Menu', type: 'DYNAMIC', contentType: 'URL', destinationUrl: 'https://redsproutdigital.com/menu', fgColor: '#be123c' },
    { shortCode: 'rsd-prmo', name: 'Summer Promo', type: 'DYNAMIC', contentType: 'URL', destinationUrl: 'https://redsproutdigital.com/summer-sale', utmSource: 'qr', utmMedium: 'print', utmCampaign: 'summer-2025', fgColor: '#0f766e' },
  ];

  for (const qr of qrSamples) {
    const created = await prisma.qRCode.upsert({
      where: { shortCode: qr.shortCode },
      update: {},
      create: { ...qr, userId: user.id },
    });
    console.log(`✅ QR: ${created.name} (${created.shortCode})`);

    // Add some sample scans
    const scanCount = Math.floor(Math.random() * 50) + 10;
    const scans = [];
    const devices = ['mobile', 'desktop', 'tablet'];
    const oses = ['Android', 'iOS', 'Windows', 'macOS'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const countries = ['IN', 'US', 'UK', 'AE', 'DE', 'SG'];
    const cities = ['Mumbai', 'Delhi', 'New York', 'London', 'Dubai', 'Berlin'];

    for (let i = 0; i < scanCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      scans.push({
        qrCodeId: created.id,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        os: oses[Math.floor(Math.random() * oses.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        scannedAt: date,
      });
    }
    await prisma.scan.createMany({ data: scans });
    console.log(`   └─ ${scanCount} scans added`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('📧 Login: demo@redsproutdigital.com');
  console.log('🔑 Password: demo12345');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
