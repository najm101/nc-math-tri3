import { $, escapeHtml } from '../core/helpers.js';
import { state, saveState } from '../core/state.js';
import { renderFractions } from '../core/fractions.js';
import { TOPICS, SUBTOPICS, parentTopicOf, leafName, leavesOf, topicGen } from '../registry.js';
import { buildAnswerInto, gradeAnswer } from './answer.js';
import { tagToLesson, lessonTitleById, barColor, showPage } from './history.js';
import { selectLesson, renderChips, syncToggleLabel, newQuestion } from './practice.js';

/* ============ Exam Prep mode ============ */
/* Ordered like the teacher's practice sheet. Entries may be SUBTOPIC leaf ids or parent
   topic ids. Leaf ids guarantee a specific variant; parent ids use that topic's normal
   random generator, matching the 32-question weighting from the original single-file app. */
const EXAM_BLUEPRINT=[
  {t:'dist-2d',n:1},{t:'dist-3d',n:1},{t:'mid-2d',n:1},{t:'mid-3d',n:1},          // 4-3
  {t:'special-4545',n:1},{t:'special-3060',n:1},                                  // 4-4
  {t:'ratio-all',n:1},{t:'ratio-one',n:1},
  {t:'side',n:2},{t:'findang',n:2},                                                // 4-5
  {t:'word-elev',n:1},{t:'word-depr',n:1},{t:'word-angle',n:1},{t:'area',n:3},     // 4-6
  {t:'sines',n:1},{t:'sineang',n:1},{t:'amb',n:2},                                 // 4-7
  {t:'cosines',n:2},                                                               // 4-8
  {t:'circ',n:1},{t:'rd',n:1},                                                     // 5-1
  {t:'arc',n:1},{t:'arcm',n:1},
  {t:'pie',n:1},{t:'d2r',n:1},{t:'r2d',n:1},                                      // 5-2
  {t:'chord',n:1},                                                                 // 5-3
];
/* Expand the curated blueprint into an ordered per-leaf list so the start-screen selector
   can offer subtopic granularity while keeping practice-sheet order. Already-leaf entries
   keep their curated count; parent-topic entries fan out to every variant (n:1 each) so
   selecting a whole topic still guarantees coverage of each subtopic. */
const EXAM_LEAVES=[];
EXAM_BLUEPRINT.forEach(({t,n})=>{
  if(SUBTOPICS[t]){ EXAM_LEAVES.push({id:t,n,topicId:SUBTOPICS[t].topicId}); return; }
  const topic=TOPICS.find(x=>x.id===t);
  if(!topic){ EXAM_LEAVES.push({id:t,n,topicId:t}); return; }
  const leaves=leavesOf(topic);
  leaves.forEach(s=>EXAM_LEAVES.push({id:s.id,n:leaves.length>1?1:n,topicId:topic.id}));
});
// in-memory selection of leaf ids that the next exam will cover (default: everything)
let examSel=new Set(EXAM_LEAVES.map(l=>l.id));
let miniExamNote='';

let examQs=[], examAns=[], examIdx=0, examStartTs=0, examTimer=null, examRunning=false;

function topicNameById(id){ return leafName(id); }
function fmtDuration(ms){
  const s=Math.max(0,Math.round(ms/1000)), m=Math.floor(s/60), ss=s%60;
  return m+':'+String(ss).padStart(2,'0');
}

// blueprint = the selected leaves, in canonical practice-sheet order
function selectedBlueprint(){
  return EXAM_LEAVES.filter(l=>examSel.has(l.id)).map(l=>({t:l.id,n:l.n}));
}

function buildExam(){
  examQs=[]; examAns=[];
  selectedBlueprint().forEach(({t,n})=>{
    const sub=SUBTOPICS[t];
    const topic=TOPICS.find(x=>x.id===t);
    const gen=sub ? sub.gen : topic ? topicGen(topic) : null;
    if(!gen) return;
    for(let i=0;i<n;i++){ const qq=gen(); qq._topic=t; examQs.push(qq); }
  });
  examIdx=0; examStartTs=Date.now();
}

// Param-free so it stays safe as a direct click handler (examStartBtn/examRetakeBtn).
function startExam(){
  buildExam();
  if(!examQs.length) return;       // nothing selected — Start is disabled, but guard anyway
  examRunning=true;
  document.body.classList.add('exam-running');
  $('examStart').style.display='none';
  $('examResults').style.display='none';
  $('examRun').style.display='flex';
  startExamTimer();
  renderExamQuestion();
  try{window.scrollTo(0,0);}catch(e){}
}

// Mini-exam = a normal exam with the weak topics/subtopics preselected on the start screen.
// Routing through showPage('exam') (not a direct launch) is what fixes the blank-page bug.
function startMiniExam(ids){
  if(!ids || !ids.length) return;
  const valid=new Set(EXAM_LEAVES.map(l=>l.id));
  const leaves=new Set();
  ids.forEach(id=>{
    if(SUBTOPICS[id]){ if(valid.has(id)) leaves.add(id); return; }
    const topic=TOPICS.find(x=>x.id===id);   // older records may tag a parent topic id
    if(topic) leavesOf(topic).forEach(s=>{ if(valid.has(s.id)) leaves.add(s.id); });
  });
  if(!leaves.size) return;
  examSel=leaves;
  miniExamNote='Mini-exam — your weak topics are preselected. Adjust below or press Start.';
  showPage('exam');                // → showExamStart() renders the selector + count
}

function startExamTimer(){ stopExamTimer(); tickExamTimer(); examTimer=setInterval(tickExamTimer,1000); }
function stopExamTimer(){ if(examTimer){clearInterval(examTimer);examTimer=null;} }
function tickExamTimer(){ $('examTimer').textContent=fmtDuration(Date.now()-examStartTs); }

function renderExamQuestion(){
  const qx=examQs[examIdx], total=examQs.length;
  const lessonId=tagToLesson(qx.tag);
  $('examSection').textContent=lessonId?lessonTitleById(lessonId).replace('· ','· '):'';
  $('examTag').textContent=qx.tag;
  $('examProgressText').textContent='Question '+(examIdx+1)+' / '+total;
  $('examProgressFill').style.width=Math.round(examIdx/total*100)+'%';
  $('examPrompt').innerHTML=qx.prompt; renderFractions($('examPrompt'));
  $('examDiagram').innerHTML=qx.diagram||''; $('examDiagram').style.display=qx.diagram?'flex':'none';
  if(qx.given){$('examGiven').style.display='block';$('examGiven').innerHTML=qx.given.replace(/·/g,'<b>·</b>');renderFractions($('examGiven'));}
  else $('examGiven').style.display='none';
  buildAnswerInto(qx, $('examAnswerArea'), examNext);
  $('examNextBtn').textContent=(examIdx===total-1)?'Finish exam':'Next →';
}

function examNext(){
  examAns[examIdx]=gradeAnswer(examQs[examIdx], $('examAnswerArea'));
  if(examIdx<examQs.length-1){ examIdx++; renderExamQuestion(); try{window.scrollTo(0,0);}catch(e){} }
  else finishExam();
}

function buildExamRecord(){
  const results=examQs.map((qx,i)=>({
    topic:qx._topic||null, tag:qx.tag, prompt:qx.prompt, given:qx.given||'', diagram:qx.diagram||'',
    solution:qx.solution, exact:qx.exact||'',
    your:(examAns[i]&&examAns[i].your)||'',
    result:(examAns[i]&&examAns[i].ok)?'correct':'wrong'
  }));
  const correctN=results.filter(r=>r.result==='correct').length;
  return {id:'ex'+Date.now(), ts:Date.now(), durationMs:Date.now()-examStartTs,
    total:results.length, correct:correctN, results};
}

function finishExam(){
  stopExamTimer();
  const rec=buildExamRecord();
  state.examHistory.push(rec);
  saveState();
  examRunning=false;
  document.body.classList.remove('exam-running');
  $('examRun').style.display='none';
  $('examStart').style.display='none';
  $('examResults').style.display='block';
  renderExamResults(rec);
  try{window.scrollTo(0,0);}catch(e){}
}

function exitExam(){
  if(examRunning && !confirm('Leave this exam? Your progress will be discarded.')) return;
  stopExamTimer();
  examRunning=false;
  document.body.classList.remove('exam-running');
  showExamStart();
}

// refresh selected-count, Start-enabled state, and chip .on classes from examSel
function syncExamSel(){
  const n=EXAM_LEAVES.filter(l=>examSel.has(l.id)).reduce((s,l)=>s+l.n,0);
  $('examCount').textContent=n;
  $('examStartBtn').disabled=(n===0);
  const tog=$('examSelToggle');
  if(tog) tog.textContent=EXAM_LEAVES.every(l=>examSel.has(l.id))?'Clear all':'Select all';
  const sel=$('examTopicSel'); if(!sel) return;
  sel.querySelectorAll('.chip[data-leaf]').forEach(c=>c.classList.toggle('on',examSel.has(c.dataset.leaf)));
  sel.querySelectorAll('.chip[data-topic]').forEach(c=>{
    const leaves=(c.dataset.leaves||'').split(',').filter(Boolean);
    const all=leaves.length && leaves.every(id=>examSel.has(id));
    const some=leaves.some(id=>examSel.has(id));
    c.classList.toggle('on',all);
    c.classList.toggle('part',some && !all);
  });
}

function renderExamSel(){
  const sel=$('examTopicSel'); if(!sel) return;
  sel.innerHTML='';
  // group EXAM_LEAVES by topic, preserving practice-sheet order
  const order=[], byTopic={};
  EXAM_LEAVES.forEach(l=>{ if(!byTopic[l.topicId]){byTopic[l.topicId]=[];order.push(l.topicId);} byTopic[l.topicId].push(l); });
  order.forEach(tid=>{
    const leaves=byTopic[tid];
    const topic=TOPICS.find(x=>x.id===tid);
    const group=document.createElement('div'); group.className='exam-topicgroup';
    const head=document.createElement('div'); head.className='chip'; head.dataset.topic=tid;
    head.dataset.leaves=leaves.map(l=>l.id).join(',');
    head.textContent=topic?topic.name:tid;
    head.onclick=()=>{
      const all=leaves.every(l=>examSel.has(l.id));
      leaves.forEach(l=>{ if(all) examSel.delete(l.id); else examSel.add(l.id); });
      syncExamSel();
    };
    group.appendChild(head);
    if(leaves.length>1){
      const subs=document.createElement('div'); subs.className='exam-subchips';
      leaves.forEach(l=>{
        const c=document.createElement('div'); c.className='chip sub'; c.dataset.leaf=l.id;
        c.textContent=(leafName(l.id).split('· ')[1]||leafName(l.id));
        c.onclick=()=>{ if(examSel.has(l.id)) examSel.delete(l.id); else examSel.add(l.id); syncExamSel(); };
        subs.appendChild(c);
      });
      group.appendChild(subs);
    }
    sel.appendChild(group);
  });
  syncExamSel();
}

function showExamStart(){
  $('examStart').style.display='block';
  $('examRun').style.display='none';
  $('examResults').style.display='none';
  const note=$('examSelNote');
  if(note){ note.textContent=miniExamNote; note.style.display=miniExamNote?'block':'none'; }
  miniExamNote='';
  renderExamSel();
  const last=state.examHistory[state.examHistory.length-1];
  $('examLast').innerHTML = last
    ? `Last exam: <b>${last.correct}/${last.total}</b> (${Math.round(last.correct/last.total*100)}%) · ${fmtDuration(last.durationMs)} · ${new Date(last.ts).toLocaleDateString()}`
    : 'No exams taken yet — this will be your first.';
}

/* ---- analysis: score + what to practise next ---- */
function analyzeExam(results){
  const byTopic={};
  results.forEach(r=>{
    const key=r.topic||r.tag;
    const o=byTopic[key]||(byTopic[key]={topic:r.topic||null,tag:r.tag,a:0,c:0});
    o.a++; if(r.result==='correct')o.c++;
  });
  const topics=Object.values(byTopic);
  const weak=topics.filter(o=>o.c<o.a).sort((x,y)=>(x.c/x.a)-(y.c/y.a)||y.a-x.a);
  const strong=topics.filter(o=>o.c===o.a);
  const correct=results.filter(r=>r.result==='correct').length;
  const total=results.length, pct=total?correct/total:0;
  const byL={};
  results.forEach(r=>{const L=tagToLesson(r.tag);if(!L)return;(byL[L]=byL[L]||{a:0,c:0});byL[L].a++;if(r.result==='correct')byL[L].c++;});
  const lessons=Object.keys(byL).map(L=>({L,a:byL[L].a,c:byL[L].c,acc:byL[L].c/byL[L].a}));
  return {correct,total,pct,weak,strong,lessons};
}

function renderExamAnalysis(container, results){
  const A=analyzeExam(results);
  const pct=Math.round(A.pct*100);
  const verdict = A.pct>=0.85?{t:'Exam-ready 🎉',c:'good'}
    : A.pct>=0.6?{t:'Almost there — tighten a few areas',c:'flat'}
    : {t:'Keep practising — focus on the list below',c:'warn'};
  const weakIds = A.weak.filter(o=>o.topic).map(o=>o.topic);
  const weakHtml = A.weak.length
    ? A.weak.map(o=>{
        const name=o.topic?topicNameById(o.topic):o.tag;
        const jump=o.topic?`<button class="exam-practice" data-topic="${o.topic}">Practice this →</button>`:'';
        return `<div class="exam-weak-row"><span class="exam-weak-name">${name}</span>
          <span class="exam-weak-score">${o.c}/${o.a}</span>${jump}</div>`;
      }).join('')
    : `<div class="exam-allgood">Nothing missed — every topic correct! 🟢</div>`;
  const miniBtn = weakIds.length
    ? `<button class="exam-minibtn" type="button">Start mini-exam on these (${weakIds.length} topics · ${weakIds.length*2} Qs) →</button>`
    : '';
  const strongHtml = A.strong.length
    ? A.strong.map(o=>`<span class="exam-strong-chip">${o.topic?topicNameById(o.topic):o.tag}</span>`).join('')
    : '<span class="exam-muted">— none yet</span>';
  const bars = A.lessons.slice().sort((x,y)=>x.acc-y.acc||y.a-x.a).map(r=>{
    const p=Math.round(r.acc*100);
    return `<div class="dbar-row"><span class="dbar-name" title="${lessonTitleById(r.L)}">${r.L} ${(lessonTitleById(r.L).split('· ')[1]||'')}</span>
      <div class="dbar-track"><div class="dbar-fill" style="width:${p}%;background:${barColor(r.acc)}"></div></div>
      <span class="dbar-pct">${p}% (${r.c}/${r.a})</span></div>`;
  }).join('');
  container.innerHTML=`
    <div class="exam-verdict ${verdict.c}">${verdict.t} · ${A.correct}/${A.total} (${pct}%)</div>
    <div class="exam-analysis-grid">
      <div class="exam-an-card warn"><div class="exam-an-k">🔴 Needs more practice</div>${weakHtml}${miniBtn}</div>
      <div class="exam-an-card good"><div class="exam-an-k">💪 Strong</div><div class="exam-strong-wrap">${strongHtml}</div></div>
    </div>
    <div class="dash-title" style="margin-top:12px;font-family:'Fraunces',sans-serif;font-weight:700">Progress by lesson</div>${bars}`;
  container.querySelectorAll('.exam-practice').forEach(b=>{ b.onclick=()=>practiceTopic(b.dataset.topic); });
  const mb=container.querySelector('.exam-minibtn'); if(mb) mb.onclick=()=>startMiniExam(weakIds);
}

function practiceTopic(id){
  // analysis rows carry leaf ids; Practice chips are topic-level, so jump to the parent
  selectLesson('all');
  state.active.clear(); state.active.add(parentTopicOf(id));
  renderChips(); syncToggleLabel();
  showPage('practice');
  newQuestion();
}

function renderReviewList(container, results){
  container.innerHTML='';
  results.forEach((h,i)=>{
    const badge=h.result==='correct'?'<span class="hbadge ok">✓ Correct</span>':'<span class="hbadge bad">✗ Incorrect</span>';
    const el=document.createElement('div'); el.className='hentry';
    el.innerHTML=`<div class="hhead"><span class="htag">${h.tag} · #${i+1}</span>${badge}</div>
      <div class="hprompt">${h.prompt}</div>
      ${h.diagram?`<div class="diagram hdiagram">${h.diagram}</div>`:''}
      ${h.given?`<div class="given">${h.given.replace(/·/g,'<b>·</b>')}</div>`:''}
      <div class="hyour">Your answer: <b>${h.your?escapeHtml(h.your):'(blank)'}</b></div>
      <button class="hsol-btn">Show solution</button>
      <div class="hsol" style="display:none"><div class="sol">${h.solution}${h.exact?` &nbsp;<span style="color:var(--muted)">(exact: ${h.exact})</span>`:''}</div></div>`;
    const btn=el.querySelector('.hsol-btn'), sol=el.querySelector('.hsol');
    btn.onclick=()=>{const sh=sol.style.display==='none';sol.style.display=sh?'block':'none';btn.textContent=sh?'Hide solution':'Show solution';};
    container.appendChild(el);
    renderFractions(el);
  });
}

function renderExamResults(rec){
  $('examScore').innerHTML=`${rec.correct}<small> / ${rec.total}</small>`;
  $('examScorePct').textContent=Math.round(rec.correct/rec.total*100)+'%';
  $('examScoreTime').textContent=fmtDuration(rec.durationMs);
  renderExamAnalysis($('examAnalysis'), rec.results);
  renderReviewList($('examReview'), rec.results);
}

function renderExamHistory(){
  const wrap=$('examHistoryList'); if(!wrap) return;
  wrap.innerHTML='';
  $('examHistEmpty').style.display=state.examHistory.length?'none':'block';
  for(let i=state.examHistory.length-1;i>=0;i--){
    const e=state.examHistory[i];
    const pct=Math.round(e.correct/e.total*100);
    const d=new Date(e.ts);
    const card=document.createElement('div'); card.className='exam-card';
    card.innerHTML=`<div class="exam-card-head">
        <div><div class="exam-card-score">${e.correct} / ${e.total}<span class="exam-card-pct" style="color:${barColor(e.correct/e.total)}">${pct}%</span></div>
        <div class="exam-card-meta">${d.toLocaleDateString()} ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · ${fmtDuration(e.durationMs)}</div></div>
        <button class="exam-card-toggle">Review ▾</button></div>
      <div class="exam-card-body" style="display:none"></div>`;
    const toggle=card.querySelector('.exam-card-toggle'), body=card.querySelector('.exam-card-body');
    let built=false;
    toggle.onclick=()=>{
      const sh=body.style.display==='none';
      body.style.display=sh?'block':'none';
      toggle.textContent=sh?'Hide ▴':'Review ▾';
      if(sh && !built){
        const an=document.createElement('div'); an.className='dash'; body.appendChild(an);
        renderExamAnalysis(an, e.results);
        const rev=document.createElement('div'); body.appendChild(rev);
        renderReviewList(rev, e.results);
        built=true;
      }
    };
    wrap.appendChild(card);
  }
}

// select-all / clear for the start-screen selector (mirrors the practice page toggle)
(function wireExamSelToggle(){
  const btn=$('examSelToggle'); if(!btn) return;
  btn.onclick=()=>{
    const all=EXAM_LEAVES.every(l=>examSel.has(l.id));
    examSel = all ? new Set() : new Set(EXAM_LEAVES.map(l=>l.id));
    syncExamSel();
  };
})();

function isExamRunning(){ return examRunning; }
export { startExam, examNext, exitExam, showExamStart, renderExamHistory, isExamRunning };
