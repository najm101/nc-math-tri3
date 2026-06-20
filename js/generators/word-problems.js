import { pick, ri, r1, DEG } from '../core/helpers.js';
import { norm, add, sub, mul, txt, strW } from '../svg/core.js';

/* labeled right triangle for angle-of-elevation / depression word problems.
   cfg: {a:angle°, mode:'L'|'R', vert,horiz,hyp:label strings, angLabel?, depression?} */
function svgWordTri(cfg){
  const W=340,H=215,padL=70,padR=70,padT=44,padB=46; // wider pad for long labels
  const RW=W-padL-padR,RH=H-padT-padB;
  const aReal=cfg.a,aDraw=Math.max(20,Math.min(70,aReal)),t=Math.tan(aDraw*DEG);
  const angTxt=cfg.angLabel!=null?cfg.angLabel:(r1(aReal)+'\u00b0');
  let run=RW,rise=run*t; if(rise>RH){rise=RH;run=rise/t;}
  const x0=padL+(RW-run)/2,xR=x0+run,yB=padT+(RH+rise)/2,yT=yB-rise;
  let L,R,A,rightV,angV,vertEdge,horizEdge,hypEdge;
  if(cfg.mode==='L'){L=[x0,yB];R=[xR,yB];A=[xR,yT];rightV=R;angV=L;vertEdge=[R,A];horizEdge=[L,R];hypEdge=[L,A];}
  else{L=[x0,yB];R=[xR,yB];A=[x0,yT];rightV=L;angV=R;vertEdge=[L,A];horizEdge=[L,R];hypEdge=[R,A];}
  const pts=[L,R,A],cen=[(L[0]+R[0]+A[0])/3,(L[1]+R[1]+A[1])/3];
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Space Mono, monospace">`;
  s+=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="rgba(23,51,204,0.09)" stroke="#1E1710" stroke-width="2" stroke-linejoin="round"/>`;

  // right-angle square
  {const V=rightV,o=pts.filter(p=>p!==V),d1=norm(sub(o[0],V)),d2=norm(sub(o[1],V)),r=12;
   const p1=add(V,mul(d1,r)),p2=add(V,mul(d2,r)),c=add(add(V,mul(d1,r)),mul(d2,r));
   s+=`<path d="M ${p1[0]} ${p1[1]} L ${c[0]} ${c[1]} L ${p2[0]} ${p2[1]}" fill="none" stroke="#1E1710" stroke-width="1.5"/>`;}

  // angle arc + label
  {const V=angV,o=pts.filter(p=>p!==V),d1=norm(sub(o[0],V)),d2=norm(sub(o[1],V)),r=23;
   const a1=add(V,mul(d1,r)),a2=add(V,mul(d2,r)),cr=d1[0]*d2[1]-d1[1]*d2[0],sw=cr>0?1:0;
   s+=`<path d="M ${a1[0]} ${a1[1]} A ${r} ${r} 0 0 ${sw} ${a2[0]} ${a2[1]}" fill="none" stroke="#1733CC" stroke-width="1.6"/>`;
   const bis=norm(add(d1,d2)),lp=add(V,mul(bis,r+15));
   s+=txt(lp[0],lp[1],angTxt,{fs:12.5,fw:700,fill:'#1733CC'});}

  // ── edge labels with length-aware offsets ──────────────────────────────────
  // horiz: below the base
  if(cfg.horiz){
    const m=[(horizEdge[0][0]+horizEdge[1][0])/2,(horizEdge[0][1]+horizEdge[1][1])/2];
    s+=txt(m[0],m[1]+17,cfg.horiz,{fs:11.5,fw:700,fill:'#241C12'});
  }
  // vert: to the left or right side, away from triangle interior
  if(cfg.vert){
    const m=[(vertEdge[0][0]+vertEdge[1][0])/2,(vertEdge[0][1]+vertEdge[1][1])/2];
    const left=m[0]<cen[0];
    const ox=left?-(strW(cfg.vert,11.5)/2+10):(strW(cfg.vert,11.5)/2+10);
    s+=txt(m[0]+ox,m[1],cfg.vert,{fs:11.5,fw:700,fill:'#241C12'});
  }
  // hyp: offset perpendicularly away from triangle interior; scale with label length
  if(cfg.hyp){
    const m=[(hypEdge[0][0]+hypEdge[1][0])/2,(hypEdge[0][1]+hypEdge[1][1])/2];
    const dv=norm(sub(m,cen));
    const baseOff=18, extraOff=Math.max(0,(strW(cfg.hyp,11.5)/2)-30);
    const off=baseOff+extraOff;
    s+=txt(m[0]+dv[0]*off,m[1]+dv[1]*off,cfg.hyp,{fs:11.5,fw:700,fill:'#241C12'});
  }

  // depression dashed line + arc
  if(cfg.depression){
    const apex=A,d1=[1,0],rayEnd=add(apex,mul(d1,56));
    s+=`<line x1="${apex[0]}" y1="${apex[1]}" x2="${rayEnd[0]}" y2="${rayEnd[1]}" stroke="#A2906F" stroke-width="1.4" stroke-dasharray="4 3"/>`;
    const d2=norm(sub(R,apex)),r=30,a1=add(apex,mul(d1,r)),a2=add(apex,mul(d2,r)),cr=d1[0]*d2[1]-d1[1]*d2[0],sw=cr>0?1:0;
    s+=`<path d="M ${a1[0]} ${a1[1]} A ${r} ${r} 0 0 ${sw} ${a2[0]} ${a2[1]}" fill="none" stroke="#1733CC" stroke-width="1.6"/>`;
    const bis=norm(add(d1,d2)),lp=add(apex,mul(bis,r+12));
    s+=txt(lp[0],lp[1],angTxt,{fs:11,fw:700,fill:'#1733CC'});
    s+=txt(rayEnd[0]-2,apex[1]-10,'horizontal',{fs:9.5,fw:400,fill:'#A2906F',anc:'end'});
  }
  s+=`</svg>`;return s;
}

function gWord(kind){
  // grouped by what the problem asks for: a side via elevation, a side via depression, or an angle
  const byKind={elev:['ramp','ladder','shadow'],depr:['plane'],angle:['treeAngle','rampAngle']};
  const t = kind ? pick(byKind[kind])
    : pick(['plane','ramp','ladder','shadow','treeAngle','rampAngle']);
  if(t==='treeAngle'){
    const h=ri(6,30), sh=ri(6,30);
    const ans=Math.atan(h/sh)/DEG;
    return {tag:'Word problem · find angle',
      prompt:`A tree <b>${h} m</b> tall casts a shadow <b>${sh} m</b> long. Find the angle of elevation of the sun, to the nearest tenth of a degree.`,
      diagram:svgWordTri({a:ans,mode:'L',vert:`${h} m`,horiz:`${sh} m`,hyp:'',angLabel:'x°'}),
      type:'num',answer:ans,tol:0.2,unit:'°',
      solution:`The height is opposite the angle and the shadow is adjacent. <code>tan(x) = ${h}/${sh} → x = tan⁻¹(${h}/${sh}) = ${r1(ans)}°</code>`};
  }
  if(t==='rampAngle'){
    const rise=ri(2,12), run=ri(10,40);
    const ans=Math.atan(rise/run)/DEG;
    return {tag:'Word problem · find angle',
      prompt:`A ramp rises <b>${rise} ft</b> over a horizontal run of <b>${run} ft</b>. Find the ramp's angle of elevation, to the nearest tenth of a degree.`,
      diagram:svgWordTri({a:ans,mode:'L',vert:`${rise} ft`,horiz:`${run} ft`,hyp:'',angLabel:'x°'}),
      type:'num',answer:ans,tol:0.2,unit:'°',
      solution:`<code>tan(x) = rise/run = ${rise}/${run} → x = tan⁻¹(${rise}/${run}) = ${r1(ans)}°</code>`};
  }
  if(t==='plane'){
    const h=pick([8000,10000,12000,15000]);const a=ri(20,55);
    const ans=h/Math.tan(a*DEG);
    return {tag:'Word problem · depression',
      prompt:`A plane flies at an altitude of <b>${h.toLocaleString()} m</b>. The angle of depression to the airport tower is <b>${a}°</b>. How far is the tower from the point directly below the plane? Round to the nearest tenth.`,
      diagram:svgWordTri({a:a,mode:'R',vert:`${h} m`,horiz:'x',hyp:'',depression:true}),
      type:'num',answer:ans,tol:Math.max(2,ans*0.002),unit:'m',
      solution:`The angle of depression at the plane equals the angle of elevation at the tower. <code>tan(${a}°) = ${h}/x → x = ${h}/tan(${a}°) = ${r1(ans)} m</code>`};
  }
  if(t==='ramp'){
    const a=ri(2,12);
    const ans=5280*Math.sin(a*DEG);
    return {tag:'Word problem · elevation',
      prompt:`A car travels up a grade with an angle of elevation of <b>${a}°</b>. After traveling <b>1 mile</b>, what is the vertical change in feet? (1 mile = 5,280 ft) Round to the nearest tenth.`,
      diagram:svgWordTri({a:a,mode:'L',vert:'x',horiz:'',hyp:'1 mi = 5280 ft'}),
      type:'num',answer:ans,tol:0.6,unit:'ft',
      solution:`The 1 mile is the hypotenuse. <code>rise = 5280·sin(${a}°) = ${r1(ans)} ft</code>`};
  }
  if(t==='ladder'){
    const L=ri(8,24);const a=ri(40,75);
    const ans=L*Math.sin(a*DEG);
    return {tag:'Word problem · elevation',
      prompt:`A <b>${L} ft</b> ladder leans against a wall at an angle of <b>${a}°</b> with the ground. How high up the wall does it reach? Round to the nearest tenth.`,
      diagram:svgWordTri({a:a,mode:'L',vert:'x',horiz:'',hyp:`ladder = ${L} ft`}),
      type:'num',answer:ans,tol:0.2,unit:'ft',
      solution:`<code>sin(${a}°) = height/${L} → height = ${L}·sin(${a}°) = ${r1(ans)} ft</code>`};
  }
  const s=ri(10,40);const a=ri(25,65);
  const ans=s*Math.tan(a*DEG);
  return {tag:'Word problem · elevation',
    prompt:`A tree casts a shadow <b>${s} m</b> long. The angle of elevation to the sun is <b>${a}°</b>. How tall is the tree? Round to the nearest tenth.`,
    diagram:svgWordTri({a:a,mode:'L',vert:'x',horiz:`shadow = ${s} m`,hyp:''}),
    type:'num',answer:ans,tol:0.3,unit:'m',
    solution:`<code>tan(${a}°) = height/${s} → height = ${s}·tan(${a}°) = ${r1(ans)} m</code>`};
}

const gWordElev=()=>gWord('elev');
const gWordDepr=()=>gWord('depr');
const gWordAngle=()=>gWord('angle');

export { gWord, gWordElev, gWordDepr, gWordAngle };
