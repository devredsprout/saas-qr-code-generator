"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg:"#F6F5F1",card:"#FFF",cardAlt:"#FAFAF8",border:"#E9E8E4",borderH:"#A8DFD0",
  mint:"#6ECBB5",mintD:"#3AAE8C",mintDeep:"#2A8E70",mintG:"rgba(110,203,181,.08)",mintGlow:"rgba(110,203,181,.22)",
  dark:"#111110",text:"#1C1C1A",mid:"#555550",dim:"#9A9A90",ghost:"#C4C4BB",
  red:"#E45B5B",blue:"#6366F1",orange:"#F59E0B",pink:"#EC4899",purple:"#7C3AED",
};

const QR_TYPES = [
  {id:"url",label:"URL / Website",icon:"🔗",free:true,desc:"Any link"},
  {id:"text",label:"Plain Text",icon:"📝",free:true,desc:"Text message"},
  {id:"wifi",label:"WiFi Access",icon:"📶",free:true,desc:"WiFi credentials"},
  {id:"email",label:"Email",icon:"✉️",free:true,desc:"Pre-filled email"},
  {id:"phone",label:"Phone / Call",icon:"📞",free:true,desc:"Click to call"},
  {id:"vcard",label:"vCard Contact",icon:"👤",free:true,desc:"Business card"},
  {id:"whatsapp",label:"WhatsApp",icon:"💬",free:true,desc:"Direct chat"},
  {id:"upi",label:"UPI Payment",icon:"💳",free:true,desc:"India UPI pay"},
  {id:"dynamic",label:"Dynamic QR",icon:"🔄",pro:true,desc:"Edit after print"},
  {id:"restaurant",label:"Restaurant Menu",icon:"🍽️",pro:true,desc:"Digital menu"},
  {id:"catalogue",label:"Product Catalogue",icon:"📦",pro:true,desc:"Product showcase"},
  {id:"social",label:"Social Bio",icon:"📱",pro:true,desc:"All socials link"},
  {id:"event",label:"Event / Ticket",icon:"🎫",pro:true,desc:"Event RSVP"},
  {id:"pdf",label:"PDF / Document",icon:"📄",pro:true,desc:"File sharing"},
  {id:"review",label:"Review Collector",icon:"⭐",pro:true,desc:"Google reviews"},
  {id:"gs1",label:"GS1 Digital Link",icon:"🏷️",biz:true,desc:"Packaging compliance"},
];

const FG=["#000000","#111110","#1a1a2e","#166534","#0f766e","#1e40af","#7c3aed","#be185d","#92400e","#D42B2B"];
const BG=["#ffffff","#f8f8f8","#F6F5F1","#f0fdf4","#e0f5ef","#eff6ff","#faf5ff","#fff1f2"];
const SIZES=[200,300,400,600,800,1000,1500,2000];
const ECC=[{id:"L",d:"7% — Smallest"},{id:"M",d:"15% — Default"},{id:"Q",d:"25% — For logos"},{id:"H",d:"30% — Best for logos"}];

function buildData(t,f){
  switch(t){
    case"url":return f.url||"";
    case"text":return f.text||"";
    case"email":return`mailto:${f.email||""}?subject=${encodeURIComponent(f.subject||"")}&body=${encodeURIComponent(f.body||"")}`;
    case"phone":return`tel:${f.phone||""}`;
    case"whatsapp":return`https://wa.me/${(f.waNum||"").replace(/[^0-9]/g,"")}?text=${encodeURIComponent(f.waMsg||"")}`;
    case"upi":return`upi://pay?pa=${f.upiId||""}&pn=${encodeURIComponent(f.upiName||"")}&am=${f.upiAmt||""}&cu=INR`;
    case"wifi":return`WIFI:T:${f.enc||"WPA"};S:${f.ssid||""};P:${f.pass||""};;`;
    case"vcard":return`BEGIN:VCARD\nVERSION:3.0\nFN:${f.name||""}\nTEL:${f.vph||""}\nEMAIL:${f.vem||""}\nORG:${f.org||""}\nURL:${f.vurl||""}\nEND:VCARD`;
    default:return f.url||"";
  }
}

const inp={width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.cardAlt,fontSize:14,color:C.text,outline:"none",fontFamily:"inherit",transition:"all .2s",boxSizing:"border-box"};
const pill={padding:"8px 12px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",border:`1.5px solid ${C.border}`,background:"#fff",color:C.mid};

export default function HomePage(){
  const [scrolled,setScrolled]=useState(false);
  const [mobNav,setMobNav]=useState(false);
  const [type,setType]=useState("url");
  const [fields,setFields]=useState({url:""});
  const [fg,setFg]=useState("#000000");
  const [bg,setBg]=useState("#ffffff");
  const [sz,setSz]=useState(400);
  const [ec,setEc]=useState("M");
  const [fmt,setFmt]=useState("png");
  const [gen,setGen]=useState(false);
  const [qrUrl,setQrUrl]=useState("");
  const [adv,setAdv]=useState(false);
  const [logo,setLogo]=useState(null);
  const [logoPreview,setLogoPreview]=useState(null);
  const canvasRef=useRef(null);

  useEffect(()=>{const h=()=>setScrolled(window.scrollY>10);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);

  const sf=(k,v)=>setFields(p=>({...p,[k]:v}));
  const ct=QR_TYPES.find(t=>t.id===type);
  const isPro=ct?.pro||ct?.biz;

  const handleLogo=(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    setLogo(file);
    const reader=new FileReader();
    reader.onload=(ev)=>setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const generateQR=()=>{
    if(isPro)return;
    const data=buildData(type,fields);
    if(!data||data.length<3)return;
    const eccLevel=logo?"H":ec;
    const url=`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${sz}x${sz}&color=${fg.replace("#","")}&bgcolor=${bg.replace("#","")}&format=png&ecc=${eccLevel}`;
    setQrUrl(url);
    setGen(true);
    if(logo&&logoPreview){
      const img=new Image();img.crossOrigin="anonymous";
      img.onload=()=>{
        const canvas=canvasRef.current;if(!canvas)return;
        canvas.width=sz;canvas.height=sz;
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0,sz,sz);
        const logoImg=new Image();
        logoImg.onload=()=>{
          const logoSz=sz*0.22;const x=(sz-logoSz)/2;const y=(sz-logoSz)/2;
          ctx.fillStyle=bg;
          ctx.beginPath();ctx.roundRect(x-6,y-6,logoSz+12,logoSz+12,12);ctx.fill();
          ctx.drawImage(logoImg,x,y,logoSz,logoSz);
        };
        logoImg.src=logoPreview;
      };
      img.src=url;
    }
  };

  const downloadQR=()=>{
    if(logo&&canvasRef.current){
      const link=document.createElement("a");
      link.download=`qr-${type}-${sz}px-logo.png`;
      link.href=canvasRef.current.toDataURL("image/png");
      link.click();
    }else if(qrUrl){
      const a=document.createElement("a");a.href=qrUrl;a.download=`qr-${type}-${sz}px.${fmt}`;a.target="_blank";a.click();
    }
  };

  const proFeatures=[
    {icon:"🔄",title:"Dynamic QR Codes",tag:"PRO",tagC:C.mint,desc:"Edit destination URL anytime — even after printing.",pts:["Change URL without reprinting","Pause/schedule changes","Short branded link","Scan tracking built-in"]},
    {icon:"📊",title:"Analytics Dashboard",tag:"PRO",tagC:C.mint,desc:"Track scans by device, location, browser, time. UTM + campaign ROI.",pts:["Real-time scan charts","Device & geo breakdown","UTM campaign tracking","PDF/CSV report export"]},
    {icon:"🍽️",title:"Restaurant Mode",tag:"BIZ",tagC:C.orange,desc:"Table-specific menus with allergy filters, waiter call, feedback.",pts:["Table 1, 2... auto-QR","Allergy & diet labels","Call waiter button","Accessibility-first"]},
    {icon:"📦",title:"Product Catalogue",tag:"PRO",tagC:C.mint,desc:"Product showcase with images, pricing, WhatsApp ordering.",pts:["Product cards","WhatsApp order","Lead capture form","Google Maps embed"]},
    {icon:"🔀",title:"Smart Routing + A/B",tag:"BIZ",tagC:C.orange,desc:"One QR → different pages by country/device/time. Split testing.",pts:["Route by country/device","Time-based routing","50/50 split testing","Conversion tracking"]},
    {icon:"🛡️",title:"Anti-Phishing Security",tag:"BIZ",tagC:C.orange,desc:"Safe scan preview, domain allowlists, tamper detection.",pts:["Preview before redirect","Google Safe Browsing","Brand domain allowlist","Physical tamper guidance"]},
    {icon:"🏷️",title:"GS1 & FSSAI Compliance",tag:"ENT",tagC:C.blue,desc:"Product packaging for GS1 Sunrise 2027. India FSSAI templates.",pts:["GS1 Digital Link","Batch/expiry/serial","FSSAI templates","Multilingual pages"]},
    {icon:"🏢",title:"White-Label Agency",tag:"AGENCY",tagC:C.purple,desc:"Your brand, domain, clients. Full white-label portal + API.",pts:["Custom domain","Client sub-accounts","Per-client reports","API + webhooks"]},
    {icon:"🖼️",title:"Logo on QR Code",tag:"PRO",tagC:C.mint,desc:"Embed your brand logo in the center of every QR code.",pts:["Upload any logo","Auto error correction","Center placement","Branded downloads"]},
    {icon:"📄",title:"Landing Page Builder",tag:"PRO",tagC:C.mint,desc:"No-code pages: buttons, WhatsApp, map, reviews, lead forms.",pts:["8 templates","Drag-and-drop","Custom branding","Lead capture"]},
  ];

  const plans=[
    {name:"Free",price:"₹0",per:"forever",desc:"Static QR, no signup",cta:"Use Free Tool ↑",link:"#generator",hl:false,
     f:["8 static QR types","Custom colors & sizes","PNG + SVG export","Up to 2000px resolution","No watermark","No signup"]},
    {name:"Pro",price:"₹499",per:"/month",desc:"Marketers & small biz",cta:"Start 14-Day Free Trial",link:"/auth/register",hl:true,
     f:["Everything in Free","Dynamic QR (edit after print)","Logo on QR code","Analytics dashboard","UTM campaign tracking","5 landing pages","Restaurant menu","Product catalogue","10,000 scans/month"]},
    {name:"Business",price:"₹1,499",per:"/month",desc:"Restaurants & brands",cta:"Start 14-Day Free Trial",link:"/auth/register",hl:false,
     f:["Everything in Pro","Unlimited dynamic QR","Smart routing + A/B testing","Restaurant mode (tables + allergy)","Bulk CSV import","Security pack","3 team members","100K scans/month"]},
    {name:"Agency",price:"₹4,999",per:"/month",desc:"White-label agencies",cta:"Contact Sales",link:"/auth/register",hl:false,
     f:["Everything in Business","White-label portal","Custom domain","10 client accounts","Per-client reports","API access","Unlimited scans","Priority support"]},
  ];

  return(
  <div style={{fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text,background:C.bg,WebkitFontSmoothing:"antialiased"}}>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <canvas ref={canvasRef} style={{display:"none"}}/>

  {/* ═══ HEADER ═══ */}
  <header style={{position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(255,255,255,.97)":"#fff",borderBottom:`1px solid ${scrolled?C.border:"transparent"}`,backdropFilter:"blur(12px)",transition:"all .3s"}}>
    <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
      <a href="https://redsproutdigital.com" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
        <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.mint},${C.mintD})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${C.mintGlow}`}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white"/></svg>
        </div>
        <div style={{lineHeight:1.1}}><div style={{fontSize:15,fontWeight:800,color:C.dark,letterSpacing:"-.02em"}}>RedSprout<span style={{color:C.mintD}}> QR</span></div><div style={{fontSize:9,color:C.dim,fontWeight:600,letterSpacing:".04em"}}>POWERED BY REDSPROUT DIGITAL</div></div>
      </a>
      <nav className="dNav" style={{display:"flex",gap:28,alignItems:"center"}}>
        {["Services","Resources","Company"].map(n=><a key={n} href={`https://redsproutdigital.com`} style={{fontSize:13.5,fontWeight:600,color:C.mid,textDecoration:"none",display:"flex",alignItems:"center",gap:3}}>{n}<svg width="10" height="10" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg></a>)}
      </nav>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <a href="#generator" className="dNav" style={{fontSize:12.5,fontWeight:700,color:C.mintD,textDecoration:"none"}}>Free QR Tool ↓</a>
        <a href="/auth/login" className="dNav" style={{fontSize:12.5,fontWeight:600,color:C.mid,textDecoration:"none"}}>Log In</a>
        <a href="/auth/register" style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",borderRadius:99,background:C.dark,color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none"}}>Get Started</a>
        <button onClick={()=>setMobNav(!mobNav)} className="mBtn" style={{display:"none",background:"none",border:"none",cursor:"pointer",padding:6}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d={mobNav?"M6 6l12 12M6 18L18 6":"M3 7h18M3 12h18M3 17h18"} stroke={C.dark} strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
    {mobNav&&<div className="mDrop" style={{padding:"12px 24px 20px",borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:6}}>
      {["Services","Resources","Company"].map(n=><a key={n} href="#" onClick={()=>setMobNav(false)} style={{fontSize:15,fontWeight:600,color:C.dark,textDecoration:"none",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>{n}</a>)}
      <a href="#generator" onClick={()=>setMobNav(false)} style={{fontSize:15,fontWeight:700,color:C.mintD,textDecoration:"none",padding:"10px 0"}}>Free QR Tool ↓</a>
      <a href="/auth/login" style={{fontSize:15,fontWeight:600,color:C.mid,textDecoration:"none",padding:"10px 0"}}>Log In</a>
    </div>}
  </header>

  {/* ═══ HERO ═══ */}
  <section style={{textAlign:"center",padding:"56px 24px 16px",maxWidth:780,margin:"0 auto"}}>
    <div style={{display:"inline-flex",padding:"7px 18px",borderRadius:99,background:C.mintG,marginBottom:14}}><span style={{fontSize:12,fontWeight:700,color:C.mintD}}>✦ Trusted by 120+ brands · 7 countries · 10M+ QR codes</span></div>
    <h1 style={{fontSize:"clamp(32px,5vw,54px)",fontWeight:900,letterSpacing:"-.04em",lineHeight:1.05,color:C.dark}}>QR Codes You Can<br/><span style={{color:C.mintD}}>Edit After Printing</span>.</h1>
    <p style={{fontSize:"clamp(15px,2vw,17px)",color:C.mid,marginTop:12,lineHeight:1.6,maxWidth:540,margin:"12px auto 0"}}>Free static QR codes — no signup. Dynamic links, analytics, restaurant menus, logo embed, A/B testing, and white-label. One platform.</p>
    <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
      <a href="#generator" style={{padding:"14px 28px",borderRadius:12,background:C.dark,color:"#fff",fontSize:15,fontWeight:800,textDecoration:"none",transition:"all .2s"}}>Generate Free QR ↓</a>
      <a href="/auth/register" style={{padding:"14px 28px",borderRadius:12,border:`1.5px solid ${C.border}`,color:C.dark,fontSize:15,fontWeight:700,textDecoration:"none"}}>Start Free Trial →</a>
    </div>
  </section>

  {/* ═══ FREE QR GENERATOR ═══ */}
  <section id="generator" style={{maxWidth:1200,margin:"0 auto",padding:"50px 24px"}}>
    <div style={{textAlign:"center",marginBottom:36}}>
      <div style={{display:"inline-flex",padding:"6px 16px",borderRadius:99,background:C.mintG,color:C.mintD,fontSize:11.5,fontWeight:700,marginBottom:10,letterSpacing:".02em"}}>✦ 100% FREE · NO SIGNUP · NO WATERMARK</div>
      <h2 style={{fontSize:"clamp(26px,3.5vw,38px)",fontWeight:900,letterSpacing:"-.03em",color:C.dark}}>Generate QR Codes <span style={{color:C.mintD}}>Instantly</span></h2>
    </div>
    <div className="genG" style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Types */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
          <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>QR Code Type</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:5}}>
            {QR_TYPES.map(t=>(
              <button key={t.id} onClick={()=>{setType(t.id);setGen(false);}} style={{padding:"9px 10px",borderRadius:10,border:`1.5px solid ${type===t.id?C.mintD:C.border}`,background:type===t.id?C.mintG:"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s",position:"relative",fontFamily:"inherit"}}>
                {(t.pro||t.biz)&&<span style={{position:"absolute",top:3,right:3,fontSize:7.5,fontWeight:800,padding:"2px 5px",borderRadius:99,background:t.biz?C.blue:C.mintD,color:"#fff"}}>PRO</span>}
                <div style={{fontSize:15,marginBottom:1}}>{t.icon}</div>
                <div style={{fontSize:11,fontWeight:700,color:type===t.id?C.mintD:C.dark}}>{t.label}</div>
                <div style={{fontSize:9.5,color:C.dim}}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Content */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
          <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>Content</label>
          {isPro?(
            <div style={{textAlign:"center",padding:"28px 16px"}}>
              <div style={{fontSize:30,marginBottom:6}}>🔒</div>
              <p style={{fontSize:14,fontWeight:700,color:C.dark,marginBottom:4}}>{ct?.label} requires an account</p>
              <p style={{fontSize:12,color:C.dim,marginBottom:14}}>Sign up for a free 14-day trial</p>
              <a href="/auth/register" style={{display:"inline-block",padding:"10px 24px",borderRadius:10,background:C.mintD,color:"#fff",fontSize:13,fontWeight:800,textDecoration:"none"}}>Start Free Trial →</a>
            </div>
          ):<>
            {type==="url"&&<input value={fields.url||""} onChange={e=>sf("url",e.target.value)} placeholder="https://your-website.com" style={inp}/>}
            {type==="text"&&<textarea value={fields.text||""} onChange={e=>sf("text",e.target.value)} placeholder="Enter your text..." rows={3} style={{...inp,resize:"vertical",minHeight:80}}/>}
            {type==="email"&&<><input value={fields.email||""} onChange={e=>sf("email",e.target.value)} placeholder="email@company.com" style={{...inp,marginBottom:8}}/><input value={fields.subject||""} onChange={e=>sf("subject",e.target.value)} placeholder="Subject" style={{...inp,marginBottom:8}}/><textarea value={fields.body||""} onChange={e=>sf("body",e.target.value)} placeholder="Body..." rows={2} style={{...inp,resize:"vertical"}}/></>}
            {type==="phone"&&<input value={fields.phone||""} onChange={e=>sf("phone",e.target.value)} placeholder="+91 98765 43210" style={inp}/>}
            {type==="whatsapp"&&<><input value={fields.waNum||""} onChange={e=>sf("waNum",e.target.value)} placeholder="91XXXXXXXXXX" style={{...inp,marginBottom:8}}/><input value={fields.waMsg||""} onChange={e=>sf("waMsg",e.target.value)} placeholder="Pre-filled message" style={inp}/></>}
            {type==="upi"&&<><input value={fields.upiId||""} onChange={e=>sf("upiId",e.target.value)} placeholder="yourname@upi" style={{...inp,marginBottom:8}}/><input value={fields.upiName||""} onChange={e=>sf("upiName",e.target.value)} placeholder="Payee name" style={{...inp,marginBottom:8}}/><input value={fields.upiAmt||""} onChange={e=>sf("upiAmt",e.target.value)} placeholder="Amount" style={inp}/></>}
            {type==="wifi"&&<><input value={fields.ssid||""} onChange={e=>sf("ssid",e.target.value)} placeholder="Network Name" style={{...inp,marginBottom:8}}/><input value={fields.pass||""} onChange={e=>sf("pass",e.target.value)} placeholder="Password" style={{...inp,marginBottom:8}}/><div style={{display:"flex",gap:5}}>{["WPA","WEP","nopass"].map(enc=><button key={enc} onClick={()=>sf("enc",enc)} style={{...pill,background:(fields.enc||"WPA")===enc?C.dark:"#fff",color:(fields.enc||"WPA")===enc?"#fff":C.mid,borderColor:(fields.enc||"WPA")===enc?C.dark:C.border}}>{enc==="nopass"?"None":enc}</button>)}</div></>}
            {type==="vcard"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}><input value={fields.name||""} onChange={e=>sf("name",e.target.value)} placeholder="Full Name" style={inp}/><input value={fields.vph||""} onChange={e=>sf("vph",e.target.value)} placeholder="Phone" style={inp}/><input value={fields.vem||""} onChange={e=>sf("vem",e.target.value)} placeholder="Email" style={inp}/><input value={fields.org||""} onChange={e=>sf("org",e.target.value)} placeholder="Company" style={inp}/><input value={fields.vurl||""} onChange={e=>sf("vurl",e.target.value)} placeholder="Website" style={{...inp,gridColumn:"1/-1"}}/></div>}
          </>}
        </div>
        {/* Logo Upload */}
        {!isPro&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
          <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>Add Logo on QR <span style={{color:C.mintD,fontSize:9}}>(FREE PREVIEW · HIGH-RES = PRO)</span></label>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <label style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:10,border:`1.5px dashed ${C.border}`,cursor:"pointer",transition:"all .2s",flex:1}}>
              <span style={{fontSize:18}}>🖼️</span>
              <span style={{fontSize:12,fontWeight:600,color:C.mid}}>{logo?logo.name:"Upload logo (PNG, JPG)"}</span>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogo} style={{display:"none"}}/>
            </label>
            {logo&&<button onClick={()=>{setLogo(null);setLogoPreview(null);}} style={{...pill,color:C.red,borderColor:"#fecaca",fontSize:10}}>✕ Remove</button>}
          </div>
          {logoPreview&&<div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}><img src={logoPreview} style={{width:32,height:32,borderRadius:6,objectFit:"contain",border:`1px solid ${C.border}`}}/><span style={{fontSize:11,color:C.dim}}>Logo will be centered on QR. Error correction set to H automatically.</span></div>}
        </div>}
        {/* Advanced */}
        {!isPro&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
          <div onClick={()=>setAdv(!adv)} style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}}>
            <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:".06em"}}>Customize</label>
            <span style={{fontSize:11,color:C.dim}}>{adv?"▼":"▶"}</span>
          </div>
          {adv&&<div style={{marginTop:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:5}}>QR COLOR</label><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{FG.map(c=><button key={c} onClick={()=>setFg(c)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${fg===c?C.mintD:C.border}`,background:c,cursor:"pointer"}}/>)}</div></div>
              <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:5}}>BACKGROUND</label><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{BG.map(c=><button key={c} onClick={()=>setBg(c)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${bg===c?C.mintD:C.border}`,background:c,cursor:"pointer"}}/>)}</div></div>
            </div>
            <div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><label style={{fontSize:10,fontWeight:700,color:C.dim}}>PIXEL SIZE</label><span style={{fontSize:11,fontWeight:800}}>{sz}×{sz}px</span></div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{SIZES.map(s=><button key={s} onClick={()=>setSz(s)} style={{...pill,background:sz===s?C.dark:"#fff",color:sz===s?"#fff":C.mid,borderColor:sz===s?C.dark:C.border,fontSize:10,padding:"6px 10px"}}>{s}</button>)}</div></div>
            <div style={{marginBottom:14}}><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:5}}>ERROR CORRECTION</label><div style={{display:"flex",gap:3}}>{ECC.map(e=><button key={e.id} onClick={()=>setEc(e.id)} style={{...pill,flex:1,background:ec===e.id?C.dark:"#fff",color:ec===e.id?"#fff":C.mid,borderColor:ec===e.id?C.dark:C.border,flexDirection:"column",padding:"7px 6px"}}><span style={{fontSize:13,fontWeight:800}}>{e.id}</span><span style={{fontSize:8,opacity:.7}}>{e.d}</span></button>)}</div></div>
            <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:5}}>FORMAT</label><div style={{display:"flex",gap:5}}>{["png","svg"].map(f=><button key={f} onClick={()=>setFmt(f)} style={{...pill,flex:1,background:fmt===f?C.dark:"#fff",color:fmt===f?"#fff":C.mid,borderColor:fmt===f?C.dark:C.border,fontSize:13,fontWeight:800,textTransform:"uppercase"}}>{f}</button>)}</div></div>
          </div>}
        </div>}
        <button onClick={generateQR} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:isPro?C.border:`linear-gradient(135deg,${C.mint},${C.mintD})`,color:isPro?C.dim:"#fff",fontSize:15,fontWeight:800,cursor:isPro?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:isPro?"none":`0 4px 20px ${C.mintGlow}`,transition:"all .2s"}}>
          {isPro?"🔒 Start Free Trial to Unlock":"⚡ Generate QR Code — Free"}
        </button>
      </div>
      {/* Preview */}
      <div style={{position:"sticky",top:80}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:22,textAlign:"center"}}>
          <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:14}}>Preview</label>
          <div style={{padding:18,borderRadius:16,background:bg,border:`1px solid ${C.border}`,display:"inline-block",marginBottom:14}}>
            {gen&&qrUrl?(<>{logo&&logoPreview?<canvas ref={canvasRef} style={{width:200,height:200,display:"block"}}/>:<img src={qrUrl} alt="QR" style={{width:200,height:200,display:"block"}}/>}</>):(<div style={{width:200,height:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}><div style={{fontSize:36,opacity:.3}}>📸</div><p style={{fontSize:11,color:C.ghost,maxWidth:150,lineHeight:1.5}}>Enter content & click Generate</p></div>)}
          </div>
          {gen&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
            <button onClick={downloadQR} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:C.dark,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>⬇ Download {fmt.toUpperCase()} ({sz}px){logo?" + Logo":""}</button>
            <div style={{fontSize:9.5,color:C.ghost}}>{sz}×{sz}px · {fmt.toUpperCase()} · EC: {logo?"H":ec} · No watermark</div>
          </div>}
          <div style={{marginTop:18,padding:14,borderRadius:12,background:C.mintG,border:`1px solid ${C.borderH}`,textAlign:"left"}}>
            <div style={{fontSize:11.5,fontWeight:800,color:C.mintD,marginBottom:5}}>🔓 Unlock Pro Features</div>
            <ul style={{fontSize:10.5,color:C.mid,lineHeight:1.9,paddingLeft:14,margin:0}}><li><b>Dynamic QR</b> — edit after printing</li><li><b>Analytics</b> — track scans & devices</li><li><b>Hi-res logo</b> on QR code</li><li><b>Restaurant</b> menus & catalogues</li><li><b>Bulk generate</b> from CSV</li></ul>
            <a href="/auth/register" style={{display:"inline-block",marginTop:8,fontSize:11.5,fontWeight:800,color:"#fff",background:C.mintD,padding:"8px 16px",borderRadius:8,textDecoration:"none"}}>Start Free Trial →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* ═══ PRO FEATURES ═══ */}
  <section style={{background:C.dark,padding:"80px 24px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:-100,right:-100,width:350,height:350,borderRadius:"50%",background:C.mintGlow,filter:"blur(80px)"}}/>
    <div style={{maxWidth:1200,margin:"0 auto",position:"relative"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{display:"inline-flex",padding:"6px 16px",borderRadius:99,background:"rgba(110,203,181,.12)",color:C.mint,fontSize:12,fontWeight:700,marginBottom:12}}>🚀 Premium Features</div>
        <h2 style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>Built for Every Industry</h2>
        <p style={{fontSize:14,color:"rgba(255,255,255,.4)",marginTop:8}}>Features that QR TIGER charges $50+/month for.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {proFeatures.map((f,i)=>(
          <a key={i} href="/auth/register" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:22,textDecoration:"none",transition:"all .25s",display:"block"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.borderColor="rgba(255,255,255,.15)";e.currentTarget.style.transform="translateY(-3px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:26}}>{f.icon}</span><span style={{fontSize:8.5,fontWeight:800,padding:"3px 9px",borderRadius:99,background:f.tagC,color:"#fff",letterSpacing:".04em"}}>{f.tag}</span></div>
            <h3 style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:5}}>{f.title}</h3>
            <p style={{fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.6,marginBottom:10}}>{f.desc}</p>
            <ul style={{fontSize:10.5,color:"rgba(255,255,255,.3)",lineHeight:2,paddingLeft:14,margin:0}}>{f.pts.map((b,j)=><li key={j}>{b}</li>)}</ul>
            <div style={{marginTop:12,fontSize:11.5,fontWeight:700,color:C.mint}}>Start Free Trial →</div>
          </a>
        ))}
      </div>
    </div>
  </section>

  {/* ═══ PRICING ═══ */}
  <section style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px"}}>
    <div style={{textAlign:"center",marginBottom:48}}>
      <h2 style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:900,letterSpacing:"-.03em",color:C.dark}}>Simple Pricing</h2>
      <p style={{fontSize:14,color:C.mid,marginTop:6}}>Start free. 14-day trial on paid plans. Pay with Razorpay (UPI/Cards/Wallets).</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
      {plans.map((p,i)=>(
        <div key={i} style={{background:p.hl?C.dark:C.card,border:p.hl?`2px solid ${C.mintD}`:`1px solid ${C.border}`,borderRadius:18,padding:"26px 20px",position:"relative",transition:"all .2s"}}>
          {p.hl&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${C.mint},${C.mintD})`,color:"#fff",fontSize:10,fontWeight:800,padding:"4px 14px",borderRadius:99}}>MOST POPULAR</div>}
          <div style={{fontSize:13.5,fontWeight:800,color:p.hl?"#fff":C.dark,marginBottom:4}}>{p.name}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:4}}><span style={{fontSize:30,fontWeight:900,color:p.hl?"#fff":C.dark,letterSpacing:"-.03em"}}>{p.price}</span><span style={{fontSize:12.5,color:p.hl?"rgba(255,255,255,.4)":C.dim}}>{p.per}</span></div>
          <p style={{fontSize:11.5,color:p.hl?"rgba(255,255,255,.4)":C.dim,marginBottom:18}}>{p.desc}</p>
          <a href={p.link} style={{display:"block",textAlign:"center",padding:"12px 18px",borderRadius:10,background:p.hl?`linear-gradient(135deg,${C.mint},${C.mintD})`:"transparent",border:p.hl?"none":`1.5px solid ${C.border}`,color:p.hl?"#fff":C.dark,fontSize:12.5,fontWeight:800,textDecoration:"none",marginBottom:18,boxShadow:p.hl?`0 4px 16px ${C.mintGlow}`:"none"}}>{p.cta}</a>
          <ul style={{fontSize:11.5,color:p.hl?"rgba(255,255,255,.55)":C.mid,lineHeight:2.2,paddingLeft:0,margin:0,listStyle:"none"}}>{p.f.map((f,j)=><li key={j} style={{paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0,color:p.hl?C.mint:C.mintD}}>✓</span>{f}</li>)}</ul>
        </div>
      ))}
    </div>
    <div style={{textAlign:"center",marginTop:20}}><p style={{fontSize:12,color:C.dim}}>💳 Payments powered by <b>Razorpay</b> · UPI · Cards · Wallets · Net Banking · EMI available</p></div>
  </section>

  {/* ═══ FOOTER ═══ */}
  <footer style={{background:C.dark,padding:"36px 24px 20px"}}>
    <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
      <div><div style={{fontSize:14,fontWeight:800,color:"#fff"}}>RedSprout<span style={{color:C.mintD}}> QR</span></div><div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:3}}>by RedSprout Digital · Built in India 🇮🇳</div></div>
      <div style={{display:"flex",gap:20}}>{["Privacy","Terms","Contact"].map(l=><a key={l} href={`https://redsproutdigital.com/${l.toLowerCase()}`} style={{fontSize:11.5,color:"rgba(255,255,255,.3)",textDecoration:"none"}}>{l}</a>)}</div>
    </div>
    <div style={{maxWidth:1200,margin:"14px auto 0",paddingTop:14,borderTop:"1px solid rgba(255,255,255,.06)",fontSize:10,color:"rgba(255,255,255,.15)",textAlign:"center"}}>© {new Date().getFullYear()} RedSprout Digital. All rights reserved.</div>
  </footer>

  <style>{`
    *{box-sizing:border-box;margin:0;padding:0}
    ::selection{background:rgba(110,203,181,.15)}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-thumb{background:#ddd;border-radius:99px}
    input:focus,textarea:focus{border-color:${C.mintD}!important;box-shadow:0 0 0 3px ${C.mintG};background:#fff!important}
    @media(max-width:900px){.genG{grid-template-columns:1fr!important}.dNav{display:none!important}.mBtn{display:block!important}}
    @media(min-width:901px){.mDrop{display:none!important}}
  `}</style>
  </div>);
}
