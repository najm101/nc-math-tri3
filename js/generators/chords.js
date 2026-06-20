import { ri, pick } from '../core/helpers.js';
import { svgChords } from '../svg/circle.js';

function gChords(variant){
  if(variant===undefined) variant=pick(['equidistant','congruent']);
  // Theorem: two chords are congruent  <=>  they are equidistant from the center.
  //   Variant 'equidistant': distances shown equal, chord LENGTHS are the two expressions.
  //   Variant 'congruent'  : chords marked congruent (ticks), the perpendicular DISTANCES are the two expressions.
  // Either way: set the two equal measures equal and solve.
  const x=ri(3,8);
  const c=ri(2,5), a=c+ri(1,4);          // a > c
  const d=ri(0,7);                        // constant on smaller-coef side (>=0)
  const b=d-(a-c)*x;                      // forces a*x+b = c*x+d  (b is negative)
  const fmt=(k,con)=> con===0?`${k}x`:(con>0?`${k}x + ${con}`:`${k}x − ${-con}`);
  const expr1=fmt(a,b), expr2=fmt(c,d);   // expr1 like "7x − 20", expr2 like "3x"
  const eq=`<code>${a}x ${b>=0?'+ '+b:'− '+(-b)} = ${c}x ${d>=0?'+ '+d:'− '+(-d)}</code> → <code>${a-c}x = ${d-b}</code> → <code>x = <span class="ans">${x}</span></code>`;
  if(variant==='equidistant'){
    const dist=ri(5,12);
    return {tag:'Arcs & chords',
      prompt:`The two chords are <b>equidistant</b> from the center, so they are congruent. Find <b>x</b>.`,
      diagram:svgChords({center:'P',chords:[
        {dir:-105,distLabel:''+dist,distSide:1,chordLabel:expr1,e1:'Q',e2:'R',markSide:1},
        {dir:65,  distLabel:''+dist,distSide:1,chordLabel:expr2,e1:'S',e2:'T',markSide:1}]}),
      given:`QR = ${expr1} · ST = ${expr2} · each chord is ${dist} from center P`,
      type:'num',answer:x,tol:0.01,unit:'',
      solution:`Chords equidistant from the center are congruent, so QR = ST. Set them equal: ${eq}`};
  }
  return {tag:'Arcs & chords',
    prompt:`The two chords are <b>congruent</b> (tick marks). The segments from the center are perpendicular to them. Find <b>x</b>.`,
    diagram:svgChords({center:'K',chords:[
      {dir:-105,distLabel:expr1,distSide:1,ticks:2,foot:'N',e1:'J',e2:'L',markSide:1},
      {dir:65,  distLabel:expr2,distSide:1,ticks:2,foot:'P',e1:'O',e2:'M',markSide:1}]}),
    given:`JL ≅ OM · KN = ${expr1} · KP = ${expr2}`,
    type:'num',answer:x,tol:0.01,unit:'',
    solution:`Congruent chords are equidistant from the center, so KN = KP. Set them equal: ${eq}`};
}

const gChordEqui=()=>gChords('equidistant');
const gChordCong=()=>gChords('congruent');

export { gChords, gChordEqui, gChordCong };
