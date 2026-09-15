/* ============================================================
   AXIOM | physics.js — fungsi fisika murni (tanpa UI)
   ============================================================ */
import {C} from './core.js';

export function kaleidoN(th){const m=360/th;
 if(Math.abs(m-Math.round(m))<1e-9){const mi=Math.round(m);return mi%2===0?mi-1:mi}
 return Math.floor(m)}

/* cermin lengkung: f bertanda (cekung +, cembung −); inf jika s = f */
export function curvedCalc(p,convex){
 const f=(convex?-1:1)*p.R/2,den=p.s-f;
 if(Math.abs(den)<.06)return{f,fAbs:p.R/2,inf:true};
 const sp=f*p.s/den,M=-sp/p.s,hp=M*p.h;
 let size='diperkecil';
 if(Math.abs(Math.abs(M)-1)<.03)size='sama besar';
 else if(Math.abs(M)>1)size='diperbesar';
 return{f,fAbs:p.R/2,inf:false,sPrime:sp,M,hp,
  real:sp>0,tegak:hp>0,size}}

export function physDatar(p){const th=Math.abs(p.i-p.al),be=p.i-2*p.al;
 return{th,be,path:2*p.L,tns:2*p.L/C*1e9,hitTarget:Math.abs(((be-p.phi+540)%360)-180)<3}}