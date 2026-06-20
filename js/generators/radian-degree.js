import { pick, reduceFrac } from '../core/helpers.js';

function gDegToRad(){
  const deg=pick([15,30,45,60,75,90,105,120,135,150,160,180,200,210,225,240,270,285,300,315,330,160,255]);
  const [n,d]=reduceFrac(deg,180);
  return {tag:'Degrees → radians',
    prompt:`Convert <b>${deg}°</b> into radians. Enter the reduced fraction (× π).`,
    type:'frac',num:n,den:d,
    solution:`Multiply by π/180: <code>${deg}·π/180 = ${n}π${d===1?'':'/'+d}</code>`};
}

function gRadToDeg(){
  const opt=pick([[5,12],[5,6],[1,12],[3,4],[2,3],[7,6],[5,4],[7,4],[11,6],[1,3],[3,2],[5,3]]);
  const [n,d]=opt;const deg=n*180/d;
  return {tag:'Radians → degrees',
    prompt:`Convert <b class="mono">${n}π/${d}</b> into degrees.`,
    type:'num',answer:deg,tol:0.01,unit:'°',
    solution:`Multiply by 180/π: <code>(${n}π/${d})·(180/π) = ${n}·180/${d} = <span class="ans">${deg}°</span></code>`};
}

export { gDegToRad, gRadToDeg };
