import { pt, r2, pick } from '../core/helpers.js';

function gDistance(dim){
  if(dim===undefined) dim=pick([2,2,3]);   // weighted toward 2-D (most quizzes use 2-D); 3-D still appears
  let A=pt(dim),B=pt(dim);
  while(A.every((v,i)=>v===B[i])) B=pt(dim);
  const d2=A.reduce((s,_,i)=>s+(B[i]-A[i])**2,0);
  const d=Math.sqrt(d2);
  const terms=A.map((_,i)=>`(${B[i]}−${A[i]})²`).join(' + ');
  return {tag:`Distance · ${dim}-D`,
    prompt:`Find the <b>distance</b> between A(${A.join(', ')}) and B(${B.join(', ')}). Round to the nearest hundredth (or give the exact radical).`,
    type:'expr',answer:d,tol:0.05,exact:`√${d2}`,
    solution:`<code>d = √[${terms}]</code> = <code>√${d2} = <span class="ans">${r2(d)}</span></code>`};
}

const gDistance2D=()=>gDistance(2);
const gDistance3D=()=>gDistance(3);

export { gDistance, gDistance2D, gDistance3D };
