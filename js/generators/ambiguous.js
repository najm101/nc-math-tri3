import { pick, ri, r1, r2, DEG } from '../core/helpers.js';
import { svgSSA } from '../svg/ssa.js';

function gAmbiguous(){
  // angle A (acute or obtuse), side a opposite A, side c the other given side.
  // Only 1-solution cases are generated so the triangle is always solvable:
  // the student states the number of solutions AND solves it (m∠C, m∠B, b).
  const kind=pick(['obtuse','acute']);
  let A,a,c,why;
  if(kind==='obtuse'){
    A=ri(95,140); a=ri(20,34); c=ri(6,a-4);
    why=`A is obtuse and a (${a}) &gt; c (${c}), so exactly <b>1</b> triangle exists.`;
  } else { // acute, a >= c  ->  exactly one triangle
    A=ri(30,75); c=ri(14,30); a=ri(c+1,c+12);
    why=`h = c·sin A = ${r1(c*Math.sin(A*DEG))}. Since a (${a}) ≥ c (${c}), exactly <b>1</b> triangle exists.`;
  }
  const sinC=Math.min(1,c*Math.sin(A*DEG)/a);
  const C=Math.asin(sinC)/DEG, B=180-A-C, b=a*Math.sin(B*DEG)/Math.sin(A*DEG);
  const solve=`<div class="step">Solve with the Law of Sines:</div>`
    +`<div class="step"><code>sin C = c·sin A / a = ${c}·sin(${A}°)/${a} = ${r2(sinC)}</code> → <code>m∠C ≈ ${r1(C)}°</code></div>`
    +`<div class="step"><code>m∠B = 180° − ${A}° − ${r1(C)}° ≈ ${r1(B)}°</code></div>`
    +`<div class="step"><code>b = a·sin B / sin A = ${a}·sin(${r1(B)}°)/sin(${A}°) ≈ ${r1(b)}</code></div>`;
  return {tag:'Ambiguous case (SSA)',
    prompt:`State the number of solutions, then solve the triangle.`,
    given:`m∠A = ${A}° · a = ${a} cm · c = ${c} cm`,
    type:'triple',labels:['# solutions','m∠C (°)','m∠B (°)','b'],
    answers:[1,C,B,b],tols:[0.5,2,2,2],
    solution:why+solve+`<div class="soldiag">${svgSSA(A,c,a).svg}</div>`
      +`<div class="step" style="color:var(--muted)">Blue = fixed side c · gray dashed = altitude h · purple dashed = the swing of side a · green = the side that lands on the base. Open <b>SSA explorer</b> in the nav to drag the values.</div>`};
}

export { gAmbiguous };
