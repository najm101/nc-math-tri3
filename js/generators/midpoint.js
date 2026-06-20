import { pt, pick } from '../core/helpers.js';

function gMidpoint(dim){
  if(dim===undefined) dim=pick([2,2,3]);
  let A=pt(dim),B=pt(dim);
  // for 2-D, force at least one odd coordinate-sum so the answer involves a fraction / decimal
  if(dim===2 && (A[0]+B[0])%2===0 && (A[1]+B[1])%2===0){ B[0]+= (B[0]<8?1:-1); }
  const M=A.map((_,i)=>(A[i]+B[i])/2);
  const labels=['x','y','z'].slice(0,dim);
  const terms=A.map((_,i)=>`(${A[i]}+${B[i]})/2`).join(', ');
  return {tag:`Midpoint · ${dim}-D`,
    prompt:`Find the <b>midpoint</b> between A(${A.join(', ')}) and B(${B.join(', ')}).${dim===2?' Write each coordinate as a fraction or a decimal rounded to the hundredths place.':''}`,
    type:'triple',answers:M,tol:0.06,labels:labels,
    solution:`Average each coordinate: <code>M = (${terms}) = (${M.join(', ')})</code>`};
}

const gMidpoint2D=()=>gMidpoint(2);
const gMidpoint3D=()=>gMidpoint(3);

export { gMidpoint, gMidpoint2D, gMidpoint3D };
