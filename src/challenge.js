/* ============================================================
   AXIOM | challenge.js — mode tantangan (tebak posisi benda)
   ============================================================ */
import {$,fmt,clamp,sfx,showOvl,toast} from './core.js';
import {S} from './state.js';
import {curvedCalc} from './physics.js';
import {resetRun,updateHUD} from './engine.js';
import {renderParams} from './uilab.js';

export function startChallenge(){
 const ids=['CEKUNG','CEMBUNG','KUANTA','APLIKASI'];
 if(!ids.includes(S.exp)){toast('Mode tantangan tersedia untuk cermin lengkung');return}
 const convex=S.exp==='CEMBUNG'||(S.exp==='APLIKASI'&&S.preset==='spion');
 const R=+(2+Math.random()*8).toFixed(1);
 const f=R/2;
 let s_t;
 const zone=Math.random();
 if(convex)s_t=+(1+Math.random()*15).toFixed(1);
 else if(zone<.4)s_t=+(f*(0.3+Math.random()*.55)).toFixed(1);
 else if(zone<.7)s_t=+(f*1.2+Math.random()*f*.6).toFixed(1);
 else s_t=+(f*2.3+Math.random()*f*3).toFixed(1);
 s_t=Math.min(s_t,30);
 S.p[S.exp].R=R;
 let decoy=+(s_t>6?(s_t/2.6):(s_t*2.8+1)).toFixed(1);
 if(Math.abs(decoy-s_t)<.5)decoy=+(decoy+1.4).toFixed(1);
 S.p[S.exp].s=clamp(decoy,.5,30);
 S.tan={convex,R,s_t};
 resetRun(true);renderParams();updateHUD();
 const c0=curvedCalc({R,s:s_t,h:1},convex);
 $('tanDesc').innerHTML=`Cermin <b>${convex?'CEMBUNG':'CEKUNG'}</b> dengan R = <b>${fmt(R,1)} m</b> (f = ${fmt(f,2)} m).<br>Sifat bayangan yang diminta:<br>• ${c0.real?'NYATA (di depan cermin)':'MAYA (di belakang cermin)'}<br>• ${c0.tegak?'TEGAK':'TERBALIK'}<br>• Perbesaran |M| ≈ <b>${fmt(Math.abs(c0.M),2)}×</b>`;
 $('tanRes').style.display='none';$('tanHint').style.display='none';
 showOvl('ovlTan');
}

export function checkChallenge(){
 if(!S.tan)return;
 const d=Math.abs(S.p[S.exp].s-S.tan.s_t);
 const c0=curvedCalc({R:S.tan.R,s:S.tan.s_t,h:1},S.tan.convex);
 const cMe=curvedCalc({R:S.tan.R,s:S.p[S.exp].s,h:1},S.tan.convex);
 $('tanRes').style.display='block';$('tanHint').style.display='block';
 if(d<=.3){
  $('tanRes').style.color='var(--ok)';
  $('tanRes').textContent='✅ TEPAT! s = '+fmt(S.tan.s_t,1)+' m';
  $('tanHint').textContent='Perbesaran di posisi itu M = '+fmt(c0.M,3)+'. Sinar-sinar istimewa di meja kini persis membentuk bayangan tersebut.';
  sfx.good();
 }else{
  $('tanRes').style.color='var(--bad)';
  $('tanRes').textContent='❌ Belum tepat — jawabanmu s = '+fmt(S.p[S.exp].s,1)+' m (selisih '+fmt(d,2)+' m)';
  const big=Math.abs(cMe.M)>Math.abs(c0.M);
  const hintCore=Math.abs(Math.abs(cMe.M)-Math.abs(c0.M))<.08
   ?'ukuran bayanganmu hampir tepat — periksa lagi nyata/maya-nya!'
   :(big?'bayanganmu terlalu BESAR':'bayanganmu terlalu KECIL');
  $('tanHint').textContent=hintCore+' — '+(S.tan.convex
   ?'cermin cembung: makin dekat cermin → bayangan makin besar'
   :'cermin cekung: geser benda '+(big?'menjauhi':'mendekati')+' titik fokus F');
  sfx.param();
 }
}