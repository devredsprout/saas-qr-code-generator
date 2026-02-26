"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#F6F5F1",card:"#FFF",cardAlt:"#FAFAF8",border:"#E9E8E4",borderH:"#A8DFD0",
  mint:"#6ECBB5",mintD:"#3AAE8C",mintDeep:"#2A8E70",mintG:"rgba(110,203,181,.08)",mintGlow:"rgba(110,203,181,.22)",
  dark:"#111110",text:"#1C1C1A",mid:"#555550",dim:"#9A9A90",ghost:"#C4C4BB",
  red:"#E45B5B",blue:"#6366F1",orange:"#F59E0B",pink:"#EC4899",purple:"#7C3AED",
};

const QR_TYPES = [
  {id:"url",label:"URL / Website",icon:"\u{1F517}",free:true,desc:"Any link"},
  {id:"text",label:"Plain Text",icon:"\u{1F4DD}",free:true,desc:"Text message"},
  {id:"wifi",label:"WiFi Access",icon:"\u{1F4F6}",free:true,desc:"WiFi credentials"},
  {id:"email",label:"Email",icon:"\u2709\uFE0F",free:true,desc:"Pre-filled email"},
  {id:"phone",label:"Phone / Call",icon:"\u{1F4DE}",free:true,desc:"Click to call"},
  {id:"vcard",label:"vCard Contact",icon:"\u{1F464}",free:true,desc:"Business card"},
  {id:"whatsapp",label:"WhatsApp",icon:"\u{1F4AC}",free:true,desc:"Direct chat"},
  {id:"upi",label:"UPI Payment",icon:"\u{1F4B3}",free:true,desc:"India UPI pay"},
  {id:"dynamic",label:"Dynamic QR",icon:"\u{1F504}",pro:true,desc:"Edit after print"},
  {id:"restaurant",label:"Restaurant Menu",icon:"\u{1F37D}\uFE0F",pro:true,desc:"Digital menu"},
  {id:"catalogue",label:"Product Catalogue",icon:"\u{1F4E6}",pro:true,desc:"Product showcase"},
  {id:"social",label:"Social Bio",icon:"\u{1F4F1}",pro:true,desc:"All socials link"},
];

const FG=["#000000","#111110","#1a1a2e","#166534","#0f766e","#1e40af","#7c3aed","#be185d","#92400e","#D42B2B"];
const BG=["#ffffff","#f8f8f8","#F6F5F1","#f0fdf4","#e0f5ef","#eff6ff","#faf5ff","#fff1f2"];
const SIZES=[200,300,400,600,800,1000,1500,2000];
const ECC=[{id:"L",d:"7%"},{id:"M",d:"15%"},{id:"Q",d:"25%"},{id:"H",d:"30%"}];

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
  const canvasRef=useRef(null);

  useEffect(()=>{const h=()=>setScrolled(window.scrollY>10);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);

  const sf=(k,v)=>setFields(p=>({...p,[k]:v}));
  const ct=QR_TYPES.find(t=>t.id===type);
  const isPro=ct?.pro||ct?.biz;

  const generateQR=()=>{
    if(isPro)return;
    const data=buildData(type,fields);
    if(!data||data.length<3)return;
    const url=`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${sz}x${sz}&color=${fg.replace("#","")}&bgcolor=${bg.replace("#","")}&format=png&ecc=${ec}`;
    setQrUrl(url);
    setGen(true);
  };

  const downloadQR=()=>{
    if(qrUrl){
      const a=document.createElement("a");a.href=qrUrl;a.download=`qr-${type}-${sz}px.${fmt}`;a.target="_blank";a.click();
    }
  };

  const plans=[
    {name:"Free",price:"\u20B90",per:"forever",desc:"Static QR, no signup",cta:"Use Free Tool \u2191",link:"#generator",hl:false,
     f:["8 static QR types","Custom colors & sizes","PNG + SVG export","Up to 2000px resolution","No watermark","No signup"]},
    {name:"Pro",price:"\u20B9499",per:"/month",desc:"Marketers & small biz",cta:"Start 14-Day Free Trial",link:"/auth/register",hl:true,
     f:["Everything in Free","Dynamic QR (edit after print)","Logo on QR code","Analytics dashboard","UTM campaign tracking","10,000 scans/month"]},
    {name:"Business",price:"\u20B91,499",per:"/month",desc:"Restaurants & brands",cta:"Start 14-Day Free Trial",link:"/auth/register",hl:false,
     f:["Everything in Pro","Unlimited dynamic QR","Smart routing + A/B testing","Restaurant mode","100K scans/month"]},
    {name:"Agency",price:"\u20B94,999",per:"/month",desc:"White-label agencies",cta:"Contact Sales",link:"/auth/register",hl:false,
     f:["Everything in Business","White-label portal","Custom domain","10 client accounts","API access","Unlimited scans"]},
  ];

  return(
  <div style={{fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text,background:C.bg}}>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>

  {/* HEADER */}
  <header style={{position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(255,255,255,.97)":"#fff",borderBottom:`1px solid ${scrolled?C.border:"transparent"}`,backdropFilter:"blur(12px)",transition:"all .3s"}}>
    <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
      <a href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
        <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.mint},${C.mintD})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white"/></svg>
        </div>
        <div><div style={{fontSize:15,fontWeight:800,color:C.dark}}>RedSprout<span style={{color:C.mintD}}> QR</span></div><div style={{fontSize:9,color:C.dim,fontWeight:600}}>DYNAMIC QR PLATFORM</div></div>
      </a>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <a href="/auth/login" style={{fontSize:12.5,fontWeight:600,color:C.mid,textDecoration:"none"}}>Log In</a>
        <a href="/auth/register" style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",borderRadius:99,background:C.dark,color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none"}}>Get Started</a>
      </div>
    </div>
  </header>

  {/* HERO */}
  <section style={{textAlign:"center",padding:"56px 24px 16px",maxWidth:780,margin:"0 auto"}}>
    <div style={{display:"inline-flex",padding:"7px 18px",borderRadius:99,background:C.mintG,marginBottom:14}}><span style={{fontSize:12,fontWeight:700,color:C.mintD}}>Trusted by 120+ brands</span></div>
    <h1 style={{fontSize:"clamp(32px,5vw,54px)",fontWeight:900,letterSpacing:"-.04em",lineHeight:1.05,color:C.dark}}>QR Codes You Can<br/><span style={{color:C.mintD}}>Edit After Printing</span>.</h1>
    <p style={{fontSize:"clamp(15px,2vw,17px)",color:C.mid,marginTop:12,lineHeight:1.6,maxWidth:540,margin:"12px auto 0"}}>Free static QR codes — no signup. Dynamic links, analytics, restaurant menus, and more.</p>
    <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
      <a href="#generator" style={{padding:"14px 28px",borderRadius:12,background:C.dark,color:"#fff",fontSize:15,fontWeight:800,textDecoration:"none"}}>Generate Free QR \u2193</a>
      <a href="/auth/register" style={{padding:"14px 28px",borderRadius:12,border:`1.5px solid ${C.border}`,color:C.dark,fontSize:15,fontWeight:700,textDecoration:"none"}}>Start Free Trial \u2192</a>
    </div>
  </section>

  {/* FREE QR GENERATOR */}
  <section id="generator" style={{maxWidth:1200,margin:"0 auto",padding:"50px 24px"}}>
    <div style={{textAlign:"center",marginBottom:36}}>
      <div style={{display:"inline-flex",padding:"6px 16px",borderRadius:99,background:C.mintG,color:C.mintD,fontSize:11.5,fontWeight:700,marginBottom:10}}>100% FREE \u00B7 NO SIGNUP \u00B7 NO WATERMARK</div>
      <h2 style={{fontSize:"clamp(26px,3.5vw,38px)",fontWeight:900,letterSpacing:"-.03em",color:C.dark}}>Generate QR Codes <span style={{color:C.mintD}}>Instantly</span></h2>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Types */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
          <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>QR Code Type</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:5}}>
            {QR_TYPES.map(t=>(
              <button key={t.id} onClick={()=>{setType(t.id);setGen(false);}} style={{padding:"9px 10px",borderRadius:10,border:`1.5px solid ${type===t.id?C.mintD:C.border}`,background:type===t.id?C.mintG:"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s",position:"relative",fontFamily:"inherit"}}>
                {(t.pro||t.biz)&&<span style={{position:"absolute",top:3,right:3,fontSize:7.5,fontWeight:800,padding:"2px 5px",borderRadius:99,background:C.mintD,color:"#fff"}}>PRO</span>}
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
              <div style={{fontSize:30,marginBottom:6}}>\u{1F512}</div>
              <p style={{fontSize:14,fontWeight:700,color:C.dark,marginBottom:4}}>{ct?.label} requires an account</p>
              <a href="/auth/register" style={{display:"inline-block",padding:"10px 24px",borderRadius:10,background:C.mintD,color:"#fff",fontSize:13,fontWeight:800,textDecoration:"none"}}>Start Free Trial \u2192</a>
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
        {/* Advanced */}
        {!isPro&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
          <div onClick={()=>setAdv(!adv)} style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}}>
            <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:".06em"}}>Customize</label>
            <span style={{fontSize:11,color:C.dim}}>{adv?"\u25BC":"\u25B6"}</span>
          </div>
          {adv&&<div style={{marginTop:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:5}}>QR COLOR</label><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{FG.map(c=><button key={c} onClick={()=>setFg(c)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${fg===c?C.mintD:C.border}`,background:c,cursor:"pointer"}}/>)}</div></div>
              <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:5}}>BACKGROUND</label><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{BG.map(c=><button key={c} onClick={()=>setBg(c)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${bg===c?C.mintD:C.border}`,background:c,cursor:"pointer"}}/>)}</div></div>
            </div>
            <div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><label style={{fontSize:10,fontWeight:700,color:C.dim}}>SIZE</label><span style={{fontSize:11,fontWeight:800}}>{sz}x{sz}px</span></div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{SIZES.map(s=><button key={s} onClick={()=>setSz(s)} style={{...pill,background:sz===s?C.dark:"#fff",color:sz===s?"#fff":C.mid,borderColor:sz===s?C.dark:C.border,fontSize:10,padding:"6px 10px"}}>{s}</button>)}</div></div>
            <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:5}}>ERROR CORRECTION</label><div style={{display:"flex",gap:3}}>{ECC.map(e=><button key={e.id} onClick={()=>setEc(e.id)} style={{...pill,flex:1,background:ec===e.id?C.dark:"#fff",color:ec===e.id?"#fff":C.mid,borderColor:ec===e.id?C.dark:C.border}}><span style={{fontWeight:800}}>{e.id}</span></button>)}</div></div>
          </div>}
        </div>}
        <button onClick={generateQR} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:isPro?C.border:`linear-gradient(135deg,${C.mint},${C.mintD})`,color:isPro?C.dim:"#fff",fontSize:15,fontWeight:800,cursor:isPro?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {isPro?"\u{1F512} Start Free Trial to Unlock":"\u26A1 Generate QR Code \u2014 Free"}
        </button>
      </div>
      {/* Preview */}
      <div style={{position:"sticky",top:80}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:22,textAlign:"center"}}>
          <label style={{fontSize:10.5,fontWeight:800,color:C.dim,textTransform:"uppercase",display:"block",marginBottom:14}}>Preview</label>
          <div style={{padding:18,borderRadius:16,background:bg,border:`1px solid ${C.border}`,display:"inline-block",marginBottom:14}}>
            {gen&&qrUrl?(<img src={qrUrl} alt="QR" style={{width:200,height:200,display:"block"}}/>):(<div style={{width:200,height:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}><div style={{fontSize:36,opacity:.3}}>\u{1F4F8}</div><p style={{fontSize:11,color:C.ghost,maxWidth:150,lineHeight:1.5}}>Enter content & click Generate</p></div>)}
          </div>
          {gen&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
            <button onClick={downloadQR} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:C.dark,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>\u2B07 Download {fmt.toUpperCase()} ({sz}px)</button>
            <div style={{fontSize:9.5,color:C.ghost}}>{sz}x{sz}px \u00B7 EC: {ec} \u00B7 No watermark</div>
          </div>}
          <div style={{marginTop:18,padding:14,borderRadius:12,background:C.mintG,border:`1px solid ${C.borderH}`,textAlign:"left"}}>
            <div style={{fontSize:11.5,fontWeight:800,color:C.mintD,marginBottom:5}}>\u{1F513} Unlock Pro Features</div>
            <ul style={{fontSize:10.5,color:C.mid,lineHeight:1.9,paddingLeft:14,margin:0}}><li><b>Dynamic QR</b> \u2014 edit after printing</li><li><b>Analytics</b> \u2014 track scans</li><li><b>Restaurant</b> menus</li></ul>
            <a href="/auth/register" style={{display:"inline-block",marginTop:8,fontSize:11.5,fontWeight:800,color:"#fff",background:C.mintD,padding:"8px 16px",borderRadius:8,textDecoration:"none"}}>Start Free Trial \u2192</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* PRICING */}
  <section style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px"}}>
    <div style={{textAlign:"center",marginBottom:48}}>
      <h2 style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:900,letterSpacing:"-.03em",color:C.dark}}>Simple Pricing</h2>
      <p style={{fontSize:14,color:C.mid,marginTop:6}}>Start free. 14-day trial on paid plans.</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
      {plans.map((p,i)=>(
        <div key={i} style={{background:p.hl?C.dark:C.card,border:p.hl?`2px solid ${C.mintD}`:`1px solid ${C.border}`,borderRadius:18,padding:"26px 20px",position:"relative"}}>
          {p.hl&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${C.mint},${C.mintD})`,color:"#fff",fontSize:10,fontWeight:800,padding:"4px 14px",borderRadius:99}}>MOST POPULAR</div>}
          <div style={{fontSize:13.5,fontWeight:800,color:p.hl?"#fff":C.dark,marginBottom:4}}>{p.name}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:4}}><span style={{fontSize:30,fontWeight:900,color:p.hl?"#fff":C.dark}}>{p.price}</span><span style={{fontSize:12.5,color:p.hl?"rgba(255,255,255,.4)":C.dim}}>{p.per}</span></div>
          <p style={{fontSize:11.5,color:p.hl?"rgba(255,255,255,.4)":C.dim,marginBottom:18}}>{p.desc}</p>
          <a href={p.link} style={{display:"block",textAlign:"center",padding:"12px 18px",borderRadius:10,background:p.hl?`linear-gradient(135deg,${C.mint},${C.mintD})`:"transparent",border:p.hl?"none":`1.5px solid ${C.border}`,color:p.hl?"#fff":C.dark,fontSize:12.5,fontWeight:800,textDecoration:"none",marginBottom:18}}>{p.cta}</a>
          <ul style={{fontSize:11.5,color:p.hl?"rgba(255,255,255,.55)":C.mid,lineHeight:2.2,paddingLeft:0,margin:0,listStyle:"none"}}>{p.f.map((f,j)=><li key={j} style={{paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0,color:p.hl?C.mint:C.mintD}}>\u2713</span>{f}</li>)}</ul>
        </div>
      ))}
    </div>
  </section>

  {/* FOOTER */}
  <footer style={{background:C.dark,padding:"36px 24px 20px"}}>
    <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
      <div><div style={{fontSize:14,fontWeight:800,color:"#fff"}}>RedSprout<span style={{color:C.mintD}}> QR</span></div><div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:3}}>by RedSprout Digital</div></div>
      <div style={{display:"flex",gap:20}}>{["Privacy","Terms","Contact"].map(l=><a key={l} href="#" style={{fontSize:11.5,color:"rgba(255,255,255,.3)",textDecoration:"none"}}>{l}</a>)}</div>
    </div>
    <div style={{maxWidth:1200,margin:"14px auto 0",paddingTop:14,borderTop:"1px solid rgba(255,255,255,.06)",fontSize:10,color:"rgba(255,255,255,.15)",textAlign:"center"}}>\u00A9 {new Date().getFullYear()} RedSprout Digital. All rights reserved.</div>
  </footer>

  <style>{`
    *{box-sizing:border-box;margin:0;padding:0}
    input:focus,textarea:focus{border-color:${C.mintD}!important;box-shadow:0 0 0 3px ${C.mintG};background:#fff!important}
    @media(max-width:900px){section#generator>div{grid-template-columns:1fr!important}}
  `}</style>
  </div>);
}
