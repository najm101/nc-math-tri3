import { ri, pick, r1, r2, DEG } from '../core/helpers.js';
import { svgTri } from '../svg/triangle.js';

function gLawCosines(){
  // ── SAS: two sides and the included angle known; find the third (opposite) side ──
  const angVertex = pick(['A','B','C']);     // vertex holding the known included angle
  const ang = ri(20,140);                    // the included angle, in degrees
  const p = ri(8,30), q = ri(8,30);          // the two sides meeting at that angle
  const cosV = Math.cos(ang*DEG);
  const val  = p*p + q*q - 2*p*q*cosV;
  const opp  = Math.sqrt(val);               // unknown side, opposite angVertex

  // sort the two known sides into the a/b/c scheme (a=BC opp A, b=CA opp B, c=AB opp C)
  const sideLen={}; let oppName, given;
  if(angVertex==='A'){ sideLen.b=p; sideLen.c=q; sideLen.a=opp; oppName='BC';
    given=`AC = ${p} · AB = ${q} · m∠A = ${ang}°`; }
  else if(angVertex==='B'){ sideLen.a=p; sideLen.c=q; sideLen.b=opp; oppName='AC';
    given=`BC = ${p} · AB = ${q} · m∠B = ${ang}°`; }
  else { sideLen.a=p; sideLen.b=q; sideLen.c=opp; oppName='AB';
    given=`BC = ${p} · AC = ${q} · m∠C = ${ang}°`; }
  const {a,b,c}=sideLen;

  // draw the actual triangle: A=(0,0), B=(c,0), C placed so AC=b, BC=a
  const Cx = (b*b + c*c - a*a) / (2*c);
  const Cy = Math.sqrt(Math.max(b*b - Cx*Cx, 0));
  const Pmap = {A:[0,0], B:[c,0], C:[Cx,Cy]};
  const dia = svgTri(Pmap,{
    verts:[{at:'A',text:'A'},{at:'B',text:'B'},{at:'C',text:'C'}],
    angles:[{at:angVertex,text:ang+'°'}],          // the known included angle
    sides:[
      {a:'A',b:'B',text: oppName==='AB'?'?':String(c)},   // AB = c
      {a:'A',b:'C',text: oppName==='AC'?'?':String(b)},   // AC = b
      {a:'B',b:'C',text: oppName==='BC'?'?':String(a)}    // BC = a
    ]});
  return {tag:'Law of Cosines · find a side',
    prompt:`Find <b>${oppName}</b> to the nearest tenth.`,
    diagram:dia,type:'num',answer:opp,tol:0.2,unit:'',
    given:given,
    solution:`Two sides and the included angle (SAS) are known, so apply the Law of Cosines to the side opposite ∠${angVertex}:<br>`
      +`<code>${oppName}² = ${p}² + ${q}² − 2·${p}·${q}·cos ${ang}° = ${r2(val)}</code> → `
      +`<code>${oppName} = √${r2(val)} = <span class="ans">${r1(opp)}</span></code>`};
}

export { gLawCosines };
