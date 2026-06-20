import { pick, r2 } from '../core/helpers.js';
import { svgArc } from '../svg/circle.js';

function gArcLength(){
  const C=pick([72,96,120,144,180,240,360,480,720]);
  const ang=pick([5,10,15,20,30,36,40,45,60,72,90,120,150]);
  const ans=ang/360*C;
  return {
    tag:'Arc length',
    prompt:`A circle with circumference <b>${C}</b> has an arc with a <b>${ang}°</b> central angle. Find the arc length.`,
    diagram:svgArc(ang,'',ang+'°','C = '+C),
    type:'num',answer:ans,tol:0.05,unit:'units',
    solution:`Arc = (angle/360) × circumference.<div class="step"><code>(${ang}/360) × ${C} = <span class="ans">${r2(ans)}</span></code></div>`
  };
}

export { gArcLength };
