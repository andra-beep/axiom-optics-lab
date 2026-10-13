/* ============================================================
   AXIOM | uilab.js — popover, drawer parameter, sinar istimewa
   ============================================================ */
import {$,fmt,clamp,sfx,store,toast,showOvl,RAD} from './core.js';
import {EXPS,EXPIDS,MODULES,LASERS,DEF} from './config.js';
import {S} from './state.js';
import {resetRun,updateHUD} from './engine.js';
import {renderCalc,renderAIHead,renderHist} from './panels.js';

export function togglePop(id){const el=$(id),was=el.classList.contains('show');
 document.querySelectorAll('.pop').forEach(p=>p.classList.remove('show'));
 if(!was)el.classList.add('show');sfx.click()}
document.addEventListener('click',e=>{
 if(!e.target.closest('.pop')&&!e.target.closest('#labTR'))
  document.querySelectorAll('.pop').forEach(p=>p.classList.remove('show'));
 if($('pDrawer').classList.contains('open')&&!e.target.closest('#pDrawer')&&!e.target.closest('#labTL')&&!e.target.closest('.ovl')&&!e.target.closest('#panel'))
  $('pDrawer').classList.remove('open')});
export function toggleDrawerLab(){$('pDrawer').classList.toggle('open')}

export function renderExpList(){
 $('expList').innerHTML=EXPIDS.map(id=>{const e=EXPS[id];
  return`<button class="mi ${id===S.exp?'on':''}" data-e="${id}">
   <span class="ic">${e.icon}</span><span><b>${e.name}</b>
   <small>eksperimen ${EXPIDS.indexOf(id)+1} dari ${EXPIDS.length}</small></span><span class="dot"></span></button>`}).join('');
 [...$('expList').children].forEach(b=>b.onclick=()=>{setExp(b.dataset.e);togglePop('pMode')});
 $('soonList').innerHTML=MODULES.slice(1).map(m=>`
  <button class="mi" onclick="toast('Modul ${m.name} sedang dibangun 🔒')">
  <span class="ic">${m.icon}</span><span><b>${m.name}</b><small>segera hadir</small></span></button>`).join('')}
export function renderLaserList(){
 $('laserList').innerHTML=LASERS.map(e=>`
  <button class="mi ${e.id===S.laser?'on':''}" data-e="${e.id}">
  <span class="ic" style="background:radial-gradient(circle at 35% 30%,${e.c1},${e.c2})"></span>
  <span><b>${e.label}</b><small>warna berkas & antarmuka</small></span><span class="dot"></span></button>`).join('');
 [...$('laserList').children].forEach(b=>b.onclick=()=>{
  S.laser=b.dataset.e;store.set('laser',S.laser);applyLaser();renderLaserList();togglePop('pLaser')})}
export function applyLaser(){const e=LASERS.find(x=>x.id===S.laser);
 document.documentElement.style.setProperty('--acc',e.c1);
 document.documentElement.style.setProperty('--acc2',e.c2)}
export function renderParams(){
 const ps=EXPS[S.exp].params;
 $('paramList').innerHTML=ps.map(p=>`
  <div class="prow"><label>${p.l} <b><span id="pv_${p.k}">${fmt(S.p[S.exp][p.k],p.step<1?1:0)}</span> ${p.u}</b></label>
  <input type="range" id="ps_${p.k}" min="${p.min}" max="${p.max}" step="${p.step}" value="${S.p[S.exp][p.k]}"></div>`).join('');
 ps.forEach(p=>{$('ps_'+p.k).oninput=e=>{
  S.p[S.exp][p.k]=+e.target.value;$('pv_'+p.k).textContent=fmt(e.target.value,p.step<1?1:0);
  resetRun(true);updateHUD()}});
 /* tombol 3 sinar istimewa — hanya bila eksperimen punya parameter sudut */
 if(ps.some(pp=>pp.k==='ang')){
  const d=document.createElement('div');d.className='prow';
  d.innerHTML=`<label style="margin-bottom:4px">SINAR ISTIMEWA</label>
   <div style="display:flex;flex-direction:column;gap:6px">
    <button class="mbtn" style="width:100%">∥ Sejajar sumbu utama</button>
    <button class="mbtn" style="width:100%">🎯 Melalui titik F</button>
    <button class="mbtn" style="width:100%">⭕ Melalui titik R (C)</button>
   </div>`;
  const bs=d.querySelectorAll('button');
  bs[0].onclick=()=>setRayAngle(0);
  bs[1].onclick=()=>setRayAngle('F');
  bs[2].onclick=()=>setRayAngle('C');
  $('paramList').appendChild(d)}}
export function setRayAngle(m){
 const p=S.p[S.exp];if(!p||p.ang===undefined)return;
 let v=0,label='sejajar sumbu utama';
 if(m==='F'){if(p.s<=p.R/2){toast('Butuh s > f agar sinar melalui F');return}
  v=Math.atan2(p.h,p.s-p.R/2)*RAD;label='melalui titik F'}
 if(m==='C'){if(p.s<=p.R){toast('Butuh s > R agar sinar melalui C');return}
  v=Math.atan2(p.h,p.s-p.R)*RAD;label='melalui titik R (C)'}
 p.ang=Math.round(clamp(v,0,85));
 resetRun(true);renderParams();updateHUD();
 toast('Sinar datang diatur '+label);sfx.param()}
export function renderOverlays(){
 $('ovlList').innerHTML='';
 EXPS[S.exp].overlays.forEach(([l,k])=>{
  const d=document.createElement('div');d.className='prow';
  d.innerHTML=`<label style="margin-bottom:4px">${l}</label>
   <button class="mbtn" style="width:100%;${S.o[k]?'color:var(--acc);border-color:color-mix(in srgb,var(--acc) 40%,transparent)':''}">${S.o[k]?'AKTIF':'NONAKTIF'}</button>`;
  d.querySelector('button').onclick=()=>{S.o[k]=!S.o[k];renderOverlays();sfx.click();updateHUD()};
  $('ovlList').appendChild(d)})}
export function renderPresets(){
 $('presetSec').style.display='none';
 $('tanSec').style.display='none'}
export function resetParams(){
 Object.assign(S.p[S.exp],JSON.parse(JSON.stringify(DEF[S.exp])));
 resetRun(true);renderParams();updateHUD();
 toast('Semua parameter dikembalikan ke nilai awal');sfx.param()}
export function setExp(id,silent){
 S.exp=id;resetRun(true);
 renderExpList();renderParams();renderOverlays();renderPresets();renderCalc();renderAIHead();renderHist();
 updateHUD();$('console').classList.remove('show');
 if(!silent){toast('Eksperimen: '+EXPS[id].name);sfx.param();
  if(!store.get('tut_'+id,false)){store.set('tut_'+id,true);setTimeout(showTutor,650)}}}
export function showTutor(){
 $('tutTitle').textContent='Tutorial — '+EXPS[S.exp].name;
 $('tutText').textContent=EXPS[S.exp].tutorial;
 showOvl('ovlTutor')}