import { ri, r1, DEG } from '../core/helpers.js';
import { svgTri } from '../svg/triangle.js';

function gArea(){
  const p=ri(5,18),q=ri(5,18);const ang=ri(25,140);
  const area=0.5*p*q*Math.sin(ang*DEG);
  const P={C:[0,0],A:[q,0],B:[p*Math.cos(ang*DEG),p*Math.sin(ang*DEG)]};
  const dia=svgTri(P,{verts:[{at:'A',text:'A'},{at:'B',text:'B'},{at:'C',text:'C'}],
    angles:[{at:'C',text:ang+'°'}],
    sides:[{a:'C',b:'A',text:String(q)},{a:'C',b:'B',text:String(p)}]});
  return {tag:'Area of a triangle',
    prompt:`Find the <b>area</b> of the triangle to the nearest tenth.`,
    diagram:dia,type:'num',answer:area,tol:0.2,unit:'units²',
    given:`Two sides = ${p} and ${q} · included angle = ${ang}°`,
    solution:`Area = ½·a·b·sin C = <code>½(${p})(${q})sin(${ang}°) = <span class="ans">${r1(area)}</span></code>`};
}

export { gArea };
