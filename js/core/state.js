/* ---------- shared mutable state ----------
   Cross-module state lives on this single object so every module reads/writes the
   same live values (ES-module imports are read-only bindings, so primitives can't be
   shared by re-export). Module-private flags (q, answered, currentLesson, exam vars,
   historyShown) stay local to the module that owns them. */
export const state = {
  correct:0, attempted:0, streak:0, qcount:0,
  history:[], examHistory:[],
  active:new Set(),
};

/* ---------- persistence: browser localStorage, survives reloads & restarts ---------- */
export const STORE_KEY='tri3lab_v1';

export function saveState(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify({
    correct:state.correct, attempted:state.attempted, qcount:state.qcount,
    history:state.history, examHistory:state.examHistory })); }catch(e){}
}

export function loadState(){
  try{
    const raw=localStorage.getItem(STORE_KEY); if(!raw) return;
    const d=JSON.parse(raw)||{};
    state.correct=d.correct||0; state.attempted=d.attempted||0; state.qcount=d.qcount||0;
    state.history=Array.isArray(d.history)?d.history:[];
    state.examHistory=Array.isArray(d.examHistory)?d.examHistory:[];
  }catch(e){}
}
