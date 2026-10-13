/* ============================================================
   AXIOM | panels.js — grafik, solver, AI, data & riwayat
   ============================================================ */
import {$,fmt,clamp,store,sfx} from './core.js';
import {EXPS,EXPIDS,CONCEPT} from './config.js';
import {S,P} from './state.js';
import {kaleidoN,curvedCalc,physDatar} from './physics.js';
import {curFrame} from './engine.js';

if(!S.rows){S.rows=store.get('rows_v2',{})}
EXPIDS.forEach(k=>{if(!S.rows[k])S.rows[k]=[]});
/* arsip riwayat per eksperimen */
if(!S.histBy){S.histBy=store.get('histBy',{})}
EXPIDS.forEach(k=>{if(!S.histBy[k])S.histBy[k]=[]});

export function openPanel(tab){
 $('panel').classList.add('open');
 document.querySelectorAll('#pHead .tab').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 document.querySelectorAll('.pBody').forEach(b=>b.classList.remove('on'));
 $('pb-'+tab).classList.add('on');
 if(tab==='grafik')drawCharts();if(tab==='kalkulator')renderCalc();
 if(tab==='ai')$('aiIn').focus();if(tab==='riwayat'){renderDataTable();renderHist()}
 sfx.click()}
export function closePanel(){$('panel').classList.remove('open')}

/* ================= GRAFIK ================= */
function accCol(){return getComputedStyle(document.documentElement).getPropertyValue('--acc').trim()}
function chartFrame(cv){
 const dpr=devicePixelRatio||1,r=cv.getBoundingClientRect();if(!r.width)return null;
 cv.width=r.width*dpr;cv.height=r.height*dpr;
 const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
 return{c,W:r.width,H:r.height,L:42,R:14,T:12,B:24,acc:accCol()}}
function axes(c,W,H,L,R,T,B){
 c.strokeStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(L,T);c.lineTo(L,H-B);c.lineTo(W-R,H-B);c.stroke();
 c.font='8.5px JetBrains Mono';c.fillStyle='rgba(148,166,195,.7)'}
function scatterChart(cv,xl,yl,xmax,ymin,ymax,theory,pts){
 const F=chartFrame(cv);if(!F)return;const{c,W,H,L,R,T,B,acc}=F;
 c.clearRect(0,0,W,H);axes(c,W,H,L,R,T,B);
 const X=x=>L+clamp(x,0,xmax)/xmax*(W-L-R);
 const Y=y=>(H-B)-clamp((y-ymin)/(ymax-ymin||1),0,1)*(H-T-B);
 c.textAlign='right';
 for(let i=0;i<=4;i++){const y=T+i/4*(H-T-B);
  c.strokeStyle='rgba(255,255,255,.05)';c.beginPath();c.moveTo(L,y);c.lineTo(W-R,y);c.stroke();
  c.fillText(fmt(ymax*(1-i/4)+ymin*(i/4),Math.abs(ymax-ymin)<3?2:1),L-5,y+3)}
 c.textAlign='center';
 for(let i=0;i<=4;i++)c.fillText(fmt(xmax*i/4,1),L+i/4*(W-L-R),H-7);
 if(ymin<0){c.setLineDash([2,5]);c.strokeStyle='rgba(255,255,255,.18)';
  c.beginPath();c.moveTo(L,Y(0));c.lineTo(W-R,Y(0));c.stroke();c.setLineDash([])}
 if(theory){c.setLineDash([5,6]);c.strokeStyle='rgba(65,232,165,.55)';c.lineWidth=1.6;
  c.beginPath();let started=false;
  for(let i=0;i<=60;i++){const x=xmax*i/60,y=theory(x);
   if(y===null||isNaN(y)||y<ymin-(ymax-ymin)*2||y>ymax+(ymax-ymin)*2){started=false;continue}
   const px=X(x),py=Y(clamp(y,ymin,ymax));
   started?c.lineTo(px,py):c.moveTo(px,py);started=true}
  c.stroke();c.setLineDash([])}
 pts.forEach(pt=>{c.fillStyle=acc;c.shadowColor=acc;c.shadowBlur=6;
  c.beginPath();c.arc(X(pt.x),Y(pt.y),3.6,0,7);c.fill();c.shadowBlur=0});
 c.fillStyle='rgba(148,166,195,.9)';c.textAlign='left';c.font='9px JetBrains Mono';
 c.fillText(xl+' vs '+yl+' — '+pts.length+' data',L+6,T+4);
 if(!pts.length){c.fillStyle='rgba(148,166,195,.6)';c.textAlign='center';c.font='10px JetBrains Mono';
  c.fillText('Klik ▶ (Rekam Data) untuk menambah titik',W/2,H/2)}}
export function drawCharts(){
 const e=S.exp,p=P();
 if(e==='DATAR'){const ph=physDatar(p);
  $('gStats').innerHTML=
   `<div class="stat"><small>θᵢ = θᵣ</small><b style="color:var(--ok)">${fmt(ph.th,1)}°</b></div>
    <div class="stat"><small>β = i − 2α</small><b style="color:var(--warn)">${fmt(ph.be,1)}°</b></div>
    <div class="stat"><small>t = 2L/c</small><b style="color:var(--acc2)">${fmt(ph.tns,1)} ns</b></div>`;
  scatterChart($('ch1'),'θᵢ','θᵣ',90,0,90,x=>x,S.pts.DATAR);
  const F2=chartFrame($('ch2'));
  if(F2){const{c,W,H}=F2;c.clearRect(0,0,W,H);
   c.fillStyle='rgba(148,166,195,.6)';c.textAlign='center';c.font='10px JetBrains Mono';
   c.fillText('Tabel data lengkap tersedia di tab 🕓 LOG',W/2,H/2)}}
 else if(e==='BAUR'){
  $('gStats').innerHTML=
   `<div class="stat"><small>KEKASARAN</small><b style="color:var(--acc2)">${p.rough}%</b></div>
    <div class="stat"><small>SEBARAN</small><b style="color:var(--warn)">±${fmt(p.rough/100*60,0)}°</b></div>
    <div class="stat"><small>JENIS</small><b style="color:${p.rough<10?'var(--ok)':'var(--bad)'}">${p.rough<10?'TERATUR':'BAUR'}</b></div>`;
  scatterChart($('ch1'),'kekasaran %','sebaran °',100,0,70,x=>x*.6,S.pts.BAUR);
  const F2=chartFrame($('ch2'));
  if(F2){const{c,W,H}=F2;c.clearRect(0,0,W,H);
   c.fillStyle='rgba(148,166,195,.6)';c.textAlign='center';c.font='10px JetBrains Mono';
   c.fillText('Kurva sebaran tersaji pada grafik atas',W/2,H/2)}}
 else if(e==='KALEIDO'){
  const n=kaleidoN(p.theta);
  $('gStats').innerHTML=
   `<div class="stat"><small>θ</small><b style="color:var(--ok)">${p.theta}°</b></div>
    <div class="stat"><small>360/θ</small><b style="color:var(--acc2)">${fmt(360/p.theta,1)}</b></div>
    <div class="stat"><small>n BAYANGAN</small><b style="color:var(--warn)">${n}</b></div>`;
  scatterChart($('ch1'),'θ (°)','n',90,0,36,x=>{const m=360/x;
   return Math.abs(m-Math.round(m))<1e-9?(Math.round(m)%2===0?Math.round(m)-1:Math.round(m)):Math.floor(m)},S.pts.KALEIDO);
  const F2=chartFrame($('ch2'));
  if(F2){const{c,W,H}=F2;c.clearRect(0,0,W,H);
   c.fillStyle='rgba(148,166,195,.6)';c.textAlign='center';c.font='10px JetBrains Mono';
   c.fillText('Kurva teori n(θ) tampil pada grafik atas',W/2,H/2)}}
 else{const convex=e==='CEMBUNG';
  const cc=curvedCalc(p,convex);
  $('gStats').innerHTML=cc.inf?
   `<div class="stat"><small>f</small><b>${fmt(p.R/2,2)} m</b></div>
    <div class="stat"><small>s′</small><b style="color:var(--warn)">∞</b></div>
    <div class="stat"><small>SINAR PANTUL</small><b style="color:var(--warn)">SEJAJAR</b></div>`:
   `<div class="stat"><small>s′</small><b style="color:var(--warn)">${fmt(cc.sPrime,2)} m</b></div>
    <div class="stat"><small>M</small><b style="color:${cc.tegak?'var(--ok)':'var(--bad)'}">${fmt(cc.M,2)}×</b></div>
    <div class="stat"><small>BAYANGAN</small><b style="color:${cc.real?'var(--ok)':'var(--acc2)'}">${cc.real?'NYATA':'MAYA'}</b></div>`;
  const fT=convex?-p.R/2:p.R/2;
  const yb=Math.max(Math.abs(1/fT)*1.4,.4);
  scatterChart($('ch1'),'1/s','1/s′',2,yb*-1.2,yb*1.2,x=>1/fT-x,S.pts[e]);
  const F2=chartFrame($('ch2'));
  if(F2){const{c,W,H,L,R,T,B}=F2;c.clearRect(0,0,W,H);axes(c,W,H,L,R,T,B);
   const smax=30,Mlim=Math.max(Math.abs(cc.inf?5:cc.M)*2,5);
   const X=x=>L+clamp(x,.5,smax)/smax*(W-L-R);
   const Yc=m=>(H-B)-clamp(m,-Mlim,Mlim)/Mlim*(H-T-B);
   c.setLineDash([2,5]);c.strokeStyle='rgba(255,255,255,.18)';
   c.beginPath();c.moveTo(L,Yc(0));c.lineTo(W-R,Yc(0));c.stroke();c.setLineDash([]);
   const fs=convex?-p.R/2:p.R/2;
   c.strokeStyle='rgba(65,232,165,.55)';c.lineWidth=1.5;
   c.beginPath();let st=false;
   for(let x=.5;x<=smax;x+=.12){
    if(Math.abs(x-fs)<.25){st=false;continue}
    const m=-fs/(x-fs);
    if(Math.abs(m)>Mlim*1.5){st=false;continue}
    const px=X(x),py=Yc(m);
    st?c.lineTo(px,py):c.moveTo(px,py);st=true}
   c.stroke();
   c.fillStyle='#9D7BFF';
   S.ptsM[e].forEach(pt=>{c.beginPath();c.arc(X(pt.x),Yc(pt.y),3.4,0,7);c.fill()});
   if(!cc.inf){c.fillStyle=accCol();c.shadowColor=accCol();c.shadowBlur=6;
    c.beginPath();c.arc(X(p.s),Yc(cc.M),4.4,0,7);c.fill();c.shadowBlur=0}
   c.fillStyle='rgba(148,166,195,.9)';c.textAlign='left';c.font='9px JetBrains Mono';
   c.fillText('M vs s (asimtot di s = f) — '+S.ptsM[e].length+' data',L+6,T+4)}}}
function dlCSV(name,rows){const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));a.download=name;a.click();toast('Diunduh: '+name)}
export function expGraph(){
 const e=S.exp,R=S.rows[e]||[];let rows=null;
 if(e==='DATAR'){if(!R.length)return toast('Belum ada data');
  rows=['no;i_derajat;r_derajat;beta_derajat;t_ns',
   ...R.map(r=>`${r.n};${fmt(r.i,1)};${fmt(r.r,1)};${fmt(r.be,1)};${fmt(r.t,1)}`)]}
 else if(e==='BAUR'){if(!R.length)return toast('Belum ada data');
  rows=['no;kekasaran_pct;sebaran_derajat',
   ...R.map(r=>`${r.n};${r.rough};${fmt(r.sp,1)}`)]}
 else if(e==='KALEIDO'){if(!R.length)return toast('Belum ada data');
  rows=['no;theta_derajat;n_bayangan',
   ...R.map(r=>`${r.n};${r.th};${r.nB}`)]}
 else{if(!R.length)return toast('Belum ada data (rekam tanpa noise)');
  rows=['no;s_m;sp_m;M;sifat',
   ...R.map(r=>`${r.n};${fmt(r.s,1)};${fmt(r.sp,2)};${fmt(r.M,3)};${r.sifat}`)]}
 dlCSV('axiom_data_'+e.toLowerCase()+'.csv',rows)}

/* ================= TABEL DATA PERCOBAAN ================= */
const DATACOLS={
 DATAR:[['i (°)',r=>fmt(r.i,1)],['r (°)',r=>fmt(r.r,1)],['β (°)',r=>fmt(r.be,1)],['t (ns)',r=>fmt(r.t,1)]],
 BAUR:[['Kekasaran (%)',r=>r.rough],['Sebaran (°)',r=>'±'+fmt(r.sp,0)]],
 CEKUNG:[['s (m)',r=>fmt(r.s,1)],["s′ (m)",r=>fmt(r.sp,2)],['M',r=>fmt(r.M,3)],['Sifat Bayangan',r=>r.sifat]],
 CEMBUNG:[['s (m)',r=>fmt(r.s,1)],["s′ (m)",r=>fmt(r.sp,2)],['M',r=>fmt(r.M,3)],['Sifat Bayangan',r=>r.sifat]],
 KALEIDO:[['θ (°)',r=>r.th],['n bayangan',r=>r.nB]]};
export function renderDataTable(){
 const el=$('dtExp'),th=$('dtHead'),tb=$('dtBody');
 if(!el||!th||!tb)return;
 const e=S.exp,cols=DATACOLS[e]||[],R=S.rows[e]||[];
 el.textContent=EXPS[e].short;
 th.innerHTML='<tr><th>#</th>'+cols.map(c=>`<th>${c[0]}</th>`).join('')+'</tr>';
 tb.innerHTML=R.length?R.map((r,i)=>`<tr><td>${r.n||i+1}</td>${cols.map(c=>`<td>${c[1](r)}</td>`).join('')}</tr>`).join('')
  :`<tr><td colspan="${cols.length+1}" style="color:var(--dim)">Belum ada data — klik ▶ untuk merekam percobaan.</td></tr>`}
export function expData(){
 const e=S.exp,cols=DATACOLS[e]||[],R=S.rows[e]||[];
 if(!R.length)return toast('Tabel data kosong');
 dlCSV('axiom_tabel_'+e.toLowerCase()+'.csv',
  ['no;'+cols.map(c=>c[0]).join(';'),
   ...R.map(r=>`${r.n};${cols.map(c=>c[1](r)).join(';')}`)])}
export function clrData(){S.rows[S.exp]=[];store.set('rows_v2',S.rows);renderDataTable();toast('Tabel data '+S.exp+' dihapus')}

/* ================= SOLVER ================= */
export function renderCalc(){
 const c=EXPS[S.exp].calc;
 $('calcDesc').textContent='Solver '+EXPS[S.exp].short+' masukkan nilai yang diketahui, besaran turunan dihitung otomatis.';
 $('calcInputs').innerHTML=c.ins.map(i=>`
  <div class="calcIn"><label>${i.l}</label><input type="number" step="any" id="ci_${i.k}" value="${i.d}"></div>`).join('');
 $('calcForm').textContent='Σ  '+c.f;doCalc()}
export function doCalc(){
 const c=EXPS[S.exp].calc,inp={};
 c.ins.forEach(i=>inp[i.k]=+$('ci_'+i.k).value||0);
 $('calcOuts').innerHTML=c.run(inp,{preset:(S.presetMap&&S.presetMap[S.exp])||'default'}).map(([l,v])=>
  `<div class="resRow"><small>${l}</small><b>${v}</b></div>`).join('')}

/* ================= AI ================= */
export function renderAIHead(){
 $('aiCtx').innerHTML=`● MEMANTAU <b style="color:var(--acc)">${EXPS[S.exp].short}</b> — ${EXPS[S.exp].params.map(pp=>`${pp.k}=${fmt(P()[pp.k],1)}${pp.u}`).join(' · ')}`}
function aiBubble(html,me){$('aiMsgs').insertAdjacentHTML('beforeend',`<div class="bub ${me?'me':''}">${html}</div>`)}
function aiReply(q){
 const e=S.exp,lq=q.toLowerCase();let a;
 if(lq.includes('rumus')){
  a=`Rumus kunci <b>${EXPS[e].short}</b>:<br><span style="font-family:var(--fm);color:var(--ok)">${EXPS[e].calc.f}</span>`}
 else if(lq.includes('zona')||lq.includes('lima')||lq.includes('posisi')){
  a='Lima zona cermin cekung:<br>1. s < f → <b>maya, tegak, diperbesar</b><br>2. s = f → bayangan di <b>tak hingga</b><br>3. f < s < 2f → nyata, terbalik, diperbesar<br>4. s = 2f → nyata, terbalik, <b>sama besar</b><br>5. s > 2f → nyata, terbalik, diperkecil<br>Coba geser s melintasi batas-batas itu dan amati lompatan sifatnya!'}
 else if(lq.includes('spion')||lq.includes('cembung')){
  a='Cermin cembung selalu menghasilkan bayangan maya, tegak, diperkecil → pengemudi melihat lebih banyak area (bidang pandang luas). Konsekuensinya objek tampak lebih kecil & jauh — itulah kenapa tulisan "objects are closer than they appear" ada di spion!'}
 else if(lq.includes('reflektor')||lq.includes('senter')||lq.includes('sejajar')){
  a='Reflektor: letakkan sumber tepat di <b>F</b> cermin cekung → semua sinar pantul SEJAJAR. Kebalikannya juga benar: sinar sejajar (bintang jauh) berkumpul di F — itulah cara teleskop reflektor mengumpulkan cahaya.'}
 else if(lq.includes('baur')||lq.includes('difus')||lq.includes('kertas')){
  a='Kertas memantulkan BAUR (difus): permukaannya kasar di skala mikroskopis sehingga tiap titik punya normal berbeda → sinar menyebar ke segala arah. Makanya kertas terlihat dari arah mana pun, tapi TIDAK bisa memantulkan gambar seperti cermin (teratur/specular).'}
 else if(lq.includes('kaleido')||lq.includes('dua cermin')){
  a='Dua cermin bersudut θ, benda di garis bagi: n = 360/θ − 1 (bila 360/θ genap). θ=60°→5 bayangan, θ=90°→3, θ=30°→11. Cermin sejajar (θ→0°) → tak terhingga.'}
 else if(lq.includes('hasil')||lq.includes('analisis')){
  a='Jalankan eksperimen (▶) lalu baca konsol "Analisis Otomatis". Setiap rekaman masuk ke Tabel Data & Riwayat di tab 🕓 LOG — kumpulkan beberapa baris, lalu export CSV untuk laporanmu!'}
 else if(lq.includes('noise')||lq.includes('error')||lq.includes('ketidakpastian')){
  a='Aktifkan "Noise pengukuran ±2%" di drawer 🎛 (cermin lengkung). Setiap rekaman mengandung ketidakpastian seperti alat nyata — bandingkan nilai terukur vs teori dan hitung persen errornya.'}
 else if(lq.includes('apa')||lq.includes('jelaskan')||lq.includes('konsep')){
  a=CONCEPT[e]}
 else a=`Sedang memantau <b>${EXPS[e].short}</b>. ${CONCEPT[e].split('.')[0]}. Coba tanya: "rumus", "zona", "spion", "baur", atau "kaleido".`;
 return a+'<br><small>— mode demo · integrasi LLM asli menyusul</small>'}
export function aiSend(){
 const q=$('aiIn').value.trim();if(!q)return;
 aiBubble(q,true);$('aiIn').value='';sfx.click();
 setTimeout(()=>aiBubble(aiReply(q)),460)}
 $('aiChips').innerHTML=['Jelaskan konsepnya','Lima zona cekung','Kenapa kertas tidak seperti cermin?','Rumus penting']
 .map(c=>`<button onclick="$('aiIn').value='${c}';aiSend()">${c}</button>`).join('');

/* ================= RIWAYAT PER EKSPERIMEN ================= */
/* definisi kolom parameter & hasil deskriptif per eksperimen */
const HISTCOLS={
 DATAR:{params:[
   ['i (°)',(p)=>fmt(p.i,1)],
   ['r (°)',(p)=>fmt(physDatar(p).th,1)],
   ['α (°)',(p)=>fmt(p.al,1)],
   ['L (m)',(p)=>fmt(p.L,1)]],
  result:(p)=>{const ph=physDatar(p);
   return `Laser diposisikan membentuk sudut datang i = ${fmt(p.i,1)}° terhadap garis normal (cermin dengan kemiringan α = ${fmt(p.al,1)}°; nilai negatif berarti ke kiri normal, positif ke kanan). Setelah memantul, sudut pantul terukur r = ${fmt(ph.th,1)}° — sama besar dengan sudut datang, membuktikan Hukum Pemantulan Cahaya. Foton menempuh lintasan 2L = ${fmt(ph.path,1)} m dalam waktu ${fmt(ph.tns,1)} nanodetik (c = 3×10⁸ m/s).`}},
 BAUR:{params:[
   ['i (°)',(p)=>fmt(p.i,0)],
   ['Kekasaran (%)',(p)=>fmt(p.rough,0)]],
  result:(p)=>{const sp=p.rough/100*60;
   return `Pada kekasaran permukaan ${p.rough}%, berkas memantul dengan sebaran ±${fmt(sp,0)}° di sekitar arah specular (θᵢ = θᵣ = ${fmt(p.i,0)}°). Permukaan ini bersifat ${p.rough<10?'TERATUR (specular) — dapat membentuk bayangan seperti cermin':p.rough>60?'BAUR kuat (difus) — sinar menyebar ke segala arah, tidak membentuk bayangan':'semi-baur — sebagian sinar terkonsentrasi, sebagian menyebar'}.`}},
 CEKUNG:{params:[
   ['R (m)',(p)=>fmt(p.R,1)],
   ['s (m)',(p)=>fmt(p.s,1)],
   ['h (m)',(p)=>fmt(p.h,1)]],
  result:(p)=>{const c=curvedCalc(p,false);
   if(c.inf)return `Jarak benda s tepat sama dengan jarak fokus (s = f = ${fmt(p.R/2,2)} m) → semua sinar pantul SEJAJAR terhadap sumbu utama dan bayangan terbentuk di tak hingga (s′ = ∞). Inilah prinsip kerja reflektor senter dan lampu mobil.`;
   return `Cermin cekung dengan f = ${fmt(c.fAbs,2)} m: benda di s = ${fmt(p.s,1)} m membentuk bayangan pada s′ = ${fmt(c.sPrime,2)} m (${c.real?'di depan cermin — NYATA':'di belakang cermin — MAYA'}), ${c.tegak?'tegak':'terbalik'}, ${c.size} dengan perbesaran M = ${fmt(c.M,3)} dan tinggi bayangan h′ = ${fmt(c.hp,2)} m.`}},
 CEMBUNG:{params:[
   ['R (m)',(p)=>fmt(p.R,1)],
   ['s (m)',(p)=>fmt(p.s,1)],
   ['h (m)',(p)=>fmt(p.h,1)]],
  result:(p)=>{const c=curvedCalc(p,true);
   return `Cermin cembung (f = −${fmt(c.fAbs,2)} m): benda di s = ${fmt(p.s,1)} m selalu membentuk bayangan MAYA, TEGAK, dan DIPERKECIL pada s′ = ${fmt(c.sPrime,2)} m di belakang cermin, dengan M = ${fmt(c.M,3)} dan h′ = ${fmt(c.hp,2)} m — berlaku untuk posisi benda berapa pun.`}},
 KALEIDO:{params:[
   ['θ (°)',(p)=>p.theta],
   ['Jarak benda (%)',(p)=>p.dist],
   ['Ukuran benda',(p)=>p.hh]],
  result:(p)=>{const n=kaleidoN(p.theta);
   return `Dua cermin bersudut θ = ${p.theta}° menghasilkan n = ${n} bayangan (360/θ = ${fmt(360/p.theta,1)}). Bayangan-bayangan terletak merata pada lingkaran berpusat di poros — prinsip kerja kaleidoskop.`}}};
/* catat percobaan ke riwayat eksperimen aktif — snapshot parameter + hasil deskriptif penuh */
export function addHist(){
 const e=S.exp,hc=HISTCOLS[e];
 const snap={...P()};
 const res=hc&&hc.result?hc.result(snap):'';
 const R=S.histBy[e]||[];
 R.unshift({ts:new Date().toLocaleString('id-ID'),p:snap,res});
 if(R.length>60)R.pop();
 S.histBy[e]=R;store.set('histBy',S.histBy);renderHist()}
export function renderHist(){
 const el=$('hExp'),th=$('hHead'),tb=$('hBody');
 if(!el||!th||!tb)return;
 const cols=(HISTCOLS[S.exp]||{params:[]}).params;
 const R=S.histBy[S.exp]||[];
 el.textContent=EXPS[S.exp].short;
 th.innerHTML='<tr><th>WAKTU</th>'+cols.map(c=>`<th>${c[0]}</th>`).join('')+'<th>HASIL</th></tr>';
 tb.innerHTML=R.length?R.map(r=>
  `<tr><td>${r.ts}</td>${cols.map(c=>`<td>${c[1](r.p)}</td>`).join('')}
   <td style="max-width:280px;text-align:left;line-height:1.6">${r.res}</td></tr>`).join('')
  :'<tr><td colspan="99" style="color:var(--dim)">Belum ada riwayat untuk eksperimen ini.</td></tr>'}
export function expHist(){
 const e=S.exp,cols=(HISTCOLS[e]||{params:[]}).params,R=S.histBy[e]||[];
 if(!R.length)return toast('Riwayat kosong');
 dlCSV('axiom_riwayat_'+e.toLowerCase()+'.csv',
  ['waktu;'+cols.map(c=>c[0]).join(';')+';hasil',
   ...R.map(r=>`"${r.ts}";${cols.map(c=>c[1](r.p)).join(';')};"${r.res}"`)])}
export function clrHist(){S.histBy[S.exp]=[];store.set('histBy',S.histBy);renderHist();toast('Riwayat '+S.exp+' dihapus')}
renderHist();