import { DEG } from '../core/helpers.js';
import { norm, add, sub, mul, mkLayout, strW } from './core.js';

/* draw a triangle from math-coord vertices {A:[x,y],...} (y up) */
function svgTri(P,opts){
  opts=opts||{};
  const W=opts.w||320,H=opts.h||215,pad=opts.pad||56;
  const keys=Object.keys(P);
  const xs=keys.map(k=>P[k][0]),ys=keys.map(k=>P[k][1]);
  const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  const bw=Math.max(maxx-minx,1e-6),bh=Math.max(maxy-miny,1e-6);
  const sc=Math.min((W-2*pad)/bw,(H-2*pad)/bh);
  const offx=(W-bw*sc)/2,offy=(H-bh*sc)/2;
  const T={};
  keys.forEach(k=>{T[k]=[offx+(P[k][0]-minx)*sc, H-(offy+(P[k][1]-miny)*sc)];});
  const cen=[ (T[keys[0]][0]+T[keys[1]][0]+T[keys[2]][0])/3,
              (T[keys[0]][1]+T[keys[1]][1]+T[keys[2]][1])/3 ];
  const LY=mkLayout();
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`;
  s+=`<polygon points="${keys.map(k=>T[k].join(',')).join(' ')}" fill="rgba(23,51,204,0.09)" stroke="#1E1710" stroke-width="2" stroke-linejoin="round"/>`;

  // ── sides ──────────────────────────────────────────────────────────────────
  (opts.sides||[]).forEach(sd=>{
    if(!sd.text) return;
    const a=T[sd.a],b=T[sd.b];
    const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    const d=norm(sub(m,cen));
    const baseOff=16, extraOff=Math.max(0,(strW(sd.text,14)/2)-22);
    const off=baseOff+extraOff;
    s+=LY.place(m[0],m[1],sd.text,{fs:14,fw:700,fill:'#1733CC'},d[0]*off,d[1]*off);
  });

  // ── angle marks ────────────────────────────────────────────────────────────
  (opts.angles||[]).forEach(an=>{
    const V=T[an.at];const others=keys.filter(k=>k!==an.at);
    const d1=norm(sub(T[others[0]],V)),d2=norm(sub(T[others[1]],V));
    if(an.right){
      const r=13;const p1=add(V,mul(d1,r)),p2=add(V,mul(d2,r)),corner=add(V,mul(norm(add(d1,d2)),r*1.41));
      s+=`<path d="M ${p1[0]} ${p1[1]} L ${corner[0]} ${corner[1]} L ${p2[0]} ${p2[1]}" fill="none" stroke="#1E1710" stroke-width="1.6"/>`;
      // reserve the square mark area so labels avoid it
      LY.reserve(corner[0],corner[1],20,20);
    } else {
      const r=17;const a1=add(V,mul(d1,r)),a2=add(V,mul(d2,r));
      const cross=d1[0]*d2[1]-d1[1]*d2[0];const sweep=cross>0?1:0;
      s+=`<path d="M ${a1[0]} ${a1[1]} A ${r} ${r} 0 0 ${sweep} ${a2[0]} ${a2[1]}" fill="none" stroke="#A2906F" stroke-width="1.4"/>`;
    }
    if(an.text){
      const bis=norm(add(d1,d2));
      const cosA=Math.max(-1,Math.min(1,(d1[0]*d2[0]+d1[1]*d2[1])));
      const halfAngleDeg=Math.acos(cosA)/DEG/2;
      const baseR = an.right ? 26 : 30;
      const adaptive = halfAngleDeg < 20 ? baseR+14 : halfAngleDeg < 35 ? baseR+6 : baseR;
      const lp=add(V,mul(bis,adaptive));
      s+=LY.place(lp[0],lp[1],an.text,{fs:12.5,fw:600,fill:'#241C12'},bis[0]*adaptive,bis[1]*adaptive);
    }
  });

  // ── vertices ───────────────────────────────────────────────────────────────
  (opts.verts||[]).forEach(v=>{
    const V=T[v.at];const d=norm(sub(V,cen));const p=add(V,mul(d,17));
    s+=`<circle cx="${V[0]}" cy="${V[1]}" r="2.6" fill="#1E1710"/>`;
    LY.reserve(V[0],V[1],8,8);
    s+=LY.place(p[0],p[1],v.text,{fs:13,fw:700,fill:'#241C12'},d[0]*17,d[1]*17);
  });
  s+=`</svg>`;return s;
}

export { svgTri };
