import { DEG, r1 } from '../core/helpers.js';
import { norm, add, sub, mul, mkLayout } from './core.js';

/* ---- SSA ambiguous-case construction ----
   Draws angle A at vertex A, fixed side c up to apex C, the altitude
   h = c·sin A dropped to the base, the swing arc of radius a centred at C,
   and the resulting triangle(s) where that arc meets the base ray.
   Returns {svg, count, h}. Handles acute, right and obtuse A correctly. */
function ssaGeom(A,c,a){
  const Ar=A*DEG;
  const Ap=[0,0];
  const C=[c*Math.cos(Ar), c*Math.sin(Ar)];   // apex (y up)
  const h=c*Math.sin(Ar);                      // altitude length
  const F=[C[0],0];                            // foot of altitude on base
  let bs=[];
  if(a>=h-1e-9){
    const dx=Math.sqrt(Math.max(a*a-h*h,0));
    [C[0]-dx, C[0]+dx].forEach(x=>{ if(x>1e-6) bs.push([x,0]); });
    if(bs.length===2 && Math.abs(bs[0][0]-bs[1][0])<1e-6) bs=[[bs[0][0],0]]; // tangent
  }
  return {Ap,C,F,h,bs,count:bs.length};
}
function svgSSA(A,c,a,opt){
  opt=opt||{};
  const W=opt.w||340,H=opt.h||232,pad=opt.pad||46;
  const g=ssaGeom(A,c,a), {Ap,C,F,bs}=g;
  const pts=[Ap,C,F,[C[0]-a,0],[C[0]+a,0],[C[0],C[1]-a]];
  bs.forEach(b=>pts.push(b));
  const baseEnd=[Math.max(...pts.map(p=>p[0]), c*1.05, ...bs.map(b=>b[0]+a*0.12)),0];
  pts.push(baseEnd);
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const minx=Math.min(...xs),maxX=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  const bw=Math.max(maxX-minx,1e-6),bh=Math.max(maxy-miny,1e-6);
  const sc=Math.min((W-2*pad)/bw,(H-2*pad)/bh);
  const offx=(W-bw*sc)/2,offy=(H-bh*sc)/2;
  const M=p=>[offx+(p[0]-minx)*sc, H-(offy+(p[1]-miny)*sc)];
  const aPix=a*sc;
  const cc=M(C);
  const LY=mkLayout();
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`;

  // base ray
  const A0=M(Ap),BE=M(baseEnd);
  s+=`<line x1="${A0[0]}" y1="${A0[1]}" x2="${BE[0]}" y2="${BE[1]}" stroke="#1E1710" stroke-width="2"/>`;

  // swing arc
  let arc='';
  for(let i=0;i<=48;i++){const th=Math.PI+(Math.PI*i/48);
    const px=cc[0]+aPix*Math.cos(th), py=cc[1]-aPix*Math.sin(th);
    arc+=(i?'L':'M')+px.toFixed(1)+' '+py.toFixed(1)+' ';}
  s+=`<path d="${arc}" fill="none" stroke="#B5258A" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.85"/>`;

  // altitude h (dashed) + right-angle mark
  const cF=M(F);
  s+=`<line x1="${cc[0]}" y1="${cc[1]}" x2="${cF[0]}" y2="${cF[1]}" stroke="#A2906F" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  {const r=9,sgx=(cc[0]-cF[0])>=0?1:-1;
   s+=`<path d="M ${cF[0]+sgx*r} ${cF[1]} L ${cF[0]+sgx*r} ${cF[1]-r} L ${cF[0]} ${cF[1]-r}" fill="none" stroke="#A2906F" stroke-width="1.2"/>`;}

  // solution leg(s): C → B
  bs.forEach(b=>{const mb=M(b);
    s+=`<line x1="${cc[0]}" y1="${cc[1]}" x2="${mb[0]}" y2="${mb[1]}" stroke="#1C7A45" stroke-width="2.5"/>`;});

  // side c: A → C
  s+=`<line x1="${A0[0]}" y1="${A0[1]}" x2="${cc[0]}" y2="${cc[1]}" stroke="#1733CC" stroke-width="2.5"/>`;

  // ── vertex dots reserved first so labels avoid them ───────────────────────
  s+=`<circle cx="${A0[0]}" cy="${A0[1]}" r="2.8" fill="#1E1710"/>`;
  s+=`<circle cx="${cc[0]}" cy="${cc[1]}" r="2.8" fill="#1E1710"/>`;
  LY.reserve(A0[0],A0[1],10,10);
  LY.reserve(cc[0],cc[1],10,10);

  // ── angle mark at A ───────────────────────────────────────────────────────
  {const d1=norm(sub(BE,A0)),d2=norm(sub(cc,A0)),r=20;
   const p1=add(A0,mul(d1,r)),p2=add(A0,mul(d2,r));
   const cross=d1[0]*d2[1]-d1[1]*d2[0],sweep=cross>0?1:0;
   s+=`<path d="M ${p1[0]} ${p1[1]} A ${r} ${r} 0 0 ${sweep} ${p2[0]} ${p2[1]}" fill="none" stroke="#241C12" stroke-width="1.4"/>`;
   const bis=norm(add(d1,d2)),lp=add(A0,mul(bis,36));
   // place the angle label, then immediately reserve it so c= and h= avoid it
   s+=LY.place(lp[0],lp[1],A+'°',{fs:11.5,fw:700,fill:'#241C12'},bis[0]*36,bis[1]*36);}

  // ── c label: perpendicular away from base ─────────────────────────────────
  {const mc=[(A0[0]+cc[0])/2,(A0[1]+cc[1])/2];
   let d=norm(sub(cc,A0)),n=[-d[1],d[0]];
   if(n[1]>0) n=mul(n,-1);
   s+=LY.place(mc[0],mc[1],'c='+r1(c),{fs:12,fw:700,fill:'#1733CC'},n[0]*22,n[1]*22);}

  // ── h label: beside the altitude ────────────────────────────────────────
  // Reserve the altitude midpoint zone and push h= explicitly right-of-altitude
  // (opposite side from the c= and angle labels which cluster left/above)
  {const mhx=(cc[0]+cF[0])/2, mhy=(cc[1]+cF[1])/2;
   // altitude runs vertically; place h to the right (+x) if C is left of foot, else left
   const hDir=cc[0]<cF[0]?1:-1;
   s+=LY.place(mhx,mhy,'h='+r1(g.h),{fs:11,fw:700,fill:'#A2906F'},hDir*34,12);}

  // ── a label: beside solution leg ─────────────────────────────────────────
  {if(bs.length){
     const mb=M(bs[bs.length-1]);
     const mid=[(cc[0]+mb[0])/2,(cc[1]+mb[1])/2];
     const dv=norm(sub(mb,cc)),nv=[-dv[1],dv[0]];
     const away=nv[1]<0?nv:mul(nv,-1);
     s+=LY.place(mid[0],mid[1],'a='+r1(a),{fs:12,fw:700,fill:'#1C7A45'},away[0]*18,away[1]*18);
   } else {
     const th=Math.PI+Math.PI/2;
     const lax=cc[0]+aPix*Math.cos(th),lay=cc[1]-aPix*Math.sin(th)-8;
     s+=LY.place(lax,lay,'a='+r1(a),{fs:12,fw:700,fill:'#1C7A45'},0,-18);
   }}

  // ── vertex labels A, C, B ─────────────────────────────────────────────────
  s+=LY.place(A0[0],A0[1]+18,'A',{fs:13,fw:700,fill:'#241C12'},-6,18);
  s+=LY.place(cc[0],cc[1]-14,'C',{fs:13,fw:700,fill:'#241C12'},0,-14);
  bs.forEach((b,i)=>{const mb=M(b);
    s+=`<circle cx="${mb[0]}" cy="${mb[1]}" r="3" fill="#1C7A45"/>`;
    LY.reserve(mb[0],mb[1],10,10);
    const bDir=mb[0]>A0[0]?1:-1;
    s+=LY.place(mb[0],mb[1]+18,bs.length===2?(i===0?'B′':'B'):'B',{fs:12.5,fw:700,fill:'#1C7A45'},bDir*14,18);});

  s+=`</svg>`;
  return {svg:s,count:g.count,h:g.h};
}

export { ssaGeom, svgSSA };
