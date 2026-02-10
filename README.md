# 🚀 RedSprout QR SaaS — Setup & Deployment Guide

## Phase 1: Dynamic QR + Analytics + Dashboard

---

## 📁 PROJECT STRUCTURE

```
qr-saas/
├── app/
│   ├── globals.css                    ← Tailwind + custom styles
│   ├── layout.js                      ← Root layout + SessionProvider
│   ├── page.js                        ← Public landing page
│   │
│   ├── {auth}/
│   │   ├── login/page.js             ← Login (Google + Email)
│   │   └── register/page.js          ← Signup
│   │
│   ├── dashboard/
│   │   ├── layout.js                  ← Dashboard layout + auth guard
│   │   ├── page.js                    ← Overview with charts
│   │   ├── qr-codes/
│   │   │   ├── page.js               ← QR code list + management
│   │   │   ├── new/page.js           ← Create new QR (Static/Dynamic)
│   │   │   └── [id]/page.js          ← QR detail + edit destination
│   │   └── analytics/page.js         ← Full analytics dashboard
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.js ← NextAuth (Google + Credentials)
│       │   └── register/route.js      ← Email/password signup
│       ├── qr/
│       │   ├── route.js               ← GET list, POST create
│       │   └── [id]/route.js          ← GET, PUT, DELETE single QR
│       ├── r/[shortCode]/route.js     ← ⚡ REDIRECT ENGINE (the core!)
│       └── analytics/route.js         ← Aggregated analytics data
│
├── components/
│   ├── Providers.js                   ← NextAuth SessionProvider
│   └── dashboard/
│       └── Sidebar.js                 ← Dashboard sidebar navigation
│
├── lib/
│   ├── prisma.js                      ← Prisma client singleton
│   ├── auth.js                        ← Session helpers + plan limits
│   └── shortcode.js                   ← Short code generator
│
├── prisma/
│   ├── schema.prisma                  ← Database schema (User, QR, Scan)
│   └── seed.js                        ← Demo data seeder
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── vercel.json
├── .env.example
└── .gitignore
```

---

## 🛠️ STEP 1: DATABASE SETUP (Supabase — Free)

1. Go to https://supabase.com → Create account → New Project
2. Choose region: **Mumbai (South Asia)**
3. Set a database password (save it!)
4. Once created, go to **Settings → Database → Connection string**
5. Copy the URI (looks like: `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres`)

---

## 🛠️ STEP 2: GOOGLE OAUTH (Optional, but recommended)

1. Go to https://console.cloud.google.com
2. Create new project → "RedSprout QR"
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: 
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://qr.redsproutdigital.com/api/auth/callback/google` (prod)
6. Copy Client ID and Client Secret

---

## 🛠️ STEP 3: LOCAL SETUP

```bash
# 1. Navigate to project
cd qr-saas

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Edit .env.local with your values:
#    DATABASE_URL="postgresql://postgres:YOUR_PASS@db.xxxx.supabase.co:5432/postgres"
#    NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
#    NEXTAUTH_URL="http://localhost:3000"
#    GOOGLE_CLIENT_ID="your-google-id"
#    GOOGLE_CLIENT_SECRET="your-google-secret"
#    NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 5. Push database schema
npx prisma db push

# 6. Seed demo data
npm run db:seed

# 7. Start development server
npm run dev

# 8. Open http://localhost:3000
#    Login: demo@redsproutdigital.com / demo12345
```

---

## 🛠️ STEP 4: DEPLOY TO VERCEL

```bash
# Option A: Via GitHub (recommended)
git init
git add .
git commit -m "Phase 1: Dynamic QR SaaS Platform"
git remote add origin https://github.com/YOUR_USER/qr-saas.git
git push -u origin main

# Then go to vercel.com → Import → Select repo → Deploy

# Option B: Via CLI
npm i -g vercel
vercel
```

### Environment Variables in Vercel:
Go to Project → Settings → Environment Variables and add:
```
DATABASE_URL          = your Supabase connection string
NEXTAUTH_SECRET       = your generated secret
NEXTAUTH_URL          = https://qr.redsproutdigital.com
GOOGLE_CLIENT_ID      = your Google OAuth ID
GOOGLE_CLIENT_SECRET  = your Google OAuth secret
NEXT_PUBLIC_APP_URL   = https://qr.redsproutdigital.com
```

### Connect Subdomain:
1. In Vercel: Settings → Domains → Add `qr.redsproutdigital.com`
2. In your DNS: Add CNAME record `qr` → `cname.vercel-dns.com`

---

## ✅ WHAT'S INCLUDED IN PHASE 1

### Authentication
- [x] Google OAuth login
- [x] Email/password signup + login
- [x] Session management with JWT
- [x] Auth guard on dashboard routes

### QR Code Management
- [x] Create Static QR codes (fixed content)
- [x] Create Dynamic QR codes (editable destination!)
- [x] 6 content types: URL, Text, Email, Phone, WiFi, vCard
- [x] Custom colors (foreground + background)
- [x] Error correction levels (L/M/Q/H)
- [x] QR code list with search + filters
- [x] Edit destination URL anytime (Dynamic)
- [x] Pause / activate QR codes
- [x] Delete QR codes
- [x] Download PNG + SVG

### Redirect Engine (/r/[shortCode])
- [x] Ultra-fast 302 redirects
- [x] Async scan logging (non-blocking)
- [x] Device detection (mobile/desktop/tablet)
- [x] OS + browser detection
- [x] IP logging for geo enrichment
- [x] UTM parameter appending
- [x] Safe preview page (optional per QR)
- [x] Expired QR handling
- [x] Paused QR handling

### UTM Campaign Tracking
- [x] UTM builder in QR creation form
- [x] Auto-append utm_source, utm_medium, utm_campaign, utm_content, utm_term
- [x] Display UTM info on QR detail page

### Analytics Dashboard
- [x] Total scans + unique visitors
- [x] Scans over time (area chart)
- [x] Device breakdown (pie chart)
- [x] Top countries (bar chart)
- [x] Browser breakdown (progress bars)
- [x] Hourly distribution (bar chart)
- [x] Top performing QR codes
- [x] Period selector (7/30/90 days)
- [x] Comparison with previous period (% change)

### Plan Limits
- [x] FREE: 10 QR codes, 0 dynamic, 100 scans/month
- [x] PRO: Unlimited static, 50 dynamic, 10K scans
- [x] BUSINESS: Unlimited all, 100K scans
- [x] AGENCY: Unlimited + white-label + API
- [x] Plan enforcement on QR creation

### Security
- [x] Safe scan preview page
- [x] Deactivated QR info page
- [x] Expired QR info page

### Demo Seed Data
- [x] Demo user with Business plan
- [x] 5 sample QR codes (various types)
- [x] Random scan data for testing analytics

---

## 🔜 NEXT PHASES TO BUILD

### Phase 2: Landing Pages + Bulk Import (Weeks 4-6)
- Landing page builder with templates
- Bulk CSV import for QR codes
- PDF/CSV report export
- Campaign manager

### Phase 3: Smart Routing + A/B Testing (Weeks 7-9)
- Route by country/device/language/time
- A/B test variants with weight distribution
- Scheduled destination changes
- Logo on QR code (canvas rendering)

### Phase 4: Restaurant Mode (Weeks 10-12)
- Restaurant setup wizard
- Menu editor with categories + items
- Allergy filters + dietary labels
- Table-specific QR generation
- Call waiter notification
- Feedback + reviews system
- Accessibility mode

### Phase 5: White-Label + Agency (Weeks 13-16)
- Organization management
- Client sub-accounts
- Custom branding (logo, colors)
- Custom domain setup
- Per-client analytics
- PDF report generation
- API keys

### Phase 6: Security + GS1 Compliance (Weeks 17-20)
- Google Safe Browsing API integration
- Domain allowlists
- GS1 Digital Link generator
- India FSSAI templates
- Multilingual product info pages

---

## 💰 COST BREAKDOWN

| Service | Cost |
|---------|------|
| Vercel (Hobby) | Free |
| Supabase (Free tier) | Free |
| Database: 500MB, 50K rows | Free |
| Google OAuth | Free |
| SSL | Free (Vercel) |
| **Total at launch** | **$0/month** |

### When to upgrade:
- Supabase Pro ($25/mo) — when you hit 500MB or need backups
- Vercel Pro ($20/mo) — when you need team features or bandwidth
- Total at scale: ~$45/month for thousands of users

---

## 🧪 TESTING CHECKLIST

- [ ] Register new account
- [ ] Login with Google
- [ ] Login with email/password
- [ ] Create static QR code
- [ ] Create dynamic QR code
- [ ] Visit /r/[shortCode] — verify redirect works
- [ ] Edit dynamic QR destination — verify new URL works
- [ ] Pause QR — verify pause page shows
- [ ] Check analytics — verify scan was logged
- [ ] Check analytics charts render correctly
- [ ] Test on mobile — responsive layout
- [ ] Test safe preview page
- [ ] Download PNG and SVG

---

*Phase 1 built for RedSprout Digital · February 2026*
*Demo login: demo@redsproutdigital.com / demo12345*
