import { DEG } from '../core/helpers.js';
import { norm, add, sub, mul, txt } from './core.js';

/* circle with two radii + highlighted arc */
function svgArc(angleDeg, centerLabel, arcText, extra){
  const W=300,H=210,cx=150,cy=105,R=72;
  const a0=-30*DEG, a1=a0-angleDeg*DEG; // sweep clockwise
  const p0=[cx+R*Math.cos(a0),cy+R*Math.sin(a0)];
  const p1=[cx+R*Math.cos(a1),cy+R*Math.sin(a1)];
  const large=angleDeg>180?1:0;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`;
  s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(23,51,204,0.08)" stroke="#1E1710" stroke-width="2"/>`;
  s+=`<path d="M ${p0[0]} ${p0[1]} A ${R} ${R} 0 ${large} 0 ${p1[0]} ${p1[1]}" fill="none" stroke="#1733CC" stroke-width="4"/>`;
  s+=`<line x1="${cx}" y1="${cy}" x2="${p0[0]}" y2="${p0[1]}" stroke="#1E1710" stroke-width="1.6"/>`;
  s+=`<line x1="${cx}" y1="${cy}" x2="${p1[0]}" y2="${p1[1]}" stroke="#1E1710" stroke-width="1.6"/>`;
  s+=`<circle cx="${cx}" cy="${cy}" r="2.6" fill="#1E1710"/>`;
  const am=(a0+a1)/2;
  s+=txt(cx+26*Math.cos(am),cy+26*Math.sin(am),arcText,{fs:12,fw:600,fill:'#241C12'});
  if(extra) s+=txt(cx,cy+R+24,extra,{fs:12,fw:400,fill:'#6E5F49'});
  s+=`</svg>`;return s;
}

/* circle with a single labeled radius or diameter */
function svgRadius(isDiam,label){
  const W=280,H=200,cx=140,cy=100,R=74;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`;
  s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(23,51,204,0.08)" stroke="#1E1710" stroke-width="2"/>`;
  s+=`<circle cx="${cx}" cy="${cy}" r="3" fill="#1E1710"/>`;
  if(isDiam){
    s+=`<line x1="${cx-R}" y1="${cy}" x2="${cx+R}" y2="${cy}" stroke="#1733CC" stroke-width="2.4"/>`;
    s+=`<circle cx="${cx-R}" cy="${cy}" r="3" fill="#1733CC"/><circle cx="${cx+R}" cy="${cy}" r="3" fill="#1733CC"/>`;
  } else {
    s+=`<line x1="${cx}" y1="${cy}" x2="${cx+R}" y2="${cy}" stroke="#1733CC" stroke-width="2.4"/>`;
    s+=`<circle cx="${cx+R}" cy="${cy}" r="3" fill="#1733CC"/>`;
  }
  s+=txt(cx+(isDiam?0:R/2),cy-9,label,{fs:13,fw:700,fill:'#1733CC'});
  s+=`</svg>`;return s;
}
/* circle with labeled points, radii, and central-angle labels (arc-measure problems) */
function svgCirclePts(cfg){
  const W=300,H=238,cx=150,cy=116,R=82, pos={};
  cfg.pts.forEach(p=>{const a=p.deg*DEG; pos[p.label]=[cx+R*Math.cos(a), cy-R*Math.sin(a)];});
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`;
  s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(23,51,204,0.08)" stroke="#1E1710" stroke-width="2"/>`;
  cfg.pts.forEach(p=>{const P=pos[p.label]; s+=`<line x1="${cx}" y1="${cy}" x2="${P[0]}" y2="${P[1]}" stroke="#A2906F" stroke-width="1.4"/>`;});
  if(cfg.diameter){const a=pos[cfg.diameter[0]],b=pos[cfg.diameter[1]]; s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#1E1710" stroke-width="2"/>`;}
  (cfg.angles||[]).forEach(an=>{
    const da=norm(sub(pos[an.from],[cx,cy])), db=norm(sub(pos[an.to],[cx,cy])), r=30;
    const a1=[cx+da[0]*r,cy+da[1]*r], a2=[cx+db[0]*r,cy+db[1]*r];
    const cr=da[0]*db[1]-da[1]*db[0], sw=cr>0?1:0;
    s+=`<path d="M ${a1[0]} ${a1[1]} A ${r} ${r} 0 0 ${sw} ${a2[0]} ${a2[1]}" fill="none" stroke="#1733CC" stroke-width="1.6"/>`;
    const bis=norm(add(da,db)), lp=[cx+bis[0]*(r+16), cy+bis[1]*(r+16)];
    s+=txt(lp[0],lp[1],an.text,{fs:12,fw:700,fill:'#1733CC'});
  });
  s+=`<circle cx="${cx}" cy="${cy}" r="2.6" fill="#1E1710"/>`;
  if(cfg.center) s+=txt(cx-10,cy+13,cfg.center,{fs:12,fw:700,fill:'#241C12'});
  cfg.pts.forEach(p=>{const P=pos[p.label], d=norm(sub(P,[cx,cy])), lp=[P[0]+d[0]*13,P[1]+d[1]*13];
    s+=`<circle cx="${P[0]}" cy="${P[1]}" r="2.6" fill="#1E1710"/>`;
    s+=txt(lp[0],lp[1],p.label,{fs:13,fw:700,fill:'#241C12'});});
  s+=`</svg>`; return s;
}
/* pie chart with boundary points A,B,C… (circle-graph arc problems) */
function svgPie(sectors){
  const W=300,H=238,cx=150,cy=114,R=86, PAL=['#1733CC','#C23A2A','#1C7A45','#C77F1A','#7C3AED'];
  const sd=a=>Math.sin(a*DEG), cd=a=>Math.cos(a*DEG), ptAt=phi=>[cx+R*sd(phi), cy-R*cd(phi)];
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`, cum=0;
  sectors.forEach((sec,i)=>{
    const phi0=cum*3.6, phi1=(cum+sec.pct)*3.6, p0=ptAt(phi0), p1=ptAt(phi1), large=sec.pct>50?1:0;
    s+=`<path d="M ${cx} ${cy} L ${p0[0]} ${p0[1]} A ${R} ${R} 0 ${large} 1 ${p1[0]} ${p1[1]} Z" fill="${PAL[i%PAL.length]}" stroke="#fff" stroke-width="1.6"/>`;
    const mid=(phi0+phi1)/2, lp=[cx+R*0.62*sd(mid), cy-R*0.62*cd(mid)];
    s+=`<text x="${lp[0]}" y="${lp[1]}" font-size="12" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${sec.pct}%</text>`;
    cum+=sec.pct;
  });
  cum=0; const labels='ABCDEF';
  sectors.forEach((sec,i)=>{
    const P=ptAt(cum*3.6), d=norm(sub(P,[cx,cy])), lp=[P[0]+d[0]*14,P[1]+d[1]*14];
    s+=`<circle cx="${P[0]}" cy="${P[1]}" r="3" fill="#1E1710"/>`;
    s+=txt(lp[0],lp[1],labels[i],{fs:13,fw:700,fill:'#241C12'});
    cum+=sec.pct;
  });
  s+=`</svg>`; return s;
}
/* circle with two chords + perpendicular distances from center (arcs & chords) */
function svgChords(cfg){
  const W=300,H=238,cx=150,cy=120,R=82,C=[cx,cy], dpx=cfg.dpx||36;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`;
  s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(23,51,204,0.08)" stroke="#1E1710" stroke-width="2"/>`;
  cfg.chords.forEach(ch=>{
    const a=ch.dir*DEG, u=[Math.cos(a),Math.sin(a)], t=[-u[1],u[0]];
    const F=add(C,mul(u,dpx)), L=Math.sqrt(R*R-dpx*dpx);
    const E1=add(F,mul(t,L)), E2=sub(F,mul(t,L));
    s+=`<line x1="${E1[0]}" y1="${E1[1]}" x2="${E2[0]}" y2="${E2[1]}" stroke="#1E1710" stroke-width="2"/>`;
    s+=`<line x1="${C[0]}" y1="${C[1]}" x2="${F[0]}" y2="${F[1]}" stroke="#6E5F49" stroke-width="1.5"/>`;
    const m=8, side=ch.markSide||1, pA=add(F,mul(u,-m)), pB=add(F,mul(t,side*m)), corner=add(add(F,mul(u,-m)),mul(t,side*m));
    s+=`<path d="M ${pA[0]} ${pA[1]} L ${corner[0]} ${corner[1]} L ${pB[0]} ${pB[1]}" fill="none" stroke="#6E5F49" stroke-width="1.3"/>`;
    if(ch.distLabel){const mid=add(C,mul(u,dpx*0.52)), off=add(mid,mul(t,(ch.distSide||1)*15));
      s+=txt(off[0],off[1],ch.distLabel,{fs:12,fw:700,fill:'#1733CC'});}
    if(ch.chordLabel){const lp=add(F,mul(u,16));
      s+=txt(lp[0],lp[1],ch.chordLabel,{fs:12,fw:700,fill:'#1733CC'});}
    if(ch.ticks){for(let k=0;k<ch.ticks;k++){const base=add(F,mul(t,(k-(ch.ticks-1)/2)*5)), q1=add(base,mul(u,5)), q2=add(base,mul(u,-5));
      s+=`<line x1="${q1[0]}" y1="${q1[1]}" x2="${q2[0]}" y2="${q2[1]}" stroke="#1E1710" stroke-width="1.6"/>`;}}
    if(ch.foot){const fp=add(F,mul(u,12));
      s+=txt(fp[0],fp[1],ch.foot,{fs:11.5,fw:700,fill:'#241C12'});}
    [[E1,ch.e1],[E2,ch.e2]].forEach(([P,lab])=>{const d=norm(sub(P,C)), lp=add(P,mul(d,13));
      s+=`<circle cx="${P[0]}" cy="${P[1]}" r="2.4" fill="#1E1710"/>`;
      if(lab) s+=txt(lp[0],lp[1],lab,{fs:12,fw:700,fill:'#241C12'});});
  });
  s+=`<circle cx="${cx}" cy="${cy}" r="2.6" fill="#1E1710"/>`;
  if(cfg.center) s+=txt(cx+7,cy+12,cfg.center,{fs:12,fw:700,fill:'#241C12'});
  s+=`</svg>`; return s;
}

export { svgArc, svgRadius, svgCirclePts, svgPie, svgChords };
