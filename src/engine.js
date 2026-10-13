/* ============================================================
   AXIOM | engine.js — state operasional, loop 60fps, HUD, analisis
   ============================================================ */
import {$,fmt,clamp,FDT,DUR,store,sfx,toast} from './core.js';
import {EXPS} from './config.js';
import {S,P,noisy} from './state.js';
import {kaleidoN,curvedCalc,physDatar} from './physics.js';
import {drawScene,spawnBurst,trailPts,burst,positionConsole} from './scene.js';
import {addHist,drawCharts,renderDataTable,renderHist} from './panels.js';

const PRESET_NAMES={spion:'Spion (cembung)',reflektor:'Reflektor (cekung)',teleskop:'Teleskop (cekung)'};

export function playPause(){
 if(S.finished){startRun();return}
 S.running&&!S.paused?pauseRun():startRun();sfx.click()}
export function startRun(){
 if(S.running&&!S.paused)return;
 if(S.running&&S.paused){S.paused=false;$('btnPlay').textContent='⏸';return}
 resetRun(true);S.running=true;acc=0;
 $('btnPlay').textContent='⏸';$('scrub').disabled=false;sfx.start()}
export function pauseRun(){S.paused=true;$('btnPlay').textContent='▶'}
export function resetRun(silent){
 S.running=false;S.paused=false;S.finished=false;S.frame=0;trailPts.length=0;burst.length=0;
 S.data=[];$('scrub').value=0;$('scrub').max=0;$('scrub').disabled=true;
 $('btnPlay').textContent='▶';$('tTot').textContent=EXPS[S.exp].photon?'0.0':'100';
 $('console').classList.remove('show');updateHUD()}

export function analyzeExp(){
 const p=P(),e=S.exp;let txt='',mis='',hit=null;
 if(e==='DATAR'){
  const ph=physDatar(p);
  txt=`θᵢ = ${fmt(ph.th,1)}° = θᵣ ✓ Hukum Pemantulan terverifikasi (sudut diukur dari normal). Foton menempuh 2L = ${fmt(ph.path,1)} m dalam ${fmt(ph.tns,1)} ns. Satu baris data masuk Tabel Data (panel 🕓).`;
  if(ph.folded)mis='💡 i > 180° berarti laser berada di sisi belakang cermin — otomatis dilipat ke sisi depan agar tetap memantul.';
 }
 else if(e==='BAUR'){const sp=p.rough/100*60;
  txt=p.rough<5?
   `Kekasaran ~0% → pemantulan TERATUR (specular): seluruh berkas pantul menyatu pada satu arah θᵢ = θᵣ = ${fmt(p.i,0)}°. Permukaan ini bisa membentuk bayangan — perilaku cermin.`:
   `Kekasaran ${p.rough}% → berkas pantul menyebar ±${fmt(sp,0)}° (pemantulan ${p.rough>60?'BAUR kuat':'semi-baur'}). Setiap titik mikroskopis memantul dengan normal berbeda. Permukaan seperti ini (kertas, dinding) TERLIHAT dari segala arah tetapi tidak membentuk bayangan cermin.`;
  if(p.rough>0&&p.rough<40)mis='💡 Coba bandingkan ekstrem: rough 0% vs 100% — di mana berkas pantul masih terkonsentrasi?';}
 else if(e==='KALEIDO'){const n=kaleidoN(p.theta);
  txt=`θ = ${p.theta}° → 360/θ = ${fmt(360/p.theta,1)} → jumlah bayangan n = ${n}. Bayangan-bayangan terletak merata pada lingkaran berpusat di poros — inilah prinsip kaleidoskop.`;
  if(360/p.theta<=2.5)mis='💡 θ sangat kecil → n sangat besar. Cermin sejajar (θ→0) memberi bayangan tak terhingga: coba bayangkan koridor tak berujung!';}
 else{const convex=e==='CEMBUNG';
  const c=curvedCalc(p,convex);
  const preset=S.presetMap[e];
  const nm=preset&&PRESET_NAMES[preset]?PRESET_NAMES[preset]:EXPS[e].short;
  if(c.inf){txt=`${nm}: s = f = ${fmt(p.R/2,2)} m → s′ = ∞. Sinar-sinar pantul SEJAJAR — bayangan terbentuk di tak hingga.`;
   mis='💡 Perhatikan: sinar-sinar pantul sekarang PARALEL satu sama lain. Rumus memberi 1/s′ = 0 — inilah prinsip reflektor senter!';}
  else{const nm2=(c.real?'NYATA':'MAYA')+', '+(c.tegak?'TEGAK':'TERBALIK')+', '+c.size+' ('+fmt(Math.abs(c.M),2)+'×)';
   txt=`${nm}: s=${fmt(p.s,1)} m, f=${fmt(c.fAbs,2)} m → s′ = ${fmt(c.sPrime,2)} m (${c.real?'di depan':'di belakang'} cermin). M = −s′/s = ${fmt(c.M,3)}. Bayangan: ${nm2}. h′ = ${fmt(c.hp,2)} m.`;
   if(e==='CEMBUNG')mis='💡 Bukti umum: berapa pun s, cermin cembung TIDAK PERNAH menghasilkan bayangan nyata — perpanjangan sinar (putus-putus) selalu bertemu di belakang cermin.';
   if(e==='CEKUNG'&&p.s<p.R/2)mis='💡 s < f: sinar pantul DIVERGEN → perpotongan hanya ada pada perpanjangan (putus-putus) di belakang cermin → bayangan maya tegak diperbesar (kaca rias!).';
   if(S.o.noise)mis='💡 Mode noise aktif: titik yang kamu rekam mengandung ketidakpastian ±2% — seperti alat nyata. Hitung persen error terhadap teori!';}}
 return{txt,mis,hit}}

export function finishRun(){
 S.running=false;S.finished=true;$('btnPlay').textContent='↻';
 const r=analyzeExp();
 let row=null;
 const p=P(),R=S.rows[S.exp];if(R.length>60)R.shift();
 if(S.exp==='DATAR'){
  const ph=physDatar(p);
  sfx.finish();
  if(S.pts.DATAR.length>80)S.pts.DATAR.shift();
  S.pts.DATAR.push({x:ph.th,y:ph.th});
  row={n:R.length+1,i:ph.th,r:ph.th,be:ph.be,t:ph.tns};
 }
 else{
  sfx.finish();
  if(S.exp==='BAUR'){
   if(S.pts.BAUR.length>80)S.pts.BAUR.shift();
   S.pts.BAUR.push({x:p.rough,y:p.rough/100*60});
   row={n:R.length+1,rough:p.rough,sp:p.rough/100*60};
  }
  else if(S.exp==='KALEIDO'){
   if(S.pts.KALEIDO.length>80)S.pts.KALEIDO.shift();
   S.pts.KALEIDO.push({x:p.theta,y:kaleidoN(p.theta)});
   row={n:R.length+1,th:p.theta,nB:kaleidoN(p.theta)};
  }
  else{
   const convex=S.exp==='CEMBUNG';
   const c=curvedCalc(p,convex);
   if(!c.inf&&!S.o.noise){
    if(S.pts[S.exp].length>80)S.pts[S.exp].shift();
    S.pts[S.exp].push({x:1/p.s,y:1/c.sPrime});
    if(S.ptsM[S.exp].length>80)S.ptsM[S.exp].shift();
    S.ptsM[S.exp].push({x:p.s,y:c.M});
    row={n:R.length+1,s:p.s,sp:c.sPrime,M:c.M,
     sifat:(c.real?'nyata':'maya')+', '+(c.tegak?'tegak':'terbalik')+', '+c.size};
   }
   if(!c.inf&&S.o.noise){
    const spm=noisy(c.sPrime);
    if(S.pts[S.exp].length>80)S.pts[S.exp].shift();
    S.pts[S.exp].push({x:1/p.s,y:1/spm});
    const err=Math.abs((spm-c.sPrime)/c.sPrime*100);
    r.txt+=` [noise] s′ terukur = ${fmt(spm,2)} m → error ${fmt(err,1)}% terhadap teori.`;
    row={n:R.length+1,s:p.s,sp:spm,M:c.M,
     sifat:(c.real?'nyata':'maya')+', '+(c.tegak?'tegak':'terbalik')+', terukur'};
   }
   if(c.inf)toast('s = f → bayangan di tak hingga; titik data tak terdefinisi');
  }
 }
 if(row){R.push(row);store.set('rows_v2',S.rows)}
 store.set('pts',S.pts);store.set('ptsM',S.ptsM);
 setTimeout(positionConsole,140);
 const pEl=$('conTxt');pEl.textContent='';let j=0;
 const iv=setInterval(()=>{pEl.textContent=r.txt.slice(0,++j)+' ▌';
  if(j>=r.txt.length){clearInterval(iv);pEl.textContent=r.txt}},12);
 const misEl=$('conMis');
 if(r.mis){misEl.style.display='block';misEl.textContent=r.mis}else misEl.style.display='none';
 addHist();drawCharts();renderDataTable();renderHist();
 clearTimeout(window._conTO);
 window._conTO=setTimeout(()=>$('console').classList.remove('show'),12000)}
export function closeConsole(){
 clearTimeout(window._conTO);
 $('console').classList.remove('show');sfx.click()}
function physStep(){
 const u=clamp(S.data.length*FDT*S.speed/DUR,0,EXPS[S.exp].photon?2:1);
 S.data.push({u});
 S.frame=S.data.length-1;$('scrub').max=S.frame;$('scrub').value=S.frame;
 if(u>=(EXPS[S.exp].photon?2:1))finishRun()}
export function curFrame(){
 return S.data.length?S.data[clamp(S.frame,0,S.data.length-1)]:{u:0}}

export function updateHUD(){
 const e=S.exp,p=P();let cells='';
 cells+=`<div class="tchip g"><small>EKSPERIMEN</small><b style="color:var(--acc)">${EXPS[e].short}</b></div>`;
 if(e==='DATAR'){const f=curFrame(),ph=physDatar(p);
  const tShow=ph.tns*clamp(f.u||0,0,2)/2;
  cells+=`<div class="tchip g"><small>θᵢ = θᵣ</small><b style="color:var(--ok)">${fmt(ph.th,1)}°</b></div>
   <div class="tchip g"><small>ARAH PANTUL β</small><b style="color:var(--acc2)">${fmt(ph.be,1)}°</b></div>
   <div class="tchip g"><small>WAKTU</small><b style="color:var(--warn)">${fmt(tShow,1)} ns</b></div>`}
 else if(e==='BAUR'){const sp=p.rough/100*60;
  cells+=`<div class="tchip g"><small>θᵢ</small><b style="color:var(--ok)">${fmt(p.i,0)}°</b></div>
   <div class="tchip g"><small>KEKASARAN</small><b style="color:var(--acc2)">${p.rough}%</b></div>
   <div class="tchip g"><small>SEBARAN</small><b style="color:var(--warn)">±${fmt(sp,0)}°</b></div>
   <div class="tchip g"><small>JENIS</small><b style="color:${p.rough<10?'var(--ok)':'var(--warn)'}">${p.rough<10?'TERATUR':p.rough>60?'BAUR':'SEMI'}</b></div>`}
 else if(e==='KALEIDO'){const n=kaleidoN(p.theta);
  cells+=`<div class="tchip g"><small>SUDUT θ</small><b style="color:var(--ok)">${p.theta}°</b></div>
   <div class="tchip g"><small>360/θ</small><b style="color:var(--acc2)">${fmt(360/p.theta,1)}</b></div>
   <div class="tchip g"><small>BAYANGAN n</small><b style="color:var(--warn)">${n}</b></div>`}
 else{const convex=e==='CEMBUNG';
  const c=curvedCalc(p,convex);
  cells+=`<div class="tchip g"><small>f = R/2</small><b style="color:var(--ok)">${convex?'−':''}${fmt(p.R/2,2)} m</b></div>
   <div class="tchip g"><small>s BENDA</small><b style="color:var(--acc2)">${fmt(p.s,1)} m</b></div>`;
  if(c.inf)cells+=`<div class="tchip g"><small>s′</small><b style="color:var(--warn)">∞</b></div>
   <div class="tchip g"><small>SINAR PANTUL</small><b style="color:var(--warn)">SEJAJAR</b></div>`;
  else cells+=`<div class="tchip g"><small>s′ BAYANGAN</small><b style="color:var(--warn)">${fmt(c.sPrime,2)} m</b></div>
   <div class="tchip g"><small>M = −s′/s</small><b style="color:${c.tegak?'var(--ok)':'var(--bad)'}">${fmt(c.M,2)}×</b></div>`}
 $('tcol').innerHTML=cells;
 const f=curFrame(),maxU=EXPS[e].photon?2:1;
 $('tCur').textContent=EXPS[e].photon?fmt((f.u||0)/2*physDatar(p).tns,1):fmt((f.u||0)/maxU*100,0);
 $('tUnit').textContent=EXPS[e].photon?' ns':'%';
 $('ring').style.strokeDashoffset=176*(1-clamp((f.u||0)/maxU,0,1))}
export function stepFrame(){if(S.running&&!S.paused)pauseRun();
 if(!S.data.length){startRun();return}
 if(S.frame<S.data.length-1){S.frame++;$('scrub').value=S.frame;updateHUD()}sfx.click()}
 $('scrub').oninput=e=>{S.frame=+e.target.value;updateHUD()};
 $('selSpd').onchange=e=>{S.speed=+e.target.value;toast('Playback '+S.speed+'×')};
let lastT=performance.now(),acc=0;
export function loop(now){
 const dt=Math.min((now-lastT)/1000,.1);lastT=now;
 if($('lab').classList.contains('on')){
  if(S.running&&!S.paused){acc+=dt;let g=0;
   while(acc>=FDT&&g++<240&&S.running&&!S.finished){physStep();acc-=FDT}}
  updateHUD();drawScene(now)}
 requestAnimationFrame(loop)}