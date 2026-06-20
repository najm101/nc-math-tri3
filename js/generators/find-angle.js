import { pick, ri, r1, DEG } from '../core/helpers.js';
import { svgTri } from '../svg/triangle.js';

/* find an acute angle in a right triangle from two known sides (inverse trig) */
function gFindAngle(mode){
  if(mode===undefined) mode=pick(['tan','sin','cos']);
  let opp=0,adj=0,hyp=0,ang,ratioTxt,invTxt;
  if(mode==='tan'){
    opp=ri(3,20); adj=ri(3,20); ang=Math.atan(opp/adj)/DEG;
    ratioTxt=`tan θ = opposite/adjacent = ${opp}/${adj}`; invTxt=`θ = tan⁻¹(${opp}/${adj})`;
  } else if(mode==='sin'){
    opp=ri(3,18); hyp=opp+ri(2,16); ang=Math.asin(opp/hyp)/DEG;
    ratioTxt=`sin θ = opposite/hypotenuse = ${opp}/${hyp}`; invTxt=`θ = sin⁻¹(${opp}/${hyp})`;
  } else {
    adj=ri(3,18); hyp=adj+ri(2,16); ang=Math.acos(adj/hyp)/DEG;
    ratioTxt=`cos θ = adjacent/hypotenuse = ${adj}/${hyp}`; invTxt=`θ = cos⁻¹(${adj}/${hyp})`;
  }
  // right angle at B; angle θ at A; B-C = opposite, B-A = adjacent, A-C = hypotenuse
  const P={B:[0,0],A:[Math.cos(ang*DEG),0],C:[0,Math.sin(ang*DEG)]};
  const dia=svgTri(P,{angles:[{at:'B',right:true},{at:'A',text:'θ'}],
    sides:[{a:'B',b:'C',text:opp?String(opp):''},{a:'B',b:'A',text:adj?String(adj):''},{a:'A',b:'C',text:hyp?String(hyp):''}]});
  return {tag:'Find an angle · SOH-CAH-TOA',
    prompt:`Find <b>θ</b> to the nearest tenth of a degree.`,
    diagram:dia,type:'num',answer:ang,tol:0.2,unit:'°',
    solution:`Pick the ratio that uses the two known sides. <code>${ratioTxt}</code> → <code>${invTxt} = <span class="ans">${r1(ang)}°</span></code>`};
}

const gFindAngleSin=()=>gFindAngle('sin');
const gFindAngleCos=()=>gFindAngle('cos');
const gFindAngleTan=()=>gFindAngle('tan');

export { gFindAngle, gFindAngleSin, gFindAngleCos, gFindAngleTan };
