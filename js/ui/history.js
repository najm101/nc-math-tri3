import { $, escapeHtml } from '../core/helpers.js';
import { state, saveState } from '../core/state.js';
import { renderFractions } from '../core/fractions.js';
import { LESSONS } from '../registry.js';
import { updateStats } from './practice.js';
import { renderExamHistory, showExamStart } from './exam.js';

export let historyShown=false;

function updateHistCount(){
  $('histCount').textContent=state.history.length;
  const c=state.history.filter(h=>h.result==='correct').length;
  $('histSummary').textContent=state.history.length?`${state.history.length} solved · ${c} correct`:'Nothing solved yet';
  $('historyEmpty').style.display=state.history.length?'none':'block';
}
function renderHistory(){
  const list=$('historyList'); list.innerHTML='';
  for(let i=state.history.length-1;i>=0;i--){
    const h=state.history[i];
    const badge=h.result==='correct'?'<span class="hbadge ok">✓ Correct</span>'
      :h.result==='wrong'?'<span class="hbadge bad">✗ Incorrect</span>'
      :'<span class="hbadge info">Solution viewed</span>';
    const el=document.createElement('div'); el.className='hentry';
    el.innerHTML=`<div class="hhead"><span class="htag">${h.tag} · #${h.n}</span>${badge}</div>
      <div class="hprompt">${h.prompt}</div>
      ${h.diagram?`<div class="diagram hdiagram">${h.diagram}</div>`:''}
      ${h.given?`<div class="given">${h.given.replace(/·/g,'<b>·</b>')}</div>`:''}
      ${h.your?`<div class="hyour">Your answer: <b>${escapeHtml(h.your)}</b></div>`:''}
      <button class="hsol-btn">Show solution</button>
      <div class="hsol" style="display:none"><div class="sol">${h.solution}${h.exact?` &nbsp;<span style="color:var(--muted)">(exact: ${h.exact})</span>`:''}</div></div>`;
    const btn=el.querySelector('.hsol-btn'), sol=el.querySelector('.hsol');
    btn.onclick=()=>{const sh=sol.style.display==='none';sol.style.display=sh?'block':'none';btn.textContent=sh?'Hide solution':'Show solution';};
    list.appendChild(el);
    renderFractions(el);
  }
  renderDash();
}
/* ---- analysis dashboard: derive lesson stats from existing tags (no data-model change) ---- */
function tagToLesson(tag){
  const t=(tag||'').toLowerCase();
  if(t.includes('distance')||t.includes('midpoint')||t.includes('3-d')) return '4-3';
  if(t.includes('45-45-90')||t.includes('30-60-90')||t.includes('special')) return '4-4';
  if(t.includes('trig ratio')) return '4-5';
  if(t.includes('solve a side')||t.includes('soh')) return '4-5';
  if(t.includes('word problem')||t.includes('area of a triangle')) return '4-6';
  if(t.includes('ambiguous')||t.includes('law of sines')) return '4-7';
  if(t.includes('law of cosines')) return '4-8';
  if(t.includes('circumference')||t.includes('radius')||t.includes('diameter')) return '5-1';
  if(t.includes('arc measure')||t.includes('circle graph')||t.includes('arc length')||t.includes('radian')||t.includes('degree')) return '5-2';
  if(t.includes('chord')) return '5-3';
  return null;
}
function lessonTitleById(id){const L=LESSONS.find(l=>l.id===id);return L?L.title:id;}
function barColor(acc){ return acc>=0.8?'var(--ok)':acc>=0.5?'#C77F1A':'var(--bad)'; }
function renderDash(){
  const el=$('historyDash');
  const agg={};
  state.history.forEach(h=>{
    const L=tagToLesson(h.tag); if(!L) return;
    (agg[L]=agg[L]||{a:0,c:0}); agg[L].a++; if(h.result==='correct') agg[L].c++;
  });
  const rows=Object.keys(agg).map(L=>({L,a:agg[L].a,c:agg[L].c,acc:agg[L].c/agg[L].a}));
  if(!rows.length){ el.style.display='none'; return; }
  el.style.display='block';
  const enough=rows.filter(r=>r.a>=3);
  const ranked=(enough.length?enough:rows).slice().sort((x,y)=>y.acc-x.acc||y.a-x.a);
  const strong=ranked[0], weak=ranked[ranked.length-1];
  let cards=`<div class="dash-card good"><div class="dc-k">💪 Strongest</div>
      <div class="dc-v">${lessonTitleById(strong.L)}</div>
      <div class="dc-s">${Math.round(strong.acc*100)}% · ${strong.c}/${strong.a} correct</div></div>`;
  if(weak && weak.L!==strong.L && weak.acc<0.8){
    cards+=`<div class="dash-card warn"><div class="dc-k">📈 Needs improvement</div>
      <div class="dc-v">${lessonTitleById(weak.L)}</div>
      <div class="dc-s">${Math.round(weak.acc*100)}% · ${weak.c}/${weak.a} correct</div></div>`;
  } else {
    cards+=`<div class="dash-card flat"><div class="dc-k">🎯 Keep going</div>
      <div class="dc-v">${enough.length?'Solid across your practised lessons':'Answer a few more to spot weak areas'}</div>
      <div class="dc-s">${enough.length?'all ≥ 80% so far':'(need ≥3 per lesson)'}</div></div>`;
  }
  const bars=rows.slice().sort((x,y)=>x.acc-y.acc||y.a-x.a).map(r=>{
    const pct=Math.round(r.acc*100);
    return `<div class="dbar-row"><span class="dbar-name" title="${lessonTitleById(r.L)}">${r.L} ${lessonTitleById(r.L).split('· ')[1]||''}</span>
      <div class="dbar-track"><div class="dbar-fill" style="width:${pct}%;background:${barColor(r.acc)}"></div></div>
      <span class="dbar-pct">${pct}% (${r.c}/${r.a})</span></div>`;
  }).join('');
  el.innerHTML=`<div class="dash-title">Progress by lesson</div>
    <div class="dash-cards">${cards}</div>
    <div class="dash-note">Ranked weakest-first — focus on the red and amber bars.</div>
    ${bars}`;
}
function showPage(which){
  historyShown=(which==='history');
  const examP=(which==='exam');
  $('practicePage').style.display=(which==='practice')?'block':'none';
  $('historyPage').style.display=historyShown?'block':'none';
  $('examPage').style.display=examP?'block':'none';
  $('navPractice').classList.toggle('on',which==='practice');
  $('navHistory').classList.toggle('on',historyShown);
  $('navExam').classList.toggle('on',examP);
  if(historyShown){ renderHistory(); updateHistCount(); renderExamHistory(); }
  if(examP){ showExamStart(); }
  try{window.scrollTo(0,0);}catch(e){}
}
function resetHistory(){
  if(state.history.length===0 && state.attempted===0 && state.examHistory.length===0) return;
  if(!confirm('Clear your entire solved history, prep exams, and stats? This cannot be undone.')) return;
  state.history=[]; state.correct=0; state.attempted=0; state.qcount=0; state.streak=0; state.examHistory=[];
  saveState(); updateStats(); updateHistCount(); renderHistory(); renderExamHistory();
}

export { updateHistCount, renderHistory, renderDash, tagToLesson, lessonTitleById, barColor, showPage, resetHistory };
