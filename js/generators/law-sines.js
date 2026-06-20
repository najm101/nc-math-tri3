import { ri, pick, r1, r2, DEG } from '../core/helpers.js';
import { svgTri } from '../svg/triangle.js';

function gLawSines(){
  const A=ri(35,80),B=ri(35,80);
  const C=180-A-B;
  if(C<25||C>110) return gLawSines();
  const knownVal=ri(8,30);
  // known side = side c = AB (opposite C). law: k = c/sin C
  const k=knownVal/Math.sin(C*DEG);
  const a=k*Math.sin(A*DEG),b=k*Math.sin(B*DEG),c=knownVal; // a=BC,b=CA,c=AB
  // coords: C=(0,0), B=(a,0), A from angle C
  const P={C:[0,0],B:[a,0],A:[b*Math.cos(C*DEG),b*Math.sin(C*DEG)]};
  const ask=pick(['a','b']); // find BC(a) or CA(b)
  const answer= ask==='a'?a:b;
  const askName= ask==='a'?'BC':'CA';
  const dia=svgTri(P,{verts:[{at:'A',text:'A'},{at:'B',text:'B'},{at:'C',text:'C'}],
    angles:[{at:'A',text:A+'°'},{at:'B',text:B+'°'}],
    sides:[{a:'A',b:'B',text:String(knownVal)},
           {a:'B',b:'C',text:ask==='a'?'?':''},
           {a:'C',b:'A',text:ask==='b'?'?':''}]});
  const oppAsk= ask==='a'?A:B;
  return {tag:'Law of Sines',
    prompt:`Find <b>${askName}</b> to the nearest tenth.`,
    diagram:dia,type:'num',answer:answer,tol:0.2,unit:'',
    given:`m∠A = ${A}° · m∠B = ${B}° · m∠C = ${C}° · AB = ${knownVal}`,
    solution:`m∠C = 180−${A}−${B} = ${C}°. <code>${askName}/sin(${oppAsk}°) = ${knownVal}/sin(${C}°)</code> → <code>${askName} = ${knownVal}·sin(${oppAsk}°)/sin(${C}°) = <span class="ans">${r1(answer)}</span></code>`};
}

function gLawSinesAngle(){
  const A=ri(55,108), c=ri(10,26), a=ri(c+4,c+18);   // a>c ⇒ angle C is acute & unique
  const ratio=c*Math.sin(A*DEG)/a;                    // = sin C
  const C=Math.asin(Math.min(1,ratio))/DEG, B=180-A-C;
  if(B<15) return gLawSinesAngle();
  const k=a/Math.sin(A*DEG), b=k*Math.sin(B*DEG);
  const P={C:[0,0],B:[a,0],A:[b*Math.cos(C*DEG), b*Math.sin(C*DEG)]};
  const dia=svgTri(P,{verts:[{at:'A',text:'A'},{at:'B',text:'B'},{at:'C',text:'C'}],
    angles:[{at:'A',text:A+'°'},{at:'C',text:'?'}],
    sides:[{a:'B',b:'C',text:String(a)},{a:'A',b:'B',text:String(c)},{a:'C',b:'A',text:''}]});
  return {tag:'Law of Sines · angle',
    prompt:`Find <b>m∠C</b> to the nearest tenth of a degree.`,
    diagram:dia,type:'num',answer:C,tol:0.3,unit:'°',
    given:`m∠A = ${A}° · a = BC = ${a} · c = AB = ${c}`,
    solution:`<code>sinC/c = sinA/a</code> → <code>sinC = ${c}·sin(${A}°)/${a} = ${r2(ratio)}</code> → <code>C = sin⁻¹(${r2(ratio)}) = <span class="ans">${r1(C)}°</span></code>`};
}

export { gLawSines, gLawSinesAngle };
