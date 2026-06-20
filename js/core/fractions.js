/* ---------- stacked (vertical) fraction renderer ---------- */

function _isTok(ch){ return ch!==undefined && /[0-9A-Za-z.π√°²³]/.test(ch); }
function _atomFwd(s,p){
  if(p>=s.length) return p;
  const ch=s[p];
  if(ch==='√'){ const e=_atomFwd(s,p+1); return e>p+1?e:p+1; }
  if(/[A-Za-z]/.test(ch)){
    let k=p; while(k<s.length && _isTok(s[k])) k++;
    if(s[k]==='('){ let d=0; for(;k<s.length;k++){ if(s[k]==='(')d++; else if(s[k]===')'){d--; if(d===0){k++;break;}} } }
    return k;
  }
  if(ch==='('){ let d=0,k=p; for(;k<s.length;k++){ if(s[k]==='(')d++; else if(s[k]===')'){d--; if(d===0){k++;break;}} } return d===0?k:p; }
  if(_isTok(ch)){ let k=p; while(k<s.length && _isTok(s[k])) k++; return k; }
  return p;
}
function _atomBwd(s,e){
  if(e<=0) return e;
  const j=e-1, ch=s[j];
  if(ch===')'){ let d=0,k=j; for(;k>=0;k--){ if(s[k]===')')d++; else if(s[k]==='('){d--; if(d===0)break;} } if(k<0) return e;
    let m=k-1; while(m>=0 && /[A-Za-z]/.test(s[m])) m--; return m+1; }
  if(_isTok(ch)){ let k=j; while(k>=0 && _isTok(s[k])) k--; return s[k]==='√'?k:k+1; }
  return e;
}
function _readNum(s,e){
  let start=_atomBwd(s,e);
  if(start===e) return -1;
  while(start-1>=0 && s[start-1]==='·'){ const ns=_atomBwd(s,start-1); if(ns===start-1) break; start=ns; }
  return start;
}
function _scanFrac(text){
  const out=[]; let last=0,i=0;
  while(i<text.length){
    if(text[i]==='/'){
      const ns=_readNum(text,i);
      let de=_atomFwd(text,i+1);
      while(de>i+1 && text[de-1]==='.' && !/[0-9]/.test(text[de]||'')) de--;
      if(ns!==-1 && de>i+1 && !/https?:$/.test(text.slice(0,i))){
        if(ns>last) out.push({t:'x',v:text.slice(last,ns)});
        out.push({t:'f',n:text.slice(ns,i),d:text.slice(i+1,de)});
        last=de; i=de; continue;
      }
    }
    i++;
  }
  if(last<text.length) out.push({t:'x',v:text.slice(last)});
  return out;
}
function _fracEl(n,d){
  const w=document.createElement('span'); w.className='vf';
  const a=document.createElement('span'); a.className='vf-n'; a.textContent=n;
  const b=document.createElement('span'); b.className='vf-d'; b.textContent=d;
  w.appendChild(a); w.appendChild(b); return w;
}
function renderFractions(root){
  if(!root) return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
  const nodes=[]; let n; while((n=walker.nextNode())){ if(n.nodeValue.indexOf('/')===-1) continue; if(n.parentElement && n.parentElement.closest('svg')) continue; nodes.push(n); }
  nodes.forEach(node=>{
    const parts=_scanFrac(node.nodeValue);
    if(parts.length===1 && parts[0].t==='x') return; // nothing to do
    const frag=document.createDocumentFragment();
    parts.forEach(p=> frag.appendChild(p.t==='x'?document.createTextNode(p.v):_fracEl(p.n,p.d)));
    node.parentNode.replaceChild(frag,node);
  });
}

export { renderFractions };
