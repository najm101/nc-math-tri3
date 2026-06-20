/* ============================================================================
   Tri.3 Practice Lab — composition root.
   Imports every module, wires the DOM event handlers, and runs the bootstrap.
   Loaded once via <script type="module" src="js/main.js"> (after the DOM is
   parsed, since module scripts are deferred). Native ES modules need to be
   served over HTTP — open via GitHub Pages or a local server, not file://.
   ============================================================================ */
import { $ } from './core/helpers.js';
import { loadState } from './core/state.js';
import { selectLesson, newQuestion, check, showSolution, updateStats } from './ui/practice.js';
import { showPage, updateHistCount, resetHistory } from './ui/history.js';
import { startExam, examNext, exitExam, isExamRunning } from './ui/exam.js';
import { initModals } from './ui/modals.js';

/* ---- controls & navigation ---- */
$('checkBtn').onclick=check;
$('solBtn').onclick=showSolution;
$('nextBtn').onclick=newQuestion;
$('navPractice').onclick=()=>showPage('practice');
$('navExam').onclick=()=>showPage('exam');
$('navHistory').onclick=()=>showPage('history');
$('resetBtn').onclick=resetHistory;
$('examStartBtn').onclick=startExam;
$('examNextBtn').onclick=examNext;
$('examExitBtn').onclick=exitExam;
$('examRetakeBtn').onclick=startExam;
$('examBackBtn').onclick=()=>showPage('practice');

initModals();

document.addEventListener('keydown',e=>{ if(e.key==='Escape'){
  if(isExamRunning()){exitExam();return;}
  $('rulesModal').style.display='none';$('ssaModal').style.display='none';
} });

/* ---- bootstrap ---- */
loadState();
updateHistCount();
selectLesson('all');
updateStats();
