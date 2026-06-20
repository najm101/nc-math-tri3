import { pick, ri, r1 } from '../core/helpers.js';
import { svgPie } from '../svg/circle.js';

function gCircleGraph(){
  const sets=[[40,30,20,10],[55,20,15,10],[50,25,15,10],[35,30,20,15],[45,25,20,10],[30,30,25,15],[40,35,15,10],[60,20,20],[50,30,20]];
  let pcts=pick(sets).slice();
  for(let i=pcts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pcts[i],pcts[j]]=[pcts[j],pcts[i]];}
  const labels='ABCDEF', span=Math.random()<0.62?1:2, start=ri(0,pcts.length-span);
  let sum=0; for(let k=0;k<span;k++) sum+=pcts[start+k];
  const deg=sum*3.6;
  return {tag:'Circle graph',
    prompt:`The circle graph shows percentages of a whole. Find the measure of arc <b>${labels[start]}${labels[start+span]}</b> in degrees.`,
    diagram:svgPie(pcts.map(p=>({pct:p}))),
    type:'num',answer:deg,tol:0.5,unit:'°',
    solution:`Arc° = (percent ÷ 100) × 360. The arc spans <b>${sum}%</b>. <code>${sum}% × 360 = ${sum}·3.6 = <span class="ans">${r1(deg)}°</span></code>`};
}

export { gCircleGraph };
