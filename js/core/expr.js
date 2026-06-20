/* expression parser: handles arithmetic, parentheses, sqrt and pi */
function evalExpr(str){
  if(str==null) return NaN;
  let s=String(str).trim().toLowerCase();
  if(s==='') return NaN;
  s=s.replace(/π/g,'pi').replace(/×/g,'*').replace(/÷/g,'/');
  if(!/^[0-9+\-*/.()√\sa-z]*$/.test(s)) return NaN;
  s=s.replace(/sqrt/g,'√').replace(/root/g,'√');
  s=s.replace(/pi/g,'('+Math.PI+')');
  s=s.replace(/√\s*\(/g,'Math.sqrt(');
  s=s.replace(/√\s*([0-9]*\.?[0-9]+)/g,'Math.sqrt($1)');
  s=s.replace(/([0-9)\]])\s*(Math\.sqrt|\()/g,'$1*$2');
  const test=s.replace(/Math\.sqrt/g,'');
  if(/[a-z]/i.test(test)) return NaN;
  try{
    const v=Function('"use strict";return ('+s+')')();
    return (typeof v==='number'&&isFinite(v))?v:NaN;
  }catch(e){return NaN;}
}

export { evalExpr };
