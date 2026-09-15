/* ============================================================
   AXIOM | home.js — carousel tak berujung, bintang, drawer
   ============================================================ */
import {$,sfx,store,toast,showOvl} from './core.js';
import {MODULES} from './config.js';
import {S} from './state.js';
import {resetRun} from './engine.js';
import {fitScene} from './scene.js';

const N=MODULES.length,CL=3,TOT=N+2*CL;
let vIdx=CL,snapT=null;

export function buildCarousel(){
 let html='';
 for(let k=0;k<TOT;k++){
  const ri=((k-CL)%N+N)%N,m=MODULES[ri];
  html+=`<div class="mod ${k===CL?'active':''}" data-v="${k}" style="--pm:${m.pm};--p1:${m.p1};--p2:${m.p2}">
   <div class="planet"></div>
   <div class="mbody g">
    <div class="soonTag" style="display:${m.live?'none':'block'}">SOON</div>
    <div class="mtag">${m.tag}</div><h2>${m.name}</h2><p>${m.desc}</p>
    <div class="mtags">${m.chips.map(c=>`<i>${c}</i>`).join('')}</div>
    <button class="pplay" data-ri="${ri}">▶</button>
   </div></div>`;
 }
 $('carTrack').innerHTML=html;
 $('hpDots').innerHTML=MODULES.map((_,i)=>`<i class="${i===0?'on':''}"></i>`).join('');
 [...$('carTrack').children].forEach(el=>{
  el.onclick=()=>{const v=+el.dataset.v,ri=((v-CL)%N+N)%N;
   if(ri===((vIdx-CL)%N+N)%N)modEnter(ri);
   else{vIdx=nearestV(ri);applyCar();restartAuto()}};
  el.querySelector('.pplay').onclick=e=>{e.stopPropagation();modEnter(+el.querySelector('.pplay').dataset.ri)};
 });
 [...$('hpDots').children].forEach((d,i)=>d.onclick=()=>{vIdx=nearestV(i);applyCar();restartAuto()});
}
function nearestV(ri){let best=CL+ri,bd=Math.abs(best-vIdx);
 for(let k=0;k<TOT;k++){if(((k-CL)%N+N)%N!==ri)continue;
  const d=Math.abs(k-vIdx);if(d<bd){bd=d;best=k}}return best}
export function applyCar(){
 const cards=$('carTrack').children;if(!cards.length)return;
 const cw=cards[0].offsetWidth,gap=parseFloat(getComputedStyle($('carTrack')).columnGap)||22,step=cw+gap;
 $('carTrack').style.transform=`translateX(${-(vIdx-(TOT-1)/2)*step}px)`;
 [...cards].forEach(c=>c.classList.toggle('active',+c.dataset.v===vIdx));
 const cur=((vIdx-CL)%N+N)%N;
 [...$('hpDots').children].forEach((d,i)=>d.classList.toggle('on',i===cur));
}
function teleport(v){const tr=$('carTrack');tr.classList.add('notrans');
 vIdx=v;applyCar();void tr.offsetWidth;tr.classList.remove('notrans')}
export function moveMod(d){
 if(d>0&&vIdx>=CL+N-1)teleport(vIdx-N);
 if(d<0&&vIdx<=CL)teleport(vIdx+N);
 vIdx+=d;applyCar();
 clearTimeout(snapT);
 snapT=setTimeout(()=>{if(vIdx>CL+N-1)teleport(vIdx-N);else if(vIdx<CL)teleport(vIdx+N)},580);
}
export function restartAuto(){clearInterval(window._auto);
 window._auto=setInterval(()=>{if(!document.hidden&&$('home').classList.contains('on'))moveMod(1)},5200)}
export function modEnter(ri){const m=MODULES[ri];
 if(!m.live){toast('Modul '+m.name+' sedang dibangun 🔒');return}
 sfx.start();enterLab()}

document.addEventListener('keydown',e=>{
 if($('home').classList.contains('on')&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){
  if(e.key==='ArrowLeft')moveMod(-1);if(e.key==='ArrowRight')moveMod(1)}});
addEventListener('resize',applyCar);

/* bintang homepage */
const fx=$('hpStars'),fctx=fx.getContext('2d');let pts=[];
function fitFx(){fx.width=innerWidth;fx.height=innerHeight;
 pts=Array.from({length:90},()=>({x:Math.random()*fx.width,y:Math.random()*fx.height,
  r:Math.random()*1.5+.4,s:Math.random()*12+4,ph:Math.random()*7}))}
fitFx();addEventListener('resize',fitFx);
(function fxLoop(now){if($('home').classList.contains('on')){
 fctx.clearRect(0,0,fx.width,fx.height);const t=(now||0)/1000;
 pts.forEach(p=>{p.y-=p.s/60;if(p.y<-4)p.y=fx.height+4;
  fctx.fillStyle=`rgba(170,205,255,${.2+.3*Math.abs(Math.sin(t*.8+p.ph))})`;
  fctx.beginPath();fctx.arc(p.x,p.y,p.r,0,7);fctx.fill()})}
 requestAnimationFrame(fxLoop)})();

export function toggleDrawer(){$('drawer').classList.toggle('open')}
export function enterLab(){
 $('drawer').classList.remove('open');
 $('home').classList.remove('on');$('lab').classList.add('on');
 fitScene();resetRun(true);
 if(!S.welcomed){S.welcomed=true;store.set('welcomed',true);setTimeout(()=>showOvl('ovlWelcome'),400)}}
export function goHome(){sfx.click();$('lab').classList.remove('on');$('home').classList.add('on');resetRun(true)}