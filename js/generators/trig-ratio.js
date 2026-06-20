import { pick, reduceFrac, r2 } from '../core/helpers.js';
import { svgTri } from '../svg/triangle.js';

const TRIPLES=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[9,40,41],[12,16,20],[10,24,26],[9,12,15]];
function gTrigRatio(mode){
  if(mode===undefined) mode=Math.random()<0.45?'all':'one';
  let t=pick(TRIPLES).slice();
  if(Math.random()<0.5) t=[t[1],t[0],t[2]];
  const [legA,legB,hyp]=t; // right angle at Y; legA=adjacent to angle at... define vertices
  // vertices: right angle Y=(0,0), X=(0,legB) up, Z=(legA,0) right
  const P={Y:[0,0],Z:[legA,0],X:[0,legB]};
  const at=pick(['X','Z']);
  // for angle at Z: opposite=legB(YX), adjacent=legA(YZ); for X: opposite=legA, adjacent=legB
  let opp,adj;
  if(at==='Z'){opp=legB;adj=legA;} else {opp=legA;adj=legB;}
  const dia=svgTri(P,{angles:[{at:'Y',right:true}],
    verts:[{at:'X',text:'X'},{at:'Y',text:'Y'},{at:'Z',text:'Z'}],
    sides:[{a:'Y',b:'X',text:String(legB)},{a:'Y',b:'Z',text:String(legA)},{a:'X',b:'Z',text:String(hyp)}]});
  // 'all': ask sin, cos and tan together (matches the quiz's six-ratio prompt)
  if(mode==='all'){
    const fS=reduceFrac(opp,hyp), fC=reduceFrac(adj,hyp), fT=reduceFrac(opp,adj);
    return {tag:'Trig ratio',
      prompt:`Find <b>sin ${at}</b>, <b>cos ${at}</b>, and <b>tan ${at}</b>. Give each as a fraction or a decimal.`,
      diagram:dia,type:'triple',answers:[opp/hyp,adj/hyp,opp/adj],tol:0.02,
      labels:[`sin ${at}`,`cos ${at}`,`tan ${at}`],
      solution:`<code>sin ${at} = opp/hyp = ${fS[0]}/${fS[1]} ≈ ${r2(opp/hyp)}</code><br>`
        +`<code>cos ${at} = adj/hyp = ${fC[0]}/${fC[1]} ≈ ${r2(adj/hyp)}</code><br>`
        +`<code>tan ${at} = opp/adj = ${fT[0]}/${fT[1]} ≈ ${r2(opp/adj)}</code>`};
  }
  const ratio=pick(['sin','cos','tan']);
  let val,frac;
  if(ratio==='sin'){val=opp/hyp;frac=reduceFrac(opp,hyp);}
  if(ratio==='cos'){val=adj/hyp;frac=reduceFrac(adj,hyp);}
  if(ratio==='tan'){val=opp/adj;frac=reduceFrac(opp,adj);}
  return {tag:'Trig ratio',
    prompt:`Find <b>${ratio} ${at}</b>. Give a fraction or decimal.`,
    diagram:dia,type:'expr',answer:val,tol:0.01,exact:`${frac[0]}/${frac[1]}`,
    solution:`${ratio.toUpperCase()} = ${ratio==='sin'?'opposite/hypotenuse':ratio==='cos'?'adjacent/hypotenuse':'opposite/adjacent'}. <code>${ratio} ${at} = ${ratio==='tan'?opp+'/'+adj:(ratio==='sin'?opp:adj)+'/'+hyp} = ${frac[0]}/${frac[1]} ≈ ${r2(val)}</code>`};
}

const gRatioAll=()=>gTrigRatio('all');
const gRatioOne=()=>gTrigRatio('one');

export { gTrigRatio, gRatioAll, gRatioOne };
