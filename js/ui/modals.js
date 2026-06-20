import { $, r1 } from '../core/helpers.js';
import { renderFractions } from '../core/fractions.js';
import { svgSSA } from '../svg/ssa.js';

/* ---- SSA explorer modal ---- */
function ssaRender(){
  const A=+$('ssaA').value, c=+$('ssaC').value, a=+$('ssaa').value;
  $('ssaAv').textContent=A+'°'; $('ssaCv').textContent=r1(c); $('ssaAa').textContent=r1(a);
  const out=svgSSA(A,c,a,{w:360,h:250});
  $('ssaDiag').innerHTML=out.svg;
  const h=out.h, cmp = a<h ? `a &lt; h` : (Math.abs(a-h)<1e-6 ? `a = h` : (a<c ? `h &lt; a &lt; c` : `a ≥ c`));
  const word = out.count===0?'No triangle':out.count===1?'One triangle':'Two triangles';
  const color = out.count===0?'var(--bad)':out.count===2?'var(--blue-dk)':'var(--ok)';
  let reason;
  if(A>=90) reason = a>c ? `A is obtuse and a &gt; c, so the swing meets the base once.` : `A is obtuse and a ≤ c, so the swing never reaches the base ray.`;
  else if(a<h) reason = `The swinging side is shorter than the altitude, so its arc floats above the base.`;
  else if(Math.abs(a-h)<1e-6) reason = `The arc just touches the base — a single right triangle.`;
  else if(a<c) reason = `The arc crosses the base twice (both on the ray from A), so two triangles fit.`;
  else reason = `The arc crosses the base once on the ray from A (the other crossing is behind A).`;
  $('ssaRead').innerHTML=`<div class="ssa-count" style="color:${color}">${word} · ${out.count} solution${out.count===1?'':'s'}</div>`
    +`<div>h = c·sin A = ${r1(c)}·sin ${A}° = <b>${r1(h)}</b> &nbsp;·&nbsp; here <code>${cmp}</code></div>`
    +`<div style="margin-top:4px;color:var(--ink-soft)">${reason}</div>`;
}

/* wire the rules + SSA-explorer modals (called once at startup) */
function initModals(){
  // ---- formulas / rules modal ----
  $('navRules').onclick=()=>$('rulesModal').style.display='flex';
  $('rulesClose').onclick=()=>$('rulesModal').style.display='none';
  $('rulesModal').onclick=e=>{ if(e.target===$('rulesModal')) $('rulesModal').style.display='none'; };
  renderFractions($('rulesBody'));

  // ---- SSA explorer ----
  ['ssaA','ssaC','ssaa'].forEach(id=>$(id).addEventListener('input',ssaRender));
  document.querySelectorAll('.ssa-chip').forEach(ch=>ch.onclick=()=>{
    $('ssaA').value=ch.dataset.a; $('ssaC').value=ch.dataset.c; $('ssaa').value=ch.dataset.aa; ssaRender();
  });
  $('navSSA').onclick=()=>{ $('ssaModal').style.display='flex'; ssaRender(); };
  $('ssaClose').onclick=()=>$('ssaModal').style.display='none';
  $('ssaModal').onclick=e=>{ if(e.target===$('ssaModal')) $('ssaModal').style.display='none'; };
}

export { ssaRender, initModals };
