import { ri, pick, r2, R2 } from '../core/helpers.js';
import { svgTri } from '../svg/triangle.js';

function gSpecial(is45){
  if(is45===undefined) is45=Math.random()<0.5;
  if(is45){
    const findHyp=Math.random()<0.5;
    if(findHyp){
      const L=ri(3,12);const hyp=L*R2;
      const P={B:[0,0],A:[1,0],C:[0,1]};
      const dia=svgTri(P,{verts:[{at:'B',text:''}],angles:[{at:'B',right:true},{at:'A',text:'45°'}],
        sides:[{a:'B',b:'A',text:''},{a:'B',b:'C',text:String(L)},{a:'A',b:'C',text:'x'}]});
      return {tag:'45-45-90 triangle',prompt:`Find <b>x</b>. Leave your answer as a radical in simplest form.`,
        diagram:dia,type:'expr',answer:hyp,tol:0.03,exact:`${L}√2`,
        solution:`In a 45-45-90, hypotenuse = leg × √2. <code>x = ${L}√2 ≈ ${r2(hyp)}</code>`};
    } else {
      const h=pick([6,8,10,12,14]);const leg=h/R2;
      const P={B:[0,0],A:[1,0],C:[0,1]};
      const dia=svgTri(P,{angles:[{at:'B',right:true},{at:'A',text:'45°'}],
        sides:[{a:'B',b:'A',text:'x'},{a:'A',b:'C',text:String(h)},{a:'B',b:'C',text:''}]});
      return {tag:'45-45-90 triangle',prompt:`Find <b>x</b> (a leg). Leave your answer as a radical in simplest form.`,
        diagram:dia,type:'expr',answer:leg,tol:0.03,exact:`${h/2}√2`,
        solution:`leg = hypotenuse ÷ √2 = ${h}/√2 = <code>${h/2}√2 ≈ ${r2(leg)}</code>`};
    }
  } else {
    const s=ri(3,10);const short=s,long=s*Math.sqrt(3),hyp=2*s;
    const variant=pick(['shortToHyp','shortToLong','hypToLong','longToShort']);
    // 30-60-90: short opp 30, long opp 60, hyp opp 90. right angle between short&long.
    const P={B:[0,0],A:[Math.sqrt(3),0],C:[0,1]}; // B right angle, A has 30°, C has 60°
    let label={short:'',long:'',hyp:''},answer,exact,ask;
    if(variant==='shortToHyp'){label.short=String(short);ask='hyp';answer=hyp;exact=String(hyp);}
    if(variant==='shortToLong'){label.short=String(short);ask='long';answer=long;exact=`${short}√3`;}
    if(variant==='hypToLong'){label.hyp=String(hyp);ask='long';answer=long;exact=`${s}√3`;}
    if(variant==='longToShort'){label.long=`${short}√3`;ask='short';answer=short;exact=String(short);}
    label[ask]='x';
    const dia=svgTri(P,{angles:[{at:'B',right:true},{at:'A',text:'30°'},{at:'C',text:'60°'}],
      sides:[{a:'B',b:'C',text:label.short},{a:'B',b:'A',text:label.long},{a:'A',b:'C',text:label.hyp}]});
    const expl={
      shortToHyp:`hyp = 2 × short side = <code>2 × ${short} = ${hyp}</code>`,
      shortToLong:`long = short × √3 = <code>${short}√3 ≈ ${r2(long)}</code>`,
      hypToLong:`short = hyp ÷ 2 = ${s}; long = short × √3 = <code>${s}√3 ≈ ${r2(long)}</code>`,
      longToShort:`short = long ÷ √3 = <code>${short}√3 ÷ √3 = ${short}</code>`
    }[variant];
    return {tag:'30-60-90 triangle',prompt:`Find <b>x</b>. Leave your answer as a radical in simplest form.`,
      diagram:dia,type:'expr',answer:answer,tol:0.03,exact:exact,
      solution:`Sides are in ratio short : short√3 : 2·short (opposite 30° : 60° : 90°). ${expl}`};
  }
}

const gSpecial45=()=>gSpecial(true);
const gSpecial3060=()=>gSpecial(false);

export { gSpecial, gSpecial45, gSpecial3060 };
