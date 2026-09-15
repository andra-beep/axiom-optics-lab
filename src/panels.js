/* ============================================================
   AXIOM | panels.js — grafik, solver, AI, riwayat (slide-over)
   ============================================================ */
import {$,fmt,clamp,store,sfx} from './core.js';
import {EXPS,CONCEPT} from './config.js';
import {S,P} from './state.js';
import {kaleidoN,curvedCalc,physDatar} from './physics.js';
import {curFrame} from './engine.js';

export function openPanel(tab){
 $('panel').classList.add('open');
 document.querySelectorAll('#pHead .tab').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 document.querySelectorAll('.pBody').forEach(b=>b.classList.remove('on'));
 $('pb-'+tab).classList.add('on');
 if(tab==='grafik')drawCharts();if(tab==='kalkulator')renderCalc();if(tab==='ai')$('aiIn').focus();
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
    <div class="stat"><small>DETEKTOR</small><b style="color:${ph.hitTarget?'var(--ok)':'var(--bad)'}">${ph.hitTarget?'HIT':'MISS'}</b></div>`;
  scatterChart($('ch1'),'θᵢ','θᵣ',90,0,90,x=>x,S.pts.DATAR);
  const F2=chartFrame($('ch2'));
  if(F2){const{c,W,H}=F2;c.clearRect(0,0,W,H);
   c.fillStyle='rgba(148,166,195,.6)';c.textAlign='center';c.font='10px JetBrains Mono';
   c.fillText('Lintasan foton: s meningkat linier 0 → 2L selama run',W/2,H/2)}}
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
 else{const convex=e==='CEMBUNG'||(e==='APLIKASI'&&S.preset==='spion');
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
 const e=S.exp;let rows=null;
 if(e==='DATAR'){if(!S.pts.DATAR.length)return toast('Belum ada data');
  rows=['theta_i;theta_r',...S.pts.DATAR.map(p=>`${fmt(p.x,1)};${fmt(p.y,1)}`)]}
 else if(e==='BAUR'){if(!S.pts.BAUR.length)return toast('Belum ada data');
  rows=['rough_pct;spread_deg',...S.pts.BAUR.map(p=>`${p.x};${fmt(p.y,1)}`)]}
 else if(e==='KALEIDO'){if(!S.pts.KALEIDO.length)return toast('Belum ada data');
  rows=['theta;n_bayangan',...S.pts.KALEIDO.map(p=>`${p.x};${p.y}`)]}
 else{if(!S.pts[e].length)return toast('Belum ada data (rekam tanpa noise)');
  rows=['s;1_over_s;1_over_sp;M',
   ...S.pts[e].map((pt,i)=>{const s=1/pt.x;
    return`${fmt(s,2)};${fmt(pt.x,4)};${fmt(pt.y,4)};${S.ptsM[e][i]?fmt(S.ptsM[e][i].y,3):''}`})]}
 dlCSV('axiom_'+e.toLowerCase()+'.csv',rows)}

/* ================= SOLVER ================= */
export function renderCalc(){
 const c=EXPS[S.exp].calc;
 $('calcDesc').textContent='Solver '+EXPS[S.exp].short+' — masukkan nilai yang diketahui, besaran turunan dihitung otomatis.';
 $('calcInputs').innerHTML=c.ins.map(i=>`
  <div class="calcIn"><label>${i.l}</label><input type="number" step="any" id="ci_${i.k}" value="${i.d}"></div>`).join('');
 $('calcForm').textContent='Σ  '+c.f;doCalc()}
export function doCalc(){
 const c=EXPS[S.exp].calc,inp={};
 c.ins.forEach(i=>inp[i.k]=+$('ci_'+i.k).value||0);
 $('calcOuts').innerHTML=c.run(inp,{preset:S.preset}).map(([l,v])=>
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
 else if(lq.includes('detektor')||lq.includes('hit')){
  a='Untuk mengenai detektor di φ: dari β = i − 2α = φ, maka <b>i = φ + 2α</b>. Contoh: φ=40°, α=0 → i=40°.'}
 else if(lq.includes('baur')||lq.includes('difus')||lq.includes('kertas')){
  a='Kertas memantulkan BAUR (difus): permukaannya kasar di skala mikroskopis sehingga tiap titik punya normal berbeda → sinar menyebar ke segala arah. Makanya kertas terlihat dari arah mana pun, tapi TIDAK bisa memantulkan gambar seperti cermin (teratur/specular).'}
 else if(lq.includes('kaleido')||lq.includes('dua cermin')){
  a='Dua cermin bersudut θ, benda di garis bagi: n = 360/θ − 1 (bila 360/θ genap). θ=60°→5 bayangan, θ=90°→3, θ=30°→11. Cermin sejajar (θ→0°) → tak terhingga.'}
 else if(lq.includes('hasil')||lq.includes('analisis')){
  a='Jalankan eksperimen (▶) lalu baca konsol "Analisis Otomatis". Di mode cermin lengkung, setiap rekaman menambah titik pada grafik 1/s vs 1/s′ — kumpulkan banyak titik untuk memverifikasi persamaan cermin!'}
 else if(lq.includes('noise')||lq.includes('error')||lq.includes('ketidakpastian')){
  a='Aktifkan "Noise pengukuran ±2%" di drawer 🎛 (eksperimen cermin lengkung/verifikasi). Setiap rekaman akan mengandung ketidakpastian seperti alat nyata — bandingkan nilai terukur vs teori dan hitung persen errornya.'}
 else if(lq.includes('apa')||lq.includes('jelaskan')||lq.includes('konsep')){
  a=CONCEPT[e]}
 else a=`Sedang memantau <b>${EXPS[e].short}</b>. ${CONCEPT[e].split('.')[0]}. Coba tanya: "rumus", "zona", "spion", "baur", "kaleido", atau "noise".`;
 return a+'<br><small>— mode demo · integrasi LLM asli menyusul</small>'}
export function aiSend(){
 const q=$('aiIn').value.trim();if(!q)return;
 aiBubble(q,true);$('aiIn').value='';sfx.click();
 setTimeout(()=>aiBubble(aiReply(q)),460)}
 $('aiChips').innerHTML=['Jelaskan konsepnya','Lima zona cekung','Kenapa kertas tidak seperti cermin?','Rumus penting']
 .map(c=>`<button onclick="$('aiIn').value='${c}';aiSend()">${c}</button>`).join('');

/* ================= RIWAYAT ================= */
export function addHist(sum,hit){
 S.hist.unshift({ts:new Date().toLocaleString('id-ID'),exp:EXPS[S.exp].short,
  par:EXPS[S.exp].params.map(pp=>`${pp.k}=${fmt(P()[pp.k],1)}${pp.u}`).join(' '),
  st:hit===true?'HIT':hit===false?'MISS':'OK',res:sum.slice(0,90)});
 if(S.hist.length>60)S.hist.pop();
 store.set('hist',S.hist);renderHist()}
function renderHist(){
 $('histBody').innerHTML=S.hist.length?S.hist.map(r=>
  `<tr><td>${r.ts}</td><td class="m">${r.exp}</td><td>${r.par}</td>
   <td class="${r.st==='HIT'?'hit':r.st==='MISS'?'miss':''}">${r.st}</td></tr>`).join('')
  :'<tr><td colspan="4" style="color:var(--dim)">Belum ada percobaan.</td></tr>'}
export function expHist(){if(!S.hist.length)return toast('Riwayat kosong');
 dlCSV('axiom_riwayat.csv',['waktu;eksperimen;parameter;status;hasil',
  ...S.hist.map(r=>`"${r.ts}";${r.exp};"${r.par}";${r.st};"${r.res}"`)])}
export function clrHist(){S.hist=[];store.set('hist',S.hist);renderHist();toast('Riwayat dihapus')}
renderHist();