/* ============================================================
   AXIOM | core.js — utilitas inti, penyimpanan, audio
   ============================================================ */
export const $=id=>document.getElementById(id);
export const fmt=(n,d=2)=>(+n).toFixed(d);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const DEG=Math.PI/180,RAD=180/Math.PI,C=299792458;
export const FDT=1/60,DUR=2.2;

/* penyimpanan anti-gagal (localStorage + fallback memori) */
const MEM={};
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return (k in MEM)?MEM[k]:null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){MEM[k]=v}}
export const store={get(k,d){const v=lsGet(k);if(v===null)return d;try{return JSON.parse(v)}catch(e){return d}},
             set(k,v){lsSet(k,JSON.stringify(v))}};

export function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2400)}
export function showOvl(id){$(id).classList.add('show')}
export function hideOvl(id){$(id).classList.remove('show')}
export function showKeys(){showOvl('ovlKeys')}
export function toggleFS(){const el=document.documentElement;
 try{if(document.fullscreenElement){const p=document.exitFullscreen();if(p&&p.catch)p.catch(()=>{})}
 else{const p=el.requestFullscreen();if(p&&p.catch)p.catch(()=>toast('Fullscreen diblokir browser'))}}
 catch(e){toast('Fullscreen tidak tersedia')}}

/* audio sintetis */
let AC=null;
export let sndOn=store.get('snd',true);
function beep(f,d=.12,type='sine',v=.13,delay=0){
 if(!sndOn)return;
 try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();
  const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);
  g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
export const sfx={click:()=>beep(720,.06,'triangle',.07),
 start:()=>{beep(440,.1,'sine',.11);beep(660,.13,'sine',.11,.09)},
 finish:()=>{beep(523,.13,'sine',.12);beep(659,.13,'sine',.12,.11);beep(784,.2,'sine',.12,.22)},
 hit:()=>{beep(880,.1,'sine',.13);beep(1175,.16,'sine',.13,.09)},
 good:()=>{beep(659,.12,'sine',.13);beep(988,.2,'sine',.13,.1)},
 param:()=>beep(960,.04,'square',.035)};
export function toggleSnd(){sndOn=!sndOn;store.set('snd',sndOn);
 $('btnSnd').textContent=sndOn?'🔊':'🔇';if(sndOn)sfx.click()}