/* ---------- shared helpers ---------- */
export const DEG = Math.PI/180;
export const R2 = Math.SQRT2;

export const $ = id=>document.getElementById(id);

export const ri = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
export const pick = a=>a[Math.floor(Math.random()*a.length)];
export const r1 = x=>Math.round(x*10)/10;
export const r2 = x=>Math.round(x*100)/100;
export const gcd = (a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
export function reduceFrac(n,d){const g=gcd(n,d);return [n/g,d/g];}

export function within(v,target,tol){return !isNaN(v)&&Math.abs(v-target)<=tol;}
export function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* random integer coordinate point (used by distance & midpoint generators) */
export function pt(n){n=n||3;const a=[];for(let i=0;i<n;i++)a.push(ri(-8,8));return a;}
