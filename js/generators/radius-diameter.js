import { ri } from '../core/helpers.js';
import { svgRadius } from '../svg/circle.js';

function gRadDiam(giveR){
  if(giveR===undefined) giveR=Math.random()<0.5;
  const v=ri(3,24);
  if(giveR) return {tag:'Radius & diameter',
    prompt:`A circle has a radius of <b>${v}</b>. What is its diameter?`,
    diagram:svgRadius(false,v+''),
    type:'num',answer:2*v,tol:0.01,unit:'units',
    solution:`Diameter = 2 × radius = <code>2 × ${v} = <span class="ans">${2*v}</span></code>`};
  const d=v*2;
  return {tag:'Radius & diameter',
    prompt:`A circle has a diameter of <b>${d}</b>. What is its radius?`,
    diagram:svgRadius(true,d+''),
    type:'num',answer:v,tol:0.01,unit:'units',
    solution:`Radius = diameter ÷ 2 = <code>${d} ÷ 2 = <span class="ans">${v}</span></code>`};
}

const gRdR2D=()=>gRadDiam(true);   // given radius → find diameter
const gRdD2R=()=>gRadDiam(false);  // given diameter → find radius

export { gRadDiam, gRdR2D, gRdD2R };
