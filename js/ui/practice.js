import { $, pick } from '../core/helpers.js';
import { state, saveState } from '../core/state.js';
import { renderFractions } from '../core/fractions.js';
import { TOPICS, LESSONS, lessonTopics, topicGen } from '../registry.js';
import { buildAnswerInto, gradeAnswer } from './answer.js';
import { updateHistCount, renderHistory, historyShown } from './history.js';

let q=null, answered=false, choiceSel=-1, recorded=false;
let currentLesson='all';

const chipsEl=$('chips'), promptEl=$('prompt'), diagEl=$('diagram'),
  givenEl=$('given'), ansArea=$('answerArea'), fb=$('feedback'),
  tagEl=$('qtag'), numEl=$('qnum');
/* lesson tabs */
const tabsEl=$('lessonTabs');
LESSONS.forEach(L=>{
  const b=document.createElement('button');
  b.className='ltab'+(L.id==='all'?' on':'');
  b.textContent=L.tab; b.dataset.id=L.id; b.title=L.title;
  b.onclick=()=>selectLesson(L.id);
  tabsEl.appendChild(b);
});
function selectLesson(id){
  currentLesson=id;
  [...tabsEl.children].forEach(b=>b.classList.toggle('on',b.dataset.id===id));
  const ids=lessonTopics(id);
  state.active.clear(); ids.forEach(i=>state.active.add(i));
  $('lessonTitle').textContent=(LESSONS.find(l=>l.id===id)||{}).title||'Topics';
  renderChips(); syncToggleLabel();
  newQuestion();
}
/* build chips for the current lesson */
function renderChips(){
  chipsEl.innerHTML='';
  lessonTopics(currentLesson).forEach(id=>{
    const t=TOPICS.find(x=>x.id===id); if(!t) return;
    const c=document.createElement('div');
    c.className='chip'+(state.active.has(t.id)?' on':'');
    c.textContent=t.name; c.dataset.id=t.id;
    c.onclick=()=>{
      if(state.active.has(t.id)){ if(state.active.size>1){state.active.delete(t.id);c.classList.remove('on');} }
      else{ state.active.add(t.id); c.classList.add('on'); }
      syncToggleLabel();
    };
    chipsEl.appendChild(c);
  });
}
function syncToggleLabel(){
  const vis=lessonTopics(currentLesson);
  $('toggleAll').textContent= vis.every(id=>state.active.has(id))?'Clear all':'Select all';
}
$('toggleAll').onclick=()=>{
  const vis=lessonTopics(currentLesson);
  if(vis.every(id=>state.active.has(id))){ vis.forEach(id=>state.active.delete(id)); state.active.add(vis[0]); }
  else { vis.forEach(id=>state.active.add(id)); }
  renderChips(); syncToggleLabel();
};

/* render */
function newQuestion(){
  answered=false;choiceSel=-1;recorded=false;
  let pool=TOPICS.filter(t=>state.active.has(t.id));
  if(!pool.length) pool=TOPICS.filter(t=>lessonTopics(currentLesson).includes(t.id));
  if(!pool.length) pool=TOPICS;
  const t=pick(pool);
  q=topicGen(t)();
  state.qcount++;
  tagEl.textContent=q.tag;
  numEl.textContent='#'+state.qcount;
  promptEl.innerHTML=q.prompt;
  renderFractions(promptEl);
  diagEl.innerHTML=q.diagram||'';
  diagEl.style.display=q.diagram?'flex':'none';
  if(q.given){givenEl.style.display='block';givenEl.innerHTML=q.given.replace(/·/g,'<b>·</b>');renderFractions(givenEl);}
  else givenEl.style.display='none';
  fb.className='feedback';fb.innerHTML='';
  $('checkBtn').disabled=false;$('solBtn').disabled=false;
  buildAnswer();
  saveState();
}
function buildAnswer(){ buildAnswerInto(q, ansArea, check); }

function check(){
  if(answered)return;
  if(q.type==='choice' && (ansArea.dataset.sel===''||ansArea.dataset.sel==null)){flash('Pick an option first.');return;}
  const {ok,your}=gradeAnswer(q, ansArea);
  if(q.type==='choice'){
    const sel=parseInt(ansArea.dataset.sel,10);
    ansArea.querySelectorAll('.choice').forEach((c,i)=>{
      c.classList.remove('sel');
      if(i===q.answerIndex)c.classList.add('right');else if(i===sel)c.classList.add('wrong');
    });
  }
  ansArea.dataset.locked='1';
  answered=true;state.attempted++;
  if(ok){state.correct++;state.streak++;} else state.streak=0;
  updateStats();
  $('checkBtn').disabled=true;
  showFeedback(ok,your);
  recordCurrent(ok?'correct':'wrong', your);
}

function flash(msg){
  fb.className='feedback info show';
  fb.innerHTML=`<div class="fb-title">↳ ${msg}</div>`;
  setTimeout(()=>{if(!answered)fb.className='feedback';},1400);
}

function showFeedback(ok,your){
  let exactNote='';
  if(q.exact) exactNote=` &nbsp;<span style="color:var(--muted)">(exact: ${q.exact})</span>`;
  fb.className='feedback show '+(ok?'ok':'bad');
  const title=ok?'✓ Correct':'✗ Not quite';
  fb.innerHTML=`<div class="fb-title">${title}</div>
    <div class="sol"><div class="step">Worked solution:</div>${q.solution}${exactNote}</div>`;
  renderFractions(fb);
}

function showSolution(){
  if(!answered){answered=true;state.attempted++;state.streak=0;updateStats();$('checkBtn').disabled=true;
    if(q.type==='choice'){const ch=ansArea.querySelectorAll('.choice');ch.forEach((c,i)=>{if(i===q.answerIndex)c.classList.add('right');});}
    recordCurrent('revealed','');}
  let exactNote=q.exact?` &nbsp;<span style="color:var(--muted)">(exact: ${q.exact})</span>`:'';
  fb.className='feedback show info';
  fb.innerHTML=`<div class="fb-title">↳ Solution</div><div class="sol">${q.solution}${exactNote}</div>`;
  renderFractions(fb);
}

function updateStats(){
  $('stCorrect').innerHTML=`${state.correct}<small> / ${state.attempted}</small>`;
  $('stAcc').textContent=state.attempted?Math.round(state.correct/state.attempted*100)+'%':'—';
  $('stStreak').textContent=state.streak;
}
/* ---------- history ---------- */
function recordCurrent(result, your){
  if(recorded||!q) return;
  recorded=true;
  state.history.push({n:state.qcount,tag:q.tag,ts:Date.now(),prompt:q.prompt,given:q.given||'',
    diagram:q.diagram||'',solution:q.solution,exact:q.exact||'',your:your||'',result:result});
  saveState(); updateHistCount();
  if(historyShown) renderHistory();
}

export { selectLesson, renderChips, syncToggleLabel, newQuestion, check, showSolution, updateStats };
