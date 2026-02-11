"use client";
import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════
   REDSPROUT QR — FULL HOMEPAGE
   Matches redsproutdigital.com header/brand
   ══════════════════════════════════════════ */

const BRAND = {
  red: "#D42B2B", redDark: "#B91C1C", dark: "#1A1A1A", darker: "#111",
  bg: "#F5F5F3", card: "#FFF", border: "#E5E4E0", borderHover: "#CCC",
  text: "#1A1A1A", mid: "#555", dim: "#888", ghost: "#BBB",
  mint: "#6ECBB5", mintDark: "#3AAE8C",
};

const QR_TYPES = [
  { id: "url", label: "URL / Link", icon: "🔗", free: true, desc: "Any website or page" },
  { id: "text", label: "Plain Text", icon: "📝", free: true, desc: "Any text message" },
  { id: "wifi", label: "WiFi Access", icon: "📶", free: true, desc: "Share WiFi credentials" },
  { id: "email", label: "Email", icon: "✉️", free: true, desc: "Pre-filled email" },
  { id: "phone", label: "Phone / Call", icon: "📞", free: true, desc: "Click to call" },
  { id: "vcard", label: "vCard / Contact", icon: "👤", free: true, desc: "Digital business card" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", free: true, desc: "Direct chat link" },
  { id: "upi", label: "UPI Payment", icon: "💳", free: true, desc: "India UPI payment" },
  { id: "restaurant", label: "Restaurant Menu", icon: "🍽️", pro: true, desc: "Digital menu + ordering" },
  { id: "catalogue", label: "Product Catalogue", icon: "📦", pro: true, desc: "Product showcase page" },
  { id: "social", label: "Social Media", icon: "📱", pro: true, desc: "All socials in one link" },
  { id: "event", label: "Event / Ticket", icon: "🎫", pro: true, desc: "Event details + RSVP" },
  { id: "pdf", label: "PDF / Document", icon: "📄", pro: true, desc: "Share downloadable files" },
  { id: "review", label: "Review Collector", icon: "⭐", pro: true, desc: "Get Google reviews" },
  { id: "gs1", label: "GS1 Digital Link", icon: "🏷️", biz: true, desc: "Product packaging compliance" },
  { id: "dynamic", label: "Dynamic QR", icon: "🔄", pro: true, desc: "Edit destination anytime" },
];

const FG_COLORS = ["#000000","#1a1a2e","#D42B2B","#166534","#1e40af","#7c3aed","#be185d","#0f766e","#92400e","#475569"];
const BG_COLORS = ["#ffffff","#f8f8f8","#fff8f0","#f0fdf4","#eff6ff","#faf5ff","#fff1f2","#f0fdfa"];
const SIZES = [200, 300, 400, 600, 800, 1000, 1500, 2000];
const EC_LEVELS = [
  { id: "L", label: "Low (7%)", desc: "Smallest QR" },
  { id: "M", label: "Medium (15%)", desc: "Recommended" },
  { id: "Q", label: "Quartile (25%)", desc: "Good for logos" },
  { id: "H", label: "High (30%)", desc: "Best for logos" },
];
const FORMATS = ["png", "svg"];

function buildData(type, f) {
  switch (type) {
    case "url": return f.url || "";
    case "text": return f.text || "";
    case "email": return `mailto:${f.email || ""}?subject=${encodeURIComponent(f.subject || "")}&body=${encodeURIComponent(f.body || "")}`;
    case "phone": return `tel:${f.phone || ""}`;
    case "whatsapp": return `https://wa.me/${(f.waNum || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(f.waMsg || "")}`;
    case "upi": return `upi://pay?pa=${f.upiId || ""}&pn=${encodeURIComponent(f.upiName || "")}&am=${f.upiAmt || ""}&cu=INR`;
    case "wifi": return `WIFI:T:${f.enc || "WPA"};S:${f.ssid || ""};P:${f.pass || ""};;`;
    case "vcard": return `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name || ""}\nTEL:${f.vph || ""}\nEMAIL:${f.vem || ""}\nORG:${f.org || ""}\nURL:${f.vurl || ""}\nEND:VCARD`;
    default: return f.url || "";
  }
}

/* ── Header ── */
function Header({ onGetStarted }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,.97)" : "#fff",
      borderBottom: `1px solid ${scrolled ? BRAND.border : "transparent"}`,
      backdropFilter: "blur(12px)",
      transition: "all .3s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <a href="https://redsproutdigital.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: BRAND.dark, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 4h8a6 6 0 010 12H6V4z" stroke={BRAND.red} strokeWidth="2.5" fill="none"/>
              <path d="M6 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="14" cy="10" r="2.5" fill={BRAND.red}/>
            </svg>
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: BRAND.dark, letterSpacing: "-.02em" }}>
              redsprout<span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>digital<span style={{ color: BRAND.red }}>.</span></span>
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
          {["Services", "Resources", "Company"].map(item => (
            <a key={item} href={`https://redsproutdigital.com/#${item.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 600, color: BRAND.mid, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = BRAND.dark}
              onMouseLeave={e => e.target.style.color = BRAND.mid}>
              {item} <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#generator" style={{ fontSize: 13, fontWeight: 700, color: BRAND.red, textDecoration: "none", padding: "8px 0" }} className="desktop-nav">Free QR Tool ↓</a>
          <button onClick={onGetStarted} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 99, border: "none",
            background: BRAND.dark, color: "#fff", fontSize: 13.5, fontWeight: 700,
            cursor: "pointer", transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = BRAND.red; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = BRAND.dark; e.currentTarget.style.transform = "translateY(0)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="17" cy="7" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="7" cy="17" r="1.5" fill="currentColor"/><circle cx="17" cy="17" r="1.5" fill="currentColor"/></svg>
            Get Started
          </button>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d={mobileOpen ? "M6 6l12 12M6 18L18 6" : "M3 7h18M3 12h18M3 17h18"} stroke={BRAND.dark} strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ padding: "12px 24px 20px", borderTop: `1px solid ${BRAND.border}`, display: "flex", flexDirection: "column", gap: 8 }} className="mobile-dropdown">
          {["Services", "Resources", "Company", "Free QR Tool"].map(item => (
            <a key={item} href={item === "Free QR Tool" ? "#generator" : `https://redsproutdigital.com/#${item.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              style={{ fontSize: 15, fontWeight: 600, color: BRAND.dark, textDecoration: "none", padding: "10px 0", borderBottom: `1px solid ${BRAND.border}` }}>
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

/* ── Free QR Generator ── */
function QRGenerator() {
  const [type, setType] = useState("url");
  const [fields, setFields] = useState({ url: "" });
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(400);
  const [ec, setEc] = useState("M");
  const [format, setFormat] = useState("png");
  const [generated, setGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPixelSize, setShowPixelSize] = useState(false);

  const sf = (k, v) => setFields(p => ({ ...p, [k]: v }));
  const currentType = QR_TYPES.find(t => t.id === type);
  const isPro = currentType?.pro || currentType?.biz;

  const generateQR = () => {
    if (isPro) return;
    const data = buildData(type, fields);
    if (!data || data.length < 3) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}x${size}&color=${fgColor.replace("#", "")}&bgcolor=${bgColor.replace("#", "")}&format=${format}&ecc=${ec}`;
    setQrUrl(url);
    setGenerated(true);
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qr-code-${type}-${size}px.${format}`;
    a.target = "_blank";
    a.click();
  };

  return (
    <section id="generator" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 99, background: "rgba(212,43,43,.06)", color: BRAND.red, fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: ".02em" }}>
          ✦ 100% FREE · NO SIGNUP · NO WATERMARK
        </div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.08, color: BRAND.dark }}>
          Generate QR Codes <span style={{ color: BRAND.red }}>Instantly</span>
        </h2>
        <p style={{ fontSize: 16, color: BRAND.mid, marginTop: 8, maxWidth: 500, margin: "8px auto 0" }}>
          Choose your type, customize colors & size, download in PNG or SVG. No account needed.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }} className="gen-grid">
        {/* LEFT: Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* QR Type Grid */}
          <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: BRAND.dim, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 10 }}>QR Code Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6 }}>
              {QR_TYPES.filter(t => t.free).map(t => (
                <button key={t.id} onClick={() => { setType(t.id); setGenerated(false); }} style={{
                  padding: "10px 12px", borderRadius: 10,
                  border: `1.5px solid ${type === t.id ? BRAND.red : BRAND.border}`,
                  background: type === t.id ? "rgba(212,43,43,.04)" : "#fff",
                  cursor: "pointer", textAlign: "left", transition: "all .15s",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: type === t.id ? BRAND.red : BRAND.dark }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: BRAND.dim }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: BRAND.dim, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 8 }}>Content</label>

            {type === "url" && <input value={fields.url || ""} onChange={e => sf("url", e.target.value)} placeholder="https://your-website.com" style={inputStyle} />}
            {type === "text" && <textarea value={fields.text || ""} onChange={e => sf("text", e.target.value)} placeholder="Enter your text..." rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} />}
            {type === "email" && <><input value={fields.email || ""} onChange={e => sf("email", e.target.value)} placeholder="email@company.com" style={{ ...inputStyle, marginBottom: 8 }} /><input value={fields.subject || ""} onChange={e => sf("subject", e.target.value)} placeholder="Subject" style={{ ...inputStyle, marginBottom: 8 }} /><textarea value={fields.body || ""} onChange={e => sf("body", e.target.value)} placeholder="Email body..." rows={2} style={{ ...inputStyle, resize: "vertical" }} /></>}
            {type === "phone" && <input value={fields.phone || ""} onChange={e => sf("phone", e.target.value)} placeholder="+91 98765 43210" style={inputStyle} />}
            {type === "whatsapp" && <><input value={fields.waNum || ""} onChange={e => sf("waNum", e.target.value)} placeholder="91XXXXXXXXXX (with country code)" style={{ ...inputStyle, marginBottom: 8 }} /><input value={fields.waMsg || ""} onChange={e => sf("waMsg", e.target.value)} placeholder="Pre-filled message (optional)" style={inputStyle} /></>}
            {type === "upi" && <><input value={fields.upiId || ""} onChange={e => sf("upiId", e.target.value)} placeholder="yourname@upi" style={{ ...inputStyle, marginBottom: 8 }} /><input value={fields.upiName || ""} onChange={e => sf("upiName", e.target.value)} placeholder="Payee name" style={{ ...inputStyle, marginBottom: 8 }} /><input value={fields.upiAmt || ""} onChange={e => sf("upiAmt", e.target.value)} placeholder="Amount (optional)" style={inputStyle} /></>}
            {type === "wifi" && <><input value={fields.ssid || ""} onChange={e => sf("ssid", e.target.value)} placeholder="WiFi Network Name" style={{ ...inputStyle, marginBottom: 8 }} /><input value={fields.pass || ""} onChange={e => sf("pass", e.target.value)} placeholder="Password" style={{ ...inputStyle, marginBottom: 8 }} /><div style={{ display: "flex", gap: 6 }}>{["WPA", "WEP", "nopass"].map(enc => <button key={enc} onClick={() => sf("enc", enc)} style={{ ...pillStyle, background: (fields.enc || "WPA") === enc ? BRAND.dark : "#fff", color: (fields.enc || "WPA") === enc ? "#fff" : BRAND.mid, border: `1.5px solid ${(fields.enc || "WPA") === enc ? BRAND.dark : BRAND.border}` }}>{enc === "nopass" ? "None" : enc}</button>)}</div></>}
            {type === "vcard" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><input value={fields.name || ""} onChange={e => sf("name", e.target.value)} placeholder="Full Name" style={inputStyle} /><input value={fields.vph || ""} onChange={e => sf("vph", e.target.value)} placeholder="Phone" style={inputStyle} /><input value={fields.vem || ""} onChange={e => sf("vem", e.target.value)} placeholder="Email" style={inputStyle} /><input value={fields.org || ""} onChange={e => sf("org", e.target.value)} placeholder="Company" style={inputStyle} /><input value={fields.vurl || ""} onChange={e => sf("vurl", e.target.value)} placeholder="Website" style={{ ...inputStyle, gridColumn: "1 / -1" }} /></div>}
          </div>

          {/* Advanced Options */}
          <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 20 }}>
            <div onClick={() => setShowAdvanced(!showAdvanced)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: BRAND.dim, textTransform: "uppercase", letterSpacing: ".06em" }}>Customize Appearance</label>
              <span style={{ fontSize: 12, color: BRAND.dim }}>{showAdvanced ? "▼" : "▶"}</span>
            </div>
            {showAdvanced && (
              <div style={{ marginTop: 16 }}>
                {/* Colors */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: BRAND.dim, display: "block", marginBottom: 6 }}>QR COLOR</label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {FG_COLORS.map(c => <button key={c} onClick={() => setFgColor(c)} style={{ width: 26, height: 26, borderRadius: 6, border: `2px solid ${fgColor === c ? BRAND.red : BRAND.border}`, background: c, cursor: "pointer", transition: "all .15s" }} />)}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: BRAND.dim, display: "block", marginBottom: 6 }}>BACKGROUND</label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {BG_COLORS.map(c => <button key={c} onClick={() => setBgColor(c)} style={{ width: 26, height: 26, borderRadius: 6, border: `2px solid ${bgColor === c ? BRAND.red : BRAND.border}`, background: c, cursor: "pointer", transition: "all .15s" }} />)}
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: BRAND.dim }}>SIZE (PIXELS)</label>
                    <span style={{ fontSize: 11, fontWeight: 800, color: BRAND.dark }}>{size} × {size} px</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {SIZES.map(s => <button key={s} onClick={() => setSize(s)} style={{ ...pillStyle, background: size === s ? BRAND.dark : "#fff", color: size === s ? "#fff" : BRAND.mid, border: `1.5px solid ${size === s ? BRAND.dark : BRAND.border}`, fontSize: 10 }}>{s}</button>)}
                  </div>
                </div>

                {/* Error Correction */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: BRAND.dim, display: "block", marginBottom: 6 }}>ERROR CORRECTION</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {EC_LEVELS.map(e => <button key={e.id} onClick={() => setEc(e.id)} style={{ ...pillStyle, flex: 1, background: ec === e.id ? BRAND.dark : "#fff", color: ec === e.id ? "#fff" : BRAND.mid, border: `1.5px solid ${ec === e.id ? BRAND.dark : BRAND.border}`, flexDirection: "column", padding: "8px 8px" }}>
                      <span style={{ fontSize: 13, fontWeight: 800 }}>{e.id}</span>
                      <span style={{ fontSize: 9, opacity: .7 }}>{e.desc}</span>
                    </button>)}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: BRAND.dim, display: "block", marginBottom: 6 }}>DOWNLOAD FORMAT</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {FORMATS.map(f => <button key={f} onClick={() => setFormat(f)} style={{ ...pillStyle, flex: 1, background: format === f ? BRAND.dark : "#fff", color: format === f ? "#fff" : BRAND.mid, border: `1.5px solid ${format === f ? BRAND.dark : BRAND.border}`, fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>{f}</button>)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button onClick={generateQR} disabled={isPro} style={{
            width: "100%", padding: "16px 24px", borderRadius: 14, border: "none",
            background: isPro ? BRAND.border : BRAND.dark, color: isPro ? BRAND.dim : "#fff",
            fontSize: 16, fontWeight: 800, cursor: isPro ? "not-allowed" : "pointer",
            transition: "all .2s", letterSpacing: "-.01em",
          }}
          onMouseEnter={e => { if (!isPro) { e.currentTarget.style.background = BRAND.red; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,43,43,.2)"; }}}
          onMouseLeave={e => { if (!isPro) { e.currentTarget.style.background = BRAND.dark; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}}>
            {isPro ? "🔒 Sign Up Free to Unlock This Type" : "⚡ Generate QR Code — Free"}
          </button>
        </div>

        {/* RIGHT: Preview */}
        <div style={{ position: "sticky", top: 80 }}>
          <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: BRAND.dim, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 16 }}>Preview</label>

            <div style={{ padding: 20, borderRadius: 16, background: bgColor, border: `1px solid ${BRAND.border}`, display: "inline-block", marginBottom: 16 }}>
              {generated && qrUrl ? (
                <img src={qrUrl} alt="QR Code" style={{ width: 220, height: 220, display: "block" }} />
              ) : (
                <div style={{ width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 40, opacity: .3 }}>📸</div>
                  <p style={{ fontSize: 12, color: BRAND.ghost, maxWidth: 160, lineHeight: 1.5 }}>Enter content and click Generate</p>
                </div>
              )}
            </div>

            {generated && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={downloadQR} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: BRAND.dark, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = BRAND.red}
                  onMouseLeave={e => e.currentTarget.style.background = BRAND.dark}>
                  ⬇ Download {format.toUpperCase()} ({size}px)
                </button>
                <div style={{ fontSize: 10, color: BRAND.ghost, lineHeight: 1.5 }}>
                  {size}×{size}px · {format.toUpperCase()} · EC: {ec} · No watermark
                </div>
              </div>
            )}

            {/* Upsell */}
            <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "rgba(212,43,43,.03)", border: "1px solid rgba(212,43,43,.1)", textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: BRAND.red, marginBottom: 6 }}>🔓 Unlock More with Free Account</div>
              <ul style={{ fontSize: 11, color: BRAND.mid, lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                <li>Add your <b>logo</b> on QR code</li>
                <li><b>Dynamic QR</b> — edit destination after printing</li>
                <li><b>Analytics</b> — track scans, devices, locations</li>
                <li><b>Restaurant menus</b>, catalogues, events</li>
                <li><b>Bulk generate</b> from CSV</li>
              </ul>
              <a href="/auth/register" style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 800, color: "#fff", background: BRAND.red, padding: "8px 18px", borderRadius: 8, textDecoration: "none", transition: "all .2s" }}>
                Sign Up Free →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Industry / Premium Features Section ── */
function ProFeatures() {
  const features = [
    {
      icon: "🔄", title: "Dynamic QR Codes", tag: "PRO", tagColor: BRAND.red,
      desc: "Edit the destination URL anytime — even after printing 10,000 flyers. Pause, schedule changes, or redirect to seasonal pages.",
      bullets: ["Change URL without reprinting", "Pause/unpause anytime", "Schedule future changes", "Short branded link included"],
    },
    {
      icon: "📊", title: "Analytics Dashboard", tag: "PRO", tagColor: BRAND.red,
      desc: "Track every scan. See real-time data on devices, locations, browsers, peak hours, and campaign ROI with UTM support.",
      bullets: ["Scans by time, device, location", "UTM campaign tracking", "Top performing QR codes", "Export reports PDF/CSV"],
    },
    {
      icon: "🍽️", title: "Restaurant Mode", tag: "BUSINESS", tagColor: "#166534",
      desc: "Table-specific QR menus with allergen filters, dietary labels (Veg/Vegan/Jain/Halal), call waiter, and feedback collection.",
      bullets: ["Table 1, Table 2... auto-generated", "Allergy & diet filters", "Call waiter button", "Customer feedback system", "Accessibility-first design"],
    },
    {
      icon: "📦", title: "Product Catalogue", tag: "PRO", tagColor: BRAND.red,
      desc: "Create beautiful product showcase pages with images, pricing, WhatsApp order button, and lead capture. Perfect for small businesses.",
      bullets: ["Product cards with images", "WhatsApp order button", "Lead capture form", "Google Maps integration"],
    },
    {
      icon: "🔀", title: "Smart Routing & A/B Testing", tag: "BUSINESS", tagColor: "#166534",
      desc: "One QR code → different pages based on country, language, device, or time. A/B test with 50/50 split for offline ads.",
      bullets: ["Route by country/device/language", "Time-based routing", "A/B test with conversion tracking", "Automatic winner detection"],
    },
    {
      icon: "🛡️", title: "Anti-Phishing Security", tag: "BUSINESS", tagColor: "#166534",
      desc: "Safe scan preview page shows the real URL before redirecting. Google Safe Browsing checks, domain allowlists, tamper guidance.",
      bullets: ["Preview page before redirect", "Google Safe Browsing API", "Domain allowlist for brands", "Tamper detection guidance"],
    },
    {
      icon: "🏷️", title: "GS1 Digital Link & FSSAI", tag: "ENTERPRISE", tagColor: "#1e40af",
      desc: "Product packaging compliance for GS1 Sunrise 2027. GTIN + batch + expiry + serial encoding. India FSSAI templates included.",
      bullets: ["GS1 Digital Link generator", "Batch, expiry, serial support", "India FSSAI compliance", "Multilingual product pages"],
    },
    {
      icon: "🏢", title: "White-Label for Agencies", tag: "AGENCY", tagColor: "#7c3aed",
      desc: "Your brand, your domain, your clients. Full white-label portal with client sub-accounts, per-client analytics, and report exports.",
      bullets: ["Custom domain & branding", "Client sub-accounts", "Per-client analytics", "PDF report exports", "API access"],
    },
  ];

  return (
    <section style={{ background: BRAND.dark, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(212,43,43,.06)", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(110,203,181,.05)", filter: "blur(60px)" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ display: "inline-flex", padding: "6px 16px", borderRadius: 99, background: "rgba(212,43,43,.12)", color: "#F87171", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>🚀 Unlock Premium Features</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: "-.03em", lineHeight: 1.1 }}>
            Built for Every Industry
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.45)", marginTop: 8, maxWidth: 500, margin: "8px auto 0" }}>
            From restaurants to packaging compliance — features that top QR platforms charge $50+/month for.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {features.map((f, i) => (
            <a key={i} href="/auth/register" style={{
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 16, padding: 24, textDecoration: "none",
              transition: "all .25s", cursor: "pointer", display: "block",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{f.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: f.tagColor, color: "#fff", letterSpacing: ".05em" }}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.45)", lineHeight: 1.6, marginBottom: 12 }}>{f.desc}</p>
              <ul style={{ fontSize: 11, color: "rgba(255,255,255,.35)", lineHeight: 2, paddingLeft: 16, margin: 0 }}>
                {f.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
              <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: BRAND.red }}>
                Start Free Trial →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
function Pricing() {
  const plans = [
    { name: "Free", price: "₹0", period: "forever", desc: "Static QR codes, no signup needed", cta: "Use Free Tool ↑", ctaLink: "#generator", highlight: false,
      features: ["8 static QR types", "Unlimited downloads", "Custom colors & sizes", "PNG + SVG export", "No watermark", "No signup required"] },
    { name: "Pro", price: "₹499", period: "/month", desc: "For marketers & growing businesses", cta: "Start Free Trial →", ctaLink: "/auth/register", highlight: true,
      features: ["Everything in Free", "Dynamic QR (edit after print)", "Analytics dashboard", "UTM campaign tracking", "Logo on QR code", "Landing pages (5)", "Restaurant menu", "Product catalogue", "10,000 scans/month"] },
    { name: "Business", price: "₹1,499", period: "/month", desc: "For restaurants, brands & teams", cta: "Start Free Trial →", ctaLink: "/auth/register", highlight: false,
      features: ["Everything in Pro", "Unlimited dynamic QR", "Smart routing + A/B testing", "Restaurant mode (tables + allergy)", "Bulk CSV import", "Security pack", "3 team members", "100,000 scans/month"] },
    { name: "Agency", price: "₹4,999", period: "/month", desc: "White-label for agencies", cta: "Contact Sales →", ctaLink: "/auth/register", highlight: false,
      features: ["Everything in Business", "White-label portal", "Custom domain", "10 client accounts", "Per-client reports", "API access", "Unlimited scans", "Priority support"] },
  ];

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-.03em", color: BRAND.dark }}>Simple, Transparent Pricing</h2>
        <p style={{ fontSize: 15, color: BRAND.mid, marginTop: 8 }}>Start free. Upgrade when you need more.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {plans.map((p, i) => (
          <div key={i} style={{
            background: p.highlight ? BRAND.dark : BRAND.card,
            border: p.highlight ? "2px solid " + BRAND.red : `1px solid ${BRAND.border}`,
            borderRadius: 18, padding: "28px 22px", position: "relative",
            transition: "all .2s",
          }}>
            {p.highlight && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: BRAND.red, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 14px", borderRadius: 99, letterSpacing: ".04em" }}>MOST POPULAR</div>}
            <div style={{ fontSize: 14, fontWeight: 800, color: p.highlight ? "#fff" : BRAND.dark, marginBottom: 4 }}>{p.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: p.highlight ? "#fff" : BRAND.dark, letterSpacing: "-.03em" }}>{p.price}</span>
              <span style={{ fontSize: 13, color: p.highlight ? "rgba(255,255,255,.5)" : BRAND.dim }}>{p.period}</span>
            </div>
            <p style={{ fontSize: 12, color: p.highlight ? "rgba(255,255,255,.45)" : BRAND.dim, marginBottom: 20 }}>{p.desc}</p>
            <a href={p.ctaLink} style={{
              display: "block", textAlign: "center", padding: "12px 20px", borderRadius: 10,
              background: p.highlight ? BRAND.red : "transparent",
              border: p.highlight ? "none" : `1.5px solid ${BRAND.border}`,
              color: p.highlight ? "#fff" : BRAND.dark,
              fontSize: 13, fontWeight: 800, textDecoration: "none", transition: "all .2s", marginBottom: 20,
            }}>{p.cta}</a>
            <ul style={{ fontSize: 12, color: p.highlight ? "rgba(255,255,255,.6)" : BRAND.mid, lineHeight: 2.2, paddingLeft: 0, margin: 0, listStyle: "none" }}>
              {p.features.map((f, j) => <li key={j} style={{ paddingLeft: 18, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: p.highlight ? BRAND.red : BRAND.mintDark }}>✓</span> {f}
              </li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ background: BRAND.dark, borderTop: "1px solid rgba(255,255,255,.06)", padding: "40px 24px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>redsprout<span style={{ color: BRAND.red }}>digital.</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>QR Code Platform · Built in India 🇮🇳</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => <a key={l} href={`https://redsproutdigital.com/${l.toLowerCase()}`} style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textDecoration: "none" }}>{l}</a>)}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "16px auto 0", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)", fontSize: 11, color: "rgba(255,255,255,.2)", textAlign: "center" }}>
        © {new Date().getFullYear()} RedSprout Digital. All rights reserved.
      </div>
    </footer>
  );
}

/* ── Styles ── */
const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: `1.5px solid ${BRAND.border}`, background: "#FAFAF8",
  fontSize: 14, color: BRAND.dark, outline: "none",
  fontFamily: "inherit", transition: "all .2s",
  boxSizing: "border-box",
};
const pillStyle = {
  padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
  cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center",
  justifyContent: "center", textAlign: "center", fontFamily: "inherit",
};

/* ══════ MAIN APP ══════ */
export default function HomePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: BRAND.text, background: BRAND.bg, WebkitFontSmoothing: "antialiased" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <Header onGetStarted={() => window.location.href = "/auth/register"} />
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "60px 24px 20px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 99, background: "rgba(212,43,43,.05)", marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.red }}>🔥 Trusted by 120+ brands across 7 countries</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.05, color: BRAND.dark }}>
          The QR Platform That<br /><span style={{ color: BRAND.red }}>Does Everything</span>.
        </h1>
        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: BRAND.mid, marginTop: 14, lineHeight: 1.6, maxWidth: 560, margin: "14px auto 0" }}>
          Free static QR codes. Dynamic links you can edit after printing. Analytics, restaurant menus, A/B testing, and white-label — all in one platform.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          <a href="#generator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: BRAND.dark, color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = BRAND.red; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = BRAND.dark; e.currentTarget.style.transform = "translateY(0)"; }}>
            Generate Free QR Code ↓
          </a>
          <a href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: "transparent", border: `1.5px solid ${BRAND.border}`, color: BRAND.dark, fontSize: 15, fontWeight: 700, textDecoration: "none", transition: "all .2s" }}>
            Start Free Trial →
          </a>
        </div>
      </section>

      <QRGenerator />
      <ProFeatures />
      <Pricing />
      <Footer />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(212,43,43,.1); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 99px; }
        input:focus, textarea:focus { border-color: ${BRAND.red} !important; box-shadow: 0 0 0 3px rgba(212,43,43,.06); background: #fff !important; }
        @media(max-width:900px) {
          .gen-grid { grid-template-columns: 1fr !important; }
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media(min-width:901px) {
          .mobile-dropdown { display: none !important; }
        }
      `}</style>
    </div>
  );
}
