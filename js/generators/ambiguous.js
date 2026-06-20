import { pick, ri, r1, r2, DEG } from '../core/helpers.js';
import { svgSSA } from '../svg/ssa.js';

function gAmbiguous(want){
  // angle A (acute or obtuse), side a opposite A, side c the other given side.
  // Only 0- or 1-solution cases are generated (matches the quizzes).
  // want: '0' → force no-triangle, '1' → force one-triangle, undefined → random
  const kind = want==='0' ? pick(['obtuse0','acute0'])
    : want==='1' ? pick(['obtuse1','acute1'])
    : pick(['obtuse1','obtuse0','acute0','acute1']);
  let A,a,c,count,why;
  if(kind==='obtuse1'){
    A=ri(95,140); a=ri(20,34); c=ri(6,a-4); count=1;
    why=`A is obtuse and a (${a}) > c (${c}), so exactly one triangle exists.`;
  } else if(kind==='obtuse0'){
    A=ri(95,140); a=ri(8,16); c=ri(a+3,28); count=0;
    why=`A is obtuse but a (${a}) ≤ c (${c}); the side opposite the obtuse angle is not the longest, so no triangle exists.`;
  } else if(kind==='acute0'){
    A=ri(30,75); c=ri(14,30); const h=c*Math.sin(A*DEG);
    a=Math.max(3,Math.round(h*0.6)); count=0;
    why=`h = c·sin A = ${r1(h)}. Since a (${a}) &lt; h, the side is too short to reach the base — no triangle.`;
  } else { // acute1
    A=ri(30,75); c=ri(14,30); a=ri(c+1,c+12); count=1;
    why=`h = c·sin A = ${r1(c*Math.sin(A*DEG))}. Since a (${a}) ≥ c (${c}), exactly one triangle exists.`;
  }
  // for the single-triangle cases, solve the triangle in the worked solution
  let solve='';
  if(count===1){
    const sinC=Math.min(1,c*Math.sin(A*DEG)/a);
    const C=Math.asin(sinC)/DEG, B=180-A-C, b=a*Math.sin(B*DEG)/Math.sin(A*DEG);
    solve=`<div class="step">Solve it with the Law of Sines: <code>sin C = c·sin A / a = ${r2(sinC)}</code> → m∠C ≈ ${r1(C)}°, m∠B ≈ ${r1(B)}°, b ≈ ${r1(b)}.</div>`;
  }
  return {tag:'Ambiguous case (SSA)',
    prompt:`How many triangles can be formed? (The solution then solves it.)`,
    given:`m∠A = ${A}° · a = ${a} · c = ${c}`,
    type:'choice',options:['0','1'],answerIndex:count,
    solution:why+solve+`<div class="soldiag">${svgSSA(A,c,a).svg}</div>`
      +`<div class="step" style="color:var(--muted)">Blue = fixed side c · gray dashed = altitude h · purple dashed = the swing of side a · green = the side that lands on the base. Open <b>SSA explorer</b> in the nav to drag the values.</div>`};
}

const gAmb0=()=>gAmbiguous('0');
const gAmb1=()=>gAmbiguous('1');

export { gAmbiguous, gAmb0, gAmb1 };
