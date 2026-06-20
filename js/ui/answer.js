import { within, reduceFrac, r2 } from '../core/helpers.js';
import { evalExpr } from '../core/expr.js';

/* Build the input UI for a question inside an arbitrary container (container-scoped,
   class-based) so both Practice and Exam mode can reuse it. onEnter (optional) fires when
   the user presses Enter in a text field. */
function buildAnswerInto(qObj, container, onEnter){
  container.innerHTML='';
  container.dataset.sel='';
  delete container.dataset.locked;
  const enter=e=>{if(e.key==='Enter'&&onEnter)onEnter();};
  if(qObj.type==='num'||qObj.type==='expr'){
    const row=document.createElement('div');row.className='answer-row';
    row.innerHTML=`<div class="field"><label>YOUR ANSWER</label>
      <input type="text" class="ans-input" inputmode="text" autocomplete="off" placeholder="${qObj.type==='expr'?'e.g. 3√2 or 4.24':'type a number'}"></div>
      ${qObj.unit?`<span class="unit">${qObj.unit}</span>`:''}`;
    container.appendChild(row);
    if(qObj.type==='expr'){const h=document.createElement('div');h.className='hint-radical';
      h.textContent='Exact forms accepted: type √ as "sqrt" if needed, e.g. 4sqrt15';container.appendChild(h);}
    const inp=container.querySelector('.ans-input');inp.addEventListener('keydown',enter);inp.focus();
  } else if(qObj.type==='frac'){
    const wrap=document.createElement('div');wrap.className='frac';
    wrap.innerHTML=`<div class="field" style="max-width:130px"><label>NUMERATOR</label><input type="text" class="frac-num" inputmode="numeric" placeholder="n"></div>
      <span class="bar">π /</span>
      <div class="field" style="max-width:130px"><label>DENOMINATOR</label><input type="text" class="frac-den" inputmode="numeric" placeholder="d"></div>`;
    container.appendChild(wrap);
    container.querySelectorAll('.frac-num,.frac-den').forEach(i=>i.addEventListener('keydown',enter));
    container.querySelector('.frac-num').focus();
  } else if(qObj.type==='triple'){
    const wrap=document.createElement('div');wrap.className='triple';
    wrap.innerHTML=qObj.labels.map((l,i)=>`<div class="field"><label>${l.toUpperCase()}</label><input type="text" class="triple-input" data-i="${i}" inputmode="text" placeholder="${l}"></div>`).join('');
    container.appendChild(wrap);
    container.querySelectorAll('.triple-input').forEach(i=>i.addEventListener('keydown',enter));
    container.querySelector('.triple-input').focus();
  } else if(qObj.type==='choice'){
    const wrap=document.createElement('div');wrap.className='choices';
    qObj.options.forEach((o,i)=>{
      const b=document.createElement('div');b.className='choice';b.textContent=o;
      b.onclick=()=>{if(container.dataset.locked)return;container.dataset.sel=i;[...wrap.children].forEach(c=>c.classList.remove('sel'));b.classList.add('sel');};
      wrap.appendChild(b);
    });
    container.appendChild(wrap);
  }
}

/* Grade the answer currently typed into container. Pure: returns {ok, your}, no DOM/state change. */
function gradeAnswer(qObj, container){
  let ok=false, your='';
  if(qObj.type==='num'||qObj.type==='expr'){
    const raw=container.querySelector('.ans-input').value;your=raw;
    ok=within(evalExpr(raw),qObj.answer,qObj.tol);
  } else if(qObj.type==='frac'){
    const n=parseInt(container.querySelector('.frac-num').value,10),d=parseInt(container.querySelector('.frac-den').value,10);
    your=`${n}π/${d}`;
    if(!isNaN(n)&&!isNaN(d)&&d!==0){const[rn,rd]=reduceFrac(n,d);const[an,ad]=reduceFrac(qObj.num,qObj.den);ok=(rn===an&&rd===ad);}
  } else if(qObj.type==='triple'){
    ok=true;const vals=[];
    qObj.answers.forEach((a,i)=>{const t=(qObj.tols&&qObj.tols[i]!=null)?qObj.tols[i]:qObj.tol;const v=evalExpr(container.querySelector('.triple-input[data-i="'+i+'"]').value);vals.push(v);if(!within(v,a,t))ok=false;});
    your=`(${vals.map(v=>isNaN(v)?'?':r2(v)).join(', ')})`;
  } else if(qObj.type==='choice'){
    const sel=container.dataset.sel===''?-1:parseInt(container.dataset.sel,10);
    ok=(sel===qObj.answerIndex);your=sel<0?'':qObj.options[sel];
  }
  return {ok,your};
}

export { buildAnswerInto, gradeAnswer };
