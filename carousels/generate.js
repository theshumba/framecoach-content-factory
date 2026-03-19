#!/usr/bin/env node
const fs = require('fs');
const OUT = '/Users/theshumba/Desktop/framecoach-carousels';
fs.mkdirSync(OUT, { recursive: true });

// ═══════════════════════════════════════════════
// COLOR SYSTEM
// ═══════════════════════════════════════════════
function cl(bg) {
  const L = bg==='light', D = bg==='dark';
  return {
    tag: L?'#E32326':D?'#EC595C':'rgba(255,255,255,0.6)',
    body: L?'#8A8580':D?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.65)',
    h: L?'#141414':'#fff',
    icon: L?'#E32326':D?'#EC595C':'rgba(255,255,255,0.9)',
    border: L?'#EBEBEB':'rgba(255,255,255,0.08)',
    label: L?'#141414':'#fff',
    accent: L?'#E32326':'#EC595C',
    tipBg: L?'#fff':D?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.15)',
    tipBdr: L?'#EBEBEB':D?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.08)',
    bigNum: L?'rgba(0,0,0,0.06)':D?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.12)',
    quoteBg: L?'rgba(0,0,0,0.03)':D?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.15)',
    quoteBdr: L?'#e0e0e0':'rgba(255,255,255,0.08)',
    statBg: L?'#fff':'rgba(255,255,255,0.06)',
    statBdr: L?'#EBEBEB':'rgba(255,255,255,0.06)',
    logoName: L?'#141414':'#fff',
  };
}

function pBar(i, total, bg) {
  const L = bg==='light';
  const t = L?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.12)';
  const f = L?'#E32326':'#fff';
  const lb = L?'rgba(0,0,0,0.3)':'rgba(255,255,255,0.4)';
  const w = ((i+1)/total*100).toFixed(1);
  return `<div style="position:absolute;bottom:0;left:0;right:0;padding:16px 28px 20px;z-index:10;display:flex;align-items:center;gap:10px"><div style="flex:1;height:3px;background:${t};border-radius:2px;overflow:hidden"><div style="height:100%;width:${w}%;background:${f};border-radius:2px"></div></div><span style="font-family:'Poppins',sans-serif;font-size:11px;color:${lb};font-weight:500">${i+1}/${total}</span></div>`;
}

function sArrow(bg) {
  const L = bg==='light';
  const b = L?'rgba(0,0,0,0.06)':'rgba(255,255,255,0.08)';
  const s = L?'rgba(0,0,0,0.25)':'rgba(255,255,255,0.35)';
  return `<div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,${b})"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="${s}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
}

// ═══════════════════════════════════════════════
// COMPONENT RENDERERS
// ═══════════════════════════════════════════════
function corners(bg) {
  const c = bg==='light'?'rgba(227,35,38,0.12)':'rgba(255,255,255,0.06)';
  return `<div style="position:absolute;top:20px;left:20px;width:28px;height:28px;border-top:3px solid ${c};border-left:3px solid ${c}"></div><div style="position:absolute;top:20px;right:68px;width:28px;height:28px;border-top:3px solid ${c};border-right:3px solid ${c}"></div><div style="position:absolute;bottom:50px;left:20px;width:28px;height:28px;border-bottom:3px solid ${c};border-left:3px solid ${c}"></div><div style="position:absolute;bottom:50px;right:68px;width:28px;height:28px;border-bottom:3px solid ${c};border-right:3px solid ${c}"></div>`;
}

function watermark() {
  return `<div style="position:absolute;font-family:'Bebas Neue',sans-serif;font-size:200px;color:rgba(255,255,255,0.04);z-index:1;pointer-events:none;bottom:40px;left:-20px;line-height:1">FC</div>`;
}

function logoLockup(bg) {
  const k = cl(bg);
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px"><div style="width:40px;height:40px;border-radius:10px;background:#E32326;display:flex;align-items:center;justify-content:center"><span style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#fff;letter-spacing:0.5px">FC</span></div><span style="font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;letter-spacing:0.5px;color:${k.logoName}">FrameCoach</span></div>`;
}

function tag(text, bg) {
  return `<span style="display:inline-block;font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${cl(bg).tag};margin-bottom:16px">${text}</span>`;
}

function heading(text, bg, size) {
  size = size || 34;
  return `<h2 style="font-family:'Bebas Neue',sans-serif;font-size:${size}px;letter-spacing:-0.3px;line-height:1.1;color:${cl(bg).h};margin-bottom:14px">${text}</h2>`;
}

function subheading(text, bg) {
  return `<h3 style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:-0.3px;line-height:1.1;color:${cl(bg).h};margin-bottom:12px">${text}</h3>`;
}

function body(text, bg) {
  return `<p style="font-family:'Poppins',sans-serif;font-size:14px;line-height:1.55;color:${cl(bg).body}">${text}</p>`;
}

// ── Renderers ──
function rHero(s, bg) {
  return corners(bg) + logoLockup(bg) + tag(s.tag, bg) + heading(s.h, bg) + body(s.p, bg);
}

function rPoint(s, bg) {
  const k = cl(bg);
  let h = `<div style="font-family:'Bebas Neue',sans-serif;font-size:120px;line-height:0.85;letter-spacing:-3px;color:${k.bigNum};margin-bottom:12px">${s.num}</div>`;
  h += tag(s.tag, bg) + subheading(s.h, bg) + body(s.p, bg);
  if (s.tip) h += `<div style="padding:14px 16px;border-radius:10px;margin-top:14px;background:${k.tipBg};border:1px solid ${k.tipBdr}"><div style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${k.accent};margin-bottom:6px">Pro Tip</div><p style="font-family:'Poppins',sans-serif;font-size:12px;color:${k.body};line-height:1.45">${s.tip}</p></div>`;
  return h;
}

function rFeatures(s, bg) {
  const k = cl(bg);
  const rows = s.items.map(([icon,label,desc]) => `<div style="display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid ${k.border}"><span style="color:${k.icon};font-size:18px;min-width:22px;text-align:center;line-height:1.4">${icon}</span><div><span style="font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;color:${k.label};display:block">${label}</span><span style="font-family:'Poppins',sans-serif;font-size:12px;color:${k.body};display:block;margin-top:2px">${desc}</span></div></div>`).join('');
  return tag(s.tag, bg) + subheading(s.h, bg) + `<div style="margin-top:8px">${rows}</div>`;
}

function rSteps(s, bg) {
  const k = cl(bg);
  const rows = s.items.map(([label,desc], i) => `<div style="display:flex;align-items:flex-start;gap:16px;padding:14px 0;border-bottom:1px solid ${k.border}"><span style="font-family:'Bebas Neue',sans-serif;font-size:28px;font-weight:300;color:${k.accent};min-width:34px;line-height:1">${String(i+1).padStart(2,'0')}</span><div><span style="font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;color:${k.label};display:block">${label}</span><span style="font-family:'Poppins',sans-serif;font-size:12px;color:${k.body};display:block;margin-top:2px">${desc}</span></div></div>`).join('');
  return tag(s.tag, bg) + subheading(s.h, bg) + `<div style="margin-top:8px">${rows}</div>`;
}

function rStats(s, bg) {
  const k = cl(bg);
  const boxes = s.items.map(([num,label]) => `<div style="background:${k.statBg};border-radius:12px;padding:16px;border:1px solid ${k.statBdr}"><div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:${k.accent};line-height:1">${num}</div><div style="font-family:'Poppins',sans-serif;font-size:11px;color:${k.body};margin-top:4px">${label}</div></div>`).join('');
  return tag(s.tag, bg) + subheading(s.h, bg) + body(s.p, bg) + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px">${boxes}</div>`;
}

function rPills(s, bg) {
  const k = cl(bg);
  const pills = s.items.map(t => `<span style="font-family:'Poppins',sans-serif;font-size:11px;padding:5px 12px;border:1px solid ${k.border};border-radius:20px;color:#6B6560;text-decoration:line-through;display:inline-block;margin:3px 4px 3px 0">${t}</span>`).join('');
  return tag(s.tag, bg) + subheading(s.h, bg) + `<p style="font-family:'Poppins',sans-serif;font-size:14px;line-height:1.55;color:${k.body};margin-bottom:18px">${s.p}</p><div style="display:flex;flex-wrap:wrap;gap:6px">${pills}</div>`;
}

function rQuote(s, bg) {
  const k = cl(bg);
  let h = tag(s.tag, bg) + subheading(s.h, bg);
  if (s.p) h += body(s.p, bg);
  h += `<div style="padding:16px;background:${k.quoteBg};border-radius:12px;border:1px solid ${k.quoteBdr};margin-top:16px"><p style="font-family:'Poppins',sans-serif;font-size:13px;color:${k.body};margin-bottom:6px">${s.ql}</p><p style="font-family:'Poppins',sans-serif;font-size:15px;color:${k.h};font-style:italic;line-height:1.4">"${s.qt}"</p></div>`;
  return h;
}

function rTip(s, bg) {
  const k = cl(bg);
  return tag(s.tag, bg) + subheading(s.h, bg) + body(s.p, bg) + `<div style="padding:14px 16px;border-radius:10px;margin-top:14px;background:${k.tipBg};border:1px solid ${k.tipBdr}"><div style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${k.accent};margin-bottom:6px">${s.tl}</div><p style="font-family:'Poppins',sans-serif;font-size:12px;color:${k.body};line-height:1.45">${s.tt}</p></div>`;
}

function rBold(s, bg) {
  const k = cl(bg);
  return tag(s.tag, bg) + `<h2 style="font-family:'Bebas Neue',sans-serif;font-size:42px;letter-spacing:-0.5px;line-height:1.05;color:${k.h}">${s.h}</h2>`;
}

function rCompare(s, bg) {
  const k = cl(bg);
  const rows = s.items.map(([before,after]) => `<div style="display:flex;gap:12px;margin-bottom:10px"><div style="flex:1;padding:10px 12px;border-radius:8px;background:rgba(255,0,0,0.06);border:1px solid rgba(227,35,38,0.15)"><span style="font-family:'Poppins',sans-serif;font-size:11px;color:${k.body};text-decoration:line-through">${before}</span></div><div style="flex:1;padding:10px 12px;border-radius:8px;background:rgba(0,200,0,0.04);border:1px solid rgba(0,180,0,0.15)"><span style="font-family:'Poppins',sans-serif;font-size:11px;color:${k.label};font-weight:500">${after}</span></div></div>`).join('');
  return tag(s.tag, bg) + subheading(s.h, bg) + `<div style="margin-top:12px"><div style="display:flex;gap:12px;margin-bottom:8px"><span style="flex:1;font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${k.body}">Before</span><span style="flex:1;font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${k.accent}">After</span></div>${rows}</div>`;
}

function rCheck(s, bg) {
  const k = cl(bg);
  const rows = s.items.map(t => `<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid ${k.border}"><span style="color:${k.accent};font-size:16px;line-height:1.3">&#10003;</span><span style="font-family:'Poppins',sans-serif;font-size:13px;color:${k.label};line-height:1.45">${t}</span></div>`).join('');
  return tag(s.tag, bg) + subheading(s.h, bg) + `<div style="margin-top:8px">${rows}</div>`;
}

function rMythFact(s, bg) {
  const k = cl(bg);
  return tag(s.tag, bg) + subheading(s.h, bg) +
    `<div style="padding:14px 16px;border-radius:10px;margin-top:12px;background:rgba(255,0,0,0.04);border:1px solid rgba(227,35,38,0.15)"><div style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#E32326;margin-bottom:6px">&#10005; Myth</div><p style="font-family:'Poppins',sans-serif;font-size:13px;color:${k.label};line-height:1.45">${s.myth}</p></div>` +
    `<div style="padding:14px 16px;border-radius:10px;margin-top:10px;background:${k.tipBg};border:1px solid ${k.tipBdr}"><div style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${k.accent};margin-bottom:6px">&#10003; Fact</div><p style="font-family:'Poppins',sans-serif;font-size:13px;color:${k.label};line-height:1.45">${s.fact}</p></div>`;
}

function rText(s, bg) {
  let h = tag(s.tag, bg) + subheading(s.h, bg) + body(s.p, bg);
  if (s.extra) h += s.extra;
  return h;
}

function rCta(s) {
  return `<div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:24px"><div style="width:40px;height:40px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center"><span style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#E32326;letter-spacing:0.5px">FC</span></div><span style="font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;letter-spacing:0.5px;color:#fff">FrameCoach</span></div>` +
    `<h2 style="font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:-0.3px;line-height:1.1;color:#fff;margin-bottom:8px">${s.h}</h2>` +
    `<p style="font-family:'Poppins',sans-serif;font-size:13px;color:rgba(255,255,255,0.75);max-width:300px;margin:0 auto 4px;line-height:1.5">${s.p}</p>` +
    `<div style="display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:#f7f7f7;color:#9E1819;font-family:'Poppins',sans-serif;font-weight:600;font-size:14px;border-radius:28px;margin-top:20px">${s.btn}</div>` +
    `<p style="font-family:'Poppins',sans-serif;font-size:11px;color:rgba(255,255,255,0.4);margin-top:16px">${s.foot||'framecoach.io'}</p>`;
}

function rRaw(s) { return s.content; }

function renderContent(s) {
  const bg = s.bg;
  switch(s.type) {
    case 'hero': return rHero(s, bg);
    case 'point': return rPoint(s, bg);
    case 'features': return rFeatures(s, bg);
    case 'steps': return rSteps(s, bg);
    case 'stats': return rStats(s, bg);
    case 'pills': return rPills(s, bg);
    case 'quote': return rQuote(s, bg);
    case 'tip': return rTip(s, bg);
    case 'bold': return rBold(s, bg);
    case 'compare': return rCompare(s, bg);
    case 'check': return rCheck(s, bg);
    case 'mythfact': return rMythFact(s, bg);
    case 'text': return rText(s, bg);
    case 'cta': return rCta(s);
    case 'raw': return rRaw(s);
    default: return '';
  }
}

// ═══════════════════════════════════════════════
// PAGE TEMPLATE
// ═══════════════════════════════════════════════
function generatePage(car) {
  const {file, sub, caption, slides} = car;
  const total = slides.length;

  const slidesHtml = slides.map((s, i) => {
    const bgClass = s.bg==='light'?'slide-light':s.bg==='dark'?'slide-dark':'slide-gradient';
    const content = renderContent(s);
    const isLast = i === total - 1;
    const isCta = s.type === 'cta';
    const isHero = s.type === 'hero';
    const justify = isCta || isHero ? 'center' : 'flex-end';
    const pad = justify==='flex-end' ? '36px 36px 52px' : '36px';
    const centerAll = isCta ? 'text-align:center;align-items:center;' : '';
    const wm = s.bg==='gradient' ? watermark() : '';
    return `<div class="slide ${bgClass}">${wm}<div style="position:relative;z-index:5;flex:1;display:flex;flex-direction:column;justify-content:${justify};padding:${pad};${centerAll}">${content}</div>${pBar(i,total,s.bg)}${isLast?'':sArrow(s.bg)}</div>`;
  }).join('\n');

  const dotsHtml = slides.map((_,i) => `<div class="ig-dot${i===0?' active':''}"></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FrameCoach — ${file}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a1a;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:'Poppins',sans-serif}
:root{--brand:#E32326;--brand-light:#EC595C;--brand-dark:#9E1819;--light-bg:#f7f7f7;--light-border:#EBEBEB;--dark-bg:#141414;--gradient:linear-gradient(165deg,#9E1819 0%,#E32326 50%,#EC595C 100%)}
.ig-frame{width:420px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
.ig-header{display:flex;align-items:center;gap:10px;padding:12px 14px}
.ig-avatar{width:36px;height:36px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center}
.ig-avatar span{font-family:'Bebas Neue',sans-serif;font-size:15px;color:#fff;letter-spacing:0.5px}
.ig-handle{font-size:13px;font-weight:600;color:#262626}
.ig-sub{font-size:11px;color:#8e8e8e}
.carousel-viewport{width:100%;aspect-ratio:4/5;overflow:hidden;position:relative;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.carousel-viewport:active{cursor:grabbing}
.carousel-track{display:flex;height:100%;transition:transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);will-change:transform}
.slide{min-width:100%;height:100%;position:relative;display:flex;flex-direction:column;overflow:hidden}
.slide-light{background:var(--light-bg);color:var(--dark-bg)}
.slide-dark{background:var(--dark-bg);color:#fff}
.slide-gradient{background:var(--gradient);color:#fff}
.ig-dots{display:flex;justify-content:center;gap:5px;padding:10px 0}
.ig-dot{width:6px;height:6px;border-radius:50%;background:#c4c4c4;transition:background 0.3s,transform 0.3s}
.ig-dot.active{background:#0095f6;transform:scale(1.15)}
.ig-actions{display:flex;align-items:center;padding:10px 14px 4px}
.ig-actions svg{width:24px;height:24px;margin-right:14px;cursor:pointer}
.ig-actions .bm{margin-left:auto;margin-right:0}
.ig-caption{padding:4px 14px 14px;font-size:12px;color:#262626;line-height:1.5}
.ig-caption strong{font-weight:600}
.ig-caption .time{display:block;margin-top:6px;font-size:10px;color:#8e8e8e;text-transform:uppercase;letter-spacing:0.5px}
</style>
</head>
<body>
<div class="ig-frame">
<div class="ig-header"><div class="ig-avatar"><span>FC</span></div><div><div class="ig-handle">framecoach.io</div><div class="ig-sub">${sub}</div></div></div>
<div class="carousel-viewport" id="vp"><div class="carousel-track" id="tk">
${slidesHtml}
</div></div>
<div class="ig-dots" id="dots">${dotsHtml}</div>
<div class="ig-actions">
<svg viewBox="0 0 24 24" fill="none" stroke="#262626" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
<svg viewBox="0 0 24 24" fill="none" stroke="#262626" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
<svg viewBox="0 0 24 24" fill="none" stroke="#262626" stroke-width="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
<svg class="bm" viewBox="0 0 24 24" fill="none" stroke="#262626" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
</div>
<div class="ig-caption"><strong>framecoach.io</strong> ${caption}<span class="time">2 hours ago</span></div>
</div>
<script>
const vp=document.getElementById('vp'),tk=document.getElementById('tk'),dots=document.querySelectorAll('.ig-dot');
const T=${total};let cur=0,sx=0,dx=0,drag=false,moved=false;
function go(i){cur=Math.max(0,Math.min(T-1,i));tk.style.transform='translateX(-'+cur*100+'%)';dots.forEach((d,x)=>d.classList.toggle('active',x===cur))}
vp.addEventListener('pointerdown',e=>{drag=true;moved=false;sx=e.clientX;dx=0;tk.style.transition='none';vp.setPointerCapture(e.pointerId);e.preventDefault()});
vp.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;if(Math.abs(dx)>3)moved=true;tk.style.transform='translateX(calc(-'+cur*100+'% + '+dx+'px))'});
vp.addEventListener('pointerup',e=>{if(!drag)return;drag=false;tk.style.transition='transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';if(moved&&Math.abs(dx)>30){go(cur+(dx<0?1:-1))}else if(!moved){const r=vp.getBoundingClientRect();(e.clientX-r.left>r.width/2)?go(cur+1):go(cur-1)}else{go(cur)}});
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════
// SHORTCUT CONSTRUCTORS
// ═══════════════════════════════════════════════
const H = (tag,h,p) => ({bg:'light',type:'hero',tag,h,p});
const P = (bg,num,tag,h,p,tip) => ({bg,type:'point',num,tag,h,p,...(tip?{tip}:{})});
const F = (bg,tag,h,items) => ({bg,type:'features',tag,h,items});
const ST = (bg,tag,h,items) => ({bg,type:'steps',tag,h,items});
const SG = (bg,tag,h,p,items) => ({bg,type:'stats',tag,h,p,items});
const PL = (bg,tag,h,p,items) => ({bg,type:'pills',tag,h,p,items});
const Q = (bg,tag,h,ql,qt,p) => ({bg,type:'quote',tag,h,ql,qt,p});
const TI = (bg,tag,h,p,tl,tt) => ({bg,type:'tip',tag,h,p,tl,tt});
const B = (bg,tag,h) => ({bg,type:'bold',tag,h});
const CP = (bg,tag,h,items) => ({bg,type:'compare',tag,h,items});
const CK = (bg,tag,h,items) => ({bg,type:'check',tag,h,items});
const MF = (bg,tag,h,myth,fact) => ({bg,type:'mythfact',tag,h,myth,fact});
const TX = (bg,tag,h,p,extra) => ({bg,type:'text',tag,h,p,...(extra?{extra}:{})});
const CTA = (h,p,btn,foot) => ({bg:'gradient',type:'cta',h,p,btn,foot:foot||'framecoach.io'});

// ═══════════════════════════════════════════════
// 30 CAROUSEL DATA DEFINITIONS
// ═══════════════════════════════════════════════
const carousels = [

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APP PROMOTION (1-10)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{ file:'01-what-is-framecoach', sub:'Filmmaker Education App',
  caption:'Your filmmaking coach, in your pocket. Learn cinematography, composition & storytelling \u2014 one bite-sized lesson at a time. Link in bio. #filmmaking #cinematography #filmmaker #filmschool #contentcreator',
  slides:[
    H('INTRODUCING','Your Filmmaking Coach, In Your Pocket','Learn cinematography, composition, and storytelling \u2014 one lesson at a time.'),
    PL('dark','THE PROBLEM','Tired of Guessing Your Way Through Film?','Most filmmakers learn the hard way \u2014 wasting time on scattered tutorials and outdated advice.',['Random YouTube','Expensive courses','Trial & error','No feedback','Information overload']),
    Q('gradient','THE SOLUTION','Meet FrameCoach','What creators are saying','Finally \u2014 an app that teaches me film, not just theory.'),
    F('light','FEATURES','Everything You Need To Grow',[['🎬','Bite-Sized Lessons','Learn in 5 minutes a day'],['🎨','Visual Breakdowns','See how iconic scenes are composed'],['🚀','Structured Paths','Beginner to advanced tracks'],['⚡','Practice Challenges','Real-world exercises that stick']]),
    SG('dark','WHY FRAMECOACH','Built Different From Day One','We\'re not another generic film course.',[['100+','Lessons'],['5 min','Per Session'],['Free','To Start'],['24/7','Access']]),
    ST('light','GET STARTED','Start Learning In 3 Steps',[['Download FrameCoach','Free on iOS and Android'],['Pick Your Level','Beginner, intermediate, or advanced'],['Learn & Create','5-minute daily lessons that stick']]),
    CTA('Frame Your Story','The filmmaker\'s app for learning cinematography, composition & storytelling.','Get Started Free'),
]},

{ file:'02-5-reasons-to-try', sub:'App Promotion',
  caption:'5 reasons filmmakers are switching to FrameCoach. Which one resonates? Drop a number below \u2b07\ufe0f #filmmaking #filmmaker #learnfilm',
  slides:[
    H('5 REASONS','5 Reasons Filmmakers Are Switching to FrameCoach','See why creators are choosing a smarter way to learn.'),
    P('dark','01','REASON ONE','Structured Learning Paths','No more random tutorials. Follow a clear path from beginner to advanced cinematography.'),
    P('gradient','02','REASON TWO','Bite-Sized Daily Lessons','Learn in just 5 minutes a day. Perfect for busy creators who still want to grow.'),
    P('light','03','REASON THREE','Real-World Exercises','Apply what you learn with hands-on challenges \u2014 not just theory and lectures.'),
    P('dark','04','REASON FOUR','Made by Filmmakers','Built by people who\'ve actually been on set, not just tech developers.'),
    P('light','05','REASON FIVE','Completely Free to Start','No credit card. No trial period. No catch. Just start learning.'),
    CTA('Ready to Level Up?','Join filmmakers already learning with FrameCoach.','Get Started Free'),
]},

{ file:'03-framecoach-vs-youtube', sub:'App Promotion',
  caption:'FrameCoach vs YouTube tutorials \u2014 structured learning wins every time. Stop scrolling, start growing. Link in bio. #filmmaking #filmmaker #videography',
  slides:[
    H('HEAD TO HEAD','FrameCoach vs YouTube Tutorials','Which one actually makes you a better filmmaker?'),
    CP('dark','STRUCTURE','Random vs Structured',[['Scattered, algorithm-driven content','Curated learning paths by topic'],['No progression \u2014 watch anything','Clear beginner \u2192 advanced tracks'],['Hope you find the right video','Every lesson builds on the last']]),
    CP('light','PRACTICE','Passive vs Active',[['Watch and forget','Watch, practice, retain'],['No exercises or feedback','Hands-on challenges each lesson'],['Endless consumption loop','Measurable skill progression']]),
    CP('dark','TIME','Hours vs Minutes',[['30-min videos, 5 mins of value','5-minute focused lessons'],['Search + watch + search again','Open, learn, done'],['No idea what to watch next','Your next lesson is always ready']]),
    TX('light','THE VERDICT','Structure Beats Quantity','YouTube is great for inspiration. But for actually learning cinematography? You need structure, practice, and progression. That\'s what FrameCoach was built for.'),
    CTA('Try the Structured Way','Learn cinematography the way it should be taught.','Get Started Free'),
]},

{ file:'04-your-first-week', sub:'App Promotion',
  caption:'Here\'s what your first week with FrameCoach looks like. Day 1 to Day 7 \u2014 real progress, real fast. #filmmaking #filmmaker #cinematography',
  slides:[
    H('FIRST 7 DAYS','Your First Week With FrameCoach','Here\'s exactly what happens when you start.'),
    P('dark','01','DAYS 1-2','Explore & Choose Your Path','Pick your skill level and interests. Composition? Lighting? Storytelling? Start with what excites you most.'),
    P('gradient','02','DAYS 3-4','Master Your First Concept','Complete your first lesson module. Visual breakdowns show you exactly how the pros do it.'),
    P('light','03','DAY 5','Complete Your First Challenge','Put theory into practice. Grab your phone or camera and nail your first real exercise.'),
    P('dark','04','DAYS 6-7','See Your Progress','Review what you\'ve learned. Your progress tracker shows real, measurable improvement in just one week.'),
    SG('light','AFTER 7 DAYS','What You\'ll Have Achieved','One week. Five minutes a day. Real results.',[['3+','Concepts Learned'],['2+','Exercises Done'],['35 min','Total Time'],['100%','Progress Tracked']]),
    CTA('Start Your First Week','See what you can learn in just 7 days.','Download Free'),
]},

{ file:'05-free-toolkit', sub:'App Promotion',
  caption:'The free filmmaker toolkit inside FrameCoach \u2014 5 tools you didn\'t know you needed. All free, forever. #filmmaking #filmtools #filmmaker',
  slides:[
    H('FREE TOOLS','The Free Filmmaker Toolkit Inside FrameCoach','5 tools you didn\'t know you needed \u2014 all free, forever.'),
    P('dark','01','TOOL ONE','Shot List Templates','Pre-built shot lists for every genre. Drama, documentary, commercial \u2014 never walk onto set unprepared.'),
    P('gradient','02','TOOL TWO','Composition Guides','Interactive overlays that teach you rule of thirds, golden ratio, and dynamic symmetry as you shoot.'),
    P('light','03','TOOL THREE','Lighting Reference Library','Visual guides for every lighting setup. Rembrandt, butterfly, split \u2014 see exactly where to place your lights.'),
    P('dark','04','TOOL FOUR','Color Palette Generator','Create cinematic color palettes for your projects. Match the mood to the story.'),
    P('light','05','TOOL FIVE','Storyboard Sketcher','Quick storyboard tool to plan your shots before you roll. Simple, fast, effective.'),
    CTA('Get the Free Toolkit','All 5 tools. Zero cost. Download FrameCoach today.','Download Free'),
]},

{ file:'06-stop-learning-the-hard-way', sub:'App Promotion',
  caption:'Stop learning film the hard way. There\'s a better path. #filmmaking #filmmaker #filmschool #videography',
  slides:[
    H('WAKE UP CALL','Stop Learning Film the Hard Way','There\'s a better path than trial, error, and wasted time.'),
    PL('dark','THE OLD WAY','The Way Most People Learn Film','Expensive degrees, random YouTube binges, and hoping something sticks.',['Film school debt','3am YouTube spirals','Outdated textbooks','No practice','No feedback loop']),
    TX('gradient','THE COST','Time You Can\'t Get Back','Every month spent on scattered learning is a month you could\'ve been improving with structure. The average filmmaker wastes 6+ months before finding a real learning path.'),
    F('light','THE NEW WAY','What Structured Learning Looks Like',[['📐','Clear Curriculum','Every lesson connects to the next'],['⏱️','5-Minute Sessions','Short enough to do daily, long enough to matter'],['🎯','Real Exercises','Practice, not just passive watching'],['📈','Track Progress','See exactly how far you\'ve come']]),
    CK('dark','THE DIFFERENCE','What Changes When You Switch',['You stop guessing what to learn next','You actually practice, not just consume','You see measurable improvement weekly','You build real, transferable film skills','You spend minutes not hours per day']),
    CTA('Choose the Better Path','Stop guessing. Start growing.','Try FrameCoach Free'),
]},

{ file:'07-five-minutes-a-day', sub:'App Promotion',
  caption:'Just 5 minutes a day. That\'s all it takes to level up your filmmaking. Seriously. #filmmaking #filmmaker #productivity #contentcreator',
  slides:[
    H('DAILY HABIT','Just 5 Minutes a Day','That\'s all it takes to become a better filmmaker.'),
    TX('dark','THE TRUTH','Nobody Has Time for Film School','Between your job, your life, and your own projects \u2014 who has hours for courses? You don\'t need hours. You need 5 focused minutes.'),
    F('gradient','YOUR ROUTINE','What 5 Minutes Looks Like',[['☕','Morning','One lesson with your coffee'],['🎬','Midday','Quick exercise on your lunch break'],['🌙','Evening','Review what you learned today']]),
    SG('light','AFTER 30 DAYS','The 5-Minute Compound Effect','Tiny daily investments create massive results.',[['30','Lessons Done'],['150 min','Total Time'],['6+','Skills Learned'],['1','Better Filmmaker']]),
    Q('dark','REAL TALK','It Actually Works','A FrameCoach user','I thought 5 minutes was a gimmick. After a month, I genuinely shoot better. My compositions, my lighting \u2014 everything leveled up.'),
    CTA('Start Your 5 Minutes','The best time to start was yesterday. The next best time is now.','Download Free'),
]},

{ file:'08-what-filmmakers-say', sub:'Social Proof',
  caption:'Don\'t take our word for it \u2014 hear what filmmakers are saying about FrameCoach. Real people, real results. #filmmaking #filmmaker #testimonial',
  slides:[
    H('TESTIMONIALS','What Filmmakers Are Saying About FrameCoach','Don\'t take our word for it.'),
    Q('dark','COMPOSITION','Learning That Actually Sticks','Sarah, Documentary Filmmaker','I\'ve watched hundreds of YouTube tutorials. FrameCoach is the first thing that actually changed how I frame my shots.'),
    Q('gradient','LIGHTING','From Amateur to Cinematic','James, Content Creator','The lighting module alone was worth it. I went from flat, boring setups to cinematic looks in two weeks.'),
    Q('light','STORYTELLING','Stories That Connect','Maria, Short Film Director','FrameCoach taught me that storytelling isn\'t about fancy gear \u2014 it\'s about understanding your frame. Game changer.'),
    Q('dark','DAILY PRACTICE','The Habit That Changed Everything','David, Videographer','5 minutes a day sounded too simple. Three months later, clients are asking what changed. Everything.'),
    SG('light','THE NUMBERS','Results Speak Louder','Filmmakers are leveling up every day.',[['4.8/5','Avg Rating'],['93%','Complete Rate'],['10K+','Filmmakers'],['30 days','To See Results']]),
    CTA('Join Them','See what FrameCoach can do for your filmmaking.','Get Started Free'),
]},

{ file:'09-before-and-after', sub:'App Promotion',
  caption:'Before FrameCoach vs After. The difference is in the details. #filmmaking #filmmaker #cinematography #beforeafter',
  slides:[
    H('TRANSFORMATION','Before & After FrameCoach','See how the fundamentals transform your work.'),
    CP('dark','COMPOSITION','How Your Framing Changes',[['Subject dead centre every time','Deliberate placement using rule of thirds'],['Random headroom and lead room','Intentional space that guides the eye'],['Flat, static compositions','Dynamic frames with depth and layers']]),
    CP('gradient','LIGHTING','How Your Lighting Changes',[['One overhead fluorescent','Shaped key light with intention'],['Flat, shadowless faces','Dimensional lighting with mood'],['No separation from background','Rim light creating depth']]),
    CP('light','STORYTELLING','How Your Stories Change',[['Shoot everything, hope it cuts','Plan shots that serve the narrative'],['Random B-roll with no purpose','Every shot advances the story'],['Endings that fizzle out','Satisfying arcs in any length']]),
    CP('dark','COLOR','How Your Grades Change',[['Slap a LUT and call it done','Intentional palette that supports mood'],['Over-saturated everything','Controlled, cinematic color choices'],['Inconsistent scene-to-scene','Cohesive look across your project']]),
    CTA('Start Your Transformation','The fundamentals change everything. Learn them with FrameCoach.','Try Free Today'),
]},

{ file:'10-not-a-film-school', sub:'App Promotion',
  caption:'FrameCoach is NOT a film school. It\'s something better. Let\'s clear up some myths. #filmmaking #filmmaker #filmschool',
  slides:[
    H('MYTH BUSTING','FrameCoach Is Not a Film School','Let\'s clear up what FrameCoach actually is.'),
    MF('dark','MYTH VS FACT','It\'s just another online course','FrameCoach is a daily practice tool, not a passive course. You learn by doing \u2014 5 minutes of active learning beats 2 hours of watching.'),
    MF('gradient','MYTH VS FACT','You need hours to make progress','5 minutes a day is the core design. Consistency beats marathon sessions. Most users see improvement in under 2 weeks.'),
    MF('light','MYTH VS FACT','It\'s only for beginners','Advanced tracks cover colour theory, advanced composition, lighting psychology, and narrative structure. Pros use it too.'),
    MF('dark','MYTH VS FACT','You need expensive gear to benefit','Every lesson works with any camera \u2014 including your phone. Great filmmaking is about knowledge, not equipment.'),
    TX('light','THE TRUTH','What FrameCoach Actually Is','FrameCoach is a structured daily practice tool that builds your filmmaking skills through bite-sized lessons and real-world exercises. It\'s the gym for your creative eye.'),
    CTA('See for Yourself','Try FrameCoach free. No credit card needed.','Get Started Free'),
]},

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BRAND AWARENESS (11-18)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{ file:'11-the-framecoach-manifesto', sub:'Our Beliefs',
  caption:'The FrameCoach Manifesto. This is what we believe. This is why we build. #filmmaking #filmmaker #manifesto #framecoach',
  slides:[
    H('MANIFESTO','The FrameCoach Manifesto','What we believe. Why we build.'),
    B('dark','WE BELIEVE','Filmmaking Is For Everyone \u2014 Not Just Film School Graduates'),
    B('gradient','WE BELIEVE','Learning Should Be Free, Accessible, and Structured'),
    B('light','WE BELIEVE','Practice Beats Theory Every Single Time'),
    B('dark','WE BELIEVE','Every Frame You Shoot Is a Chance to Get Better'),
    B('gradient','WE BELIEVE','The World Needs Your Story \u2014 Told Your Way'),
    CTA('Join the Movement','Frame your story with FrameCoach.','Get Started Free'),
]},

{ file:'12-frame-your-story', sub:'Brand',
  caption:'Every frame is a choice. Every choice tells your story. #filmmaking #cinematography #storytelling #framecoach',
  slides:[
    B('light','FRAME YOUR STORY','Every Shot Is a Choice'),
    B('dark','FRAME YOUR STORY','Every Angle Tells Something'),
    B('gradient','FRAME YOUR STORY','Every Light Paints Emotion'),
    B('light','FRAME YOUR STORY','Every Cut Shapes Time'),
    B('dark','FRAME YOUR STORY','Every Story Deserves to Be Told Well'),
    CTA('Frame Your Story','Learn the craft. Tell stories that matter.','Explore FrameCoach','framecoach.io'),
]},

{ file:'13-built-by-filmmakers', sub:'Our Story',
  caption:'Built by filmmakers, for filmmakers. We\'ve been where you are. That\'s why we built FrameCoach. #filmmaking #filmmaker #startup #framecoach',
  slides:[
    H('OUR STORY','Built by Filmmakers, For Filmmakers','We\'ve been exactly where you are.'),
    TX('dark','THE BEGINNING','We\'ve Been Where You Are','We\'ve sat through the 3am YouTube binges. We\'ve paid for courses that promised the world and delivered PowerPoints. We\'ve learned the hard way so you don\'t have to.'),
    TX('gradient','THE INSIGHT','We Know What Actually Works','After years on set and behind the lens, we learned that filmmaking skill comes from one thing: consistent, structured practice. Not passive consumption.'),
    TX('light','THE BUILD','We Built What We Wished Existed','An app that teaches real filmmaking skills in 5 minutes a day. Structured paths. Visual breakdowns. Hands-on exercises. No fluff.'),
    TX('dark','THE COMMUNITY','A Community of Creators','FrameCoach isn\'t just an app \u2014 it\'s a growing community of filmmakers who believe in learning by doing. From first-timers to festival veterans.'),
    CK('light','JOIN US','What You Get When You Join',['Structured learning paths for every level','New lessons and challenges added regularly','A community that gets it','Built and shaped by real filmmakers','Completely free to start']),
    CTA('Join the Community','Built by filmmakers. Shaped by filmmakers. For filmmakers.','Download Free'),
]},

{ file:'14-what-makes-a-great-filmmaker', sub:'Filmmaker Mindset',
  caption:'5 qualities every great filmmaker shares. Which one are you strongest in? Comment below. #filmmaking #filmmaker #mindset #creativity',
  slides:[
    H('FILMMAKER DNA','What Makes a Great Filmmaker?','It\'s not about the gear. It\'s about these 5 things.'),
    P('dark','01','QUALITY ONE','Vision','Great filmmakers see stories everywhere. A puddle reflecting a skyline. A stranger\'s nervous hands. They train their eyes to notice what others walk past.'),
    P('gradient','02','QUALITY TWO','Patience','The perfect shot rarely comes fast. Great filmmakers wait for the light, wait for the moment, wait for the performance. Patience is a creative superpower.'),
    P('light','03','QUALITY THREE','Curiosity','They never stop asking "what if?" What if I move the camera here? What if the light comes from below? Curiosity drives innovation.'),
    P('dark','04','QUALITY FOUR','Courage','Breaking rules intentionally. Trying new angles. Showing work before it\'s perfect. Courage separates good filmmakers from great ones.'),
    P('light','05','QUALITY FIVE','Discipline','Showing up every day. Shooting even when uninspired. Reviewing your work honestly. The best filmmakers treat their craft like athletes treat training.'),
    CTA('Train Your Craft','Build these qualities with FrameCoach.','Start Training Free'),
]},

{ file:'15-every-frame-tells-a-story', sub:'Cinematic Thinking',
  caption:'Every frame tells a story. Here are the 5 elements that make it happen. Save this for your next shoot. #filmmaking #cinematography #storytelling',
  slides:[
    H('CINEMATIC THINKING','Every Frame Tells a Story','The 5 elements that make every shot count.'),
    P('dark','01','ELEMENT ONE','Composition Shapes Meaning','Where you place your subject in the frame tells the audience how to feel. Centre = power. Off-centre = tension. Low = vulnerability.'),
    P('gradient','02','ELEMENT TWO','Light Creates Mood','Hard light = drama. Soft light = intimacy. Side light = mystery. The way you light a scene is the first thing audiences feel, before a word is spoken.'),
    P('light','03','ELEMENT THREE','Colour Drives Emotion','Warm tones = comfort, nostalgia. Cool tones = isolation, tension. Desaturated = reality, harshness. Your palette is a storytelling tool.'),
    P('dark','04','ELEMENT FOUR','Movement Builds Tension','A slow push-in creates intimacy. A sudden pan creates alarm. Static = calm observation. Every camera movement should serve the story.'),
    P('light','05','ELEMENT FIVE','Sound Completes the World','What we hear shapes what we see. Silence can be louder than an explosion. Sound design is half the experience.'),
    CTA('Master Every Element','Learn to control all 5 with FrameCoach.','Start Learning Free'),
]},

{ file:'16-the-creators-mindset', sub:'Mindset',
  caption:'The creator\'s mindset \u2014 5 principles that separate good from great. Which one do you need to hear today? #creativity #filmmaker #mindset #filmmaking',
  slides:[
    H('MINDSET','The Creator\'s Mindset','5 principles that separate good from great.'),
    P('dark','01','PRINCIPLE ONE','Start Before You\'re Ready','Waiting for the perfect camera, the perfect script, the perfect moment? It doesn\'t exist. Start with what you have. Improve as you go.'),
    P('gradient','02','PRINCIPLE TWO','Embrace Imperfection','Your first 50 films won\'t be masterpieces. That\'s the point. Every imperfect project teaches you something a textbook never could.'),
    P('light','03','PRINCIPLE THREE','Learn From Every Take','The best filmmakers watch their own work with brutal honesty. Not to punish themselves \u2014 but to find the one thing to improve next time.'),
    P('dark','04','PRINCIPLE FOUR','Consistency Over Inspiration','Inspiration is a bonus, not a prerequisite. Show up. Shoot. Learn. Repeat. The habit matters more than the mood.'),
    P('light','05','PRINCIPLE FIVE','Share Your Work','The filmmaker who shares a rough cut learns 10x faster than the one who perfects in private. Put it out there. Get feedback. Grow.'),
    CTA('Build the Mindset','FrameCoach helps you build the daily creative habit.','Start Free Today'),
]},

{ file:'17-why-we-built-framecoach', sub:'Origin Story',
  caption:'Why we built FrameCoach \u2014 the problem we saw and the solution we created. #filmmaking #startup #filmmaker #framecoach',
  slides:[
    H('ORIGIN STORY','Why We Built FrameCoach','Every great tool starts with a frustration.'),
    TX('dark','THE PROBLEM WE SAW','Filmmakers Were Getting Lost','We watched talented creators drown in scattered resources. Random YouTube videos. Expensive courses that led nowhere. Forums full of conflicting advice. Nobody had a clear path.'),
    TX('gradient','THE DECISION WE MADE','Build Something That Actually Works','Not another course. Not another YouTube channel. A structured, daily practice tool that builds real skills \u2014 the way athletes train.'),
    F('light','WHAT WE BUILT','FrameCoach: The Filmmaker\'s Gym',[['📐','Structured Paths','Clear progression from basics to advanced'],['⏱️','5-Minute Lessons','Designed for daily consistency'],['🎯','Real Exercises','Practice, not passive watching'],['🌍','Free Access','Great filmmaking education for everyone']]),
    TX('dark','THE VISION','Every Filmmaker, Everywhere','We believe the next Spielberg might be a teenager with a phone in Lagos. Or a single parent in Manchester. FrameCoach exists so talent is the only requirement.'),
    CTA('Be Part of the Vision','Help us democratise filmmaking education.','Join FrameCoach Free'),
]},

{ file:'18-your-content-deserves-better', sub:'Level Up',
  caption:'Your content deserves better. Here\'s how to close the gap between your ideas and your execution. #filmmaking #contentcreator #videography #levelup',
  slides:[
    H('LEVEL UP','Your Content Deserves Better','The gap between your ideas and your execution? It\'s closeable.'),
    TX('dark','THE GAP','Great Ideas, Average Execution','You know your stories are good. You can see the final product in your head. But when you watch the footage back\u2026 something\'s off. The gap is real. And it\'s fixable.'),
    TX('gradient','THE FIX','Learn the Fundamentals','That "something off" is almost always fundamentals. Composition. Lighting. Story structure. These aren\'t boring basics \u2014 they\'re the foundation of every great piece of content.'),
    F('light','THE FOUNDATIONS','3 Skills That Change Everything',[['📐','Composition','How you frame the shot determines what the audience feels'],['💡','Lighting','The difference between amateur and cinematic is almost always light'],['📖','Storytelling','Structure is what makes people watch to the end']]),
    ST('dark','THE PATH','How to Close the Gap',[['Master Composition','Learn where to place subjects for maximum impact'],['Control Your Light','Understand how light shapes mood and dimension'],['Structure Your Stories','Build narratives that hook and hold attention']]),
    CTA('Close the Gap','Learn the fundamentals that transform your content.','Start With FrameCoach'),
]},

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EDUCATION (19-30)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{ file:'19-5-composition-rules', sub:'Composition Series',
  caption:'5 composition rules every filmmaker needs to know. Save this for your next shoot and tag a filmmaker who needs to see this. #filmmaking #composition #cinematography #filmtips',
  slides:[
    H('COMPOSITION SERIES','5 Composition Rules Every Filmmaker Should Know','Swipe to level up your framing game.'),
    P('dark','01','RULE OF THIRDS','Place Subjects on the Intersections','Divide your frame into a 3\u00d73 grid. Place key elements where the lines cross. It creates natural, balanced compositions that feel cinematic.',
      'Place your subject\'s eyes at the top-third intersection for the most natural, engaging framing.'),
    P('gradient','02','LEADING LINES','Guide the Eye Through the Frame','Roads, fences, shadows, architecture \u2014 use any lines in your environment to pull the viewer\'s attention directly to your subject.',
      'Converging lines create depth. The stronger the convergence, the more dramatic the pull.'),
    P('light','03','FRAME WITHIN A FRAME','Use Natural Frames to Add Depth','Doorways, windows, arches, branches \u2014 these create layers that add dimension and naturally draw focus to your subject.',
      'Layer 2-3 frames for maximum depth. Foreground frame + subject + background = cinematic.'),
    P('dark','04','SYMMETRY & BALANCE','Centre Your Frame for Maximum Impact','Symmetrical compositions command attention. Think Wes Anderson. Centre your subject, balance the elements, and watch the frame come alive.',
      'Break symmetry intentionally with one off-centre element for visual tension.'),
    P('light','05','NEGATIVE SPACE','Let Your Subject Breathe','Empty space creates mood, scale, and isolation. Leave 60-70% of your frame empty and watch the emotional impact multiply.',
      'Negative space works best with minimal colour palettes and clean backgrounds.'),
    CTA('Master Composition','100+ lessons on framing, composition & more.','Learn With FrameCoach','Save this & follow @framecoach.io'),
]},

{ file:'20-one-light-cinematography', sub:'Lighting Series',
  caption:'5 stunning one-light setups that look way more expensive than they are. Save this lighting cheat sheet. #filmmaking #lighting #cinematography #filmlighting',
  slides:[
    H('LIGHTING SERIES','Stunning Shots With Just One Light','5 setups that look cinematic on any budget.'),
    P('dark','01','REMBRANDT','The Classic Portrait Setup','Position your light at 45\u00b0 to the side and slightly above eye level. Look for the triangle of light on the shadowed cheek. Named after the painter who mastered it.',
      'Use a bounce card on the opposite side to soften shadows without adding a second light.'),
    P('gradient','02','BUTTERFLY','The Beauty Light','Place your light directly in front and above your subject. It creates a small shadow under the nose (shaped like a butterfly). Classic Hollywood glamour look.',
      'Lower the light slightly for men to avoid overly glamorous framing.'),
    P('light','03','SPLIT','The Dramatic Half-Light','Position your light at exactly 90\u00b0 to the side. One half of the face is lit, the other in complete shadow. Maximum drama, minimal setup.',
      'Use split lighting for mystery, tension, or duality in your narrative.'),
    P('dark','04','RIM / BACK','The Silhouette Edge','Place your light behind and above your subject. It creates a glowing edge that separates them from the background. Instant cinematic depth.',
      'Combine with a dimly lit practical lamp in front for a moody, layered look.'),
    P('light','05','BOUNCE','The Natural Soft Light','Aim your light at a white wall or ceiling. The bounced light wraps around your subject softly. Closest thing to beautiful natural window light.',
      'The bigger your bounce surface, the softer and more flattering the light.'),
    CTA('Master Lighting','Deep-dive lighting lessons inside FrameCoach.','Start Learning Free'),
]},

{ file:'21-essential-shot-types', sub:'Shot Guide',
  caption:'The essential shot types every filmmaker needs in their arsenal. Bookmark this for your next shoot day. #filmmaking #shotlist #cinematography #filmtips',
  slides:[
    H('SHOT GUIDE','The Shot Types Every Film Needs','Your visual storytelling toolkit.'),
    P('dark','01','WIDE / ESTABLISHING','Set the Scene','Shows the full environment. Tells the audience where they are. Use it at the start of scenes to orient viewers and create context.',
      'Hold wide shots for 3-5 seconds minimum to let the audience absorb the space.'),
    P('gradient','02','MEDIUM','The Conversation Shot','Frames the subject from waist up. The workhorse of filmmaking \u2014 perfect for dialogue, action, and everyday coverage.',
      'Keep the subject\'s eyes in the top third of the frame for natural conversation framing.'),
    P('light','03','CLOSE-UP','Capture Emotion','Fills the frame with the face or a detail. This is where emotion lives. Use it at the peak of dramatic moments.',
      'Slight camera movement in close-ups (even handheld breathing) adds intimacy.'),
    P('dark','04','OVER-THE-SHOULDER','Create Connection','Frames one subject from behind another\'s shoulder. Creates a sense of being in the conversation. Essential for dialogue scenes.',
      'Show 20-30% of the foreground shoulder for proper depth without obstruction.'),
    P('light','05','INSERT / CUTAWAY','The Detail Shot','Close shot of a specific detail \u2014 a hand, a clock, a letter. Adds information, creates transitions, and builds texture in your edit.',
      'Shoot inserts at a different focal length than your main coverage for visual variety.'),
    CTA('Build Your Shot Vocabulary','Learn when and why to use every shot type.','Explore FrameCoach'),
]},

{ file:'22-color-grading-mistakes', sub:'Colour Series',
  caption:'3 colour grading mistakes that are killing your films \u2014 and how to fix each one. Save this before your next grade. #filmmaking #colorgrading #cinematography #filmtips',
  slides:[
    H('COLOUR SERIES','3 Colour Grading Mistakes Killing Your Films','And exactly how to fix each one.'),
    TI('dark','MISTAKE 1','Over-Saturation','You think you\'re making it "pop" but you\'re actually making it look like a travel vlog from 2015. Skin tones turn orange, skies go neon, and everything screams amateur.','The Fix','Pull saturation back 15-20% from where you think it looks good. Add vibrance instead \u2014 it boosts muted tones without blowing out skin.'),
    TI('gradient','MISTAKE 2','Crushed Blacks','Slamming the shadows to zero feels cinematic until you realise you\'ve lost all shadow detail. Dark scenes become muddy blobs. Faces disappear.','The Fix','Lift your blacks slightly (5-10 on the curve). Use a waveform monitor \u2014 your shadows should sit at 5-10%, never at absolute zero.'),
    TI('light','MISTAKE 3','Inconsistent Grading','Scene 1 is warm and orange. Scene 2 is cold and blue. Cut between them and your audience gets whiplash. Consistency is what separates pros from hobbyists.','The Fix','Create a base grade first. Apply it to all clips. Then make per-shot adjustments. Grade the project, not individual clips.'),
    CK('dark','PREVENTION','The Colour Grading Checklist',['White balance is correct before grading','Exposure is consistent across the scene','Base grade applied to all clips first','Skin tones look natural at all times','Watch on a calibrated monitor, not just your laptop']),
    CTA('Master Colour','In-depth colour grading lessons inside FrameCoach.','Start Learning Free'),
]},

{ file:'23-camera-movements', sub:'Movement Series',
  caption:'Camera movements that tell stories \u2014 5 essential moves and when to use each one. #filmmaking #cameramovement #cinematography #filmtips',
  slides:[
    H('MOVEMENT SERIES','Camera Movements That Tell Stories','Every move should serve the narrative. Here\'s how.'),
    P('dark','01','PAN','Reveal the Scene','Rotate the camera horizontally on its axis. Use it to follow action, reveal new information, or connect two subjects in the same space.',
      'Pan speed matters: slow = discovery, fast = urgency or comedy. Match the pacing to the emotion.'),
    P('gradient','02','TILT','Show Scale','Rotate the camera vertically. Tilt up to reveal height and power. Tilt down to show vulnerability or lead the eye from sky to ground.',
      'Tilt up on a character to show their strength. Tilt down to show what they\'re looking at.'),
    P('light','03','DOLLY','Draw Closer to Emotion','Move the entire camera toward or away from the subject. A dolly-in creates intimacy and focus. A dolly-out creates isolation or reveals context.',
      'The Spielberg face: slow dolly-in to a close-up during a moment of realisation. Iconic.'),
    P('dark','04','TRUCK','Move With the Character','Move the camera laterally alongside the subject. Creates a sense of walking with them, being in their world, sharing their journey.',
      'Trucking shots at the subject\'s walking pace create a natural, immersive rhythm.'),
    P('light','05','ZOOM','Shift Perspective','Change focal length without moving the camera. Different from a dolly \u2014 zoom compresses space. A slow zoom-in creates subtle unease (the "Hitchcock zoom").',
      'Crash zooms (fast, sudden) add energy to action or comedy. Use sparingly for impact.'),
    CTA('Master Movement','Learn when and why to move your camera.','Explore FrameCoach'),
]},

{ file:'24-180-degree-rule', sub:'Filmmaking 101',
  caption:'The 180-degree rule explained \u2014 what it is, why it matters, and when to break it. #filmmaking #filmtips #180degreerule #cinematography',
  slides:[
    H('FILMMAKING 101','The 180-Degree Rule Explained','The invisible line that keeps your scenes coherent.'),
    TX('dark','WHAT IT IS','The Invisible Line','Imagine a line drawn between two characters in a scene. The 180-degree rule says your camera should stay on ONE side of that line for all shots in the scene. This preserves screen direction \u2014 Character A always looks right, Character B always looks left.'),
    TX('gradient','WHY IT MATTERS','Spatial Continuity','When you break this rule accidentally, the audience gets confused. Characters suddenly seem to switch sides. Left becomes right. The conversation feels wrong, even if the viewer can\'t explain why.'),
    F('light','HOW TO USE IT','Setting Up Your Line',[['👥','Draw the Line','Imagine or mark the line between your subjects'],['📷','Choose Your Side','All camera positions stay on one side'],['🔄','Coverage','Wide, medium, close-up \u2014 all from the same side'],['✅','Check','Characters maintain consistent screen direction']]),
    TI('dark','ADVANCED','When to Break It Intentionally','Some of the greatest films break the 180-degree rule on purpose. Kubrick and Fincher do it to create disorientation, unease, or a shift in power dynamics.','The Key','If you break it, break it decisively. A subtle break looks like a mistake. A bold break looks intentional.'),
    CTA('Learn the Rules (Then Break Them)','Master filmmaking fundamentals with FrameCoach.','Start Free'),
]},

{ file:'25-cinematic-b-roll', sub:'B-Roll Tips',
  caption:'How to shoot cinematic B-roll that elevates your entire project. 5 tips you can use on your next shoot. Save this. #filmmaking #broll #cinematography #videography',
  slides:[
    H('B-ROLL TIPS','How to Shoot Cinematic B-Roll','5 tips that turn filler footage into visual storytelling.'),
    P('dark','01','TIP ONE','Shoot Movement','Static B-roll is boring B-roll. Look for subjects in motion \u2014 hands working, traffic flowing, leaves falling. If nothing\'s moving, move your camera.',
      'Slider movements at 50% speed add production value with zero cost.'),
    P('gradient','02','TIP TWO','Use Depth of Field','Shallow depth of field (low f-stop) separates your subject from the background. It\'s the single fastest way to make B-roll look cinematic.',
      'Even a 50mm f/1.8 lens (under \u00a3100) gives you beautiful background blur.'),
    P('light','03','TIP THREE','Chase Golden Hour','The hour after sunrise and before sunset gives you soft, warm, directional light for free. No lighting kit needed. Just timing.',
      'Blue hour (just after sunset) gives you moody, cool tones \u2014 perfect for atmospheric B-roll.'),
    P('dark','04','TIP FOUR','Get Detail Shots','Wide shots set the scene, but details tell the story. Hands, textures, close-ups of objects \u2014 these are the shots that make your edit rich.',
      'Shoot 3-5x more detail shots than you think you need. You\'ll thank yourself in the edit.'),
    P('light','05','TIP FIVE','Vary Your Angles','Don\'t shoot everything from eye level. Get low. Get high. Shoot through foreground elements. Unusual angles make ordinary subjects extraordinary.',
      'The most cinematic angle is usually NOT your first instinct. Try at least 3 angles per subject.'),
    CTA('Level Up Your B-Roll','Deep-dive B-roll lessons inside FrameCoach.','Explore FrameCoach','Save this & follow @framecoach.io'),
]},

{ file:'26-focal-lengths-explained', sub:'Lens Guide',
  caption:'Understanding focal lengths \u2014 a filmmaker\'s guide to choosing the right lens. Save this cheat sheet. #filmmaking #lenses #cinematography #filmtips',
  slides:[
    H('LENS GUIDE','Understanding Focal Lengths','Your lens isn\'t just a tool \u2014 it\'s a storytelling choice.'),
    P('dark','01','WIDE (16-35mm)','Expansive & Immersive','Wide lenses capture more of the scene. They exaggerate depth and perspective. Close objects look bigger, distant ones smaller. Great for establishing shots and action.',
      'Wide lenses close to faces create distortion \u2014 use intentionally for unease or comedy.'),
    P('gradient','02','NORMAL (35-50mm)','The Human Eye','This range closest matches human perception. Nothing feels exaggerated or compressed. Perfect for documentary, dialogue, and natural storytelling.',
      '50mm is called the "nifty fifty" because it\'s versatile, cheap, and incredibly sharp.'),
    P('light','03','TELEPHOTO (70-200mm)','Compressed & Intimate','Long lenses flatten depth, making backgrounds feel closer. They isolate subjects beautifully. Essential for portraits, emotional close-ups, and surveillance-style shots.',
      'The longer the lens, the more stabilisation you need. Use a tripod or monopod above 100mm.'),
    F('dark','CHOOSING','How to Pick Your Lens',[['📐','Establishing shots','Use wide (16-24mm) for context'],['💬','Dialogue scenes','Use normal (35-50mm) for natural feel'],['😢','Emotional moments','Use telephoto (85-135mm) for intimacy'],['🏃','Action sequences','Use wide (24-35mm) for energy']]),
    TI('light','PRO TIP','The Lens Swap Trick','If a scene feels flat, change your focal length before changing anything else. A 50mm medium shot and a 135mm medium shot of the same subject tell completely different stories.','Try This','Shoot the same subject at 3 different focal lengths. See how each one changes the mood.'),
    CTA('Master Your Lenses','In-depth lens guides inside FrameCoach.','Start Learning Free'),
]},

{ file:'27-3-point-lighting', sub:'Lighting Setup',
  caption:'The 3-point lighting setup \u2014 the foundation of cinematic lighting. Master this and you can light anything. #filmmaking #lighting #cinematography #3pointlighting',
  slides:[
    H('LIGHTING SETUP','The 3-Point Lighting Guide','The foundation of cinematic lighting.'),
    TI('dark','KEY LIGHT','Your Main Light Source','The key light is the primary, brightest light in your setup. It defines the overall look and mood. Position it 30-45\u00b0 to one side of your subject, slightly above eye level.','Rule of Thumb','The angle and softness of your key light sets the entire mood. Hard = dramatic. Soft = flattering.'),
    TI('gradient','FILL LIGHT','Soften the Shadows','The fill light sits opposite the key light. Its job is to reduce (not eliminate) the shadows created by the key. Keep it softer and dimmer than the key \u2014 usually 50% intensity.','No Fill Light?','Use a white bounce board or foam core as a zero-cost fill. Reflects key light naturally.'),
    TI('light','BACK LIGHT','Separate From Background','Also called the "hair light" or "rim light." Position it behind and above your subject, aimed at their head/shoulders. It creates a bright edge that separates them from the background.','Key Tip','The back light should be invisible to the lens. If you see the source, raise or reposition it.'),
    F('dark','ALL TOGETHER','The Complete Setup',[['💡','Key Light','30-45\u00b0 side, slightly above \u2014 defines the look'],['🔆','Fill Light','Opposite side, 50% intensity \u2014 softens shadows'],['✨','Back Light','Behind and above \u2014 separates from background'],['⚖️','Ratio','Start with 2:1 key-to-fill ratio, adjust to taste']]),
    CK('light','PRO TIPS','Advanced 3-Point Tricks',['Gel your back light with a subtle colour for mood','Use negative fill (black card) instead of fill light for moodier looks','Raise your key light higher for more dramatic shadow angles','Move all three lights further away for softer, more cinematic fall-off','Master 3-point first, then learn to break the rules intentionally']),
    CTA('Master Lighting','Full lighting curriculum inside FrameCoach.','Start Free Today'),
]},

{ file:'28-audio-tips', sub:'Audio Series',
  caption:'5 audio tips that will save your film. Bad audio kills good video. Don\'t let it happen to you. #filmmaking #audio #filmtips #sounddesign',
  slides:[
    H('AUDIO SERIES','5 Audio Tips That Will Save Your Film','Bad audio kills good video. Every. Single. Time.'),
    P('dark','01','TIP ONE','Get Your Mic Close','The number one audio mistake is distance. A mic that\'s 3 metres away sounds 10x worse than one 30cm away. Use a boom, a lav, or get creative \u2014 just get close.',
      'A cheap lav mic at 20cm will outperform an expensive shotgun mic at 3m. Proximity wins.'),
    P('gradient','02','TIP TWO','Always Monitor With Headphones','If you\'re not listening, you\'re not hearing problems. Wind, hum, rustle, traffic \u2014 you can\'t fix what you didn\'t catch. Wear headphones. Always.',
      'Use closed-back headphones on set. Open-back lets ambient sound leak in and deceive you.'),
    P('light','03','TIP THREE','Record 30 Seconds of Room Tone','Before you wrap any location, record 30 seconds of silence. This "room tone" is essential for clean edits \u2014 it fills gaps and smooths transitions in post.',
      'Shout "Room tone, everyone freeze!" before recording. Movement ruins the take.'),
    P('dark','04','TIP FOUR','Protect Against Wind','Wind noise is the most common location audio killer. Use a deadcat (furry wind cover) on your mic outdoors. No deadcat? A thick sock works in a pinch.',
      'Position yourself to shield the mic from wind direction. Your body is a free windscreen.'),
    P('light','05','TIP FIVE','Always Record a Backup','Dual-system audio. Record to your camera AND a separate device. If one fails, you have the other. Professional sets always have audio redundancy.',
      'Phone + lav mic app = emergency backup recorder that\'s always in your pocket.'),
    CTA('Level Up Your Audio','Audio fundamentals inside FrameCoach.','Start Learning Free'),
]},

{ file:'29-directing-non-actors', sub:'Directing Tips',
  caption:'How to direct non-actors and get authentic, believable performances. 5 techniques from working directors. #filmmaking #directing #filmtips #actingcoach',
  slides:[
    H('DIRECTING TIPS','How to Direct Non-Actors','5 techniques for authentic, believable performances.'),
    P('dark','01','TECHNIQUE ONE','Give Actions, Not Emotions','Never say "be sad." Say "walk to the window and look at the street." Actions are achievable. Emotions are abstract. Let the feeling emerge from the doing.',
      'If they nail the action but not the emotion, adjust the action \u2014 never name the emotion.'),
    P('gradient','02','TECHNIQUE TWO','Use Their Real Stories','Ask them about their actual experiences. A real memory of loss will always outperform performed sadness. Authenticity beats acting every time.',
      'Ask "Tell me about a time when\u2026" right before you roll. The transition from memory to scene is gold.'),
    P('light','03','TECHNIQUE THREE','Keep the Camera Rolling','Non-actors relax after "cut." But the best moments often come when they think the camera is off \u2014 the laugh, the sigh, the unguarded moment.',
      'Tell them you\'re doing a "tech check" and keep rolling. No pressure = natural behaviour.'),
    P('dark','04','TECHNIQUE FOUR','Create Comfort First','Spend 20 minutes just talking before you shoot anything. Let them hold the camera. Show them the monitor. Demystify the process. Comfort precedes performance.',
      'Introduce them to every crew member by name. Familiarity reduces self-consciousness.'),
    P('light','05','TECHNIQUE FIVE','Fewer Takes, More Energy','Non-actors lose energy fast. Take 3 is usually the best. By take 7, they\'re mechanical and exhausted. Know what you need and get it early.',
      'If take 1 is great, move on. Don\'t chase perfection \u2014 chase authenticity.'),
    CTA('Master Directing','Directing lessons inside FrameCoach.','Explore FrameCoach'),
]},

{ file:'30-story-in-60-seconds', sub:'Short-Form Series',
  caption:'How to tell a complete story in 60 seconds. The 5-part structure that keeps viewers watching to the end. #filmmaking #shortfilm #storytelling #reels',
  slides:[
    H('SHORT-FORM SERIES','Tell a Story in 60 Seconds','The 5-part structure that keeps viewers watching to the end.'),
    P('dark','01','SECOND 0-5','The Hook','You have 3 seconds before they scroll. Open with a question, a conflict, or a striking image. No logos, no intros, no "hey guys." Straight into the story.',
      'Start mid-action. A door slamming. A phone ringing. Drop the audience into the moment.'),
    P('gradient','02','SECOND 5-15','The Context','Now that they\'re hooked, set the world quickly. Who are we watching? Where are they? What\'s the situation? Do it visually \u2014 show, don\'t tell.',
      'One wide shot + one detail shot = instant context. Don\'t over-explain.'),
    P('light','03','SECOND 15-35','The Tension','This is the meat. Build the conflict. What does the character want? What\'s in the way? Every second should escalate. Boredom is death in short-form.',
      'Cut faster as tension builds. Start with 3-sec cuts, end with 1-sec cuts.'),
    P('dark','04','SECOND 35-50','The Turn','The unexpected shift. A revelation. A twist. A decision. This is where your story earns its emotional payoff. Subvert expectations.',
      'The best turns are ones the audience didn\'t see coming but immediately understand.'),
    P('light','05','SECOND 50-60','The Landing','Resolve with impact. A single powerful image. A final line. Silence. Don\'t over-explain the ending. Trust the audience to feel it. Less is more.',
      'End on a face, not a title card. Human emotion is the strongest final frame.'),
    CTA('Master Storytelling','Short-form storytelling lessons inside FrameCoach.','Start Learning Free'),
]},

];

// ═══════════════════════════════════════════════
// GENERATE ALL 30
// ═══════════════════════════════════════════════
carousels.forEach(car => {
  const html = generatePage(car);
  const filePath = `${OUT}/${car.file}.html`;
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✓ ${car.file}.html (${car.slides.length} slides)`);
});
console.log(`\nDone! ${carousels.length} carousels generated in ${OUT}`);
