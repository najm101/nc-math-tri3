import { ri, r1 } from '../core/helpers.js';
import { svgRadius } from '../svg/circle.js';

function gCircumference(useR){
  if(useR===undefined) useR=Math.random()<0.5;
  const v=ri(4,30);
  const C=useR?2*Math.PI*v:Math.PI*v;
  return {
    tag:'Circumference',
    prompt:`Find the circumference of a circle with a ${useR?'radius':'diameter'} of <b>${v}</b>. Round to the nearest tenth.`,
    diagram:svgRadius(!useR, v+''),
    type:'num',answer:C,tol:0.15,unit:'units',
    solution:`${useR?'C = 2πr':'C = πd'} = <code>${useR?`2π(${v})`:`π(${v})`} = ${r1(C)}</code> &nbsp;(exact: <span class="ans">${useR?2*v:v}π</span>)`
  };
}

const gCircR=()=>gCircumference(true);
const gCircD=()=>gCircumference(false);

export { gCircumference, gCircR, gCircD };
