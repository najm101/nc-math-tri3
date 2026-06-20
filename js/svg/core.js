import { DEG } from '../core/helpers.js';

/* ---------- SVG diagram engine ---------- */
function norm(v){const m=Math.hypot(v[0],v[1])||1;return [v[0]/m,v[1]/m];}
function add(a,b){return [a[0]+b[0],a[1]+b[1]];}
function sub(a,b){return [a[0]-b[0],a[1]-b[1]];}
function mul(a,k){return [a[0]*k,a[1]*k];}
/* ── Shared text helper: emits label with paper-coloured halo so it's always ──
   readable over lines.  paint-order trick: stroke behind, fill on top.        */
function txt(x,y,str,o){
  o=o||{};
  const fs=o.fs||13, fw=o.fw||700, fill=o.fill||'#241C12';
  const anc=o.anc||'middle', base=o.base||'middle';
  const hs=o.hs||3.5; // halo stroke-width
  const attrs=`x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${fs}" font-weight="${fw}" `
    +`text-anchor="${anc}" dominant-baseline="${base}" font-family="Space Mono,monospace"`;
  // halo pass
  let r=`<text ${attrs} fill="none" stroke="#FBF6EA" stroke-width="${hs}" stroke-linejoin="round" `
    +`paint-order="stroke" style="pointer-events:none">${str}</text>`;
  // fill pass
  r+=`<text ${attrs} fill="${fill}" style="pointer-events:none">${str}</text>`;
  return r;
}

/* estimate pixel width of a string at a given font-size (monospace approximation) */
function strW(str,fs){ return String(str).length*(fs*0.62); }

/* ── Greedy label-placement engine ─────────────────────────────────────────────
   Usage: const LY = mkLayout();
          s += LY.place(cx, cy, label, txtOpts, dx, dy);
          LY.reserve(cx, cy, w, h);   // block a zone without emitting text

   Algorithm: tries a dense spiral of candidates (8 compass directions × 5 radii,
   sorted so the preferred push-direction is tried first), picks the first
   non-overlapping spot.  Falls back to the outermost ring if all collide.
──────────────────────────────────────────────────────────────────────────────── */
function mkLayout(){
  const placed=[];
  const GUTTER=4;

  function makeRect(cx,cy,str,fs){
    const w=strW(str,fs)+GUTTER*2, h=fs*1.3+GUTTER*2;
    return {x:cx-w/2, y:cy-h/2, w, h};
  }
  function overlaps(r){
    return placed.some(p=>
      r.x<p.x+p.w && r.x+r.w>p.x && r.y<p.y+p.h && r.y+r.h>p.y);
  }

  return {
    place(cx,cy,str,opts,dx,dy){
      const fs=(opts&&opts.fs)||13;
      dx=dx||0; dy=dy||0;
      const mag=Math.hypot(dx,dy)||26;
      const ux=dx/mag, uy=dy/mag;

      // 8 compass directions sorted by alignment with preferred push direction
      const dirs=[];
      for(let a=0;a<360;a+=45) dirs.push([Math.cos(a*DEG),Math.sin(a*DEG)]);
      dirs.sort((da,db)=>(db[0]*ux+db[1]*uy)-(da[0]*ux+da[1]*uy));

      // 7 radii: 56 primary candidates + 48 cardinal fallbacks
      const candidates=[];
      [1,1.4,1.9,2.5,3.2,4.0,5.0].forEach(scale=>
        dirs.forEach(([ex,ey])=>candidates.push([cx+ex*mag*scale, cy+ey*mag*scale])));
      [[1,0],[-1,0],[0,-1],[0,1],[1,-1],[-1,1],[1,1],[-1,-1]].forEach(([ex,ey])=>
        [24,36,50,66,84,104].forEach(r=>candidates.push([cx+ex*r, cy+ey*r])));

      let chosen=candidates[candidates.length-1];
      for(const cand of candidates){
        if(!overlaps(makeRect(cand[0],cand[1],str,fs))){ chosen=cand; break; }
      }
      placed.push(makeRect(chosen[0],chosen[1],str,fs));
      return txt(chosen[0],chosen[1],str,opts);
    },
    reserve(cx,cy,w,h){ placed.push({x:cx-w/2,y:cy-h/2,w,h}); }
  };
}

export { norm, add, sub, mul, txt, strW, mkLayout };
