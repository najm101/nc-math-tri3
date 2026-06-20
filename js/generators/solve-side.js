import { ri, pick, r1, DEG } from '../core/helpers.js';
import { svgTri } from '../svg/triangle.js';

function gSolveSide(ratio){
  const ang=ri(20,70);
  const known=ri(6,28);
  // the six SOH-CAH-TOA modes grouped by which ratio they use
  const byRatio={sin:['oppFromHyp','hypFromOpp'],cos:['adjFromHyp','hypFromAdj'],tan:['oppFromAdj','adjFromOpp']};
  const mode = ratio ? pick(byRatio[ratio])
    : pick(['oppFromAdj','adjFromOpp','oppFromHyp','hypFromOpp','adjFromHyp','hypFromAdj']);
  // right angle at B=(0,0); A=(adj,0) angle here; C=(0,opp)
  // shape only needs angle; set adj=cos, opp=sin scaled
  const P={B:[0,0],A:[Math.cos(ang*DEG),0],C:[0,Math.sin(ang*DEG)]};
  let answer,formula,sides={oppS:'',adjS:'',hypS:''};
  const A=ang*DEG;
  if(mode==='oppFromAdj'){answer=known*Math.tan(A);sides.adjS=String(known);sides.oppS='x';formula=`tan(${ang}°) = x / ${known} → x = ${known}·tan(${ang}°)`;}
  if(mode==='adjFromOpp'){answer=known/Math.tan(A);sides.oppS=String(known);sides.adjS='x';formula=`tan(${ang}°) = ${known} / x → x = ${known}/tan(${ang}°)`;}
  if(mode==='oppFromHyp'){answer=known*Math.sin(A);sides.hypS=String(known);sides.oppS='x';formula=`sin(${ang}°) = x / ${known} → x = ${known}·sin(${ang}°)`;}
  if(mode==='hypFromOpp'){answer=known/Math.sin(A);sides.oppS=String(known);sides.hypS='x';formula=`sin(${ang}°) = ${known} / x → x = ${known}/sin(${ang}°)`;}
  if(mode==='adjFromHyp'){answer=known*Math.cos(A);sides.hypS=String(known);sides.adjS='x';formula=`cos(${ang}°) = x / ${known} → x = ${known}·cos(${ang}°)`;}
  if(mode==='hypFromAdj'){answer=known/Math.cos(A);sides.adjS=String(known);sides.hypS='x';formula=`cos(${ang}°) = ${known} / x → x = ${known}/cos(${ang}°)`;}
  const dia=svgTri(P,{angles:[{at:'B',right:true},{at:'A',text:ang+'°'}],
    sides:[{a:'B',b:'C',text:sides.oppS},{a:'B',b:'A',text:sides.adjS},{a:'A',b:'C',text:sides.hypS}]});
  return {tag:'Solve a side · SOH-CAH-TOA',
    prompt:`Find <b>x</b> using a trig ratio. Round to the nearest tenth.`,
    diagram:dia,type:'num',answer:answer,tol:0.2,unit:'',
    solution:`${formula} = <code><span class="ans">${r1(answer)}</span></code>`};
}

const gSideSin=()=>gSolveSide('sin');
const gSideCos=()=>gSolveSide('cos');
const gSideTan=()=>gSolveSide('tan');

export { gSolveSide, gSideSin, gSideCos, gSideTan };
