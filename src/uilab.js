/* ============================================================
   AXIOM | uilab.js — popover, drawer parameter, daftar & preset
   ============================================================ */
import {$,fmt,sfx,store,toast,showOvl} from './core.js';
import {EXPS,EXPIDS,MODULES,LASERS} from './config.js';
import {S,P} from './state.js';
import {resetRun,updateHUD} from './engine.js';
import {renderCalc,renderAIHead} from './panels.js';

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
   <small>eksperimen ${EXPIDS.indexOf(id)+1} dari 7</small></span><span class="dot"></span></button>`}).join('');
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
  <div class="prow"><label>${p.l} <b><span id="pv_${p.k}">${fmt(P()[p.k],p.step<1?1:0)}</span> ${p.u}</b></label>
  <input type="range" id="ps_${p.k}" min="${p.min}" max="${p.max}" step="${p.step}" value="${P()[p.k]}"></div>`).join('');
 ps.forEach(p=>{$('ps_'+p.k).oninput=e=>{
  P()[p.k]=+e.target.value;$('pv_'+p.k).textContent=fmt(e.target.value,p.step<1?1:0);
  resetRun(true);updateHUD()}})}
export function renderOverlays(){
 $('ovlList').innerHTML='';
 EXPS[S.exp].overlays.forEach(([l,k])=>{
  const d=document.createElement('div');d.className='prow';
  d.innerHTML=`<label style="margin-bottom:4px">${l}</label>
   <button class="mbtn" style="width:100%;${S.o[k]?'color:var(--acc);border-color:color-mix(in srgb,var(--acc) 40%,transparent)':''}">${S.o[k]?'AKTIF':'NONAKTIF'}</button>`;
  d.querySelector('button').onclick=()=>{S.o[k]=!S.o[k];renderOverlays();sfx.click();updateHUD()};
  $('ovlList').appendChild(d)})}
export function renderPresets(){
 const show=S.exp==='APLIKASI';
 $('presetSec').style.display=show?'block':'none';
 const tanOk=['CEKUNG','CEMBUNG','KUANTA','APLIKASI'].includes(S.exp);
 $('tanSec').style.display=tanOk?'block':'none';
 if(!show)return;
 $('presetRow').innerHTML=[['spion','🚗 Spion'],['reflektor','🔦 Reflektor'],['teleskop','🔭 Teleskop']]
  .map(([k,l])=>`<button class="${S.preset===k?'on':''}" data-p="${k}">${l}</button>`).join('');
 [...$('presetRow').children].forEach(b=>b.onclick=()=>applyPreset(b.dataset.p))}
export function applyPreset(k){
 S.preset=k;renderPresets();
 if(k==='spion'){Object.assign(S.p.APLIKASI,{R:4,s:6,h:1.5});toast('Spion: cembung — bayangan maya diperkecil, bidang pandang luas')}
 if(k==='reflektor'){Object.assign(S.p.APLIKASI,{R:6,s:3,h:1});toast('Reflektor: sumber tepat di F → pantulan SEJAJAR')}
 if(k==='teleskop'){Object.assign(S.p.APLIKASI,{R:10,s:30,h:5});toast('Teleskop: benda sangat jauh → bayangan kecil dekat F')}
 resetRun(true);updateHUD();renderParams()}
export function setExp(id,silent){
 S.exp=id;resetRun(true);
 renderExpList();renderParams();renderOverlays();renderPresets();renderCalc();renderAIHead();
 updateHUD();$('console').classList.remove('show');
 if(!silent){toast('Eksperimen: '+EXPS[id].name);sfx.param()}}

export function showTutor(){
 $('tutTitle').textContent='Tutorial — '+EXPS[S.exp].name;
 $('tutText').textContent=EXPS[S.exp].tutorial;
 showOvl('ovlTutor')}